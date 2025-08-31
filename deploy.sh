#!/bin/bash

# 🚀 AI 블로그 생성기 Cloudflare Pages 자동 배포 스크립트
# 사용법: ./deploy.sh [--create-project] [--set-secrets]

set -e  # 오류 시 스크립트 중단

PROJECT_NAME="ai-blog-generator"
PRODUCTION_BRANCH="main"

echo "🚀 AI 블로그 생성기 Cloudflare Pages 배포 시작..."

# 현재 디렉토리 확인
if [ ! -f "package.json" ]; then
    echo "❌ 오류: package.json이 없습니다. 프로젝트 루트 디렉토리에서 실행해주세요."
    exit 1
fi

# wrangler 인증 상태 확인
echo "🔐 Cloudflare 인증 상태 확인..."
if ! npx wrangler whoami &>/dev/null; then
    echo "❌ Cloudflare 인증이 필요합니다."
    echo "   다음 중 하나를 선택하세요:"
    echo "   1. Deploy 탭에서 API 키 설정"
    echo "   2. wrangler login 실행"
    exit 1
fi

echo "✅ Cloudflare 인증 완료"

# 프로젝트 빌드
echo "🔨 프로젝트 빌드 중..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ 빌드 실패: dist 디렉토리가 생성되지 않았습니다."
    exit 1
fi

echo "✅ 빌드 완료"

# 프로젝트 생성 (--create-project 플래그 시)
if [[ "$1" == "--create-project" ]]; then
    echo "📦 Cloudflare Pages 프로젝트 생성 중..."
    if npx wrangler pages project create $PROJECT_NAME --production-branch $PRODUCTION_BRANCH --compatibility-date 2024-01-01; then
        echo "✅ 프로젝트 '$PROJECT_NAME' 생성 완료"
    else
        echo "⚠️  프로젝트가 이미 존재하거나 생성에 실패했습니다. 계속 진행합니다..."
    fi
fi

# 배포 실행
echo "🚀 Cloudflare Pages에 배포 중..."
npx wrangler pages deploy dist --project-name $PROJECT_NAME

# 배포 성공 확인
if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 배포 완료!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📍 프로덕션 URL: https://$PROJECT_NAME.pages.dev"
    echo "📍 브랜치 URL: https://$PRODUCTION_BRANCH.$PROJECT_NAME.pages.dev"
    echo ""
    
    # 시크릿 설정 안내
    if [[ "$2" == "--set-secrets" ]] || [[ "$1" == "--set-secrets" ]]; then
        echo "🔐 환경 변수 설정..."
        echo "fal.ai 이미지 생성을 위한 API 키를 설정하시겠습니까? (y/N)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            echo "FAL_API_KEY를 입력해주세요:"
            npx wrangler pages secret put FAL_API_KEY --project-name $PROJECT_NAME
            echo "✅ FAL_API_KEY 설정 완료"
        fi
    else
        echo "💡 팁: 이미지 생성 기능을 사용하려면 다음 명령어로 API 키를 설정하세요:"
        echo "   npx wrangler pages secret put FAL_API_KEY --project-name $PROJECT_NAME"
    fi
    
    echo ""
    echo "🎯 다음 단계:"
    echo "   1. 프로덕션 URL에서 앱 테스트"
    echo "   2. Claude API 키 설정 (앱 내 설정 메뉴)"
    echo "   3. fal.ai API 키 설정 (이미지 생성용, 선택사항)"
    echo ""
else
    echo "❌ 배포 실패"
    exit 1
fi