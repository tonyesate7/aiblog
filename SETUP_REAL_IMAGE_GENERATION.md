# 🎨 실제 AI 이미지 생성 활성화 가이드

## 📋 현재 상황
- ✅ **코드는 이미 준비완료**: fal.ai nano-banana 모델 통합
- ⚠️ **API 키만 설정하면 바로 사용 가능**
- 🔄 **현재 데모 모드**: 플레이스홀더 이미지 사용 중

## 🚀 **단계별 설정 방법**

### **Step 1: FAL.AI 계정 생성**
1. https://fal.ai 접속
2. "Sign Up" 클릭하여 계정 생성
3. 이메일 인증 완료

### **Step 2: API 키 발급**
1. 로그인 후 Dashboard 접속
2. "API Keys" 섹션으로 이동
3. "Create New Key" 클릭
4. API 키 복사 (fal_xxxxxxxx 형태)

### **Step 3: 로컬 환경 설정**
```bash
# .dev.vars 파일 수정
FAL_API_KEY=fal_your_actual_api_key_here
```

### **Step 4: 프로덕션 환경 설정**
```bash
# Cloudflare Pages Secret 설정
wrangler pages secret put FAL_API_KEY --project-name webapp
# 프롬프트에서 실제 API 키 입력
```

### **Step 5: 서버 재시작**
```bash
cd /home/user/webapp
pm2 restart blog-generator
```

## 💰 **비용 안내**

### **FAL.AI nano-banana 요금**
- **이미지당**: $0.055 (1024x1024 해상도)
- **월 $10**: 약 180개 이미지 생성 가능
- **월 $25**: 약 450개 이미지 생성 가능

### **사용량 추정**
- **블로그 10개 생성**: $0.55
- **일일 10개 블로그**: 월 $16.5
- **대량 사용 (월 1000개 이미지)**: 월 $55

## 🔧 **테스트 방법**

API 키 설정 후:
1. 브라우저에서 애플리케이션 접속
2. 블로그 생성 완료 후
3. "전체 이미지 생성" 버튼 클릭
4. 실제 AI 생성 이미지 확인

## 🚨 **주의사항**

### **보안**
- ❌ API 키를 코드에 직접 삽입하지 마세요
- ✅ 환경변수나 Cloudflare Secret 사용
- ✅ .dev.vars 파일은 .gitignore에 포함됨

### **비용 관리**
- 📊 FAL.AI Dashboard에서 사용량 모니터링
- 🔒 필요시 월 사용량 제한 설정
- 💡 테스트 시에는 소량으로 시작

## 🎯 **대안 옵션**

### **더 저렴한 옵션**
1. **Stability.ai**: $0.002-0.01 per image
2. **Replicate**: 모델별 상이
3. **HuggingFace**: 무료 모델 사용 가능

### **더 고품질 옵션**
1. **OpenAI DALL-E 3**: $0.04-0.08 per image
2. **Midjourney API**: $0.05-0.15 per image

## 📞 **지원**

API 키 설정이나 이미지 생성에 문제가 있으면:
1. FAL.AI Dashboard에서 API 키 상태 확인
2. 브라우저 개발자 도구에서 네트워크 탭 확인
3. PM2 로그 확인: `pm2 logs blog-generator --nostream`