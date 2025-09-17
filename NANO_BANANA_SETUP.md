# 🖼️ Nano-Banana 이미지 생성 API 연동 가이드

## 📋 현재 상황
- ✅ **코드 수정 완료**: nano-banana 모델로 변경 완료
- ✅ **API 엔드포인트**: `/api/generate-image` 구현 완료
- ✅ **JavaScript 연동**: 프론트엔드 이미지 생성 함수 구현 완료
- ❌ **API 키 누락**: FAL_AI_API_KEY 환경변수 설정 필요

## 🚀 Nano-Banana 이미지 생성 활성화 방법

### 1️⃣ **FAL AI API 키 발급**
1. **FAL AI 웹사이트 방문**: https://fal.ai/
2. **계정 생성 및 로그인**
3. **API Keys 메뉴**에서 새 API 키 생성
4. **API 키 복사** (예: `fal_ai_xxxxxxxxxxxxxxxx`)

### 2️⃣ **Cloudflare Pages 환경변수 설정**
```bash
# 개발 환경 (현재 샌드박스)
echo 'FAL_AI_API_KEY="여기에_실제_API_키_입력"' >> .env

# 프로덕션 환경 (Cloudflare Pages)
npx wrangler pages secret put FAL_AI_API_KEY --project-name webapp
# 프롬프트에서 API 키 입력
```

### 3️⃣ **로컬 개발 환경 설정**
```bash
# .dev.vars 파일 생성 (로컬 개발용)
echo 'FAL_AI_API_KEY=여기에_실제_API_키_입력' > .dev.vars

# 서버 재시작
npm run build
pm2 restart blog-generator
```

## 🖼️ 이미지 생성 기능 사용법

### **웹 인터페이스에서 사용**
1. **주제 입력** → 설정 선택
2. **🖼️ 이미지와 함께 생성** 버튼 클릭
3. **자동 생성**: 블로그 + 썸네일 이미지 + 컨텐츠 이미지들

### **API 직접 호출**
```bash
# 썸네일 이미지 생성
curl -X POST https://your-domain/api/generate-image \
  -H "Content-Type: application/json" \
  -d '{"topic":"AI 기술 트렌드","imageType":"thumbnail"}'

# 다중 이미지 생성  
curl -X POST https://your-domain/api/generate-blog-images \
  -H "Content-Type: application/json" \
  -d '{"topic":"AI 기술 트렌드","imageCount":3}'
```

## ⚡ Nano-Banana 모델 특징

### 🌟 **주요 장점**
- **SOTA 성능**: Gemini 2.5 Flash 기반 최신 이미지 생성
- **빠른 속도**: 고속 생성 (30초 내)
- **다양한 스타일**: 사실적부터 일러스트까지
- **다중 이미지 융합**: 여러 이미지 조합 가능
- **자연어 편집**: 간단한 명령어로 이미지 수정

### 🎨 **지원 기능**
- **텍스트-이미지 생성**: 프롬프트로 이미지 생성
- **이미지 편집**: 기존 이미지 수정 및 개선
- **스타일 일관성**: 동일 스타일로 여러 이미지 생성
- **캐릭터 일관성**: 동일 인물/객체 유지

## 🔧 현재 구현된 기능

### ✅ **완성된 기능들**
1. **썸네일 생성**: 16:9 비율 블로그 썸네일
2. **인포그래픽**: 데이터 시각화 스타일 이미지
3. **히어로 이미지**: 블로그 헤더용 대형 이미지
4. **다중 이미지**: 한 번에 3개 이미지 생성
5. **오류 처리**: API 실패 시 예쁜 플레이스홀더 제공

### 🎯 **이미지 타입별 프롬프트**
```javascript
// 썸네일 (16:9)
"Professional blog thumbnail for '{topic}'. Clean, modern design with Korean text elements."

// 인포그래픽 (1:1)  
"Modern infographic style illustration about '{topic}'. Data visualization elements."

// 히어로 이미지 (16:9)
"Hero image for blog post about '{topic}'. Professional, engaging design."
```

## 🚨 문제 해결

### **API 키 미설정 시**
- **현상**: 플레이스홀더 이미지만 표시
- **해결**: 위의 2️⃣ 단계 환경변수 설정

### **API 호출 실패 시**
- **현상**: 오류 메시지 또는 플레이스홀더
- **확인**: 서버 로그에서 구체적인 오류 확인
```bash
pm2 logs blog-generator --nostream | tail -20
```

### **이미지 로딩 실패 시**
- **현상**: 이미지가 표시되지 않음
- **확인**: 브라우저 네트워크 탭에서 이미지 URL 상태 확인

## 💰 비용 정보
- **FAL AI**: 이미지당 약 $0.01-0.05 (모델별 상이)
- **Nano-Banana**: 고품질 모델로 상대적으로 비용 높음
- **권장**: 개발/테스트용으로 소량 사용 후 본격 운영

## 🔗 관련 링크
- **FAL AI 공식**: https://fal.ai/
- **Nano-Banana 문서**: https://fal.ai/models/fal-ai/nano-banana
- **API 문서**: https://fal.ai/docs

---

## 📞 지원
API 키 설정 후에도 이미지가 생성되지 않으면:
1. 서버 로그 확인
2. API 키 권한 확인  
3. FAL AI 계정 크레딧 확인