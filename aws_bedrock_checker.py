#!/usr/bin/env python3
"""
AWS Bedrock Claude 모델 가용성 및 접근 권한 종합 확인 스크립트
"""

import os
import boto3
import json
import sys
from botocore.exceptions import NoCredentialsError, ClientError, ProfileNotFound
from typing import Dict, List, Tuple

class BedrockChecker:
    def __init__(self):
        self.regions_to_check = [
            'us-east-1',      # 가장 많은 모델 지원
            'us-west-2',      # 두 번째로 많은 모델 지원
            'eu-central-1',   # 유럽
            'ap-northeast-1', # 아시아 (도쿄)
            'ap-southeast-2'  # 오세아니아 (시드니)
        ]
        
        self.claude_models = [
            'anthropic.claude-v2:1',
            'anthropic.claude-v2',
            'anthropic.claude-3-haiku-20240307-v1:0',
            'anthropic.claude-3-sonnet-20240229-v1:0',
            'anthropic.claude-3-opus-20240229-v1:0'
        ]
    
    def check_aws_credentials(self) -> Tuple[bool, str]:
        """AWS 자격 증명 확인"""
        print("=" * 60)
        print("1️⃣  AWS 자격 증명 확인")
        print("=" * 60)
        
        # 환경 변수 확인
        required_vars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY']
        optional_vars = ['AWS_REGION', 'AWS_SESSION_TOKEN', 'AWS_PROFILE']
        
        print("🔍 환경 변수 확인:")
        for var in required_vars:
            value = os.getenv(var)
            if value:
                print(f"  ✅ {var}: {'*' * 20} (설정됨)")
            else:
                print(f"  ❌ {var}: 설정되지 않음")
        
        print("\n🔍 선택적 환경 변수:")
        for var in optional_vars:
            value = os.getenv(var)
            print(f"  {'✅' if value else '⚪'} {var}: {value or '설정되지 않음'}")
        
        # boto3 자격 증명 확인
        print("\n🔍 boto3 자격 증명 확인:")
        try:
            session = boto3.Session()
            credentials = session.get_credentials()
            
            if credentials:
                print(f"  ✅ Access Key ID: {credentials.access_key[:10]}...")
                print(f"  ✅ Secret Key: {'*' * 20}")
                if credentials.token:
                    print(f"  ✅ Session Token: {'*' * 20}")
                print(f"  ✅ 자격 증명 소스: {credentials.method}")
                return True, "자격 증명 확인 완료"
            else:
                return False, "boto3에서 자격 증명을 찾을 수 없습니다"
                
        except Exception as e:
            return False, f"자격 증명 확인 오류: {str(e)}"
    
    def check_region_models(self, region: str) -> Tuple[bool, List[Dict], str]:
        """특정 리전에서 사용 가능한 Bedrock 모델 확인"""
        try:
            bedrock = boto3.client('bedrock', region_name=region)
            response = bedrock.list_foundation_models()
            
            # Claude 모델만 필터링
            claude_models = []
            for model in response['modelSummaries']:
                if 'claude' in model['modelName'].lower():
                    claude_models.append({
                        'modelId': model['modelId'],
                        'modelName': model['modelName'],
                        'providerName': model['providerName'],
                        'inputModalities': model.get('inputModalities', []),
                        'outputModalities': model.get('outputModalities', [])
                    })
            
            return True, claude_models, "성공"
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == 'UnauthorizedOperation':
                return False, [], "Bedrock 접근 권한 없음"
            elif error_code == 'InvalidRegionException':
                return False, [], "리전에서 Bedrock 지원하지 않음"
            else:
                return False, [], f"AWS 오류: {error_code}"
        except Exception as e:
            return False, [], f"오류: {str(e)}"
    
    def check_model_access(self, region: str) -> Dict[str, str]:
        """특정 리전에서 Claude 모델별 접근 권한 확인"""
        try:
            bedrock = boto3.client('bedrock', region_name=region)
            access_status = {}
            
            for model_id in self.claude_models:
                try:
                    bedrock.get_foundation_model(modelIdentifier=model_id)
                    access_status[model_id] = "사용 가능"
                except ClientError as e:
                    error_code = e.response['Error']['Code']
                    if error_code == 'ResourceNotFoundException':
                        access_status[model_id] = "리전에서 지원하지 않음"
                    elif error_code == 'AccessDeniedException':
                        access_status[model_id] = "접근 권한 필요"
                    else:
                        access_status[model_id] = f"오류: {error_code}"
                except Exception as e:
                    access_status[model_id] = f"오류: {str(e)[:50]}"
            
            return access_status
            
        except Exception as e:
            return {model: f"리전 접근 오류: {str(e)[:50]}" for model in self.claude_models}
    
    def run_full_check(self):
        """전체 확인 프로세스 실행"""
        print("🚀 AWS Bedrock Claude 모델 가용성 종합 확인 시작\n")
        
        # 1. 자격 증명 확인
        creds_ok, creds_msg = self.check_aws_credentials()
        if not creds_ok:
            print(f"\n❌ 자격 증명 확인 실패: {creds_msg}")
            print("\n해결 방법:")
            print("1. AWS Access Key와 Secret Key를 환경 변수로 설정:")
            print("   export AWS_ACCESS_KEY_ID='your_access_key'")
            print("   export AWS_SECRET_ACCESS_KEY='your_secret_key'")
            print("   export AWS_REGION='us-east-1'")
            print("2. 또는 AWS CLI 구성: aws configure")
            print("3. 또는 IAM 역할 사용 (EC2/Lambda 등)")
            return False
        
        print(f"\n✅ {creds_msg}")
        
        # 2. 리전별 모델 확인
        print("\n" + "=" * 60)
        print("2️⃣  리전별 Bedrock Claude 모델 가용성 확인")
        print("=" * 60)
        
        available_regions = []
        
        for region in self.regions_to_check:
            print(f"\n🌍 리전: {region}")
            print("-" * 40)
            
            success, models, msg = self.check_region_models(region)
            
            if success and models:
                print(f"  ✅ 상태: {len(models)}개의 Claude 모델 사용 가능")
                available_regions.append(region)
                
                for model in models:
                    print(f"    📋 {model['modelId']}")
                    print(f"       이름: {model['modelName']}")
                    print(f"       제공자: {model['providerName']}")
            
            elif success and not models:
                print(f"  ⚪ 상태: Bedrock 접근 가능하지만 Claude 모델 없음")
            
            else:
                print(f"  ❌ 상태: {msg}")
        
        if not available_regions:
            print(f"\n❌ 모든 리전에서 Claude 모델 사용 불가")
            return False
        
        # 3. 모델별 접근 권한 확인
        print("\n" + "=" * 60)
        print("3️⃣  모델별 접근 권한 상태 확인")
        print("=" * 60)
        
        recommended_region = None
        
        for region in available_regions[:2]:  # 상위 2개 리전만 상세 확인
            print(f"\n🔐 리전: {region}")
            print("-" * 40)
            
            access_status = self.check_model_access(region)
            available_models = 0
            
            for model_id, status in access_status.items():
                if status == "사용 가능":
                    print(f"  ✅ {model_id}: {status}")
                    available_models += 1
                elif "권한 필요" in status:
                    print(f"  🔒 {model_id}: {status}")
                elif "지원하지 않음" in status:
                    print(f"  ❌ {model_id}: {status}")
                else:
                    print(f"  ❓ {model_id}: {status}")
            
            if available_models > 0 and not recommended_region:
                recommended_region = region
        
        # 4. 결과 요약 및 권장사항
        print("\n" + "=" * 60)
        print("4️⃣  결과 요약 및 권장사항")
        print("=" * 60)
        
        if recommended_region:
            print(f"✅ 권장 리전: {recommended_region}")
            print(f"✅ 사용 가능한 리전: {', '.join(available_regions)}")
            
            # LiteLLM 설정 예시 생성
            self.generate_litellm_config(recommended_region)
            return True
        
        else:
            print("❌ 즉시 사용 가능한 Claude 모델이 없습니다.")
            print("\n해결 방법:")
            print("1. AWS 콘솔 → Amazon Bedrock → Model Access에서 모델 접근 권한 요청")
            print("2. 주요 리전(us-east-1, us-west-2)에서 Anthropic Claude 모델 활성화")
            print("3. 승인까지 1-2일 소요될 수 있습니다")
            return False
    
    def generate_litellm_config(self, region: str):
        """LiteLLM 설정 코드 생성"""
        print(f"\n💡 {region} 리전 LiteLLM 설정 예시:")
        print("-" * 40)
        
        config_code = f'''
import os
import litellm

# AWS 환경 설정
os.environ["AWS_REGION"] = "{region}"
# AWS_ACCESS_KEY_ID와 AWS_SECRET_ACCESS_KEY는 이미 설정되어 있음

# 권장 Claude 모델 (가용성 순)
RECOMMENDED_MODELS = [
    "bedrock/anthropic.claude-3-sonnet-20240229-v1:0",
    "bedrock/anthropic.claude-3-haiku-20240307-v1:0", 
    "bedrock/anthropic.claude-v2:1"
]

# 안전한 API 호출 함수
def safe_claude_call(messages, model_index=0):
    if model_index >= len(RECOMMENDED_MODELS):
        raise Exception("모든 모델 시도 실패")
    
    try:
        # 사용자 메시지가 있는지 확인
        user_messages = [m for m in messages if m.get("role") != "system"]
        if not user_messages:
            messages.append({{"role": "user", "content": "Hello"}})
        
        response = litellm.completion(
            model=RECOMMENDED_MODELS[model_index],
            messages=messages,
            temperature=0.7,
            max_tokens=1000
        )
        return response.choices[0].message.content
    
    except Exception as e:
        print(f"모델 {{RECOMMENDED_MODELS[model_index]}} 실패: {{e}}")
        return safe_claude_call(messages, model_index + 1)

# 사용 예시
messages = [
    {{"role": "system", "content": "You are a helpful assistant."}},
    {{"role": "user", "content": "안녕하세요. 도움이 필요합니다."}}
]

try:
    result = safe_claude_call(messages)
    print("성공:", result)
except Exception as e:
    print("모든 모델 호출 실패:", e)
'''
        
        # 설정 파일로 저장
        with open('/home/user/webapp/litellm_config.py', 'w', encoding='utf-8') as f:
            f.write(config_code.strip())
        
        print("📁 설정 파일 저장: /home/user/webapp/litellm_config.py")
        print("\n사용법:")
        print("1. python litellm_config.py 실행")
        print("2. 또는 코드에서 import하여 사용")

if __name__ == "__main__":
    checker = BedrockChecker()
    success = checker.run_full_check()
    
    if success:
        print(f"\n🎉 확인 완료! 다음 단계로 LiteLLM 테스트를 진행할 수 있습니다.")
        sys.exit(0)
    else:
        print(f"\n⚠️  문제가 발견되었습니다. 위의 해결 방법을 참조하세요.")
        sys.exit(1)