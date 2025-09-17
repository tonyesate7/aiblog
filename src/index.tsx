import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

// AI 이미지 생성 도구 import
declare function image_generation(params: {
  query: string
  model: string
  aspect_ratio: string
  task_summary: string
  image_urls: string[]
}): Promise<{
  generated_images?: Array<{
    image_urls_nowatermark?: string[]
  }>
}>

type Bindings = {
  OPENAI_API_KEY?: string
  CLAUDE_API_KEY?: string
  GEMINI_API_KEY?: string
  GROK_API_KEY?: string
  FAL_AI_API_KEY?: string
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
  },

  grok: {
    name: 'Grok-2 Beta',
    endpoint: 'https://api.x.ai/v1/chat/completions',
    headers: (apiKey: string) => ({
      'authorization': `Bearer ${apiKey}`,
      'content-type': 'application/json'
    }),
    formatRequest: (prompt: string, options = {}) => ({
      model: 'grok-2-1212',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: options.maxTokens || 3000,
      temperature: 0.8, // GROK은 창의성을 위해 약간 높은 temperature
      stream: false
    }),
    parseResponse: (response: any) => response.choices?.[0]?.message?.content || '',
    maxRetries: 3,
    timeoutMs: 45000 // GROK은 조금 더 긴 타임아웃
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
        
        // Rate limit 에러 특별 처리
        if (response.status === 429) {
          console.log(`⚠️ Rate limit 도달 (${model}): ${errorText}`)
          throw new Error(`RATE_LIMIT_${model.toUpperCase()}`)
        }
        
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

// ==================== AI 전문가 시스템 ====================

interface AIExpert {
  name: string
  strengths: string[]
  expertise: string[]
  optimalFor: {
    audiences: string[]
    topics: string[]
    contentTypes: string[]
  }
  promptStyle: string
  reasoning: string
}

// AI 모델별 전문가 프로필
const aiExperts: Record<string, AIExpert> = {
  claude: {
    name: 'Claude 3.5 Haiku - 분석 전문가',
    strengths: ['논리적 분석', '구조화된 사고', '객관적 설명', '데이터 기반 해석'],
    expertise: ['비즈니스 분석', '기술 리서치', '학술 연구', '전략 수립', '데이터 분석'],
    optimalFor: {
      audiences: ['전문가', '중급자'],
      topics: ['기술', '비즈니스', '투자', '분석', '연구', '전략', 'AI', '데이터', '경제'],
      contentTypes: ['분석 리포트', '기술 문서', '연구 논문', '시장 분석', '전략 가이드']
    },
    promptStyle: '체계적이고 논리적인 분석 중심',
    reasoning: '깊이 있는 분석과 객관적 데이터 해석에 특화되어 전문적인 인사이트 제공'
  },
  
  gemini: {
    name: 'Gemini 1.5 Flash - 교육 전문가', 
    strengths: ['체계적 설명', '단계별 가이드', '구조화된 학습', '실용적 접근'],
    expertise: ['교육 콘텐츠', '튜토리얼', '방법론', '프로세스 설계', '학습 가이드'],
    optimalFor: {
      audiences: ['초보자', '중급자'],
      topics: ['학습', '교육', '방법', '가이드', '튜토리얼', '프로세스', '단계', '시스템'],
      contentTypes: ['하우투 가이드', '단계별 튜토리얼', '학습 로드맵', '실용 가이드', '방법론']
    },
    promptStyle: '체계적이고 교육적인 단계별 접근',
    reasoning: '복잡한 내용을 체계적으로 정리하여 학습하기 쉬운 형태로 구조화하는 데 특화'
  },
  
  openai: {
    name: 'GPT-4o-mini - 소통 전문가',
    strengths: ['자연스러운 대화', '창의적 표현', '감정적 소통', '스토리텔링'],
    expertise: ['콘텐츠 마케팅', '라이프스타일', '개인 경험', '창의적 글쓰기', '일상 소통'],
    optimalFor: {
      audiences: ['일반인', '초보자'],
      topics: ['라이프스타일', '취미', '여행', '음식', '건강', '관계', '일상', '문화', '엔터테인먼트'],
      contentTypes: ['블로그 포스트', '개인 경험담', '라이프스타일 글', '마케팅 콘텐츠', '스토리']
    },
    promptStyle: '친근하고 자연스러운 대화체',
    reasoning: '독자와의 감정적 연결과 자연스러운 소통을 통해 친근하고 매력적인 콘텐츠 생성'
  },

  grok: {
    name: 'Grok-2 Beta - 트렌드 & 창의성 전문가',
    strengths: ['실시간 트렌드 반영', '창의적 아이디어', '유머러스한 표현', '자유로운 사고', '바이럴 요소'],
    expertise: ['소셜미디어 콘텐츠', '트렌드 분석', '바이럴 마케팅', '창의적 스토리텔링', '젊은층 소통'],
    optimalFor: {
      audiences: ['일반인', '젊은층'],
      topics: ['트렌드', '소셜미디어', '엔터테인먼트', '스타트업', '기술 트렌드', '문화', '유머', '바이럴', '최신'],
      contentTypes: ['바이럴 콘텐츠', '소셜미디어 포스트', '트렌드 분석', '창의적 에세이', '인플루언서 콘텐츠']
    },
    promptStyle: '재치있고 트렌디한 창의적 접근',
    reasoning: '실시간 트렌드와 최신 정보를 활용해 젊은층에게 어필하는 창의적이고 바이럴 가능성 높은 콘텐츠 생성'
  }
}

// 사용 불가능한 모델 추적
const unavailableModels = new Set<string>()

// Rate limit으로 인한 모델 차단 (5분간)
function blockModelTemporarily(model: string) {
  unavailableModels.add(model)
  console.log(`🚫 모델 임시 차단: ${model} (5분간)`)
  
  // 5분 후 자동 해제
  setTimeout(() => {
    unavailableModels.delete(model)
    console.log(`✅ 모델 차단 해제: ${model}`)
  }, 5 * 60 * 1000)
}

// 전문가 모델 선택 로직 (스마트 fallback 포함)
function selectExpertModel(topic: string, audience: string, tone: string): { 
  model: string
  expert: AIExpert
  confidence: number
  reasoning: string
} {
  const topicLower = topic.toLowerCase()
  const scores: Record<string, number> = { claude: 0, gemini: 0, openai: 0, grok: 0 }
  
  // 1. 독자층 기반 점수 (40%)
  Object.entries(aiExperts).forEach(([model, expert]) => {
    if (expert.optimalFor.audiences.includes(audience)) {
      scores[model] += 40
    }
  })
  
  // 2. 주제 키워드 매칭 (35%)
  Object.entries(aiExperts).forEach(([model, expert]) => {
    const matchCount = expert.optimalFor.topics.filter(keyword => 
      topicLower.includes(keyword)
    ).length
    scores[model] += matchCount * 8 // 키워드당 8점
  })
  
  // 3. 톤 매칭 (15%)
  if (tone === '전문적' || tone === '진지한') {
    scores.claude += 15
  } else if (tone === '친근한') {
    scores.openai += 12
    scores.gemini += 10
    scores.grok += 8
  } else if (tone === '유머러스') {
    scores.grok += 15  // GROK이 유머에 최적화
    scores.openai += 12
    scores.gemini += 8
  }
  
  // 4. 전문 영역 매칭 (10%)
  Object.entries(aiExperts).forEach(([model, expert]) => {
    const expertiseMatch = expert.expertise.some(area => 
      topicLower.includes(area.toLowerCase())
    )
    if (expertiseMatch) scores[model] += 10
  })

  // 5. GROK 특화 점수 (추가 보너스)
  // 트렌드/실시간성 키워드
  const trendKeywords = ['트렌드', '최신', '요즘', '화제', '인기', '바이럴', '실시간', '지금', '현재']
  const hasTrendKeywords = trendKeywords.some(keyword => topicLower.includes(keyword))
  if (hasTrendKeywords) {
    scores.grok += 25
  }

  // 소셜미디어/젊은층 키워드
  const socialKeywords = ['소셜미디어', 'sns', '인스타', '틱톡', 'mz세대', 'z세대', '젊은', '20대', '30대']
  const hasSocialKeywords = socialKeywords.some(keyword => topicLower.includes(keyword))
  if (hasSocialKeywords) {
    scores.grok += 20
  }

  // 창의성/엔터테인먼트 키워드
  const creativeKeywords = ['창의', '아이디어', '재미', '유머', '엔터테인먼트', '문화', '예술', '콘텐츠']
  const hasCreativeKeywords = creativeKeywords.some(keyword => topicLower.includes(keyword))
  if (hasCreativeKeywords) {
    scores.grok += 15
  }

  // 일반인 + 유머러스 조합 시 GROK 추가 보너스
  if (audience === '일반인' && tone === '유머러스') {
    scores.grok += 20
  }

  // 젊은층 타겟팅 시 추가 보너스
  if (audience === '일반인' || audience === '초보자') {
    scores.grok += 10
  }
  
  // 사용 가능한 모델들만 필터링
  const availableModels = Object.entries(scores).filter(([model]) => !unavailableModels.has(model))
  
  if (availableModels.length === 0) {
    // 모든 모델이 사용 불가능한 경우 - Claude를 강제 선택 (가장 안정적)
    console.log('⚠️ 모든 모델 사용 불가능, Claude로 강제 선택')
    return {
      model: 'claude',
      expert: aiExperts.claude,
      confidence: 50,
      reasoning: 'Rate limit으로 인해 Claude가 fallback으로 선택되었습니다.'
    }
  }
  
  // 최고 점수 모델 선택 (사용 가능한 모델 중에서)
  const bestModel = availableModels.reduce((a, b) => 
    scores[a[0]] > scores[b[0]] ? a : b
  )[0] as keyof typeof aiExperts
  
  const confidence = Math.min(scores[bestModel], 100)
  const expert = aiExperts[bestModel]
  
  // 선택 이유 생성
  let reasoning = `${expert.name} 선택 이유:\n`
  reasoning += `• 대상 독자 "${audience}"에 최적화\n`
  reasoning += `• 주제 "${topic}"에 대한 전문성\n`
  reasoning += `• ${expert.reasoning}`
  
  // 차단된 모델이 있으면 알림 추가
  if (unavailableModels.size > 0) {
    reasoning += `\n• Rate limit으로 차단된 모델: ${Array.from(unavailableModels).join(', ')}`
  }
  
  return { model: bestModel, expert, confidence, reasoning }
}

// ==================== 고급 프롬프트 엔지니어링 시스템 ====================

interface ContentTemplate {
  structure: string[]
  keyElements: string[]
  qualityCriteria: string[]
  examples: string
  specificGuidelines: string
}

// 독자층별 콘텐츠 템플릿
const contentTemplates: Record<string, ContentTemplate> = {
  '일반인': {
    structure: [
      "관심을 끄는 도입부 (문제 제기 또는 흥미로운 사실)",
      "주제에 대한 쉬운 설명 (일상 비유 활용)",
      "왜 중요한지 설명 (개인적 이익 중심)",
      "실생활 적용 방법 (구체적 예시 3가지)",
      "실행 가능한 첫 번째 단계 제안"
    ],
    keyElements: [
      "일상생활 비유와 예시 활용",
      "전문용어 최소화 및 쉬운 설명",
      "독자의 개인적 이익 강조",
      "즉시 실행 가능한 팁 제공"
    ],
    qualityCriteria: [
      "중학생도 이해할 수 있는 난이도",
      "구체적인 숫자와 사례 포함",
      "읽는 재미와 유익함 동시 제공"
    ],
    examples: "예: '투자'라는 주제라면 → '매월 용돈 관리하기'부터 시작",
    specificGuidelines: "복잡한 개념은 단계별로 나누어 설명하고, 각 단계마다 실생활 예시를 들어주세요."
  },

  '초보자': {
    structure: [
      "주제 소개 및 학습 목표 명시",
      "기본 개념과 핵심 용어 정리 (용어집 형태)",
      "단계별 학습 로드맵 (1단계→2단계→3단계)",
      "각 단계별 실습 과제와 체크리스트",
      "자주 하는 실수와 해결 방법",
      "다음 학습 단계 가이드"
    ],
    keyElements: [
      "체계적이고 순서가 있는 설명",
      "용어 정의와 개념 정리",
      "단계별 실습 가이드",
      "초보자 관점에서의 주의사항"
    ],
    qualityCriteria: [
      "논리적 순서와 체계성",
      "실습 가능한 구체적 단계",
      "진도 확인이 가능한 체크포인트"
    ],
    examples: "예: 각 섹션 끝에 '✅ 이해했다면 체크' 항목 추가",
    specificGuidelines: "초보자가 중도 포기하지 않도록 작은 성취감을 느낄 수 있는 단계들로 구성해주세요."
  },

  '중급자': {
    structure: [
      "현재 트렌드와 업계 동향 분석",
      "기존 방법의 한계점과 개선 방향",
      "고급 기법과 최적화 전략",
      "실제 케이스 스터디 (성공/실패 사례)",
      "성과 측정 방법과 KPI",
      "전문가 수준으로 발전하는 로드맵"
    ],
    keyElements: [
      "심화된 기법과 전략",
      "실제 데이터와 사례 분석",
      "효율성과 최적화 중심",
      "측정 가능한 성과 지표"
    ],
    qualityCriteria: [
      "실무에 바로 적용 가능한 내용",
      "구체적 수치와 데이터 근거",
      "비교 분석과 장단점 평가"
    ],
    examples: "예: A/B 테스트 결과, ROI 계산, 전후 비교 데이터",
    specificGuidelines: "이론보다는 실무 경험과 데이터를 바탕으로 한 인사이트를 제공해주세요."
  },

  '전문가': {
    structure: [
      "최신 연구 동향과 기술 발전",
      "심층 분석 및 메타 분석",
      "혁신적 접근법과 패러다임 변화",
      "업계 리더들의 전략과 인사이트",
      "미래 전망과 예측 분석",
      "전략적 의사결정 가이드라인"
    ],
    keyElements: [
      "최신성과 전문성",
      "깊이 있는 분석과 통찰",
      "전략적 관점과 거시적 시각",
      "리더십과 의사결정 관점"
    ],
    qualityCriteria: [
      "업계 최신 트렌드 반영",
      "데이터 기반 심층 분석",
      "전략적 가치와 통찰력"
    ],
    examples: "예: 시장 점유율 변화, 투자 동향, 기술 로드맵 분석",
    specificGuidelines: "단순한 설명보다는 전략적 관점에서 해석하고 미래 방향을 제시해주세요."
  },

  '직장인': {
    structure: [
      "바쁜 현실을 공감하는 도입부",
      "업무나 일상에 직접적 도움이 되는 이유 설명",
      "시간 효율적인 실천 방법 (5-10분 내)",
      "직장 생활 맞춤 활용법 (점심시간, 출퇴근 등)",
      "동료나 상사와 공유할 만한 핵심 포인트",
      "스트레스 없이 지속 가능한 습관화 방법"
    ],
    keyElements: [
      "시간 부족 상황 고려한 효율적 방법",
      "업무 성과나 스트레스 해소와 연결",
      "실제 직장인 사례와 경험담",
      "바로 적용 가능한 실용적 팁"
    ],
    qualityCriteria: [
      "10분 내 읽을 수 있는 분량",
      "바로 실행 가능한 구체적 방법",
      "업무 효율성 향상과 연결"
    ],
    examples: "예: 점심시간 5분 투자, 출근길 습관, 야근 시 스트레스 관리",
    specificGuidelines: "직장인의 바쁜 일정을 고려하여 최소한의 시간으로 최대 효과를 낼 수 있는 방법을 제시해주세요."
  }
}

// 톤별 문체 가이드라인
const toneGuidelines = {
  '친근한': {
    voice: "친구와 대화하는 듯한 편안한 말투",
    techniques: ["반말과 존댓말 적절히 섞기", "이모티콘과 이모지 활용", "공감 표현 자주 사용"],
    avoid: ["너무 격식적인 표현", "딱딱한 전문용어", "거리감 있는 어투"]
  },
  '전문적': {
    voice: "객관적이고 정확한 정보 전달",
    techniques: ["데이터와 근거 제시", "논리적 구조", "명확한 결론"],
    avoid: ["주관적 의견", "감정적 표현", "모호한 표현"]
  },
  '유머러스': {
    voice: "재미있고 기억하기 쉬운 표현",
    techniques: ["적절한 농담과 재치", "재미있는 비유", "유머러스한 예시"],
    avoid: ["지나친 개그", "진부한 농담", "주제와 동떨어진 유머"]
  },
  '진지한': {
    voice: "신중하고 깊이 있는 접근",
    techniques: ["신중한 분석", "다각도 검토", "책임감 있는 제안"],
    avoid: ["가벼운 표현", "성급한 결론", "피상적인 내용"]
  },
  '친근하고 실용적': {
    voice: "친숙하면서도 도움이 되는 조언자 톤",
    techniques: ["공감하는 어조", "구체적 실행 방법 제시", "일상 친화적 예시", "즉시 적용 가능한 팁"],
    avoid: ["딱딱한 이론", "추상적 개념", "복잡한 전문용어"]
  }
}

// 품질 기준 체크리스트
const qualityStandards = [
  "제목이 주제를 명확히 표현하고 있는가?",
  "도입부가 독자의 관심을 효과적으로 끄는가?",
  "논리적 흐름이 자연스러운가?",
  "구체적인 예시와 데이터가 포함되어 있는가?",
  "실용적이고 실행 가능한 조언이 있는가?",
  "결론이 명확하고 기억에 남는가?",
  "독자가 다음에 무엇을 해야 할지 제시되어 있는가?"
]

// ==================== Phase 1: 즉시 적용 품질 향상 시스템 ====================

// 1. 감정적 훅 템플릿 시스템
const emotionalHooks = {
  '문제공감': [
    '"또 이런 경험 하셨죠?"',
    '"혹시 이런 고민으로 잠 못 이루신 적 있나요?"',
    '"이런 상황, 너무 익숙하지 않으세요?"'
  ],
  '호기심유발': [
    '"이 한 가지만 바꿨는데 완전히 달라졌습니다"',
    '"10명 중 9명이 모르는 비밀이 있습니다"',
    '"전문가들도 놀란 이 방법을 알려드릴게요"'
  ],
  '통계충격': [
    '"놀랍게도 87%의 사람들이 이 실수를 반복합니다"',
    '"단 3일만에 결과가 나타나는 이유가 있었습니다"',
    '"연구 결과가 모든 것을 뒤바꿨습니다"'
  ]
}

// 2. 실용성 체크리스트 시스템
const practicalityRequirements = {
  '즉시실행': [
    '5분 내 시작할 수 있는 첫 번째 단계',
    '특별한 도구 없이 할 수 있는 방법',
    '오늘부터 적용 가능한 구체적 행동'
  ],
  '구체적수치': [
    '정확한 시간 (예: 15분, 3일, 2주)',
    '구체적 비용 (예: 월 10,000원 이하)',
    '측정 가능한 목표 (예: 30% 개선, 2배 증가)'
  ],
  '체크포인트': [
    '1단계 완료 후 확인할 점',
    '잘못 가고 있을 때 알아차리는 신호',
    '성공했을 때 나타나는 변화'
  ]
}

// 3. 출처 요구 시스템
const sourceRequirements = {
  '통계수치': '모든 %와 수치에는 출처 명시 (예: "한국인터넷진흥원 2024년 조사")',
  '전문가인용': '권위있는 전문가 의견 인용 (예: "서울대 김교수 연구팀")',
  '사례연구': '실제 기업/개인 성공사례 (예: "A회사는 이 방법으로 매출 40% 증가")',
  '최신성': '2023년 이후 최신 데이터 우선 사용'
}

// 4. 문장 길이 자동 조절 시스템
const sentenceOptimization = {
  '강조문': '5-8단어 (임팩트 있는 핵심 메시지)',
  '설명문': '12-18단어 (이해하기 쉬운 설명)',
  '상세문': '20-25단어 (복잡한 개념 풀어서 설명)',
  '연결문': '6-10단어 (다음 내용으로의 자연스러운 연결)'
}

function generateAdvancedPrompt(topic: string, audience: string, tone: string, selectedModel: string = 'claude'): string {
  // 안전한 템플릿 선택 (기본값: 일반인)
  const template = contentTemplates[audience] || contentTemplates['일반인']
  const toneGuide = toneGuidelines[tone as keyof typeof toneGuidelines] || toneGuidelines['친근한']
  const expert = aiExperts[selectedModel] || aiExperts['openai']
  
  // Phase 1 개선: 감정적 훅 선택
  const selectedHook = emotionalHooks[Object.keys(emotionalHooks)[Math.floor(Math.random() * 3)] as keyof typeof emotionalHooks]
  const randomHook = selectedHook[Math.floor(Math.random() * selectedHook.length)]
  
  // 모델별 최적화된 역할 설정 (개선됨)
  const rolePrompts = {
    claude: `당신은 ${expert.name}입니다. ${expert.strengths.join(', ')}에 특화된 전문 분석가로서, 데이터 기반의 객관적이고 논리적인 분석을 통해 깊이 있는 인사이트를 제공합니다.`,
    gemini: `당신은 ${expert.name}입니다. ${expert.strengths.join(', ')}에 특화된 교육 전문가로서, 복잡한 내용을 체계적으로 정리하여 단계별로 이해하기 쉽게 설명합니다.`,
    openai: `당신은 ${expert.name}입니다. ${expert.strengths.join(', ')}에 특화된 콘텐츠 크리에이터로서, 독자와의 자연스러운 소통을 통해 매력적이고 공감대가 형성되는 글을 작성합니다.`,
    grok: `당신은 ${expert.name}입니다. ${expert.strengths.join(', ')}에 특화된 트렌드 분석가이자 창의적 콘텐츠 전문가로서, 최신 트렌드를 반영하고 젊은층에게 어필하는 재치있고 바이럴 가능성 높은 콘텐츠를 생성합니다.`
  }
  
  return `${rolePrompts[selectedModel as keyof typeof rolePrompts] || rolePrompts.claude}

🎯 **전문 영역 활용**: ${expert.expertise.join(', ')}
💡 **핵심 역량**: ${expert.reasoning}

다음 과정을 따라 단계별로 생각하며 당신의 전문성을 최대한 활용한 최고 품질의 블로그 글을 작성해주세요.

🎯 **Phase 1 품질 향상 분석 단계**
주제: "${topic}"
대상 독자: ${audience}
글의 톤: ${tone}

**🔥 감정적 훅 적용**: ${randomHook}
위 훅을 활용하여 도입부를 작성하세요.

먼저 다음을 분석해주세요:
1. 이 주제에서 ${audience}이 가장 궁금해할 핵심 질문 3가지
2. 독자가 이 글을 읽은 후 얻고 싶어할 구체적 이익
3. 이 주제와 관련된 최신 트렌드나 이슈 (2023-2024년 데이터 활용)

🏗️ **콘텐츠 구조 설계**
다음 구조를 따라 작성해주세요:
${template.structure.map((item, index) => `${index + 1}. ${item}`).join('\n')}

📝 **핵심 요소 포함사항 (Phase 1 강화)**
${template.keyElements.map(item => `✓ ${item}`).join('\n')}

🚀 **Phase 1 필수 품질 요소**:
✓ ${practicalityRequirements['즉시실행'].join('\n✓ ')}
✓ ${practicalityRequirements['구체적수치'].join('\n✓ ')}
✓ ${practicalityRequirements['체크포인트'].join('\n✓ ')}

📊 **출처 및 신뢰성 요구사항**:
✓ ${sourceRequirements['통계수치']}
✓ ${sourceRequirements['전문가인용']}
✓ ${sourceRequirements['사례연구']}
✓ ${sourceRequirements['최신성']}

🎨 **톤 & 스타일 가이드라인**
- 문체: ${toneGuide.voice}
- 기법: ${toneGuide.techniques.join(', ')}
- 피할 것: ${toneGuide.avoid.join(', ')}

⭐ **품질 기준**
${template.qualityCriteria.map(item => `• ${item}`).join('\n')}

📚 **작성 예시 참고**
${template.examples}

🔥 **특별 지침**
${template.specificGuidelines}

📋 **Phase 1 강화된 최종 체크리스트**
작성 완료 후 다음을 확인해주세요:
${qualityStandards.map(item => `☐ ${item}`).join('\n')}

🎯 **Phase 1 추가 품질 체크**:
☐ 도입부에 감정적 훅이 효과적으로 사용되었는가?
☐ 모든 통계와 주장에 구체적 출처가 명시되어 있는가?
☐ 읽은 후 10분 내 실행할 수 있는 구체적 행동이 제시되어 있는가?
☐ 문장 길이가 적절히 조절되어 읽기 편한가? (강조: 5-8단어, 설명: 12-18단어)
☐ 2023-2024년 최신 정보와 트렌드가 반영되어 있는가?
☐ 성공했을 때와 실패했을 때의 구체적 신호가 제시되어 있는가?

---

위의 모든 가이드라인을 종합하여, "${topic}"에 대한 ${audience} 대상의 ${tone} 톤 블로그 글을 마크다운 형식으로 작성해주세요. 

**📏 Phase 1 문장 길이 최적화 가이드**:
- 🎯 강조할 내용: 5-8단어 (${sentenceOptimization['강조문']})
- 📖 일반 설명: 12-18단어 (${sentenceOptimization['설명문']})
- 📚 상세 설명: 20-25단어 (${sentenceOptimization['상세문']})
- 🔗 연결 문장: 6-10단어 (${sentenceOptimization['연결문']})

글의 분량: 2500-4000자
언어: 한국어
형식: 마크다운

**⚡ Phase 1 핵심 원칙**: 감정적 연결 → 구체적 근거 → 즉시 실행 가능 → 측정 가능한 결과

이제 단계별로 생각하며 글을 작성해주세요:`
}

// ==================== SEO 최적화 시스템 ====================

interface SEOOptions {
  targetKeywords?: string[]
  focusKeyword?: string
  contentLength?: 'short' | 'medium' | 'long'
  includeStructuredData?: boolean
}

interface SEOResult {
  content: string
  seoMetadata: {
    title: string
    metaDescription: string
    keywords: string[]
    focusKeyword: string
    headings: Array<{ level: number; text: string }>
    readingTime: number
    wordCount: number
  }
  structuredData?: any
  seoAnalysis: {
    keywordDensity: number
    readabilityScore: number
    seoScore: number
    recommendations: string[]
  }
}

function generateSEOPrompt(topic: string, audience: string, tone: string, seoOptions: SEOOptions = {}, selectedModel: string = 'claude'): string {
  const template = contentTemplates[audience]
  const toneGuide = toneGuidelines[tone as keyof typeof toneGuidelines]
  
  const focusKeyword = seoOptions.focusKeyword || topic
  const targetKeywords = seoOptions.targetKeywords || []
  const contentLength = seoOptions.contentLength || 'medium'
  
  const lengthGuides = {
    short: '1500-2000자, 빠른 읽기용',
    medium: '2500-4000자, 균형잡힌 깊이',
    long: '4000-6000자, 심층 분석용'
  }

  const expert = aiExperts[selectedModel]
  
  const seoRolePrompts = {
    claude: `당신은 SEO 분석 전문가입니다. 데이터 기반의 논리적 분석을 통해 검색엔진 최적화된 전문적인 콘텐츠를 작성합니다.`,
    gemini: `당신은 SEO 교육 전문가입니다. 체계적이고 구조화된 접근으로 검색엔진과 사용자 모두에게 최적화된 학습 친화적 콘텐츠를 작성합니다.`,
    openai: `당신은 SEO 콘텐츠 마케터입니다. 자연스럽고 매력적인 표현으로 검색엔진 최적화와 사용자 경험을 모두 만족하는 콘텐츠를 작성합니다.`,
    grok: `당신은 바이럴 SEO 전문가입니다. 최신 트렌드를 반영하고 젊은층의 검색 패턴을 분석하여 바이럴 가능성과 검색엔진 최적화를 동시에 만족하는 창의적 콘텐츠를 작성합니다.`
  }

  return `${seoRolePrompts[selectedModel as keyof typeof seoRolePrompts] || seoRolePrompts.claude}

🎯 **전문 영역**: ${expert.expertise.join(', ')}
💡 **특화 역량**: ${expert.reasoning}

당신의 전문성을 활용하여 검색엔진 최적화된 고품질 블로그 글을 작성해주세요.

🎯 **SEO 목표 설정**
- 주요 키워드: "${focusKeyword}"
- 타겟 키워드: ${targetKeywords.length > 0 ? targetKeywords.join(', ') : '자동 추출'}
- 콘텐츠 길이: ${lengthGuides[contentLength]}
- 대상 독자: ${audience}
- 글의 톤: ${tone}

🔍 **SEO 키워드 전략**
1. 주요 키워드 "${focusKeyword}"를 제목에 자연스럽게 포함
2. 키워드 밀도 1-3% 유지 (과도한 사용 금지)
3. 관련 LSI 키워드 5-10개 발굴하여 자연스럽게 포함
4. 롱테일 키워드 3-5개 활용

📝 **SEO 최적화 콘텐츠 구조**

**제목 (H1)**: 
- 50-60자 내외
- 주요 키워드 포함
- 클릭을 유도하는 매력적인 제목
- 숫자나 파워워드 활용

**메타 디스크립션용 요약**: 
- 150-160자 내외
- 주요 키워드 포함
- 독자의 검색 의도 충족
- 클릭 유도 문구 포함

**본문 구조**:
${template.structure.map((item, index) => `H${index <= 1 ? '2' : '3'}. ${item} (키워드 자연스럽게 포함)`).join('\n')}

🏷️ **헤딩 태그 최적화 가이드**
- H1: 메인 제목 (1개만)
- H2: 주요 섹션 (3-5개)
- H3: 하위 섹션 (필요시)
- 각 헤딩에 키워드 자연스럽게 포함

📊 **SEO 품질 체크리스트**
✓ 키워드가 제목, 첫 문단, 마지막 문단에 포함
✓ 내부 링크 제안 (관련 주제 3-5개)
✓ 외부 권위 링크 제안 (신뢰할 만한 소스 2-3개)
✓ 이미지 alt 텍스트 제안 (3-5개 이미지)
✓ FAQ 섹션 포함 (검색 의도 충족)
✓ 실행 가능한 결론 및 CTA

🎨 **톤 & 스타일**
- 문체: ${toneGuide.voice}
- SEO 친화적이면서도 자연스러운 글쓰기
- 독자 중심의 가치 제공

📈 **추가 SEO 요소**
1. **내부 링크 제안**: 관련 주제로 연결할 수 있는 앵커 텍스트 3-5개 제안
2. **이미지 제안**: 포함할 이미지와 SEO 친화적 alt 텍스트 제안
3. **FAQ 섹션**: 검색 의도에 맞는 자주 묻는 질문 3-5개
4. **스키마 마크업**: Article 구조화 데이터 정보 제공

---

**중요**: 반드시 JSON 형식으로만 응답해주세요. 다른 설명은 포함하지 마세요.

출력 형식:
{
  "title": "SEO 최적화된 제목 (50-60자)",
  "metaDescription": "메타 디스크립션 (150-160자)",
  "content": "마크다운 형식의 본문 (줄바꿈은 \\n으로)",
  "keywords": ["주요키워드", "LSI키워드1", "LSI키워드2", "롱테일키워드1"],
  "headings": [
    {"level": 1, "text": "H1 제목"},
    {"level": 2, "text": "H2 섹션 제목"}
  ],
  "internalLinks": [
    {"anchor": "앵커 텍스트", "suggestedUrl": "관련 주제 URL 제안"}
  ],
  "images": [
    {"description": "이미지 설명", "altText": "SEO 친화적 alt 텍스트"}
  ],
  "faq": [
    {"question": "자주 묻는 질문", "answer": "간단한 답변"}
  ],
  "structuredData": {
    "@type": "Article",
    "headline": "제목",
    "description": "메타 디스크립션",
    "keywords": "키워드,리스트"
  }
}

"${topic}"에 대한 SEO 최적화 콘텐츠를 위 JSON 형식으로만 생성해주세요:`
}

function parseSEOResult(aiResponse: string): SEOResult {
  try {
    // JSON 블록 추출 시도 (여러 패턴 지원)
    let jsonText = aiResponse.trim()
    
    // ```json 블록이 있으면 추출
    const codeBlockMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/)
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1]
    }
    
    // 첫 번째 { 부터 마지막 } 까지 추출
    const firstBrace = jsonText.indexOf('{')
    const lastBrace = jsonText.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonText = jsonText.slice(firstBrace, lastBrace + 1)
    }
    
    const parsed = JSON.parse(jsonText)
      
      // 기본값 설정
      const content = parsed.content || aiResponse
      const wordCount = content.replace(/[^\w\s가-힣]/g, '').split(/\s+/).length
      const readingTime = Math.ceil(wordCount / 200) // 분당 200단어 기준
      
      return {
        content: parsed.content || aiResponse,
        seoMetadata: {
          title: parsed.title || `${parsed.keywords?.[0] || '주제'}에 대한 완벽 가이드`,
          metaDescription: parsed.metaDescription || content.slice(0, 150) + '...',
          keywords: parsed.keywords || [],
          focusKeyword: parsed.keywords?.[0] || '',
          headings: parsed.headings || [],
          readingTime,
          wordCount
        },
        structuredData: parsed.structuredData || null,
        seoAnalysis: {
          keywordDensity: calculateKeywordDensity(content, parsed.keywords?.[0] || ''),
          readabilityScore: calculateReadabilityScore(content),
          seoScore: calculateSEOScore(parsed),
          recommendations: generateSEORecommendations(parsed, content)
        }
      }
    } catch (error) {
      console.error('SEO 결과 파싱 오류:', error)
    }
  
  // 파싱 실패시 기본 형태로 반환
  const wordCount = aiResponse.replace(/[^\w\s가-힣]/g, '').split(/\s+/).length
  return {
    content: aiResponse,
    seoMetadata: {
      title: '블로그 제목',
      metaDescription: aiResponse.slice(0, 150) + '...',
      keywords: [],
      focusKeyword: '',
      headings: [],
      readingTime: Math.ceil(wordCount / 200),
      wordCount
    },
    structuredData: null,
    seoAnalysis: {
      keywordDensity: 0,
      readabilityScore: 70,
      seoScore: 60,
      recommendations: ['SEO 데이터를 파싱할 수 없습니다.']
    }
  }
}

function calculateKeywordDensity(content: string, keyword: string): number {
  if (!keyword) return 0
  const words = content.toLowerCase().split(/\s+/)
  const keywordCount = words.filter(word => word.includes(keyword.toLowerCase())).length
  return Math.round((keywordCount / words.length) * 100 * 100) / 100 // 소수점 2자리
}

function calculateReadabilityScore(content: string): number {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const words = content.split(/\s+/)
  const avgWordsPerSentence = words.length / sentences.length
  
  // 간단한 가독성 점수 (낮을수록 읽기 쉬움)
  let score = 100
  if (avgWordsPerSentence > 20) score -= 10
  if (avgWordsPerSentence > 30) score -= 20
  if (avgWordsPerSentence > 40) score -= 30
  
  return Math.max(score, 30)
}

function calculateSEOScore(parsed: any): number {
  let score = 0
  
  // 제목 최적화 (20점)
  if (parsed.title && parsed.title.length >= 30 && parsed.title.length <= 60) score += 20
  else if (parsed.title) score += 10
  
  // 메타 디스크립션 (15점)
  if (parsed.metaDescription && parsed.metaDescription.length >= 120 && parsed.metaDescription.length <= 160) score += 15
  else if (parsed.metaDescription) score += 10
  
  // 키워드 (25점)
  if (parsed.keywords && parsed.keywords.length >= 5) score += 25
  else if (parsed.keywords && parsed.keywords.length >= 3) score += 15
  
  // 헤딩 구조 (20점)
  if (parsed.headings && parsed.headings.length >= 3) score += 20
  else if (parsed.headings && parsed.headings.length >= 1) score += 10
  
  // 내부 링크 (10점)
  if (parsed.internalLinks && parsed.internalLinks.length >= 3) score += 10
  else if (parsed.internalLinks && parsed.internalLinks.length >= 1) score += 5
  
  // FAQ (10점)
  if (parsed.faq && parsed.faq.length >= 3) score += 10
  else if (parsed.faq && parsed.faq.length >= 1) score += 5
  
  return Math.min(score, 100)
}

function generateSEORecommendations(parsed: any, content: string): string[] {
  const recommendations = []
  
  if (!parsed.title || parsed.title.length < 30) {
    recommendations.push('제목을 30-60자로 최적화하세요')
  }
  
  if (!parsed.metaDescription || parsed.metaDescription.length < 120) {
    recommendations.push('메타 디스크립션을 120-160자로 작성하세요')
  }
  
  if (!parsed.keywords || parsed.keywords.length < 5) {
    recommendations.push('관련 키워드를 5개 이상 포함하세요')
  }
  
  if (!parsed.headings || parsed.headings.length < 3) {
    recommendations.push('H2, H3 헤딩을 3개 이상 사용하세요')
  }
  
  if (!parsed.internalLinks || parsed.internalLinks.length < 3) {
    recommendations.push('내부 링크를 3개 이상 추가하세요')
  }
  
  if (!parsed.faq || parsed.faq.length < 3) {
    recommendations.push('FAQ 섹션을 추가하여 검색 의도를 충족하세요')
  }
  
  return recommendations.length > 0 ? recommendations : ['SEO 최적화가 잘 되었습니다!']
}

// 데모 함수 제거됨 - 항상 실제 API 호출 사용

// 데모 함수 제거됨 - 항상 실제 API 호출 사용

// ==================== 품질 검증 시스템 (QA System) ====================

interface QualityReview {
  score: number // 1-10 점수
  strengths: string[]
  weaknesses: string[]
  improvements: string[]
  overallAssessment: string
  recommendation: 'approve' | 'improve' | 'regenerate'
}

interface QualityAssuranceResult {
  originalContent: string
  reviewResults: QualityReview
  improvedContent: string | null
  finalContent: string
  processingSteps: Array<{
    step: string
    status: 'completed' | 'in_progress' | 'failed'
    timestamp: string
    details?: string
  }>
  qualityMetrics: {
    originalScore: number
    improvedScore: number
    improvementPercentage: number
  }
  modelUsed: string
  processingTime: number
}

// AI 검토 전용 프롬프트 생성
function generateReviewPrompt(content: string, topic: string, audience: string, tone: string): string {
  return `당신은 전문적인 콘텐츠 품질 검토 전문가입니다. 다음 블로그 글을 종합적으로 분석하고 품질을 평가해주세요.

📝 **검토 대상 콘텐츠**:
주제: ${topic}
대상 독자: ${audience}
목표 톤: ${tone}

콘텐츠:
"""
${content}
"""

🎯 **검토 기준**
다음 10개 항목을 각각 1-10점으로 평가하고 종합 점수를 산출해주세요:

1. **제목의 효과성** (독자의 관심을 끄는 정도)
2. **내용의 정확성** (정보의 신뢰성과 최신성)
3. **구조의 논리성** (흐름과 체계성)
4. **독자 맞춤성** (대상 독자에게 적합한 난이도와 내용)
5. **톤의 일관성** (목표 톤과의 일치도)
6. **실용성** (실제 도움이 되는 정도)
7. **가독성** (읽기 쉬운 정도)
8. **완성도** (빠진 내용이나 부족한 부분)
9. **독창성** (차별화된 관점이나 새로운 정보)
10. **행동 유도성** (독자가 다음 행동을 취하도록 유도하는 정도)

🔍 **상세 분석 항목**
- **강점 3-5개**: 이 콘텐츠의 우수한 점들
- **약점 3-5개**: 개선이 필요한 구체적인 부분들  
- **개선 방안 5-7개**: 각 약점에 대한 구체적이고 실행 가능한 개선 제안

📊 **최종 권장사항**
종합 점수를 기준으로 다음 중 하나를 선택:
- **approve** (8-10점): 현재 상태로도 훌륭함, 게시 가능
- **improve** (5-7점): 개선하면 더 좋아질 것, 수정 권장
- **regenerate** (1-4점): 처음부터 다시 생성 필요

**중요**: 반드시 JSON 형식으로만 응답해주세요. 다른 설명은 포함하지 마세요.

출력 형식:
{
  "score": 7.5,
  "detailedScores": {
    "titleEffectiveness": 8,
    "contentAccuracy": 7,
    "logicalStructure": 8,
    "audienceRelevance": 6,
    "toneConsistency": 8,
    "practicality": 7,
    "readability": 9,
    "completeness": 6,
    "originality": 7,
    "actionInducement": 5
  },
  "strengths": [
    "명확하고 체계적인 구조로 이해하기 쉬움",
    "실용적인 예시와 구체적인 팁 제공",
    "독자의 관점에서 친근하게 작성됨"
  ],
  "weaknesses": [
    "결론 부분이 약하고 행동 유도가 부족함",
    "일부 정보의 근거나 출처가 명시되지 않음",
    "중간 부분의 설명이 다소 장황함"
  ],
  "improvements": [
    "결론에 명확한 행동 계획과 다음 단계 추가",
    "핵심 정보에 대한 신뢰할만한 출처나 데이터 보강",
    "중간 섹션의 내용을 더 간결하고 핵심적으로 정리",
    "독자 참여를 유도하는 질문이나 인터랙션 요소 추가",
    "제목을 더 구체적이고 매력적으로 개선"
  ],
  "overallAssessment": "전반적으로 좋은 구조와 내용을 가지고 있으나, 결론의 행동 유도성과 일부 정보의 신뢰성 보강이 필요합니다. 이러한 부분들을 개선하면 독자들에게 더 큰 가치를 제공할 수 있을 것입니다.",
  "recommendation": "improve"
}`
}

// 개선 프롬프트 생성
function generateImprovementPrompt(originalContent: string, reviewResults: QualityReview, topic: string, audience: string, tone: string, selectedModel: string): string {
  const expert = aiExperts[selectedModel]
  
  const rolePrompts = {
    claude: `당신은 ${expert.name}입니다. ${expert.strengths.join(', ')}에 특화된 콘텐츠 개선 전문가로서, 분석적이고 논리적인 접근을 통해 콘텐츠를 체계적으로 개선합니다.`,
    gemini: `당신은 ${expert.name}입니다. ${expert.strengths.join(', ')}에 특화된 콘텐츠 개선 전문가로서, 교육적 관점에서 구조화되고 이해하기 쉬운 콘텐츠로 개선합니다.`,
    openai: `당신은 ${expert.name}입니다. ${expert.strengths.join(', ')}에 특화된 콘텐츠 개선 전문가로서, 독자와의 소통을 강화하고 매력적인 콘텐츠로 개선합니다.`
  }
  
  return `${rolePrompts[selectedModel as keyof typeof rolePrompts] || rolePrompts.claude}

🎯 **전문 영역**: ${expert.expertise.join(', ')}
💡 **핵심 역량**: ${expert.reasoning}

전문 검토자의 분석을 바탕으로 다음 콘텐츠를 체계적으로 개선해주세요.

📊 **품질 검토 결과**
- 현재 점수: ${reviewResults.score}/10
- 최종 권장사항: ${reviewResults.recommendation}

**강점 (유지할 요소들)**:
${reviewResults.strengths.map(s => `✅ ${s}`).join('\n')}

**약점 (개선 필요 부분)**:
${reviewResults.weaknesses.map(w => `⚠️ ${w}`).join('\n')}

**구체적 개선 방안**:
${reviewResults.improvements.map((imp, idx) => `${idx + 1}. ${imp}`).join('\n')}

**검토자 종합 의견**: ${reviewResults.overallAssessment}

📝 **원본 콘텐츠**:
"""
${originalContent}
"""

🎯 **개선 목표**
주제: ${topic}
대상 독자: ${audience}
목표 톤: ${tone}
목표 품질 점수: 8.5-9.5/10

📋 **개선 지침**
1. **강점은 유지하면서** 약점만 집중적으로 개선
2. **구체적 개선 방안을 모두 반영**하되 자연스럽게 통합
3. **원본의 핵심 메시지와 구조는 유지**하면서 품질만 향상
4. **독자 경험과 실용성을 최우선**으로 고려
5. **전체 분량은 유사하게 유지** (+-20% 내외)

🚀 **당신의 전문성 활용**
- ${expert.promptStyle}
- ${expert.strengths.join(', ')} 역량을 적극 활용
- 목표 독자층에 최적화된 개선

---

위의 검토 결과와 개선 방안을 모두 반영하여, 원본 콘텐츠를 체계적으로 개선한 완전한 마크다운 형식의 블로그 글을 작성해주세요. 

**중요**: 개선된 완전한 블로그 글만 출력하고, 다른 설명이나 주석은 포함하지 마세요.`
}

// 검토 결과 파싱
function parseReviewResult(aiResponse: string): QualityReview {
  try {
    let jsonText = aiResponse.trim()
    
    // JSON 블록 추출
    const codeBlockMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/)
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1]
    }
    
    // 첫 번째 { 부터 마지막 } 까지 추출
    const firstBrace = jsonText.indexOf('{')
    const lastBrace = jsonText.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonText = jsonText.slice(firstBrace, lastBrace + 1)
    }
    
    const parsed = JSON.parse(jsonText)
    
    return {
      score: parsed.score || 6.0,
      strengths: parsed.strengths || ['기본적인 구조를 갖추고 있음'],
      weaknesses: parsed.weaknesses || ['전반적인 개선이 필요함'],
      improvements: parsed.improvements || ['내용을 더 구체화하고 실용성을 높여주세요'],
      overallAssessment: parsed.overallAssessment || '기본적인 품질은 갖추었으나 추가 개선이 필요합니다.',
      recommendation: parsed.recommendation || 'improve'
    }
  } catch (error) {
    console.error('검토 결과 파싱 오류:', error)
    
    // 파싱 실패시 기본 검토 결과 반환
    return {
      score: 6.0,
      strengths: ['기본적인 구조를 갖추고 있음'],
      weaknesses: ['전반적인 개선이 필요함'],
      improvements: ['내용을 더 구체화하고 실용성을 높여주세요'],
      overallAssessment: '검토 시스템에 오류가 발생하여 기본 평가를 제공합니다.',
      recommendation: 'improve'
    }
  }
}

// ==================== 실제 데이터 소스 연동 시스템 ====================

// 네이버 DataLab API 클라이언트
class NaverDataLabClient {
  private clientId: string
  private clientSecret: string
  private baseUrl = 'https://openapi.naver.com/v1/datalab'

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId
    this.clientSecret = clientSecret
  }

  // 네이버 DataLab 통합검색어 트렌드 조회
  async getSearchTrends(keywords: string[], startDate: string, endDate: string, options: {
    timeUnit?: 'date' | 'week' | 'month'
    device?: 'pc' | 'mo'
    gender?: 'm' | 'f'
    ages?: string[]
  } = {}): Promise<any> {
    const url = `${this.baseUrl}/search`
    
    // 키워드 그룹 생성 (최대 5개 그룹, 그룹당 최대 20개 키워드)
    const keywordGroups = keywords.slice(0, 5).map(keyword => ({
      groupName: keyword,
      keywords: [keyword]
    }))

    const requestBody = {
      startDate,
      endDate,
      timeUnit: options.timeUnit || 'month',
      keywordGroups,
      ...(options.device && { device: options.device }),
      ...(options.gender && { gender: options.gender }),
      ...(options.ages && { ages: options.ages })
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'X-Naver-Client-Id': this.clientId,
          'X-Naver-Client-Secret': this.clientSecret,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`네이버 DataLab API 오류 (${response.status}): ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('네이버 DataLab API 호출 실패:', error)
      throw error
    }
  }

  // 한국 시장 특화 키워드 트렌드 분석
  async getKoreanTrendAnalysis(topic: string): Promise<{
    trendData: any
    insights: {
      peakPeriods: string[]
      growthRate: number
      seasonality: string
      relatedTerms: string[]
    }
  }> {
    // 주제와 관련된 한국 키워드들 자동 생성
    const relatedKeywords = this.generateRelatedKoreanKeywords(topic)
    
    // 최근 1년간 월별 트렌드 조회
    const endDate = new Date()
    const startDate = new Date()
    startDate.setFullYear(endDate.getFullYear() - 1)
    
    const formatDate = (date: Date) => date.toISOString().split('T')[0]
    
    try {
      const trendData = await this.getSearchTrends(
        relatedKeywords,
        formatDate(startDate),
        formatDate(endDate),
        { timeUnit: 'month' }
      )

      // 트렌드 인사이트 분석
      const insights = this.analyzeTrendInsights(trendData)
      
      return {
        trendData,
        insights
      }
    } catch (error) {
      console.error('한국 트렌드 분석 실패:', error)
      // 폴백으로 시뮬레이션 데이터 반환
      return {
        trendData: null,
        insights: {
          peakPeriods: ['여름', '겨울'],
          growthRate: 15,
          seasonality: '계절성 있음',
          relatedTerms: relatedKeywords
        }
      }
    }
  }

  // 한국어 관련 키워드 생성
  private generateRelatedKoreanKeywords(topic: string): string[] {
    const keywords = [topic]
    
    // 기본 변형 키워드 추가
    const variations = [
      `${topic} 추천`,
      `${topic} 방법`,
      `${topic} 가이드`,
      `${topic} 팁`
    ]
    
    keywords.push(...variations)
    
    // 계절별 키워드 추가
    const season = KoreanTrendAnalyzer.getCurrentSeason()
    const seasonKeywords = koreanCulturalContext.seasonalTrends[season as keyof typeof koreanCulturalContext.seasonalTrends].keywords
    
    // 주제와 관련 있을 만한 계절 키워드 추가
    seasonKeywords.slice(0, 2).forEach(seasonKeyword => {
      keywords.push(`${topic} ${seasonKeyword}`)
    })
    
    return keywords.slice(0, 5) // 최대 5개까지
  }

  // 트렌드 데이터 인사이트 분석
  private analyzeTrendInsights(trendData: any): {
    peakPeriods: string[]
    growthRate: number
    seasonality: string
    relatedTerms: string[]
  } {
    if (!trendData || !trendData.results) {
      return {
        peakPeriods: [],
        growthRate: 0,
        seasonality: '데이터 부족',
        relatedTerms: []
      }
    }

    const results = trendData.results
    const peakPeriods: string[] = []
    const relatedTerms: string[] = []
    
    // 피크 기간 분석
    results.forEach((result: any) => {
      if (result.data && result.data.length > 0) {
        const maxRatio = Math.max(...result.data.map((d: any) => d.ratio))
        const peakData = result.data.filter((d: any) => d.ratio === maxRatio)
        
        peakData.forEach((peak: any) => {
          const month = new Date(peak.period).getMonth() + 1
          const seasonMap = {
            '12': '겨울', '1': '겨울', '2': '겨울',
            '3': '봄', '4': '봄', '5': '봄',
            '6': '여름', '7': '여름', '8': '여름',
            '9': '가을', '10': '가을', '11': '가을'
          }
          const season = seasonMap[month.toString() as keyof typeof seasonMap]
          if (season && !peakPeriods.includes(season)) {
            peakPeriods.push(season)
          }
        })
        
        relatedTerms.push(...result.keywords)
      }
    })

    // 성장률 계산 (첫 번째 데이터와 마지막 데이터 비교)
    let growthRate = 0
    if (results[0]?.data && results[0].data.length >= 2) {
      const firstRatio = results[0].data[0].ratio
      const lastRatio = results[0].data[results[0].data.length - 1].ratio
      growthRate = Math.round(((lastRatio - firstRatio) / firstRatio) * 100)
    }

    return {
      peakPeriods: [...new Set(peakPeriods)],
      growthRate,
      seasonality: peakPeriods.length > 1 ? '계절성 있음' : '계절성 약함',
      relatedTerms: [...new Set(relatedTerms)]
    }
  }
}

// Google Trends 비공식 클라이언트 (pytrends 스타일)
class GoogleTrendsClient {
  private baseUrl = 'https://trends.google.com/trends/api'

  // Google Trends 실시간 트렌드 (한국)
  async getRealTimeTrends(geo: string = 'KR'): Promise<{
    trends: Array<{
      keyword: string
      traffic: number
      category: string
      related: string[]
    }>
  }> {
    // 실제 구현에서는 pytrends 라이브러리나 서드파티 서비스 사용
    // 현재는 시뮬레이션 데이터 반환
    try {
      // 실제 Google Trends API는 공식적으로 제공되지 않으므로
      // 대안으로 한국 트렌드 시뮬레이션 데이터 생성
      const currentSeason = KoreanTrendAnalyzer.getCurrentSeason()
      const seasonData = koreanCulturalContext.seasonalTrends[currentSeason as keyof typeof koreanCulturalContext.seasonalTrends]
      
      const trends = seasonData.keywords.slice(0, 10).map((keyword, index) => ({
        keyword,
        traffic: Math.floor(Math.random() * 100000) + 10000,
        category: seasonData.consumption[index % seasonData.consumption.length],
        related: seasonData.keywords.filter(k => k !== keyword).slice(0, 3)
      }))

      return { trends }
    } catch (error) {
      console.error('Google Trends 데이터 수집 실패:', error)
      return { trends: [] }
    }
  }

  // 키워드 관심도 추이 분석 (한국 지역)
  async getInterestOverTime(keywords: string[], geo: string = 'KR'): Promise<{
    timeline: Array<{
      date: string
      values: Record<string, number>
    }>
  }> {
    try {
      // 실제 구현에서는 외부 서비스 또는 크롤링 사용
      // 현재는 시뮬레이션 데이터 생성
      const timeline = []
      const now = new Date()
      
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now)
        date.setMonth(date.getMonth() - i)
        
        const values: Record<string, number> = {}
        keywords.forEach(keyword => {
          values[keyword] = Math.floor(Math.random() * 100) + 1
        })
        
        timeline.push({
          date: date.toISOString().split('T')[0],
          values
        })
      }
      
      return { timeline }
    } catch (error) {
      console.error('Google Trends 시계열 데이터 수집 실패:', error)
      return { timeline: [] }
    }
  }
}

// 소셜미디어 트렌드 수집기 (시뮬레이션)
class SocialMediaTrendCollector {
  // 한국 소셜미디어 트렌드 시뮬레이션
  async getKoreanSocialTrends(): Promise<{
    instagram: Array<{ hashtag: string, posts: number, engagement: number }>
    youtube: Array<{ keyword: string, views: number, trend: string }>
    tiktok: Array<{ hashtag: string, videos: number, viral_score: number }>
  }> {
    try {
      // 실제 구현에서는 각 플랫폼의 API 또는 크롤링 사용
      // 현재는 한국 문화 컨텍스트 기반 시뮬레이션
      
      const currentSeason = KoreanTrendAnalyzer.getCurrentSeason()
      const seasonData = koreanCulturalContext.seasonalTrends[currentSeason as keyof typeof koreanCulturalContext.seasonalTrends]
      
      const instagram = seasonData.keywords.slice(0, 8).map(keyword => ({
        hashtag: `#${keyword}`,
        posts: Math.floor(Math.random() * 50000) + 5000,
        engagement: Math.floor(Math.random() * 15) + 2
      }))
      
      const youtube = seasonData.keywords.slice(0, 6).map(keyword => ({
        keyword: `${keyword} 브이로그`,
        views: Math.floor(Math.random() * 1000000) + 100000,
        trend: ['상승', '유지', '하락'][Math.floor(Math.random() * 3)]
      }))
      
      const tiktok = seasonData.keywords.slice(0, 5).map(keyword => ({
        hashtag: `#${keyword}챌린지`,
        videos: Math.floor(Math.random() * 10000) + 1000,
        viral_score: Math.floor(Math.random() * 100) + 1
      }))
      
      return { instagram, youtube, tiktok }
    } catch (error) {
      console.error('소셜미디어 트렌드 수집 실패:', error)
      return {
        instagram: [],
        youtube: [],
        tiktok: []
      }
    }
  }

  // 세대별 소셜미디어 관심사 분석
  async getGenerationalSocialTrends(): Promise<{
    generation: string
    platforms: string[]
    trending_topics: string[]
    content_types: string[]
  }[]> {
    try {
      return Object.entries(koreanCulturalContext.generationalInterests).map(([gen, data]) => ({
        generation: gen,
        platforms: data.platforms,
        trending_topics: data.keywords.slice(0, 5),
        content_types: ['쇼츠', '라이브', '스토리', '피드'].slice(0, 3)
      }))
    } catch (error) {
      console.error('세대별 소셜미디어 트렌드 분석 실패:', error)
      return []
    }
  }
}

// 통합 실시간 데이터 관리자
class RealTimeDataManager {
  private naverClient: NaverDataLabClient | null = null
  private googleClient: GoogleTrendsClient
  private socialClient: SocialMediaTrendCollector
  private cache: Map<string, { data: any, timestamp: number }> = new Map()
  private cacheTimeout = 5 * 60 * 1000 // 5분 캐시

  constructor(naverClientId?: string, naverClientSecret?: string) {
    if (naverClientId && naverClientSecret) {
      this.naverClient = new NaverDataLabClient(naverClientId, naverClientSecret)
    }
    this.googleClient = new GoogleTrendsClient()
    this.socialClient = new SocialMediaTrendCollector()
  }

  // 캐시된 데이터 확인
  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key)
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data
    }
    return null
  }

  // 데이터 캐시 저장
  private setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  // 통합 한국 트렌드 데이터 수집
  async getComprehensiveKoreanTrends(): Promise<{
    naver?: any
    google?: any
    social?: any
    combined: {
      hotKeywords: Array<{ keyword: string, source: string, score: number }>
      trends: any[]
      insights: string[]
    }
  }> {
    const cacheKey = 'comprehensive-korean-trends'
    const cached = this.getCachedData(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const results: any = { combined: { hotKeywords: [], trends: [], insights: [] } }

      // 네이버 DataLab 데이터 (API 키가 있는 경우)
      if (this.naverClient) {
        try {
          const naverTrends = await this.naverClient.getKoreanTrendAnalysis('한국 트렌드')
          results.naver = naverTrends
          results.combined.hotKeywords.push(
            ...naverTrends.insights.relatedTerms.slice(0, 5).map((keyword: string) => ({
              keyword,
              source: 'naver',
              score: Math.floor(Math.random() * 50) + 50
            }))
          )
        } catch (error) {
          console.log('네이버 DataLab 연동 실패, 시뮬레이션 데이터 사용:', error)
        }
      }

      // Google Trends 데이터
      try {
        const googleTrends = await this.googleClient.getRealTimeTrends()
        results.google = googleTrends
        results.combined.hotKeywords.push(
          ...googleTrends.trends.slice(0, 5).map(trend => ({
            keyword: trend.keyword,
            source: 'google',
            score: Math.floor(trend.traffic / 1000)
          }))
        )
      } catch (error) {
        console.log('Google Trends 연동 실패:', error)
      }

      // 소셜미디어 트렌드 데이터
      try {
        const socialTrends = await this.socialClient.getKoreanSocialTrends()
        results.social = socialTrends
        results.combined.hotKeywords.push(
          ...socialTrends.instagram.slice(0, 3).map(item => ({
            keyword: item.hashtag.replace('#', ''),
            source: 'instagram',
            score: Math.floor(item.posts / 1000)
          }))
        )
      } catch (error) {
        console.log('소셜미디어 트렌드 연동 실패:', error)
      }

      // 폴백: 시뮬레이션 데이터 사용
      if (results.combined.hotKeywords.length === 0) {
        results.combined = {
          hotKeywords: KoreanTrendDataSource.getHotKeywords().map(item => ({
            keyword: item.keyword,
            source: 'simulation',
            score: item.growth
          })),
          trends: KoreanTrendDataSource.getGenerationalTrends(),
          insights: [
            '실제 API 연동이 활성화되면 더 정확한 데이터를 제공합니다.',
            '현재는 시뮬레이션 데이터를 기반으로 분석됩니다.',
            'API 키를 설정하여 실시간 데이터를 활용해보세요.'
          ]
        }
      }

      // 키워드 점수순 정렬 및 중복 제거
      results.combined.hotKeywords = results.combined.hotKeywords
        .sort((a: any, b: any) => b.score - a.score)
        .filter((item: any, index: number, arr: any[]) => 
          arr.findIndex(i => i.keyword === item.keyword) === index
        )
        .slice(0, 10)

      results.combined.insights = [
        `총 ${results.combined.hotKeywords.length}개의 트렌드 키워드 수집`,
        `데이터 소스: ${[...new Set(results.combined.hotKeywords.map((k: any) => k.source))].join(', ')}`,
        `최고 트렌드: ${results.combined.hotKeywords[0]?.keyword || 'N/A'}`,
        ...(results.combined.insights || [])
      ]

      this.setCachedData(cacheKey, results)
      return results
    } catch (error) {
      console.error('통합 트렌드 데이터 수집 실패:', error)
      
      // 완전 폴백
      const fallbackData = {
        combined: {
          hotKeywords: KoreanTrendDataSource.getHotKeywords().map(item => ({
            keyword: item.keyword,
            source: 'fallback',
            score: item.growth
          })),
          trends: KoreanTrendDataSource.getGenerationalTrends(),
          insights: [
            '현재 API 연동에 문제가 있어 기본 데이터를 제공합니다.',
            'API 키 설정 후 다시 시도해주세요.'
          ]
        }
      }
      
      this.setCachedData(cacheKey, fallbackData)
      return fallbackData
    }
  }

  // 특정 키워드의 상세 트렌드 분석
  async getKeywordDetailAnalysis(keyword: string): Promise<{
    naverTrend?: any
    googleTrend?: any
    socialMention?: any
    marketPotential: {
      score: number
      factors: string[]
      recommendations: string[]
    }
  }> {
    try {
      const results: any = {
        marketPotential: {
          score: 0,
          factors: [],
          recommendations: []
        }
      }

      // 네이버 DataLab 키워드 분석
      if (this.naverClient) {
        try {
          const naverAnalysis = await this.naverClient.getKoreanTrendAnalysis(keyword)
          results.naverTrend = naverAnalysis
        } catch (error) {
          console.log(`네이버 ${keyword} 분석 실패:`, error)
        }
      }

      // Google Trends 키워드 분석
      try {
        const googleAnalysis = await this.googleClient.getInterestOverTime([keyword])
        results.googleTrend = googleAnalysis
      } catch (error) {
        console.log(`Google ${keyword} 분석 실패:`, error)
      }

      // 한국 문화 컨텍스트 기반 시장 잠재력 분석
      const culturalContext = KoreanTrendAnalyzer.analyzeCulturalContext(keyword)
      const marketInsights = KoreanTrendAnalyzer.generateKoreanMarketInsights(keyword)
      
      results.marketPotential = {
        score: Math.min(culturalContext.trendScore + marketInsights.viralPotential, 100) / 2,
        factors: [
          `문화적 적합성: ${culturalContext.trendScore}%`,
          `바이럴 가능성: ${marketInsights.viralPotential}%`,
          `타겟 세대: ${culturalContext.targetGeneration}`,
          `계절적 요인: ${culturalContext.season}`
        ],
        recommendations: marketInsights.actionableInsights
      }

      return results
    } catch (error) {
      console.error(`키워드 ${keyword} 상세 분석 실패:`, error)
      return {
        marketPotential: {
          score: 0,
          factors: ['분석 데이터 부족'],
          recommendations: ['API 연동 후 재시도 필요']
        }
      }
    }
  }
}

// ==================== 한국 시장 특화 트렌드 분석 시스템 ====================

// 한국 문화적 맥락 데이터베이스
const koreanCulturalContext = {
  // 계절별 트렌드 키워드 (한국 특화)
  seasonalTrends: {
    spring: {
      keywords: ['벚꽃', '새학기', '미세먼지', '황사', '봄나들이', '입학식', '봄맞이', '꽃구경'],
      emotions: ['새로운 시작', '희망', '설렘', '걱정'],
      consumption: ['봄옷', '마스크', '나들이용품', '꽃놀이용품']
    },
    summer: {
      keywords: ['휴가', '치킨맥주', '한강', '물놀이', '에어컨', '여름휴가', '바다', '캠핑'],
      emotions: ['시원함', '즐거움', '여유', '더위'],
      consumption: ['냉방용품', '여름옷', '휴가용품', '시원한음료']
    },
    autumn: {
      keywords: ['추석', '단풍', '수능', '김치담그기', '등산', '가을맞이', '연말', '입시'],
      emotions: ['그리움', '준비', '긴장', '풍성함'],
      consumption: ['추석선물', '등산용품', '가을옷', '수능용품']
    },
    winter: {
      keywords: ['크리스마스', '연말정산', '스키', '온라인쇼핑', '배달음식', '송년회', '새해'],
      emotions: ['따뜻함', '그리움', '계획', '정리'],
      consumption: ['겨울옷', '난방용품', '연말선물', '실내용품']
    }
  },
  
  // 세대별 관심사 (한국 특화)
  generationalInterests: {
    gen_z: {
      platforms: ['틱톡', '인스타', '유튜브숏츠', '디스코드'],
      keywords: ['부캐', '랜선', 'MZ슬랙', '띵작', '갓생', '개꿀', 'FLEX'],
      values: ['개성', '자유', '소통', '재미'],
      consumption: ['온라인쇼핑', '배달음식', '구독서비스', 'IT기기']
    },
    millennial: {
      platforms: ['인스타', '카카오톡', '네이버', '유튜브'],
      keywords: ['워라밸', '소확행', '펫팸족', '홈카페', 'YOLO', '혼술', '셀프'],
      values: ['균형', '행복', '취향', '효율'],
      consumption: ['생활용품', '펫용품', '홈인테리어', '취미용품']
    },
    gen_x: {
      platforms: ['네이버', '카카오톡', '페이스북', 'TV'],
      keywords: ['재테크', '건강', '자녀교육', '부동산', '골프', '투자', '은퇴'],
      values: ['안정', '성공', '가족', '건강'],
      consumption: ['교육비', '보험', '투자상품', '건강용품']
    },
    boomer: {
      platforms: ['TV', '라디오', '신문', '카카오톡'],
      keywords: ['건강관리', '여행', '손자', '효도', '전통문화', '치매예방'],
      values: ['건강', '가족', '전통', '안전'],
      consumption: ['건강식품', '의료용품', '여행상품', '전통음식']
    }
  },
  
  // 한국 특유 이벤트 및 문화
  koreanEvents: {
    holidays: [
      { name: '신정', month: 1, impact: '새해계획', keywords: ['다이어트', '금연', '새해다짐'] },
      { name: '설날', month: 2, impact: '가족모임', keywords: ['성묘', '차례', '세배', '한복'] },
      { name: '어린이날', month: 5, impact: '가족나들이', keywords: ['놀이공원', '가족여행', '선물'] },
      { name: '추석', month: 9, impact: '가족모임', keywords: ['성묘', '차례', '송편', '선물'] },
      { name: '크리스마스', month: 12, impact: '연인/가족', keywords: ['선물', '데이트', '파티'] }
    ],
    shopping: [
      { name: '11월11일', description: '빼빼로데이', keywords: ['과자', '선물', '커플'] },
      { name: '블랙프라이데이', description: '할인행사', keywords: ['쇼핑', '할인', '온라인'] },
      { name: '화이트데이', description: '답례선물', keywords: ['사탕', '선물', '연인'] }
    ],
    cultural: [
      { category: 'K-pop', keywords: ['BTS', '블랙핑크', '아이브', '뉴진스', 'aespa'] },
      { category: 'K-drama', keywords: ['넷플릭스', '로맨스', '사극', '웹툰원작'] },
      { category: 'K-food', keywords: ['치킨', '떡볶이', '김치', '한식', '배달음식'] }
    ]
  },
  
  // 한국 브랜드 및 서비스 인식
  koreanBrands: {
    chaebols: ['삼성', 'LG', 'SK', '현대', '롯데', 'CJ', '한화'],
    tech: ['네이버', '카카오', '쿠팡', '배달의민족', '토스', '당근마켓'],
    retail: ['이마트', '롯데마트', 'GS25', 'CU', '세븐일레븐'],
    beauty: ['아모레퍼시픽', 'LG생활건강', '코스맥스', '올리브영'],
    food: ['농심', '오뚜기', '롯데', 'CJ제일제당', '동원']
  }
}

// 한국어 키워드 분석 및 트렌드 매칭 엔진
class KoreanTrendAnalyzer {
  // 현재 계절 감지
  static getCurrentSeason(): string {
    const month = new Date().getMonth() + 1
    if (month >= 3 && month <= 5) return 'spring'
    if (month >= 6 && month <= 8) return 'summer'
    if (month >= 9 && month <= 11) return 'autumn'
    return 'winter'
  }
  
  // 세대 추론 (키워드 기반)
  static inferGeneration(keywords: string[]): string {
    const generationScores = { gen_z: 0, millennial: 0, gen_x: 0, boomer: 0 }
    
    for (const keyword of keywords) {
      Object.entries(koreanCulturalContext.generationalInterests).forEach(([gen, data]) => {
        if (data.keywords.some(k => keyword.includes(k))) {
          generationScores[gen as keyof typeof generationScores] += 1
        }
      })
    }
    
    return Object.entries(generationScores).reduce((a, b) => 
      generationScores[a[0] as keyof typeof generationScores] > generationScores[b[0] as keyof typeof generationScores] ? a : b
    )[0]
  }
  
  // 문화적 컨텍스트 분석
  static analyzeCulturalContext(topic: string): {
    season: string,
    culturalElements: string[],
    targetGeneration: string,
    relevantEvents: any[],
    trendScore: number
  } {
    const season = this.getCurrentSeason()
    const seasonData = koreanCulturalContext.seasonalTrends[season as keyof typeof koreanCulturalContext.seasonalTrends]
    
    // 키워드 추출
    const words = topic.toLowerCase().split(/\s+/)
    const targetGeneration = this.inferGeneration([topic])
    
    // 문화적 요소 매칭
    const culturalElements: string[] = []
    
    // 계절별 키워드 매칭
    seasonData.keywords.forEach(keyword => {
      if (topic.includes(keyword)) {
        culturalElements.push(`계절: ${keyword}`)
      }
    })
    
    // 브랜드 매칭
    Object.entries(koreanCulturalContext.koreanBrands).forEach(([category, brands]) => {
      brands.forEach(brand => {
        if (topic.includes(brand)) {
          culturalElements.push(`브랜드: ${brand} (${category})`)
        }
      })
    })
    
    // 관련 이벤트 찾기
    const currentMonth = new Date().getMonth() + 1
    const relevantEvents = koreanCulturalContext.koreanEvents.holidays.filter(event => 
      Math.abs(event.month - currentMonth) <= 1 || event.keywords.some(k => topic.includes(k))
    )
    
    // 트렌드 점수 계산 (문화적 적합성)
    const trendScore = culturalElements.length * 20 + relevantEvents.length * 30 + 
      (seasonData.keywords.filter(k => topic.includes(k)).length * 25)
    
    return {
      season,
      culturalElements,
      targetGeneration,
      relevantEvents,
      trendScore: Math.min(trendScore, 100)
    }
  }
  
  // 한국 시장 맞춤 콘텐츠 제안
  static generateKoreanMarketInsights(topic: string): {
    marketOpportunity: string,
    targetAudience: string,
    contentStrategy: string[],
    viralPotential: number,
    actionableInsights: string[]
  } {
    const context = this.analyzeCulturalContext(topic)
    const generationData = koreanCulturalContext.generationalInterests[context.targetGeneration as keyof typeof koreanCulturalContext.generationalInterests]
    
    // 시장 기회 분석
    let marketOpportunity = '일반적인 한국 시장 관심사'
    if (context.trendScore > 70) marketOpportunity = '높은 시장 잠재력 - 문화적 트렌드와 강하게 연결'
    else if (context.trendScore > 40) marketOpportunity = '중간 시장 잠재력 - 일부 문화적 요소와 연결'
    
    // 타겟 오디언스
    const targetAudience = `${context.targetGeneration} (${generationData.values.join(', ')}을 중시)`
    
    // 콘텐츠 전략
    const contentStrategy = [
      `${generationData.platforms[0]}에서 ${generationData.keywords.slice(0, 3).join(', ')} 키워드 활용`,
      `${context.season} 시즌 트렌드와 연계한 콘텐츠`,
      `${context.targetGeneration} 세대의 ${generationData.values[0]} 가치 강조`
    ]
    
    // 바이럴 가능성
    const viralPotential = Math.min(
      context.trendScore + 
      (context.relevantEvents.length * 15) + 
      (generationData.keywords.filter(k => topic.toLowerCase().includes(k.toLowerCase())).length * 10),
      100
    )
    
    // 실행 가능한 인사이트
    const actionableInsights = [
      `현재 ${context.season} 시즌에 맞춘 ${context.culturalElements[0] || '한국 문화'} 요소 강화`,
      `${context.targetGeneration} 타겟의 주요 플랫폼 ${generationData.platforms[0]} 최적화`,
      `한국 특유의 ${context.relevantEvents[0]?.name || '문화적 이벤트'}와 연계 마케팅 고려`
    ]
    
    return {
      marketOpportunity,
      targetAudience,
      contentStrategy,
      viralPotential,
      actionableInsights
    }
  }
}

// 한국 트렌드 데이터 시뮬레이션 (실제 API 연동 전 MVP)
class KoreanTrendDataSource {
  // 실시간 급상승 키워드 시뮬레이션
  static getHotKeywords(): { keyword: string, growth: number, category: string }[] {
    const currentSeason = KoreanTrendAnalyzer.getCurrentSeason()
    const seasonData = koreanCulturalContext.seasonalTrends[currentSeason as keyof typeof koreanCulturalContext.seasonalTrends]
    
    return seasonData.keywords.slice(0, 10).map((keyword, index) => ({
      keyword,
      growth: Math.floor(Math.random() * 300) + 50,
      category: seasonData.consumption[index % seasonData.consumption.length]
    }))
  }
  
  // 세대별 관심사 트렌드
  static getGenerationalTrends(): { generation: string, keywords: string[], trend: string }[] {
    return Object.entries(koreanCulturalContext.generationalInterests).map(([gen, data]) => ({
      generation: gen,
      keywords: data.keywords.slice(0, 5),
      trend: data.values[0]
    }))
  }
  
  // 한국 브랜드 언급 트렌드
  static getBrandTrends(): { brand: string, category: string, mentions: number }[] {
    const allBrands: { brand: string, category: string }[] = []
    
    Object.entries(koreanCulturalContext.koreanBrands).forEach(([category, brands]) => {
      brands.forEach(brand => {
        allBrands.push({ brand, category })
      })
    })
    
    return allBrands.slice(0, 15).map(item => ({
      ...item,
      mentions: Math.floor(Math.random() * 10000) + 1000
    }))
  }
}

// ==================== 실시간 데이터 연동 API 엔드포인트 ====================

// 네이버 DataLab 연동 테스트
app.post('/api/naver-datalab/test', async (c) => {
  try {
    const { clientId, clientSecret, keywords } = await c.req.json()
    
    if (!clientId || !clientSecret) {
      return c.json({
        success: false,
        error: '네이버 DataLab API 인증 정보가 필요합니다.',
        message: 'Client ID와 Client Secret을 입력해주세요.'
      }, 400)
    }

    const naverClient = new NaverDataLabClient(clientId, clientSecret)
    
    // 테스트용 키워드 (기본값)
    const testKeywords = keywords || ['한국', '트렌드', 'K-pop']
    
    // 최근 3개월 데이터 요청
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(endDate.getMonth() - 3)
    
    const formatDate = (date: Date) => date.toISOString().split('T')[0]
    
    const trendData = await naverClient.getSearchTrends(
      testKeywords,
      formatDate(startDate),
      formatDate(endDate),
      { timeUnit: 'week' }
    )
    
    return c.json({
      success: true,
      data: trendData,
      testInfo: {
        keywords: testKeywords,
        period: `${formatDate(startDate)} ~ ${formatDate(endDate)}`,
        dataPoints: trendData.results?.[0]?.data?.length || 0
      },
      message: '네이버 DataLab API 연동 성공!'
    })
    
  } catch (error: any) {
    console.error('네이버 DataLab 테스트 실패:', error)
    return c.json({
      success: false,
      error: '네이버 DataLab API 연동 실패',
      message: error.message,
      troubleshooting: [
        '1. Client ID와 Secret이 올바른지 확인',
        '2. 네이버 개발자 센터에서 DataLab API 사용 설정 확인',
        '3. 일일 호출 한도(1,000회) 확인'
      ]
    }, 500)
  }
})

// 실시간 통합 트렌드 데이터
app.get('/api/real-time-trends', async (c) => {
  try {
    // 환경 변수에서 네이버 API 키 확인
    const { env } = c
    const naverClientId = env?.NAVER_CLIENT_ID
    const naverClientSecret = env?.NAVER_CLIENT_SECRET
    
    // 실시간 데이터 매니저 초기화
    const dataManager = new RealTimeDataManager(naverClientId, naverClientSecret)
    
    // 통합 트렌드 데이터 수집
    const trendData = await dataManager.getComprehensiveKoreanTrends()
    
    return c.json({
      success: true,
      data: trendData,
      metadata: {
        timestamp: new Date().toISOString(),
        sources: {
          naver: !!naverClientId,
          google: true,
          social: true
        },
        cacheStatus: '5분 캐시 적용'
      },
      message: '실시간 트렌드 데이터 수집 완료'
    })
    
  } catch (error: any) {
    console.error('실시간 트렌드 수집 실패:', error)
    return c.json({
      success: false,
      error: '실시간 트렌드 데이터 수집 실패',
      message: error.message
    }, 500)
  }
})

// 키워드 상세 분석
app.post('/api/keyword-analysis', async (c) => {
  try {
    const { keyword, naverClientId, naverClientSecret } = await c.req.json()
    
    if (!keyword) {
      return c.json({
        success: false,
        error: '분석할 키워드를 입력해주세요.'
      }, 400)
    }
    
    // 환경 변수 또는 요청 데이터에서 API 키 가져오기
    const { env } = c
    const clientId = naverClientId || env?.NAVER_CLIENT_ID
    const clientSecret = naverClientSecret || env?.NAVER_CLIENT_SECRET
    
    const dataManager = new RealTimeDataManager(clientId, clientSecret)
    
    // 키워드 상세 분석
    const analysis = await dataManager.getKeywordDetailAnalysis(keyword)
    
    return c.json({
      success: true,
      keyword,
      analysis,
      timestamp: new Date().toISOString(),
      message: `"${keyword}" 키워드 상세 분석 완료`
    })
    
  } catch (error: any) {
    console.error('키워드 분석 실패:', error)
    return c.json({
      success: false,
      error: '키워드 분석 실패',
      message: error.message
    }, 500)
  }
})

// 소셜미디어 트렌드 전용
app.get('/api/social-media-trends', async (c) => {
  try {
    const socialClient = new SocialMediaTrendCollector()
    
    const [socialTrends, generationalTrends] = await Promise.all([
      socialClient.getKoreanSocialTrends(),
      socialClient.getGenerationalSocialTrends()
    ])
    
    return c.json({
      success: true,
      data: {
        platforms: socialTrends,
        generational: generationalTrends,
        insights: {
          topInstagramHashtag: socialTrends.instagram[0]?.hashtag || 'N/A',
          trendingYouTubeKeyword: socialTrends.youtube[0]?.keyword || 'N/A',
          viralTikTokChallenge: socialTrends.tiktok[0]?.hashtag || 'N/A',
          dominantGeneration: generationalTrends[0]?.generation || 'N/A'
        }
      },
      timestamp: new Date().toISOString(),
      message: '소셜미디어 트렌드 분석 완료'
    })
    
  } catch (error: any) {
    console.error('소셜미디어 트렌드 수집 실패:', error)
    return c.json({
      success: false,
      error: '소셜미디어 트렌드 수집 실패',
      message: error.message
    }, 500)
  }
})

// API 키 설정 및 연동 상태 확인
app.get('/api/data-sources/status', (c) => {
  try {
    const { env } = c
    
    const status = {
      naver: {
        connected: !!(env?.NAVER_CLIENT_ID && env?.NAVER_CLIENT_SECRET),
        clientId: env?.NAVER_CLIENT_ID ? '설정됨' : '미설정',
        description: '네이버 DataLab - 한국 검색 트렌드 데이터'
      },
      google: {
        connected: true, // 시뮬레이션이므로 항상 true
        description: 'Google Trends - 글로벌 트렌드 데이터 (시뮬레이션)'
      },
      social: {
        connected: true, // 시뮬레이션이므로 항상 true  
        description: '소셜미디어 트렌드 - Instagram, YouTube, TikTok (시뮬레이션)'
      }
    }
    
    const connectedCount = Object.values(status).filter(s => s.connected).length
    
    return c.json({
      success: true,
      status,
      summary: {
        connectedSources: connectedCount,
        totalSources: 3,
        realTimeDataAvailable: status.naver.connected,
        simulationDataAvailable: true
      },
      recommendations: [
        !status.naver.connected ? '네이버 DataLab API 키를 설정하면 실제 한국 검색 트렌드를 활용할 수 있습니다.' : null,
        'Google Trends와 소셜미디어 데이터는 현재 시뮬레이션으로 제공됩니다.',
        '실제 API 연동을 원하시면 개별 플랫폼의 API 키가 필요합니다.'
      ].filter(Boolean)
    })
    
  } catch (error: any) {
    console.error('데이터 소스 상태 확인 실패:', error)
    return c.json({
      success: false,
      error: '데이터 소스 상태 확인 실패',
      message: error.message
    }, 500)
  }
})

// ==================== Phase 1 품질 검증 API ====================

// 즉시 적용 품질 체크 API
app.post('/api/quality-check-phase1', async (c) => {
  try {
    const { content } = await c.req.json()
    
    if (!content) {
      return c.json({ error: '체크할 콘텐츠가 필요합니다.' }, 400)
    }

    // Phase 1 품질 체크 항목들
    const qualityChecks = {
      // 1. 감정적 훅 체크
      emotionalHook: {
        score: 0,
        found: false,
        type: null as string | null
      },
      
      // 2. 실용성 체크 
      practicality: {
        score: 0,
        immediateActions: [] as string[],
        specificNumbers: [] as string[],
        checkpoints: [] as string[]
      },
      
      // 3. 출처 체크
      sources: {
        score: 0,
        statistics: [] as string[],
        expertQuotes: [] as string[],
        caseStudies: [] as string[],
        recentData: false
      },
      
      // 4. 문장 길이 체크
      sentences: {
        score: 0,
        tooLong: [] as string[],
        tooShort: [] as string[],
        optimal: [] as string[]
      }
    }

    const sentences = content.split(/[.!?]\s+/).filter((s: string) => s.trim().length > 0)
    
    // 1. 감정적 훅 분석
    const hookPatterns = [
      /"또\s+이런|"혹시\s+이런|"이런\s+상황/,
      /"이\s+한\s+가지|"연구\s+결과|"놀랍게도/,
      /87%|90%|주의\s+9명|10명\s+중/
    ]
    
    for (const [index, pattern] of hookPatterns.entries()) {
      if (pattern.test(content)) {
        qualityChecks.emotionalHook.found = true
        qualityChecks.emotionalHook.score = 100
        qualityChecks.emotionalHook.type = ['problem_empathy', 'curiosity', 'statistics'][index]
        break
      }
    }

    // 2. 실용성 분석
    const actionPatterns = /(\오늘부터|\지금\s+당장|\즉시|\바로|5\분|\첫\s+번째\s+단계)/g
    const numberPatterns = /(\단\s*\w3일|\월\s*[\만0-9,]+원|[\배%0-9]+\s*\증가|[\시간1-90-9]+\분)/g
    const checkPatterns = /(\확인할\s+점|\신호|\결과|\방법|\체크)/g
    
    qualityChecks.practicality.immediateActions = (content.match(actionPatterns) || []).slice(0, 5)
    qualityChecks.practicality.specificNumbers = (content.match(numberPatterns) || []).slice(0, 5)
    qualityChecks.practicality.checkpoints = (content.match(checkPatterns) || []).slice(0, 5)
    
    qualityChecks.practicality.score = Math.min(
      (qualityChecks.practicality.immediateActions.length * 25) +
      (qualityChecks.practicality.specificNumbers.length * 20) +
      (qualityChecks.practicality.checkpoints.length * 15), 
      100
    )

    // 3. 출처 분석
    const statPatterns = /([%0-9,]+%|\연구|\조사|\데이터|\통계)/g
    const expertPatterns = /(\교수|\전문가|\연구팀|\박사|\전문의)/g
    const casePatterns = /(A\회사|B\기업|\사례|\예시|\실제)/g
    const recentPatterns = /(2023|2024|\최근|\최신)/g
    
    qualityChecks.sources.statistics = (content.match(statPatterns) || []).slice(0, 3)
    qualityChecks.sources.expertQuotes = (content.match(expertPatterns) || []).slice(0, 3) 
    qualityChecks.sources.caseStudies = (content.match(casePatterns) || []).slice(0, 3)
    qualityChecks.sources.recentData = recentPatterns.test(content)
    
    qualityChecks.sources.score = Math.min(
      (qualityChecks.sources.statistics.length * 20) +
      (qualityChecks.sources.expertQuotes.length * 25) +
      (qualityChecks.sources.caseStudies.length * 20) +
      (qualityChecks.sources.recentData ? 35 : 0),
      100
    )

    // 4. 문장 길이 분석
    sentences.forEach((sentence: string) => {
      const words = sentence.trim().split(/\s+/).length
      if (words <= 4) {
        qualityChecks.sentences.tooShort.push(sentence.slice(0, 50) + '...')
      } else if (words >= 30) {
        qualityChecks.sentences.tooLong.push(sentence.slice(0, 50) + '...')
      } else {
        qualityChecks.sentences.optimal.push(sentence.slice(0, 50) + '...')
      }
    })
    
    const totalSentences = sentences.length
    const optimalRatio = qualityChecks.sentences.optimal.length / totalSentences
    qualityChecks.sentences.score = Math.round(optimalRatio * 100)

    // 전체 품질 점수 계산
    const overallScore = Math.round(
      (qualityChecks.emotionalHook.score * 0.2) +
      (qualityChecks.practicality.score * 0.35) +
      (qualityChecks.sources.score * 0.25) + 
      (qualityChecks.sentences.score * 0.2)
    )

    // 개선 제안 생성
    const improvements = []
    
    if (!qualityChecks.emotionalHook.found) {
      improvements.push('도입부에 감정적 훅을 추가하세요. (예: "혹시 이런 경험 있으세요?")')
    }
    
    if (qualityChecks.practicality.immediateActions.length < 2) {
      improvements.push('즉시 실행 가능한 구체적 행동을 추가하세요.')
    }
    
    if (qualityChecks.sources.score < 60) {
      improvements.push('통계, 전문가 의견, 사례 연구를 추가하여 신뢰성을 높이세요.')
    }
    
    if (qualityChecks.sentences.tooLong.length > 3) {
      improvements.push('너무 긴 문장들을 나누어 주세요. (최대 25단어)')
    }

    return c.json({
      success: true,
      phase1Results: {
        overallScore,
        breakdown: qualityChecks,
        improvements,
        status: overallScore >= 80 ? 'excellent' : overallScore >= 60 ? 'good' : 'needs_improvement'
      },
      message: `Phase 1 품질 체크 완료. 전체 점수: ${overallScore}/100`
    })
    
  } catch (error: any) {
    console.error('Phase 1 품질 체크 오류:', error)
    return c.json({
      success: false,
      error: 'Phase 1 품질 체크 실패',
      message: error.message
    }, 500)
  }
})

// ==================== API 엔드포인트 ====================

// 헬스 체크
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '4.1-Live-AI-Enhanced'
  })
})

// 라이브 API 키 상태 확인 - 안정화된 버전 v4.1
app.get('/api/keys/status', async (c) => {
  try {
    const { env } = c
    
    // 라이브 API 키 검증 함수
    const validateLiveApiKey = (key: string, type: 'claude' | 'gemini' | 'openai' | 'grok'): { isValid: boolean, reason?: string } => {
      if (!key || key.length === 0) {
        return { isValid: false, reason: '키가 비어있음' }
      }
      
      switch (type) {
        case 'claude':
          if (!key.startsWith('sk-ant-')) {
            return { isValid: false, reason: 'Claude API 키는 sk-ant-로 시작해야 합니다' }
          }
          if (key.length < 50) {
            return { isValid: false, reason: 'Claude API 키 길이가 너무 짧습니다' }
          }
          break
        case 'gemini':
          if (key.length < 20) {
            return { isValid: false, reason: 'Gemini API 키 길이가 너무 짧습니다' }
          }
          break
        case 'openai':
          if (!key.startsWith('sk-')) {
            return { isValid: false, reason: 'OpenAI API 키는 sk-로 시작해야 합니다' }
          }
          if (key.length < 40) {
            return { isValid: false, reason: 'OpenAI API 키 길이가 너무 짧습니다' }
          }
          break
        case 'grok':
          if (!key.startsWith('xai-')) {
            return { isValid: false, reason: 'Grok API 키는 xai-로 시작해야 합니다' }
          }
          if (key.length < 30) {
            return { isValid: false, reason: 'Grok API 키 길이가 너무 짧습니다' }
          }
          break
      }
      
      return { isValid: true }
    }
    
    const claudeValidation = validateLiveApiKey(env?.CLAUDE_API_KEY || '', 'claude')
    const geminiValidation = validateLiveApiKey(env?.GEMINI_API_KEY || '', 'gemini')
    const openaiValidation = validateLiveApiKey(env?.OPENAI_API_KEY || '', 'openai')
    const grokValidation = validateLiveApiKey(env?.GROK_API_KEY || '', 'grok')
    
    const apiKeys = {
      claude: {
        exists: !!(env?.CLAUDE_API_KEY),
        keyLength: env?.CLAUDE_API_KEY?.length || 0,
        isValid: claudeValidation.isValid,
        validationReason: claudeValidation.reason,
        dailyLimit: 100,
        note: claudeValidation.isValid ? '✅ 라이브 활성' : `❌ ${claudeValidation.reason || '미설정'}`
      },
      gemini: {
        exists: !!(env?.GEMINI_API_KEY),
        keyLength: env?.GEMINI_API_KEY?.length || 0,
        isValid: geminiValidation.isValid,
        validationReason: geminiValidation.reason,
        dailyLimit: 1000,
        note: geminiValidation.isValid ? '✅ 라이브 활성' : `❌ ${geminiValidation.reason || '미설정'}`
      },
      openai: {
        exists: !!(env?.OPENAI_API_KEY),
        keyLength: env?.OPENAI_API_KEY?.length || 0,
        isValid: openaiValidation.isValid,
        validationReason: openaiValidation.reason,
        dailyLimit: 200,
        note: openaiValidation.isValid ? '✅ 라이브 활성' : `❌ ${openaiValidation.reason || '미설정'}`
      },
      grok: {
        exists: !!(env?.GROK_API_KEY),
        keyLength: env?.GROK_API_KEY?.length || 0,
        isValid: grokValidation.isValid,
        validationReason: grokValidation.reason,
        dailyLimit: 5000,
        note: grokValidation.isValid ? '✅ 라이브 활성' : `❌ ${grokValidation.reason || '미설정'}`
      }
    }
    
    const totalKeys = Object.values(apiKeys).filter(key => key.exists).length
    const validKeys = Object.values(apiKeys).filter(key => key.isValid).length
    const liveKeys = Object.entries(apiKeys)
      .filter(([_, key]) => key.isValid)
      .map(([name, _]) => name)
    
    return c.json({
      status: 'success',
      version: 'v4.1 - 안정화된 버전 (라이브 API 키 검증)',
      summary: {
        totalConfigured: totalKeys,
        validLiveKeys: validKeys,
        activeLiveKeys: liveKeys,
        message: validKeys > 0 
          ? `✅ ${validKeys}개의 라이브 API 키가 정상 작동 중입니다. (${liveKeys.join(', ')})`
          : '⚠️ 라이브 API 키가 설정되지 않았습니다. Cloudflare Pages 환경변수를 확인해주세요.',
        recommendations: validKeys === 0 ? [
          'Cloudflare Pages 대시보드에서 환경변수 설정',
          'API 키 형식 확인 (Claude: sk-ant-, OpenAI: sk-, Grok: xai-)',
          '최소 1개 이상의 라이브 API 키 설정 필요'
        ] : []
      },
      keys: apiKeys,
      timestamp: new Date().toISOString(),
      environment: 'cloudflare-pages',
      principle: '라이브 API 키 사용 원칙'
    })
  } catch (error: any) {
    console.error('라이브 API 키 상태 확인 오류:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })
    
    return c.json({
      status: 'error',
      version: 'v4.1 - 안정화된 버전',
      summary: {
        totalConfigured: 0,
        validLiveKeys: 0,
        activeLiveKeys: [],
        message: '❌ 라이브 API 키 상태를 확인할 수 없습니다.',
        recommendations: [
          'Cloudflare Pages 대시보드 접속 확인',
          '환경변수 설정 상태 점검',
          '서비스 재시작 후 다시 시도'
        ]
      },
      keys: {
        claude: {
          exists: false,
          keyLength: 0,
          isValid: false,
          validationReason: '시스템 오류로 인한 확인 불가',
          dailyLimit: 0,
          note: '❌ 시스템 오류'
        },
        gemini: {
          exists: false,
          keyLength: 0,
          isValid: false,
          validationReason: '시스템 오류로 인한 확인 불가',
          dailyLimit: 0,
          note: '❌ 시스템 오류'
        },
        openai: {
          exists: false,
          keyLength: 0,
          isValid: false,
          validationReason: '시스템 오류로 인한 확인 불가',
          dailyLimit: 0,
          note: '❌ 시스템 오류'
        },
        grok: {
          exists: false,
          keyLength: 0,
          isValid: false,
          validationReason: '시스템 오류로 인한 확인 불가',
          dailyLimit: 0,
          note: '❌ 시스템 오류'
        }
      },
      timestamp: new Date().toISOString(),
      message: '❌ 라이브 API 키 상태 확인 중 시스템 오류가 발생했습니다.',
      error: error.message,
      code: 'SYSTEM_ERROR',
      principle: '라이브 API 키 사용 원칙'
    }, 500)
  }
})

// SEO 최적화 콘텐츠 생성
app.post('/api/generate-seo', async (c) => {
  try {
    const { topic, audience, tone, aiModel, apiKey, seoOptions } = await c.req.json()
    
    if (!topic || !audience || !tone || !aiModel) {
      return c.json({ error: '필수 필드가 누락되었습니다' }, 400)
    }

    // API 키 가져오기
    const { env } = c
    let finalApiKey = ''
    
    if (aiModel === 'claude') {
      finalApiKey = env.CLAUDE_API_KEY || apiKey
    } else if (aiModel === 'gemini') {
      finalApiKey = env.GEMINI_API_KEY || apiKey
    } else if (aiModel === 'openai') {
      finalApiKey = env.OPENAI_API_KEY || apiKey
    } else if (aiModel === 'grok') {
      finalApiKey = env.GROK_API_KEY || apiKey
    }

    // Cloudflare 환경변수에서 API 키 자동 가져오기
    if (!finalApiKey) {
      // 환경변수에서 사용 가능한 첫 번째 API 키 사용
      if (env?.CLAUDE_API_KEY) {
        finalApiKey = env.CLAUDE_API_KEY
        selectedModel = 'claude'
      } else if (env?.GEMINI_API_KEY) {
        finalApiKey = env.GEMINI_API_KEY
        selectedModel = 'gemini'
      } else if (env?.OPENAI_API_KEY) {
        finalApiKey = env.OPENAI_API_KEY
        selectedModel = 'openai'
      } else {
        return c.json({ error: 'API 키가 설정되지 않았습니다.' }, 400)
      }
    }

    // 전문가 시스템: 최적 모델 자동 선택 (사용자가 선택하지 않은 경우)
    let selectedModel = aiModel
    let expertSelection = null
    
    if (aiModel === 'auto' || !aiModel) {
      expertSelection = selectExpertModel(topic, audience, tone)
      selectedModel = expertSelection.model
      console.log(`🔍 SEO 전문가 시스템이 ${expertSelection.model}을 선택 (신뢰도: ${expertSelection.confidence}%)`)
    }

    // API 키 가져오기 (선택된 모델 기준)  
    let seoApiKey = ''
    if (selectedModel === 'claude') {
      seoApiKey = env.CLAUDE_API_KEY || apiKey
    } else if (selectedModel === 'gemini') {
      seoApiKey = env.GEMINI_API_KEY || apiKey
    } else if (selectedModel === 'openai') {
      seoApiKey = env.OPENAI_API_KEY || apiKey
    } else if (selectedModel === 'grok') {
      seoApiKey = env.GROK_API_KEY || apiKey
    }

    if (!seoApiKey) {
      // 서버 API 키 사용
      if (env?.CLAUDE_API_KEY) {
        seoApiKey = env.CLAUDE_API_KEY
        selectedModel = 'claude'
      } else if (env?.GEMINI_API_KEY) {
        seoApiKey = env.GEMINI_API_KEY
        selectedModel = 'gemini'
      } else if (env?.OPENAI_API_KEY) {
        seoApiKey = env.OPENAI_API_KEY
        selectedModel = 'openai'
      } else {
        return c.json({ error: 'API 키가 설정되지 않았습니다.' }, 400)
      }
    }

    // SEO 최적화 프롬프트 생성 (선택된 모델 기준)
    const seoPrompt = generateSEOPrompt(topic, audience, tone, seoOptions, selectedModel)
    
    // AI 모델 호출
    const result = await callAI(selectedModel, seoPrompt, seoApiKey)
    
    // SEO 데이터 파싱
    const seoData = parseSEOResult(result)
    
    return c.json({
      ...seoData,
      model: aiModels[selectedModel].name,
      // 라이브 모드: 실제 AI
      expertSelection,
      selectedModel
    })

  } catch (error: any) {
    console.error('SEO 블로그 생성 오류:', error)
    
    const { topic, audience } = await c.req.json().catch(() => ({ topic: '일반적인 주제', audience: '일반인' }))
    // 에러 발생 시 기본 API 키로 재시도
    try {
      let fallbackApiKey = ''
      let fallbackModel = 'claude'
      
      if (env?.CLAUDE_API_KEY) {
        fallbackApiKey = env.CLAUDE_API_KEY
        fallbackModel = 'claude'
      } else if (env?.GEMINI_API_KEY) {
        fallbackApiKey = env.GEMINI_API_KEY
        fallbackModel = 'gemini'
      } else if (env?.OPENAI_API_KEY) {
        fallbackApiKey = env.OPENAI_API_KEY
        fallbackModel = 'openai'
      }
      
      if (fallbackApiKey) {
        console.log(`🔄 폴백 ${fallbackModel} 모델로 재시도...`)
        const fallbackPrompt = generateSEOPrompt(topic, audience, '친근한', {}, fallbackModel)
        const fallbackResult = await callAI(fallbackModel, fallbackPrompt, fallbackApiKey)
        
        return c.json({
          content: fallbackResult,
          model: `${fallbackModel} (폴백 모드)`,
          // 라이브 모드: 실제 AI 생성
          message: `원래 모델에서 오류가 발생하여 ${fallbackModel}로 생성했습니다.`
        })
      } else {
        return c.json({ error: `API 오류가 발생했습니다: ${error.message}` }, 500)
      }
    } catch (fallbackError) {
      return c.json({ error: `서비스 오류: ${error.message}` }, 500)
    }
  }
})

// ==================== 한국 시장 특화 트렌드 API ====================

// 한국 트렌드 분석 API (기존 + 실시간 데이터 통합)
app.get('/api/korean-trends', async (c) => {
  try {
    // 기존 시뮬레이션 데이터
    const hotKeywords = KoreanTrendDataSource.getHotKeywords()
    const generationalTrends = KoreanTrendDataSource.getGenerationalTrends()
    const brandTrends = KoreanTrendDataSource.getBrandTrends()
    const currentSeason = KoreanTrendAnalyzer.getCurrentSeason()
    
    // 실시간 데이터 통합 시도
    let realTimeData = null
    try {
      const { env } = c
      const naverClientId = env?.NAVER_CLIENT_ID
      const naverClientSecret = env?.NAVER_CLIENT_SECRET
      
      if (naverClientId && naverClientSecret) {
        const dataManager = new RealTimeDataManager(naverClientId, naverClientSecret)
        const comprehensive = await dataManager.getComprehensiveKoreanTrends()
        realTimeData = comprehensive
      }
    } catch (error) {
      console.log('실시간 데이터 연동 실패, 시뮬레이션 데이터 사용:', error)
    }
    
    return c.json({
      success: true,
      data: {
        // 기존 시뮬레이션 데이터
        hotKeywords: realTimeData?.combined?.hotKeywords || hotKeywords,
        generationalTrends,
        brandTrends,
        currentSeason,
        culturalContext: koreanCulturalContext.seasonalTrends[currentSeason as keyof typeof koreanCulturalContext.seasonalTrends],
        
        // 실시간 데이터 (있는 경우)
        realTimeData: realTimeData ? {
          isRealTime: true,
          sources: Object.keys(realTimeData).filter(k => k !== 'combined'),
          insights: realTimeData.combined.insights,
          lastUpdated: new Date().toISOString()
        } : {
          isRealTime: false,
          sources: ['simulation'],
          insights: ['시뮬레이션 데이터로 제공됩니다'],
          lastUpdated: new Date().toISOString()
        },
        
        timestamp: new Date().toISOString()
      },
      message: realTimeData 
        ? '실시간 트렌드 데이터와 문화적 컨텍스트를 통합하여 제공했습니다.'
        : '한국 트렌드 시뮬레이션 데이터를 제공했습니다. 실시간 데이터를 원하시면 API 키를 설정해주세요.'
    })
  } catch (error) {
    console.error('한국 트렌드 분석 오류:', error)
    return c.json({
      success: false,
      error: '트렌드 데이터를 가져오는 중 오류가 발생했습니다.',
      message: error.message
    }, 500)
  }
})

// 특정 주제의 한국 시장 분석 API
app.post('/api/korean-market-analysis', async (c) => {
  try {
    const { topic } = await c.req.json()
    
    if (!topic) {
      return c.json({ error: '분석할 주제를 입력해주세요.' }, 400)
    }
    
    // 한국 문화적 컨텍스트 분석
    const culturalContext = KoreanTrendAnalyzer.analyzeCulturalContext(topic)
    
    // 시장 인사이트 생성
    const marketInsights = KoreanTrendAnalyzer.generateKoreanMarketInsights(topic)
    
    // 관련 트렌드 키워드 추천
    const hotKeywords = KoreanTrendDataSource.getHotKeywords()
    const relatedKeywords = hotKeywords
      .filter(item => 
        topic.includes(item.keyword) || 
        item.keyword.includes(topic) ||
        culturalContext.culturalElements.some(element => element.includes(item.keyword))
      )
      .slice(0, 5)
    
    return c.json({
      success: true,
      analysis: {
        topic,
        culturalContext,
        marketInsights,
        relatedKeywords,
        recommendations: {
          contentTiming: `${culturalContext.season} 시즌 최적화 콘텐츠`,
          targetPlatforms: koreanCulturalContext.generationalInterests[culturalContext.targetGeneration as keyof typeof koreanCulturalContext.generationalInterests].platforms,
          keyMessages: marketInsights.contentStrategy,
          viralScore: `${marketInsights.viralPotential}% 바이럴 가능성`
        },
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('한국 시장 분석 오류:', error)
    return c.json({
      success: false,
      error: '시장 분석 중 오류가 발생했습니다.',
      message: error.message
    }, 500)
  }
})

// K-트렌드 블로그 생성 (기존 생성 시스템과 통합)
app.post('/api/generate-k-trend', async (c) => {
  try {
    const { topic, audience, tone, aiModel, apiKey, useKoreanContext = true } = await c.req.json()
    
    if (!topic) {
      return c.json({ error: '주제를 입력해주세요.' }, 400)
    }
    
    // 한국 시장 분석 먼저 수행
    const culturalContext = KoreanTrendAnalyzer.analyzeCulturalContext(topic)
    const marketInsights = KoreanTrendAnalyzer.generateKoreanMarketInsights(topic)
    
    // 한국 시장 맞춤 프롬프트 생성
    const koreanPrompt = `
당신은 한국 시장 전문가이자 트렌드 분석가입니다. 다음 주제에 대해 한국 시장 특화 블로그를 작성해주세요.

📊 **주제**: ${topic}

🇰🇷 **한국 시장 컨텍스트**:
- **현재 시즌**: ${culturalContext.season} (${koreanCulturalContext.seasonalTrends[culturalContext.season as keyof typeof koreanCulturalContext.seasonalTrends].emotions.join(', ')} 감정 중심)
- **주요 타겟**: ${culturalContext.targetGeneration} 세대
- **문화적 요소**: ${culturalContext.culturalElements.join(', ')}
- **트렌드 점수**: ${culturalContext.trendScore}/100
- **바이럴 가능성**: ${marketInsights.viralPotential}%

🎯 **시장 기회**: ${marketInsights.marketOpportunity}

📝 **콘텐츠 전략**:
${marketInsights.contentStrategy.map((strategy, i) => `${i+1}. ${strategy}`).join('\n')}

💡 **실행 가능한 인사이트**:
${marketInsights.actionableInsights.map((insight, i) => `${i+1}. ${insight}`).join('\n')}

🚀 **작성 지침**:
1. 한국 문화와 시장 상황을 정확히 반영
2. ${culturalContext.targetGeneration} 세대의 가치관과 관심사 고려
3. 현재 ${culturalContext.season} 시즌의 트렌드와 감정 반영
4. 실제 한국에서 화제가 될 수 있는 구체적인 예시 포함
5. 한국 브랜드나 서비스 언급 시 정확한 정보 사용

위의 한국 시장 분석을 바탕으로 "${topic}"에 대한 ${audience || '일반인'} 대상의 ${tone || '친근한'} 톤의 블로그 글을 한국어로 작성해주세요.

특히 한국 독자들이 공감할 수 있는 사례와 한국 시장에서의 실제적인 적용 방안을 중점적으로 다뤄주세요.
`

    // AI 모델 선택 (GROK을 트렌드 분석에 우선 사용)
    let selectedModel = aiModel
    if (!selectedModel || selectedModel === 'auto') {
      // 트렌드 관련 주제면 GROK 우선 선택
      const trendKeywords = ['트렌드', '인기', '화제', '바이럴', '최신', '요즘']
      if (trendKeywords.some(keyword => topic.includes(keyword)) || marketInsights.viralPotential > 60) {
        selectedModel = 'grok'
      } else {
        selectedModel = 'claude'
      }
    }
    
    // API 키 설정
    const { env } = c
    let finalApiKey = ''
    
    if (selectedModel === 'claude') {
      finalApiKey = env.CLAUDE_API_KEY || apiKey
    } else if (selectedModel === 'gemini') {
      finalApiKey = env.GEMINI_API_KEY || apiKey
    } else if (selectedModel === 'openai') {
      finalApiKey = env.OPENAI_API_KEY || apiKey
    } else if (selectedModel === 'grok') {
      finalApiKey = env.GROK_API_KEY || apiKey
    }
    
    if (!finalApiKey) {
      return c.json({ error: 'API 키가 설정되지 않았습니다.' }, 400)
    }
    
    // AI로 한국 시장 특화 콘텐츠 생성
    const content = await callAI(selectedModel, koreanPrompt, finalApiKey)
    
    return c.json({
      success: true,
      content,
      model: aiModels[selectedModel].name,
      koreanMarketData: {
        culturalContext,
        marketInsights,
        trendAnalysis: {
          season: culturalContext.season,
          targetGeneration: culturalContext.targetGeneration,
          viralPotential: marketInsights.viralPotential,
          trendScore: culturalContext.trendScore
        }
      },
      message: `한국 시장 특화 콘텐츠가 ${selectedModel} 모델로 생성되었습니다.`
    })
    
  } catch (error: any) {
    console.error('K-트렌드 블로그 생성 오류:', error)
    return c.json({
      success: false,
      error: 'K-트렌드 블로그 생성 중 오류가 발생했습니다.',
      message: error.message
    }, 500)
  }
})

// 품질 검증 시스템을 사용한 고품질 콘텐츠 생성
app.post('/api/generate-qa', async (c) => {
  const startTime = Date.now()
  
  try {
    const { topic, audience, tone, aiModel, apiKey, seoMode = false, seoOptions = {} } = await c.req.json()
    
    if (!topic || !audience || !tone) {
      return c.json({ error: '필수 필드가 누락되었습니다' }, 400)
    }

    const processingSteps: Array<{
      step: string
      status: 'completed' | 'in_progress' | 'failed'
      timestamp: string
      details?: string
    }> = []

    // 전문가 시스템: 최적 모델 자동 선택
    let selectedModel = aiModel
    let expertSelection = null
    
    if (aiModel === 'auto' || !aiModel) {
      expertSelection = selectExpertModel(topic, audience, tone)
      selectedModel = expertSelection.model
      processingSteps.push({
        step: 'expert_selection',
        status: 'completed',
        timestamp: new Date().toISOString(),
        details: `${expertSelection.expert.name} 선택 (신뢰도: ${expertSelection.confidence}%)`
      })
    }

    // API 키 설정
    const { env } = c
    let finalApiKey = ''
    
    if (selectedModel === 'claude') {
      finalApiKey = env.CLAUDE_API_KEY || apiKey
    } else if (selectedModel === 'gemini') {
      finalApiKey = env.GEMINI_API_KEY || apiKey
    } else if (selectedModel === 'openai') {
      finalApiKey = env.OPENAI_API_KEY || apiKey
    } else if (selectedModel === 'grok') {
      finalApiKey = env.GROK_API_KEY || apiKey
    }

    if (!finalApiKey) {
      return c.json({ 
        error: '품질 검증 시스템을 위해서는 API 키가 필요합니다.',
        message: 'API 키가 설정되지 않아 품질 검증 시스템을 사용할 수 없습니다. API 키를 설정해주세요.',
        processingSteps: [{
          step: 'api_key_error',
          status: 'failed',
          timestamp: new Date().toISOString(),
          details: `${selectedModel} API 키가 설정되지 않음`
        }]
      }, 400)
    }

    // 1단계: 초기 콘텐츠 생성
    processingSteps.push({
      step: 'initial_generation',
      status: 'in_progress',
      timestamp: new Date().toISOString()
    })

    let initialPrompt = ''
    if (seoMode) {
      initialPrompt = generateSEOPrompt(topic, audience, tone, seoOptions, selectedModel)
    } else {
      initialPrompt = generateAdvancedPrompt(topic, audience, tone, selectedModel)
    }
    
    let originalContent
    try {
      originalContent = await callAI(selectedModel, initialPrompt, finalApiKey)
    } catch (error: any) {
      processingSteps[processingSteps.length - 1].status = 'failed'
      processingSteps[processingSteps.length - 1].details = `API 호출 실패: ${error.message}`
      throw error
    }
    
    processingSteps[processingSteps.length - 1].status = 'completed'
    processingSteps[processingSteps.length - 1].details = `${aiModels[selectedModel].name}으로 초기 콘텐츠 생성 완료`

    // 2단계: AI 검토
    processingSteps.push({
      step: 'quality_review',
      status: 'in_progress', 
      timestamp: new Date().toISOString()
    })

    let contentToReview = originalContent
    if (seoMode) {
      try {
        const seoData = parseSEOResult(originalContent)
        contentToReview = seoData.content
      } catch (e) {
        contentToReview = originalContent
      }
    }

    const reviewPrompt = generateReviewPrompt(contentToReview, topic, audience, tone)
    const reviewResponse = await callAI(selectedModel, reviewPrompt, finalApiKey)
    const reviewResults = parseReviewResult(reviewResponse)
    
    processingSteps[processingSteps.length - 1].status = 'completed'
    processingSteps[processingSteps.length - 1].details = `품질 점수: ${reviewResults.score}/10, 권장사항: ${reviewResults.recommendation}`

    // 3단계: 개선 적용 (필요한 경우)
    let improvedContent = null
    let finalContent = originalContent

    if (reviewResults.recommendation === 'improve') {
      processingSteps.push({
        step: 'content_improvement',
        status: 'in_progress',
        timestamp: new Date().toISOString()
      })

      const improvementPrompt = generateImprovementPrompt(
        contentToReview, reviewResults, topic, audience, tone, selectedModel
      )
      
      improvedContent = await callAI(selectedModel, improvementPrompt, finalApiKey)
      
      // SEO 모드인 경우 개선된 내용을 SEO 형식으로 다시 포장
      if (seoMode) {
        const basePrompt = generateSEOPrompt(topic, audience, tone, seoOptions, selectedModel)
        const seoImprovementPrompt = basePrompt.replace(
          `"${topic}"에 대한 SEO 최적화 콘텐츠를 위 JSON 형식으로만 생성해주세요:`,
          `다음 개선된 콘텐츠를 기반으로 "${topic}"에 대한 SEO 최적화 JSON을 생성해주세요:\n\n${improvedContent}\n\n위 내용을 바탕으로 JSON 형식으로만 응답:`
        )
        
        finalContent = await callAI(selectedModel, seoImprovementPrompt, finalApiKey)
      } else {
        finalContent = improvedContent
      }
      
      processingSteps[processingSteps.length - 1].status = 'completed'
      processingSteps[processingSteps.length - 1].details = 'AI 검토 결과를 바탕으로 콘텐츠 개선 완료'
    } else if (reviewResults.recommendation === 'regenerate') {
      processingSteps.push({
        step: 'regeneration',
        status: 'in_progress',
        timestamp: new Date().toISOString()
      })

      // 완전 재생성 (프롬프트에 검토 결과 반영)
      const regenerationPrompt = seoMode 
        ? generateSEOPrompt(topic, audience, tone, seoOptions, selectedModel)
        : generateAdvancedPrompt(topic, audience, tone, selectedModel)
      
      finalContent = await callAI(selectedModel, regenerationPrompt + `\n\n이전 생성에서 발견된 문제점을 피해주세요: ${reviewResults.weaknesses.join(', ')}`, finalApiKey)
      
      processingSteps[processingSteps.length - 1].status = 'completed'
      processingSteps[processingSteps.length - 1].details = '품질 부족으로 콘텐츠 재생성 완료'
    } else {
      processingSteps.push({
        step: 'approval',
        status: 'completed',
        timestamp: new Date().toISOString(),
        details: '초기 생성 콘텐츠가 높은 품질로 승인됨'
      })
    }

    const processingTime = Date.now() - startTime
    
    // 품질 지표 계산
    const originalScore = reviewResults.score
    const improvedScore = improvedContent ? Math.min(originalScore + 1.5, 10) : originalScore
    const improvementPercentage = improvedContent 
      ? Math.round(((improvedScore - originalScore) / originalScore) * 100)
      : 0

    const qaResult: QualityAssuranceResult = {
      originalContent,
      reviewResults,
      improvedContent,
      finalContent,
      processingSteps,
      qualityMetrics: {
        originalScore,
        improvedScore,
        improvementPercentage
      },
      modelUsed: aiModels[selectedModel].name,
      processingTime
    }

    // SEO 모드인 경우 SEO 데이터도 함께 반환
    if (seoMode) {
      const seoData = parseSEOResult(finalContent)
      return c.json({
        ...qaResult,
        ...seoData,
        isQA: true,
        expertSelection
      })
    } else {
      return c.json({
        ...qaResult,
        content: finalContent,
        isQA: true,
        expertSelection
      })
    }

  } catch (error: any) {
    console.error('품질 검증 시스템 오류:', error)
    
    return c.json({
      error: '품질 검증 시스템에 오류가 발생했습니다.',
      message: error.message,
      processingSteps: [{
        step: 'error',
        status: 'failed',
        timestamp: new Date().toISOString(),
        details: error.message
      }]
    }, 500)
  }
})

// Phase 1 강화된 블로그 생성 + AI 도구 편집 지원
// 🔥 라이브 AI 생성 API - Phase 1 품질 향상 시스템 적용
app.post('/api/generate', async (c) => {
  try {
    const { topic, audience, tone, aiModel, enableSEO, enablePhase1 } = await c.req.json()
    
    if (!topic) {
      return c.json({ error: '주제를 입력해주세요.' }, 400)
    }

    console.log(`🚀 라이브 AI 생성 시작 - 주제: ${topic}, 모델: ${aiModel || 'auto'}`)

    // 1. AI 모델 자동 선택 시스템
    let selectedModel = aiModel
    let expertSelection = null
    
    if (aiModel === 'auto') {
      expertSelection = selectExpertModel(topic, audience, tone)
      selectedModel = expertSelection.model
    }
    console.log(`🧠 최적 모델 선택: ${selectedModel}`)
    
    if (expertSelection) {
      console.log(`🎯 전문가 시스템: ${expertSelection.expert.name} (신뢰도: ${expertSelection.confidence}%)`)
    }

    // 2. API 키 확인 및 선택
    const apiKeys = await getAvailableApiKeys(c.env)
    const modelApiKey = getModelApiKey(selectedModel, apiKeys, c.env)
    
    if (!modelApiKey) {
      console.log('⚠️ API 키 없음 - 데모 모드로 전환')
      return generateDemoResponse(topic, audience, tone, selectedModel)
    }

    console.log(`✅ ${selectedModel} API 키 확인됨`)

    // API 키가 설정되어 있으면 바로 라이브 데모 모드로 처리 (실제 API 호출 대신)
    if (modelApiKey.includes('development-test-key') || modelApiKey.includes('sandbox-only')) {
      console.log(`🎯 개발환경 라이브 데모 모드 - ${selectedModel} 시뮬레이션`)
      
      const simulatedContent = await generateAdvancedSimulatedContent(topic, audience, tone, selectedModel)
      
      return c.json({
        title: extractTitle(simulatedContent) || `${topic} - 완벽 가이드`,
        content: simulatedContent,
        model: `${aiModels[selectedModel].name} (라이브 시뮬레이션)`,
        metadata: {
          audience, tone, aiModel: selectedModel,
          generatedAt: new Date().toISOString(),
          enablePhase1: enablePhase1 !== false,
          enableSEO: enableSEO || false,
          isLive: true,
          isSimulation: true,
          qualityScore: 89,
          expertSelection: expertSelection
        }
      })
    }

    // 3. Phase 1 품질 향상 프롬프트 생성
    const enhancedPrompt = enablePhase1 !== false 
      ? generatePhase1EnhancedPrompt(topic, audience, tone, selectedModel)
      : generateBasicPrompt(topic, audience, tone)

    // 4. 실제 AI 모델 호출
    let aiResponse
    try {
      switch (selectedModel) {
        case 'claude':
          aiResponse = await callClaudeAPI(enhancedPrompt, modelApiKey)
          break
        case 'gemini':
          aiResponse = await callGeminiAPI(enhancedPrompt, modelApiKey)
          break  
        case 'openai':
          aiResponse = await callOpenAIAPI(enhancedPrompt, modelApiKey)
          break
        case 'grok':
          aiResponse = await callGrokAPI(enhancedPrompt, modelApiKey)
          break
        default:
          throw new Error(`지원하지 않는 모델: ${selectedModel}`)
      }

      console.log(`✨ ${selectedModel} 응답 생성 완료`)

      // 5. 응답 후처리 및 품질 검증
      const processedContent = await postProcessContent(aiResponse, enableSEO)

      return c.json({
        title: extractTitle(processedContent) || `${topic} - 완벽 가이드`,
        content: processedContent,
        model: selectedModel,
        metadata: {
          audience,
          tone,
          aiModel: selectedModel,
          generatedAt: new Date().toISOString(),
          enablePhase1: enablePhase1 !== false,
          enableSEO: enableSEO || false,
          isLive: true,
          qualityScore: calculateQualityScore(processedContent)
        }
      })

    } catch (apiError: any) {
      console.error(`❌ ${selectedModel} API 오류:`, apiError.message)
      
      // API 실패 시 다른 모델로 폴백
      const fallbackModel = getFallbackModel(selectedModel, apiKeys, c.env)
      if (fallbackModel) {
        console.log(`🔄 ${fallbackModel}로 폴백 시도`)
        try {
          const fallbackKey = getModelApiKey(fallbackModel, apiKeys, c.env)
          let fallbackResponse
          
          switch (fallbackModel) {
            case 'claude':
              fallbackResponse = await callClaudeAPI(enhancedPrompt, fallbackKey)
              break
            case 'gemini':
              fallbackResponse = await callGeminiAPI(enhancedPrompt, fallbackKey)
              break
            case 'openai':
              fallbackResponse = await callOpenAIAPI(enhancedPrompt, fallbackKey)
              break
          }
          
          const processedContent = await postProcessContent(fallbackResponse, enableSEO)
          console.log(`✅ ${fallbackModel} 폴백 성공`)
          
          return c.json({
            title: extractTitle(processedContent) || `${topic} - 완벽 가이드`,
            content: processedContent,
            model: `${fallbackModel} (폴백)`,
            metadata: {
              audience, tone, aiModel: fallbackModel,
              generatedAt: new Date().toISOString(),
              enablePhase1: enablePhase1 !== false,
              enableSEO: enableSEO || false,
              isLive: true, isFallback: true,
              qualityScore: calculateQualityScore(processedContent)
            }
          })
        } catch (fallbackError) {
          console.error(`❌ ${fallbackModel} 폴백도 실패:`, fallbackError)
        }
      }
      
      // 모든 AI 모델 실패 시 고품질 데모 모드
      console.log('🎭 모든 AI 모델 실패 - 고품질 데모 모드')
      return generateDemoResponse(topic, audience, tone, selectedModel, true)
    }

  } catch (error: any) {
    console.error('생성 시스템 오류:', error)
    return c.json({ 
      error: '생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      details: error.message 
    }, 500)
  }
})

// 🔑 API 키 상태 확인 및 설정 가이드
app.get('/api/status', async (c) => {
  try {
    const { env } = c
    const apiKeys = await getAvailableApiKeys(env)
    
    const modelStatus = {
      claude: {
        configured: !!apiKeys.claude,
        model: 'Claude 3 Sonnet',
        description: '논리적 분석과 체계적 글쓰기에 뛰어남',
        setupCommand: 'npx wrangler pages secret put CLAUDE_API_KEY --project-name ai-blog-generator-v2'
      },
      gemini: {
        configured: !!apiKeys.gemini,
        model: 'Gemini Pro',
        description: '창의적 사고와 다각도 분석 특화',
        setupCommand: 'npx wrangler pages secret put GEMINI_API_KEY --project-name ai-blog-generator-v2'
      },
      openai: {
        configured: !!apiKeys.openai,
        model: 'GPT-4o-mini',
        description: '자연스러운 대화체 글쓰기',
        setupCommand: 'npx wrangler pages secret put OPENAI_API_KEY --project-name ai-blog-generator-v2'
      },
      grok: {
        configured: !!apiKeys.grok,
        model: 'Grok Beta',
        description: '독특한 관점과 유머러스한 표현',
        setupCommand: 'npx wrangler pages secret put GROK_API_KEY --project-name ai-blog-generator-v2'
      }
    }
    
    const configuredCount = Object.values(modelStatus).filter(m => m.configured).length
    const totalModels = Object.keys(modelStatus).length
    
    return c.json({
      version: 'v4.1 Live Edition',
      status: configuredCount > 0 ? 'live' : 'demo',
      summary: {
        configured: `${configuredCount}/${totalModels}`,
        message: configuredCount > 0 
          ? `✅ ${configuredCount}개의 라이브 AI 모델이 활성화되어 있습니다!`
          : '⚠️ API 키가 설정되지 않아 데모 모드로 작동 중입니다.',
        recommendation: configuredCount === 0 
          ? 'Cloudflare Pages 대시보드에서 환경변수를 설정해주세요.'
          : '더 많은 AI 모델을 추가하면 더 다양한 스타일의 글을 생성할 수 있습니다.'
      },
      models: modelStatus,
      setupGuide: {
        step1: '1. Cloudflare Pages 대시보드 접속',
        step2: '2. 프로젝트 > Settings > Environment variables',
        step3: '3. Production 환경변수 추가',
        step4: '4. 또는 wrangler CLI로 설정',
        note: 'API 키는 각 서비스에서 발급받으세요 (Claude: Anthropic, Gemini: Google AI Studio, OpenAI: OpenAI Platform, Grok: xAI)'
      },
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return c.json({ 
      error: 'API 키 상태 확인 중 오류가 발생했습니다.',
      details: error.message 
    }, 500)
  }
})

// 🧠 AI 모델 자동 선택 시스템 - selectExpertModel 함수 사용

// 🔑 API 키 관리 시스템
async function getAvailableApiKeys(env: any) {
  return {
    claude: env.CLAUDE_API_KEY,
    gemini: env.GEMINI_API_KEY, 
    openai: env.OPENAI_API_KEY,
    grok: env.GROK_API_KEY
  }
}

function getModelApiKey(model: string, apiKeys: any, env: any): string {
  return apiKeys[model] || ''
}

function getFallbackModel(failedModel: string, apiKeys: any, env: any): string | null {
  const priority = ['claude', 'openai', 'gemini', 'grok']
  const available = priority.filter(model => model !== failedModel && getModelApiKey(model, apiKeys, env))
  return available[0] || null
}

// 📝 Phase 1 품질 향상 프롬프트 시스템
function generatePhase1EnhancedPrompt(topic: string, audience: string, tone: string, model: string): string {
  const basePrompt = generateBasicPrompt(topic, audience, tone)
  
  const phase1Enhancement = `
🔥 **Phase 1 품질 향상 시스템 적용**

다음 4가지 핵심 요소를 반드시 포함하여 89/100 점수의 고품질 블로그를 작성하세요:

1. **감정적 훅 (도입부 임팩트 300% 강화)**
   - 첫 문장에 독자의 호기심을 자극하는 질문이나 놀라운 사실
   - 개인적 경험이나 공감할 수 있는 상황 제시
   - 예: "당신은 혹시 ${topic}에 대해 이런 고민을 해본 적이 있나요?"

2. **실시간 데이터 통합 (최신성 보장)**
   - 2024년 최신 통계, 트렌드, 연구 결과 인용
   - 구체적인 수치와 출처 명시
   - 한국 시장 데이터나 사례 우선 활용

3. **실용성 극대화 (즉시 적용 가능)**
   - 단계별 실행 가이드 제공
   - 체크리스트나 템플릿 포함
   - "오늘부터 바로 시작할 수 있는" 구체적 방법

4. **구조적 완성도 (가독성 88/100)**
   - 명확한 섹션 구분 (##, ###)
   - 핵심 내용을 강조 (**굵게**)
   - 리스트와 번호를 활용한 정리
   - 요약 및 다음 단계 제시

**추가 요구사항:**
- 글자수: 1500-2500자 (적정 분량)
- SEO 최적화: 주요 키워드 자연스럽게 배치
- ${audience} 수준에 맞는 설명
- ${tone} 톤으로 일관된 문체
`

  return `${basePrompt}\n\n${phase1Enhancement}`
}

function generateBasicPrompt(topic: string, audience: string, tone: string): string {
  return `다음 조건으로 고품질 블로그 글을 작성해주세요:

주제: ${topic}
대상 독자: ${audience}
글의 톤: ${tone}

${audience === '일반인' ? '누구나 쉽게 이해할 수 있도록' : audience === '초보자' ? '기초부터 차근차근' : '전문적이고 심화된 내용으로'} 작성하고, ${tone === '친근한' ? '편안하고 자연스러운' : tone === '전문적' ? '신뢰할 수 있고 정확한' : '재미있고 유머러스한'} 톤으로 써주세요.

구체적이고 실용적인 정보를 포함하여 독자가 실제로 도움받을 수 있는 내용으로 작성해주세요.`
}

// 🤖 AI 모델 API 호출 함수들
async function callClaudeAPI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    })
  })
  
  if (!response.ok) {
    throw new Error(`Claude API 오류: ${response.status}`)
  }
  
  const data = await response.json()
  return data.content[0].text
}

async function callGeminiAPI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  })
  
  if (!response.ok) {
    throw new Error(`Gemini API 오류: ${response.status}`)
  }
  
  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}

async function callOpenAIAPI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000
    })
  })
  
  if (!response.ok) {
    throw new Error(`OpenAI API 오류: ${response.status}`)
  }
  
  const data = await response.json()
  return data.choices[0].message.content
}

async function callGrokAPI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'grok-beta',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000
    })
  })
  
  if (!response.ok) {
    throw new Error(`Grok API 오류: ${response.status}`)
  }
  
  const data = await response.json()
  return data.choices[0].message.content
}

// 📊 콘텐츠 후처리 및 품질 검증
async function postProcessContent(content: string, enableSEO: boolean): Promise<string> {
  let processed = content.trim()
  
  // SEO 최적화 적용
  if (enableSEO) {
    processed = await applySEOOptimization(processed)
  }
  
  // 품질 검증 및 개선
  processed = improveContentQuality(processed)
  
  return processed
}

async function applySEOOptimization(content: string): Promise<string> {
  // SEO 메타데이터 추가, 키워드 최적화 등
  return content // 현재는 기본 반환
}

function improveContentQuality(content: string): string {
  // 문단 정리, 형식 개선 등
  return content
    .replace(/\n{3,}/g, '\n\n') // 과도한 줄바꿈 정리
    .replace(/#{4,}/g, '###') // 제목 레벨 정리
}

function extractTitle(content: string): string | null {
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1] : null
}

function calculateQualityScore(content: string): number {
  let score = 70 // 기본 점수
  
  // 길이 점수 (1500-2500자 적정)
  const length = content.length
  if (length >= 1500 && length <= 2500) score += 10
  else if (length >= 1000) score += 5
  
  // 구조 점수
  const headers = (content.match(/^#{1,3}\s/gm) || []).length
  if (headers >= 3) score += 5
  
  // 리스트/강조 점수
  const lists = (content.match(/^[-*]\s/gm) || []).length
  const bold = (content.match(/\*\*.*?\*\*/g) || []).length
  if (lists >= 3 || bold >= 5) score += 5
  
  // 실용성 점수
  if (content.includes('단계') || content.includes('방법') || content.includes('팁')) score += 10
  
  return Math.min(score, 100)
}

// 🎭 고품질 데모 모드 (API 키 없을 때)
function generateDemoResponse(topic: string, audience: string, tone: string, model: string, isFailback = false) {
  const content = generateDemoContent(topic, audience, tone)
  const demoNote = isFailback ? 
    '\n\n*⚠️ 현재 AI 서비스에 일시적 문제가 발생하여 데모 모드로 생성되었습니다. 잠시 후 다시 시도해주세요.*' :
    '\n\n*🤖 이 콘텐츠는 AI 블로그 생성기 데모 버전으로 생성되었습니다. API 키를 설정하면 실제 AI 모델을 사용할 수 있습니다.*'
  
  return {
    title: `${topic} - 완벽 가이드`,
    content: content + demoNote,
    model: `${model} (데모)`,
    metadata: {
      audience, tone, aiModel: model,
      generatedAt: new Date().toISOString(),
      isDemo: true, isFailback,
      qualityScore: 75,
      note: 'API 키를 Cloudflare Pages 환경변수로 설정하면 실제 AI 생성 가능'
    }
  }
}

// 🎯 고품질 라이브 시뮬레이션 콘텐츠 생성
async function generateAdvancedSimulatedContent(topic: string, audience: string, tone: string, model: string): Promise<string> {
  const expert = aiExperts[model] || aiExperts.claude
  const template = contentTemplates[audience] || contentTemplates['일반인']
  
  // 모델별 전문성을 반영한 고품질 콘텐츠 생성
  const expertise = expert.expertise.join(', ')
  const strengths = expert.strengths.join(', ')
  
  return `# ${topic}: ${audience} 대상 완벽 가이드 📚

> **${expert.name}**이 ${expertise} 전문성을 바탕으로 작성한 고품질 콘텐츠입니다.
> 
> **핵심 역량**: ${expert.reasoning}

## 🎯 핵심 포인트

${topic}에 대해 ${audience} 수준에서 ${tone === '친근한' ? '친근하고 이해하기 쉽게' : tone === '전문적' ? '전문적이고 체계적으로' : '유머러스하고 재미있게'} 알아보겠습니다.

### 💡 왜 지금 ${topic}가 중요할까요?

${tone === '유머러스' ? 
'😄 요즘 ${topic} 얘기 안 들어본 사람이 없을 정도죠! 마치 치킨과 맥주처럼 뗄 수 없는 관계가 되어버렸어요.' :
tone === '전문적' ?
'📊 현재 시장에서 ${topic}는 핵심적인 경쟁력 요소로 인식되고 있으며, 관련 투자와 연구가 급증하고 있습니다.' :
'💭 혹시 ${topic}에 대해 이런 고민 해보신 적 있으세요? "이거 정말 내게 필요한 건가?" 오늘 그 답을 함께 찾아보겠습니다!'}

## 🔍 ${topic} 완전 분석

### 1. **기본 개념 이해하기**

${audience === '초보자' ? 
`기초부터 차근차근 알아보겠습니다:

- **핵심 정의**: ${topic}의 가장 중요한 개념
- **기본 원리**: 어떻게 작동하는지 쉽게 설명
- **왜 중요한가**: 실생활에 미치는 영향` :
audience === '전문가' ?
`전문적 관점에서 심화 분석입니다:

- **최신 동향**: 2024년 주요 발전사항과 트렌드
- **핵심 기술**: 기술적 메커니즘과 구현 방식
- **시장 분석**: 경쟁 현황과 미래 전망` :
`실용적 접근으로 핵심을 파악해보겠습니다:

- **실생활 연결**: 일상에서 만날 수 있는 ${topic}
- **즉시 활용법**: 오늘부터 적용할 수 있는 방법
- **주의사항**: 알아두면 좋은 팁과 함정`}

### 2. **${expert.strengths[0]} 관점에서 본 ${topic}**

**${model.toUpperCase()} AI 전문 분석:**

${model === 'claude' ? 
`📈 데이터 기반 분석 결과, ${topic}는 다음과 같은 특징을 보입니다:

- **논리적 구조**: 체계적인 접근이 필요한 영역
- **분석적 사고**: 객관적 데이터와 근거 중심
- **전략적 가치**: 장기적 관점에서의 투자 가치` :
model === 'gemini' ? 
`🎨 창의적 관점에서 ${topic}를 바라보면:

- **혁신적 접근**: 기존과 다른 새로운 시각
- **다각도 분석**: 여러 관점에서의 종합적 이해
- **실용적 창조**: 이론과 실무의 완벽한 조화` :
model === 'openai' ?
`🤝 소통 중심으로 ${topic}를 이해해보면:

- **자연스러운 적용**: 일상에서 무리 없이 활용
- **감정적 연결**: 사람 중심의 따뜻한 접근
- **스토리텔링**: 경험과 사례 중심의 설명` :
`🚀 트렌드 관점에서 ${topic}의 미래:

- **바이럴 가능성**: SNS와 소셜미디어 활용도
- **젊은층 매력도**: MZ세대가 주목하는 이유
- **창의적 활용**: 기존 틀을 깬 새로운 시도들`}

### 3. **실전 활용 가이드 🛠️**

${template.structure.slice(2, 5).map((step, index) => `
#### ${index + 1}단계: ${step.replace(/\d+\.\s*/, '')}

${audience === '초보자' ? 
`✨ 초보자도 쉽게 따라할 수 있는 방법:
- 준비물: 특별한 도구 없이 시작
- 소요시간: 약 ${Math.floor(Math.random() * 20) + 10}분
- 성공 확률: 90% 이상 (올바른 방법으로 할 때)` :
`💡 실무진이 추천하는 핵심 포인트:
- 효율성: 시간 대비 최대 효과
- 실용성: 바로 적용 가능한 실전 팁
- 지속성: 꾸준히 이어갈 수 있는 방법`}
`).join('')}

## 📊 기대 효과와 성과 지표

**${audience}이 ${topic}를 제대로 활용하면:**

${tone === '친근한' ? 
`- ✅ **즉시 효과**: 첫 주부터 느낄 수 있는 변화
- ✅ **1개월 후**: 주변 사람들이 알아볼 정도의 개선
- ✅ **3개월 후**: 완전히 새로운 수준에 도달
- ✅ **6개월 후**: 이 분야의 준전문가 수준

> 💪 "진짜 달라진 걸 느끼는 데 생각보다 오래 걸리지 않아요!"` :
`- 📈 **정량적 개선**: 측정 가능한 구체적 수치 향상
- 🎯 **목표 달성률**: 80% 이상의 높은 성공률
- 💰 **ROI 분석**: 투입 대비 평균 300% 수익률
- 🏆 **경쟁 우위**: 동종 업계 상위 20% 진입

> 📊 "데이터가 증명하는 확실한 성과를 보장합니다."`}

## ⚡ 즉시 실행 체크리스트

**오늘부터 바로 시작할 수 있는 액션 플랜:**

1. **[ ] 10분 준비단계**: 필요한 기본 정보 수집
2. **[ ] 30분 실행단계**: 첫 번째 시도해보기  
3. **[ ] 1시간 점검단계**: 결과 확인 및 조정
4. **[ ] 1주일 습관화**: 꾸준한 실행으로 루틴 만들기

## 🚨 주의사항 및 실패 방지법

${expert.name}이 특별히 강조하는 포인트:

**절대 하지 말아야 할 3가지:**
- ❌ 성급한 결과 기대 (최소 2-3주는 기다려야)
- ❌ 완벽주의 함정 (80% 수준에서 시작하기)
- ❌ 혼자서만 해결하려는 고집 (도움 요청하기)

**성공 확률을 높이는 3가지 팁:**
- ✅ 작은 것부터 시작하기 (베이비 스텝 전략)
- ✅ 주변 환경 정비하기 (성공하기 쉬운 환경)  
- ✅ 진척 상황 기록하기 (성취감과 동기 부여)

## 💭 마무리: ${topic}로 여러분의 삶이 바뀔 수 있습니다

${tone === '유머러스' ? 
`😊 자, 이제 ${topic} 전문가가 되어보시겠어요? 처음엔 어려워 보여도 막상 해보면 "어? 이거 생각보다 재미있네?" 하게 될 거예요. 

마치 처음 자전거 탈 때처럼요. 넘어질 것 같아서 무서웠는데, 한 번 균형 잡으면 그 다음부터는 신나게 달릴 수 있잖아요! 🚴‍♀️` :
tone === '전문적' ?
`📋 ${topic}에 대한 체계적 분석을 통해 실행 가능한 전략을 제시했습니다. 성공적인 결과를 위해서는 단계별 접근과 지속적인 모니터링이 핵심입니다.

데이터 기반의 의사결정과 객관적 평가를 통해 지속 가능한 성과를 달성하시기 바랍니다.` :
`💡 ${topic}에 대한 여정이 이제 시작입니다! 처음엔 막막해 보일 수 있지만, 한 걸음씩 내딛다 보면 분명 "아, 이렇게 하면 되는구나!" 하는 순간이 올 거예요.

여러분도 충분히 할 수 있습니다. 지금 이 글을 읽고 계시다는 것 자체가 이미 첫걸음을 뗀 거니까요! 🌟`}

---

**🎯 Next Steps:**
- 이 가이드를 북마크하고 필요할 때마다 참고하세요
- 실제 적용하면서 나만의 노하우를 축적해보세요  
- 궁금한 점이 있으면 언제든 전문가의 도움을 받으세요

> **${expert.name} 추천**: "${expert.reasoning}"

*본 콘텐츠는 AI Blog Generator v4.1 Live Edition으로 생성되었습니다.*`
}

function generateDemoContent(topic: string, audience: string, tone: string): string {
  const toneAdjective = tone === '친근한' ? '쉽고 재미있게' : tone === '전문적' ? '체계적이고 정확하게' : '유머러스하고 흥미롭게'
  const audienceText = audience === '일반인' ? '누구나 이해할 수 있도록' : audience === '초보자' ? '기초부터 차근차근' : '심화 내용까지'
  
  return `# ${topic}: ${audienceText} ${toneAdjective} 알아보기

안녕하세요! 👋 오늘은 **${topic}**에 대해 ${audienceText} ${toneAdjective} 알아보겠습니다.

## 🎯 핵심 포인트

${topic}를 ${audience} 대상으로 ${tone} 톤으로 설명드리겠습니다:

### 1. 기본 개념 이해하기

${topic}는 현재 많은 분들이 관심을 가지고 계시는 중요한 주제입니다. ${audienceText} 접근해보면:

- **핵심 요소**: 가장 중요한 기본 개념들
- **실용적 적용**: 실생활에서 어떻게 활용할 수 있는지
- **주의사항**: 알아두면 좋은 팁과 주의점

### 2. 실제 사례와 예시

구체적인 예를 들어보겠습니다:

${tone === '유머러스' ? 
'😊 재미있는 사례를 통해 쉽게 이해해보세요!' : 
tone === '전문적' ?
'📊 데이터와 사실에 기반한 정확한 분석입니다.' :
'💡 친근한 예시로 쉽게 설명해드릴게요!'}

### 3. 실행 가능한 행동 계획

이제 실제로 적용해볼 수 있는 방법들입니다:

1. **첫 번째 단계**: 기본기 다지기
2. **두 번째 단계**: 점진적 발전시키기  
3. **세 번째 단계**: 최적화하고 개선하기

## 📈 기대 효과

${topic}를 제대로 이해하고 실행하면:

- ✅ 명확한 이해와 지식 습득
- ✅ 실생활에서의 즉시 적용 가능
- ✅ 장기적인 성과와 발전

## 💭 마무리

${topic}에 대해 ${toneAdjective} 살펴봤습니다. ${audience}을 위한 맞춤 설명으로 도움이 되셨기를 바랍니다!

---

**🚀 다음 단계 추천:**
- 더 자세한 정보가 필요하다면 전문 자료를 참고해보세요
- 실제 적용해보면서 경험을 쌓아가세요
- 궁금한 점이 있으면 언제든 질문해주세요`
}

// ==================== 메인 라우트 ====================

// 메인 홈페이지 라우트
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI Blog Generator v4.1 - 라이브 에디션</title>
        <link href="/static/tailwind.css" rel="stylesheet">
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
        <div class="max-w-7xl mx-auto px-4 py-8">
            <!-- 헤더 -->
            <header class="text-center mb-12">
                <h1 class="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                    <i class="fas fa-robot mr-3"></i>
                    AI Blog Generator v4.1
                </h1>
                <p class="text-xl text-gray-600 mb-6">라이브 AI 에디션 - 실시간 고품질 블로그 생성</p>
                
                <!-- 라이브 상태 표시 -->
                <div class="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full mb-8">
                    <div class="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    라이브 AI 서비스 활성화 (4개 AI 모델 지원)
                </div>
                
                <!-- 특징 카드들 -->
                <div class="grid md:grid-cols-4 gap-6 mb-8">
                    <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                        <i class="fas fa-brain text-3xl text-blue-500 mb-3"></i>
                        <h3 class="font-bold text-gray-800">Claude 3 Sonnet</h3>
                        <p class="text-sm text-gray-600">논리적 분석 전문</p>
                    </div>
                    <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                        <i class="fas fa-gem text-3xl text-green-500 mb-3"></i>
                        <h3 class="font-bold text-gray-800">Gemini Pro</h3>
                        <p class="text-sm text-gray-600">창의적 사고 특화</p>
                    </div>
                    <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
                        <i class="fas fa-comments text-3xl text-purple-500 mb-3"></i>
                        <h3 class="font-bold text-gray-800">GPT-4o-mini</h3>
                        <p class="text-sm text-gray-600">자연스러운 대화체</p>
                    </div>
                    <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-pink-500">
                        <i class="fas fa-sparkles text-3xl text-pink-500 mb-3"></i>
                        <h3 class="font-bold text-gray-800">Grok Beta</h3>
                        <p class="text-sm text-gray-600">독특한 관점과 유머</p>
                    </div>
                </div>
            </header>

            <!-- 🔥 한국 실시간 트렌드 섹션 -->
            <div id="trendSuggestions" class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-lg p-6 mb-8">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold text-gray-800">
                        🇰🇷 실시간 한국 트렌드 키워드
                    </h2>
                    <button 
                        onclick="refreshTrends()" 
                        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                        🔄 새로고침
                    </button>
                </div>
                <p class="text-gray-600 mb-4">지금 뜨고 있는 키워드로 블로그를 써보세요!</p>
                <div class="text-center text-gray-500">
                    <i class="fas fa-spinner fa-spin mr-2"></i>
                    트렌드 데이터를 불러오는 중...
                </div>
            </div>

            <!-- 메인 생성 폼 -->
            <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
                <form id="blogForm" class="space-y-6">
                    <div>
                        <label class="block text-lg font-semibold text-gray-800 mb-3">
                            <i class="fas fa-lightbulb mr-2 text-yellow-500"></i>
                            블로그 주제
                        </label>
                        <input 
                            type="text" 
                            id="topic" 
                            placeholder="예: AI 기술 트렌드, 건강한 라이프스타일, 투자 전략..." 
                            class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors text-lg"
                            required
                        >
                    </div>

                    <div class="grid md:grid-cols-3 gap-6">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">대상 독자</label>
                            <select id="audience" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500">
                                <option value="일반인">일반인</option>
                                <option value="초보자">초보자</option>
                                <option value="중급자">중급자</option>
                                <option value="전문가">전문가</option>
                                <option value="직장인">직장인</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">글의 톤</label>
                            <select id="tone" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500">
                                <option value="친근한">친근한</option>
                                <option value="전문적">전문적</option>
                                <option value="유머러스">유머러스</option>
                                <option value="진지한">진지한</option>
                                <option value="친근하고 실용적">친근하고 실용적</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">AI 모델</label>
                            <select id="aiModel" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500">
                                <option value="auto">🧠 자동 선택 (추천)</option>
                                <option value="claude">🔵 Claude 3 Sonnet</option>
                                <option value="gemini">🟢 Gemini Pro</option>
                                <option value="openai">🟣 GPT-4o-mini</option>
                                <option value="grok">🔴 Grok Beta</option>
                            </select>
                        </div>
                    </div>

                    <div class="flex flex-col sm:flex-row justify-center gap-4">
                        <button 
                            type="submit" 
                            class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                        >
                            <i class="fas fa-magic mr-2"></i>
                            라이브 AI로 블로그 생성하기
                        </button>
                        <button 
                            type="button"
                            onclick="generateWithImages()"
                            class="bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold text-lg hover:from-pink-600 hover:to-red-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
                        >
                            <i class="fas fa-image mr-2"></i>
                            🖼️ 이미지와 함께 생성
                        </button>
                    </div>
                </form>
            </div>

            <!-- 결과 영역 -->
            <div id="result" class="hidden bg-white rounded-xl shadow-lg p-8">
                <div id="loading" class="text-center py-12">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p class="text-lg text-gray-600">AI가 고품질 블로그를 생성하고 있습니다...</p>
                </div>
                <div id="content" class="hidden">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-800">생성된 블로그</h2>
                        <div class="flex space-x-2">
                            <button onclick="copyToClipboard()" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                                <i class="fas fa-copy mr-1"></i> 복사
                            </button>
                            <button onclick="downloadAsFile()" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                <i class="fas fa-download mr-1"></i> 다운로드
                            </button>
                        </div>
                    </div>
                    <div id="blogContent" class="prose max-w-none bg-gray-50 p-6 rounded-lg border"></div>
                    <div id="metadata" class="mt-6 p-4 bg-blue-50 rounded-lg"></div>
                    <div id="generatedImages" class="mt-6"></div>
                </div>
            </div>
        </div>

        <!-- JavaScript -->
        <script src="/static/simple-ui.js?v=4.1.1" onload="initializeAfterLoad()"></script>
        <script>
            // 단순하고 안전한 초기화
            function initializeAfterLoad() {
                console.log('🚀 v4.1.1 JavaScript 파일 로드 완료');
                
                // SimpleUI가 이미 simple-ui.js에서 자동 초기화됨
                // 추가로 트렌드 데이터만 로드
                setTimeout(() => {
                    if (window.simpleUI && typeof window.simpleUI.loadKoreanTrends === 'function') {
                        window.simpleUI.loadKoreanTrends();
                        console.log('🇰🇷 한국 트렌드 데이터 로딩 완료');
                    } else {
                        console.log('ℹ️ SimpleUI 자동 초기화 대기 중...');
                    }
                }, 1500);
            }
            
            // 중복 실행 방지
            if (typeof window.htmlInitialized === 'undefined') {
                window.htmlInitialized = true;
                console.log('📄 HTML v4.1.1 초기화 시작');
            }
        </script>
    </body>
    </html>
  `)
})

// ==================== 한국 트렌드 연동 시스템 ====================

// 특정 키워드의 트렌드 분석
app.post('/api/trend-analysis', async (c) => {
  try {
    const { keyword, period = '7d' } = await c.req.json()
    
    if (!keyword) {
      return c.json({ error: '키워드가 필요합니다' }, 400)
    }

    // 트렌드 분석 시뮬레이션 (실제로는 네이버 DataLab API 등 연동)
    const trendAnalysis = {
      keyword,
      period,
      trend: {
        direction: 'up', // up, down, stable
        change_percentage: Math.floor(Math.random() * 50) + 10,
        peak_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        current_volume: Math.floor(Math.random() * 100000) + 10000
      },
      related_keywords: [
        `${keyword} 2025`,
        `${keyword} 가이드`,
        `${keyword} 트렌드`,
        `${keyword} 방법`,
        `최신 ${keyword}`
      ],
      demographics: {
        age_groups: {
          '20s': 35,
          '30s': 28,
          '40s': 22,
          '50s+': 15
        },
        gender: {
          male: 52,
          female: 48
        }
      },
      seasonal_pattern: {
        is_seasonal: Math.random() > 0.5,
        peak_months: ['3월', '9월', '11월']
      },
      content_suggestions: [
        `${keyword} 완전 정복 가이드`,
        `2025년 ${keyword} 트렌드 전망`,
        `초보자를 위한 ${keyword} 입문서`,
        `${keyword} 성공 사례 분석`
      ],
      timestamp: new Date().toISOString()
    }

    return c.json(trendAnalysis)
  } catch (error) {
    console.error('트렌드 분석 실패:', error)
    return c.json({ error: '트렌드 분석 중 오류가 발생했습니다' }, 500)
  }
})

// ==================== AI 이미지 생성 시스템 ====================

// 블로그 글에 맞는 이미지 생성
app.post('/api/generate-image', async (c) => {
  try {
    const { topic, content, imageType = 'thumbnail', style = 'professional' } = await c.req.json()
    
    if (!topic) {
      return c.json({ error: '주제가 필요합니다' }, 400)
    }

    // 이미지 프롬프트 생성
    let imagePrompt = ''
    
    switch (imageType) {
      case 'thumbnail':
        imagePrompt = `Professional blog thumbnail for "${topic}". Clean, modern design with Korean text elements. High quality, 16:9 aspect ratio, suitable for social media sharing.`
        break
      case 'infographic':
        imagePrompt = `Modern infographic style illustration about "${topic}". Data visualization elements, charts, icons. Professional Korean business style.`
        break
      case 'hero':
        imagePrompt = `Hero image for blog post about "${topic}". Professional, engaging, suitable for blog header. Modern Korean design aesthetic.`
        break
      default:
        imagePrompt = `Professional illustration related to "${topic}". Clean, modern, business-friendly style.`
    }

    // 실제 이미지 생성 (AI 이미지 생성 서비스 연동)
    try {
      const imageResult = await image_generation({
        query: imagePrompt,
        model: 'flux-pro/ultra', // 빠르고 안정적인 모델
        aspect_ratio: imageType === 'thumbnail' ? '16:9' : '1:1',
        task_summary: `Generate ${imageType} image for blog about ${topic}`,
        image_urls: []
      })

      if (imageResult?.generated_images?.[0]?.image_urls_nowatermark?.[0]) {
        const imageUrl = imageResult.generated_images[0].image_urls_nowatermark[0]
        
        return c.json({
          success: true,
          image: {
            url: imageUrl,
            type: imageType,
            style: style,
            prompt: imagePrompt,
            topic: topic
          },
          metadata: {
            generated_at: new Date().toISOString(),
            model: 'flux-pro/ultra',
            aspect_ratio: imageType === 'thumbnail' ? '16:9' : '1:1'
          }
        })
      } else {
        throw new Error('이미지 생성 실패: 결과 없음')
      }
    } catch (imageError) {
      console.error('이미지 생성 오류:', imageError)
      
      // 실패 시 플레이스홀더 이미지 제공 (URL 인코딩된 SVG)
      const svgContent = `<svg width="800" height="450" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" /><stop offset="100%" style="stop-color:#7C3AED;stop-opacity:1" /></linearGradient></defs><rect width="800" height="450" fill="url(#grad)"/><text x="400" y="200" text-anchor="middle" fill="white" font-family="Arial" font-size="24" font-weight="bold">${topic}</text><text x="400" y="250" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Arial" font-size="16">이미지 생성 준비 중...</text><circle cx="400" cy="300" r="20" fill="none" stroke="white" stroke-width="2" opacity="0.7"><animate attributeName="r" values="20;25;20" dur="2s" repeatCount="indefinite"/></circle></svg>`
      const placeholderSvg = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`
      
      return c.json({
        success: false,
        error: '이미지 생성 실패',
        placeholder: {
          url: placeholderSvg,
          type: 'placeholder',
          message: '이미지 생성 서비스 일시 중단. 플레이스홀더 이미지를 제공합니다.'
        }
      })
    }
    
  } catch (error) {
    console.error('이미지 생성 API 오류:', error)
    return c.json({ error: '이미지 생성 중 오류가 발생했습니다' }, 500)
  }
})

// 블로그 포스트용 다중 이미지 생성
app.post('/api/generate-blog-images', async (c) => {
  try {
    const { topic, sections = [], imageCount = 3 } = await c.req.json()
    
    if (!topic) {
      return c.json({ error: '주제가 필요합니다' }, 400)
    }

    const images = []
    const imageTypes = ['thumbnail', 'infographic', 'hero']
    
    for (let i = 0; i < Math.min(imageCount, 3); i++) {
      const imageType = imageTypes[i] || 'professional'
      const sectionTopic = sections[i] || topic
      
      try {
        // 각 섹션별 이미지 생성
        const imagePrompt = `Professional ${imageType} style image for "${sectionTopic}". Modern, clean design suitable for Korean blog post. High quality, engaging visual.`
        
        // 실제 이미지 생성 시도
        const imageResult = await image_generation({
          query: imagePrompt,
          model: 'flux-pro/ultra',
          aspect_ratio: imageType === 'thumbnail' ? '16:9' : '4:3',
          task_summary: `Generate ${imageType} for blog section about ${sectionTopic}`,
          image_urls: []
        })

        if (imageResult?.generated_images?.[0]?.image_urls_nowatermark?.[0]) {
          images.push({
            url: imageResult.generated_images[0].image_urls_nowatermark[0],
            type: imageType,
            topic: sectionTopic,
            prompt: imagePrompt,
            index: i + 1
          })
        } else {
          // 실패 시 플레이스홀더 (URL 인코딩된 SVG)
          const fallbackSvgContent = `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg"><rect width="600" height="400" fill="#E5E7EB"/><text x="300" y="180" text-anchor="middle" fill="#6B7280" font-family="Arial" font-size="18">${sectionTopic}</text><text x="300" y="220" text-anchor="middle" fill="#9CA3AF" font-family="Arial" font-size="14">이미지 생성 실패</text></svg>`
          const fallbackSvg = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(fallbackSvgContent)}`
          
          images.push({
            url: fallbackSvg,
            type: 'placeholder',
            topic: sectionTopic,
            index: i + 1,
            note: '생성 실패로 인한 플레이스홀더'
          })
        }
      } catch (error) {
        console.error(`이미지 ${i + 1} 생성 실패:`, error)
        const errorSvgContent = `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg"><rect width="600" height="400" fill="#FEE2E2"/><text x="300" y="180" text-anchor="middle" fill="#DC2626" font-family="Arial" font-size="18">${sectionTopic}</text><text x="300" y="220" text-anchor="middle" fill="#EF4444" font-family="Arial" font-size="14">이미지 생성 오류</text></svg>`
        const errorSvg = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(errorSvgContent)}`
        
        images.push({
          url: errorSvg,
          type: 'error',
          topic: sectionTopic,
          index: i + 1,
          error: error.message
        })
      }
    }

    return c.json({
      success: true,
      images,
      metadata: {
        topic,
        total_images: images.length,
        generated_at: new Date().toISOString(),
        note: '일부 이미지는 플레이스홀더일 수 있습니다'
      }
    })
    
  } catch (error) {
    console.error('다중 이미지 생성 오류:', error)
    return c.json({ error: '다중 이미지 생성 중 오류가 발생했습니다' }, 500)
  }
})

export default app
