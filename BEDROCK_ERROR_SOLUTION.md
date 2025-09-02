# LiteLLM Bedrock Claude 오류 완전 해결 가이드

## 🚨 원본 오류
```
Error code: 400 - {'error': {'message': 'litellm.BadRequestError: Invalid Message bedrock requires at least one non-system message. Received Model Group=claude-sonnet-4\nAvailable Model Group Fallbacks=None', 'type': None, 'param': None, 'code': '400'}}
```

## 🔍 문제 분석

### 1. 주요 원인
- **메시지 구성 문제**: 시스템 메시지만 있고 사용자 메시지가 없음
- **모델명 문제**: `claude-sonnet-4`는 잘못된 모델명
- **AWS 자격 증명 미설정**: Bedrock 접근 권한 없음

### 2. Bedrock 요구사항
- **최소 1개의 non-system 메시지 필요**: `user`, `assistant` 역할 메시지
- **올바른 모델명 사용**: `bedrock/anthropic.claude-3-sonnet-20240229-v1:0`
- **AWS 자격 증명 설정**: Access Key, Secret Key, Region
- **모델 접근 권한**: AWS 콘솔에서 별도 신청 필요

## 🛠️ 단계별 해결 방법

### 1단계: AWS 자격 증명 설정

#### 방법 A: 환경 변수 설정 (권장)
```bash
export AWS_ACCESS_KEY_ID='your_access_key_here'
export AWS_SECRET_ACCESS_KEY='your_secret_key_here'  
export AWS_REGION='us-east-1'
```

#### 방법 B: .env 파일 생성
```bash
# .env 파일 생성
cat > .env << EOF
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
EOF
```

#### 방법 C: AWS CLI 구성
```bash
aws configure
# Access Key ID: your_access_key
# Secret Access Key: your_secret_key
# Region: us-east-1
# Output format: json
```

### 2단계: 올바른 메시지 형식 사용

#### ❌ 잘못된 예시 (오류 발생)
```python
import litellm

# 시스템 메시지만 있음 -> 오류!
messages = [
    {"role": "system", "content": "You are a helpful assistant."}
]

response = litellm.completion(
    model="claude-sonnet-4",  # 잘못된 모델명
    messages=messages
)
```

#### ✅ 올바른 예시 (해결됨)
```python
import litellm

# 시스템 메시지 + 사용자 메시지
messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "안녕하세요. 도움이 필요합니다."}
]

response = litellm.completion(
    model="bedrock/anthropic.claude-3-sonnet-20240229-v1:0",  # 올바른 모델명
    messages=messages,
    temperature=0.7,
    max_tokens=1000
)

print(response.choices[0].message.content)
```

### 3단계: 안전한 호출 함수 사용

프로젝트에 포함된 `bedrock_helpers.py` 사용:

```python
from bedrock_helpers import safe_claude_call

# 자동 오류 수정 및 복구
messages = [
    {"role": "system", "content": "You are a helpful assistant."}
    # user 메시지가 없어도 자동으로 추가됨
]

success, result = safe_claude_call(messages)

if success:
    print(f"✅ 성공: {result}")
else:
    print(f"❌ 실패: {result}")
```

## 🌍 추천 설정

### 권장 리전 (Claude 모델 지원)
1. **us-east-1** (가장 많은 모델, 최우선)
2. **us-west-2** (두 번째 선택)
3. **eu-central-1** (유럽, Opus 제외)
4. **ap-northeast-1** (아시아, Opus 제외)

### 권장 Claude 모델 (가용성 순)
1. `bedrock/anthropic.claude-3-sonnet-20240229-v1:0`
2. `bedrock/anthropic.claude-3-haiku-20240307-v1:0`
3. `bedrock/anthropic.claude-v2:1`
4. `bedrock/anthropic.claude-v2`

## 🧪 테스트 및 검증

### 1. AWS 설정 테스트
```bash
cd /home/user/webapp
python test_aws_setup.py
```

### 2. 전체 문제 진단
```bash
cd /home/user/webapp
python setup_aws_credentials.py
```

### 3. 오류 해결 데모
```bash
cd /home/user/webapp
python fix_litellm_bedrock_error.py
```

## 📋 일반적인 오류와 해결책

| 오류 | 원인 | 해결책 |
|------|------|--------|
| `at least one non-system message` | 사용자 메시지 없음 | user 역할 메시지 추가 |
| `NoCredentialsError` | AWS 자격 증명 없음 | 환경 변수 또는 AWS CLI 설정 |
| `AccessDeniedException` | Bedrock 권한 없음 | IAM에서 bedrock:* 권한 추가 |
| `ResourceNotFoundException` | 모델/리전 문제 | us-east-1 리전, 올바른 모델명 사용 |
| `ValidationException` | 모델 접근 권한 없음 | AWS 콘솔에서 모델 권한 요청 |

## 🔐 보안 및 권한 설정

### 필수 IAM 권한
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "bedrock:ListFoundationModels",
                "bedrock:GetFoundationModel", 
                "bedrock:InvokeModel",
                "bedrock:InvokeModelWithResponseStream"
            ],
            "Resource": "*"
        }
    ]
}
```

### AWS 콘솔에서 모델 접근 권한 요청
1. AWS 콘솔 로그인
2. **Amazon Bedrock** 서비스 이동
3. 왼쪽 메뉴 **"Model access"** 클릭
4. **"Manage model access"** 클릭
5. **Anthropic Claude 모델들** 체크
6. 사용 사례 작성 후 제출
7. 승인까지 1-2일 소요

## ✅ 완전한 작동 예시

```python
#!/usr/bin/env python3
import os
import litellm
from dotenv import load_dotenv

# .env 파일 로드 (있는 경우)
load_dotenv()

# AWS 설정 확인
required_vars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY']
for var in required_vars:
    if not os.getenv(var):
        print(f"❌ {var} 환경 변수가 설정되지 않았습니다.")
        exit(1)

# 리전 설정 (기본값)
if not os.getenv('AWS_REGION'):
    os.environ['AWS_REGION'] = 'us-east-1'

def fixed_claude_call(user_message, system_message="You are a helpful assistant."):
    """완전히 수정된 Claude 호출 함수"""
    
    # 올바른 메시지 형식
    messages = [
        {"role": "system", "content": system_message},
        {"role": "user", "content": user_message}
    ]
    
    # 권장 모델들 (fallback 순서)
    models = [
        "bedrock/anthropic.claude-3-sonnet-20240229-v1:0",
        "bedrock/anthropic.claude-3-haiku-20240307-v1:0",
        "bedrock/anthropic.claude-v2:1"
    ]
    
    for model in models:
        try:
            response = litellm.completion(
                model=model,
                messages=messages,
                temperature=0.7,
                max_tokens=1000
            )
            
            return {
                "success": True,
                "content": response.choices[0].message.content,
                "model": model
            }
            
        except Exception as e:
            print(f"❌ {model} 실패: {str(e)[:100]}...")
            continue
    
    return {
        "success": False,
        "content": "모든 모델 호출 실패",
        "model": None
    }

# 테스트 실행
if __name__ == "__main__":
    result = fixed_claude_call("안녕하세요! 연결 테스트입니다. '연결 성공!'이라고 한국어로 답변해주세요.")
    
    if result["success"]:
        print(f"✅ 성공 ({result['model']}):")
        print(result["content"])
    else:
        print(f"❌ 실패: {result['content']}")
```

## 📂 생성된 파일들

프로젝트에 다음 파일들이 생성되었습니다:

1. **`setup_aws_credentials.py`** - AWS 설정 종합 가이드
2. **`test_aws_setup.py`** - AWS 연결 테스트
3. **`fix_litellm_bedrock_error.py`** - 오류 해결 데모
4. **`bedrock_helpers.py`** - 재사용 가능한 도우미 함수
5. **`aws_bedrock_checker.py`** - 상세 진단 도구
6. **`.env.example`** - 환경 변수 템플릿

## 🎯 요약

**원본 오류의 핵심 해결책:**

1. ✅ **메시지에 user 역할 추가**: 시스템 메시지만으로는 불충분
2. ✅ **올바른 모델명 사용**: `bedrock/anthropic.claude-3-sonnet-20240229-v1:0`
3. ✅ **AWS 자격 증명 설정**: 환경 변수 또는 AWS CLI 구성
4. ✅ **권장 리전 사용**: `us-east-1` 또는 `us-west-2`
5. ✅ **모델 접근 권한 요청**: AWS 콘솔에서 별도 신청

이제 `bedrock_helpers.py`의 `safe_claude_call()` 함수를 사용하시면 모든 오류가 자동으로 처리됩니다!