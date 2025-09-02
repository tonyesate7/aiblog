#!/usr/bin/env python3
"""
AWS 자격 증명 설정 가이드 및 Bedrock 문제 진단 도구
"""

import os
import sys
import subprocess
import json
from typing import Dict, List

class AWSSetupGuide:
    def __init__(self):
        self.regions = ['us-east-1', 'us-west-2', 'eu-central-1', 'ap-northeast-1']
    
    def print_header(self, title: str):
        print("\n" + "=" * 70)
        print(f"🔧 {title}")
        print("=" * 70)
    
    def check_current_status(self):
        """현재 AWS 설정 상태 확인"""
        self.print_header("현재 AWS 설정 상태 확인")
        
        # 환경 변수 확인
        print("📋 환경 변수 상태:")
        aws_vars = [
            'AWS_ACCESS_KEY_ID',
            'AWS_SECRET_ACCESS_KEY', 
            'AWS_REGION',
            'AWS_SESSION_TOKEN',
            'AWS_PROFILE'
        ]
        
        for var in aws_vars:
            value = os.getenv(var)
            if value:
                if 'KEY' in var or 'TOKEN' in var:
                    display_value = f"{'*' * 20} (설정됨)"
                else:
                    display_value = value
                print(f"  ✅ {var}: {display_value}")
            else:
                print(f"  ❌ {var}: 설정되지 않음")
        
        # AWS CLI 구성 확인
        print(f"\n📋 AWS CLI 구성:")
        try:
            result = subprocess.run(['aws', 'configure', 'list'], 
                                  capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                print("  ✅ AWS CLI 구성 존재:")
                print("     " + "\n     ".join(result.stdout.strip().split('\n')))
            else:
                print("  ❌ AWS CLI 구성 없음")
        except (subprocess.TimeoutExpired, FileNotFoundError):
            print("  ❌ AWS CLI 실행 불가")
    
    def provide_setup_instructions(self):
        """AWS 자격 증명 설정 방법 제공"""
        self.print_header("AWS 자격 증명 설정 방법")
        
        print("🚀 방법 1: 환경 변수 설정 (권장)")
        print("다음 명령어들을 터미널에서 실행하세요:")
        print()
        print("export AWS_ACCESS_KEY_ID='YOUR_ACCESS_KEY_HERE'")
        print("export AWS_SECRET_ACCESS_KEY='YOUR_SECRET_KEY_HERE'")
        print("export AWS_REGION='us-east-1'  # Bedrock 지원 리전")
        print()
        
        print("🚀 방법 2: AWS CLI 구성")
        print("aws configure")
        print("# 프롬프트에 따라 Access Key, Secret Key, Region 입력")
        print()
        
        print("🚀 방법 3: .env 파일 생성")
        env_content = """AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1"""
        
        with open('/home/user/webapp/.env.example', 'w') as f:
            f.write(env_content)
        
        print("📁 .env.example 파일을 생성했습니다.")
        print("이 파일을 .env로 복사하고 실제 값으로 수정하세요:")
        print("cp .env.example .env")
        print("nano .env  # 또는 다른 에디터로 편집")
        print()
        
        print("🔐 AWS 자격 증명을 얻는 방법:")
        print("1. AWS 콘솔 로그인 → IAM → Users → [사용자] → Security credentials")
        print("2. 'Create access key' 클릭 → 'Command Line Interface (CLI)' 선택")
        print("3. Access Key ID와 Secret Access Key 복사")
        print("4. 다음 권한이 필요합니다:")
        print("   - bedrock:*")
        print("   - bedrock:ListFoundationModels")
        print("   - bedrock:GetFoundationModel")
        print("   - bedrock:InvokeModel")
    
    def test_connection_with_demo_credentials(self):
        """데모 자격 증명으로 연결 테스트 (실패 예상, 오류 패턴 분석용)"""
        self.print_header("연결 테스트 및 일반적인 오류 패턴 분석")
        
        print("🧪 일반적인 AWS Bedrock 오류 패턴들:")
        
        error_patterns = [
            {
                "error": "NoCredentialsError / CredentialsNotFound",
                "cause": "AWS 자격 증명이 설정되지 않음",
                "solution": "위의 설정 방법 중 하나를 사용하여 자격 증명 구성"
            },
            {
                "error": "InvalidSignatureException",
                "cause": "잘못된 Access Key 또는 Secret Key",
                "solution": "올바른 자격 증명으로 다시 설정"
            },
            {
                "error": "AccessDeniedException",
                "cause": "Bedrock 서비스 접근 권한 없음",
                "solution": "IAM 정책에서 bedrock:* 권한 추가"
            },
            {
                "error": "ResourceNotFoundException", 
                "cause": "해당 리전에서 모델 지원하지 않음",
                "solution": "us-east-1 또는 us-west-2 리전 사용"
            },
            {
                "error": "ValidationException: Access denied",
                "cause": "모델 접근 권한 요청하지 않음",
                "solution": "AWS 콘솔 → Bedrock → Model Access에서 권한 요청"
            },
            {
                "error": "ThrottlingException",
                "cause": "API 호출 제한 초과", 
                "solution": "잠시 후 재시도 또는 요청 빈도 줄이기"
            }
        ]
        
        for i, pattern in enumerate(error_patterns, 1):
            print(f"\n{i}. 🚨 {pattern['error']}")
            print(f"   원인: {pattern['cause']}")
            print(f"   해결: {pattern['solution']}")
    
    def check_bedrock_regions(self):
        """Bedrock 지원 리전 정보"""
        self.print_header("AWS Bedrock 지원 리전 및 Claude 모델 정보")
        
        region_info = {
            'us-east-1': {
                'name': 'US East (N. Virginia)',
                'claude_models': ['v2', 'v2.1', '3-haiku', '3-sonnet', '3-opus'],
                'recommended': True,
                'note': '가장 많은 모델 지원, 최신 모델 우선 제공'
            },
            'us-west-2': {
                'name': 'US West (Oregon)', 
                'claude_models': ['v2', 'v2.1', '3-haiku', '3-sonnet', '3-opus'],
                'recommended': True,
                'note': '두 번째로 많은 모델 지원'
            },
            'eu-central-1': {
                'name': 'Europe (Frankfurt)',
                'claude_models': ['v2', 'v2.1', '3-haiku', '3-sonnet'],
                'recommended': False,
                'note': '유럽 지역, Opus 모델 미지원'
            },
            'ap-northeast-1': {
                'name': 'Asia Pacific (Tokyo)',
                'claude_models': ['v2', 'v2.1', '3-haiku', '3-sonnet'],
                'recommended': False,
                'note': '아시아 지역, Opus 모델 미지원'
            }
        }
        
        for region, info in region_info.items():
            status = "🟢 권장" if info['recommended'] else "🟡 지원"
            print(f"\n{status} {region} - {info['name']}")
            print(f"   지원 모델: {', '.join(info['claude_models'])}")
            print(f"   비고: {info['note']}")
        
        print(f"\n💡 권장사항:")
        print(f"- 첫 번째 선택: us-east-1 (가장 안정적)")
        print(f"- 두 번째 선택: us-west-2 (백업 리전)")
        print(f"- 지연 시간이 중요하면: 가까운 지역 선택")
    
    def create_test_script(self):
        """테스트 스크립트 생성"""
        self.print_header("자격 증명 설정 후 테스트 스크립트 생성")
        
        test_script = '''#!/usr/bin/env python3
"""
AWS 자격 증명 설정 후 실행할 테스트 스크립트
"""

import os
import boto3
import litellm
from dotenv import load_dotenv

def test_aws_credentials():
    """AWS 자격 증명 테스트"""
    print("🔐 AWS 자격 증명 테스트...")
    
    # .env 파일이 있으면 로드
    if os.path.exists('.env'):
        load_dotenv()
        print("✅ .env 파일 로드됨")
    
    try:
        session = boto3.Session()
        credentials = session.get_credentials()
        
        if credentials:
            print(f"✅ 자격 증명 확인: {credentials.access_key[:10]}...")
            return True
        else:
            print("❌ 자격 증명을 찾을 수 없습니다")
            return False
    except Exception as e:
        print(f"❌ 자격 증명 오류: {e}")
        return False

def test_bedrock_access():
    """Bedrock 접근 테스트"""
    print("\\n🛠️ Bedrock 서비스 접근 테스트...")
    
    region = os.getenv('AWS_REGION', 'us-east-1')
    
    try:
        bedrock = boto3.client('bedrock', region_name=region)
        
        # 모델 목록 가져오기
        response = bedrock.list_foundation_models()
        claude_models = [m for m in response['modelSummaries'] 
                        if 'claude' in m['modelName'].lower()]
        
        print(f"✅ Bedrock 접근 성공 ({region})")
        print(f"✅ Claude 모델 {len(claude_models)}개 발견")
        
        for model in claude_models[:3]:  # 처음 3개만 표시
            print(f"   - {model['modelId']}")
        
        return claude_models
        
    except Exception as e:
        print(f"❌ Bedrock 접근 실패: {e}")
        return []

def test_litellm_call():
    """LiteLLM 호출 테스트"""
    print("\\n🚀 LiteLLM Claude 호출 테스트...")
    
    # 권장 모델 순서
    models = [
        "bedrock/anthropic.claude-3-sonnet-20240229-v1:0",
        "bedrock/anthropic.claude-3-haiku-20240307-v1:0",
        "bedrock/anthropic.claude-v2:1"
    ]
    
    messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello! Please respond with 'Connection successful!' in Korean."}
    ]
    
    for model in models:
        try:
            print(f"  시도 중: {model}")
            
            response = litellm.completion(
                model=model,
                messages=messages,
                max_tokens=50,
                temperature=0.1
            )
            
            result = response.choices[0].message.content.strip()
            print(f"  ✅ 성공: {result}")
            return True
            
        except Exception as e:
            error_msg = str(e)
            if "Access denied" in error_msg:
                print(f"  🔒 권한 필요: 모델 접근 권한을 AWS 콘솔에서 요청하세요")
            elif "ResourceNotFound" in error_msg:
                print(f"  ❌ 모델 없음: 이 리전에서 지원하지 않는 모델")
            else:
                print(f"  ❌ 실패: {error_msg[:100]}...")
    
    print("  ❌ 모든 모델 호출 실패")
    return False

def main():
    """메인 테스트 실행"""
    print("🧪 AWS Bedrock + LiteLLM 연결 테스트 시작\\n")
    
    # 1. 자격 증명 테스트
    if not test_aws_credentials():
        print("\\n❌ 자격 증명 설정이 필요합니다. setup_aws_credentials.py를 참조하세요.")
        return
    
    # 2. Bedrock 접근 테스트  
    models = test_bedrock_access()
    if not models:
        print("\\n❌ Bedrock 접근 권한이 필요합니다.")
        print("해결 방법:")
        print("1. IAM 사용자에게 bedrock:* 권한 추가")
        print("2. AWS 콘솔 → Bedrock → Model Access에서 모델 권한 요청")
        return
    
    # 3. LiteLLM 호출 테스트
    if test_litellm_call():
        print("\\n🎉 모든 테스트 성공! LiteLLM + Claude 연결이 정상적으로 작동합니다.")
    else:
        print("\\n⚠️ LiteLLM 호출 실패. 모델 접근 권한을 확인하세요.")
        print("AWS 콘솔 → Amazon Bedrock → Model Access에서 Anthropic Claude 모델 권한 요청")

if __name__ == "__main__":
    main()
'''
        
        with open('/home/user/webapp/test_aws_setup.py', 'w') as f:
            f.write(test_script)
        
        print("📁 테스트 스크립트 생성: test_aws_setup.py")
        print("\n사용법:")
        print("1. AWS 자격 증명 설정 완료 후")
        print("2. python test_aws_setup.py 실행")
        print("3. 결과에 따라 추가 설정 진행")
    
    def run_guide(self):
        """전체 가이드 실행"""
        print("🚀 AWS Bedrock + LiteLLM 설정 완전 가이드")
        
        self.check_current_status()
        self.provide_setup_instructions()
        self.check_bedrock_regions()
        self.test_connection_with_demo_credentials()
        self.create_test_script()
        
        print("\n" + "=" * 70)
        print("✅ 설정 가이드 완료!")
        print("=" * 70)
        print("\n📋 다음 단계:")
        print("1. 위의 방법 중 하나로 AWS 자격 증명 설정")
        print("2. python test_aws_setup.py 실행하여 연결 테스트")
        print("3. 문제 발생 시 위의 오류 패턴 참조")
        print("4. 모델 접근 권한은 AWS 콘솔에서 별도 요청 필요")

if __name__ == "__main__":
    guide = AWSSetupGuide()
    guide.run_guide()