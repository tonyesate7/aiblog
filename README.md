# AI 블로그 자동 생성기

## 프로젝트 개요
- **이름**: AI 블로그 자동 생성기 (AI Blog Generator)
- **목표**: OpenAI GPT를 활용하여 키워드 기반 블로그 콘텐츠를 자동으로 생성하는 웹 애플리케이션
- **주요 기능**: 
  - 메인 키워드 입력 시 자동 서브키워드 생성
  - 10개 블로그 글 동시 생성
  - 실시간 진행률 표시
  - PDF/Word 문서 다운로드
  - 키워드 편집 및 설정 관리

## 현재 완료된 기능 ✅
1. **키워드 입력 및 설정**
   - 메인 키워드 입력
   - 글 스타일 선택 (정보성, 리뷰, 가이드, 뉴스, 튜토리얼)
   - 글 길이 설정 (1000-3000자)
   - 타겟 독자층 선택 (일반인, 초보자, 중급자, 전문가)

2. **AI 서브키워드 자동 생성**
   - OpenAI API 연동
   - 메인 키워드 기반 10개 서브키워드 자동 생성
   - 키워드 클릭 편집 기능

3. **AI 블로그 글 생성**
   - 10개 글 순차 생성
   - 실시간 진행률 표시
   - 마크다운 형식 컨텐츠 생성
   - SEO 최적화된 제목 및 내용

4. **문서 내보내기**
   - PDF 다운로드 (jsPDF 사용)
   - Word 문서 다운로드 (html-docx 사용)
   - 마크다운 HTML 변환

5. **설정 관리**
   - OpenAI API 키 설정 및 저장
   - 로컬 스토리지 기반 설정 관리

## 기능 API 엔드포인트

### 공개 URL
- **개발 서버**: https://3000-irjw24nhumrh4fh4yovkl-6532622b.e2b.dev
- **상태 확인**: https://3000-irjw24nhumrh4fh4yovkl-6532622b.e2b.dev/api/health

### API 라우트
1. **GET /api/health**
   - 서비스 상태 확인
   - 응답: `{ "status": "ok", "message": "Blog Generator API is running" }`

2. **POST /api/generate-subkeywords**
   - 메인 키워드 기반 서브키워드 생성
   - 요청: `{ "mainKeyword": "여행", "apiKey": "sk-..." }`
   - 응답: `{ "success": true, "keywords": [{"id": 1, "keyword": "여행 준비", "editable": true}, ...] }`

3. **POST /api/generate-article**
   - 개별 블로그 글 생성
   - 요청: `{ "keyword": "여행 준비", "mainKeyword": "여행", "contentStyle": "guide", "contentLength": "2000", "targetAudience": "beginner", "apiKey": "sk-..." }`
   - 응답: `{ "success": true, "article": { "title": "...", "content": "...", "wordCount": 2000, "createdAt": "..." } }`

## 기술 스택 및 아키텍처

### 백엔드 (Cloudflare Workers)
- **Hono**: 경량 웹 프레임워크
- **OpenAI API**: GPT-3.5-turbo를 통한 콘텐츠 생성
- **TypeScript**: 타입 안전성

### 프론트엔드
- **Vanilla JavaScript**: 클래스 기반 구조
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **Font Awesome**: 아이콘
- **Axios**: HTTP 클라이언트

### 문서 생성 라이브러리
- **jsPDF**: PDF 생성
- **html-docx**: Word 문서 생성

### 배포 및 개발 환경
- **Cloudflare Pages**: 호스팅 플랫폼
- **Vite**: 빌드 도구
- **Wrangler**: Cloudflare CLI
- **PM2**: 개발 서버 관리

## 사용자 가이드

### 1. 기본 사용법
1. **설정**: 우상단 설정 버튼을 클릭하여 OpenAI API 키를 입력
2. **키워드 입력**: 메인 키워드를 입력하고 글 설정을 조정
3. **서브키워드 생성**: "서브 키워드 자동 생성" 버튼 클릭
4. **키워드 편집**: 생성된 키워드를 클릭하여 수정 가능
5. **글 생성**: "블로그 글 생성 시작" 버튼으로 10개 글 생성
6. **문서 다운로드**: 완료 후 PDF 또는 Word 형태로 다운로드

### 2. OpenAI API 키 설정
1. OpenAI 홈페이지에서 API 키 발급
2. 애플리케이션 설정에서 API 키 입력
3. 브라우저 로컬 스토리지에 안전하게 저장

### 3. 생성 옵션 설정
- **글 스타일**: 콘텐츠의 톤앤매너 결정
- **글 길이**: 생성될 콘텐츠의 대략적인 분량
- **타겟 독자**: 독자 수준에 맞는 콘텐츠 생성

## 개발 및 배포

### 로컬 개발
```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev

# 빌드
npm run build

# 샌드박스 개발 (PM2)
npm run build
pm2 start ecosystem.config.cjs
```

### Cloudflare Pages 배포
```bash
# 빌드 및 배포
npm run deploy:prod

# 프로젝트 이름: blog-generator
wrangler pages deploy dist --project-name blog-generator
```

## 프로젝트 구조
```
blog-generator/
├── src/
│   └── index.tsx              # 메인 Hono 애플리케이션
├── public/
│   └── static/
│       └── app.js             # 클라이언트 JavaScript
├── dist/                      # 빌드 결과물
├── ecosystem.config.cjs       # PM2 설정
├── package.json              # 의존성 및 스크립트
├── wrangler.jsonc            # Cloudflare 설정
├── vite.config.ts            # Vite 빌드 설정
└── README.md                 # 프로젝트 문서

```

## 향후 개선 계획

### 우선순위 높음
1. **에러 핸들링 강화**: API 호출 실패 시 재시도 로직
2. **사용자 경험 개선**: 로딩 애니메이션 및 피드백 향상
3. **키워드 품질 개선**: 더 정교한 키워드 생성 알고리즘

### 우선순위 중간
1. **템플릿 시스템**: 업종별 맞춤 템플릿 제공
2. **글 편집 기능**: 생성된 글의 개별 편집 기능
3. **다양한 AI 모델**: Claude, Gemini 등 추가 모델 지원

### 우선순위 낮음
1. **사용자 계정**: 회원가입 및 글 저장 기능
2. **협업 기능**: 팀 단위 글 생성 관리
3. **SEO 분석**: 키워드 난이도 및 검색 볼륨 분석

## 배포 상태
- **플랫폼**: Cloudflare Pages
- **상태**: ✅ 활성화
- **마지막 업데이트**: 2025-08-31
- **버전**: 1.0.0

---
**개발자**: Blog Generator Team  
**라이센스**: MIT  
**문의**: developer@webapp.com