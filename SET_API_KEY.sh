#!/bin/bash

# API 키 설정 스크립트
# 사용법: ./SET_API_KEY.sh your_fal_api_key_here

if [ -z "$1" ]; then
    echo "사용법: $0 <FAL_API_KEY>"
    echo "예시: $0 fal_4ddc71da-79b6-4e5c-b786-3782d81c27b2:bb9d47fbd2e3596d8d459c01d89cb3a5"
    exit 1
fi

FAL_API_KEY=$1

# .dev.vars 파일 업데이트
cat > .dev.vars << EOF
# 개발 환경 변수
# FAL API 키가 설정되었습니다
FAL_API_KEY=$FAL_API_KEY

# Claude API는 클라이언트에서 직접 처리하므로 여기서는 불필요
EOF

echo "✅ FAL API 키가 설정되었습니다!"
echo "🔄 서버를 재시작합니다..."

# PM2 재시작
pm2 restart blog-generator --update-env

echo "🚀 완료! 이제 실제 AI 이미지 생성이 활성화되었습니다."
echo "🧪 테스트: 브라우저에서 '전체 이미지 생성' 버튼을 클릭해보세요."