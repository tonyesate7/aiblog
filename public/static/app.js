// ==================== AI 블로그 생성기 v3.0 ====================
// 품질 검증 시스템(QA System) 포함 고급 버전

class BlogGenerator {
    constructor() {
        this.initializeElements()
        this.attachEventListeners()
        this.loadApiKeys()
        this.checkApiKeyStatus()
        
        console.log('🚀 AI 블로그 생성기 v3.0 초기화 완료')
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

        // API 키 입력 시 자동 저장
        const apiKeyInputs = [this.claudeApiKeyInput, this.geminiApiKeyInput, this.openaiApiKeyInput]
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
                openai: this.openaiApiKeyInput?.value || ''
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
            
            // 환경변수에 설정된 키가 있으면 표시
            if (status.claude || status.gemini || status.openai) {
                const configuredKeys = []
                if (status.claude) configuredKeys.push('Claude')
                if (status.gemini) configuredKeys.push('Gemini')
                if (status.openai) configuredKeys.push('OpenAI')
                
                console.log(`✅ 서버에 구성된 API 키: ${configuredKeys.join(', ')}`)
            }
            
        } catch (error) {
            console.error('API 키 상태 확인 실패:', error)
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
            // API 키 가져오기
            let apiKey = ''
            if (aiModel === 'claude') {
                apiKey = this.claudeApiKeyInput?.value || ''
            } else if (aiModel === 'gemini') {
                apiKey = this.geminiApiKeyInput?.value || ''
            } else if (aiModel === 'openai') {
                apiKey = this.openaiApiKeyInput?.value || ''
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
            // API 키 가져오기
            let apiKey = ''
            if (aiModel === 'claude') {
                apiKey = this.claudeApiKeyInput?.value || ''
            } else if (aiModel === 'gemini') {
                apiKey = this.geminiApiKeyInput?.value || ''
            } else if (aiModel === 'openai') {
                apiKey = this.openaiApiKeyInput?.value || ''
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

        // API 키 체크
        let apiKey = ''
        if (aiModel === 'claude' || aiModel === 'auto') {
            apiKey = this.claudeApiKeyInput?.value || ''
        } else if (aiModel === 'gemini') {
            apiKey = this.geminiApiKeyInput?.value || ''
        } else if (aiModel === 'openai') {
            apiKey = this.openaiApiKeyInput?.value || ''
        }

        if (!apiKey && aiModel !== 'auto') {
            this.showError('품질 검증 시스템을 위해서는 API 키가 필요합니다.')
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