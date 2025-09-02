import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

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

// 지능형 재시도 시스템
async function intelligentRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 시도 ${attempt}/${maxRetries}`)
      return await operation()
    } catch (error: any) {
      lastError = error
      console.log(`❌ 시도 ${attempt} 실패:`, error.message)

      // 재시도 불가능한 오류들
      const nonRetryableErrors = [
        'authentication_error',
        'permission_denied', 
        'invalid_request_error'
      ]
      
      if (nonRetryableErrors.includes(error.type)) {
        console.log(`🚫 재시도 불가능한 오류: ${error.type}`)
        throw error
      }

      // 마지막 시도면 실패
      if (attempt === maxRetries) {
        break
      }

      // 지수 백오프로 대기 (1초, 2초, 4초...)
      const delay = baseDelay * Math.pow(2, attempt - 1)
      const jitter = Math.random() * 1000 // 지터 추가
      const totalDelay = delay + jitter
      
      console.log(`⏳ ${totalDelay.toFixed(0)}ms 대기 후 재시도...`)
      await new Promise(resolve => setTimeout(resolve, totalDelay))
    }
  }

  throw lastError
}

// API 키 검증 함수
function validateApiKey(modelName: string, apiKey: string): boolean {
  if (!apiKey || apiKey.trim() === '') return false
  
  switch (modelName) {
    case 'claude':
      return apiKey.startsWith('sk-ant-')
    case 'gemini':
      return apiKey.length > 20 // Gemini API 키는 긴 문자열
    case 'openai':
      return apiKey.startsWith('sk-')
    default:
      return false
  }
}

// 멀티 AI 모델 호출 시스템 (개선된 버전)
async function callAIModel(
  modelName: string, 
  apiKey: string, 
  prompt: string, 
  options: any = {}
): Promise<string> {
  const model = aiModels[modelName]
  if (!model) {
    throw {
      type: 'invalid_model',
      message: `지원하지 않는 AI 모델: ${modelName}`,
      model: modelName
    }
  }

  // API 키 검증
  if (!validateApiKey(modelName, apiKey)) {
    throw {
      type: 'invalid_api_key',
      message: `잘못된 ${model.name} API 키 형식입니다`,
      model: model.name
    }
  }

  return await intelligentRetry(async () => {
    console.log(`🤖 ${model.name} 호출 중...`)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), model.timeoutMs)
    
    try {
      // Gemini는 API 키를 URL에 포함
      let endpoint = model.endpoint
      let headers = model.headers(apiKey)
      
      if (modelName === 'gemini') {
        endpoint = `${model.endpoint}?key=${apiKey}`
        headers = model.headers('') // Gemini는 헤더에 API 키 불필요
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(model.formatRequest(prompt, options)),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { message: errorText }
        }

        console.error(`❌ ${model.name} API 오류:`, errorData)

        // 모델별 오류 처리
        if (modelName === 'claude' && errorData.error) {
          throw {
            type: errorData.error.type || 'claude_error',
            message: errorData.error.message || 'Claude API 오류',
            model: model.name
          }
        }
        
        if (modelName === 'gemini' && errorData.error) {
          throw {
            type: 'gemini_error',
            message: errorData.error.message || 'Gemini API 오류',
            model: model.name
          }
        }
        
        if (modelName === 'openai' && errorData.error) {
          throw {
            type: 'openai_error', 
            message: errorData.error.message || 'OpenAI API 오류',
            model: model.name
          }
        }

        // 일반 HTTP 오류 처리
        throw {
          type: response.status === 429 ? 'rate_limit_error' : 
                response.status === 401 ? 'authentication_error' :
                response.status === 403 ? 'permission_denied' :
                response.status >= 500 ? 'server_error' : 'api_error',
          message: `HTTP ${response.status}: ${errorData.message || response.statusText}`,
          model: model.name
        }
      }

      const data = await response.json()
      const result = model.parseResponse(data)
      
      if (!result || result.trim().length === 0) {
        throw {
          type: 'empty_response',
          message: '빈 응답을 받았습니다',
          model: model.name
        }
      }

      console.log(`✅ ${model.name} 성공 (${result.length}자)`)
      return result

    } catch (error: any) {
      clearTimeout(timeoutId)
      
      if (error.name === 'AbortError') {
        throw {
          type: 'timeout_error',
          message: `${model.timeoutMs}ms 시간 초과`,
          model: model.name
        }
      }
      
      // 이미 구조화된 오류는 그대로 전달
      if (error.type && error.message) {
        throw error
      }
      
      // 예상치 못한 오류 처리
      throw {
        type: 'network_error',
        message: error.message || '네트워크 오류가 발생했습니다',
        model: model.name
      }
    }
  }, model.maxRetries)
}

// 개선된 폴백 체인 시스템
async function generateWithFallback(
  prompt: string, 
  apiKeys: Record<string, string>,
  options: any = {},
  performanceMetrics?: any
): Promise<{ content: string, model: string, attempts: string[] }> {
  const modelPriority = ['claude', 'gemini', 'openai']
  const attempts: string[] = []
  let lastError: any
  let validApiKeysFound = 0

  // 사용 가능한 API 키 검사
  for (const modelName of modelPriority) {
    if (apiKeys[modelName] && validateApiKey(modelName, apiKeys[modelName])) {
      validApiKeysFound++
    }
  }

  if (validApiKeysFound === 0) {
    throw {
      type: 'no_valid_api_keys',
      message: '사용 가능한 API 키가 없습니다. Claude, Gemini, 또는 OpenAI API 키를 확인해주세요.',
      attempts: ['API 키 검증 실패'],
      suggestion: '설정에서 올바른 형식의 API 키를 입력해주세요'
    }
  }

  for (const modelName of modelPriority) {
    // API 키 없거나 잘못된 경우 스킵
    if (!apiKeys[modelName]) {
      attempts.push(`${modelName}: API 키 없음`)
      continue
    }
    
    if (!validateApiKey(modelName, apiKeys[modelName])) {
      attempts.push(`${modelName}: 잘못된 API 키 형식`)
      continue
    }

    const modelStartTime = Date.now()
    try {
      console.log(`🚀 ${aiModels[modelName].name} 시도 중...`)
      
      const content = await callAIModel(modelName, apiKeys[modelName], prompt, options)
      const modelEndTime = Date.now()
      const responseTime = modelEndTime - modelStartTime
      
      attempts.push(`${modelName}: 성공 (${responseTime}ms, ${content.length}자)`)
      
      // 성능 메트릭 업데이트
      if (performanceMetrics) {
        performanceMetrics.apiAttempts.push({
          model: modelName,
          success: true,
          responseTime,
          contentLength: content.length,
          timestamp: new Date().toISOString()
        })
        performanceMetrics.successfulModel = modelName
        performanceMetrics.avgResponseTime = responseTime
      }
      
      console.log(`✨ ${aiModels[modelName].name} 성공! (${responseTime}ms)`)
      return { content, model: aiModels[modelName].name, attempts }
      
    } catch (error: any) {
      const responseTime = Date.now() - modelStartTime
      lastError = error
      
      const errorMessage = error.message || '알 수 없는 오류'
      attempts.push(`${modelName}: ${errorMessage} (${responseTime}ms)`)
      
      // 실패 메트릭 기록
      if (performanceMetrics) {
        performanceMetrics.apiAttempts.push({
          model: modelName,
          success: false,
          error: errorMessage,
          errorType: error.type || 'unknown_error',
          responseTime,
          timestamp: new Date().toISOString()
        })
        performanceMetrics.totalRetries++
      }
      
      console.log(`❌ ${aiModels[modelName].name} 실패: ${errorMessage}`)
      
      // 재시도 불가능한 오류는 다음 모델로 넘어감
      if (error.type === 'invalid_api_key' || error.type === 'authentication_error' || error.type === 'permission_denied') {
        console.log(`🙅 ${modelName} 인증 오류 - 다음 모델 시도`)
        continue
      }
      
      console.log(`🔄 ${modelName} 다음 모델로 fallback...`)
    }
  }

  // 모든 모델 실패
  const errorMessage = lastError?.message || '모든 AI 모델에서 오류가 발생했습니다'
  
  throw {
    type: 'all_models_failed',
    message: '모든 AI 모델 호출이 실패했습니다',
    details: errorMessage,
    attempts,
    lastError,
    suggestion: 'API 키를 확인하거나 잠시 후 다시 시도해주세요'
  }
}

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files with UTF-8 encoding
app.use('/static/*', async (c, next) => {
  await next()
  // JavaScript 파일의 경우 UTF-8 인코딩 헤더 설정
  if (c.req.path.endsWith('.js')) {
    c.header('Content-Type', 'application/javascript; charset=utf-8')
  } else if (c.req.path.endsWith('.css')) {
    c.header('Content-Type', 'text/css; charset=utf-8')
  }
})
app.use('/static/*', serveStatic({ root: './public' }))

// API routes for blog generation
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', message: 'Blog Generator API is running' })
})

// API 키 상태 확인 엔드포인트
app.get('/api/check-api-keys', (c) => {
  c.header('Content-Type', 'application/json; charset=utf-8')
  
  const claudeKey = c.env?.CLAUDE_API_KEY
  const geminiKey = c.env?.GEMINI_API_KEY  
  const openaiKey = c.env?.OPENAI_API_KEY
  
  const keyStatus = {
    claude: claudeKey ? '설정됨' : '설정 필요',
    gemini: geminiKey ? '설정됨' : '설정 필요',
    openai: openaiKey ? '설정됨' : '설정 필요'
  }
  
  const totalConfigured = Object.values(keyStatus).filter(status => status === '설정됨').length
  const hasAnyKey = totalConfigured > 0
  
  return c.json({
    configured: hasAnyKey,
    totalConfigured,
    details: keyStatus,
    message: hasAnyKey 
      ? `${totalConfigured}/3개의 API 키가 설정되었습니다` 
      : '환경 변수로 설정된 API 키가 없습니다. 설정에서 API 키를 입력해주세요.'
  })
})

// 서브키워드 생성 API (Multi AI Models)
app.post('/api/generate-subkeywords', async (c) => {
  // UTF-8 인코딩 헤더 설정
  c.header('Content-Type', 'application/json; charset=utf-8')
  
  try {
    const { mainKeyword, apiKey, geminiKey, openaiKey } = await c.req.json()
    
    if (!mainKeyword) {
      return c.json({ error: 'mainKeyword가 필요합니다' }, 400)
    }

    // API 키들 수집 및 검증
    const apiKeys = {
      claude: apiKey,
      gemini: geminiKey, 
      openai: openaiKey
    }

    // 사용 가능한 API 키 검사
    const validKeys = Object.entries(apiKeys)
      .filter(([modelName, key]) => key && validateApiKey(modelName, key))
      .map(([modelName]) => modelName)

    if (validKeys.length === 0) {
      return c.json({ 
        error: '사용 가능한 API 키가 없습니다',
        details: {
          claude: apiKey ? '올바른 Claude API 키는 sk-ant-로 시작합니다' : 'API 키가 없습니다',
          gemini: geminiKey ? '올바른 Gemini API 키를 입력해주세요' : 'API 키가 없습니다',
          openai: openaiKey ? '올바른 OpenAI API 키는 sk-로 시작합니다' : 'API 키가 없습니다'
        },
        suggestion: '설정에서 올바른 형식의 API 키를 입력해주세요'
      }, 400)
    }

    console.log(`🔑 사용 가능한 API 키: ${validKeys.join(', ')}`)

    const prompt = `당신은 SEO 전문가입니다. 주어진 메인 키워드를 바탕으로 블로그에 적합한 서브 키워드 10개를 생성해주세요.

메인 키워드: "${mainKeyword}"

다음 조건에 맞는 서브 키워드 10개를 JSON 배열 형태로만 제공해주세요:
1. 메인 키워드와 관련성이 높을 것
2. 블로그 글 제목으로 활용 가능할 것  
3. 다양한 검색 의도를 포함할 것 (정보성, 상업적, 탐색적)
4. 한국어로 작성할 것
5. 롱테일 키워드 형태일 것

응답은 반드시 이 형태로만: ["키워드1", "키워드2", "키워드3", "키워드4", "키워드5", "키워드6", "키워드7", "키워드8", "키워드9", "키워드10"]

다른 설명 없이 JSON 배열만 제공하세요.`

    // 🚀 성능 추적 시작
    const startTime = Date.now()
    const performanceMetrics = {
      startTime,
      apiAttempts: [],
      totalRetries: 0
    }
    
    const result = await generateWithFallback(prompt, apiKeys, { maxTokens: 1000 }, performanceMetrics)
    
    try {
      // JSON 배열 추출 시도
      const keywordsMatch = result.content.match(/\[.*?\]/s)
      if (keywordsMatch) {
        const keywords = JSON.parse(keywordsMatch[0])
        return c.json({ 
          success: true, 
          keywords: keywords.map((keyword, index) => ({
            id: index + 1,
            keyword: keyword,
            editable: true
          })),
          meta: {
            usedModel: result.model,
            attempts: result.attempts
          }
        })
      } else {
        // JSON 형태가 아닌 경우 줄바꿈으로 분리
        const lines = result.content.split('\n').filter(line => line.trim())
        const keywords = lines.slice(0, 10).map(line => 
          line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').replace(/["""]/g, '').trim()
        )
        return c.json({ 
          success: true, 
          keywords: keywords.map((keyword, index) => ({
            id: index + 1,
            keyword: keyword,
            editable: true
          })),
          meta: {
            usedModel: result.model,
            attempts: result.attempts,
            parsedFromText: true
          }
        })
      }
    } catch (parseError) {
      console.error('키워드 파싱 오류:', parseError)
      return c.json({ 
        error: '키워드 파싱 실패',
        rawContent: result.content,
        usedModel: result.model
      }, 500)
    }

  } catch (error: any) {
    console.error('서브키워드 생성 오류:', error)
    
    // 개선된 오류 처리
    if (error.type === 'all_models_failed') {
      return c.json({
        success: false,
        error: '모든 AI 모델 호출이 실패했습니다',
        details: error.attempts || [],
        suggestion: error.suggestion || 'API 키를 확인하거나 잠시 후 다시 시도해주세요',
        errorType: error.type
      }, 500)
    }
    
    if (error.type === 'no_valid_api_keys') {
      return c.json({
        success: false,
        error: error.message,
        suggestion: error.suggestion,
        errorType: error.type
      }, 400)
    }
    
    return c.json({ 
      success: false,
      error: error.message || '서버 오류가 발생했습니다',
      type: error.type || 'unknown_error',
      suggestion: '잠시 후 다시 시도해주세요'
    }, 500)
  }
})

// 블로그 글 생성 API (Multi AI Models)
app.post('/api/generate-article', async (c) => {
  // UTF-8 인코딩 헤더 설정
  c.header('Content-Type', 'application/json; charset=utf-8')
  try {
    const { keyword, mainKeyword, contentStyle, contentLength, targetAudience, apiKey, geminiKey, openaiKey } = await c.req.json()
    
    if (!keyword) {
      return c.json({ error: 'keyword가 필요합니다' }, 400)
    }

    // API 키들 수집 및 검증
    const apiKeys = {
      claude: apiKey,
      gemini: geminiKey, 
      openai: openaiKey
    }

    // 사용 가능한 API 키 검사
    const validKeys = Object.entries(apiKeys)
      .filter(([modelName, key]) => key && validateApiKey(modelName, key))
      .map(([modelName]) => modelName)

    if (validKeys.length === 0) {
      return c.json({ 
        error: '사용 가능한 API 키가 없습니다',
        details: {
          claude: apiKey ? '올바른 Claude API 키는 sk-ant-로 시작합니다' : 'API 키가 없습니다',
          gemini: geminiKey ? '올바른 Gemini API 키를 입력해주세요' : 'API 키가 없습니다',
          openai: openaiKey ? '올바른 OpenAI API 키는 sk-로 시작합니다' : 'API 키가 없습니다'
        },
        suggestion: '설정에서 올바른 형식의 API 키를 입력해주세요'
      }, 400)
    }

    console.log(`🔑 사용 가능한 API 키: ${validKeys.join(', ')}`)

    // 🚀 고급 스타일 프롬프트 (전문성 강화)
    const stylePrompts = {
      informative: {
        tone: '전문적이고 신뢰성 있는 정보 전달 중심의',
        structure: '데이터와 사실을 바탕으로 체계적으로 정리된',
        approach: '객관적 분석과 근거 제시를 통한 교육적인'
      },
      review: {
        tone: '개인적 경험과 객관적 평가가 균형잡힌',
        structure: '장단점을 명확히 비교 분석하는',
        approach: '실제 사용 후기와 구체적 근거를 제시하는'
      },
      guide: {
        tone: '친절하면서도 전문적인 가이드 형식의',
        structure: '단계별로 따라하기 쉽게 구성된',
        approach: '실무에서 바로 적용 가능한 실용적인'
      },
      news: {
        tone: '신속하고 정확한 최신 정보 전달의',
        structure: '핵심 내용을 먼저 제시하는 역피라미드 구조의',
        approach: '트렌드와 영향력을 분석하는 통찰력 있는'
      },
      tutorial: {
        tone: '따라하기 쉽고 이해하기 쉬운 교육적인',
        structure: '스크린샷과 예제를 포함한 단계별',
        approach: '초보자도 성공할 수 있도록 세심하게 설계된'
      }
    }

    // 🎯 고급 독자 페르소나 (맞춤화 강화)
    const audiencePrompts = {
      general: {
        vocabulary: '전문용어는 쉽게 풀어서 설명하고',
        depth: '기본 개념부터 차근차근 설명하여',
        examples: '일상생활과 연관된 친근한 예시를 들어',
        tone: '누구나 쉽게 이해할 수 있도록'
      },
      beginner: {
        vocabulary: '어려운 용어는 반드시 해설을 붙이고',
        depth: '기초 지식이 없어도 따라갈 수 있도록 상세하게',
        examples: '단계별 스크린샷과 구체적인 예시를 제공하여',
        tone: '친절하고 격려적인 톤으로 초보자의 두려움을 없애도록'
      },
      intermediate: {
        vocabulary: '기본 용어는 알고 있다고 가정하되 고급 용어는 설명하고',
        depth: '핵심 포인트 위주로 효율적이면서도 충분한 깊이로',
        examples: '실무 적용 사례와 심화 팁을 포함하여',
        tone: '전문적이면서도 접근하기 쉬운 균형잡힌 톤으로'
      },
      expert: {
        vocabulary: '전문 용어와 최신 트렌드를 자유롭게 사용하고',
        depth: '고급 기법과 심화 내용에 집중하여',
        examples: '업계 사례와 고급 전략을 중심으로',
        tone: '간결하고 핵심을 찌르는 전문가 수준의 톤으로'
      }
    }

    // 🎯 업종별 전문 컨텍스트 생성
    function getIndustryContext(keyword: string, mainKeyword: string): string {
      const keywordLower = keyword.toLowerCase() + ' ' + mainKeyword.toLowerCase()
      
      // 기술/IT 분야
      if (keywordLower.match(/프로그래밍|코딩|개발|앱|웹사이트|소프트웨어|ai|인공지능|머신러닝|데이터|클라우드|서버|데이터베이스/)) {
        return `
### 🔧 **기술 전문가 모드 활성화**
- 최신 기술 트렌드와 업계 표준 반영
- 실제 코드 예제나 구현 방법 포함
- 성능, 보안, 확장성 관점에서 분석
- 실무에서 겪는 문제점과 해결책 제시
- 관련 도구, 라이브러리, 플랫폼 추천`
      }
      
      // 마케팅/비즈니스 분야  
      if (keywordLower.match(/마케팅|광고|브랜딩|세일즈|영업|비즈니스|창업|수익|roi|전략|고객|브랜드/)) {
        return `
### 💼 **마케팅 전문가 모드 활성화**
- 구체적인 수치와 ROI 데이터 포함
- 실제 성공/실패 사례 분석
- 단계별 실행 전략과 체크리스트 제공
- 타겟 고객 분석과 페르소나 설정
- 측정 가능한 KPI와 성과 지표 제시`
      }
      
      // 라이프스타일/취미 분야
      if (keywordLower.match(/요리|여행|패션|뷰티|건강|운동|취미|문화|예술|음악|영화|책/)) {
        return `
### 🎨 **라이프스타일 전문가 모드 활성화**
- 개인적 경험과 감정적 연결 강화
- 계절성, 트렌드, 유행 요소 반영
- 단계별 사진이나 시각적 가이드 언급
- 예산별, 수준별 선택지 제공
- 커뮤니티나 소셜 요소 포함`
      }
      
      // 교육/학습 분야
      if (keywordLower.match(/교육|학습|공부|시험|자격증|언어|스킬|능력|성장|개발|커리어/)) {
        return `
### 📚 **교육 전문가 모드 활성화**
- 학습 단계별 로드맵 제시
- 효과적인 학습 방법과 팁 포함
- 실제 적용 사례와 경험담 공유
- 관련 자료, 책, 강의 추천
- 성취도 측정과 피드백 방법 안내`
      }
      
      return `
### 🎯 **전문가 모드 활성화**
- 해당 분야의 최신 동향과 전문 지식 반영
- 실무 경험을 바탕으로 한 실용적 조언 제공
- 구체적 사례와 데이터를 통한 신뢰성 확보
- 독자의 다양한 수준과 상황 고려
- 실행 가능한 단계별 가이드 제공`
    }

    const industryContext = getIndustryContext(keyword, mainKeyword)

    // 블로그 글 생성 프롬프트
    const articlePrompt = `🎯 **MISSION**: 당신은 각 분야의 최고 전문가이자 베스트셀러 작가입니다. 독자에게 진짜 가치를 제공하는 최고 품질의 블로그 글을 작성해주세요.

## 📋 **콘텐츠 요구사항**

### 🎪 **핵심 정보**
- **타겟 키워드**: ${keyword}
- **메인 테마**: ${mainKeyword} 
- **콘텐츠 스타일**: ${stylePrompts[contentStyle]?.tone || '전문적이고 신뢰성 있는'} ${stylePrompts[contentStyle]?.structure || '체계적으로 정리된'} ${stylePrompts[contentStyle]?.approach || '실용적인'}
- **타겟 독자**: ${audiencePrompts[targetAudience]?.vocabulary || '전문용어를 쉽게 설명하고'} ${audiencePrompts[targetAudience]?.depth || '기본부터 설명하여'} ${audiencePrompts[targetAudience]?.examples || '친근한 예시를 들어'} ${audiencePrompts[targetAudience]?.tone || '이해하기 쉽도록'}
- **목표 분량**: ${contentLength}자 (±10% 허용)

### 🏗️ **고품질 글 구조 (필수 준수)**

#### 1. **🎯 매력적인 제목 작성**
- 키워드 자연스럽게 포함
- 호기심을 자극하는 표현 사용
- 구체적 숫자나 혜택 명시 (예: "5가지 방법", "완벽 가이드")

#### 2. **🔥 강력한 도입부 (Hook)**
- 독자의 문제점이나 고민 공감대 형성
- 이 글을 읽어야 하는 이유 명확 제시
- 글을 통해 얻을 수 있는 구체적 혜택 안내

#### 3. **💎 가치 있는 본문 (3-5개 섹션)**
- 각 섹션별 명확한 소제목 (## 사용)
- **실제 데이터, 통계, 사례 포함** (가능한 한)
- **단계별 실행 방법** 구체적 제시
- **팁, 주의사항, 노하우** 적극 포함
- 각 섹션을 **리스트, 표, 예시**로 풍성하게 구성

#### 4. **🎁 실행 가능한 결론**
- 핵심 내용 3-5줄로 요약
- 독자가 바로 실천할 수 있는 첫 번째 액션 제시
- 추가 학습이나 도구 추천

### ✨ **품질 향상 필수 요소**

#### 📊 **신뢰성 강화**
- 구체적인 수치나 퍼센트 언급 (예상치라도 현실적으로)
- "전문가에 따르면", "연구 결과에 따르면" 등 권위 있는 표현 사용
- 실패 사례와 성공 사례 균형있게 제시

#### 🎨 **가독성 극대화**
- **볼드체**로 핵심 키워드 강조
- 번호 매기기(1,2,3)와 불릿 포인트(•) 적극 활용
- 짧은 문단 구성 (3-4줄 이내)
- 중요한 내용은 > 인용구 블록 활용

#### 🔍 **SEO 최적화 고급 기법**
- 메인 키워드를 제목, 첫 문단, 마지막 문단에 자연스럽게 배치
- 관련 키워드(LSI) 자연스럽게 분산 배치
- 내부 링크 연결점 제안 (예: "관련 글: ...")
- 메타 디스크립션용 요약문 마지막에 제공

### 🎪 **콘텐츠 차별화 전략**

#### 💡 **독창적 관점 제시**
- 일반적인 내용에서 한 단계 더 나아간 인사이트
- 반대되는 관점이나 흔한 오해 바로잡기
- 개인적 경험이나 실제 사례 스토리텔링

#### 🛠️ **실용성 극대화**
- 체크리스트나 템플릿 형태로 정리
- "이럴 때는 이렇게" 상황별 대응법 제시
- 도구나 리소스 추천 (구체적 이름 포함)

---

**🚀 이제 위의 모든 가이드라인을 완벽히 적용하여, 독자가 "정말 도움이 되는 글이다!"라고 감탄할 만한 최고 품질의 블로그 글을 작성해주세요.**

${industryContext}`

    // 멀티 AI 모델로 블로그 글 생성 (fallback 포함)
    const content = await generateWithFallback(
      articlePrompt,
      apiKeys,
      { maxTokens: 3000, temperature: 0.7 }
    )

    // 제목 추출
    const titleMatch = content.match(/^#\s*(.+)$/m)
    const title = titleMatch ? titleMatch[1].trim() : keyword

    return c.json({ 
      success: true, 
      article: {
        title: title,
        keyword: keyword,
        content: content,
        wordCount: content.length,
        createdAt: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('블로그 글 생성 오류:', error)
    
    // 개선된 오류 처리
    if (error.type === 'all_models_failed') {
      return c.json({
        success: false,
        error: '모든 AI 모델 호출이 실패했습니다',
        details: error.attempts || [],
        suggestion: error.suggestion || 'API 키를 확인하거나 잠시 후 다시 시도해주세요',
        errorType: error.type
      }, 500)
    }
    
    if (error.type === 'no_valid_api_keys') {
      return c.json({
        success: false,
        error: error.message,
        suggestion: error.suggestion,
        errorType: error.type
      }, 400)
    }
    
    return c.json({ 
      success: false,
      error: error.message || '서버 오류가 발생했습니다',
      type: error.type || 'unknown_error',
      suggestion: '잠시 후 다시 시도해주세요'
    }, 500)
  }
})

// 🔥 실시간 시스템 모니터링 API
app.get('/api/system-status', async (c) => {
  c.header('Content-Type', 'application/json; charset=utf-8')
  
  try {
    // 환경 변수에서 API 키 상태 확인
    const claudeKey = c.env?.CLAUDE_API_KEY
    const geminiKey = c.env?.GEMINI_API_KEY  
    const openaiKey = c.env?.OPENAI_API_KEY
    
    const systemStatus = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime ? process.uptime() * 1000 : 0,
      memory: process.memoryUsage ? process.memoryUsage() : { heapUsed: 0, heapTotal: 0 },
      apis: {
        claude: { 
          status: claudeKey ? (validateApiKey('claude', claudeKey) ? 'active' : 'invalid') : 'not_configured', 
          lastCheck: new Date().toISOString(),
          configured: !!claudeKey
        },
        gemini: { 
          status: geminiKey ? (validateApiKey('gemini', geminiKey) ? 'active' : 'invalid') : 'not_configured', 
          lastCheck: new Date().toISOString(),
          configured: !!geminiKey
        },
        openai: { 
          status: openaiKey ? (validateApiKey('openai', openaiKey) ? 'active' : 'invalid') : 'not_configured', 
          lastCheck: new Date().toISOString(),
          configured: !!openaiKey
        }
      },
      performance: {
        avgResponseTime: '0ms',
        totalRequests: 0,
        successRate: 100,
        errorRate: 0
      }
    }

    return c.json({
      success: true,
      status: systemStatus
    })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'System status check failed',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

// 📊 성능 통계 API  
app.get('/api/performance-stats', async (c) => {
  c.header('Content-Type', 'application/json; charset=utf-8')
  
  try {
    // 실제 환경에서는 Redis나 데이터베이스에서 통계를 가져옴
    const mockStats = {
      last24Hours: {
        totalRequests: 156,
        successfulRequests: 142,
        failedRequests: 14,
        avgResponseTime: 2340,
        popularKeywords: ['AI', '블로그', '마케팅', 'SEO', '콘텐츠'],
        modelUsage: {
          claude: 89,
          gemini: 45,
          openai: 22
        }
      },
      realtime: {
        activeUsers: 3,
        requestsPerMinute: 12,
        currentResponseTime: 1850,
        systemLoad: 'normal'
      }
    }

    return c.json({
      success: true,
      stats: mockStats,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'Performance stats unavailable' 
    }, 500)
  }
})

// 콘텐츠 품질 분석 함수
async function analyzeContentQuality(content: string, keyword: string, mainKeyword: string): Promise<any> {
  // 기본적인 콘텐츠 분석 (실제로는 AI를 사용할 수 있음)
  const wordCount = content.length
  const keywordCount = (content.match(new RegExp(keyword, 'gi')) || []).length
  const headingCount = (content.match(/^#{1,6}\s/gm) || []).length
  const listCount = (content.match(/^[-\*\+]\s/gm) || []).length
  
  // SEO 점수 계산
  const seoScore = Math.min(100, Math.max(0, 
    (keywordCount > 0 ? 25 : 0) + 
    (wordCount > 300 ? 25 : wordCount / 12) +
    (headingCount > 0 ? 25 : 0) +
    (listCount > 0 ? 25 : 0)
  ))
  
  return {
    wordCount,
    keywordCount,
    keywordDensity: ((keywordCount / wordCount) * 100).toFixed(2),
    headingCount,
    listCount,
    seoScore: Math.round(seoScore),
    readabilityScore: Math.min(100, Math.max(0, 100 - Math.abs(wordCount - 500) / 10)),
    suggestions: [
      keywordCount === 0 ? `"${keyword}" 키워드를 콘텐츠에 포함하세요` : null,
      headingCount === 0 ? '제목과 소제목을 추가하세요' : null,
      wordCount < 300 ? '콘텐츠 길이를 늘려주세요 (최소 300자)' : null,
      listCount === 0 ? '불릿 포인트나 리스트를 추가하세요' : null
    ].filter(Boolean)
  }
}

// 🎯 콘텐츠 품질 분석 API (별도 분석)
app.post('/api/analyze-content-quality', async (c) => {
  c.header('Content-Type', 'application/json; charset=utf-8')
  
  try {
    const { content, keyword, type = 'article' } = await c.req.json()
    
    if (!content) {
      return c.json({ error: '분석할 콘텐츠가 필요합니다' }, 400)
    }

    const analysis = await analyzeContentQuality(content, keyword || '', keyword || '')
    
    return c.json({
      success: true,
      analysis: analysis,
      analyzedAt: new Date().toISOString(),
      contentType: type
    })
  } catch (error) {
    console.error('Content quality analysis error:', error)
    return c.json({ 
      success: false, 
      error: '콘텐츠 품질 분석 중 오류가 발생했습니다' 
    }, 500)
  }
})

// 이미지 생성 API (Gemini 2.5 Flash nano-banana)
app.post('/api/generate-image', async (c) => {
  // UTF-8 인코딩 헤더 설정
  c.header('Content-Type', 'application/json; charset=utf-8')
  try {
    const { keyword, title, articleContent } = await c.req.json()
    
    if (!keyword) {
      return c.json({ error: 'keyword가 필요합니다' }, 400)
    }

    // 키워드와 제목을 기반으로 영문 이미지 프롬프트 생성
    const imagePrompt = generateImagePrompt(keyword, title, articleContent)
    
    try {
      // HuggingFace Inference API 사용 (무료)
      // 여러 모델을 순차적으로 시도
      const models = [
        'runwayml/stable-diffusion-v1-5',
        'stabilityai/stable-diffusion-2-1',
        'CompVis/stable-diffusion-v1-4'
      ]
      
      let hfResponse = null
      let lastError = null
      
      for (const model of models) {
        try {
          console.log(`Trying HuggingFace model: ${model}`)
          hfResponse = await fetch(
            `https://api-inference.huggingface.co/models/${model}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                inputs: imagePrompt,
                parameters: {
                  num_inference_steps: 15,
                  guidance_scale: 7.5
                }
              })
            }
          )
          
          if (hfResponse.ok) {
            console.log(`Successfully connected to ${model}`)
            break
          } else {
            const errorText = await hfResponse.text()
            console.log(`Model ${model} failed:`, errorText)
            lastError = errorText
          }
        } catch (modelError) {
          console.log(`Model ${model} error:`, modelError.message)
          lastError = modelError
        }
      }

      if (hfResponse && hfResponse.ok) {
        const imageBlob = await hfResponse.arrayBuffer()
        
        // ArrayBuffer를 Base64로 변환
        const base64 = btoa(String.fromCharCode(...new Uint8Array(imageBlob)))
        const dataUrl = `data:image/jpeg;base64,${base64}`
        
        return c.json({ 
          success: true, 
          image: {
            url: dataUrl,
            prompt: imagePrompt,
            keyword: keyword,
            createdAt: new Date().toISOString(),
            source: 'HuggingFace Stable Diffusion',
            isAIGenerated: true
          }
        })
      } else {
        // 모든 HuggingFace 모델 실패 시 폴백
        console.log('All HuggingFace models failed:', lastError)
        throw new Error('All HuggingFace models failed')
      }
    } catch (hfError) {
      // 폴백: 고품질 플레이스홀더 이미지 (Unsplash 기반)
      console.log('Using fallback image service due to:', hfError.message)
      
      // 키워드 기반 Unsplash 이미지 URL 생성
      const unsplashKeywords = {
        '여행': 'travel,destination,landscape',
        '제주도': 'jeju,korea,island',
        '부산': 'busan,korea,city',
        '서울': 'seoul,korea,skyline',
        '음식': 'food,cuisine,delicious',
        '맛집': 'restaurant,gourmet,dining',
        '카페': 'cafe,coffee,interior',
        '디저트': 'dessert,sweet,pastry',
        '프로그래밍': 'programming,code,developer',
        '인공지능': 'ai,technology,digital',
        '웹개발': 'web,development,coding',
        '마케팅': 'marketing,business,growth',
        '창업': 'startup,business,entrepreneur',
        '투자': 'investment,finance,money',
        '건강': 'health,wellness,fitness',
        '요리': 'cooking,kitchen,chef',
        '독서': 'reading,books,study',
        '운동': 'fitness,exercise,gym'
      }
      
      const searchQuery = unsplashKeywords[keyword] || keyword
      const fallbackImageUrl = `https://source.unsplash.com/800x450/?${searchQuery}`
      
      return c.json({ 
        success: true, 
        image: {
          url: fallbackImageUrl,
          prompt: imagePrompt,
          keyword: keyword,
          createdAt: new Date().toISOString(),
          source: 'Unsplash (fallback)',
          isFallbackImage: true
        }
      })
    }

  } catch (error) {
    console.error('이미지 생성 오류:', error)
    return c.json({ error: '서버 오류가 발생했습니다' }, 500)
  }
})

// 키워드 기반 이미지 프롬프트 생성 함수
function generateImagePrompt(keyword: string, title?: string, content?: string) {
  // 한국어 키워드를 영어 이미지 프롬프트로 변환
  const keywordMappings: { [key: string]: string } = {
    // 여행 관련
    '여행': 'travel destination, beautiful landscape, scenic view',
    '제주도': 'Jeju Island Korea, volcanic landscape, coastal scenery',
    '부산': 'Busan Korea, beach city, modern skyline',
    '서울': 'Seoul Korea, city skyline, urban landscape',
    
    // 음식 관련
    '음식': 'delicious food, Korean cuisine, beautiful meal presentation',
    '맛집': 'restaurant food, gourmet dining, food photography',
    '카페': 'coffee shop interior, cozy cafe atmosphere, coffee art',
    '디저트': 'dessert photography, sweet treats, pastry art',
    
    // 기술 관련
    '프로그래밍': 'programming setup, code on screen, developer workspace',
    '인공지능': 'AI technology, futuristic digital interface, tech innovation',
    '웹개발': 'web development, coding environment, modern workspace',
    
    // 비즈니스 관련
    '마케팅': 'marketing strategy, business growth, digital marketing',
    '창업': 'startup office, entrepreneurs working, business meeting',
    '투자': 'financial growth, investment charts, business success',
    
    // 라이프스타일
    '건강': 'healthy lifestyle, wellness, exercise and nutrition',
    '요리': 'cooking process, kitchen scene, food preparation',
    '독서': 'reading books, cozy reading corner, knowledge learning',
    '운동': 'fitness exercise, gym workout, healthy activity'
  }

  // 기본 프롬프트 구조
  let basePrompt = keywordMappings[keyword] || `${keyword} related theme, professional photography`
  
  // 블로그 스타일에 맞는 추가 지시사항
  const styleInstructions = `
    high quality photography style, 
    bright natural lighting, 
    professional composition, 
    clean and modern aesthetic, 
    suitable for blog illustration,
    16:9 aspect ratio,
    vibrant colors,
    sharp focus
  `.trim().replace(/\s+/g, ' ')

  return `${basePrompt}, ${styleInstructions}`
}

// Main page
app.get('/', (c) => {
  // 명시적으로 UTF-8 Content-Type 설정
  c.header('Content-Type', 'text/html; charset=UTF-8')
  c.header('Cache-Control', 'no-cache, no-store, must-revalidate')
  c.header('Pragma', 'no-cache')
  c.header('Expires', '0')
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI 블로그 자동 생성기</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .card-shadow {
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          }
          .loading {
            display: none;
          }
          .loading.active {
            display: flex;
          }
          .article-editor {
            border: 2px solid #3b82f6;
            border-radius: 8px;
            background: #f8fafc;
          }
          .editor-textarea {
            width: 100%;
            min-height: 300px;
            padding: 15px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.6;
            resize: vertical;
            background: white;
          }
          .editor-preview {
            background: white;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            padding: 15px;
            min-height: 300px;
            overflow-y: auto;
          }
          .article-modified {
            border-left: 4px solid #f59e0b;
            background: linear-gradient(90deg, #fef3c7 0%, #ffffff 10%);
          }
          .edit-toolbar {
            display: flex;
            gap: 8px;
            margin-bottom: 12px;
            padding: 8px;
            background: #f1f5f9;
            border-radius: 6px;
          }
          .toolbar-btn {
            background: white;
            border: 1px solid #d1d5db;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
          }
          .toolbar-btn:hover {
            background: #f3f4f6;
            border-color: #9ca3af;
          }
          .toolbar-btn.active {
            background: #3b82f6;
            color: white;
            border-color: #3b82f6;
          }
          .seo-score-excellent { color: #059669; }
          .seo-score-good { color: #0891b2; }
          .seo-score-average { color: #d97706; }
          .seo-score-poor { color: #dc2626; }
          .seo-progress-bar {
            height: 8px;
            background: #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
          }
          .seo-progress-fill {
            height: 100%;
            transition: width 0.3s ease;
          }
          .seo-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .seo-badge.excellent { background: #d1fae5; color: #065f46; }
          .seo-badge.good { background: #dbeafe; color: #1e40af; }
          .seo-badge.average { background: #fed7aa; color: #9a3412; }
          .seo-badge.poor { background: #fecaca; color: #991b1b; }
          .keyword-highlight {
            background: linear-gradient(120deg, #fef08a 0%, #fef08a 100%);
            background-repeat: no-repeat;
            background-size: 100% 0.3em;
            background-position: 0 88%;
            font-weight: 600;
          }
          .tab-btn {
            transition: all 0.2s;
          }
          .tab-btn.active {
            border-bottom: 2px solid #4f46e5;
            color: #4f46e5 !important;
          }
          .tab-content {
            animation: fadeIn 0.3s ease-in;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .project-card {
            transition: all 0.2s;
            cursor: pointer;
          }
          .project-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          }
          .category-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .category-travel { background: #dbeafe; color: #1e40af; }
          .category-tech { background: #dcfce7; color: #166534; }
          .category-food { background: #fed7aa; color: #9a3412; }
          .category-business { background: #f3e8ff; color: #7c3aed; }
          .category-health { background: #fecaca; color: #991b1b; }
          .category-education { background: #fef3c7; color: #92400e; }
          .category-entertainment { background: #f0f9ff; color: #0c4a6e; }
          .category-other { background: #f1f5f9; color: #64748b; }
        </style>
    </head>
    <body class="bg-gray-50 min-h-screen">
        <!-- 헤더 -->
        <nav class="gradient-bg text-white shadow-lg">
            <div class="max-w-6xl mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <i class="fas fa-robot text-2xl"></i>
                        <h1 class="text-xl font-bold">AI 블로그 자동 생성기</h1>
                    </div>
                    <div class="flex space-x-4">
                        <button id="showMonitoringBtn" class="hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded transition" onclick="systemMonitor.showSystemMonitoring()">
                            <i class="fas fa-heartbeat mr-2"></i>모니터링
                        </button>
                        <button id="settingsBtn" class="hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded transition">
                            <i class="fas fa-cog mr-2"></i>설정
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <!-- 메인 컨텐츠 -->
        <div class="max-w-6xl mx-auto px-4 py-8">
            <!-- API 키 상태 섹션 -->
            <div id="apiKeyStatusSection" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6" style="display: none;">
                <div class="flex items-start">
                    <i class="fas fa-exclamation-triangle text-yellow-600 text-lg mr-3 mt-1"></i>
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold text-yellow-800 mb-2">⚠️ API 키 설정이 필요합니다</h3>
                        <p id="apiKeyMessage" class="text-yellow-700 mb-3">환경 변수로 설정된 API 키가 없습니다. 글 생성을 위해 설정에서 API 키를 입력해주세요.</p>
                        <div class="flex items-center space-x-4">
                            <button onclick="blogGenerator.showSettingsModal()" class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition">
                                <i class="fas fa-cog mr-2"></i>API 키 설정하기
                            </button>
                            <a href="/API_SETUP_GUIDE.md" target="_blank" class="text-yellow-700 hover:text-yellow-900 underline font-medium">
                                <i class="fas fa-book mr-1"></i>설정 가이드 보기
                            </a>
                        </div>
                    </div>
                    <button onclick="document.getElementById('apiKeyStatusSection').style.display = 'none'" class="text-yellow-600 hover:text-yellow-800 ml-4">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>

            <!-- 키워드 입력 섹션 -->
            <div class="bg-white rounded-lg card-shadow p-6 mb-8">
                <div class="flex items-center mb-6">
                    <i class="fas fa-keyboard text-blue-600 text-xl mr-3"></i>
                    <h2 class="text-2xl font-bold text-gray-800">메인 키워드 입력</h2>
                </div>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">메인 키워드</label>
                        <input type="text" id="mainKeyword" 
                               placeholder="예: 여행 가이드, 요리 레시피, IT 기술 등"
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">글 스타일</label>
                            <select id="contentStyle" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                <option value="informative">정보성</option>
                                <option value="review">리뷰</option>
                                <option value="guide">가이드</option>
                                <option value="news">뉴스</option>
                                <option value="tutorial">튜토리얼</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">글 길이</label>
                            <select id="contentLength" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                <option value="1000">1000자</option>
                                <option value="1500">1500자</option>
                                <option value="2000" selected>2000자</option>
                                <option value="2500">2500자</option>
                                <option value="3000">3000자</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">타겟 독자</label>
                            <select id="targetAudience" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                <option value="general">일반인</option>
                                <option value="beginner">초보자</option>
                                <option value="intermediate">중급자</option>
                                <option value="expert">전문가</option>
                            </select>
                        </div>
                    </div>
                    
                    <button id="generateSubKeywords" 
                            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105">
                        <i class="fas fa-magic mr-2"></i>서브 키워드 자동 생성
                    </button>
                </div>
            </div>

            <!-- 서브 키워드 섹션 -->
            <div id="subKeywordsSection" class="bg-white rounded-lg card-shadow p-6 mb-8" style="display: none;">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center">
                        <i class="fas fa-tags text-green-600 text-xl mr-3"></i>
                        <h2 class="text-2xl font-bold text-gray-800">서브 키워드</h2>
                    </div>
                    <span class="text-sm text-gray-500">키워드를 클릭하여 수정할 수 있습니다</span>
                </div>
                
                <div id="subKeywordsList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                    <!-- 동적으로 생성됨 -->
                </div>
                
                <button id="startGeneration" 
                        class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105">
                    <i class="fas fa-rocket mr-2"></i>블로그 글 생성 시작 (10개)
                </button>
            </div>

            <!-- 생성 진행률 섹션 -->
            <div id="progressSection" class="bg-white rounded-lg card-shadow p-6 mb-8" style="display: none;">
                <div class="flex items-center mb-6">
                    <i class="fas fa-spinner fa-spin text-purple-600 text-xl mr-3"></i>
                    <h2 class="text-2xl font-bold text-gray-800">생성 진행 상황</h2>
                </div>
                
                <div class="space-y-4">
                    <div class="flex justify-between items-center">
                        <span class="text-sm font-medium text-gray-700">전체 진행률</span>
                        <span id="progressText" class="text-sm text-gray-500">0/10</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-3">
                        <div id="progressBar" class="bg-purple-600 h-3 rounded-full transition-all duration-300" style="width: 0%"></div>
                    </div>
                </div>
                
                <div id="progressList" class="mt-6 space-y-2">
                    <!-- 동적으로 생성됨 -->
                </div>
            </div>

            <!-- 🔥 실시간 시스템 모니터링 섹션 -->
            <div id="systemMonitoringSection" class="bg-white rounded-lg card-shadow p-6 mb-8" style="display: none;">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center">
                        <i class="fas fa-heartbeat text-red-600 text-xl mr-3"></i>
                        <h2 class="text-2xl font-bold text-gray-800">시스템 모니터링</h2>
                    </div>
                    <div class="flex gap-2">
                        <button id="toggleMonitoring" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition">
                            <i class="fas fa-play mr-2"></i>모니터링 시작
                        </button>
                        <button id="refreshSystemStatus" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                            <i class="fas fa-sync-alt mr-2"></i>새로고침
                        </button>
                    </div>
                </div>

                <!-- 시스템 상태 카드 -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div class="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg text-center">
                        <div class="text-2xl font-bold" id="systemUptime">0ms</div>
                        <div class="text-sm opacity-90">시스템 가동시간</div>
                    </div>
                    <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg text-center">
                        <div class="text-2xl font-bold" id="avgResponseTime">0ms</div>
                        <div class="text-sm opacity-90">평균 응답시간</div>
                    </div>
                    <div class="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg text-center">
                        <div class="text-2xl font-bold" id="totalRequests">0</div>
                        <div class="text-sm opacity-90">총 요청수</div>
                    </div>
                    <div class="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg text-center">
                        <div class="text-2xl font-bold" id="successRate">100%</div>
                        <div class="text-sm opacity-90">성공률</div>
                    </div>
                </div>

                <!-- API 상태 -->
                <div class="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
                        <i class="fas fa-server mr-2"></i>API 서비스 상태
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="bg-white rounded-lg p-3 flex items-center justify-between">
                            <div class="flex items-center">
                                <div id="claudeStatus" class="w-3 h-3 rounded-full bg-gray-400 mr-3"></div>
                                <span class="font-medium">Claude API</span>
                            </div>
                            <span id="claudeResponseTime" class="text-sm text-gray-500">DISCONNECTED</span>
                        </div>
                        <div class="bg-white rounded-lg p-3 flex items-center justify-between">
                            <div class="flex items-center">
                                <div id="geminiStatus" class="w-3 h-3 rounded-full bg-gray-400 mr-3"></div>
                                <span class="font-medium">Gemini API</span>
                            </div>
                            <span id="geminiResponseTime" class="text-sm text-gray-500">DISCONNECTED</span>
                        </div>
                        <div class="bg-white rounded-lg p-3 flex items-center justify-between">
                            <div class="flex items-center">
                                <div id="openaiStatus" class="w-3 h-3 rounded-full bg-gray-400 mr-3"></div>
                                <span class="font-medium">OpenAI API</span>
                            </div>
                            <span id="openaiResponseTime" class="text-sm text-gray-500">DISCONNECTED</span>
                        </div>
                    </div>
                </div>

                <!-- 실시간 성능 차트 -->
                <div class="bg-gray-50 rounded-lg p-4">
                    <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
                        <i class="fas fa-chart-line mr-2"></i>실시간 성능 지표
                    </h4>
                    <div id="performanceChart" class="h-40 bg-white rounded border flex items-center justify-center text-gray-500">
                        <i class="fas fa-chart-line mr-2"></i>
                        모니터링을 시작하면 실시간 차트가 표시됩니다
                    </div>
                </div>
            </div>

            <!-- SEO 분석 섹션 -->
            <div id="seoAnalysisSection" class="bg-white rounded-lg card-shadow p-6 mb-8" style="display: none;">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center">
                        <i class="fas fa-search text-green-600 text-xl mr-3"></i>
                        <h2 class="text-2xl font-bold text-gray-800">SEO 분석 결과</h2>
                    </div>
                    <button id="refreshSeoAnalysis" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
                        <i class="fas fa-sync-alt mr-2"></i>다시 분석
                    </button>
                </div>

                <!-- SEO 종합 점수 -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg text-center">
                        <div class="text-3xl font-bold" id="totalSeoScore">0</div>
                        <div class="text-sm opacity-90">종합 SEO 점수</div>
                    </div>
                    <div class="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg text-center">
                        <div class="text-2xl font-bold" id="keywordScore">0</div>
                        <div class="text-sm opacity-90">키워드 점수</div>
                    </div>
                    <div class="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg text-center">
                        <div class="text-2xl font-bold" id="readabilityScore">0</div>
                        <div class="text-sm opacity-90">가독성 점수</div>
                    </div>
                    <div class="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg text-center">
                        <div class="text-2xl font-bold" id="structureScore">0</div>
                        <div class="text-sm opacity-90">구조 점수</div>
                    </div>
                </div>

                <!-- 상세 분석 결과 -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- 키워드 분석 -->
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h3 class="text-lg font-semibold mb-3 flex items-center">
                            <i class="fas fa-key text-blue-600 mr-2"></i>키워드 분석
                        </h3>
                        <div id="keywordAnalysis">
                            <!-- 동적으로 생성 -->
                        </div>
                    </div>

                    <!-- 제목 분석 -->
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h3 class="text-lg font-semibold mb-3 flex items-center">
                            <i class="fas fa-heading text-purple-600 mr-2"></i>제목 분석
                        </h3>
                        <div id="titleAnalysis">
                            <!-- 동적으로 생성 -->
                        </div>
                    </div>

                    <!-- 가독성 분석 -->
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h3 class="text-lg font-semibold mb-3 flex items-center">
                            <i class="fas fa-book-reader text-green-600 mr-2"></i>가독성 분석
                        </h3>
                        <div id="readabilityAnalysis">
                            <!-- 동적으로 생성 -->
                        </div>
                    </div>

                    <!-- 구조 분석 -->
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h3 class="text-lg font-semibold mb-3 flex items-center">
                            <i class="fas fa-sitemap text-orange-600 mr-2"></i>구조 분석
                        </h3>
                        <div id="structureAnalysis">
                            <!-- 동적으로 생성 -->
                        </div>
                    </div>
                </div>

                <!-- SEO 개선 제안 -->
                <div class="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <h3 class="text-lg font-semibold mb-3 flex items-center text-yellow-800">
                        <i class="fas fa-lightbulb mr-2"></i>SEO 개선 제안
                    </h3>
                    <div id="seoSuggestions" class="text-yellow-700">
                        <!-- 동적으로 생성 -->
                    </div>
                </div>
            </div>

            <!-- 품질 분석 섹션 -->
            <div id="qualityAnalysisSection" class="bg-white rounded-lg card-shadow p-6 mb-8" style="display: none;">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center">
                        <i class="fas fa-star text-yellow-600 text-xl mr-3"></i>
                        <h2 class="text-2xl font-bold text-gray-800">콘텐츠 품질 분석</h2>
                    </div>
                    <button id="refreshQualityAnalysis" class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition">
                        <i class="fas fa-sync-alt mr-2"></i>다시 분석
                    </button>
                </div>

                <!-- 품질 종합 점수 -->
                <div class="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
                    <div class="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-lg text-center">
                        <div class="text-3xl font-bold" id="overallQualityScore">0</div>
                        <div class="text-sm opacity-90">종합 품질</div>
                        <div class="text-xs opacity-80" id="overallQualityGrade">D</div>
                    </div>
                    <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg text-center">
                        <div class="text-2xl font-bold" id="expertiseScore">0</div>
                        <div class="text-sm opacity-90">전문성</div>
                    </div>
                    <div class="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg text-center">
                        <div class="text-2xl font-bold" id="originalityScore">0</div>
                        <div class="text-sm opacity-90">독창성</div>
                    </div>
                    <div class="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg text-center">
                        <div class="text-2xl font-bold" id="readabilityQualityScore">0</div>
                        <div class="text-sm opacity-90">가독성</div>
                    </div>
                    <div class="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg text-center">
                        <div class="text-2xl font-bold" id="engagementScore">0</div>
                        <div class="text-sm opacity-90">참여도</div>
                    </div>
                    <div class="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-4 rounded-lg text-center">
                        <div class="text-2xl font-bold" id="actionabilityScore">0</div>
                        <div class="text-sm opacity-90">실행가능성</div>
                    </div>
                </div>

                <!-- 상세 분석 결과 -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- 전문성 분석 -->
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h3 class="text-lg font-semibold mb-3 flex items-center">
                            <i class="fas fa-user-graduate text-blue-600 mr-2"></i>전문성 분석
                        </h3>
                        <div id="expertiseAnalysis">
                            <!-- 동적으로 생성 -->
                        </div>
                    </div>

                    <!-- 독창성 분석 -->
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h3 class="text-lg font-semibold mb-3 flex items-center">
                            <i class="fas fa-lightbulb text-green-600 mr-2"></i>독창성 분석
                        </h3>
                        <div id="originalityAnalysis">
                            <!-- 동적으로 생성 -->
                        </div>
                    </div>

                    <!-- 가독성 분석 -->
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h3 class="text-lg font-semibold mb-3 flex items-center">
                            <i class="fas fa-book-open text-purple-600 mr-2"></i>가독성 품질
                        </h3>
                        <div id="readabilityQualityAnalysis">
                            <!-- 동적으로 생성 -->
                        </div>
                    </div>

                    <!-- 참여도 분석 -->
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h3 class="text-lg font-semibold mb-3 flex items-center">
                            <i class="fas fa-heart text-red-600 mr-2"></i>참여도 분석
                        </h3>
                        <div id="engagementAnalysis">
                            <!-- 동적으로 생성 -->
                        </div>
                    </div>

                    <!-- 실행가능성 분석 -->
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h3 class="text-lg font-semibold mb-3 flex items-center">
                            <i class="fas fa-tasks text-indigo-600 mr-2"></i>실행가능성 분석
                        </h3>
                        <div id="actionabilityAnalysis">
                            <!-- 동적으로 생성 -->
                        </div>
                    </div>
                </div>

                <!-- 품질 개선 제안 -->
                <div class="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <h3 class="text-lg font-semibold mb-3 flex items-center text-yellow-800">
                        <i class="fas fa-magic mr-2"></i>품질 개선 제안
                    </h3>
                    <div id="qualitySuggestions" class="text-yellow-700">
                        <!-- 동적으로 생성 -->
                    </div>
                </div>
            </div>

            <!-- 결과 미리보기 섹션 -->
            <div id="resultsSection" class="bg-white rounded-lg card-shadow p-6" style="display: none;">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center">
                        <i class="fas fa-eye text-indigo-600 text-xl mr-3"></i>
                        <h2 class="text-2xl font-bold text-gray-800">생성 결과 미리보기</h2>
                    </div>
                    <div class="flex flex-wrap gap-2 mb-4">
                        <div class="flex gap-2">
                            <button id="downloadPDF" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition">
                                <i class="fas fa-file-pdf mr-2"></i>PDF
                            </button>
                            <button id="downloadWord" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                                <i class="fas fa-file-word mr-2"></i>Word
                            </button>
                            <button id="downloadIndividual" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
                                <i class="fas fa-archive mr-2"></i>ZIP
                            </button>
                            <button id="downloadMarkdown" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition">
                                <i class="fas fa-code mr-2"></i>Markdown
                            </button>
                        </div>
                        <div class="border-l border-gray-300 mx-2"></div>
                        <div class="flex gap-2">
                            <button onclick="blogGenerator.generateImagesForAllArticles()" class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition text-sm">
                                <i class="fas fa-images mr-1"></i>전체 이미지 생성
                            </button>
                        </div>
                        <div class="border-l border-gray-300 mx-2"></div>
                        <div class="flex gap-2">
                            <button id="selectAllArticles" class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition text-sm">
                                <i class="fas fa-check-square mr-1"></i>전체선택
                            </button>
                            <button id="saveProject" class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg transition text-sm">
                                <i class="fas fa-save mr-1"></i>프로젝트 저장
                            </button>
                            <button id="clearAll" class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition text-sm">
                                <i class="fas fa-trash mr-1"></i>전체삭제
                            </button>
                        </div>
                    </div>
                    
                    <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 rounded">
                        <div class="flex items-center">
                            <i class="fas fa-info-circle text-blue-600 mr-2"></i>
                            <span class="text-sm text-blue-800">
                                각 글을 클릭하여 <strong>실시간 편집</strong>이 가능합니다. 변경사항은 자동으로 저장됩니다.
                            </span>
                        </div>
                    </div>
                </div>
                
                <div id="generatedContent" class="space-y-6">
                    <!-- 동적으로 생성됨 -->
                </div>
            </div>
        </div>

        <!-- 프로젝트 관리 모달 -->
        <div id="projectModal" class="fixed inset-0 bg-black bg-opacity-50 z-50" style="display: none;">
            <div class="flex items-center justify-center min-h-screen px-4">
                <div class="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-xl font-bold text-gray-800 flex items-center">
                            <i class="fas fa-folder-open mr-2 text-indigo-600"></i>프로젝트 관리
                        </h3>
                        <button id="closeProject" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <!-- 탭 메뉴 -->
                    <div class="flex border-b mb-6">
                        <button id="saveTab" class="tab-btn active px-4 py-2 border-b-2 border-indigo-600 text-indigo-600 font-semibold">
                            <i class="fas fa-save mr-2"></i>저장하기
                        </button>
                        <button id="loadTab" class="tab-btn px-4 py-2 text-gray-500 hover:text-gray-700">
                            <i class="fas fa-folder-open mr-2"></i>불러오기
                        </button>
                        <button id="presetsTab" class="tab-btn px-4 py-2 text-gray-500 hover:text-gray-700">
                            <i class="fas fa-cog mr-2"></i>프리셋
                        </button>
                        <button id="keywordsTab" class="tab-btn px-4 py-2 text-gray-500 hover:text-gray-700">
                            <i class="fas fa-star mr-2"></i>즐겨찾기
                        </button>
                    </div>
                    
                    <!-- 저장 탭 -->
                    <div id="saveTabContent" class="tab-content">
                        <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                            <p class="text-blue-700">현재 프로젝트를 저장하여 나중에 다시 불러올 수 있습니다.</p>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">프로젝트 이름</label>
                                <input type="text" id="projectName" 
                                       placeholder="예: 여행 블로그 프로젝트"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                                <select id="projectCategory" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                                    <option value="travel">여행</option>
                                    <option value="tech">IT/기술</option>
                                    <option value="food">음식/요리</option>
                                    <option value="business">비즈니스</option>
                                    <option value="health">건강/의료</option>
                                    <option value="education">교육</option>
                                    <option value="entertainment">엔터테인먼트</option>
                                    <option value="other">기타</option>
                                </select>
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-gray-700 mb-2">설명</label>
                                <textarea id="projectDescription" rows="3"
                                          placeholder="프로젝트에 대한 간단한 설명을 입력하세요"
                                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"></textarea>
                            </div>
                        </div>
                        
                        <div class="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h4 class="font-semibold mb-2">저장될 내용:</h4>
                            <ul class="text-sm text-gray-600 space-y-1">
                                <li>• 메인 키워드 및 서브키워드 (<span id="keywordCount">0</span>개)</li>
                                <li>• 생성된 블로그 글 (<span id="articleCount">0</span>개)</li>
                                <li>• 편집 내역 및 수정사항</li>
                                <li>• SEO 분석 결과</li>
                                <li>• 설정값 (글 스타일, 길이, 대상 독자)</li>
                            </ul>
                        </div>
                        
                        <div class="flex gap-3 mt-6">
                            <button id="saveProjectBtn" class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition">
                                <i class="fas fa-save mr-2"></i>프로젝트 저장
                            </button>
                            <button id="exportProject" class="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition">
                                <i class="fas fa-download mr-2"></i>JSON 내보내기
                            </button>
                        </div>
                    </div>
                    
                    <!-- 불러오기 탭 -->
                    <div id="loadTabContent" class="tab-content" style="display: none;">
                        <div class="flex justify-between items-center mb-4">
                            <h4 class="text-lg font-semibold">저장된 프로젝트</h4>
                            <div class="flex gap-2">
                                <button id="importProject" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
                                    <i class="fas fa-upload mr-1"></i>JSON 가져오기
                                </button>
                                <input type="file" id="importFile" accept=".json" style="display: none;">
                            </div>
                        </div>
                        <div id="projectList" class="space-y-3 max-h-96 overflow-y-auto">
                            <!-- 동적으로 생성됨 -->
                        </div>
                    </div>
                    
                    <!-- 프리셋 탭 -->
                    <div id="presetsTabContent" class="tab-content" style="display: none;">
                        <div class="flex justify-between items-center mb-4">
                            <h4 class="text-lg font-semibold">설정 프리셋</h4>
                            <button id="savePreset" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm">
                                <i class="fas fa-plus mr-1"></i>현재 설정 저장
                            </button>
                        </div>
                        <div id="presetList" class="space-y-3">
                            <!-- 동적으로 생성됨 -->
                        </div>
                    </div>
                    
                    <!-- 즐겨찾기 탭 -->
                    <div id="keywordsTabContent" class="tab-content" style="display: none;">
                        <div class="flex justify-between items-center mb-4">
                            <h4 class="text-lg font-semibold">즐겨찾기 키워드</h4>
                            <div class="flex gap-2">
                                <input type="text" id="newFavoriteKeyword" placeholder="키워드 입력" 
                                       class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                <button id="addFavoriteKeyword" class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm">
                                    <i class="fas fa-star mr-1"></i>추가
                                </button>
                            </div>
                        </div>
                        <div id="favoriteKeywordsList" class="flex flex-wrap gap-2">
                            <!-- 동적으로 생성됨 -->
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 설정 모달 -->
        <div id="settingsModal" class="fixed inset-0 bg-black bg-opacity-50 z-50" style="display: none;">
            <div class="flex items-center justify-center min-h-screen px-4">
                <div class="bg-white rounded-lg p-6 w-full max-w-md">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-bold text-gray-800">설정</h3>
                        <button id="closeSettings" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="space-y-4">
                        <!-- 환경 변수 상태 표시 -->
                        <div id="environmentStatus" class="bg-green-50 border border-green-200 rounded-lg p-3" style="display: none;">
                            <div class="flex items-center text-green-800">
                                <i class="fas fa-check-circle mr-2"></i>
                                <strong>환경 변수로 API 키가 설정되어 있습니다!</strong>
                            </div>
                            <p class="text-xs text-green-700 mt-1">
                                Cloudflare Pages 환경 변수로 설정된 API 키를 사용 중입니다. 추가 설정이 필요하지 않습니다.
                            </p>
                            <div id="environmentApiList" class="mt-2 text-xs text-green-600">
                                <!-- 동적으로 생성됨 -->
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fab fa-anthropic mr-2 text-orange-600"></i>Claude API 키
                            </label>
                            <input type="password" id="claudeApiKey" 
                                   placeholder="sk-ant-..."
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            <p class="text-xs text-gray-500 mt-1">
                                <a href="https://console.anthropic.com" target="_blank" class="text-blue-600 hover:underline">
                                    console.anthropic.com에서 발급 받으세요
                                </a>
                            </p>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fab fa-google mr-2 text-blue-600"></i>Gemini API 키
                            </label>
                            <input type="password" id="geminiApiKey" 
                                   placeholder="AIza..."
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                            <p class="text-xs text-gray-500 mt-1">
                                <a href="https://aistudio.google.com/app/apikey" target="_blank" class="text-green-600 hover:underline">
                                    aistudio.google.com에서 발급 받으세요
                                </a>
                            </p>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fas fa-robot mr-2 text-green-600"></i>OpenAI API 키
                            </label>
                            <input type="password" id="openaiApiKey" 
                                   placeholder="sk-..."
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                            <p class="text-xs text-gray-500 mt-1">
                                <a href="https://platform.openai.com/api-keys" target="_blank" class="text-purple-600 hover:underline">
                                    platform.openai.com에서 발급 받으세요
                                </a>
                            </p>
                        </div>
                        
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <p class="text-xs text-gray-600">
                                <i class="fas fa-info-circle mr-1"></i>
                                <strong>멀티 AI 모델 시스템:</strong> 하나 이상의 API 키를 설정하면 자동으로 fallback 시스템이 작동합니다. 
                                Claude → Gemini → OpenAI 순서로 시도됩니다.
                            </p>
                        </div>
                        
                        <div class="border-t pt-4">
                            <button id="showProjectModal" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition mb-2">
                                <i class="fas fa-folder-open mr-2"></i>프로젝트 관리
                            </button>
                            <button id="saveSettings" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition">
                                설정 저장
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- JavaScript Libraries -->
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/html-docx-js@0.4.1/dist/html-docx.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/marked@9.1.6/marked.min.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app
// Updated for environment variables Tue Sep  2 05:57:27 UTC 2025
