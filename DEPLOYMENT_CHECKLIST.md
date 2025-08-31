# 📋 Cloudflare Pages 배포 체크리스트

## ✅ 배포 전 확인사항

### 필수 설정
- [ ] **Cloudflare API 키 설정** (Deploy 탭에서 완료)
  - Cloudflare Dashboard → My Profile → API Tokens
  - "Edit zone DNS" 권한 포함 토큰 생성
  - Deploy 탭에서 토큰 입력 및 저장

### 프로젝트 준비 상태
- [x] **프로젝트 코드** - 모든 기능 구현 완료
- [x] **빌드 설정** - package.json의 build 스크립트 준비
- [x] **프로젝트 이름** - `ai-blog-generator`로 설정
- [x] **Wrangler 설정** - wrangler.jsonc 구성 완료

### 기능별 준비 상태
- [x] **블로그 글 생성** - Claude AI 통합 완료
- [x] **실시간 편집** - 3가지 편집 모드 구현
- [x] **SEO 분석** - 종합 분석 도구 완성
- [x] **프로젝트 관리** - 저장/로드/프리셋 시스템
- [x] **이미지 생성** - Gemini 2.5 Flash nano-banana 통합
- [x] **문서 내보내기** - PDF/Word/Markdown/ZIP 지원

## 🚀 배포 실행 방법

### 방법 1: 자동 스크립트 사용 (권장)
```bash
cd /home/user/webapp

# 첫 배포 (프로젝트 생성 + 배포 + 시크릿 설정)
./deploy.sh --create-project --set-secrets

# 업데이트 배포
./deploy.sh
```

### 방법 2: 수동 명령어
```bash
cd /home/user/webapp

# 1. 빌드
npm run build

# 2. 프로젝트 생성 (최초 1회)
npx wrangler pages project create ai-blog-generator --production-branch main

# 3. 배포
npx wrangler pages deploy dist --project-name ai-blog-generator
```

### 방법 3: package.json 스크립트
```bash
cd /home/user/webapp

# 프로덕션 배포
npm run deploy:prod
```

## 🔧 배포 후 설정

### 환경 변수 설정
```bash
# fal.ai 이미지 생성 API 키 (선택사항)
npx wrangler pages secret put FAL_API_KEY --project-name ai-blog-generator

# 설정된 시크릿 확인
npx wrangler pages secret list --project-name ai-blog-generator
```

### 커스텀 도메인 (선택사항)
```bash
# 도메인 연결
npx wrangler pages domain add yourdomain.com --project-name ai-blog-generator
```

## 🎯 배포 완료 후 확인

### 1. URL 접근 테스트
- **프로덕션**: https://ai-blog-generator.pages.dev
- **브랜치**: https://main.ai-blog-generator.pages.dev

### 2. 핵심 기능 테스트
1. **페이지 로딩** - 메인 화면 정상 표시
2. **Claude API** - 설정 메뉴에서 API 키 입력 후 키워드 생성
3. **글 생성** - 10개 블로그 글 생성 테스트
4. **편집 기능** - 실시간 편집 모드 전환 테스트
5. **SEO 분석** - 글 생성 후 SEO 점수 확인
6. **프로젝트 관리** - 저장/로드 기능 테스트
7. **이미지 생성** - 데모 이미지 생성 확인 (fal.ai API 키 설정 시 실제 이미지)
8. **문서 다운로드** - PDF/Word 내보내기 테스트

### 3. 성능 확인
- 페이지 로딩 속도 (3초 이내 목표)
- API 응답 시간 확인
- 이미지 로딩 속도 확인

## 📊 배포 상태 모니터링

### Cloudflare Dashboard
- Analytics → Pages → ai-blog-generator
- 방문자 수, 응답 시간, 오류율 확인

### 배포 히스토리
```bash
# 배포 목록 확인
npx wrangler pages deployment list --project-name ai-blog-generator

# 특정 배포 상세 정보
npx wrangler pages deployment get DEPLOYMENT_ID --project-name ai-blog-generator
```

## ⚠️ 주의사항

1. **API 키 보안**
   - Claude API 키: 클라이언트에서 입력 (로컬 스토리지)
   - fal.ai API 키: Cloudflare Pages 시크릿으로 안전하게 관리

2. **도메인 관리**
   - pages.dev 서브도메인은 무료
   - 커스텀 도메인 연결 시 DNS 설정 필요

3. **사용량 제한**
   - Cloudflare Pages: 월 100,000 요청 무료
   - Claude API: 사용량에 따른 과금
   - fal.ai API: 모델별 과금 체계 확인

## 🔄 업데이트 배포

코드 수정 후 재배포:
```bash
cd /home/user/webapp
git add . && git commit -m "Update: 기능 개선"
npm run deploy:prod
```

## 📞 문제 해결

### 일반적인 오류
1. **인증 오류**: `npx wrangler login` 재실행
2. **빌드 오류**: `npm install && npm run build` 재실행
3. **배포 오류**: 프로젝트 이름 중복 확인
4. **API 오류**: 환경 변수 설정 확인

### 로그 확인
```bash
# wrangler 로그
npx wrangler pages deployment tail --project-name ai-blog-generator

# 빌드 로그 (Cloudflare Dashboard에서 확인)
```