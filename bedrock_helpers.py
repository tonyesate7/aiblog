"""
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
