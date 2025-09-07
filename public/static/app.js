// ==================== AI 블로그 생성기 v3.0 ====================
// 품질 검증 시스템(QA System) 포함 고급 버전

class BlogGenerator {
    constructor() {
        this.initializeElements()
        this.attachEventListeners()
        this.loadApiKeys()
        this.checkApiKeyStatus()
        this.initializeTutorial()
        this.initializeBlogEditor()
        
        console.log('🚀 AI 블로그 생성기 v3.1 초기화 완료 (GROK 통합 + 사용자 가이드 시스템 + 블로그 에디터)')
        
        // 블로그 에디터 상태
        this.isEditMode = false
        this.editHistory = []
        this.currentHistoryIndex = -1
        this.currentContent = ''
        
        // 디버깅: 전역 클릭 이벤트 감지
        document.addEventListener('click', (e) => {
            if (e.target.id === 'generateBtn') {
                console.log('🔴 전역 클릭 감지: generateBtn 클릭됨!')
                console.log('🔴 클릭된 요소:', e.target)
                console.log('🔴 this.generateBtn:', this.generateBtn)
            }
        })
        
        // 페이지 로드 시 스마트 가이드 초기 분석
        setTimeout(() => {
            this.analyzeInput()
        }, 500)
    }

    initializeElements() {
        // 폼 요소들
        this.form = document.getElementById('blogForm')
        this.topicInput = document.getElementById('topic')
        this.audienceSelect = document.getElementById('audience')
        this.toneSelect = document.getElementById('tone')
        this.aiModelSelect = document.getElementById('aiModel')
        this.generateBtn = document.getElementById('generateBtn')
        this.generateSeoBtn = document.getElementById('generateSeoBtn')
        
        // API 키 관련 요소들
        this.toggleApiKeysBtn = document.getElementById('toggleApiKeys')
        this.apiKeysSection = document.getElementById('apiKeysSection')
        this.claudeApiKeyInput = document.getElementById('claudeApiKey')
        this.geminiApiKeyInput = document.getElementById('geminiApiKey')
        this.openaiApiKeyInput = document.getElementById('openaiApiKey')
        this.grokApiKeyInput = document.getElementById('grokApiKey')
        
        // SEO 관련 요소들
        this.toggleSeoOptionsBtn = document.getElementById('toggleSeoOptions')
        this.seoOptionsSection = document.getElementById('seoOptionsSection')
        this.focusKeywordInput = document.getElementById('focusKeyword')
        this.targetKeywordsInput = document.getElementById('targetKeywords')
        this.contentLengthSelect = document.getElementById('contentLength')
        this.includeStructuredDataInput = document.getElementById('includeStructuredData')
        
        // 결과 표시 요소들
        this.resultSection = document.getElementById('resultSection')
        this.contentDiv = document.getElementById('content')
        this.contentReader = document.getElementById('contentReader')
        this.copyBtn = document.getElementById('copyBtn')
        this.generationInfo = document.getElementById('generationInfo')
        
        // 스마트 가이드 요소들
        this.smartGuideSection = document.getElementById('smartGuideSection')
        this.dynamicGuide = document.getElementById('dynamicGuide')
        this.topicGuide = document.getElementById('topicGuide')
        this.recommendedAI = document.getElementById('recommendedAI')
        this.guideReason = document.getElementById('guideReason')
        this.optimizationTips = document.getElementById('optimizationTips')
        this.tipsList = document.getElementById('tipsList')
        this.toggleGuideBtn = document.getElementById('toggleGuide')
        
        // 품질 검증 관련 요소들
        this.generateQaBtn = document.getElementById('generateQaBtn')
        this.qaProgressSection = document.getElementById('qaProgressSection')
        this.step1Status = document.getElementById('step1Status')
        this.step1Details = document.getElementById('step1Details')
        this.step2Status = document.getElementById('step2Status')
        this.step2Details = document.getElementById('step2Details')
        this.step3Status = document.getElementById('step3Status')
        this.step3Details = document.getElementById('step3Details')
        this.qaMetrics = document.getElementById('qaMetrics')
        this.originalScore = document.getElementById('originalScore')
        this.improvedScore = document.getElementById('improvedScore')
        this.improvementPercentage = document.getElementById('improvementPercentage')
        
        // 전문가 시스템 요소들
        this.expertSystemInfo = document.getElementById('expertSystemInfo')
        this.selectedExpert = document.getElementById('selectedExpert')
        this.confidence = document.getElementById('confidence')
        this.expertReasoning = document.getElementById('expertReasoning')
        
        // SEO 분석 요소들
        this.seoAnalysisSection = document.getElementById('seoAnalysisSection')
        this.seoScore = document.getElementById('seoScore')
        this.seoScoreProgress = document.getElementById('seoScoreProgress')
        this.keywordDensity = document.getElementById('keywordDensity')
        this.focusKeywordDisplay = document.getElementById('focusKeywordDisplay')
        this.readingTime = document.getElementById('readingTime')
        this.wordCount = document.getElementById('wordCount')
        this.seoTitle = document.getElementById('seoTitle')
        this.metaDescription = document.getElementById('metaDescription')
        this.seoKeywords = document.getElementById('seoKeywords')
        this.recommendationsList = document.getElementById('recommendationsList')
        
        // 블로그 에디터 요소들
        this.editToggleBtn = document.getElementById('editToggleBtn')
        this.aiToolbar = document.getElementById('aiToolbar')
        this.contentEditor = document.getElementById('contentEditor')
        this.contentEditArea = document.getElementById('contentEditArea')
        this.cancelEditBtn = document.getElementById('cancelEditBtn')
        this.saveEditBtn = document.getElementById('saveEditBtn')
        this.downloadBtn = document.getElementById('downloadBtn')
        this.downloadMenu = document.getElementById('downloadMenu')
    }

    attachEventListeners() {
        console.log('🔗 이벤트 리스너 연결 시작...')
        
        // 일반 블로그 생성 버튼
        if (this.generateBtn) {
            console.log('✅ 일반 생성 버튼 연결됨:', this.generateBtn)
            console.log('✅ 버튼 ID 확인:', this.generateBtn.id)
            console.log('✅ 버튼 클래스:', this.generateBtn.className)
            
            // 기존 이벤트 리스너 제거 후 다시 추가
            this.generateBtn.removeEventListener('click', this.handleGenerateClick)
            this.handleGenerateClick = (e) => {
                console.log('🎯 일반 생성 클릭 이벤트 발생!')
                console.log('🎯 이벤트 객체:', e)
                console.log('🎯 이벤트 타겟:', e.target)
                e.preventDefault()
                e.stopPropagation()
                this.generateBlog()
            }
            this.generateBtn.addEventListener('click', this.handleGenerateClick)
            
            // 버튼 상태 추가 확인
            console.log('✅ 버튼 비활성화 상태:', this.generateBtn.disabled)
            console.log('✅ 버튼 스타일:', this.generateBtn.style.cssText)
        } else {
            console.error('❌ 일반 생성 버튼을 찾을 수 없습니다!')
            console.log('🔍 DOM에서 버튼 재검색 시도...')
            const btn = document.getElementById('generateBtn')
            console.log('🔍 재검색 결과:', btn)
        }

        // SEO 최적화 블로그 생성 버튼 (중복 클릭 방지)
        if (this.generateSeoBtn) {
            console.log('✅ SEO 생성 버튼 연결됨:', this.generateSeoBtn)
            this.generateSeoBtn.addEventListener('click', async (e) => {
                console.log('🎯 SEO 생성 클릭 이벤트 발생!')
                e.preventDefault()
                
                // 중복 클릭 방지
                if (this.generateSeoBtn.disabled || this.generateSeoBtn.classList.contains('processing')) {
                    console.log('⚠️ SEO 생성 이미 진행 중, 중복 클릭 무시')
                    return
                }
                
                this.generateSeoBtn.disabled = true
                this.generateSeoBtn.classList.add('processing')
                
                try {
                    await this.generateSEOBlog()
                } finally {
                    this.generateSeoBtn.disabled = false
                    this.generateSeoBtn.classList.remove('processing')
                }
            })
        } else {
            console.error('❌ SEO 생성 버튼을 찾을 수 없습니다!')
        }

        // API 키 토글 버튼
        if (this.toggleApiKeysBtn) {
            this.toggleApiKeysBtn.addEventListener('click', () => {
                this.toggleApiKeysSection()
            })
        }

        // SEO 옵션 토글 버튼
        if (this.toggleSeoOptionsBtn) {
            this.toggleSeoOptionsBtn.addEventListener('click', () => {
                this.toggleSeoOptionsSection()
            })
        }

        // 품질 검증 생성 버튼 (중복 클릭 방지)
        if (this.generateQaBtn) {
            console.log('✅ 품질 검증 버튼 연결됨:', this.generateQaBtn)
            this.generateQaBtn.addEventListener('click', async (e) => {
                console.log('🎯 품질 검증 클릭 이벤트 발생!')
                e.preventDefault()
                
                // 중복 클릭 방지
                if (this.generateQaBtn.disabled || this.generateQaBtn.classList.contains('processing')) {
                    console.log('⚠️ 품질 검증 이미 진행 중, 중복 클릭 무시')
                    return
                }
                
                this.generateQaBtn.disabled = true
                this.generateQaBtn.classList.add('processing')
                
                try {
                    await this.generateQABlog()
                } finally {
                    this.generateQaBtn.disabled = false
                    this.generateQaBtn.classList.remove('processing')
                }
            })
        } else {
            console.error('❌ 품질 검증 버튼을 찾을 수 없습니다!')
        }

        // 복사 버튼
        if (this.copyBtn) {
            this.copyBtn.addEventListener('click', () => {
                this.copyContent()
            })
        }

        // 스마트 가이드 토글
        if (this.toggleGuideBtn) {
            this.toggleGuideBtn.addEventListener('click', () => {
                this.toggleSmartGuide()
            })
        }

        // 실시간 입력 분석
        if (this.topicInput) {
            this.topicInput.addEventListener('input', () => {
                this.analyzeInput()
            })
        }

        if (this.audienceSelect) {
            this.audienceSelect.addEventListener('change', () => {
                this.analyzeInput()
            })
        }

        if (this.toneSelect) {
            this.toneSelect.addEventListener('change', () => {
                this.analyzeInput()
            })
        }

        // API 키 입력 시 자동 저장
        const apiKeyInputs = [this.claudeApiKeyInput, this.geminiApiKeyInput, this.openaiApiKeyInput, this.grokApiKeyInput]
        apiKeyInputs.forEach(input => {
            if (input) {
                input.addEventListener('change', () => {
                    this.saveApiKeys()
                })
            }
        })
        
        // 블로그 에디터 이벤트 리스너
        this.attachEditorListeners()
    }

    toggleApiKeysSection() {
        if (this.apiKeysSection) {
            const isHidden = this.apiKeysSection.classList.contains('hidden')
            
            if (isHidden) {
                this.apiKeysSection.classList.remove('hidden')
                this.toggleApiKeysBtn.innerHTML = '<i class="fas fa-chevron-up"></i>'
            } else {
                this.apiKeysSection.classList.add('hidden')
                this.toggleApiKeysBtn.innerHTML = '<i class="fas fa-chevron-down"></i>'
            }
        }
    }

    toggleSeoOptionsSection() {
        if (this.seoOptionsSection) {
            const isHidden = this.seoOptionsSection.classList.contains('hidden')
            
            if (isHidden) {
                this.seoOptionsSection.classList.remove('hidden')
                this.toggleSeoOptionsBtn.innerHTML = '<i class="fas fa-chevron-up"></i>'
            } else {
                this.seoOptionsSection.classList.add('hidden')
                this.toggleSeoOptionsBtn.innerHTML = '<i class="fas fa-chevron-down"></i>'
            }
        }
    }

    loadApiKeys() {
        try {
            const savedKeys = localStorage.getItem('aiApiKeys')
            if (savedKeys) {
                const keys = JSON.parse(savedKeys)
                
                if (this.claudeApiKeyInput && keys.claude) {
                    this.claudeApiKeyInput.value = keys.claude
                }
                if (this.geminiApiKeyInput && keys.gemini) {
                    this.geminiApiKeyInput.value = keys.gemini
                }
                if (this.openaiApiKeyInput && keys.openai) {
                    this.openaiApiKeyInput.value = keys.openai
                }
                if (this.grokApiKeyInput && keys.grok) {
                    this.grokApiKeyInput.value = keys.grok
                }
                
                console.log('💾 저장된 API 키 로드 완료')
            }
        } catch (error) {
            console.error('API 키 로드 실패:', error)
        }
    }

    saveApiKeys() {
        try {
            const keys = {
                claude: this.claudeApiKeyInput?.value || '',
                gemini: this.geminiApiKeyInput?.value || '',
                openai: this.openaiApiKeyInput?.value || '',
                grok: this.grokApiKeyInput?.value || ''
            }
            
            localStorage.setItem('aiApiKeys', JSON.stringify(keys))
            console.log('💾 API 키 저장 완료')
        } catch (error) {
            console.error('API 키 저장 실패:', error)
        }
    }

    async checkApiKeyStatus() {
        try {
            console.log('🔍 API 키 상태 확인 시작...')
            
            const response = await axios.get('/api/keys/status', {
                timeout: 10000,  // 10초 타임아웃
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            
            const status = response.data
            
            if (!status) {
                throw new Error('API 키 상태 응답이 비어있습니다')
            }
            
            console.log('🔑 API 키 상태:', status)
            
            // 안전한 서버 API 키 상태 저장
            this.serverApiKeys = {
                claude: !!(status.claude || false),
                gemini: !!(status.gemini || false), 
                openai: !!(status.openai || false),
                grok: !!(status.grok || false)
            }
            
            // 바로 사용 가능한지 확인
            if (status.canUseDirectly && status.availableModels) {
                console.log(status.message || '✅ 서버 API 키 사용 가능')
                this.showServerApiKeyStatus(status.availableModels)
            } else {
                console.log('❌ 서버에 구성된 API 키가 없습니다. 개별 API 키 설정이 필요합니다.')
                this.showApiKeyRequiredMessage()
            }
            
        } catch (error) {
            console.error('API 키 상태 확인 실패:', error)
            
            // 기본값 설정
            this.serverApiKeys = {
                claude: false,
                gemini: false,
                openai: false,
                grok: false
            }
            
            // 사용자에게 오류 상황 알림
            this.showApiKeyErrorMessage(error.message)
        }
    }
    
    showApiKeyRequiredMessage() {
        const apiKeysSection = this.apiKeysSection
        if (apiKeysSection) {
            let statusDiv = document.getElementById('serverApiKeyStatus')
            if (!statusDiv) {
                statusDiv = document.createElement('div')
                statusDiv.id = 'serverApiKeyStatus'
                apiKeysSection.appendChild(statusDiv)
            }
            
            statusDiv.className = 'mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'
            statusDiv.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>
                    <div>
                        <p class="font-medium text-yellow-800">개별 API 키 설정 필요</p>
                        <p class="text-sm text-yellow-600">
                            아래에 사용하실 AI 모델의 API 키를 입력해주세요.
                        </p>
                    </div>
                </div>
            `
        }
    }
    
    showApiKeyErrorMessage(errorMessage) {
        const apiKeysSection = this.apiKeysSection
        if (apiKeysSection) {
            let statusDiv = document.getElementById('serverApiKeyStatus')
            if (!statusDiv) {
                statusDiv = document.createElement('div')
                statusDiv.id = 'serverApiKeyStatus'
                apiKeysSection.appendChild(statusDiv)
            }
            
            statusDiv.className = 'mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'
            statusDiv.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
                    <div>
                        <p class="font-medium text-red-800">일시적 오류 발생</p>
                        <p class="text-sm text-red-600">
                            서비스가 일시적으로 불안정합니다. 잠시 후 다시 시도해주세요.
                        </p>
                        <p class="text-xs text-red-500 mt-1">또는 개별 API 키를 입력하여 사용하실 수 있습니다.</p>
                    </div>
                </div>
            `
        }
    }
    
    showServerApiKeyStatus(availableModels) {
        // API 키 설정 섹션에 서버 키 상태 표시
        const apiKeysSection = this.apiKeysSection
        if (apiKeysSection) {
            // 서버 API 키 상태 알림 추가
            let statusDiv = document.getElementById('serverApiKeyStatus')
            if (!statusDiv) {
                statusDiv = document.createElement('div')
                statusDiv.id = 'serverApiKeyStatus'
                statusDiv.className = 'mb-4 p-3 bg-green-50 border border-green-200 rounded-lg'
                
                statusDiv.innerHTML = `
                    <div class="flex items-center">
                        <i class="fas fa-check-circle text-green-500 mr-2"></i>
                        <div>
                            <p class="font-medium text-green-800">서버 API 키 구성 완료! 🎉</p>
                            <p class="text-sm text-green-600">
                                <strong>${availableModels.join(', ')}</strong> 모델을 API 키 설정 없이 바로 사용하실 수 있습니다.
                                <br>개별 API 키를 설정하면 더 많은 사용량과 개인화된 설정이 가능합니다.
                            </p>
                        </div>
                    </div>
                `
                
                apiKeysSection.insertBefore(statusDiv, apiKeysSection.firstChild)
            }
        }
    }

    async generateBlog() {
        console.log('🔥🔥🔥 일반 생성 함수 호출됨! 🔥🔥🔥')
        console.log('🔥 현재 시간:', new Date().toISOString())
        console.log('🔥 this 객체:', this)
        
        // DOM 요소 상태 확인
        console.log('📋 DOM 요소 상태 확인:')
        console.log('  - topicInput:', this.topicInput)
        console.log('  - audienceSelect:', this.audienceSelect)
        console.log('  - toneSelect:', this.toneSelect) 
        console.log('  - aiModelSelect:', this.aiModelSelect)
        
        // 필수 입력 검증 강화
        const topic = this.topicInput?.value?.trim()
        const audience = this.audienceSelect?.value
        const tone = this.toneSelect?.value
        const aiModel = this.aiModelSelect?.value
        
        console.log('📝 입력값 확인:', { topic, audience, tone, aiModel })
        
        if (!topic) {
            this.showError('⚠️ 주제를 입력해주세요!\n\n예시: "인공지능 기술", "디지털 마케팅", "건강한 생활습관"')
            return
        }
        
        if (!audience) {
            this.showError('⚠️ 대상 독자를 선택해주세요!')
            return
        }
        
        if (!tone) {
            this.showError('⚠️ 글의 톤을 선택해주세요!')
            return
        }
        
        if (!aiModel) {
            this.showError('⚠️ AI 모델을 선택해주세요!')
            return
        }
        
        console.log('✅ 모든 입력값 검증 통과')
        
        // 기본값 설정
        const finalAudience = audience || '일반인'
        const finalTone = tone || '친근한'
        const finalAiModel = aiModel || 'claude'

        // 로딩 상태 표시
        console.log('🔄 로딩 상태 시작...')
        this.setLoadingState(true, 'general')
        
        try {
            // API 키 가져오기 (서버 키 우선, 없으면 사용자 입력 키)
            let apiKey = ''
            let hasServerKey = false
            
            if (finalAiModel === 'auto') {
                // AUTO 모드: 사용 가능한 서버 키 중 아무거나 사용
                console.log('🤖 AUTO 모드: 사용 가능한 서버 API 키 확인 중...')
                hasServerKey = this.serverApiKeys && (
                    this.serverApiKeys.claude || 
                    this.serverApiKeys.gemini || 
                    this.serverApiKeys.openai || 
                    this.serverApiKeys.grok
                )
                
                if (hasServerKey) {
                    console.log('🔑 AUTO 모드: 서버 API 키 사용 가능')
                } else {
                    console.log('❌ AUTO 모드: 서버 API 키 없음')
                }
            } else if (finalAiModel === 'claude') {
                apiKey = this.claudeApiKeyInput?.value || ''
                if (!apiKey && this.serverApiKeys?.claude) {
                    console.log('🔑 Claude 서버 API 키 사용')
                    hasServerKey = true
                }
            } else if (finalAiModel === 'gemini') {
                apiKey = this.geminiApiKeyInput?.value || ''
                if (!apiKey && this.serverApiKeys?.gemini) {
                    console.log('🔑 Gemini 서버 API 키 사용')
                    hasServerKey = true
                }
            } else if (finalAiModel === 'openai') {
                apiKey = this.openaiApiKeyInput?.value || ''
                if (!apiKey && this.serverApiKeys?.openai) {
                    console.log('🔑 OpenAI 서버 API 키 사용')
                    hasServerKey = true
                }
            } else if (finalAiModel === 'grok') {
                apiKey = this.grokApiKeyInput?.value || ''
                if (!apiKey && this.serverApiKeys?.grok) {
                    console.log('🔑 GROK 서버 API 키 사용')
                    hasServerKey = true
                }
            }
            
            // API 키 검증 (서버 키가 있으면 통과)
            if (!apiKey && !hasServerKey) {
                this.showError(`${finalAiModel.toUpperCase()} API 키를 입력하거나 서버에 구성해주세요.`)
                this.setLoadingState(false)
                return
            }

            console.log(`🤖 ${finalAiModel} 모델로 블로그 생성 시작...`)
            console.log(`📝 주제: ${topic}`)
            console.log(`👥 대상: ${finalAudience}`)
            console.log(`🎨 톤: ${finalTone}`)
            
            this.showInfo(`🚀 ${finalAiModel.toUpperCase()} 모델로 "${topic}" 주제 블로그를 생성 중입니다...\n⏱️ 예상 소요 시간: 15-30초`)

            console.log('🌐 API 호출 시작:', {
                topic,
                audience: finalAudience,
                tone: finalTone,
                aiModel: finalAiModel,
                apiKey: apiKey ? '있음' : '없음'
            })
            
            const response = await axios.post('/api/generate', {
                topic,
                audience: finalAudience,
                tone: finalTone,
                aiModel: finalAiModel,
                apiKey
            })

            console.log('🎉 API 응답 받음:', response.status)
            console.log('📦 응답 데이터:', response.data)
            
            const result = response.data
            console.log('🎯 displayResult 호출 전')
            this.displayResult(result)
            console.log('✅ displayResult 호출 완료')
            
            console.log('✅ 블로그 생성 완료:', result.model)

        } catch (error) {
            console.error('❌ 블로그 생성 실패:', error)
            this.showError('블로그 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
        } finally {
            this.setLoadingState(false, 'general')
        }
    }

    async generateSEOBlog() {
        console.log('🔥 SEO 최적화 버튼 클릭됨!')
        
        // 필수 입력 검증 강화
        const topic = this.topicInput?.value?.trim()
        const audience = this.audienceSelect?.value
        const tone = this.toneSelect?.value
        const aiModel = this.aiModelSelect?.value
        
        console.log('📝 SEO 입력값 확인:', { topic, audience, tone, aiModel })
        
        if (!topic) {
            this.showError('⚠️ 주제를 입력해주세요!\n\n예시: "SEO 마케팅", "검색엔진 최적화", "콘텐츠 마케팅"')
            return
        }
        
        if (!audience) {
            this.showError('⚠️ 대상 독자를 선택해주세요!')
            return
        }
        
        if (!tone) {
            this.showError('⚠️ 글의 톤을 선택해주세요!')
            return
        }
        
        if (!aiModel) {
            this.showError('⚠️ AI 모델을 선택해주세요!')
            return
        }
        
        console.log('✅ SEO 모든 입력값 검증 통과')
        
        // 기본값 설정
        const finalAudience = audience || '일반인'
        const finalTone = tone || '친근한'
        const finalAiModel = aiModel || 'claude'



        // SEO 옵션 수집
        const seoOptions = {
            focusKeyword: this.focusKeywordInput?.value?.trim() || topic,
            targetKeywords: this.targetKeywordsInput?.value?.trim() 
                ? this.targetKeywordsInput.value.split(',').map(k => k.trim()) 
                : [],
            contentLength: this.contentLengthSelect?.value || 'medium',
            includeStructuredData: this.includeStructuredDataInput?.checked || false
        }

        // 로딩 상태 표시
        this.setSeoLoadingState(true)
        
        try {
            // API 키 가져오기 (서버 키 우선 사용)
            let apiKey = ''
            let hasServerKey = false
            
            if (aiModel === 'claude') {
                apiKey = this.claudeApiKeyInput?.value || ''
                hasServerKey = this.serverApiKeys?.claude
                if (!apiKey && hasServerKey) {
                    console.log('🔑 Claude 서버 API 키 사용 (SEO)')
                }
            } else if (aiModel === 'gemini') {
                apiKey = this.geminiApiKeyInput?.value || ''
                hasServerKey = this.serverApiKeys?.gemini
                if (!apiKey && hasServerKey) {
                    console.log('🔑 Gemini 서버 API 키 사용 (SEO)')
                }
            } else if (aiModel === 'openai') {
                apiKey = this.openaiApiKeyInput?.value || ''
                hasServerKey = this.serverApiKeys?.openai
                if (!apiKey && hasServerKey) {
                    console.log('🔑 OpenAI 서버 API 키 사용 (SEO)')
                }
            } else if (aiModel === 'grok') {
                apiKey = this.grokApiKeyInput?.value || ''
                hasServerKey = this.serverApiKeys?.grok
                if (!apiKey && hasServerKey) {
                    console.log('🔑 GROK 서버 API 키 사용 (SEO)')
                }
            }
            
            // API 키 검증 (서버 키가 있으면 통과)
            if (!apiKey && !hasServerKey) {
                this.showError(`SEO 최적화를 위해서는 ${finalAiModel.toUpperCase()} API 키가 필요합니다. 서버에 구성된 키가 있거나 개별 API 키를 입력해주세요.`)
                this.setSeoLoadingState(false)
                return
            }

            console.log(`🔍 SEO 최적화 ${finalAiModel} 모델로 블로그 생성 시작...`)
            console.log(`📝 주제: ${topic}`)
            console.log(`👥 대상: ${audience}`)
            console.log(`🎨 톤: ${tone}`)
            console.log(`🎯 SEO 옵션:`, seoOptions)

            const response = await axios.post('/api/generate-seo', {
                topic,
                audience,
                tone,
                aiModel: finalAiModel,
                apiKey,
                seoOptions
            })

            const result = response.data
            this.displaySEOResult(result)
            
            console.log('✅ SEO 블로그 생성 완료:', result.model)

        } catch (error) {
            console.error('❌ SEO 블로그 생성 실패:', error)
            this.showError('SEO 블로그 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
        } finally {
            this.setSeoLoadingState(false)
        }
    }

    async generateQABlog() {
        console.log('🔥 품질 검증 버튼 클릭됨!')
        
        // 필수 입력 검증 강화
        const topic = this.topicInput?.value?.trim()
        const audience = this.audienceSelect?.value
        const tone = this.toneSelect?.value
        const aiModel = this.aiModelSelect?.value
        
        console.log('📝 QA 입력값 확인:', { topic, audience, tone, aiModel })
        
        if (!topic) {
            this.showError('⚠️ 주제를 입력해주세요!\n\n예시: "품질 관리", "프로젝트 관리", "데이터 분석"')
            return
        }
        
        if (!audience) {
            this.showError('⚠️ 대상 독자를 선택해주세요!')
            return
        }
        
        if (!tone) {
            this.showError('⚠️ 글의 톤을 선택해주세요!')
            return
        }
        
        if (!aiModel) {
            this.showError('⚠️ AI 모델을 선택해주세요!')
            return
        }
        
        console.log('✅ QA 모든 입력값 검증 통과')
        
        // 기본값 설정
        const finalAudience = audience || '일반인'
        const finalTone = tone || '친근한'
        const finalAiModel = aiModel || 'auto'



        // SEO 옵션 수집 (SEO 섹션이 열려있으면)
        const seoOptions = {
            focusKeyword: this.focusKeywordInput?.value?.trim() || topic,
            targetKeywords: this.targetKeywordsInput?.value?.trim() 
                ? this.targetKeywordsInput.value.split(',').map(k => k.trim()) 
                : [],
            contentLength: this.contentLengthSelect?.value || 'medium',
            includeStructuredData: this.includeStructuredDataInput?.checked || false
        }

        // API 키 체크 (서버 키 우선 사용)
        let apiKey = ''
        let hasServerKey = false
        
        if (finalAiModel === 'auto') {
            // AUTO 모드: 사용 가능한 서버 키 중 아무거나 사용
            console.log('🤖 SEO AUTO 모드: 사용 가능한 서버 API 키 확인 중...')
            hasServerKey = this.serverApiKeys && (
                this.serverApiKeys.claude || 
                this.serverApiKeys.gemini || 
                this.serverApiKeys.openai || 
                this.serverApiKeys.grok
            )
            
            if (hasServerKey) {
                console.log('🔑 SEO AUTO 모드: 서버 API 키 사용 가능')
            } else {
                console.log('❌ SEO AUTO 모드: 서버 API 키 없음')
            }
        } else if (finalAiModel === 'claude') {
            apiKey = this.claudeApiKeyInput?.value || ''
            hasServerKey = this.serverApiKeys?.claude
            if (!apiKey && hasServerKey) {
                console.log('🔑 Claude 서버 API 키 사용 (SEO)')
            }
        } else if (finalAiModel === 'gemini') {
            apiKey = this.geminiApiKeyInput?.value || ''
            hasServerKey = this.serverApiKeys?.gemini
            if (!apiKey && hasServerKey) {
                console.log('🔑 Gemini 서버 API 키 사용 (SEO)')
            }
        } else if (finalAiModel === 'openai') {
            apiKey = this.openaiApiKeyInput?.value || ''
            hasServerKey = this.serverApiKeys?.openai
            if (!apiKey && hasServerKey) {
                console.log('🔑 OpenAI 서버 API 키 사용 (SEO)')
            }
        } else if (finalAiModel === 'grok') {
            apiKey = this.grokApiKeyInput?.value || ''
            hasServerKey = this.serverApiKeys?.grok
            if (!apiKey && hasServerKey) {
                console.log('🔑 GROK 서버 API 키 사용 (SEO)')
            }
        }

        if (!apiKey && !hasServerKey) {
            this.showError('품질 검증 시스템을 위해서는 API 키가 필요합니다. 서버에 구성된 키가 있거나 개별 API 키를 입력해주세요.')
            return
        }

        // 로딩 상태 표시
        this.setQALoadingState(true)
        this.showQAProgress()
        
        try {
            console.log(`🛡️ 품질 검증 ${finalAiModel} 모델로 블로그 생성 시작...`)
            console.log(`📝 주제: ${topic}`)
            console.log(`👥 대상: ${audience}`)
            console.log(`🎨 톤: ${tone}`)

            // SEO 모드 확인 (SEO 옵션 섹션이 열려있고 키워드가 있으면)
            const seoMode = !this.seoOptionsSection?.classList.contains('hidden') && 
                          (this.focusKeywordInput?.value?.trim() || this.targetKeywordsInput?.value?.trim())

            const response = await axios.post('/api/generate-qa', {
                topic,
                audience,
                tone,
                aiModel: finalAiModel,
                apiKey,
                seoMode,
                seoOptions
            })

            const result = response.data
            
            // 진행 상황 업데이트
            this.updateQAProgress(result.processingSteps)
            
            // 결과 표시
            if (result.isQA) {
                this.displayQAResult(result)
            } else {
                this.displayResult(result)
            }
            
            console.log('✅ 품질 검증 블로그 생성 완료:', result.modelUsed || result.model)

        } catch (error) {
            console.error('❌ 품질 검증 블로그 생성 실패:', error)
            
            // Rate Limit 오류인 경우 특별한 안내 메시지
            if (error.response?.status === 500 && error.response?.data?.message?.includes('RATE_LIMIT')) {
                this.showError(`⚠️ AI 모델이 일시적으로 사용량 제한에 걸렸습니다.

🔄 **추천 대안:**
• ✨ **SEO 최적화 생성** 사용 (정상 작동)
• 🚀 **일반 생성** 사용 (정상 작동) 
• ⏰ **5-10분 후** 품질 검증 재시도

💡 일반 생성과 SEO 생성은 다른 시스템을 사용하므로 정상 작동합니다!`)
            } else if (error.response?.data?.message) {
                this.showError(`${error.response.data.message}

💡 **대안:** SEO 최적화 생성 또는 일반 생성을 사용해보세요.`)
            } else {
                this.showError(`품질 검증 시스템에서 오류가 발생했습니다.

💡 **대안:**
• ✨ SEO 최적화 생성 사용
• 🚀 일반 생성 사용  
• ⏰ 잠시 후 다시 시도`)
            }
            
            this.resetQAProgress()
        } finally {
            this.setQALoadingState(false)
        }
    }

    setSeoLoadingState(isLoading) {
        if (this.generateSeoBtn) {
            if (isLoading) {
                this.generateSeoBtn.disabled = true
                this.generateSeoBtn.innerHTML = `
                    <i class="fas fa-spinner fa-spin mr-2"></i>
                    SEO 분석 중...
                `
                this.generateSeoBtn.classList.add('opacity-70')
            } else {
                this.generateSeoBtn.disabled = false
                this.generateSeoBtn.innerHTML = `
                    <i class="fas fa-search mr-2"></i>
                    SEO 최적화 생성 🔥
                `
                this.generateSeoBtn.classList.remove('opacity-70')
            }
        }
    }

    setQALoadingState(isLoading) {
        if (this.generateQaBtn) {
            if (isLoading) {
                this.generateQaBtn.disabled = true
                this.generateQaBtn.innerHTML = `
                    <i class="fas fa-spinner fa-spin mr-2"></i>
                    품질 검증 중...
                `
                this.generateQaBtn.classList.add('opacity-70')
            } else {
                this.generateQaBtn.disabled = false
                this.generateQaBtn.innerHTML = `
                    <i class="fas fa-shield-alt mr-2"></i>
                    품질 검증 🛡️
                `
                this.generateQaBtn.classList.remove('opacity-70')
            }
        }
    }

    showQAProgress() {
        if (this.qaProgressSection) {
            this.qaProgressSection.classList.remove('hidden')
            
            // 모든 단계를 초기 상태로 리셋
            this.resetQAProgress()
            
            // 결과 섹션으로 스크롤
            this.qaProgressSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            })
        }
    }

    resetQAProgress() {
        const statusElements = [this.step1Status, this.step2Status, this.step3Status]
        const detailElements = [this.step1Details, this.step2Details, this.step3Details]
        
        statusElements.forEach(element => {
            if (element) {
                element.className = 'w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center mr-4'
                element.innerHTML = '<i class="fas fa-clock text-gray-600 text-sm"></i>'
            }
        })

        const initialDetails = [
            '전문가 시스템으로 최적 모델 선택 후 콘텐츠 생성',
            '10개 항목 기준으로 콘텐츠 품질 분석',
            '검토 결과를 바탕으로 콘텐츠 품질 향상'
        ]

        detailElements.forEach((element, index) => {
            if (element) {
                element.textContent = initialDetails[index]
                element.className = 'text-sm text-gray-600'
            }
        })

        if (this.qaMetrics) {
            this.qaMetrics.classList.add('hidden')
        }
    }

    updateQAProgress(processingSteps) {
        if (!processingSteps || !Array.isArray(processingSteps)) return

        processingSteps.forEach(step => {
            let statusElement, detailElement

            switch (step.step) {
                case 'expert_selection':
                case 'initial_generation':
                    statusElement = this.step1Status
                    detailElement = this.step1Details
                    break
                case 'quality_review':
                    statusElement = this.step2Status
                    detailElement = this.step2Details
                    break
                case 'content_improvement':
                case 'regeneration':
                case 'approval':
                    statusElement = this.step3Status
                    detailElement = this.step3Details
                    break
            }

            if (statusElement && detailElement) {
                if (step.status === 'completed') {
                    statusElement.className = 'w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mr-4'
                    statusElement.innerHTML = '<i class="fas fa-check text-white text-sm"></i>'
                    
                    if (step.details) {
                        detailElement.textContent = step.details
                        detailElement.className = 'text-sm text-green-600'
                    }
                } else if (step.status === 'in_progress') {
                    statusElement.className = 'w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center mr-4'
                    statusElement.innerHTML = '<i class="fas fa-spinner fa-spin text-white text-sm"></i>'
                    
                    if (step.details) {
                        detailElement.textContent = step.details
                        detailElement.className = 'text-sm text-blue-600'
                    }
                } else if (step.status === 'failed') {
                    statusElement.className = 'w-6 h-6 rounded-full bg-red-500 flex items-center justify-center mr-4'
                    statusElement.innerHTML = '<i class="fas fa-times text-white text-sm"></i>'
                    
                    if (step.details) {
                        detailElement.textContent = step.details
                        detailElement.className = 'text-sm text-red-600'
                    }
                }
            }
        })
    }

    displayQAResult(result) {
        if (!this.resultSection || !this.contentDiv || !this.generationInfo) {
            console.error('결과 표시 요소를 찾을 수 없습니다.')
            return
        }

        // 결과 섹션 표시
        this.resultSection.classList.remove('hidden')
        
        // SEO 분석 섹션 표시 여부 (SEO 모드인 경우)
        if (result.seoAnalysis && result.seoMetadata) {
            this.seoAnalysisSection?.classList.remove('hidden')
        } else {
            this.seoAnalysisSection?.classList.add('hidden')
        }
        
        // 생성 정보 표시
        let infoHtml = `<i class="fas fa-shield-alt mr-2 text-indigo-600"></i>품질 검증 모델: ${result.modelUsed}`
        
        if (result.processingTime) {
            const processingTimeSeconds = Math.round(result.processingTime / 1000)
            infoHtml += ` <span class="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">처리시간: ${processingTimeSeconds}초</span>`
        }
        
        this.generationInfo.innerHTML = infoHtml

        // 전문가 시스템 정보 표시
        this.displayExpertSystemInfo(result.expertSelection)

        // 품질 지표 표시
        if (result.qualityMetrics && this.qaMetrics) {
            this.qaMetrics.classList.remove('hidden')
            
            if (this.originalScore) {
                this.originalScore.textContent = result.qualityMetrics.originalScore.toFixed(1)
            }
            
            if (this.improvedScore) {
                this.improvedScore.textContent = result.qualityMetrics.improvedScore.toFixed(1)
            }
            
            if (this.improvementPercentage) {
                const improvement = result.qualityMetrics.improvementPercentage
                this.improvementPercentage.textContent = improvement > 0 ? `+${improvement}%` : `${improvement}%`
                
                // 개선율에 따른 색상 변경
                if (improvement > 0) {
                    this.improvementPercentage.className = 'text-2xl font-bold text-green-600'
                } else {
                    this.improvementPercentage.className = 'text-2xl font-bold text-gray-600'
                }
            }
        }

        // SEO 분석 정보 표시 (SEO 모드인 경우)
        if (result.seoAnalysis && result.seoMetadata) {
            this.displaySEOAnalysis(result.seoAnalysis, result.seoMetadata)
        }

        // 콘텐츠 표시
        const contentToDisplay = result.content || result.finalContent
        this.contentDiv.innerHTML = this.markdownToHtml(contentToDisplay)

        // 결과 섹션으로 스크롤
        this.resultSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        })

        console.log('🛡️ 품질 검증 결과 표시 완료:', result.qualityMetrics)
    }

    // 실시간 입력 분석 및 AI 추천
    analyzeInput() {
        const topic = this.topicInput?.value?.trim() || ''
        const audience = this.audienceSelect?.value || '일반인'
        const tone = this.toneSelect?.value || '친근한'

        if (topic.length < 2) {
            this.hideSmartGuide()
            return
        }

        // AI 모델 예측 로직 (프론트엔드 버전)
        const prediction = this.predictOptimalAI(topic, audience, tone)
        this.showSmartGuide(prediction)
    }

    predictOptimalAI(topic, audience, tone) {
        const topicLower = topic.toLowerCase()
        const scores = { claude: 0, gemini: 0, openai: 0, grok: 0 }

        // 독자층 기반 점수 (40%)
        if (['전문가', '중급자'].includes(audience)) {
            scores.claude += 40
        } else if (['초보자', '중급자'].includes(audience)) {
            scores.gemini += 35
            scores.claude += 25
        } else if (['일반인', '초보자'].includes(audience)) {
            scores.openai += 35
            scores.grok += 25
        }

        // 주제 키워드 매칭 (35%)
        const keywordSets = {
            claude: ['기술', '비즈니스', '투자', '분석', '연구', '전략', 'AI', '데이터', '경제'],
            gemini: ['학습', '교육', '방법', '가이드', '튜토리얼', '프로세스', '단계', '시스템'],
            openai: ['라이프스타일', '취미', '여행', '음식', '건강', '관계', '일상', '문화', '엔터테인먼트'],
            grok: ['트렌드', '소셜미디어', '엔터테인먼트', '스타트업', '기술 트렌드', '문화', '유머', '바이럴', '최신']
        }

        Object.entries(keywordSets).forEach(([model, keywords]) => {
            const matchCount = keywords.filter(keyword => topicLower.includes(keyword)).length
            scores[model] += matchCount * 8
        })

        // 톤 매칭 (15%)
        if (['전문적', '진지한'].includes(tone)) {
            scores.claude += 15
        } else if (tone === '친근한') {
            scores.openai += 12
            scores.gemini += 10
            scores.grok += 8
        } else if (tone === '유머러스') {
            scores.grok += 15
            scores.openai += 12
        }

        // GROK 특화 보너스
        const trendKeywords = ['트렌드', '최신', '요즘', '화제', '인기', '바이럴', '실시간', '지금', '현재']
        const socialKeywords = ['소셜미디어', 'sns', '인스타', '틱톡', 'mz세대', 'z세대', '젊은', '20대', '30대']
        const creativeKeywords = ['창의', '아이디어', '재미', '유머', '엔터테인먼트', '문화', '예술', '콘텐츠']

        if (trendKeywords.some(k => topicLower.includes(k))) scores.grok += 25
        if (socialKeywords.some(k => topicLower.includes(k))) scores.grok += 20
        if (creativeKeywords.some(k => topicLower.includes(k))) scores.grok += 15
        if (audience === '일반인' && tone === '유머러스') scores.grok += 20

        // 최고 점수 모델 선택
        const bestModel = Object.entries(scores).reduce((a, b) => 
            scores[a[0]] > scores[b[0]] ? a : b
        )[0]

        const confidence = Math.min(scores[bestModel], 100)

        const aiProfiles = {
            claude: { name: '🔬 Claude (분석 전문가)', reason: '논리적 분석과 전문적 인사이트에 최적화' },
            gemini: { name: '🎓 Gemini (교육 전문가)', reason: '체계적 설명과 학습 가이드에 특화' },
            openai: { name: '💬 OpenAI (소통 전문가)', reason: '자연스러운 대화와 스토리텔링에 강점' },
            grok: { name: '🔥 GROK (트렌드 전문가)', reason: '실시간 트렌드와 바이럴 콘텐츠에 특화' }
        }

        return {
            model: bestModel,
            profile: aiProfiles[bestModel],
            confidence,
            scores
        }
    }

    showSmartGuide(prediction) {
        if (!this.topicGuide || !this.recommendedAI || !this.guideReason) return

        // AI 추천 표시
        this.recommendedAI.textContent = prediction.profile.name
        this.guideReason.textContent = prediction.profile.reason

        // 최적화 팁 생성
        const tips = this.generateOptimizationTips(prediction)
        if (this.tipsList) {
            this.tipsList.innerHTML = ''
            tips.forEach(tip => {
                const li = document.createElement('li')
                li.innerHTML = `<i class="fas fa-check mr-2"></i>${tip}`
                this.tipsList.appendChild(li)
            })
        }

        // 가이드 표시
        this.topicGuide.classList.remove('hidden')
        if (tips.length > 0) {
            this.optimizationTips.classList.remove('hidden')
        }
    }

    hideSmartGuide() {
        if (this.topicGuide) this.topicGuide.classList.add('hidden')
        if (this.optimizationTips) this.optimizationTips.classList.add('hidden')
    }

    generateOptimizationTips(prediction) {
        const tips = []
        const { model, confidence } = prediction

        if (model === 'grok') {
            tips.push('트렌드 키워드를 더 추가하면 바이럴 효과 증대')
            tips.push('젊은층 언어나 인터넷 용어 활용 권장')
            tips.push('소셜미디어 공유를 염두에 둔 제목 작성')
        } else if (model === 'claude') {
            tips.push('구체적인 데이터나 통계 언급으로 전문성 강화')
            tips.push('분석적 관점이 필요한 주제임을 강조')
            tips.push('논리적 구조와 근거 중심 내용 요청')
        } else if (model === 'gemini') {
            tips.push('단계별 학습이 가능하도록 체계화')
            tips.push('초보자도 이해할 수 있는 설명 요청')
            tips.push('실습이나 예제 포함 권장')
        } else if (model === 'openai') {
            tips.push('개인적 경험이나 스토리 포함 권장')
            tips.push('독자와의 공감대 형성에 중점')
            tips.push('일상적이고 친근한 톤 유지')
        }

        if (confidence < 70) {
            tips.push('더 구체적인 주제로 수정하면 정확도 향상')
        }

        return tips.slice(0, 3) // 최대 3개 팁만 표시
    }

    toggleSmartGuide() {
        if (this.dynamicGuide.classList.contains('hidden')) {
            this.dynamicGuide.classList.remove('hidden')
            this.toggleGuideBtn.innerHTML = '<i class="fas fa-eye-slash mr-1"></i>숨기기'
            this.analyzeInput() // 현재 입력 분석
        } else {
            this.dynamicGuide.classList.add('hidden')
            this.toggleGuideBtn.innerHTML = '<i class="fas fa-lightbulb mr-1"></i>도움말'
        }
    }

    displaySEOResult(result) {
        console.log('🎯 displaySEOResult 호출됨:', result)
        console.log('📋 SEO DOM 요소 상태:')
        console.log('  - resultSection:', this.resultSection)
        console.log('  - contentDiv:', this.contentDiv)
        console.log('  - generationInfo:', this.generationInfo)
        console.log('  - contentReader:', this.contentReader)
        
        // contentDiv 대신 contentReader 사용하도록 수정
        if (!this.resultSection || !this.generationInfo || (!this.contentDiv && !this.contentReader)) {
            console.error('❌ SEO 결과 표시 요소를 찾을 수 없습니다.')
            console.error('누락된 요소들:')
            if (!this.resultSection) console.error('  - resultSection 없음')
            if (!this.generationInfo) console.error('  - generationInfo 없음')
            if (!this.contentDiv && !this.contentReader) console.error('  - contentDiv와 contentReader 모두 없음')
            return
        }
        
        console.log('✅ SEO 필수 DOM 요소가 존재함, 결과 표시 시작...')

        // 결과 섹션 표시
        this.resultSection.classList.remove('hidden')
        this.seoAnalysisSection.classList.remove('hidden')
        
        // 생성 정보 표시
        let infoHtml = `<i class="fas fa-search mr-2 text-green-600"></i>SEO 최적화 모델: ${result.model}`
        
        if (result.isDemo) {
            infoHtml += ` <span class="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">데모 모드</span>`
        }
        
        if (result.message) {
            infoHtml += `<br><i class="fas fa-info-circle mr-2"></i>${result.message}`
        }
        
        this.generationInfo.innerHTML = infoHtml

        // 전문가 시스템 정보 표시
        this.displayExpertSystemInfo(result.expertSelection)

        // SEO 분석 정보 표시
        if (result.seoAnalysis && result.seoMetadata) {
            this.displaySEOAnalysis(result.seoAnalysis, result.seoMetadata)
        }

        // 콘텐츠 표시
        const contentElement = this.contentReader || this.contentDiv
        if (contentElement) {
            contentElement.innerHTML = this.markdownToHtml(result.content)
        }

        // 결과 섹션으로 스크롤
        this.resultSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        })
    }

    displaySEOAnalysis(analysis, metadata) {
        // SEO 점수 표시
        if (this.seoScore && this.seoScoreProgress) {
            this.seoScore.textContent = analysis.seoScore || 0
            this.seoScoreProgress.style.width = `${analysis.seoScore || 0}%`
            
            // 점수에 따른 색상 변경
            const scoreColor = analysis.seoScore >= 80 ? 'bg-green-500' : 
                             analysis.seoScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            this.seoScoreProgress.className = `h-3 rounded-full ${scoreColor}`
        }

        // 키워드 밀도 표시
        if (this.keywordDensity && this.focusKeywordDisplay) {
            this.keywordDensity.textContent = `${analysis.keywordDensity || 0}%`
            this.focusKeywordDisplay.textContent = metadata.focusKeyword || ''
        }

        // 읽기 시간 표시
        if (this.readingTime && this.wordCount) {
            this.readingTime.textContent = metadata.readingTime || 0
            this.wordCount.textContent = metadata.wordCount || 0
        }

        // SEO 메타데이터 표시
        if (this.seoTitle) this.seoTitle.textContent = metadata.title || ''
        if (this.metaDescription) this.metaDescription.textContent = metadata.metaDescription || ''
        if (this.seoKeywords) this.seoKeywords.textContent = metadata.keywords?.join(', ') || ''

        // SEO 권장사항 표시
        if (this.recommendationsList && analysis.recommendations) {
            this.recommendationsList.innerHTML = ''
            analysis.recommendations.forEach(rec => {
                const li = document.createElement('li')
                li.innerHTML = `<i class="fas fa-lightbulb mr-2 text-yellow-500"></i>${rec}`
                li.className = 'text-gray-700'
                this.recommendationsList.appendChild(li)
            })
        }
    }

    displayExpertSystemInfo(expertSelection) {
        if (!expertSelection || !this.expertSystemInfo) {
            // 전문가 시스템 정보가 없으면 숨김
            if (this.expertSystemInfo) {
                this.expertSystemInfo.classList.add('hidden')
            }
            return
        }

        // 전문가 시스템 정보 표시
        this.expertSystemInfo.classList.remove('hidden')
        
        if (this.selectedExpert) {
            this.selectedExpert.textContent = expertSelection.expert.name
        }
        
        if (this.confidence) {
            this.confidence.textContent = expertSelection.confidence
        }
        
        if (this.expertReasoning) {
            // 개행을 <br>로 변환하여 표시
            const formattedReasoning = expertSelection.reasoning.replace(/\n/g, '<br>')
            this.expertReasoning.innerHTML = formattedReasoning
        }
        
        console.log('🧠 전문가 시스템 정보 표시:', expertSelection)
    }

    setLoadingState(isLoading, buttonType = 'general') {
        console.log(`🔄 로딩 상태 변경: ${isLoading ? '시작' : '완료'} (${buttonType})`)
        
        if (buttonType === 'general' && this.generateBtn) {
            if (isLoading) {
                this.generateBtn.disabled = true
                this.generateBtn.innerHTML = `
                    <i class="fas fa-spinner fa-spin mr-2"></i>
                    블로그 생성 중...
                `
                this.generateBtn.classList.add('opacity-70')
            } else {
                this.generateBtn.disabled = false
                this.generateBtn.innerHTML = `
                    <i class="fas fa-magic mr-2"></i>
                    일반 생성
                `
                this.generateBtn.classList.remove('opacity-70')
            }
        }
        
        if (buttonType === 'seo' && this.generateSeoBtn) {
            if (isLoading) {
                this.generateSeoBtn.disabled = true
                this.generateSeoBtn.innerHTML = `
                    <i class="fas fa-spinner fa-spin mr-2"></i>
                    SEO 최적화 중...
                `
                this.generateSeoBtn.classList.add('opacity-70')
            } else {
                this.generateSeoBtn.disabled = false
                this.generateSeoBtn.innerHTML = `
                    <i class="fas fa-search mr-2"></i>
                    SEO 최적화 🔥
                `
                this.generateSeoBtn.classList.remove('opacity-70')
            }
        }
        
        if (buttonType === 'qa' && this.generateQaBtn) {
            if (isLoading) {
                this.generateQaBtn.disabled = true
                this.generateQaBtn.innerHTML = `
                    <i class="fas fa-spinner fa-spin mr-2"></i>
                    품질 검증 중... (2-3분)
                `
                this.generateQaBtn.classList.add('opacity-70')
            } else {
                this.generateQaBtn.disabled = false
                this.generateQaBtn.innerHTML = `
                    <i class="fas fa-shield-alt mr-2"></i>
                    품질 검증 🛡️
                `
                this.generateQaBtn.classList.remove('opacity-70')
            }
        }
    }

    displayResult(result) {
        console.log('🎯 displayResult 호출됨:', result)
        console.log('📋 DOM 요소 상태:')
        console.log('  - resultSection:', this.resultSection)
        console.log('  - contentDiv:', this.contentDiv)
        console.log('  - generationInfo:', this.generationInfo)
        console.log('  - contentReader:', this.contentReader)
        
        // contentDiv 대신 contentReader 사용하도록 수정
        if (!this.resultSection || !this.generationInfo || (!this.contentDiv && !this.contentReader)) {
            console.error('❌ 결과 표시 요소를 찾을 수 없습니다.')
            console.error('누락된 요소들:')
            if (!this.resultSection) console.error('  - resultSection 없음')
            if (!this.generationInfo) console.error('  - generationInfo 없음')
            if (!this.contentDiv && !this.contentReader) console.error('  - contentDiv와 contentReader 모두 없음')
            return
        }
        
        console.log('✅ 필수 DOM 요소가 존재함, 결과 표시 시작...')

        // 결과 섹션 표시
        console.log('👁️ 결과 섹션 표시 중...')
        console.log('   현재 hidden 클래스:', this.resultSection.classList.contains('hidden'))
        this.resultSection.classList.remove('hidden')
        console.log('   hidden 클래스 제거 후:', this.resultSection.classList.contains('hidden'))
        
        // SEO 분석 섹션 숨김 (일반 모드)
        if (this.seoAnalysisSection) {
            this.seoAnalysisSection.classList.add('hidden')
            console.log('📊 SEO 분석 섹션 숨김 처리 완료')
        }
        
        // 생성 정보 표시
        let infoHtml = `<i class="fas fa-robot mr-2"></i>모델: ${result.model}`
        
        if (result.isDemo) {
            infoHtml += ` <span class="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">데모 모드</span>`
        }
        
        if (result.message) {
            infoHtml += `<br><i class="fas fa-info-circle mr-2"></i>${result.message}`
        }
        
        this.generationInfo.innerHTML = infoHtml

        // 전문가 시스템 정보 표시
        this.displayExpertSystemInfo(result.expertSelection)

        // 콘텐츠 표시 (마크다운을 HTML로 변환)
        console.log('🔄 콘텐츠 변환 중...')
        console.log('📝 원본 콘텐츠:', result.content?.substring(0, 100) + '...')
        
        const convertedHtml = this.markdownToHtml(result.content)
        console.log('🔧 변환된 HTML:', convertedHtml?.substring(0, 100) + '...')
        
        if (this.contentReader) {
            console.log('✅ contentReader에 HTML 설정 중...')
            this.contentReader.innerHTML = convertedHtml
            console.log('🎯 contentReader innerHTML 설정 완료')
        } else if (this.contentDiv) {
            console.log('✅ contentDiv에 HTML 설정 중...')
            this.contentDiv.innerHTML = convertedHtml
            console.log('🎯 contentDiv innerHTML 설정 완료')
        } else {
            console.error('❌ contentReader와 contentDiv 모두 없음!')
        }

        // 결과 섹션으로 스크롤
        this.resultSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        })
    }

    markdownToHtml(markdown) {
        let html = markdown

        // 제목 변환
        html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-gray-800 mt-6 mb-3">$1</h3>')
        html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-gray-800 mt-8 mb-4">$1</h2>')
        html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-gray-900 mb-6">$1</h1>')

        // 굵은 글씨
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')

        // 기울임체
        html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')

        // 링크
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank">$1</a>')

        // 코드 블록
        html = html.replace(/```([^`]+)```/g, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4"><code>$1</code></pre>')

        // 인라인 코드
        html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm">$1</code>')

        // 리스트 변환
        html = html.replace(/^\* (.+$)/gim, '<li class="mb-2">$1</li>')
        html = html.replace(/^- (.+$)/gim, '<li class="mb-2">$1</li>')
        html = html.replace(/^\d+\. (.+$)/gim, '<li class="mb-2">$1</li>')

        // 리스트 감싸기
        html = html.replace(/(<li class="mb-2">.*<\/li>)/gs, '<ul class="list-disc list-inside mb-4 space-y-1">$1</ul>')

        // 문단 변환
        html = html.replace(/\n\n/g, '</p><p class="mb-4">')
        html = '<p class="mb-4">' + html + '</p>'

        // 빈 문단 제거
        html = html.replace(/<p class="mb-4"><\/p>/g, '')

        // 줄바꿈 변환
        html = html.replace(/\n/g, '<br>')

        return html
    }

    copyContent() {
        const contentElement = this.contentReader || this.contentDiv
        if (!contentElement) return

        const content = contentElement.textContent || contentElement.innerText
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(content).then(() => {
                this.showSuccess('콘텐츠가 클립보드에 복사되었습니다!')
            }).catch(() => {
                this.fallbackCopy(content)
            })
        } else {
            this.fallbackCopy(content)
        }
    }

    fallbackCopy(text) {
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.select()
        
        try {
            document.execCommand('copy')
            this.showSuccess('콘텐츠가 클립보드에 복사되었습니다!')
        } catch (err) {
            this.showError('복사에 실패했습니다.')
        }
        
        document.body.removeChild(textArea)
    }

    showSuccess(message) {
        this.showNotification(message, 'success')
    }

    showError(message) {
        this.showNotification(message, 'error')
    }

    showNotification(message, type = 'info') {
        // 기존 알림 제거
        const existingNotification = document.getElementById('notification')
        if (existingNotification) {
            existingNotification.remove()
        }

        // 새 알림 생성
        const notification = document.createElement('div')
        notification.id = 'notification'
        
        const bgColor = type === 'success' ? 'bg-green-500' : 
                       type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        
        const icon = type === 'success' ? 'fa-check-circle' : 
                    type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle'

        notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full`
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${icon} mr-2"></i>
                <span>${message}</span>
            </div>
        `

        document.body.appendChild(notification)

        // 애니메이션으로 표시
        setTimeout(() => {
            notification.classList.remove('translate-x-full')
        }, 100)

        // 3초 후 자동 제거
        setTimeout(() => {
            notification.classList.add('translate-x-full')
            setTimeout(() => {
                if (notification && notification.parentNode) {
                    notification.parentNode.removeChild(notification)
                }
            }, 300)
        }, 3000)
    }

    // ==================== 사용자 가이드 시스템 ====================
    
    initializeTutorial() {
        this.tutorialStep = 0
        this.isFirstVisit = !localStorage.getItem('tutorialCompleted')
        
        // 튜토리얼 UI 요소들
        this.tutorialModal = null
        this.tutorialOverlay = null
        
        // 첫 방문자일 경우 자동 튜토리얼 시작
        if (this.isFirstVisit) {
            setTimeout(() => this.startTutorial(), 2000)
        }
        
        // 도움말 버튼 이벤트 리스너 추가
        const helpBtn = document.getElementById('startTutorialBtn')
        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.startTutorial())
        }
        
        // 빠른 템플릿 버튼들
        this.setupQuickTemplates()
        
        // 성공 사례 쇼케이스 설정
        this.setupSuccessShowcase()
    }
    
    startTutorial() {
        this.tutorialStep = 0
        this.createTutorialModal()
        this.showTutorialStep()
    }
    
    createTutorialModal() {
        // 기존 모달 제거
        if (this.tutorialModal) {
            this.tutorialModal.remove()
        }
        
        // 오버레이 생성
        this.tutorialOverlay = document.createElement('div')
        this.tutorialOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 tutorial-overlay'
        
        // 모달 생성
        this.tutorialModal = document.createElement('div')
        this.tutorialModal.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 max-w-md w-full mx-4 tutorial-modal'
        
        // 모달 내용
        this.tutorialModal.innerHTML = `
            <div class="p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-gray-800" id="tutorialTitle">사용법 가이드</h3>
                    <button class="text-gray-400 hover:text-gray-600" id="closeTutorial">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div id="tutorialContent" class="mb-6 text-gray-600">
                    <!-- 튜토리얼 내용이 여기에 들어감 -->
                </div>
                <div class="flex justify-between">
                    <button class="px-4 py-2 text-gray-600 hover:text-gray-800" id="prevStep">이전</button>
                    <div class="flex space-x-2" id="stepIndicators">
                        <!-- 단계 표시기가 여기에 들어감 -->
                    </div>
                    <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" id="nextStep">다음</button>
                </div>
            </div>
        `
        
        // DOM에 추가
        document.body.appendChild(this.tutorialOverlay)
        document.body.appendChild(this.tutorialModal)
        
        // 이벤트 리스너 설정
        this.setupTutorialEvents()
    }
    
    setupTutorialEvents() {
        const closeBtn = this.tutorialModal.querySelector('#closeTutorial')
        const prevBtn = this.tutorialModal.querySelector('#prevStep')
        const nextBtn = this.tutorialModal.querySelector('#nextStep')
        
        closeBtn.addEventListener('click', () => this.closeTutorial())
        prevBtn.addEventListener('click', () => this.previousTutorialStep())
        nextBtn.addEventListener('click', () => this.nextTutorialStep())
        
        // ESC 키로 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.tutorialModal) {
                this.closeTutorial()
            }
        })
        
        // 오버레이 클릭으로 닫기
        this.tutorialOverlay.addEventListener('click', () => this.closeTutorial())
        this.tutorialModal.addEventListener('click', (e) => e.stopPropagation())
    }
    
    showTutorialStep() {
        const steps = [
            {
                title: '🎯 4-AI 전문가 시스템 소개',
                content: `
                    <div class="space-y-3">
                        <p><strong>각 AI 전문가의 특성을 파악하고 최적의 선택을 해보세요:</strong></p>
                        <div class="bg-gray-50 p-3 rounded">
                            <div class="text-sm space-y-2">
                                <div><span class="font-medium">🔬 Claude:</span> 논리적 분석, 전문 지식, 체계적 구조</div>
                                <div><span class="font-medium">🎓 Gemini:</span> 교육 콘텐츠, 단계별 설명, 학습 가이드</div>
                                <div><span class="font-medium">💬 OpenAI:</span> 자연스러운 대화, 스토리텔링, 창의적 표현</div>
                                <div><span class="font-medium">🔥 GROK:</span> 실시간 트렌드, 바이럴 콘텐츠, 젊은층 소통</div>
                            </div>
                        </div>
                        <p class="text-sm text-gray-600">💡 <strong>팁:</strong> 주제에 따라 자동으로 최적의 AI가 추천됩니다!</p>
                    </div>
                `
            },
            {
                title: '📝 주제 입력의 핵심',
                content: `
                    <div class="space-y-3">
                        <p><strong>효과적인 주제 입력 방법:</strong></p>
                        <div class="bg-green-50 p-3 rounded">
                            <p class="font-medium text-green-800 mb-2">✅ 좋은 예시:</p>
                            <div class="text-sm space-y-1">
                                <div>• "2024년 최신 AI 트렌드와 비즈니스 활용법"</div>
                                <div>• "초보자를 위한 파이썬 데이터 분석 가이드"</div>
                                <div>• "MZ세대가 열광하는 소셜미디어 마케팅 전략"</div>
                            </div>
                        </div>
                        <div class="bg-red-50 p-3 rounded">
                            <p class="font-medium text-red-800 mb-2">❌ 피해야 할 예시:</p>
                            <div class="text-sm space-y-1">
                                <div>• "AI" (너무 광범위)</div>
                                <div>• "좋은 글" (모호함)</div>
                                <div>• "도움" (구체성 부족)</div>
                            </div>
                        </div>
                    </div>
                `
            },
            {
                title: '🎯 타겟 독자와 톤 설정',
                content: `
                    <div class="space-y-3">
                        <p><strong>독자층과 톤의 중요성:</strong></p>
                        <div class="grid grid-cols-2 gap-3 text-sm">
                            <div class="bg-blue-50 p-3 rounded">
                                <p class="font-medium text-blue-800 mb-1">👥 독자층별 특징:</p>
                                <div class="space-y-1">
                                    <div><strong>전문가:</strong> 기술적 세부사항</div>
                                    <div><strong>일반인:</strong> 쉬운 설명과 예시</div>
                                    <div><strong>초보자:</strong> 기초부터 단계별</div>
                                </div>
                            </div>
                            <div class="bg-purple-50 p-3 rounded">
                                <p class="font-medium text-purple-800 mb-1">🎭 톤별 효과:</p>
                                <div class="space-y-1">
                                    <div><strong>전문적:</strong> 신뢰성 강화</div>
                                    <div><strong>친근한:</strong> 접근성 향상</div>
                                    <div><strong>유머러스:</strong> 참여도 증가</div>
                                </div>
                            </div>
                        </div>
                        <p class="text-sm text-gray-600">💡 같은 주제라도 독자와 톤에 따라 완전히 다른 글이 생성됩니다!</p>
                    </div>
                `
            },
            {
                title: '🚀 실시간 스마트 가이드 활용',
                content: `
                    <div class="space-y-3">
                        <p><strong>입력하는 즉시 최적의 AI를 추천받으세요:</strong></p>
                        <div class="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                            <div class="flex items-start space-x-2">
                                <i class="fas fa-lightbulb text-yellow-600 mt-1"></i>
                                <div class="text-sm">
                                    <p class="font-medium mb-2">스마트 가이드가 자동으로 분석하는 항목:</p>
                                    <ul class="space-y-1 list-disc list-inside">
                                        <li>키워드 기반 AI 모델 추천</li>
                                        <li>콘텐츠 최적화 팁 제안</li>
                                        <li>예상 신뢰도 점수 표시</li>
                                        <li>실시간 개선 방안 안내</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <p class="text-sm text-gray-600"><strong>오른쪽 하단의 '💡 도움말' 버튼</strong>을 클릭하면 언제든 가이드를 확인할 수 있습니다.</p>
                    </div>
                `
            },
            {
                title: '⚡ 빠른 시작 템플릿',
                content: `
                    <div class="space-y-3">
                        <p><strong>자주 사용하는 템플릿으로 빠르게 시작하세요:</strong></p>
                        <div class="grid grid-cols-1 gap-2 text-sm">
                            <button class="template-btn p-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded border border-blue-200 text-left hover:from-blue-100 hover:to-blue-200 transition-all" data-template="tech">
                                <div class="font-medium">📱 IT/기술 블로그</div>
                                <div class="text-xs text-gray-600">최신 기술 트렌드와 개발 팁</div>
                            </button>
                            <button class="template-btn p-2 bg-gradient-to-r from-green-50 to-green-100 rounded border border-green-200 text-left hover:from-green-100 hover:to-green-200 transition-all" data-template="business">
                                <div class="font-medium">💼 비즈니스 전략</div>
                                <div class="text-xs text-gray-600">마케팅, 경영, 성장 전략</div>
                            </button>
                            <button class="template-btn p-2 bg-gradient-to-r from-purple-50 to-purple-100 rounded border border-purple-200 text-left hover:from-purple-100 hover:to-purple-200 transition-all" data-template="lifestyle">
                                <div class="font-medium">🌿 라이프스타일</div>
                                <div class="text-xs text-gray-600">건강, 취미, 일상 팁</div>
                            </button>
                            <button class="template-btn p-2 bg-gradient-to-r from-red-50 to-red-100 rounded border border-red-200 text-left hover:from-red-100 hover:to-red-200 transition-all" data-template="trending">
                                <div class="font-medium">🔥 트렌드/바이럴</div>
                                <div class="text-xs text-gray-600">화제의 이슈, 소셜미디어 콘텐츠</div>
                            </button>
                        </div>
                    </div>
                `
            },
            {
                title: '🎉 이제 시작할 준비가 되었습니다!',
                content: `
                    <div class="space-y-4">
                        <div class="text-center">
                            <i class="fas fa-rocket text-4xl text-blue-500 mb-3"></i>
                            <p class="font-semibold text-lg">축하합니다! 🎊</p>
                            <p class="text-gray-600">4-AI 전문가 시스템을 활용할 준비가 완료되었습니다.</p>
                        </div>
                        
                        <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                            <p class="font-medium text-green-800 mb-2">✅ API 키 설정 불필요!</p>
                            <p class="text-sm text-green-700">서버에 Claude, Gemini, OpenAI API 키가 구성되어 있어 바로 사용하실 수 있습니다. 별도 설정 없이 즉시 블로그 생성을 시작하세요!</p>
                        </div>
                        
                        <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
                            <p class="font-medium mb-2">💡 기억해 주세요:</p>
                            <ul class="text-sm space-y-1 list-disc list-inside">
                                <li><strong>구체적인 주제</strong>를 입력하면 더 좋은 결과를 얻습니다</li>
                                <li><strong>독자층과 톤</strong>을 정확히 설정하세요</li>
                                <li><strong>실시간 가이드</strong>를 참고하여 입력을 최적화하세요</li>
                                <li><strong>품질 검증 모드</strong>로 더 완성도 높은 콘텐츠를 만들어보세요</li>
                                <li><strong>API 키 없이도 바로 사용</strong> 가능합니다!</li>
                            </ul>
                        </div>
                        <div class="text-center">
                            <button class="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all" id="completeTutorial">
                                <i class="fas fa-magic mr-2"></i>지금 시작하기
                            </button>
                        </div>
                    </div>
                `
            }
        ]
        
        const step = steps[this.tutorialStep]
        if (!step) return
        
        // 제목과 내용 업데이트
        const title = this.tutorialModal.querySelector('#tutorialTitle')
        const content = this.tutorialModal.querySelector('#tutorialContent')
        const prevBtn = this.tutorialModal.querySelector('#prevStep')
        const nextBtn = this.tutorialModal.querySelector('#nextStep')
        const stepIndicators = this.tutorialModal.querySelector('#stepIndicators')
        
        title.textContent = step.title
        content.innerHTML = step.content
        
        // 단계 표시기 업데이트
        stepIndicators.innerHTML = ''
        for (let i = 0; i < steps.length; i++) {
            const dot = document.createElement('div')
            dot.className = `w-2 h-2 rounded-full ${i === this.tutorialStep ? 'bg-blue-500' : 'bg-gray-300'}`
            stepIndicators.appendChild(dot)
        }
        
        // 버튼 상태 업데이트
        prevBtn.style.visibility = this.tutorialStep === 0 ? 'hidden' : 'visible'
        
        if (this.tutorialStep === steps.length - 1) {
            nextBtn.textContent = '완료'
            nextBtn.className = 'px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600'
        } else {
            nextBtn.textContent = '다음'
            nextBtn.className = 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
        }
        
        // 템플릿 버튼 이벤트 리스너 (5단계에서만)
        if (this.tutorialStep === 4) {
            const templateBtns = content.querySelectorAll('.template-btn')
            templateBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const template = btn.dataset.template
                    this.applyQuickTemplate(template)
                    this.showSuccess(`${btn.querySelector('.font-medium').textContent} 템플릿이 적용되었습니다!`)
                })
            })
        }
        
        // 완료 버튼 이벤트 리스너 (마지막 단계에서만)
        if (this.tutorialStep === steps.length - 1) {
            const completeBtn = content.querySelector('#completeTutorial')
            if (completeBtn) {
                completeBtn.addEventListener('click', () => {
                    this.completeTutorial()
                })
            }
        }
    }
    
    nextTutorialStep() {
        const maxSteps = 6 // 총 6단계
        if (this.tutorialStep < maxSteps - 1) {
            this.tutorialStep++
            this.showTutorialStep()
        } else {
            this.completeTutorial()
        }
    }
    
    previousTutorialStep() {
        if (this.tutorialStep > 0) {
            this.tutorialStep--
            this.showTutorialStep()
        }
    }
    
    completeTutorial() {
        localStorage.setItem('tutorialCompleted', 'true')
        this.closeTutorial()
        this.showSuccess('튜토리얼이 완료되었습니다! 이제 AI 블로그 생성기를 마음껏 활용해보세요! 🎉')
        
        // 스마트 가이드 자동 활성화
        if (this.dynamicGuide && this.dynamicGuide.classList.contains('hidden')) {
            this.toggleSmartGuide()
        }
    }
    
    closeTutorial() {
        if (this.tutorialModal) {
            this.tutorialModal.remove()
            this.tutorialModal = null
        }
        if (this.tutorialOverlay) {
            this.tutorialOverlay.remove()
            this.tutorialOverlay = null
        }
    }
    
    setupQuickTemplates() {
        const templates = {
            tech: {
                topic: '2024년 주목받는 AI 기술 트렌드와 실무 활용 방안',
                audience: '전문가',
                tone: '전문적',
                aiModel: 'claude'
            },
            business: {
                topic: 'MZ세대 소비자 마음을 사로잡는 디지털 마케팅 전략',
                audience: '일반인',
                tone: '전문적',
                aiModel: 'openai'
            },
            lifestyle: {
                topic: '바쁜 직장인을 위한 건강한 아침 루틴 만들기',
                audience: '일반인',
                tone: '친근한',
                aiModel: 'gemini'
            },
            trending: {
                topic: '지금 SNS에서 핫한! 2024년 바이럴 챌린지 완전정복',
                audience: '초보자',
                tone: '유머러스',
                aiModel: 'grok'
            }
        }
        
        // 빠른 템플릿 버튼들에 이벤트 리스너 추가
        document.querySelectorAll('[data-template]').forEach(btn => {
            btn.addEventListener('click', () => {
                const templateKey = btn.dataset.template
                if (templates[templateKey]) {
                    this.applyQuickTemplate(templateKey)
                    this.showSuccess(`${btn.textContent} 템플릿이 적용되었습니다!`)
                }
            })
        })
    }
    
    applyQuickTemplate(templateKey) {
        const templates = {
            tech: {
                topic: '2024년 주목받는 AI 기술 트렌드와 실무 활용 방안',
                audience: '전문가',
                tone: '전문적',
                aiModel: 'claude'
            },
            business: {
                topic: 'MZ세대 소비자 마음을 사로잡는 디지털 마케팅 전략',
                audience: '일반인',
                tone: '전문적',
                aiModel: 'openai'
            },
            lifestyle: {
                topic: '바쁜 직장인을 위한 건강한 아침 루틴 만들기',
                audience: '일반인',
                tone: '친근한',
                aiModel: 'gemini'
            },
            trending: {
                topic: '지금 SNS에서 핫한! 2024년 바이럴 챌린지 완전정복',
                audience: '초보자',
                tone: '유머러스',
                aiModel: 'grok'
            }
        }
        
        const template = templates[templateKey]
        if (!template) return
        
        // 폼 필드 자동 입력
        if (this.topicInput) this.topicInput.value = template.topic
        if (this.audienceSelect) this.audienceSelect.value = template.audience
        if (this.toneSelect) this.toneSelect.value = template.tone
        if (this.aiModelSelect) this.aiModelSelect.value = template.aiModel
        
        // 실시간 분석 실행
        setTimeout(() => {
            this.analyzeInput()
        }, 100)
    }
    
    setupSuccessShowcase() {
        // 성공 사례 데이터
        const successCases = [
            {
                title: 'AI 스타트업 창업기',
                model: 'claude',
                stats: { views: '2.5만', engagement: '15%', time: '4:32' },
                highlight: '논리적 구조와 데이터 기반 분석으로 전문성 인정'
            },
            {
                title: '코딩 입문자 가이드',
                model: 'gemini',
                stats: { views: '1.8만', engagement: '22%', time: '6:15' },
                highlight: '체계적인 단계별 설명으로 높은 완독률 달성'
            },
            {
                title: '일상 속 작은 행복 찾기',
                model: 'openai',
                stats: { views: '3.2만', engagement: '28%', time: '3:45' },
                highlight: '감성적 스토리텔링으로 높은 공감대 형성'
            },
            {
                title: '2024 최신 밈 트렌드',
                model: 'grok',
                stats: { views: '5.7만', engagement: '35%', time: '2:58' },
                highlight: '실시간 트렌드 반영으로 바이럴 효과 극대화'
            }
        ]
        
        // 성공 사례 표시 (필요시 구현)
        this.successCases = successCases
    }
    
    // ==================== 블로그 에디터 시스템 ====================
    
    initializeBlogEditor() {
        this.editorMode = 'read' // 'read' or 'edit'
        this.originalContent = ''
        this.currentContent = ''
        this.editHistory = []
        this.historyIndex = -1
        
        // 에디터 요소들
        this.contentReader = document.getElementById('contentReader')
        this.contentEditor = document.getElementById('contentEditor')
        this.contentEditArea = document.getElementById('contentEditArea')
        this.editToggleBtn = document.getElementById('editToggleBtn')
        this.saveEditBtn = document.getElementById('saveEditBtn')
        this.cancelEditBtn = document.getElementById('cancelEditBtn')
        this.aiToolbar = document.getElementById('aiToolbar')
        this.downloadBtn = document.getElementById('downloadBtn')
        this.downloadMenu = document.getElementById('downloadMenu')
        
        this.setupEditorEventListeners()
    }
    
    setupEditorEventListeners() {
        // 편집 모드 토글
        if (this.editToggleBtn) {
            this.editToggleBtn.addEventListener('click', () => this.toggleEditMode())
        }
        
        // 저장/취소 버튼
        if (this.saveEditBtn) {
            this.saveEditBtn.addEventListener('click', () => this.saveEdit())
        }
        if (this.cancelEditBtn) {
            this.cancelEditBtn.addEventListener('click', () => this.cancelEdit())
        }
        
        // 포맷팅 도구들
        document.querySelectorAll('.format-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const format = btn.dataset.format
                this.applyFormat(format)
            })
        })
        
        // AI 편집 도구들
        document.querySelectorAll('.ai-tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action
                this.applyAIEdit(action, btn)
            })
        })
        
        // 다운로드 메뉴
        if (this.downloadBtn) {
            this.downloadBtn.addEventListener('click', (e) => {
                e.stopPropagation()
                this.downloadMenu.classList.toggle('hidden')
            })
        }
        
        // 다운로드 형식 선택
        document.querySelectorAll('#downloadMenu button').forEach(btn => {
            btn.addEventListener('click', () => {
                const format = btn.dataset.format
                this.downloadContent(format)
                this.downloadMenu.classList.add('hidden')
            })
        })
        
        // 편집 영역 이벤트들
        if (this.contentEditArea) {
            this.contentEditArea.addEventListener('input', () => this.onContentChange())
            this.contentEditArea.addEventListener('keydown', (e) => this.onKeyDown(e))
            this.contentEditArea.addEventListener('paste', (e) => this.onPaste(e))
        }
        
        // 외부 클릭으로 메뉴 닫기
        document.addEventListener('click', (e) => {
            if (this.downloadMenu && !this.downloadMenu.classList.contains('hidden')) {
                this.downloadMenu.classList.add('hidden')
            }
        })
    }
    
    toggleEditMode() {
        if (this.editorMode === 'read') {
            this.enterEditMode()
        } else {
            this.exitEditMode()
        }
    }
    
    enterEditMode() {
        this.editorMode = 'edit'
        this.originalContent = this.contentReader.innerHTML
        this.currentContent = this.originalContent
        
        // 편집 영역에 콘텐츠 복사
        this.contentEditArea.innerHTML = this.htmlToEditableContent(this.originalContent)
        
        // UI 전환
        this.contentReader.classList.add('hidden')
        this.contentEditor.classList.remove('hidden')
        this.aiToolbar.classList.remove('hidden')
        
        // 버튼 텍스트 변경
        this.editToggleBtn.innerHTML = '<i class="fas fa-eye mr-2"></i>읽기 모드'
        this.editToggleBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700')
        this.editToggleBtn.classList.add('bg-gray-600', 'hover:bg-gray-700')
        
        // 편집 이력 초기화
        this.editHistory = [this.contentEditArea.innerHTML]
        this.historyIndex = 0
        
        // 편집 영역에 포커스
        setTimeout(() => this.contentEditArea.focus(), 100)
        
        console.log('📝 편집 모드 진입')
    }
    
    exitEditMode() {
        this.editorMode = 'read'
        
        // UI 전환
        this.contentReader.classList.remove('hidden')
        this.contentEditor.classList.add('hidden')
        this.aiToolbar.classList.add('hidden')
        
        // 버튼 텍스트 변경
        this.editToggleBtn.innerHTML = '<i class="fas fa-edit mr-2"></i>편집 모드'
        this.editToggleBtn.classList.remove('bg-gray-600', 'hover:bg-gray-700')
        this.editToggleBtn.classList.add('bg-blue-600', 'hover:bg-blue-700')
        
        console.log('👁️ 읽기 모드 진입')
    }
    
    saveEdit() {
        const editedContent = this.editableContentToHtml(this.contentEditArea.innerHTML)
        this.contentReader.innerHTML = editedContent
        this.currentContent = editedContent
        
        this.exitEditMode()
        this.showSuccess('편집 내용이 저장되었습니다!')
        
        console.log('💾 편집 내용 저장 완료')
    }
    
    cancelEdit() {
        this.contentEditArea.innerHTML = this.htmlToEditableContent(this.originalContent)
        this.exitEditMode()
        this.showSuccess('편집이 취소되었습니다.')
        
        console.log('❌ 편집 취소')
    }
    
    // HTML을 편집 가능한 형태로 변환
    htmlToEditableContent(html) {
        return html
            .replace(/<div class="prose[^"]*"/g, '<div')
            .replace(/class="[^"]*prose[^"]*"/g, '')
            .replace(/\s+class=""/g, '')
    }
    
    // 편집 가능한 콘텐츠를 HTML로 변환
    editableContentToHtml(content) {
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = content
        tempDiv.className = 'prose max-w-none'
        return tempDiv.innerHTML
    }
    
    applyFormat(format) {
        if (!this.contentEditArea || this.editorMode !== 'edit') return
        
        switch (format) {
            case 'bold':
                document.execCommand('bold', false, null)
                break
            case 'italic':
                document.execCommand('italic', false, null)
                break
            case 'underline':
                document.execCommand('underline', false, null)
                break
            case 'ul':
                document.execCommand('insertUnorderedList', false, null)
                break
            case 'ol':
                document.execCommand('insertOrderedList', false, null)
                break
            case 'link':
                const url = prompt('링크 URL을 입력하세요:')
                if (url) document.execCommand('createLink', false, url)
                break
            case 'quote':
                this.wrapSelection('blockquote')
                break
            case 'code':
                this.wrapSelection('code')
                break
            case 'undo':
                this.undo()
                break
            case 'redo':
                this.redo()
                break
        }
        
        this.saveToHistory()
    }
    
    wrapSelection(tag) {
        const selection = window.getSelection()
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            const selectedText = range.toString()
            if (selectedText) {
                const wrapper = document.createElement(tag)
                wrapper.textContent = selectedText
                range.deleteContents()
                range.insertNode(wrapper)
            }
        }
    }
    
    async applyAIEdit(action, button) {
        const selection = window.getSelection()
        const selectedText = selection.toString().trim()
        
        if (!selectedText) {
            this.showError('편집할 텍스트를 선택해주세요.')
            return
        }
        
        // 로딩 상태 표시
        button.classList.add('loading')
        button.disabled = true
        
        try {
            let prompt = ''
            switch (action) {
                case 'rewrite':
                    prompt = `다음 텍스트를 더 명확하고 자연스럽게 재작성해주세요 (답변은 재작성된 텍스트만):\n\n${selectedText}`
                    break
                case 'improve':
                    prompt = `다음 텍스트를 더 매력적이고 읽기 쉽게 개선해주세요 (답변은 개선된 텍스트만):\n\n${selectedText}`
                    break
                case 'tone':
                    const newTone = prompt('어떤 톤으로 변경하시겠습니까? (친근한, 전문적, 유머러스, 진지한)')
                    if (!newTone) {
                        button.classList.remove('loading')
                        button.disabled = false
                        return
                    }
                    prompt = `다음 텍스트를 ${newTone} 톤으로 다시 작성해주세요 (답변은 변경된 텍스트만):\n\n${selectedText}`
                    break
                case 'expand':
                    prompt = `다음 텍스트를 더 자세하고 풍부하게 확장해주세요 (답변은 확장된 텍스트만):\n\n${selectedText}`
                    break
                case 'summarize':
                    prompt = `다음 텍스트를 핵심 내용만 간결하게 요약해주세요 (답변은 요약문만):\n\n${selectedText}`
                    break
                case 'translate':
                    const targetLang = prompt('어떤 언어로 번역하시겠습니까? (영어, 일본어, 중국어, 스페인어 등)')
                    if (!targetLang) {
                        button.classList.remove('loading')
                        button.disabled = false
                        return
                    }
                    prompt = `다음 텍스트를 ${targetLang}로 번역해주세요 (답변은 번역문만):\n\n${selectedText}`
                    break
            }
            
            // AI API 호출
            const result = await this.callAIForEdit(prompt)
            
            // 선택된 텍스트를 결과로 교체
            const range = selection.getRangeAt(0)
            range.deleteContents()
            range.insertNode(document.createTextNode(result))
            
            this.saveToHistory()
            this.showSuccess('AI 편집이 완료되었습니다!')
            
        } catch (error) {
            console.error('AI 편집 실패:', error)
            this.showError('AI 편집 중 오류가 발생했습니다.')
        } finally {
            // 로딩 상태 해제
            button.classList.remove('loading')
            button.disabled = false
        }
    }
    
    async callAIForEdit(prompt) {
        const response = await axios.post('/api/generate', {
            topic: prompt,
            audience: '일반인',
            tone: '친근한',
            aiModel: 'claude'
        })
        
        if (response.data.error) {
            throw new Error(response.data.error)
        }
        
        // AI 응답에서 실제 편집 결과만 추출
        return this.extractEditResult(response.data.content)
    }
    
    extractEditResult(content) {
        // AI 응답에서 편집된 텍스트만 추출
        let result = content
            .replace(/^#.*$/gm, '') // 제목 제거
            .replace(/\*\*(.*?)\*\*/g, '$1') // 굵은 글씨 마크다운 제거
            .replace(/\*(.*?)\*/g, '$1') // 기울임 마크다운 제거
            .replace(/^.*?:\s*/gm, '') // "답변:" 등 접두사 제거
            .trim()
        
        // 첫 번째 문단만 추출 (편집 결과가 너무 길 경우)
        const paragraphs = result.split('\n\n')
        return paragraphs[0] || result
    }
    
    onContentChange() {
        this.currentContent = this.contentEditArea.innerHTML
    }
    
    onKeyDown(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'z':
                    e.preventDefault()
                    if (e.shiftKey) {
                        this.redo()
                    } else {
                        this.undo()
                    }
                    break
                case 'b':
                    e.preventDefault()
                    this.applyFormat('bold')
                    break
                case 'i':
                    e.preventDefault()
                    this.applyFormat('italic')
                    break
                case 's':
                    e.preventDefault()
                    this.saveEdit()
                    break
            }
        }
    }
    
    onPaste(e) {
        e.preventDefault()
        const text = e.clipboardData.getData('text/plain')
        document.execCommand('insertText', false, text)
        this.saveToHistory()
    }
    
    saveToHistory() {
        const currentContent = this.contentEditArea.innerHTML
        if (currentContent !== this.editHistory[this.historyIndex]) {
            this.editHistory = this.editHistory.slice(0, this.historyIndex + 1)
            this.editHistory.push(currentContent)
            this.historyIndex++
            
            if (this.editHistory.length > 50) {
                this.editHistory.shift()
                this.historyIndex--
            }
        }
    }
    
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--
            this.contentEditArea.innerHTML = this.editHistory[this.historyIndex]
        }
    }
    
    redo() {
        if (this.historyIndex < this.editHistory.length - 1) {
            this.historyIndex++
            this.contentEditArea.innerHTML = this.editHistory[this.historyIndex]
        }
    }
    
    downloadContent(format) {
        const content = this.currentContent || this.contentReader.innerHTML
        const title = this.topicInput?.value || 'AI 생성 블로그'
        
        switch (format) {
            case 'html':
                this.downloadAsHTML(content, title)
                break
            case 'markdown':
                this.downloadAsMarkdown(content, title)
                break
            case 'docx':
                this.showError('Word 문서 다운로드는 준비 중입니다.')
                break
            case 'pdf':
                this.showError('PDF 다운로드는 준비 중입니다.')
                break
        }
    }
    
    downloadAsHTML(content, title) {
        const html = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2, h3 { color: #333; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
        blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 20px; color: #666; }
    </style>
</head>
<body>
    ${content}
</body>
</html>`
        
        this.downloadFile(html, `${title}.html`, 'text/html')
    }
    
    downloadAsMarkdown(content, title) {
        const markdown = this.htmlToMarkdown(content)
        this.downloadFile(markdown, `${title}.md`, 'text/markdown')
    }
    
    htmlToMarkdown(html) {
        return html
            .replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n')
            .replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n')
            .replace(/<h3>(.*?)<\/h3>/g, '### $1\n\n')
            .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
            .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
            .replace(/<em>(.*?)<\/em>/g, '*$1*')
            .replace(/<code>(.*?)<\/code>/g, '`$1`')
            .replace(/<blockquote>(.*?)<\/blockquote>/g, '> $1\n\n')
            .replace(/<br\s*\/?>/g, '\n')
            .replace(/<[^>]+>/g, '')
            .replace(/\n\s*\n\s*\n/g, '\n\n')
            .trim()
    }
    
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        this.showSuccess(`${filename} 다운로드가 시작되었습니다!`)
    }
    
    // ==================== 블로그 에디터 기능 ====================
    
    initializeBlogEditor() {
        console.log('📝 블로그 에디터 초기화 시작...')
        
        // 에디터 초기 상태 설정
        this.isEditMode = false
        this.editHistory = []
        this.currentHistoryIndex = -1
        this.currentContent = ''
        this.selectedText = ''
        
        console.log('✅ 블로그 에디터 초기화 완료!')
    }
    
    attachEditorListeners() {
        // 편집 모드 토글 버튼
        if (this.editToggleBtn) {
            this.editToggleBtn.addEventListener('click', () => {
                this.toggleEditMode()
            })
        }
        
        // AI 도구 버튼들
        const aiToolBtns = document.querySelectorAll('.ai-tool-btn')
        aiToolBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action
                this.handleAITool(action)
            })
        })
        
        // 포맷팅 버튼들
        const formatBtns = document.querySelectorAll('.format-btn')
        formatBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const format = e.target.dataset.format
                this.handleFormat(format)
            })
        })
        
        // 포맷 셀렉터
        const formatSelects = document.querySelectorAll('.format-select')
        formatSelects.forEach(select => {
            select.addEventListener('change', (e) => {
                const format = e.target.dataset.format
                const value = e.target.value
                this.handleFormatSelect(format, value)
            })
        })
        
        // 저장/취소 버튼
        if (this.saveEditBtn) {
            this.saveEditBtn.addEventListener('click', () => {
                this.saveEdit()
            })
        }
        
        if (this.cancelEditBtn) {
            this.cancelEditBtn.addEventListener('click', () => {
                this.cancelEdit()
            })
        }
        
        // 다운로드 버튼 및 메뉴
        if (this.downloadBtn) {
            this.downloadBtn.addEventListener('click', (e) => {
                e.preventDefault()
                e.stopPropagation()
                this.toggleDownloadMenu()
            })
        }
        
        // 다운로드 메뉴 옵션
        const downloadOptions = document.querySelectorAll('#downloadMenu button')
        downloadOptions.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const format = e.currentTarget.dataset.format
                this.downloadContent(format)
                this.hideDownloadMenu()
            })
        })
        
        // 다운로드 메뉴 외부 클릭 시 닫기
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#downloadBtn') && !e.target.closest('#downloadMenu')) {
                this.hideDownloadMenu()
            }
        })
        
        // 편집 영역 이벤트
        if (this.contentEditArea) {
            // 입력 이벤트
            this.contentEditArea.addEventListener('input', () => {
                this.handleContentChange()
            })
            
            // 키보드 단축키
            this.contentEditArea.addEventListener('keydown', (e) => {
                this.handleKeyboardShortcuts(e)
            })
            
            // 블록 드래그 및 드롭
            this.contentEditArea.addEventListener('dragover', (e) => {
                e.preventDefault()
                e.target.classList.add('drag-over')
            })
            
            this.contentEditArea.addEventListener('dragleave', (e) => {
                e.target.classList.remove('drag-over')
            })
            
            this.contentEditArea.addEventListener('drop', (e) => {
                e.preventDefault()
                e.target.classList.remove('drag-over')
                this.handleFileDrop(e)
            })
            
            // 텍스트 선택 이벤트
            this.contentEditArea.addEventListener('mouseup', () => {
                this.updateSelectedText()
            })
            
            this.contentEditArea.addEventListener('keyup', () => {
                this.updateSelectedText()
            })
        }
    }
    
    toggleEditMode() {
        this.isEditMode = !this.isEditMode
        
        if (this.isEditMode) {
            // 편집 모드 활성화
            this.enterEditMode()
        } else {
            // 읽기 모드로 복귀
            this.exitEditMode()
        }
    }
    
    enterEditMode() {
        console.log('🖊️ 편집 모드 활성화')
        
        // 콘텐츠를 편집 영역으로 복사
        if (this.contentReader && this.contentEditArea) {
            const currentContent = this.contentReader.innerHTML || this.currentContent
            this.contentEditArea.innerHTML = currentContent
            this.currentContent = currentContent
            
            // 히스토리에 추가
            this.addToHistory(currentContent)
        }
        
        // UI 업데이트
        if (this.contentReader) this.contentReader.style.display = 'none'
        if (this.contentEditor) this.contentEditor.classList.remove('hidden')
        if (this.aiToolbar) this.aiToolbar.classList.remove('hidden')
        
        // 버튼 텍스트 변경
        if (this.editToggleBtn) {
            this.editToggleBtn.innerHTML = '<i class="fas fa-book-open mr-2"></i>읽기 모드'
        }
    }
    
    exitEditMode() {
        console.log('📄 읽기 모드로 복귀')
        
        // 편집된 콘텐츠를 읽기 영역으로 복사
        if (this.contentEditArea && this.contentReader) {
            const editedContent = this.contentEditArea.innerHTML
            this.contentReader.innerHTML = editedContent
            this.currentContent = editedContent
        }
        
        // UI 업데이트
        if (this.contentEditor) this.contentEditor.classList.add('hidden')
        if (this.aiToolbar) this.aiToolbar.classList.add('hidden')
        if (this.contentReader) this.contentReader.style.display = 'block'
        
        // 버튼 텍스트 변경
        if (this.editToggleBtn) {
            this.editToggleBtn.innerHTML = '<i class="fas fa-edit mr-2"></i>편집 모드'
        }
    }
    
    saveEdit() {
        console.log('💾 편집 내용 저장')
        
        if (this.contentEditArea && this.contentReader) {
            const editedContent = this.contentEditArea.innerHTML
            this.contentReader.innerHTML = editedContent
            this.currentContent = editedContent
            
            // 히스토리에 추가
            this.addToHistory(editedContent)
        }
        
        this.exitEditMode()
        this.showSuccess('편집 내용이 저장되었습니다!')
    }
    
    cancelEdit() {
        console.log('❌ 편집 취소')
        
        // 이전 콘텐츠로 복귀
        if (this.contentEditArea && this.currentContent) {
            this.contentEditArea.innerHTML = this.currentContent
        }
        
        this.exitEditMode()
        this.showInfo('편집이 취소되었습니다.')
    }
    
    // AI 도구 처리
    async handleAITool(action) {
        console.log(`🤖 AI 도구 실행: ${action}`)
        console.log('🔍 선택된 텍스트 상태:', this.selectedText)
        console.log('🔍 편집 영역 상태:', this.contentEditArea)
        console.log('🔍 편집 영역 내용:', this.contentEditArea?.innerText?.substring(0, 100) + '...')
        
        if (!this.selectedText && !this.contentEditArea) {
            this.showError('편집할 텍스트를 선택하거나 전체 콘텐츠를 사용하세요.')
            return
        }
        
        // 타깃 텍스트 결정
        const targetText = this.selectedText || this.contentEditArea.innerText
        console.log('🎯 타깃 텍스트:', targetText?.substring(0, 200) + '...')
        
        if (!targetText || targetText.trim().length === 0) {
            this.showError('편집할 텍스트가 비어있습니다.')
            return
        }
        
        if (!targetText.trim()) {
            this.showError('편집할 콘텐츠가 비어있습니다.')
            return
        }
        
        // AI 도구 버튼 상태 업데이트
        const btn = document.querySelector(`[data-action="${action}"]`)
        if (btn) {
            btn.classList.add('processing')
            btn.disabled = true
        }
        
        try {
            const result = await this.callAIEdit(action, targetText)
            
            if (result) {
                // 결과 적용
                this.applyAIEdit(result)
                this.showSuccess(`${this.getActionName(action)} 완료!`)
            }
        } catch (error) {
            console.error('AI 도구 오류:', error)
            this.showError(`${this.getActionName(action)} 실패: ${error.message}`)
        } finally {
            // 버튼 상태 복구
            if (btn) {
                btn.classList.remove('processing')
                btn.disabled = false
            }
        }
    }
    
    getActionName(action) {
        const names = {
            rewrite: '재작성',
            improve: '개선',
            tone: '톤 변경',
            expand: '확장',
            summarize: '요약',
            translate: '번역'
        }
        return names[action] || action
    }
    
    async callAIEdit(action, text) {
        // AI API 호출 로직
        const apiKey = this.getAvailableApiKey()
        
        console.log('🔍 callAIEdit - 받은 API 키 정보:', apiKey)
        
        if (!apiKey.model || (!apiKey.key && apiKey.key !== 'server')) {
            console.error('❌ API 키 검증 실패:', apiKey)
            throw new Error('API 키가 설정되지 않았습니다. 개별 API 키를 입력하거나 서버에 구성된 키를 사용하세요.')
        }
        
        console.log(`🤖 AI 도구 ${action}: ${apiKey.model} 모델 사용`)
        console.log('✅ API 키 검증 통과!')
        
        const prompt = this.generateEditPrompt(action, text)
        
        const requestData = {
            topic: action, // 액션명만 간단히
            audience: '일반인',
            tone: '자연스러운',
            aiModel: apiKey.model,
            apiKey: apiKey.key === 'server' ? '' : apiKey.key, // 서버 키면 빈 문자열로 전달
            customPrompt: prompt // 여기에 실제 편집할 텍스트와 명령이 들어있음
        }
        
        try {
            const response = await axios.post('/api/generate', requestData)
            return response.data.content
        } catch (error) {
            throw new Error('서버 오류: ' + (error.response?.data?.message || error.message))
        }
    }
    
    generateEditPrompt(action, text) {
        const prompts = {
            rewrite: `다음 텍스트를 더 명확하고 읽기 쉽게 다시 작성해주세요:\n\n${text}\n\n단순히 다시 작성된 텍스트만 반환해주세요.`,
            improve: `다음 텍스트를 더 나은 품질로 개선해주세요:\n\n${text}\n\n더 명확하고, 설득력 있고, 매력적으로 만들어주세요. 개선된 텍스트만 반환해주세요.`,
            tone: `다음 텍스트의 톤을 더 친근하고 대화체로 바꿔주세요:\n\n${text}\n\n내용은 그대로 유지하되, 톤만 바꿔서 반환해주세요.`,
            expand: `다음 텍스트를 더 자세히 설명하고 구체적인 예시를 추가해주세요:\n\n${text}\n\n더 풍부하고 상세한 버전으로 확장해주세요.`,
            summarize: `다음 텍스트를 핵심만 간결하게 요약해주세요:\n\n${text}\n\n핵심만 간단하게 요약해주세요.`,
            translate: `다음 텍스트를 영어로 번역해주세요:\n\n${text}\n\n번역된 텍스트만 반환해주세요.`
        }
        
        return prompts[action] || `다음 텍스트를 처리해주세요: ${text}`
    }
    
    applyAIEdit(newText) {
        if (this.selectedText && this.contentEditArea) {
            // 선택된 텍스트 바꾸기
            const currentContent = this.contentEditArea.innerHTML
            const updatedContent = currentContent.replace(this.selectedText, newText)
            this.contentEditArea.innerHTML = updatedContent
        } else if (this.contentEditArea) {
            // 전체 콘텐츠 바꾸기
            this.contentEditArea.innerHTML = newText
        }
        
        // 히스토리에 추가
        this.addToHistory(this.contentEditArea.innerHTML)
    }
    
    // 포맷팅 처리
    handleFormat(format) {
        if (!this.contentEditArea) return
        
        console.log(`🎨 포맷 적용: ${format}`)
        
        switch (format) {
            case 'bold':
                document.execCommand('bold')
                break
            case 'italic':
                document.execCommand('italic')
                break
            case 'underline':
                document.execCommand('underline')
                break
            case 'ul':
                document.execCommand('insertUnorderedList')
                break
            case 'ol':
                document.execCommand('insertOrderedList')
                break
            case 'link':
                const url = prompt('링크 URL을 입력하세요:')
                if (url) {
                    document.execCommand('createLink', false, url)
                }
                break
            case 'quote':
                this.wrapSelection('blockquote')
                break
            case 'code':
                this.wrapSelection('code')
                break
            case 'undo':
                this.undoHistory()
                break
            case 'redo':
                this.redoHistory()
                break
        }
        
        // 포맷 후 히스토리 업데이트
        this.handleContentChange()
    }
    
    handleFormatSelect(format, value) {
        if (!this.contentEditArea) return
        
        if (format === 'heading') {
            if (value) {
                document.execCommand('formatBlock', false, `h${value}`)
            } else {
                document.execCommand('formatBlock', false, 'p')
            }
        }
        
        this.handleContentChange()
    }
    
    wrapSelection(tag) {
        const selection = window.getSelection()
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            const selectedText = range.toString()
            
            if (selectedText) {
                const element = document.createElement(tag)
                element.textContent = selectedText
                range.deleteContents()
                range.insertNode(element)
                
                // 선택 해제
                selection.removeAllRanges()
            }
        }
    }
    
    // 히스토리 관리
    addToHistory(content) {
        // 현재 인덱스 이후의 히스토리 제거
        this.editHistory = this.editHistory.slice(0, this.currentHistoryIndex + 1)
        
        // 새 콘텐츠 추가
        this.editHistory.push(content)
        this.currentHistoryIndex = this.editHistory.length - 1
        
        // 히스토리 최대 50개로 제한
        if (this.editHistory.length > 50) {
            this.editHistory.shift()
            this.currentHistoryIndex--
        }
        
        this.updateHistoryButtons()
    }
    
    undoHistory() {
        if (this.currentHistoryIndex > 0) {
            this.currentHistoryIndex--
            const content = this.editHistory[this.currentHistoryIndex]
            if (this.contentEditArea && content) {
                this.contentEditArea.innerHTML = content
            }
            this.updateHistoryButtons()
        }
    }
    
    redoHistory() {
        if (this.currentHistoryIndex < this.editHistory.length - 1) {
            this.currentHistoryIndex++
            const content = this.editHistory[this.currentHistoryIndex]
            if (this.contentEditArea && content) {
                this.contentEditArea.innerHTML = content
            }
            this.updateHistoryButtons()
        }
    }
    
    updateHistoryButtons() {
        const undoBtn = document.querySelector('[data-format="undo"]')
        const redoBtn = document.querySelector('[data-format="redo"]')
        
        if (undoBtn) {
            undoBtn.disabled = this.currentHistoryIndex <= 0
        }
        
        if (redoBtn) {
            redoBtn.disabled = this.currentHistoryIndex >= this.editHistory.length - 1
        }
    }
    
    // 콘텐츠 변경 처리
    handleContentChange() {
        // 디바운스 처리
        if (this.contentChangeTimeout) {
            clearTimeout(this.contentChangeTimeout)
        }
        
        this.contentChangeTimeout = setTimeout(() => {
            if (this.contentEditArea) {
                // 문자 수 업데이트
                this.updateCharCounter()
                
                // 자동 저장 (선택적)
                // this.autoSave()
            }
        }, 500)
    }
    
    updateCharCounter() {
        if (this.contentEditArea) {
            const text = this.contentEditArea.innerText || ''
            const charCount = text.length
            const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length
            
            // 문자 수 표시 업데이트
            let counter = document.querySelector('.char-counter')
            if (!counter) {
                counter = document.createElement('div')
                counter.className = 'char-counter'
                this.contentEditor.appendChild(counter)
            }
            
            counter.textContent = `${charCount}글자 / ${wordCount}단어`
        }
    }
    
    updateSelectedText() {
        const selection = window.getSelection()
        this.selectedText = selection.toString().trim()
        
        // AI 도구 버튼 상태 업데이트
        const aiToolBtns = document.querySelectorAll('.ai-tool-btn')
        aiToolBtns.forEach(btn => {
            if (this.selectedText) {
                btn.style.opacity = '1'
                btn.title = `선택된 텍스트 ${this.getActionName(btn.dataset.action)}`
            } else {
                btn.style.opacity = '0.7'
                btn.title = `전체 콘텐츠 ${this.getActionName(btn.dataset.action)}`
            }
        })
    }
    
    // 키보드 단축키
    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'b':
                    e.preventDefault()
                    this.handleFormat('bold')
                    break
                case 'i':
                    e.preventDefault()
                    this.handleFormat('italic')
                    break
                case 'u':
                    e.preventDefault()
                    this.handleFormat('underline')
                    break
                case 'z':
                    e.preventDefault()
                    if (e.shiftKey) {
                        this.redoHistory()
                    } else {
                        this.undoHistory()
                    }
                    break
                case 's':
                    e.preventDefault()
                    this.saveEdit()
                    break
            }
        }
        
        // Tab 키 처리
        if (e.key === 'Tab') {
            e.preventDefault()
            document.execCommand('insertText', false, '    ') // 4개 공백
        }
    }
    
    // 파일 드롭 처리
    handleFileDrop(e) {
        const files = Array.from(e.dataTransfer.files)
        
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                this.insertImage(file)
            } else if (file.type === 'text/plain') {
                this.insertTextFile(file)
            }
        })
    }
    
    insertImage(file) {
        const reader = new FileReader()
        reader.onload = (e) => {
            const img = document.createElement('img')
            img.src = e.target.result
            img.style.maxWidth = '100%'
            img.style.height = 'auto'
            img.alt = file.name
            
            // 커서 위치에 삽입
            const selection = window.getSelection()
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0)
                range.insertNode(img)
            } else {
                this.contentEditArea.appendChild(img)
            }
            
            this.handleContentChange()
        }
        reader.readAsDataURL(file)
    }
    
    insertTextFile(file) {
        const reader = new FileReader()
        reader.onload = (e) => {
            const text = e.target.result
            document.execCommand('insertText', false, text)
            this.handleContentChange()
        }
        reader.readAsText(file)
    }
    
    // 다운로드 메뉴 관리
    toggleDownloadMenu() {
        if (this.downloadMenu) {
            this.downloadMenu.classList.toggle('hidden')
        }
    }
    
    hideDownloadMenu() {
        if (this.downloadMenu) {
            this.downloadMenu.classList.add('hidden')
        }
    }
    
    // 콘텐츠 다운로드
    downloadContent(format) {
        console.log(`💾 다운로드 형식: ${format}`)
        
        const content = this.isEditMode ? this.contentEditArea?.innerHTML : this.contentReader?.innerHTML
        
        if (!content) {
            this.showError('다운로드할 콘텐츠가 없습니다.')
            return
        }
        
        const title = this.extractTitle(content) || '블로그'
        const filename = `${title}_${new Date().toISOString().slice(0, 10)}`
        
        switch (format) {
            case 'html':
                this.downloadAsHTML(content, filename)
                break
            case 'markdown':
                this.downloadAsMarkdown(content, filename)
                break
            case 'docx':
                this.downloadAsWord(content, filename)
                break
            case 'pdf':
                this.downloadAsPDF(content, filename)
                break
            default:
                this.showError('지원하지 않는 형식입니다.')
        }
    }
    
    extractTitle(content) {
        // HTML에서 첫 번째 제목 추출
        const parser = new DOMParser()
        const doc = parser.parseFromString(content, 'text/html')
        const heading = doc.querySelector('h1, h2, h3')
        return heading ? heading.textContent.trim().substring(0, 50) : null
    }
    
    downloadAsHTML(content, filename) {
        const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${filename}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2, h3 { color: #333; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
        blockquote { border-left: 4px solid #ddd; padding-left: 1rem; margin: 1rem 0; font-style: italic; }
    </style>
</head>
<body>
    ${content}
</body>
</html>`
        
        this.downloadFile(htmlContent, `${filename}.html`, 'text/html')
    }
    
    downloadAsMarkdown(content, filename) {
        // HTML을 마크다운으로 변환 (간단한 변환)
        let markdown = content
            .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
            .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
            .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
            .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
            .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
            .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
            .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
            .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
            .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
            .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n')
            .replace(/<ul[^>]*>(.*?)<\/ul>/gi, '$1')
            .replace(/<ol[^>]*>(.*?)<\/ol>/gi, '$1')
            .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
            .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]*>/g, '') // 나머지 HTML 태그 제거
            .replace(/\n{3,}/g, '\n\n') // 연속된 빈 줄 정리
        
        this.downloadFile(markdown, `${filename}.md`, 'text/markdown')
    }
    
    downloadAsWord(content, filename) {
        // Word 다운로드는 브라우저 제한으로 간단한 RTF 형식 사용
        const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}} ${content.replace(/<[^>]*>/g, '')}}`
        this.downloadFile(rtfContent, `${filename}.rtf`, 'application/rtf')
        
        this.showInfo('Word 형식은 RTF로 다운로드됩니다. Word에서 열어 DOCX로 저장할 수 있습니다.')
    }
    
    downloadAsPDF(content, filename) {
        // PDF 다운로드는 브라우저 인쇄 기능 활용
        const printWindow = window.open('', '_blank')
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${filename}</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 20px; }
                    h1, h2, h3 { color: #333; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>${content}</body>
            </html>
        `)
        printWindow.document.close()
        
        setTimeout(() => {
            printWindow.print()
        }, 500)
        
        this.showInfo('PDF 다운로드를 위해 브라우저의 인쇄 기능을 사용하세요.')
    }
    
    // 에디터에서 콘텐츠 표시 업데이트
    displayContent(content, isDemo = false, model = '', expertInfo = null, seoInfo = null) {
        // 기존 displayContent 메소드 확장
        if (this.resultSection) {
            this.resultSection.classList.remove('hidden')
        }
        
        // 콘텐츠 표시
        if (this.contentReader) {
            this.contentReader.innerHTML = content
            this.currentContent = content
        }
        
        // 에디터 초기화
        this.isEditMode = false
        this.editHistory = [content]
        this.currentHistoryIndex = 0
        
        // 생성 정보 표시
        if (this.generationInfo) {
            let infoHTML = `<i class="fas fa-robot mr-2"></i><strong>모델:</strong> ${model}`
            
            if (isDemo) {
                infoHTML += ` <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs ml-2">데모 모드</span>`
            }
            
            if (expertInfo) {
                infoHTML += `<br><i class="fas fa-brain mr-2"></i><strong>전문가 시스템:</strong> ${expertInfo.expert?.name || expertInfo.model} (신뢰도: ${expertInfo.confidence}%)`
            }
            
            this.generationInfo.innerHTML = infoHTML
        }
        
        // SEO 정보 표시
        if (seoInfo) {
            this.displaySEOInfo(seoInfo)
        }
        
        // 스크롤 이동
        if (this.resultSection) {
            this.resultSection.scrollIntoView({ behavior: 'smooth' })
        }
        
        console.log('📄 콘텐츠 표시 완료 - 에디터 준비 완료')
    }
    
    // ==================== 유틸리티 메소드 ====================
    
    getAvailableApiKey() {
        console.log('🔥🔥🔥 AI 도구용 API 키 검색 시작! 🔥🔥🔥')
        console.log('📋 현재 객체 상태:', this)
        console.log('🔑 serverApiKeys 상태:', this.serverApiKeys)
        
        // DOM 요소 상태 확인
        console.log('📝 DOM 요소 상태:')
        console.log('  - claudeApiKeyInput:', this.claudeApiKeyInput)
        console.log('  - geminiApiKeyInput:', this.geminiApiKeyInput) 
        console.log('  - openaiApiKeyInput:', this.openaiApiKeyInput)
        console.log('  - grokApiKeyInput:', this.grokApiKeyInput)
        
        // 1. 사용자 입력 API 키 먼저 확인
        const userKeys = {
            claude: this.claudeApiKeyInput?.value || '',
            gemini: this.geminiApiKeyInput?.value || '',
            openai: this.openaiApiKeyInput?.value || '',
            grok: this.grokApiKeyInput?.value || ''
        }
        
        console.log('👤 사용자 입력 키들:', userKeys)
        
        // 입력된 API 키 중 첫 번째 사용
        for (const [model, key] of Object.entries(userKeys)) {
            if (key.trim()) {
                console.log(`✅ 사용자 입력 ${model} API 키 사용: ${key.substring(0, 10)}...`)
                return { model, key: key.trim() }
            }
        }
        
        console.log('⏭️ 사용자 입력 키 없음, 서버 키 확인 중...')
        
        // 2. 서버 API 키 확인
        if (this.serverApiKeys) {
            console.log('🖥️ 서버 API 키 상태:', this.serverApiKeys)
            const serverModels = ['claude', 'gemini', 'openai', 'grok']
            for (const model of serverModels) {
                console.log(`🔍 ${model} 서버 키 확인:`, this.serverApiKeys[model])
                if (this.serverApiKeys[model]) {
                    console.log(`✅ 서버 ${model} API 키 사용 (AI 도구용)`)
                    return { model, key: 'server' } // 서버 키는 'server'로 표시
                }
            }
        } else {
            console.log('❌ serverApiKeys가 null 또는 undefined')
        }
        
        console.log('💥 사용 가능한 API 키가 전혀 없음!')
        return { model: null, key: null }
    }
    
    showSuccess(message) {
        this.showMessage(message, 'success')
    }
    
    showError(message) {
        this.showMessage(message, 'error')
    }
    
    showInfo(message) {
        this.showMessage(message, 'info')
    }
    
    showMessage(message, type = 'info') {
        // 기존 메시지 제거
        const existingMessages = document.querySelectorAll('.message')
        existingMessages.forEach(msg => msg.remove())
        
        // 새 메시지 생성
        const messageDiv = document.createElement('div')
        messageDiv.className = `message ${type}`
        
        let icon = ''
        switch (type) {
            case 'success':
                icon = '<i class="fas fa-check-circle mr-2"></i>'
                break
            case 'error':
                icon = '<i class="fas fa-exclamation-circle mr-2"></i>'
                break
            case 'info':
                icon = '<i class="fas fa-info-circle mr-2"></i>'
                break
        }
        
        messageDiv.innerHTML = `${icon}${message}`
        
        // 메시지를 페이지 상단에 삽입
        const container = document.querySelector('.container')
        if (container) {
            container.insertBefore(messageDiv, container.firstChild)
        } else {
            document.body.insertBefore(messageDiv, document.body.firstChild)
        }
        
        // 5초 후 자동 제거 (오류 메시지는 10초)
        const autoRemoveTime = type === 'error' ? 10000 : 5000
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.opacity = '0'
                messageDiv.style.transform = 'translateY(-20px)'
                setTimeout(() => messageDiv.remove(), 300)
            }
        }, autoRemoveTime)
        
        // 애니메이션 효과
        messageDiv.style.opacity = '0'
        messageDiv.style.transform = 'translateY(-20px)'
        setTimeout(() => {
            messageDiv.style.opacity = '1'
            messageDiv.style.transform = 'translateY(0)'
        }, 100)
    }
    
    displaySEOInfo(seoData) {
        // SEO 정보 표시 메소드 (기존 코드 유지)
        if (!this.seoAnalysisSection) return
        
        this.seoAnalysisSection.classList.remove('hidden')
        
        // SEO 점수 표시
        if (this.seoScore && seoData.seoAnalysis) {
            const score = seoData.seoAnalysis.seoScore || 0
            this.seoScore.textContent = score
            
            if (this.seoScoreProgress) {
                this.seoScoreProgress.style.width = `${score}%`
                
                // 색상 변경
                if (score >= 80) {
                    this.seoScoreProgress.className = 'bg-green-500 h-3 rounded-full transition-all'
                } else if (score >= 60) {
                    this.seoScoreProgress.className = 'bg-yellow-500 h-3 rounded-full transition-all'
                } else {
                    this.seoScoreProgress.className = 'bg-red-500 h-3 rounded-full transition-all'
                }
            }
        }
        
        // 키워드 밀도
        if (this.keywordDensity && seoData.seoAnalysis) {
            this.keywordDensity.textContent = `${seoData.seoAnalysis.keywordDensity || 0}%`
        }
        
        // 키워드 표시
        if (this.focusKeywordDisplay && seoData.seoMetadata) {
            this.focusKeywordDisplay.textContent = seoData.seoMetadata.focusKeyword || ''
        }
        
        // 읽기 시간
        if (this.readingTime && seoData.seoMetadata) {
            this.readingTime.textContent = seoData.seoMetadata.readingTime || 0
        }
        
        // 단어 수
        if (this.wordCount && seoData.seoMetadata) {
            this.wordCount.textContent = seoData.seoMetadata.wordCount || 0
        }
        
        // SEO 메타데이터
        if (this.seoTitle && seoData.seoMetadata) {
            this.seoTitle.textContent = seoData.seoMetadata.title || ''
        }
        
        if (this.metaDescription && seoData.seoMetadata) {
            this.metaDescription.textContent = seoData.seoMetadata.metaDescription || ''
        }
        
        if (this.seoKeywords && seoData.seoMetadata) {
            const keywords = seoData.seoMetadata.keywords || []
            this.seoKeywords.textContent = keywords.join(', ')
        }
        
        // SEO 권장사항
        if (this.recommendationsList && seoData.seoAnalysis) {
            const recommendations = seoData.seoAnalysis.recommendations || []
            this.recommendationsList.innerHTML = ''
            
            recommendations.forEach(rec => {
                const li = document.createElement('li')
                li.className = 'flex items-start'
                li.innerHTML = `
                    <i class="fas fa-lightbulb mr-2 text-yellow-500 mt-1"></i>
                    <span class="text-gray-700">${rec}</span>
                `
                this.recommendationsList.appendChild(li)
            })
        }
    }
}

// ==================== 초기화 ====================
// 중복 초기화 제거됨 - 아래에서 통합 초기화

// 전역 함수로 내보내기 (디버깅용)
window.BlogGenerator = BlogGenerator

// ==================== 블로그 에디터 클래스 ====================

class BlogEditor {
    constructor(blogGenerator) {
        this.generator = blogGenerator
        this.init()
    }
    
    init() {
        console.log('📝 BlogEditor 초기화...')
        
        // 에디터 상태
        this.isEditMode = false
        this.history = []
        this.historyIndex = -1
        this.currentContent = ''
        
        this.attachEvents()
    }
    
    attachEvents() {
        // 이미 BlogGenerator에서 처리하고 있으므로 추가 이벤트만 필요
        console.log('✅ BlogEditor 이벤트 리스너 준비 완룈')
    }
}

// 전역으로 브로그 에디터 내보내기
window.BlogEditor = BlogEditor

// ==================== 통합 초기화 ====================
// BlogGenerator 단일 초기화로 중복 이벤트 리스너 문제 해결
function initializeBlogGenerator() {
    if (window.blogGenerator) {
        console.log('⚠️ BlogGenerator 이미 초기화됨, 재초기화 방지')
        return
    }
    
    console.log('🚀 BlogGenerator 초기화 시작...')
    window.blogGenerator = new BlogGenerator()
    
    console.log('📱 AI 블로그 생성기 v3.2 시작!')
    console.log('✨ 기능: 품질 검증 시스템 + SEO 최적화 + 블로그 에디터')  
    console.log('🤖 지원 모델: Claude, Gemini, OpenAI, GROK')
    console.log('🛡️ 신기능: 3단계 품질 검증 + Claude Artifacts 스타일 에디터')
    console.log('✅ BlogGenerator 인스턴스 생성 완료')
}

// DOM 로드 상태에 따라 적절히 초기화
if (document.readyState === 'loading') {
    console.log('⏳ DOM 로딩 중... 완료 대기')
    document.addEventListener('DOMContentLoaded', initializeBlogGenerator)
} else {
    console.log('🚀 DOM 이미 로드됨, BlogGenerator 즉시 초기화...')
    initializeBlogGenerator()
}