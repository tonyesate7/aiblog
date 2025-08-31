# 🚀 AI 블로그 생성기 Cloudflare Pages 배포 가이드

## ⚡ 빠른 배포 (1분 완료)

### 1️⃣ 사전 준비
- [ ] Cloudflare API 키 설정 (Deploy 탭에서 완료)
- [ ] 프로젝트 이름: `ai-blog-generator` (이미 설정됨)

### 2️⃣ 배포 명령어 (순서대로 실행)

```bash
# 1. 프로젝트 디렉토리로 이동
cd /home/user/webapp

# 2. 최신 버전 빌드
npm run build

# 3. wrangler 인증 확인
npx wrangler whoami

# 4. Cloudflare Pages 프로젝트 생성 (최초 1회만)
npx wrangler pages project create ai-blog-generator --production-branch main --compatibility-date 2024-01-01

# 5. 프로덕션 배포
npx wrangler pages deploy dist --project-name ai-blog-generator

# 6. (선택사항) fal.ai API 키 설정
# npx wrangler pages secret put FAL_API_KEY --project-name ai-blog-generator
```

### 3️⃣ 배포 완료 후 확인

- **프로덕션 URL**: https://ai-blog-generator.pages.dev
- **브랜치 URL**: https://main.ai-blog-generator.pages.dev

## 🔧 고급 설정

### 환경 변수 설정
```bash
# fal.ai 이미지 생성을 위한 API 키 (선택사항)
npx wrangler pages secret put FAL_API_KEY --project-name ai-blog-generator

# 환경 변수 확인
npx wrangler pages secret list --project-name ai-blog-generator
```

### 커스텀 도메인 설정
```bash
# 커스텀 도메인 추가
npx wrangler pages domain add yourdomain.com --project-name ai-blog-generator
```

### 프로젝트 상태 확인
```bash
# 배포 상태 확인
npx wrangler pages project list

# 배포 히스토리 확인  
npx wrangler pages deployment list --project-name ai-blog-generator
```

## 📋 트러블슈팅

### 프로젝트 이름 충돌 시
```bash
# 새로운 프로젝트 이름으로 시도
npx wrangler pages project create ai-blog-generator-v2
npx wrangler pages deploy dist --project-name ai-blog-generator-v2
```

### 인증 문제 시
```bash
# 재로그인
npx wrangler logout
npx wrangler login
```

### 빌드 오류 시
```bash
# 의존성 재설치
npm install
npm run build

# 빌드 결과물 확인
ls -la dist/
```

## 🎯 배포 후 테스트

1. **기본 기능 테스트**
   - 메인 페이지 로딩 확인
   - Claude API 키 설정 및 키워드 생성
   - 블로그 글 생성 테스트

2. **이미지 생성 테스트**  
   - 개별 이미지 생성 (플레이스홀더)
   - fal.ai API 키 설정 시 실제 AI 이미지 생성

3. **성능 테스트**
   - 페이지 로딩 속도 확인
   - API 응답 시간 측정

## 📞 지원

배포 중 문제가 발생하면:
1. 터미널 오류 메시지 확인
2. Cloudflare Dashboard → Pages 에서 배포 로그 확인
3. wrangler 버전 확인: `npx wrangler --version`