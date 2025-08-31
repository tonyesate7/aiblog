import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// API routes for blog generation
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', message: 'Blog Generator API is running' })
})

// 서브키워드 생성 API (Claude)
app.post('/api/generate-subkeywords', async (c) => {
  try {
    const { mainKeyword, apiKey } = await c.req.json()
    
    if (!mainKeyword || !apiKey) {
      return c.json({ error: 'mainKeyword와 apiKey가 필요합니다' }, 400)
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `당신은 SEO 전문가입니다. 주어진 메인 키워드를 바탕으로 블로그에 적합한 서브 키워드 10개를 생성해주세요.

메인 키워드: "${mainKeyword}"

다음 조건에 맞는 서브 키워드 10개를 JSON 배열 형태로만 제공해주세요:
1. 메인 키워드와 관련성이 높을 것
2. 블로그 글 제목으로 활용 가능할 것  
3. 다양한 검색 의도를 포함할 것 (정보성, 상업적, 탐색적)
4. 한국어로 작성할 것
5. 롱테일 키워드 형태일 것

응답은 반드시 이 형태로만: ["키워드1", "키워드2", "키워드3", "키워드4", "키워드5", "키워드6", "키워드7", "키워드8", "키워드9", "키워드10"]

다른 설명 없이 JSON 배열만 제공하세요.`
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Claude API Error:', errorText)
      return c.json({ error: 'Claude API 호출 실패' }, 500)
    }

    const data = await response.json()
    const content = data.content[0].text

    // JSON 배열 추출 시도
    try {
      const keywordsMatch = content.match(/\[.*?\]/s)
      if (keywordsMatch) {
        const keywords = JSON.parse(keywordsMatch[0])
        return c.json({ 
          success: true, 
          keywords: keywords.map((keyword, index) => ({
            id: index + 1,
            keyword: keyword,
            editable: true
          }))
        })
      } else {
        // JSON 형태가 아닌 경우 줄바꿈으로 분리
        const lines = content.split('\n').filter(line => line.trim())
        const keywords = lines.slice(0, 10).map(line => 
          line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').replace(/["""]/g, '').trim()
        )
        return c.json({ 
          success: true, 
          keywords: keywords.map((keyword, index) => ({
            id: index + 1,
            keyword: keyword,
            editable: true
          }))
        })
      }
    } catch (parseError) {
      console.error('키워드 파싱 오류:', parseError)
      return c.json({ error: '키워드 파싱 실패' }, 500)
    }

  } catch (error) {
    console.error('서브키워드 생성 오류:', error)
    return c.json({ error: '서버 오류가 발생했습니다' }, 500)
  }
})

// 블로그 글 생성 API (Claude)
app.post('/api/generate-article', async (c) => {
  try {
    const { keyword, mainKeyword, contentStyle, contentLength, targetAudience, apiKey } = await c.req.json()
    
    if (!keyword || !apiKey) {
      return c.json({ error: 'keyword와 apiKey가 필요합니다' }, 400)
    }

    const stylePrompts = {
      informative: '정보 전달에 중점을 둔 객관적이고 교육적인',
      review: '개인적인 경험과 평가를 포함한 리뷰 형식의',
      guide: '단계별 가이드 형식의 실용적인',
      news: '최신 동향과 뉴스를 다루는',
      tutorial: '따라할 수 있는 튜토리얼 형식의'
    }

    const audiencePrompts = {
      general: '일반 독자들이 쉽게 이해할 수 있도록',
      beginner: '초보자도 따라할 수 있도록 기초부터 설명하는',
      intermediate: '어느 정도 기본 지식이 있는 중급자를 위한',
      expert: '전문 지식을 가진 사람들을 대상으로 한 심화된'
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 3000,
        messages: [{
          role: 'user',
          content: `당신은 전문 블로그 작가입니다. SEO에 최적화된 고품질 블로그 글을 작성해주세요.

다음 조건에 맞는 블로그 글을 작성해주세요:

**키워드**: ${keyword}
**메인 키워드**: ${mainKeyword}
**글 스타일**: ${stylePrompts[contentStyle] || '정보성'}
**대상 독자**: ${audiencePrompts[targetAudience] || '일반인'}
**글 길이**: 약 ${contentLength}자

**글 구조**:
1. 매력적인 제목 (키워드 포함)
2. 서론 (독자의 관심을 끄는 도입부)
3. 본론 (3-4개의 소제목으로 구분)
4. 결론 (핵심 내용 요약 및 마무리)

**요구사항**:
- SEO 최적화를 위해 키워드를 자연스럽게 본문에 포함
- 읽기 쉽고 실용적인 내용
- 한국어로 작성
- 마크다운 형식으로 작성
- 제목에 #, 소제목에 ##, 작은 제목에 ### 사용
- 실제 도움이 되는 구체적인 내용으로 구성

글을 작성해주세요.`
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Claude API Error:', errorText)
      return c.json({ error: 'Claude API 호출 실패' }, 500)
    }

    const data = await response.json()
    const content = data.content[0].text

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

  } catch (error) {
    console.error('블로그 글 생성 오류:', error)
    return c.json({ error: '서버 오류가 발생했습니다' }, 500)
  }
})

// Main page
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
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
                        <button id="settingsBtn" class="hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded transition">
                            <i class="fas fa-cog mr-2"></i>설정
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <!-- 메인 컨텐츠 -->
        <div class="max-w-6xl mx-auto px-4 py-8">
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
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Claude API 키</label>
                            <input type="password" id="claudeApiKey" 
                                   placeholder="sk-ant-..."
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            <p class="text-xs text-gray-500 mt-1">
                                설정된 API 키는 브라우저에 안전하게 저장됩니다<br>
                                <a href="https://console.anthropic.com" target="_blank" class="text-blue-600 hover:underline">
                                    console.anthropic.com에서 발급 받으세요
                                </a>
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
