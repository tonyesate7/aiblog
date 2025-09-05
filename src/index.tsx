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
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-002:generateContent',
    headers: (apiKey: string) => ({
      'content-type': 'application/json'
    }),
    formatRequest: (prompt: string, options = {}) => ({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: options.maxTokens || 3000,
        temperature: 0.7
      }
    }),
    parseResponse: (response: any) => response.candidates?.[0]?.content?.parts?.[0]?.text || '',
    maxRetries: 3,
    timeoutMs: 30000
  },
  
  openai: {
    name: 'GPT-4o-mini',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    headers: (apiKey: string) => ({
      'authorization': `Bearer ${apiKey}`,
      'content-type': 'application/json'
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

// AI API 호출 함수
async function callAI(model: string, prompt: string, apiKey: string, options: any = {}): Promise<string> {
  const aiModel = aiModels[model]
  if (!aiModel) {
    throw new Error(`지원하지 않는 AI 모델: ${model}`)
  }

  const url = model === 'gemini' ? `${aiModel.endpoint}?key=${apiKey}` : aiModel.endpoint
  const headers = aiModel.headers(apiKey)
  const body = aiModel.formatRequest(prompt, options)

  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= aiModel.maxRetries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), aiModel.timeoutMs)
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API 호출 실패 (${response.status}): ${errorText}`)
      }
      
      const result = await response.json()
      const content = aiModel.parseResponse(result)
      
      if (!content) {
        throw new Error('AI 응답이 비어있습니다')
      }
      
      return content
      
    } catch (error) {
      lastError = error as Error
      console.error(`AI 호출 시도 ${attempt}/${aiModel.maxRetries} 실패:`, error)
      
      if (attempt < aiModel.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
  }
  
  throw lastError || new Error('AI 호출에 실패했습니다')
}

// 데모 콘텐츠 생성 함수 (API 키가 없을 때)
function generateDemoContent(topic: string, audience: string, tone: string): string {
  const demoArticles = {
    '일반인': `# ${topic}에 대해 알아보기

안녕하세요! 오늘은 **${topic}**에 대해 쉽게 알아보는 시간을 가져보겠습니다.

## ${topic}란 무엇인가요?

${topic}는 일상생활에서 자주 접할 수 있는 개념입니다. 복잡해 보일 수 있지만, 실제로는 우리 주변에서 쉽게 찾아볼 수 있는 것들과 관련이 있어요.

## 왜 중요할까요?

${topic}를 이해하면 다음과 같은 장점이 있습니다:

- 💡 **더 나은 이해**: 관련 개념들을 더 쉽게 파악할 수 있어요
- 🚀 **실용적 활용**: 일상에서 직접 적용해볼 수 있습니다
- 🎯 **문제 해결**: 관련 문제를 더 효과적으로 해결할 수 있어요

## 마무리

${topic}에 대해 기본적인 내용을 살펴보았습니다. 더 자세한 내용은 관련 자료를 찾아보시기 바랍니다!

*이 글이 도움이 되셨다면 공유해주세요! 📤*`,

    '초보자': `# ${topic} 초보자 가이드

${topic}에 처음 입문하시는 분들을 위한 상세한 가이드입니다.

## 🔰 시작하기 전에

${topic}를 처음 접하는 분들이 알아두면 좋은 기본 개념들을 정리해보겠습니다.

### 기본 용어 정리
- **핵심 개념 1**: ${topic}의 가장 기본이 되는 요소
- **핵심 개념 2**: 실제 적용 시 중요한 포인트
- **핵심 개념 3**: 초보자가 자주 놓치는 부분

## 📚 단계별 학습 방법

### 1단계: 기초 이해
${topic}의 기본 원리를 파악하세요. 복잡한 이론보다는 실용적인 관점에서 접근하는 것이 좋습니다.

### 2단계: 실습 해보기
작은 예제부터 시작해서 점진적으로 난이도를 높여나가세요.

### 3단계: 응용 학습
기본기가 탄탄해지면 다양한 상황에 적용해보세요.

## ⚠️ 주의사항

초보자들이 자주 실수하는 부분들을 미리 알아두시면 도움이 됩니다:

1. 기초를 건너뛰고 고급 내용으로 바로 넘어가지 마세요
2. 이론만 공부하지 말고 실습을 병행하세요
3. 막힐 때는 주저하지 말고 도움을 요청하세요

## 🎯 다음 단계

이제 ${topic}의 기초를 익혔다면, 중급 수준의 내용도 도전해보세요!`,

    '중급자': `# ${topic} 중급 활용법

기본 개념을 익힌 중급자를 위한 심화 내용입니다.

## 🎯 중급자를 위한 핵심 포인트

이미 ${topic}의 기초를 알고 계신 분들을 위해, 더 효과적인 활용 방법을 제시하겠습니다.

### 고급 기법들

#### 1. 최적화 전략
- **성능 향상**: 기존 방법보다 30% 더 효율적인 접근법
- **리소스 관리**: 제한된 자원으로 최대 효과를 내는 방법
- **확장성 고려**: 미래 변화에 대비한 설계 방법

#### 2. 실전 응용 사례
실제 프로젝트에서 ${topic}를 어떻게 활용할 수 있는지 구체적인 예시를 들어보겠습니다.

**사례 1: 복합적 문제 해결**
- 문제 상황: 다양한 변수가 얽힌 복잡한 상황
- 해결 과정: ${topic}의 핵심 원리를 단계적으로 적용
- 결과 분석: 기대 효과와 실제 결과의 비교

**사례 2: 효율성 개선**
- 기존 방식의 한계점 분석
- ${topic}를 활용한 개선 방안
- 측정 가능한 성과 지표

### 🔍 트러블슈팅

중급자 수준에서 자주 마주치는 문제들과 해결 방법:

1. **성능 병목 현상**: 원인 분석과 해결 방안
2. **확장성 문제**: 스케일링 시 고려해야 할 요소들
3. **호환성 이슈**: 다른 시스템과의 연동 시 주의점

## 📈 전문가로 가는 길

중급에서 전문가 수준으로 발전하기 위한 로드맵을 제시합니다.`,

    '전문가': `# ${topic} 전문가 관점에서의 심층 분석

${topic} 분야의 전문가를 위한 고급 분석과 인사이트를 제공합니다.

## 🎯 전문가급 핵심 인사이트

### 최신 동향 및 발전 방향

${topic} 분야는 현재 다음과 같은 방향으로 발전하고 있습니다:

#### 1. 기술적 혁신
- **혁신 동력**: 최신 기술 트렌드가 ${topic}에 미치는 영향
- **패러다임 변화**: 기존 접근법의 한계와 새로운 대안
- **미래 전망**: 향후 5-10년간 예상되는 변화

#### 2. 산업 생태계 분석
- **시장 동향**: 주요 플레이어들의 전략 분석
- **경쟁 구도**: 기술적 우위와 시장 점유율 변화
- **투자 동향**: VC 및 기업 투자 패턴 분석

### 🔬 심층 기술 분석

#### 아키텍처 설계 원칙
**핵심 설계 철학:**
- 확장성(Scalability): 대용량 데이터 처리 능력
- 안정성(Reliability): 99.9% 이상의 가용성 보장
- 성능(Performance): 지연시간 최소화 및 처리량 최적화

#### 성능 최적화 전략
전문가 수준에서 고려해야 할 성능 최적화 요소들:

1. **알고리즘 복잡도 최적화**
   - 시간 복잡도: O(n log n) → O(n) 개선 사례
   - 공간 복잡도: 메모리 사용량 50% 절감 기법

2. **시스템 레벨 최적화**
   - 캐싱 전략: 다층 캐시 구조 설계
   - 병렬 처리: 멀티스레딩 및 분산 처리 패턴

### 📊 데이터 기반 의사결정

#### KPI 및 메트릭 설계
${topic} 프로젝트의 성공을 측정하기 위한 핵심 지표:

- **정량적 지표**: 처리량, 응답시간, 에러율
- **정성적 지표**: 사용자 만족도, 시스템 안정성
- **비즈니스 지표**: ROI, 시장 점유율, 고객 유지율

#### A/B 테스트 설계
- **가설 설정**: 통계적으로 유의미한 가설 수립
- **실험 설계**: 편향을 최소화하는 실험 구조
- **결과 해석**: 통계적 유의성과 실용적 의미 구분

### 🚀 차세대 기술 전망

전문가로서 주목해야 할 신기술들:

1. **인공지능 융합**: ${topic}과 AI/ML의 시너지 효과
2. **블록체인 응용**: 탈중앙화 패러다임의 적용 가능성
3. **양자 컴퓨팅**: 기존 한계를 뛰어넘는 새로운 가능성

## 🎯 리더십과 전략적 사고

### 기술 리더십
- **팀 빌딩**: 고성능 개발팀 구성 전략
- **기술 의사결정**: 트레이드오프 분석과 최적 선택
- **지식 전파**: 조직 내 기술 역량 향상 방안

### 전략적 로드맵
${topic} 분야에서 지속적인 경쟁 우위를 유지하기 위한 장기 전략을 수립해보겠습니다.

이러한 전문가급 관점에서의 분석이 업계 발전과 개인 성장에 도움이 되기를 바랍니다.`
  }

  return demoArticles[audience as keyof typeof demoArticles] || demoArticles['일반인']
}

// ==================== API 엔드포인트 ====================

// 헬스 체크
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '2.0'
  })
})

// API 키 상태 확인
app.get('/api/keys/status', (c) => {
  const { env } = c
  
  return c.json({
    claude: !!env.CLAUDE_API_KEY,
    gemini: !!env.GEMINI_API_KEY,
    openai: !!env.OPENAI_API_KEY
  })
})

// 블로그 글 생성
app.post('/api/generate', async (c) => {
  try {
    const { topic, audience, tone, aiModel, apiKey } = await c.req.json()
    
    if (!topic || !audience || !tone || !aiModel) {
      return c.json({ error: '필수 필드가 누락되었습니다' }, 400)
    }

    // API 키 가져오기 (환경변수 우선, 없으면 클라이언트에서 전달받은 키 사용)
    const { env } = c
    let finalApiKey = ''
    
    if (aiModel === 'claude') {
      finalApiKey = env.CLAUDE_API_KEY || apiKey
    } else if (aiModel === 'gemini') {
      finalApiKey = env.GEMINI_API_KEY || apiKey
    } else if (aiModel === 'openai') {
      finalApiKey = env.OPENAI_API_KEY || apiKey
    }

    // API 키가 없으면 데모 콘텐츠 생성
    if (!finalApiKey) {
      const demoContent = generateDemoContent(topic, audience, tone)
      return c.json({
        content: demoContent,
        model: `${aiModel} (데모 모드)`,
        isDemo: true,
        message: 'API 키가 설정되지 않아 데모 콘텐츠를 생성했습니다.'
      })
    }

    // 프롬프트 생성
    const audienceMap = {
      '일반인': '전문 지식이 없는 일반인도 쉽게 이해할 수 있도록',
      '초보자': '해당 분야에 처음 입문하는 초보자가 체계적으로 학습할 수 있도록',
      '중급자': '기본 지식을 갖춘 중급자가 심화 학습할 수 있도록',
      '전문가': '해당 분야 전문가 수준의 깊이 있는 내용으로'
    }

    const toneMap = {
      '친근한': '친근하고 대화하듯이',
      '전문적': '전문적이고 객관적으로',
      '유머러스': '유머를 섞어 재미있게',
      '진지한': '진지하고 신중하게'
    }

    const prompt = `다음 주제로 ${audienceMap[audience as keyof typeof audienceMap]} ${toneMap[tone as keyof typeof toneMap]} 블로그 글을 작성해주세요.

주제: ${topic}
대상 독자: ${audience}
글의 톤: ${tone}

요구사항:
1. 마크다운 형식으로 작성
2. 적절한 제목과 소제목 사용
3. 읽기 쉽고 이해하기 쉬운 구조
4. ${audience} 수준에 맞는 내용 깊이
5. ${tone} 톤에 맞는 문체
6. 한국어로 작성
7. 2000-3000자 정도의 분량

블로그 글:`

    // AI 모델 호출
    const content = await callAI(aiModel, prompt, finalApiKey)
    
    return c.json({
      content,
      model: aiModels[aiModel].name,
      isDemo: false
    })

  } catch (error: any) {
    console.error('블로그 생성 오류:', error)
    
    // 에러 시 데모 콘텐츠 반환
    const { topic, audience } = await c.req.json().catch(() => ({ topic: '일반적인 주제', audience: '일반인' }))
    const demoContent = generateDemoContent(topic, audience, '친근한')
    
    return c.json({
      content: demoContent,
      model: '데모 모드',
      isDemo: true,
      message: `API 호출 중 오류가 발생하여 데모 콘텐츠를 생성했습니다. (${error.message})`
    })
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
        <link href="/static/styles.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50 min-h-screen">
        <div class="container mx-auto px-4 py-8">
            <!-- 헤더 -->
            <div class="text-center mb-12">
                <h1 class="text-4xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-robot mr-3 text-blue-600"></i>
                    AI 블로그 생성기
                </h1>
                <p class="text-xl text-gray-600">
                    AI의 힘으로 고품질 블로그 콘텐츠를 손쉽게 생성하세요
                </p>
                <div class="mt-4 flex justify-center space-x-4 text-sm text-gray-500">
                    <span><i class="fas fa-check text-green-500 mr-1"></i>3개의 AI 모델 지원</span>
                    <span><i class="fas fa-check text-green-500 mr-1"></i>4단계 난이도 조절</span>
                    <span><i class="fas fa-check text-green-500 mr-1"></i>다양한 톤 지원</span>
                </div>
            </div>

            <!-- 메인 콘텐츠 -->
            <div class="max-w-4xl mx-auto">
                <!-- 블로그 생성 폼 -->
                <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">
                        <i class="fas fa-edit mr-2 text-blue-600"></i>
                        블로그 글 생성
                    </h2>
                    
                    <form id="blogForm" class="space-y-6">
                        <!-- 주제 입력 -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fas fa-lightbulb mr-2 text-yellow-500"></i>
                                주제
                            </label>
                            <input 
                                type="text" 
                                id="topic" 
                                placeholder="예: 인공지능의 미래, 건강한 식습관, 투자 초보자 가이드"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                        </div>

                        <!-- 옵션들 -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <!-- 대상 독자 -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    <i class="fas fa-users mr-2 text-green-500"></i>
                                    대상 독자
                                </label>
                                <select id="audience" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <option value="일반인">일반인 (쉽게)</option>
                                    <option value="초보자">초보자 (체계적으로)</option>
                                    <option value="중급자">중급자 (심화)</option>
                                    <option value="전문가">전문가 (전문적으로)</option>
                                </select>
                            </div>

                            <!-- 글의 톤 -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    <i class="fas fa-palette mr-2 text-purple-500"></i>
                                    글의 톤
                                </label>
                                <select id="tone" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <option value="친근한">친근한</option>
                                    <option value="전문적">전문적</option>
                                    <option value="유머러스">유머러스</option>
                                    <option value="진지한">진지한</option>
                                </select>
                            </div>

                            <!-- AI 모델 -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    <i class="fas fa-brain mr-2 text-red-500"></i>
                                    AI 모델
                                </label>
                                <select id="aiModel" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <option value="claude">Claude 3.5 Haiku</option>
                                    <option value="gemini">Gemini 1.5 Flash</option>
                                    <option value="openai">GPT-4o-mini</option>
                                </select>
                            </div>
                        </div>

                        <!-- API 키 설정 섹션 -->
                        <div class="bg-blue-50 p-4 rounded-lg">
                            <div class="flex items-center justify-between mb-3">
                                <h3 class="text-lg font-medium text-gray-800">
                                    <i class="fas fa-key mr-2 text-blue-600"></i>
                                    API 키 설정
                                </h3>
                                <button type="button" id="toggleApiKeys" class="text-blue-600 hover:text-blue-800">
                                    <i class="fas fa-chevron-down"></i>
                                </button>
                            </div>
                            
                            <div id="apiKeysSection" class="hidden space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Claude API Key</label>
                                    <input type="password" id="claudeApiKey" placeholder="sk-ant-..." class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Gemini API Key</label>
                                    <input type="password" id="geminiApiKey" placeholder="AIza..." class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">OpenAI API Key</label>
                                    <input type="password" id="openaiApiKey" placeholder="sk-proj-..." class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                </div>
                                <div class="text-sm text-gray-600">
                                    <i class="fas fa-info-circle mr-1"></i>
                                    API 키가 없어도 데모 모드로 이용할 수 있습니다.
                                </div>
                            </div>
                        </div>

                        <!-- 생성 버튼 -->
                        <button 
                            type="submit" 
                            id="generateBtn"
                            class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition duration-300 shadow-lg"
                        >
                            <i class="fas fa-magic mr-2"></i>
                            블로그 글 생성하기
                        </button>
                    </form>
                </div>

                <!-- 생성된 콘텐츠 표시 영역 -->
                <div id="resultSection" class="hidden bg-white rounded-xl shadow-lg p-8">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-2xl font-bold text-gray-800">
                            <i class="fas fa-file-alt mr-2 text-green-600"></i>
                            생성된 블로그 글
                        </h2>
                        <button id="copyBtn" class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-300">
                            <i class="fas fa-copy mr-2"></i>
                            복사
                        </button>
                    </div>
                    
                    <div id="generationInfo" class="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-gray-700"></div>
                    
                    <div id="content" class="prose max-w-none bg-gray-50 p-6 rounded-lg border"></div>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app