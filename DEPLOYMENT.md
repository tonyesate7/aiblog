# 🚀 AI Blog Generator - Cloudflare Pages 배포 가이드

## 📋 사전 준비 체크리스트

### ✅ 필수 준비사항
- [ ] **Cloudflare API 키**: Deploy 탭에서 설정
- [ ] **프로젝트 빌드**: `npm run build` 성공 확인
- [ ] **Git 커밋**: 모든 변경사항 커밋 완료

### 🔑 선택사항
- [ ] **fal.ai API 키**: 실제 이미지 생성을 위해 필요
- [ ] **커스텀 도메인**: 자체 도메인 사용 시

## 🎯 배포 방법 (추천 순서)

### 방법 1: 자동 배포 스크립트 (가장 쉬움) ⭐

```bash
# Deploy 탭에서 Cloudflare API 키 설정 후
cd /home/user/webapp
./deploy.sh
```

### 방법 2: 수동 배포 (단계별 제어)

```bash
# 1. 빌드
npm run build

# 2. 인증 확인
npx wrangler whoami

# 3. 프로젝트 생성
npx wrangler pages project create ai-blog-generator \
  --production-branch main \
  --compatibility-date 2024-01-01

# 4. 배포
npx wrangler pages deploy dist --project-name ai-blog-generator
```

### 방법 3: GitHub 연동 자동 배포

1. **#github 탭에서 GitHub 인증**
2. **GitHub 저장소 푸시**
3. **Cloudflare Pages에서 GitHub 연동**

## 🔐 환경변수 설정

### 개발 환경 (.dev.vars)
```
FAL_API_KEY=fal_demo_key
```

### 프로덕션 환경 (Cloudflare Secrets)
```bash
# fal.ai API 키 설정 (실제 이미지 생성용)
npx wrangler pages secret put FAL_API_KEY --project-name ai-blog-generator

# 설정된 시크릿 확인
npx wrangler pages secret list --project-name ai-blog-generator
```

## 🌐 배포 결과 URL

### 자동 할당 도메인
- **프로덕션**: `https://ai-blog-generator.pages.dev`
- **브랜치 (main)**: `https://main.ai-blog-generator.pages.dev`

### 커스텀 도메인 설정 (선택사항)
```bash
# 커스텀 도메인 추가
npx wrangler pages domain add yourdomain.com --project-name ai-blog-generator

# SSL 인증서 자동 발급됨
```

## 🔍 배포 후 확인사항

### ✅ 기능 테스트
- [ ] **메인 페이지 로드**: 정상 접근 확인
- [ ] **Claude API**: 키워드 생성 및 글 작성 테스트
- [ ] **이미지 생성**: 개발/프로덕션 모드 동작 확인
- [ ] **SEO 분석**: 분석 도구 정상 작동
- [ ] **프로젝트 관리**: 저장/로드 기능 테스트
- [ ] **문서 다운로드**: PDF/Word/ZIP 생성 확인

### 🚨 문제 해결

#### 배포 실패
```bash
# 로그 확인
npx wrangler pages deployment tail --project-name ai-blog-generator

# 프로젝트 재배포
npm run build
npx wrangler pages deploy dist --project-name ai-blog-generator --force
```

#### API 오류
- **Claude API**: 클라이언트에서 설정 → API 키 확인
- **이미지 생성**: Cloudflare 시크릿 FAL_API_KEY 확인

#### 도메인 문제
```bash
# DNS 설정 확인
npx wrangler pages domain list --project-name ai-blog-generator
```

## 📊 배포 성능

### 예상 성능
- **초기 로드**: ~2-3초
- **글 생성**: ~5-10초 (Claude API 속도)
- **이미지 생성**: ~10-20초 (fal.ai nano-banana)
- **전역 CDN**: Cloudflare의 200+ 엣지 로케이션

### 최적화 팁
- **이미지 최적화**: WebP 형식 사용
- **캐싱 설정**: Cloudflare 캐시 규칙 활용
- **번들 크기**: 66.90 kB (매우 경량)

## 🎉 배포 완료 후

### 사용자 안내
1. **프로덕션 URL 공유**
2. **사용법 가이드 제공** (README.md 참조)
3. **API 키 설정 안내**

### 운영 관리
- **모니터링**: Cloudflare Analytics 활용
- **업데이트**: GitHub 푸시로 자동 재배포
- **백업**: 프로젝트 관리 기능으로 사용자 데이터 백업

---

💡 **문제가 발생하면**: [Cloudflare Pages 문서](https://developers.cloudflare.com/pages/) 참조
🆘 **긴급 지원**: Cloudflare Discord 커뮤니티 활용