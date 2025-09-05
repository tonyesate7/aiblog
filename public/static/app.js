// ==================== AI 블로그 생성기 v3.0 ====================
// 품질 검증 시스템(QA System) 포함 고급 버전

class BlogGenerator {
    constructor() {
        this.initializeElements()
        this.attachEventListeners()
        this.loadApiKeys()
        this.checkApiKeyStatus()
        this.initializeTutorial()
        
        console.log('🚀 AI 블로그 생성기 v3.1 초기화 완료 (GROK 통합 + 사용자 가이드 시스템)')
        
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
    }

    attachEventListeners() {
        // 일반 블로그 생성 버튼
        if (this.generateBtn) {
            this.generateBtn.addEventListener('click', (e) => {
                e.preventDefault()
                this.generateBlog()
            })
        }

        // SEO 최적화 블로그 생성 버튼
        if (this.generateSeoBtn) {
            this.generateSeoBtn.addEventListener('click', (e) => {
                e.preventDefault()
                this.generateSEOBlog()
            })
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

        // 품질 검증 생성 버튼
        if (this.generateQaBtn) {
            this.generateQaBtn.addEventListener('click', (e) => {
                e.preventDefault()
                this.generateQABlog()
            })
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
            const response = await axios.get('/api/keys/status')
            const status = response.data
            
            console.log('🔑 API 키 상태:', status)
            
            // 서버 API 키 상태 저장 (전역 사용)
            this.serverApiKeys = {
                claude: status.claude,
                gemini: status.gemini, 
                openai: status.openai,
                grok: status.grok
            }
            
            // 바로 사용 가능한지 확인
            if (status.canUseDirectly) {
                console.log(status.message)
                this.showServerApiKeyStatus(status.availableModels)
            } else {
                console.log('❌ 서버에 구성된 API 키가 없습니다. 개별 API 키 설정이 필요합니다.')
            }
            
        } catch (error) {
            console.error('API 키 상태 확인 실패:', error)
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
        const topic = this.topicInput?.value?.trim()
        if (!topic) {
            this.showError('주제를 입력해주세요.')
            return
        }

        const audience = this.audienceSelect?.value || '일반인'
        const tone = this.toneSelect?.value || '친근한'
        const aiModel = this.aiModelSelect?.value || 'claude'

        // 로딩 상태 표시
        this.setLoadingState(true)
        
        try {
            // API 키 가져오기 (서버 키 우선, 없으면 사용자 입력 키)
            let apiKey = ''
            if (aiModel === 'claude') {
                apiKey = this.claudeApiKeyInput?.value || ''
                if (!apiKey && this.serverApiKeys?.claude) {
                    console.log('🔑 Claude 서버 API 키 사용')
                }
            } else if (aiModel === 'gemini') {
                apiKey = this.geminiApiKeyInput?.value || ''
                if (!apiKey && this.serverApiKeys?.gemini) {
                    console.log('🔑 Gemini 서버 API 키 사용')
                }
            } else if (aiModel === 'openai') {
                apiKey = this.openaiApiKeyInput?.value || ''
                if (!apiKey && this.serverApiKeys?.openai) {
                    console.log('🔑 OpenAI 서버 API 키 사용')
                }
            } else if (aiModel === 'grok') {
                apiKey = this.grokApiKeyInput?.value || ''
                if (!apiKey && this.serverApiKeys?.grok) {
                    console.log('🔑 GROK 서버 API 키 사용')
                }
            }
            
            // 서버 API 키가 있는지 확인
            const hasServerKey = this.serverApiKeys && this.serverApiKeys[aiModel]
            
            // API 키 검증 (서버 키가 있으면 통과)
            if (!apiKey && !hasServerKey) {
                this.showError(`${aiModel.toUpperCase()} API 키를 입력하거나 서버에 구성해주세요.`)
                this.setLoadingState(false)
                return
            }

            console.log(`🤖 ${aiModel} 모델로 블로그 생성 시작...`)
            console.log(`📝 주제: ${topic}`)
            console.log(`👥 대상: ${audience}`)
            console.log(`🎨 톤: ${tone}`)

            const response = await axios.post('/api/generate', {
                topic,
                audience,
                tone,
                aiModel,
                apiKey
            })

            const result = response.data
            this.displayResult(result)
            
            console.log('✅ 블로그 생성 완료:', result.model)

        } catch (error) {
            console.error('❌ 블로그 생성 실패:', error)
            this.showError('블로그 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
        } finally {
            this.setLoadingState(false)
        }
    }

    async generateSEOBlog() {
        const topic = this.topicInput?.value?.trim()
        if (!topic) {
            this.showError('주제를 입력해주세요.')
            return
        }

        const audience = this.audienceSelect?.value || '일반인'
        const tone = this.toneSelect?.value || '친근한'
        const aiModel = this.aiModelSelect?.value || 'claude'

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
                this.showError(`SEO 최적화를 위해서는 ${aiModel.toUpperCase()} API 키가 필요합니다. 서버에 구성된 키가 있거나 개별 API 키를 입력해주세요.`)
                this.setSeoLoadingState(false)
                return
            }

            console.log(`🔍 SEO 최적화 ${aiModel} 모델로 블로그 생성 시작...`)
            console.log(`📝 주제: ${topic}`)
            console.log(`👥 대상: ${audience}`)
            console.log(`🎨 톤: ${tone}`)
            console.log(`🎯 SEO 옵션:`, seoOptions)

            const response = await axios.post('/api/generate-seo', {
                topic,
                audience,
                tone,
                aiModel,
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
        const topic = this.topicInput?.value?.trim()
        if (!topic) {
            this.showError('주제를 입력해주세요.')
            return
        }

        const audience = this.audienceSelect?.value || '일반인'
        const tone = this.toneSelect?.value || '친근한'
        const aiModel = this.aiModelSelect?.value || 'auto'

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
        
        if (aiModel === 'claude' || aiModel === 'auto') {
            apiKey = this.claudeApiKeyInput?.value || ''
            hasServerKey = this.serverApiKeys?.claude
            if (!apiKey && hasServerKey) {
                console.log('🔑 Claude 서버 API 키 사용 (QA)')
            }
        } else if (aiModel === 'gemini') {
            apiKey = this.geminiApiKeyInput?.value || ''
            hasServerKey = this.serverApiKeys?.gemini
            if (!apiKey && hasServerKey) {
                console.log('🔑 Gemini 서버 API 키 사용 (QA)')
            }
        } else if (aiModel === 'openai') {
            apiKey = this.openaiApiKeyInput?.value || ''
            hasServerKey = this.serverApiKeys?.openai
            if (!apiKey && hasServerKey) {
                console.log('🔑 OpenAI 서버 API 키 사용 (QA)')
            }
        } else if (aiModel === 'grok') {
            apiKey = this.grokApiKeyInput?.value || ''
            hasServerKey = this.serverApiKeys?.grok
            if (!apiKey && hasServerKey) {
                console.log('🔑 GROK 서버 API 키 사용 (QA)')
            }
        }

        // auto 모드일 때는 서버 키 중에서 사용 가능한 것 확인
        if (aiModel === 'auto') {
            hasServerKey = this.serverApiKeys?.claude || this.serverApiKeys?.gemini || 
                          this.serverApiKeys?.openai || this.serverApiKeys?.grok
        }

        if (!apiKey && !hasServerKey) {
            this.showError('품질 검증 시스템을 위해서는 API 키가 필요합니다. 서버에 구성된 키가 있거나 개별 API 키를 입력해주세요.')
            return
        }

        // 로딩 상태 표시
        this.setQALoadingState(true)
        this.showQAProgress()
        
        try {
            console.log(`🛡️ 품질 검증 ${aiModel} 모델로 블로그 생성 시작...`)
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
                aiModel,
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
            
            if (error.response?.data?.message) {
                this.showError(error.response.data.message)
            } else {
                this.showError('품질 검증 시스템에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
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
        if (!this.resultSection || !this.contentDiv || !this.generationInfo) {
            console.error('결과 표시 요소를 찾을 수 없습니다.')
            return
        }

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
        this.contentDiv.innerHTML = this.markdownToHtml(result.content)

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

    setLoadingState(isLoading) {
        if (this.generateBtn) {
            if (isLoading) {
                this.generateBtn.disabled = true
                this.generateBtn.innerHTML = `
                    <i class="fas fa-spinner fa-spin mr-2"></i>
                    생성 중...
                `
                this.generateBtn.classList.add('opacity-70')
            } else {
                this.generateBtn.disabled = false
                this.generateBtn.innerHTML = `
                    <i class="fas fa-magic mr-2"></i>
                    블로그 글 생성하기
                `
                this.generateBtn.classList.remove('opacity-70')
            }
        }
    }

    displayResult(result) {
        if (!this.resultSection || !this.contentDiv || !this.generationInfo) {
            console.error('결과 표시 요소를 찾을 수 없습니다.')
            return
        }

        // 결과 섹션 표시
        this.resultSection.classList.remove('hidden')
        // SEO 분석 섹션 숨김 (일반 모드)
        if (this.seoAnalysisSection) {
            this.seoAnalysisSection.classList.add('hidden')
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
        this.contentDiv.innerHTML = this.markdownToHtml(result.content)

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
        if (!this.contentDiv) return

        const content = this.contentDiv.textContent || this.contentDiv.innerText
        
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
}

// ==================== 초기화 ====================

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 블로그 생성기 초기화
    window.blogGenerator = new BlogGenerator()
    
    console.log('📱 AI 블로그 생성기 v3.0 시작!')
    console.log('✨ 기능: 품질 검증 시스템 + SEO 최적화')
    console.log('🤖 지원 모델: Claude, Gemini, OpenAI')
    console.log('🛡️ 신기능: 3단계 품질 검증 프로세스')
})

// 전역 함수로 내보내기 (디버깅용)
window.BlogGenerator = BlogGenerator