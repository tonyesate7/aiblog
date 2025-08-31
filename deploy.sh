#!/bin/bash

# AI Blog Generator - Cloudflare Pages 자동 배포 스크립트
echo "🚀 AI Blog Generator Cloudflare Pages 배포 시작..."

# 프로젝트 빌드
echo "📦 프로젝트 빌드 중..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 빌드 실패. 배포를 중단합니다."
    exit 1
fi

# Cloudflare 인증 확인
echo "🔐 Cloudflare 인증 확인 중..."
npx wrangler whoami

if [ $? -ne 0 ]; then
    echo "❌ Cloudflare 인증 실패. Deploy 탭에서 API 키를 설정해주세요."
    exit 1
fi

# 프로젝트명 설정
PROJECT_NAME="ai-blog-generator"

# Pages 프로젝트 생성 (이미 존재하면 건너뛰기)
echo "📋 Cloudflare Pages 프로젝트 생성 중..."
npx wrangler pages project create $PROJECT_NAME --production-branch main --compatibility-date 2024-01-01 2>/dev/null || echo "프로젝트가 이미 존재합니다."

# 배포 실행
echo "🚀 Cloudflare Pages에 배포 중..."
npx wrangler pages deploy dist --project-name $PROJECT_NAME

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 배포 성공!"
    echo "🌐 프로덕션 URL: https://$PROJECT_NAME.pages.dev"
    echo "🔗 브랜치 URL: https://main.$PROJECT_NAME.pages.dev"
    echo ""
    echo "📝 다음 단계:"
    echo "1. fal.ai API 키 설정: npx wrangler pages secret put FAL_API_KEY --project-name $PROJECT_NAME"
    echo "2. 커스텀 도메인 연결 (선택사항): npx wrangler pages domain add your-domain.com --project-name $PROJECT_NAME"
else
    echo "❌ 배포 실패."
    exit 1
fi