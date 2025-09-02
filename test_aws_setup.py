#!/usr/bin/env python3
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
    print("\n🛠️ Bedrock 서비스 접근 테스트...")
    
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
    print("\n🚀 LiteLLM Claude 호출 테스트...")
    
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
    print("🧪 AWS Bedrock + LiteLLM 연결 테스트 시작\n")
    
    # 1. 자격 증명 테스트
    if not test_aws_credentials():
        print("\n❌ 자격 증명 설정이 필요합니다. setup_aws_credentials.py를 참조하세요.")
        return
    
    # 2. Bedrock 접근 테스트  
    models = test_bedrock_access()
    if not models:
        print("\n❌ Bedrock 접근 권한이 필요합니다.")
        print("해결 방법:")
        print("1. IAM 사용자에게 bedrock:* 권한 추가")
        print("2. AWS 콘솔 → Bedrock → Model Access에서 모델 권한 요청")
        return
    
    # 3. LiteLLM 호출 테스트
    if test_litellm_call():
        print("\n🎉 모든 테스트 성공! LiteLLM + Claude 연결이 정상적으로 작동합니다.")
    else:
        print("\n⚠️ LiteLLM 호출 실패. 모델 접근 권한을 확인하세요.")
        print("AWS 콘솔 → Amazon Bedrock → Model Access에서 Anthropic Claude 모델 권한 요청")

if __name__ == "__main__":
    main()
