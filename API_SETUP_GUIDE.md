# 🔑 API 키 설정 가이드

## 문제 상황
배포된 AI 블로그 생성기에서 "사용 가능한 API 키가 없습니다" 오류가 발생하고 있습니다.

## 해결 방법

### 방법 1: 웹 설정에서 API 키 입력 (현재 사용 가능)

1. **웹사이트 접속**: https://ai-blog-gen-v2.pages.dev
2. **설정 버튼 클릭**: 우상단의 "설정" 버튼 클릭
3. **API 키 입력**: 
   - Claude API Key: `sk-ant-` 로 시작하는 키
   - Gemini API Key: Google AI Studio에서 발급받은 키
   - OpenAI API Key: `sk-` 로 시작하는 키
4. **저장**: "설정 저장" 버튼 클릭

### 방법 2: Cloudflare Pages 환경 변수 설정 (운영 환경용)

#### A. Cloudflare Dashboard 방식 (권장)
1. **Dashboard 접속**: https://dash.cloudflare.com 로그인
2. **프로젝트 선택**: Pages → `ai-blog-gen-v2` 클릭
3. **환경 변수 추가**: Settings → Environment variables → "Add variable"
4. **Production 환경에 추가**:
   ```
   CLAUDE_API_KEY=sk-ant-your_claude_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here  
   OPENAI_API_KEY=sk-your_openai_api_key_here
   ```
5. **재배포**: Deployments → 최신 배포 → "Retry deployment"

#### B. wrangler CLI 방식
```bash
# Claude API Key 설정
npx wrangler pages secret put CLAUDE_API_KEY --project-name ai-blog-gen-v2

# Gemini API Key 설정  
npx wrangler pages secret put GEMINI_API_KEY --project-name ai-blog-gen-v2

# OpenAI API Key 설정
npx wrangler pages secret put OPENAI_API_KEY --project-name ai-blog-gen-v2
```

## API 키 발급 방법

### Claude API (Anthropic)
1. https://console.anthropic.com 방문
2. API Keys 메뉴에서 "Create Key" 클릭
3. `sk-ant-` 로 시작하는 키 복사

### Gemini API (Google)
1. https://aistudio.google.com/app/apikey 방문
2. "Create API Key" 클릭
3. 생성된 키 복사

### OpenAI API
1. https://platform.openai.com/api-keys 방문
2. "Create new secret key" 클릭
3. `sk-` 로 시작하는 키 복사

## 확인 방법

API 키 설정 후 다음 URL로 테스트:
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"mainKeyword":"테스트","apiKey":"your_claude_key"}' \
  https://ai-blog-gen-v2.pages.dev/api/generate-subkeywords
```

정상 동작 시 서브키워드 목록이 반환됩니다.

## 주의사항

⚠️ **보안 주의**: API 키는 절대 공개 저장소에 커밋하지 마세요
⚠️ **비용 관리**: 각 API는 사용량에 따라 과금되므로 모니터링 필요
⚠️ **키 관리**: 정기적으로 API 키를 갱신하여 보안 유지

## 지원

문제가 지속되면 다음을 확인하세요:
1. API 키 형식이 올바른지 확인
2. 해당 API 제공업체의 계정 상태 확인
3. 브라우저 콘솔에서 자세한 오류 메시지 확인