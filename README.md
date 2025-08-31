# AI 블로그 자동 생성기

## 프로젝트 개요
- **이름**: AI 블로그 자동 생성기 (AI Blog Generator)
- **목표**: Claude AI를 활용하여 키워드 기반 블로그 콘텐츠를 자동으로 생성하는 웹 애플리케이션
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
   - Claude API 연동
   - 메인 키워드 기반 10개 서브키워드 자동 생성
   - 키워드 클릭 편집 기능

3. **AI 블로그 글 생성**
   - 10개 글 순차 생성
   - 실시간 진행률 표시
   - 마크다운 형식 컨텐츠 생성
   - SEO 최적화된 제목 및 내용

4. **🔥 실시간 편집 기능 (NEW!)**
   - **개별 글 편집**: 각 글의 제목, 내용 실시간 수정
   - **3가지 편집 모드**: 편집 전용, 미리보기, 분할 보기
   - **마크다운 지원**: Marked.js 기반 실시간 렌더링  
   - **편집 도구**: 굵게, 기울임, 제목 등 마크다운 삽입
   - **자동 저장**: 1초 디바운싱으로 임시 저장
   - **변경사항 표시**: 수정된 글 시각적 구분
   - **글 관리**: 복제, 삭제, 프로젝트 저장/복원

5. **고급 문서 내보내기**
   - **전문 Word 문서**: 표지, 목차, 스타일링 포함 완성형 문서
   - **개별 파일 ZIP**: 각 글을 Word(.docx) + 마크다운(.md)으로 개별 저장
   - **마크다운 통합본**: 전체 글을 하나의 .md 파일로 통합
   - **PDF 다운로드**: 기본 PDF 형태 (jsPDF 사용)

6. **🎯 SEO 분석 도구 (NEW!)**
   - **종합 SEO 점수**: 키워드, 가독성, 구조, 제목의 통합 점수
   - **키워드 밀도 분석**: 메인/서브 키워드 사용 빈도 및 최적화 제안
   - **제목 최적화**: 길이, 키워드 포함 여부, 구조 분석
   - **가독성 점수**: 문장 길이, 복잡도, Flesch 가독성 지수
   - **구조 분석**: 헤딩 구조, 목록 사용, 강조 표시 분석
   - **실시간 업데이트**: 편집 시 SEO 점수 자동 갱신
   - **개선 제안**: 구체적인 SEO 최적화 가이드 제공

7. **데이터 관리**
   - **자동 백업**: 로컬 스토리지 기반 자동 저장
   - **프로젝트 저장**: JSON 파일로 프로젝트 내보내기
   - **세션 복원**: 브라우저 재시작 시 이전 작업 복원
   - **설정 관리**: Claude API 키 및 사용자 설정 저장

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
- **Claude API**: Claude 3.5 Haiku를 통한 콘텐츠 생성
- **TypeScript**: 타입 안전성

### 프론트엔드
- **Vanilla JavaScript**: 클래스 기반 구조
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **Font Awesome**: 아이콘
- **Axios**: HTTP 클라이언트

### 문서 생성 및 편집 라이브러리
- **jsPDF**: PDF 생성
- **html-docx**: 전문 Word 문서 생성
- **JSZip**: ZIP 아카이브 생성
- **Marked.js**: 마크다운 → HTML 실시간 변환

### 배포 및 개발 환경
- **Cloudflare Pages**: 호스팅 플랫폼
- **Vite**: 빌드 도구
- **Wrangler**: Cloudflare CLI
- **PM2**: 개발 서버 관리

## 사용자 가이드

### 1. 기본 사용법
1. **설정**: 우상단 설정 버튼을 클릭하여 Claude API 키를 입력
2. **키워드 입력**: 메인 키워드를 입력하고 글 설정을 조정
3. **서브키워드 생성**: "서브 키워드 자동 생성" 버튼 클릭
4. **키워드 편집**: 생성된 키워드를 클릭하여 수정 가능
5. **글 생성**: "블로그 글 생성 시작" 버튼으로 10개 글 생성
6. **실시간 편집**: 생성된 글을 클릭하여 편집
   - **편집 모드**: 마크다운 에디터로 직접 수정
   - **미리보기**: 실시간 HTML 렌더링 확인
   - **분할 보기**: 편집과 미리보기 동시 표시
   - **자동 저장**: 변경사항 실시간 저장

7. **SEO 최적화**: 자동 SEO 분석 및 개선 제안
   - **종합 점수**: 0-100점 SEO 최적화 수준 표시
   - **세부 분석**: 키워드, 제목, 가독성, 구조별 상세 점수  
   - **개선 제안**: 구체적인 최적화 방법 안내
   - **실시간 반영**: 편집 시 즉시 재분석

8. **문서 선택**: 4가지 다운로드 형식 중 선택
   - **전체 Word 문서**: 표지, 목차 포함 전문 문서
   - **개별 파일 (ZIP)**: 각 글을 Word + 마크다운으로 개별 저장
   - **Markdown**: 전체 통합 마크다운 파일
   - **PDF**: 기본 PDF 형태

### 2. Claude API 키 설정
1. https://console.anthropic.com 에서 API 키 발급 (신규 $5 크레딧 제공)
2. 애플리케이션 설정에서 API 키 입력 (sk-ant-로 시작)
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
1. **이미지 자동 삽입**: Unsplash API 연동으로 키워드 기반 이미지 추가
2. **템플릿 시스템**: 업종별 맞춤 프롬프트 및 구조 제공  
3. **키워드 검색량 분석**: Google Trends API 연동

### 우선순위 중간  
1. **다양한 AI 모델**: GPT-4, Gemini 등 추가 모델 지원
2. **소셜 미디어 연동**: 블로그 플랫폼 직접 발행 기능
3. **협업 기능**: 팀 단위 프로젝트 관리

### 우선순위 낮음
1. **사용자 계정**: 회원가입 및 클라우드 동기화
2. **고급 SEO**: 백링크 분석, 경쟁사 분석  
3. **다국어 지원**: 영어, 일본어, 중국어 콘텐츠 생성

## 배포 상태
- **플랫폼**: Cloudflare Pages
- **상태**: ✅ 활성화
- **마지막 업데이트**: 2025-08-31
- **버전**: 1.0.0

---
**개발자**: Blog Generator Team  
**라이센스**: MIT  
**문의**: developer@webapp.com