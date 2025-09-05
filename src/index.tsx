import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  OPENAI_API_KEY?: string
  CLAUDE_API_KEY?: string
  GEMINI_API_KEY?: string
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS 설정
app.use('/api/*', cors())

// 정적 파일 서빙
app.use('/static/*', serveStatic({ root: './public' }))

// ==================== AI 모델 관리 시스템 ====================

interface AIModel {
  name: string
  endpoint: string
  headers: (apiKey: string) => Record<string, string>
  formatRequest: (prompt: string, options?: any) => any
  parseResponse: (response: any) => string
  maxRetries: number
  timeoutMs: number
}

// 지원하는 AI 모델들
const aiModels: Record<string, AIModel> = {
  claude: {
    name: 'Claude 3.5 Haiku',
    endpoint: 'https://api.anthropic.com/v1/messages',
    headers: (apiKey: string) => ({
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    }),
    formatRequest: (prompt: string, options = {}) => ({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: options.maxTokens || 3000,
      messages: [{ role: 'user', content: prompt }]
    }),
    parseResponse: (response: any) => response.content?.[0]?.text || '',
    maxRetries: 3,
    timeoutMs: 30000
  },
  
  gemini: {
    name: 'Gemini 1.5 Flash',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    headers: (apiKey: string) => ({
      'Content-Type': 'application/json'
    }),
    formatRequest: (prompt: string, options = {}) => ({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        maxOutputTokens: options.maxTokens || 3000,
        temperature: 0.7
      }
    }),
    parseResponse: (response: any) => response.candidates?.[0]?.content?.parts?.[0]?.text || '',
    maxRetries: 3,
    timeoutMs: 25000
  },

  openai: {
    name: 'GPT-4o-mini',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    headers: (apiKey: string) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }),
    formatRequest: (prompt: string, options = {}) => ({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: options.maxTokens || 3000,
      temperature: 0.7
    }),
    parseResponse: (response: any) => response.choices?.[0]?.message?.content || '',
    maxRetries: 3,
    timeoutMs: 30000
  }
}

// AI 요청 처리 함수
async function callAI(
  modelName: string, 
  prompt: string, 
  apiKeys: Record<string, string>, 
  options?: any
): Promise<string> {
  const model = aiModels[modelName]
  if (!model) {
    throw new Error(`지원하지 않는 모델: ${modelName}`)
  }

  const apiKey = apiKeys[modelName]
  if (!apiKey) {
    // 데모 모드: API 키가 없을 때 샘플 콘텐츠 반환
    console.log(`🎭 ${model.name} 데모 모드 활성화`)
    return generateDemoContent(modelName, prompt)
  }

  try {
    console.log(`🤖 ${model.name}로 요청 시작`)
    
    const requestBody = model.formatRequest(prompt, options)
    let url = model.endpoint
    
    // Gemini API는 URL에 API 키를 포함
    if (modelName === 'gemini') {
      url += `?key=${apiKey}`
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: model.headers(apiKey),
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ ${model.name} API 오류:`, response.status, errorText)
      throw new Error(`${model.name} API 오류: ${response.status}`)
    }

    const data = await response.json()
    const content = model.parseResponse(data)
    
    if (!content) {
      console.error(`❌ ${model.name} 응답 파싱 실패:`, data)
      throw new Error(`${model.name} 응답 파싱 실패`)
    }

    console.log(`✅ ${model.name} 응답 성공 (${content.length}자)`)
    return content

  } catch (error: any) {
    console.error(`❌ ${model.name} 호출 실패:`, error.message)
    // 오류 시 데모 콘텐츠 반환
    return generateDemoContent(modelName, prompt)
  }
}

// 데모 콘텐츠 생성 함수
function generateDemoContent(modelName: string, prompt: string): string {
  const demoArticles = [
    {
      title: "인공지능과 미래 사회",
      content: `
# 인공지능과 미래 사회

인공지능 기술의 급속한 발전은 우리 사회에 혁신적인 변화를 가져오고 있습니다.

## 주요 변화 영역

### 1. 업무 자동화
- 반복적인 업무의 자동화
- 새로운 직업군의 출현
- 인간과 AI의 협업 증대

### 2. 개인화된 서비스
- 맞춤형 추천 시스템
- 개인화된 교육 프로그램
- 정밀 의료 서비스

### 3. 창의적 작업 지원
- AI 기반 콘텐츠 생성
- 예술과 기술의 융합
- 새로운 창작 도구의 등장

## 미래 전망

인공지능은 단순히 인간을 대체하는 것이 아니라, 인간의 능력을 확장하고 보완하는 역할을 할 것입니다. 중요한 것은 이러한 변화에 능동적으로 적응하며, AI와 함께 성장하는 미래를 준비하는 것입니다.
      `
    },
    {
      title: "지속 가능한 환경을 위한 실천 방법",
      content: `
# 지속 가능한 환경을 위한 실천 방법

환경 보호는 더 이상 선택이 아닌 필수입니다. 일상 생활에서 실천할 수 있는 방법들을 알아보겠습니다.

## 개인 차원의 실천

### 1. 에너지 절약
- LED 전구 사용하기
- 전자기기 대기전력 차단
- 자연 채광 활용하기

### 2. 친환경 교통 이용
- 대중교통 이용하기
- 자전거 타기
- 전기차 고려하기

### 3. 폐기물 줄이기
- 일회용품 사용 줄이기
- 분리수거 철저히 하기
- 재활용품 활용하기

## 공동체 차원의 노력

### 1. 지역 환경 보호 활동
- 플로깅(쓰레기 줍기 조깅) 참여
- 지역 환경 단체 활동
- 환경 교육 프로그램 참여

### 2. 친환경 소비
- 로컬 푸드 구매
- 친환경 제품 선택
- 공유경제 활용

## 결론

작은 실천이 모여 큰 변화를 만듭니다. 지속 가능한 미래를 위해 오늘부터 시작해보세요.
      `
    },
    {
      title: "디지털 웰빙과 균형잡힌 삶",
      content: `
# 디지털 웰빙과 균형잡힌 삶

현대인의 삶에서 디지털 기기는 필수가 되었지만, 건강한 사용법을 익히는 것이 중요합니다.

## 디지털 피로의 원인

### 1. 과도한 스크린 시간
- 눈의 피로와 시력 저하
- 수면 패턴 교란
- 집중력 감소

### 2. 정보 과부하
- 끊임없는 알림과 메시지
- 소셜 미디어 중독
- FOMO(Fear of Missing Out) 현상

## 디지털 웰빙 실천법

### 1. 스크린 타임 관리
- 일정한 사용 시간 설정
- 취침 전 디지털 디톡스
- 20-20-20 규칙 적용 (20분마다 20초간 20피트 거리 보기)

### 2. 의식적인 사용
- 필요한 앱만 설치하기
- 알림 설정 최소화
- 오프라인 활동 시간 확보

### 3. 건강한 관계 유지
- 대면 소통 시간 늘리기
- 온라인과 오프라인 균형 맞추기
- 가족과 함께하는 디지털 프리 시간

## 마무리

디지털 기술은 도구일 뿐입니다. 우리가 기술을 통제하며 균형잡힌 삶을 살아가는 것이 중요합니다.
      `
    }
  ]

  const randomArticle = demoArticles[Math.floor(Math.random() * demoArticles.length)]
  return `# ${randomArticle.title}\n\n${randomArticle.content.trim()}`
}

// ==================== API 엔드포인트 ====================

// 헬스 체크
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0'
  })
})

// API 키 상태 확인
app.get('/api/keys/status', (c) => {
  const env = c.env
  
  const keyStatus = {
    claude: !!env.CLAUDE_API_KEY,
    gemini: !!env.GEMINI_API_KEY,
    openai: !!env.OPENAI_API_KEY
  }

  const availableModels = Object.entries(keyStatus)
    .filter(([_, hasKey]) => hasKey)
    .map(([model, _]) => model)

  return c.json({
    keys: keyStatus,
    availableModels,
    totalAvailable: availableModels.length,
    demoMode: availableModels.length === 0
  })
})

// 서브 키워드 생성
app.post('/api/generate/subkeywords', async (c) => {
  try {
    const { keyword } = await c.req.json()
    
    if (!keyword) {
      return c.json({ error: '키워드가 필요합니다.' }, 400)
    }

    const env = c.env
    const apiKeys = {
      claude: env.CLAUDE_API_KEY || '',
      gemini: env.GEMINI_API_KEY || '',
      openai: env.OPENAI_API_KEY || ''
    }

    const prompt = `
다음 키워드와 관련된 10개의 서브 키워드를 생성해주세요: "${keyword}"

요구사항:
- 각 키워드는 2-4단어로 구성
- 검색량이 높을만한 실용적인 키워드들
- 서로 다른 관점에서 접근
- 한국어로 작성

형식: 각 줄에 하나씩 나열 (번호 없이)
`

    // 사용 가능한 모델 중 첫 번째 선택 (우선순위: Claude > Gemini > OpenAI)
    let selectedModel = 'claude'
    if (!apiKeys.claude && apiKeys.gemini) selectedModel = 'gemini'
    else if (!apiKeys.claude && !apiKeys.gemini && apiKeys.openai) selectedModel = 'openai'

    const content = await callAI(selectedModel, prompt, apiKeys)
    
    // 키워드 파싱
    const subkeywords = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.match(/^[#\-\*\d]/))
      .slice(0, 10)

    return c.json({
      mainKeyword: keyword,
      subkeywords,
      model: selectedModel,
      demoMode: !apiKeys[selectedModel]
    })

  } catch (error: any) {
    console.error('서브키워드 생성 오류:', error)
    return c.json({ 
      error: '서브키워드 생성 중 오류가 발생했습니다.',
      details: error.message 
    }, 500)
  }
})

// 블로그 글 생성
app.post('/api/generate/blog', async (c) => {
  try {
    const { 
      keyword, 
      subkeywords = [], 
      targetAudience = '일반인',
      articleCount = 1,
      model = 'claude'
    } = await c.req.json()
    
    if (!keyword) {
      return c.json({ error: '키워드가 필요합니다.' }, 400)
    }

    const env = c.env
    const apiKeys = {
      claude: env.CLAUDE_API_KEY || '',
      gemini: env.GEMINI_API_KEY || '',
      openai: env.OPENAI_API_KEY || ''
    }

    // 타겟 독자별 글쓰기 스타일 설정
    const audienceStyles = {
      '일반인': {
        tone: '친근하고 이해하기 쉬운',
        complexity: '기본적인',
        examples: '일상생활 예시를 포함한'
      },
      '초보자': {
        tone: '차근차근 설명하는',
        complexity: '단계별로 자세한',
        examples: '구체적인 실습 예시가 포함된'
      },
      '중급자': {
        tone: '전문적이면서도 접근하기 쉬운',
        complexity: '심화된 내용을 포함한',
        examples: '실무 활용 사례가 담긴'
      },
      '전문가': {
        tone: '전문적이고 깊이 있는',
        complexity: '고급 개념과 이론을 다룬',
        examples: '최신 연구 결과와 트렌드를 반영한'
      }
    }

    const style = audienceStyles[targetAudience] || audienceStyles['일반인']
    
    const articles = []
    
    for (let i = 0; i < Math.min(articleCount, 10); i++) {
      const currentKeyword = subkeywords[i] || keyword
      
      const prompt = `
"${currentKeyword}"에 대한 블로그 글을 작성해주세요.

타겟 독자: ${targetAudience}
글 스타일: ${style.tone} 톤으로 ${style.complexity} 내용을 담은 ${style.examples} 글

요구사항:
1. 제목: SEO에 최적화된 매력적인 제목
2. 구조: 서론-본론(3-5개 섹션)-결론
3. 길이: 1500-2000자 내외
4. 마크다운 형식으로 작성
5. 실용적인 정보와 팁 포함
6. 읽기 쉬운 문단 구성

메인 키워드: ${keyword}
현재 키워드: ${currentKeyword}
관련 키워드들: ${subkeywords.join(', ')}
`

      try {
        console.log(`📝 ${i + 1}번째 글 생성 시작: ${currentKeyword}`)
        const content = await callAI(model, prompt, apiKeys)
        
        // 제목 추출
        const lines = content.split('\n')
        const titleLine = lines.find(line => line.startsWith('#'))
        const title = titleLine ? titleLine.replace(/^#+\s*/, '') : `${currentKeyword} 완전 가이드`
        
        articles.push({
          id: i + 1,
          title,
          keyword: currentKeyword,
          content: content.trim(),
          targetAudience,
          model,
          createdAt: new Date().toISOString(),
          wordCount: content.length,
          demoMode: !apiKeys[model]
        })
        
        console.log(`✅ ${i + 1}번째 글 생성 완료`)
        
      } catch (error: any) {
        console.error(`❌ ${i + 1}번째 글 생성 실패:`, error.message)
        
        // 오류 시 기본 콘텐츠 생성
        const fallbackContent = generateDemoContent(model, currentKeyword)
        articles.push({
          id: i + 1,
          title: `${currentKeyword} 가이드`,
          keyword: currentKeyword,
          content: fallbackContent,
          targetAudience,
          model: 'demo',
          createdAt: new Date().toISOString(),
          wordCount: fallbackContent.length,
          demoMode: true,
          error: '생성 중 오류 발생, 샘플 콘텐츠로 대체됨'
        })
      }
    }

    return c.json({
      success: true,
      articles,
      totalGenerated: articles.length,
      keyword,
      targetAudience,
      model,
      demoMode: !apiKeys[model]
    })

  } catch (error: any) {
    console.error('블로그 생성 오류:', error)
    return c.json({ 
      error: '블로그 글 생성 중 오류가 발생했습니다.',
      details: error.message 
    }, 500)
  }
})

// 메인 페이지
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI 블로그 생성기</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script>
            tailwind.config = {
                theme: {
                    extend: {
                        colors: {
                            primary: '#3B82F6',
                            secondary: '#10B981'
                        }
                    }
                }
            }
        </script>
    </head>
    <body class="bg-gray-50 font-sans">
        <div class="min-h-screen">
            <!-- 헤더 -->
            <header class="bg-white shadow-sm border-b">
                <div class="max-w-6xl mx-auto px-4 py-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <div class="bg-gradient-to-r from-blue-600 to-emerald-600 p-2 rounded-lg">
                                <i class="fas fa-robot text-white text-xl"></i>
                            </div>
                            <div>
                                <h1 class="text-2xl font-bold text-gray-800">AI 블로그 생성기</h1>
                                <p class="text-sm text-gray-600">스마트한 콘텐츠 제작 도구</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-4">
                            <div id="apiStatus" class="flex items-center space-x-2 text-sm">
                                <div class="flex items-center space-x-1">
                                    <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
                                    <span class="text-gray-600">API 상태 확인 중...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <!-- 메인 콘텐츠 -->
            <main class="max-w-6xl mx-auto px-4 py-8">
                <!-- 키워드 입력 섹션 -->
                <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div class="flex items-center space-x-3 mb-6">
                        <div class="bg-blue-100 p-2 rounded-lg">
                            <i class="fas fa-search text-blue-600"></i>
                        </div>
                        <h2 class="text-xl font-bold text-gray-800">키워드 설정</h2>
                    </div>

                    <div class="grid md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fas fa-key mr-2"></i>메인 키워드
                            </label>
                            <input 
                                type="text" 
                                id="mainKeyword" 
                                placeholder="예: 인공지능, 블로그 마케팅, 요리 레시피"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                            <p class="text-xs text-gray-500 mt-1">블로그 주제가 될 핵심 키워드를 입력하세요</p>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fas fa-users mr-2"></i>타겟 독자
                            </label>
                            <select id="targetAudience" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                <option value="일반인">일반인 - 쉽고 친근한 설명</option>
                                <option value="초보자">초보자 - 단계별 자세한 가이드</option>
                                <option value="중급자">중급자 - 실무 활용 중심</option>
                                <option value="전문가">전문가 - 깊이 있는 전문 내용</option>
                            </select>
                        </div>
                    </div>

                    <div class="flex flex-wrap gap-3 mt-6">
                        <button id="generateSubKeywords" class="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2">
                            <i class="fas fa-lightbulb"></i>
                            <span>서브 키워드 생성</span>
                        </button>
                    </div>
                </div>

                <!-- 서브 키워드 표시 -->
                <div id="subKeywordsSection" class="bg-white rounded-xl shadow-lg p-6 mb-8 hidden">
                    <div class="flex items-center space-x-3 mb-4">
                        <div class="bg-emerald-100 p-2 rounded-lg">
                            <i class="fas fa-tags text-emerald-600"></i>
                        </div>
                        <h3 class="text-lg font-bold text-gray-800">생성된 서브 키워드</h3>
                    </div>
                    <div id="subKeywordsList" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
                        <!-- 서브키워드들이 여기에 표시됩니다 -->
                    </div>
                    <p class="text-sm text-gray-600 mb-4">체크된 키워드들로 블로그 글이 생성됩니다. (최대 10개)</p>
                    
                    <div class="flex flex-wrap gap-3">
                        <div class="flex items-center space-x-3">
                            <label class="text-sm font-medium text-gray-700">글 개수:</label>
                            <input type="number" id="articleCount" value="3" min="1" max="10" class="w-20 px-3 py-2 border rounded-lg">
                        </div>
                        <div class="flex items-center space-x-3">
                            <label class="text-sm font-medium text-gray-700">AI 모델:</label>
                            <select id="aiModel" class="px-3 py-2 border rounded-lg">
                                <option value="claude">Claude 3.5 Haiku</option>
                                <option value="gemini">Gemini 1.5 Flash</option>
                                <option value="openai">GPT-4o-mini</option>
                            </select>
                        </div>
                        <button id="startGeneration" class="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2">
                            <i class="fas fa-play"></i>
                            <span>블로그 생성 시작</span>
                        </button>
                    </div>
                </div>

                <!-- 진행 상황 -->
                <div id="progressSection" class="bg-white rounded-xl shadow-lg p-6 mb-8 hidden">
                    <div class="flex items-center space-x-3 mb-4">
                        <div class="bg-purple-100 p-2 rounded-lg">
                            <i class="fas fa-cogs text-purple-600"></i>
                        </div>
                        <h3 class="text-lg font-bold text-gray-800">생성 진행 상황</h3>
                    </div>
                    
                    <div class="mb-4">
                        <div class="flex justify-between items-center mb-2">
                            <span id="progressText" class="text-sm font-medium text-gray-700">준비 중...</span>
                            <span id="progressPercent" class="text-sm text-gray-500">0%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-3">
                            <div id="progressBar" class="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-500" style="width: 0%"></div>
                        </div>
                    </div>
                    
                    <div id="progressDetails" class="text-sm text-gray-600">
                        <!-- 상세 진행 상황이 여기에 표시됩니다 -->
                    </div>
                </div>

                <!-- 생성된 글 목록 -->
                <div id="resultsSection" class="hidden">
                    <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <div class="flex items-center justify-between mb-6">
                            <div class="flex items-center space-x-3">
                                <div class="bg-green-100 p-2 rounded-lg">
                                    <i class="fas fa-check-circle text-green-600"></i>
                                </div>
                                <h3 class="text-xl font-bold text-gray-800">생성 완료</h3>
                            </div>
                            <div class="flex space-x-3">
                                <button id="downloadPDF" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                                    <i class="fas fa-file-pdf"></i>
                                    <span>PDF 다운로드</span>
                                </button>
                                <button id="downloadWord" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                                    <i class="fas fa-file-word"></i>
                                    <span>Word 다운로드</span>
                                </button>
                            </div>
                        </div>
                        
                        <div id="articlesList">
                            <!-- 생성된 글들이 여기에 표시됩니다 -->
                        </div>
                    </div>
                </div>
            </main>
        </div>

        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app