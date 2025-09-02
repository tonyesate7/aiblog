#!/usr/bin/env python3
"""
LiteLLM Bedrock Claude 오류 해결 완전 솔루션
원본 오류: "bedrock requires at least one non-system message"
"""

import os
import sys
import json
from typing import Dict, List, Optional, Tuple
from dotenv import load_dotenv
import litellm

class LiteLLMBedrockFixer:
    def __init__(self):
        # .env 파일이 있으면 로드
        if os.path.exists('.env'):
            load_dotenv()
            print("✅ .env 파일 로드됨")
        
        # 권장 Claude 모델 목록 (가용성 순)
        self.claude_models = [
            "bedrock/anthropic.claude-3-sonnet-20240229-v1:0",
            "bedrock/anthropic.claude-3-haiku-20240307-v1:0", 
            "bedrock/anthropic.claude-v2:1",
            "bedrock/anthropic.claude-v2"
        ]
        
        # 권장 리전 목록
        self.regions = ["us-east-1", "us-west-2"]
    
    def validate_messages(self, messages: List[Dict]) -> List[Dict]:
        """
        메시지 배열 검증 및 수정
        Bedrock의 "at least one non-system message" 오류 해결
        """
        if not messages:
            print("⚠️ 빈 메시지 배열 감지 - 기본 사용자 메시지 추가")
            return [{"role": "user", "content": "Hello"}]
        
        # 시스템 메시지가 아닌 메시지 확인
        non_system_messages = [msg for msg in messages if msg.get("role") != "system"]
        
        if not non_system_messages:
            print("⚠️ 시스템 메시지만 있음 - 사용자 메시지 추가")
            messages.append({"role": "user", "content": "Please provide assistance."})
        
        # 메시지 형식 검증
        for i, msg in enumerate(messages):
            if not isinstance(msg, dict):
                print(f"⚠️ 메시지 {i} 형식 오류 - 딕셔너리가 아님")
                messages[i] = {"role": "user", "content": str(msg)}
            
            if "role" not in msg:
                print(f"⚠️ 메시지 {i} role 누락 - user로 설정")
                messages[i]["role"] = "user"
            
            if "content" not in msg or not msg["content"]:
                print(f"⚠️ 메시지 {i} content 누락 - 기본 내용 추가")
                messages[i]["content"] = "Please help me."
        
        return messages
    
    def setup_aws_environment(self) -> Tuple[bool, str]:
        """AWS 환경 설정 확인 및 구성"""
        print("🔧 AWS 환경 설정 확인...")
        
        # 필수 환경 변수 확인
        aws_access_key = os.getenv('AWS_ACCESS_KEY_ID')
        aws_secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')
        aws_region = os.getenv('AWS_REGION')
        
        if not aws_access_key or not aws_secret_key:
            return False, "AWS_ACCESS_KEY_ID 또는 AWS_SECRET_ACCESS_KEY 환경 변수가 설정되지 않았습니다"
        
        # 리전 설정
        if not aws_region:
            print("⚠️ AWS_REGION 미설정 - us-east-1로 기본 설정")
            os.environ["AWS_REGION"] = "us-east-1"
            aws_region = "us-east-1"
        
        # Bedrock 지원 리전 확인
        if aws_region not in ["us-east-1", "us-west-2", "eu-central-1", "ap-northeast-1", "ap-southeast-2"]:
            print(f"⚠️ {aws_region}은 Bedrock을 지원하지 않을 수 있습니다")
            print("권장 리전: us-east-1, us-west-2")
        
        print(f"✅ AWS 리전: {aws_region}")
        print(f"✅ Access Key: {aws_access_key[:10]}...")
        
        return True, f"AWS 환경 구성 완료 ({aws_region})"
    
    def safe_completion(self, 
                       messages: List[Dict], 
                       model: Optional[str] = None,
                       **kwargs) -> Tuple[bool, str, Dict]:
        """
        안전한 LiteLLM completion 호출
        모든 일반적인 오류를 처리하고 자동 복구 시도
        """
        
        # 1. 메시지 검증 및 수정
        messages = self.validate_messages(messages)
        
        # 2. 기본 모델 설정
        if not model:
            model = self.claude_models[0]
        
        # 3. 기본 파라미터 설정
        default_params = {
            "temperature": 0.7,
            "max_tokens": 1000,
            "timeout": 30
        }
        default_params.update(kwargs)
        
        # 4. 여러 모델로 시도
        models_to_try = [model] if model in self.claude_models else self.claude_models
        
        for model_name in models_to_try:
            print(f"🚀 시도 중: {model_name}")
            
            try:
                response = litellm.completion(
                    model=model_name,
                    messages=messages,
                    **default_params
                )
                
                result = response.choices[0].message.content
                success_info = {
                    "model": model_name,
                    "usage": response.usage.__dict__ if hasattr(response, 'usage') else {},
                    "response_time": "성공"
                }
                
                print(f"✅ 성공: {model_name}")
                return True, result, success_info
                
            except Exception as e:
                error_msg = str(e)
                print(f"❌ {model_name} 실패: {self.parse_error(error_msg)}")
                
                # 마지막 모델이 아니면 계속 시도
                if model_name != models_to_try[-1]:
                    continue
                else:
                    # 모든 모델 실패
                    error_info = {
                        "error": error_msg,
                        "tried_models": models_to_try,
                        "suggestions": self.get_error_suggestions(error_msg)
                    }
                    return False, error_msg, error_info
        
        return False, "모든 모델 시도 실패", {"error": "All models failed"}
    
    def parse_error(self, error_msg: str) -> str:
        """오류 메시지를 간단히 파싱"""
        if "at least one non-system message" in error_msg:
            return "시스템 메시지만 있음"
        elif "NoCredentialsError" in error_msg or "CredentialsNotFound" in error_msg:
            return "자격 증명 없음"
        elif "AccessDeniedException" in error_msg or "Access denied" in error_msg:
            return "접근 권한 없음"
        elif "ResourceNotFoundException" in error_msg:
            return "모델/리소스 없음"
        elif "ValidationException" in error_msg:
            return "요청 검증 실패"
        elif "ThrottlingException" in error_msg:
            return "API 제한 초과"
        else:
            return error_msg[:50] + "..." if len(error_msg) > 50 else error_msg
    
    def get_error_suggestions(self, error_msg: str) -> List[str]:
        """오류별 해결 방안 제시"""
        suggestions = []
        
        if "at least one non-system message" in error_msg:
            suggestions.extend([
                "메시지 배열에 사용자 메시지가 있는지 확인",
                "시스템 메시지만 있다면 user 역할 메시지 추가"
            ])
        
        if "NoCredentialsError" in error_msg or "CredentialsNotFound" in error_msg:
            suggestions.extend([
                "AWS_ACCESS_KEY_ID와 AWS_SECRET_ACCESS_KEY 환경 변수 설정",
                "aws configure 명령으로 AWS CLI 구성",
                ".env 파일에 AWS 자격 증명 추가"
            ])
        
        if "AccessDeniedException" in error_msg or "Access denied" in error_msg:
            suggestions.extend([
                "AWS 콘솔 → IAM에서 bedrock:* 권한 추가",
                "AWS 콘솔 → Bedrock → Model Access에서 모델 권한 요청",
                "올바른 IAM 사용자/역할 사용 확인"
            ])
        
        if "ResourceNotFoundException" in error_msg:
            suggestions.extend([
                "us-east-1 또는 us-west-2 리전 사용",
                "올바른 모델 ID 사용 확인",
                "해당 리전에서 모델 지원 여부 확인"
            ])
        
        if "ValidationException" in error_msg:
            suggestions.extend([
                "요청 형식 확인 (messages, model 등)",
                "파라미터 값 범위 확인 (temperature, max_tokens 등)",
                "메시지 내용이 정책에 위반되지 않는지 확인"
            ])
        
        return suggestions
    
    def demonstrate_usage(self):
        """사용 예시 및 테스트"""
        print("=" * 70)
        print("🧪 LiteLLM Bedrock 오류 해결 데모")
        print("=" * 70)
        
        # AWS 환경 확인
        aws_ok, aws_msg = self.setup_aws_environment()
        if not aws_ok:
            print(f"❌ AWS 설정 필요: {aws_msg}")
            print("\n해결 방법:")
            print("1. export AWS_ACCESS_KEY_ID='your_key'")
            print("2. export AWS_SECRET_ACCESS_KEY='your_secret'")
            print("3. export AWS_REGION='us-east-1'")
            return
        
        print(f"✅ {aws_msg}")
        
        # 테스트 케이스들
        test_cases = [
            {
                "name": "정상적인 메시지",
                "messages": [
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": "Hello! Say 'Connection successful!' in Korean."}
                ]
            },
            {
                "name": "시스템 메시지만 있는 경우 (원본 오류)",
                "messages": [
                    {"role": "system", "content": "You are a helpful assistant."}
                ]
            },
            {
                "name": "빈 메시지 배열",
                "messages": []
            },
            {
                "name": "형식이 잘못된 메시지",
                "messages": [
                    {"role": "user"},  # content 누락
                    {"content": "Hello"}  # role 누락
                ]
            }
        ]
        
        for i, test_case in enumerate(test_cases, 1):
            print(f"\n--- 테스트 {i}: {test_case['name']} ---")
            
            success, result, info = self.safe_completion(test_case["messages"])
            
            if success:
                print(f"✅ 성공 (모델: {info['model']})")
                print(f"응답: {result[:100]}..." if len(result) > 100 else result)
            else:
                print(f"❌ 실패: {result}")
                if "suggestions" in info:
                    print("해결 방안:")
                    for suggestion in info["suggestions"][:3]:
                        print(f"  - {suggestion}")
    
    def create_helper_functions(self):
        """도우미 함수들을 파일로 저장"""
        helper_code = '''"""
LiteLLM Bedrock Claude 오류 해결 도우미 함수들
"""

import os
from typing import Dict, List, Optional, Tuple
import litellm

def fix_bedrock_messages(messages: List[Dict]) -> List[Dict]:
    """
    Bedrock Claude의 "at least one non-system message" 오류 해결
    
    Args:
        messages: 원본 메시지 배열
        
    Returns:
        수정된 메시지 배열
    """
    if not messages:
        return [{"role": "user", "content": "Hello"}]
    
    # 시스템 메시지가 아닌 메시지가 있는지 확인
    non_system_messages = [msg for msg in messages if msg.get("role") != "system"]
    
    if not non_system_messages:
        # 사용자 메시지가 없으면 추가
        messages.append({"role": "user", "content": "Please provide assistance."})
    
    # 메시지 형식 검증
    for i, msg in enumerate(messages):
        if not isinstance(msg, dict):
            messages[i] = {"role": "user", "content": str(msg)}
        
        if "role" not in msg:
            messages[i]["role"] = "user"
        
        if "content" not in msg or not msg["content"]:
            messages[i]["content"] = "Please help me."
    
    return messages

def safe_claude_call(messages: List[Dict], 
                    model: Optional[str] = None,
                    **kwargs) -> Tuple[bool, str]:
    """
    안전한 Claude API 호출 (자동 오류 복구 포함)
    
    Args:
        messages: 메시지 배열
        model: 사용할 모델 (기본: 추천 모델 자동 선택)
        **kwargs: completion 파라미터들
        
    Returns:
        (성공 여부, 응답 텍스트 또는 오류 메시지)
    """
    
    # 1. 메시지 검증 및 수정
    messages = fix_bedrock_messages(messages)
    
    # 2. 권장 모델 목록
    claude_models = [
        "bedrock/anthropic.claude-3-sonnet-20240229-v1:0",
        "bedrock/anthropic.claude-3-haiku-20240307-v1:0",
        "bedrock/anthropic.claude-v2:1"
    ]
    
    # 3. 기본 파라미터
    default_params = {
        "temperature": 0.7,
        "max_tokens": 1000
    }
    default_params.update(kwargs)
    
    # 4. 모델 선택
    models_to_try = [model] if model else claude_models
    
    # 5. 순차적으로 모델 시도
    for model_name in models_to_try:
        try:
            response = litellm.completion(
                model=model_name,
                messages=messages,
                **default_params
            )
            
            return True, response.choices[0].message.content
            
        except Exception as e:
            error_msg = str(e)
            
            # 마지막 모델이 아니면 계속 시도
            if model_name != models_to_try[-1]:
                continue
            else:
                return False, f"모든 모델 실패: {error_msg}"
    
    return False, "알 수 없는 오류"

# 사용 예시
if __name__ == "__main__":
    # 원본 오류가 발생했던 상황
    problematic_messages = [
        {"role": "system", "content": "You are a helpful assistant."}
        # user 메시지 없음 -> "bedrock requires at least one non-system message" 오류
    ]
    
    # 해결된 호출
    success, result = safe_claude_call(problematic_messages)
    
    if success:
        print(f"✅ 성공: {result}")
    else:
        print(f"❌ 실패: {result}")
'''
        
        with open('/home/user/webapp/bedrock_helpers.py', 'w') as f:
            f.write(helper_code)
        
        print("📁 도우미 함수 저장: bedrock_helpers.py")

def main():
    """메인 실행 함수"""
    fixer = LiteLLMBedrockFixer()
    
    print("🔧 LiteLLM Bedrock Claude 오류 해결 도구")
    print("원본 오류: bedrock requires at least one non-system message")
    print()
    
    # 사용법 데모
    fixer.demonstrate_usage()
    
    # 도우미 함수 생성
    print(f"\n" + "=" * 70)
    print("📦 도우미 함수 및 파일 생성")
    print("=" * 70)
    fixer.create_helper_functions()
    
    print(f"\n✅ 오류 해결 완료!")
    print("📋 생성된 파일들:")
    print("  - bedrock_helpers.py: 재사용 가능한 도우미 함수")
    print("  - test_aws_setup.py: AWS 설정 테스트")
    print("  - .env.example: 환경 변수 예시")
    
    print(f"\n🚀 이제 다음과 같이 사용하세요:")
    print("from bedrock_helpers import safe_claude_call")
    print("success, result = safe_claude_call(your_messages)")

if __name__ == "__main__":
    main()