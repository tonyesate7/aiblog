# AI 블로그 생성기

## 프로젝트 개요
- **이름**: AI 블로그 생성기 v1.0
- **목표**: AI를 활용한 자동 블로그 콘텐츠 생성 도구
- **주요 기능**: 키워드 기반 블로그 글 자동 생성, 타겟 독자별 맞춤 콘텐츠 제작

## 🌐 URL
- **프로덕션**: https://5794d518.ai-blog-generator-v2.pages.dev
- **GitHub**: https://github.com/사용자명/webapp (배포 후 업데이트 예정)

## 📋 완성된 기능

### ✅ 기본 블로그 생성 기능
1. **키워드 입력 및 관리**
   - 메인 키워드 입력
   - AI 기반 서브 키워드 자동 생성 (10개)
   - 키워드별 체크박스 선택

2. **타겟 독자 맞춤화** (4단계)
   - 일반인: 친근하고 이해하기 쉬운 설명
   - 초보자: 단계별 자세한 가이드
   - 중급자: 실무 활용 중심 내용
   - 전문가: 깊이 있는 전문적 내용

3. **다중 AI 모델 지원**
   - Claude 3.5 Haiku
   - Gemini 1.5 Flash  
   - OpenAI GPT-4o-mini
   - 자동 데모 모드 (API 키 미설정 시)

4. **배치 글 생성**
   - 최대 10개 글 동시 생성
   - 실시간 진행 상황 표시
   - 키워드별 개별 글 생성

5. **콘텐츠 관리**
   - 생성된 글 미리보기
   - 개별 글 복사/다운로드
   - 전체 글 모음집 다운로드 (텍스트 형식)

## 🏗️ 기술 스택
- **Backend**: Hono Framework (Cloudflare Workers)
- **Frontend**: Vanilla JavaScript + Tailwind CSS
- **AI APIs**: Claude/Gemini/OpenAI REST APIs
- **배포**: Cloudflare Pages
- **언어**: TypeScript (백엔드), JavaScript (프론트엔드)

## 📊 API 엔드포인트
1. `GET /api/health` - 헬스 체크
2. `GET /api/keys/status` - API 키 상태 확인
3. `POST /api/generate/subkeywords` - 서브 키워드 생성
4. `POST /api/generate/blog` - 블로그 글 생성

## 🎯 사용 방법
1. **키워드 입력**: 메인 키워드를 입력합니다
2. **타겟 설정**: 독자 수준을 선택합니다 (일반인/초보자/중급자/전문가)
3. **서브키워드 생성**: AI가 관련 키워드 10개를 자동 생성합니다
4. **키워드 선택**: 글로 만들고 싶은 키워드들을 체크합니다
5. **생성 옵션**: 글 개수(1-10개)와 AI 모델을 선택합니다
6. **글 생성**: 선택한 키워드들로 블로그 글이 자동 생성됩니다
7. **결과 확인**: 생성된 글을 미리보고 다운로드합니다

## 🔧 개발 환경 설정

### 로컬 개발
```bash
# 의존성 설치
npm install

# 환경 변수 설정 (.dev.vars 파일)
CLAUDE_API_KEY=your_claude_key
GEMINI_API_KEY=your_gemini_key  
OPENAI_API_KEY=your_openai_key

# 개발 서버 시작
npm run build
npm run dev:sandbox
```

### 배포
```bash
# 프로덕션 빌드
npm run build

# Cloudflare Pages 배포
npm run deploy
```

## 📈 데모 모드
API 키가 설정되지 않은 경우, 자동으로 데모 모드로 전환되어 샘플 콘텐츠를 제공합니다:
- 샘플 서브키워드 생성
- 미리 작성된 고품질 예시 글 제공
- 모든 기능 정상 작동 보장

## 🚀 배포 상태
- **플랫폼**: Cloudflare Pages
- **상태**: ✅ 활성화
- **마지막 업데이트**: 2025-01-09
- **번들 크기**: ~40KB (최적화됨)

## 🔄 버전 히스토리
- **v1.0**: 기본 블로그 생성 기능 구현
  - 키워드 기반 콘텐츠 생성
  - 다중 AI 모델 지원
  - 타겟 독자별 맞춤화
  - 데모 모드 지원

## 📝 다음 개발 계획
1. PDF/Word 실제 파일 다운로드 지원
2. 사용자 계정 및 히스토리 관리
3. SEO 최적화 도구 추가
4. 이미지 자동 생성 및 삽입
5. 소셜미디어 공유 기능