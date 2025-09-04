// 블로그 자동 생성기 클라이언트 JavaScript

class BlogGenerator {
    constructor() {
        this.generatedArticles = [];
        this.currentProgress = 0;
        this.totalArticles = 10;
        this.environmentAlertShown = false; // 환경 변수 알림 중복 방지
        this.demoWarningShown = false; // 데모 모드 경고 중복 방지
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSettings();
        this.loadFromLocalStorage();
        this.checkApiKeyStatus();
    }

    bindEvents() {
        // 서브 키워드 생성
        const generateSubKeywordsBtn = document.getElementById('generateSubKeywords');
        if (generateSubKeywordsBtn) {
            generateSubKeywordsBtn.addEventListener('click', () => {
                this.generateSubKeywords();
            });
        }

        // 블로그 글 생성 시작
        const startGenerationBtn = document.getElementById('startGeneration');
        if (startGenerationBtn) {
            startGenerationBtn.addEventListener('click', () => {
                this.startBlogGeneration();
            });
        }

        // 파일 다운로드
        const downloadPDFBtn = document.getElementById('downloadPDF');
        if (downloadPDFBtn) {
            downloadPDFBtn.addEventListener('click', () => {
                this.downloadPDF();
            });
        }

        const downloadWordBtn = document.getElementById('downloadWord');
        if (downloadWordBtn) {
            downloadWordBtn.addEventListener('click', () => {
                this.downloadWord();
            });
        }

        const downloadIndividualBtn = document.getElementById('downloadIndividual');
        if (downloadIndividualBtn) {
            downloadIndividualBtn.addEventListener('click', () => {
                this.downloadIndividualFiles();
            });
        }

        const downloadMarkdownBtn = document.getElementById('downloadMarkdown');
        if (downloadMarkdownBtn) {
            downloadMarkdownBtn.addEventListener('click', () => {
                this.downloadMarkdown();
            });
        }

        // 추가 기능 버튼들
        const selectAllBtn = document.getElementById('selectAllArticles');
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => {
                this.selectAllArticles();
            });
        }

        const saveProjectBtn = document.getElementById('saveProject');
        if (saveProjectBtn) {
            saveProjectBtn.addEventListener('click', () => {
                this.saveProject();
            });
        }

        const clearAllBtn = document.getElementById('clearAll');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                this.clearAllArticles();
            });
        }

        // SEO 분석 버튼
        const refreshSeoBtn = document.getElementById('refreshSeoAnalysis');
        if (refreshSeoBtn) {
            refreshSeoBtn.addEventListener('click', () => {
                this.analyzeSEO();
            });
        }

        // 품질 분석 버튼
        const refreshQualityBtn = document.getElementById('refreshQualityAnalysis');
        if (refreshQualityBtn) {
            refreshQualityBtn.addEventListener('click', () => {
                this.analyzeQuality();
            });
        }

        // =========================== 새로운 3가지 우선 기능 이벤트 핸들러 ===========================
        
        // 1. 스마트 키워드 추천 기능
        const showSmartSuggestionsBtn = document.getElementById('showSmartSuggestions');
        if (showSmartSuggestionsBtn) {
            showSmartSuggestionsBtn.addEventListener('click', () => {
                this.toggleSmartKeywordSuggestions();
            });
        }
        
        const closeSmartSuggestionsBtn = document.getElementById('closeSmartSuggestions');
        if (closeSmartSuggestionsBtn) {
            closeSmartSuggestionsBtn.addEventListener('click', () => {
                document.getElementById('smartSuggestionsPanel').style.display = 'none';
            });
        }
        
        // 스마트 키워드 추천 타입별 버튼
        const getTrendingBtn = document.getElementById('getTrendingKeywords');
        if (getTrendingBtn) {
            getTrendingBtn.addEventListener('click', () => {
                this.getSmartKeywordSuggestions('trending');
            });
        }
        
        const getRelatedBtn = document.getElementById('getRelatedKeywords');
        if (getRelatedBtn) {
            getRelatedBtn.addEventListener('click', () => {
                this.getSmartKeywordSuggestions('related');
            });
        }
        
        const getQuestionBtn = document.getElementById('getQuestionKeywords');
        if (getQuestionBtn) {
            getQuestionBtn.addEventListener('click', () => {
                this.getSmartKeywordSuggestions('questions');
            });
        }
        
        const getLongtailBtn = document.getElementById('getLongtailKeywords');
        if (getLongtailBtn) {
            getLongtailBtn.addEventListener('click', () => {
                this.getSmartKeywordSuggestions('longtail');
            });
        }
        
        // 2. 배치 생성 기능
        const startBatchBtn = document.getElementById('startBatchGeneration');
        if (startBatchBtn) {
            startBatchBtn.addEventListener('click', () => {
                this.showBatchGenerationModal();
            });
        }
        
        const closeBatchBtn = document.getElementById('closeBatchModal');
        if (closeBatchBtn) {
            closeBatchBtn.addEventListener('click', () => {
                document.getElementById('batchGeneratorModal').style.display = 'none';
            });
        }
        
        const confirmBatchBtn = document.getElementById('confirmBatchGeneration');
        if (confirmBatchBtn) {
            confirmBatchBtn.addEventListener('click', () => {
                this.confirmBatchGeneration();
            });
        }
        
        // 3. 콘텐츠 자동 개선 기능
        const startContentBtn = document.getElementById('startContentImprovement');
        if (startContentBtn) {
            startContentBtn.addEventListener('click', () => {
                this.showContentImprovementModal();
            });
        }
        
        const closeImprovementBtn = document.getElementById('closeImprovementModal');
        if (closeImprovementBtn) {
            closeImprovementBtn.addEventListener('click', () => {
                document.getElementById('contentImprovementModal').style.display = 'none';
            });
        }
        
        const confirmContentBtn = document.getElementById('confirmContentImprovement');
        if (confirmContentBtn) {
            confirmContentBtn.addEventListener('click', () => {
                this.confirmContentImprovement();
            });
        }

        // 프로젝트 관리 모달
        const showProjectBtn = document.getElementById('showProjectModal');
        if (showProjectBtn) {
            showProjectBtn.addEventListener('click', () => {
                this.showProjectModal();
            });
        }

        const closeProjectBtn = document.getElementById('closeProject');
        if (closeProjectBtn) {
            closeProjectBtn.addEventListener('click', () => {
                this.hideProjectModal();
            });
        }

        // 탭 전환
        const saveTabBtn = document.getElementById('saveTab');
        if (saveTabBtn) {
            saveTabBtn.addEventListener('click', () => this.switchTab('save'));
        }
        
        const loadTabBtn = document.getElementById('loadTab');
        if (loadTabBtn) {
            loadTabBtn.addEventListener('click', () => this.switchTab('load'));
        }
        
        const presetsTabBtn = document.getElementById('presetsTab');
        if (presetsTabBtn) {
            presetsTabBtn.addEventListener('click', () => this.switchTab('presets'));
        }
        
        const keywordsTabBtn = document.getElementById('keywordsTab');
        if (keywordsTabBtn) {
            keywordsTabBtn.addEventListener('click', () => this.switchTab('keywords'));
        }

        // 프로젝트 저장/불러오기
        const saveProjectBtnModal = document.getElementById('saveProjectBtn');
        if (saveProjectBtnModal) {
            saveProjectBtnModal.addEventListener('click', () => {
                this.saveCurrentProject();
            });
        }

        const exportProjectBtn = document.getElementById('exportProject');
        if (exportProjectBtn) {
            exportProjectBtn.addEventListener('click', () => {
                this.exportProjectAsJSON();
            });
        }

        const importProjectBtn = document.getElementById('importProject');
        if (importProjectBtn) {
            importProjectBtn.addEventListener('click', () => {
                const importFile = document.getElementById('importFile');
                if (importFile) {
                    importFile.click();
                }
            });
        }

        const importFileInput = document.getElementById('importFile');
        if (importFileInput) {
            importFileInput.addEventListener('change', (e) => {
                this.importProjectFromFile(e);
            });
        }

        // 프리셋 관리
        const savePresetBtn = document.getElementById('savePreset');
        if (savePresetBtn) {
            savePresetBtn.addEventListener('click', () => {
                this.saveCurrentPreset();
            });
        }

        // 즐겨찾기 키워드
        const addFavoriteBtn = document.getElementById('addFavoriteKeyword');
        if (addFavoriteBtn) {
            addFavoriteBtn.addEventListener('click', () => {
                this.addFavoriteKeyword();
            });
        }

        const newFavoriteInput = document.getElementById('newFavoriteKeyword');
        if (newFavoriteInput) {
            newFavoriteInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addFavoriteKeyword();
                }
            });
        }


        
        // 배치 생성 모달 외부 클릭시 닫기
        const batchModal = document.getElementById('batchGeneratorModal');
        if (batchModal) {
            batchModal.addEventListener('click', (e) => {
                if (e.target.id === 'batchGeneratorModal') {
                    document.getElementById('batchGeneratorModal').style.display = 'none';
                }
            });
        }
        
        // 콘텐츠 개선 모달 외부 클릭시 닫기
        const contentModal = document.getElementById('contentImprovementModal');
        if (contentModal) {
            contentModal.addEventListener('click', (e) => {
                if (e.target.id === 'contentImprovementModal') {
                    document.getElementById('contentImprovementModal').style.display = 'none';
                }
            });
        }
        
        // 배치 설정 변경 시 예상 시간 업데이트
        const batchCountInput = document.getElementById('batchArticleCount');
        if (batchCountInput) {
            batchCountInput.addEventListener('input', () => {
                this.updateBatchTimeEstimate();
            });
        }
        
        const batchConcurrencyInput = document.getElementById('batchConcurrency');
        if (batchConcurrencyInput) {
            batchConcurrencyInput.addEventListener('input', () => {
                this.updateBatchTimeEstimate();
            });
        }
        
        const batchDelayInput = document.getElementById('batchDelay');
        if (batchDelayInput) {
            batchDelayInput.addEventListener('input', () => {
                this.updateBatchTimeEstimate();
            });
        }
    }

    async generateSubKeywords() {
        const mainKeyword = document.getElementById('mainKeyword').value.trim();
        
        if (!mainKeyword) {
            this.showAlert('메인 키워드를 입력해주세요.', 'error');
            return;
        }

        const button = document.getElementById('generateSubKeywords');
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>AI가 키워드 생성 중...';
        button.disabled = true;

        try {
            const response = await axios.post('/api/generate-subkeywords', {
                mainKeyword: mainKeyword,
                contentStyle: document.getElementById('contentStyle').value,
                targetAudience: document.getElementById('targetAudience').value
            });

            if (response.data.success) {
                this.displaySubKeywords(response.data.keywords);
                document.getElementById('subKeywordsSection').style.display = 'block';
                document.getElementById('subKeywordsSection').scrollIntoView({ behavior: 'smooth' });
                this.showAlert('서브 키워드가 성공적으로 생성되었습니다!', 'success');
            } else {
                this.showAlert('키워드 생성에 실패했습니다: ' + response.data.error, 'error');
            }
        } catch (error) {
            console.error('키워드 생성 오류:', error);
            this.showAlert('키워드 생성 중 오류가 발생했습니다. API 키를 확인해주세요.', 'error');
        } finally {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }

    generateDummySubKeywords(mainKeyword) {
        // 임시 서브 키워드 생성 로직
        const templates = [
            `${mainKeyword} 기초`,
            `${mainKeyword} 고급 팁`,
            `${mainKeyword} 추천`,
            `${mainKeyword} 비교`,
            `${mainKeyword} 가격`,
            `${mainKeyword} 후기`,
            `${mainKeyword} 방법`,
            `${mainKeyword} 장단점`,
            `${mainKeyword} 트렌드`,
            `${mainKeyword} 예시`
        ];

        return templates.map((template, index) => ({
            id: index + 1,
            keyword: template,
            editable: true
        }));
    }

    displaySubKeywords(keywords) {
        const container = document.getElementById('subKeywordsList');
        container.innerHTML = '';

        keywords.forEach((item) => {
            const keywordDiv = document.createElement('div');
            keywordDiv.className = 'bg-gray-100 hover:bg-gray-200 p-3 rounded-lg cursor-pointer transition';
            keywordDiv.innerHTML = `
                <div class="flex items-center justify-between">
                    <span class="text-sm font-medium">${item.keyword}</span>
                    <i class="fas fa-edit text-gray-400 text-xs"></i>
                </div>
            `;
            
            // 클릭하여 편집 가능
            keywordDiv.addEventListener('click', () => {
                this.editKeyword(keywordDiv, item);
            });

            container.appendChild(keywordDiv);
        });
    }

    editKeyword(element, item) {
        const currentText = item.keyword;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'w-full px-2 py-1 border border-blue-500 rounded text-sm';
        
        element.innerHTML = '';
        element.appendChild(input);
        input.focus();
        input.select();

        const saveEdit = () => {
            const newValue = input.value.trim();
            if (newValue) {
                item.keyword = newValue;
                element.innerHTML = `
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-medium">${newValue}</span>
                        <i class="fas fa-edit text-gray-400 text-xs"></i>
                    </div>
                `;
            } else {
                // 빈 값이면 원래대로 복원
                element.innerHTML = `
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-medium">${currentText}</span>
                        <i class="fas fa-edit text-gray-400 text-xs"></i>
                    </div>
                `;
            }
        };

        input.addEventListener('blur', saveEdit);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveEdit();
            }
        });
    }

    startBlogGeneration() {

        const keywords = this.getSubKeywords();
        if (keywords.length === 0) {
            this.showAlert('서브 키워드를 먼저 생성해주세요.', 'error');
            return;
        }

        document.getElementById('progressSection').style.display = 'block';
        document.getElementById('progressSection').scrollIntoView({ behavior: 'smooth' });
        
        this.currentProgress = 0;
        this.generatedArticles = [];
        this.startTime = Date.now(); // 시작 시간 기록
        this.updateProgress();
        this.initProgressList(keywords);

        // 순차적으로 글 생성 (실제로는 병렬 처리 가능)
        this.generateArticlesSequentially(keywords, 0);
    }

    getSubKeywords() {
        const keywordElements = document.querySelectorAll('#subKeywordsList > div span');
        return Array.from(keywordElements).map(el => el.textContent);
    }

    initProgressList(keywords) {
        const container = document.getElementById('progressList');
        container.innerHTML = '';

        keywords.forEach((keyword, index) => {
            const progressItem = document.createElement('div');
            progressItem.id = `progress-${index}`;
            progressItem.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg';
            progressItem.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-clock text-gray-400 mr-3"></i>
                    <span class="text-sm">${keyword}</span>
                </div>
                <span class="text-xs text-gray-500">대기중</span>
            `;
            container.appendChild(progressItem);
        });
    }

    async generateArticlesSequentially(keywords, index) {
        if (index >= keywords.length) {
            // 모든 글 생성 완료
            console.log(`🎉 전체 생성 완료! 성공: ${this.generatedArticles.length}/${keywords.length}개`);
            
            this.showResults();
            
            // 진행 상태 숨기고 결과 표시
            document.getElementById('progressSection').style.display = 'none';
            
            // SEO 분석 실행
            setTimeout(() => {
                this.analyzeSEO();
            }, 1000);
            
            // 품질 분석 실행
            setTimeout(() => {
                this.analyzeQuality();
            }, 1500);
            
            // 완료 메시지를 더 눈에 띄게 표시
            const successMessage = `🎉 블로그 글 생성이 완료되었습니다!\n\n✅ 성공: ${this.generatedArticles.length}/${keywords.length}개\n⏱️ 소요시간: ${Math.round((Date.now() - this.startTime) / 1000)}초\n\n이제 아래 생성된 글들의 관리 버튼을 사용할 수 있습니다.`;
            
            alert(successMessage); // 알럿 대화상자
            this.showAlert(`블로그 글 생성이 완료되었습니다! (${this.generatedArticles.length}/${keywords.length}개 성공)`, 'success');
            return;
        }

        const keyword = keywords[index];
        this.updateProgressItem(index, 'generating');

        const mainKeyword = document.getElementById('mainKeyword').value.trim();
        const contentStyle = document.getElementById('contentStyle').value;
        const contentLength = document.getElementById('contentLength').value;
        const targetAudience = document.getElementById('targetAudience').value;

        try {
            console.log(`📝 글 생성 시작: "${keyword}" (${index + 1}/${keywords.length})`);
            
            // API 키를 로컬 스토리지에서 가져오기
            const claudeKey = localStorage.getItem('claude_api_key');
            const openaiKey = localStorage.getItem('openai_api_key');
            const geminiKey = localStorage.getItem('gemini_api_key');
            
            // 타임아웃 설정 (30초)
            const response = await axios.post('/api/generate-article', {
                keyword: keyword,
                mainKeyword: mainKeyword,
                contentStyle: contentStyle,
                contentLength: contentLength,
                targetAudience: targetAudience
            }, {
                timeout: 30000, // 30초 타임아웃
                headers: {
                    'X-Claude-API-Key': claudeKey || '',
                    'X-OpenAI-API-Key': openaiKey || '',
                    'X-Gemini-API-Key': geminiKey || ''
                }
            });

            if (response.data.success) {
                const article = {
                    ...response.data.article,
                    id: index + 1
                };
                
                // 데모 모드인지 확인
                if (response.data.demoMode) {
                    console.log(`⚠️ 데모 모드로 생성: "${keyword}" - API 키 설정 필요`);
                    this.updateProgressItem(index, 'demo');
                    
                    // 데모 모드 경고 메시지 (한 번만 표시)
                    if (!this.demoWarningShown) {
                        this.showAlert(response.data.message + '\n\n설정에서 API 키를 입력하면 실제 AI 생성을 사용할 수 있습니다.', 'warning');
                        this.demoWarningShown = true;
                    }
                } else {
                    console.log(`✅ AI 생성 완료: "${keyword}" (${this.generatedArticles.length + 1}/${keywords.length})`);
                    this.updateProgressItem(index, 'completed');
                }
                
                this.generatedArticles.push(article);
            } else {
                this.updateProgressItem(index, 'error');
                console.error(`❌ 글 생성 실패: "${keyword}" -`, response.data.error);
                // 실패한 경우에도 계속 진행
            }
        } catch (error) {
            console.error(`❌ 글 생성 오류: "${keyword}" -`, error.message);
            this.updateProgressItem(index, 'error');
            
            // 타임아웃이나 네트워크 오류 시 사용자에게 알림
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                this.showAlert(`"${keyword}" 글 생성 시간이 초과되었습니다. 계속 진행합니다.`, 'warning');
            }
        }

        this.currentProgress++;
        this.updateProgress();

        // 다음 글 생성 (1초 지연으로 API 부하 감소)
        setTimeout(() => {
            console.log(`⏭️ 다음 글 생성 준비: ${index + 2}/${keywords.length}`);
            this.generateArticlesSequentially(keywords, index + 1);
        }, 1000);
    }

    updateProgressItem(index, status) {
        const item = document.getElementById(`progress-${index}`);
        const icon = item.querySelector('i');
        const statusText = item.querySelector('span:last-child');

        switch (status) {
            case 'generating':
                icon.className = 'fas fa-spinner fa-spin text-blue-500 mr-3';
                statusText.textContent = 'AI 생성중...';
                statusText.className = 'text-xs text-blue-500';
                break;
            case 'completed':
                icon.className = 'fas fa-check-circle text-green-500 mr-3';
                statusText.textContent = '완료';
                statusText.className = 'text-xs text-green-500';
                break;
            case 'demo':
                icon.className = 'fas fa-exclamation-triangle text-orange-500 mr-3';
                statusText.textContent = '데모 완료 (API키 필요)';
                statusText.className = 'text-xs text-orange-500';
                break;
            case 'error':
                icon.className = 'fas fa-times-circle text-red-500 mr-3';
                statusText.textContent = '오류';
                statusText.className = 'text-xs text-red-500';
                break;
        }
    }

    updateProgress() {
        const totalKeywords = this.getSubKeywords().length || this.totalArticles;
        const percentage = (this.currentProgress / totalKeywords) * 100;
        document.getElementById('progressBar').style.width = `${percentage}%`;
        document.getElementById('progressText').textContent = `${this.currentProgress}/${totalKeywords}`;
        
        console.log(`📊 진행률: ${this.currentProgress}/${totalKeywords} (${Math.round(percentage)}%)`);
    }

    // 🎨 레거시 이미지 생성 함수 (호환성 유지)
    async generateImageForArticle(articleId, keyword, title, content) {
        // 새로운 API 기반 함수로 리디렉션
        return await this.generateArticleImage(articleId);
    }

    generateDummyArticle(keyword, index) {
        const contentStyle = document.getElementById('contentStyle').value;
        const contentLength = document.getElementById('contentLength').value;
        const targetAudience = document.getElementById('targetAudience').value;

        return {
            id: index,
            title: `${keyword}에 대한 완벽한 가이드`,
            keyword: keyword,
            content: `이것은 "${keyword}"에 대한 ${contentStyle} 스타일의 글입니다. 

${targetAudience}을 대상으로 작성된 이 글은 약 ${contentLength}자 분량으로 구성되어 있습니다.

## 주요 내용

1. ${keyword}의 기본 개념
2. ${keyword}의 중요성과 필요성
3. ${keyword} 활용 방법
4. ${keyword}의 장점과 단점
5. ${keyword} 관련 팁과 노하우

## 결론

${keyword}에 대해 자세히 알아보았습니다. 이 정보가 여러분에게 도움이 되었기를 바랍니다.

---

※ 이것은 AI가 생성한 샘플 콘텐츠입니다. 실제 서비스에서는 더 상세하고 품질 높은 내용이 생성됩니다.`,
            wordCount: parseInt(contentLength),
            createdAt: new Date().toISOString()
        };
    }

    showResults() {
        console.log('📋 showResults() 호출됨, 글 개수:', this.generatedArticles.length);
        document.getElementById('resultsSection').style.display = 'block';
        document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
        
        const container = document.getElementById('generatedContent');
        container.innerHTML = '';

        this.generatedArticles.forEach((article, index) => {
            const articleDiv = document.createElement('div');
            articleDiv.className = `border border-gray-200 rounded-lg p-4 ${article.modified ? 'article-modified' : ''}`;
            articleDiv.id = `article-${article.id}`;
            
            const wordCount = article.content.replace(/<[^>]*>/g, '').replace(/[#*\-_]/g, '').length;
            
            articleDiv.innerHTML = `
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2">
                        <h3 id="title-${article.id}" class="text-lg font-bold text-gray-800">${article.title}</h3>
                        ${article.modified ? '<span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs"><i class="fas fa-edit mr-1"></i>수정됨</span>' : ''}
                    </div>
                    <div class="flex items-center text-sm text-gray-500">
                        <i class="fas fa-file-alt mr-1"></i>
                        <span id="wordcount-${article.id}">${wordCount}자</span>
                    </div>
                </div>
                <div class="text-sm text-gray-600 mb-3">
                    <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        ${article.keyword}
                    </span>
                    <span class="text-xs text-gray-400 ml-2">
                        생성: ${new Date(article.createdAt).toLocaleDateString('ko-KR')}
                        ${article.modifiedAt ? ` | 수정: ${new Date(article.modifiedAt).toLocaleDateString('ko-KR')}` : ''}
                    </span>
                </div>
                
                <!-- 읽기 모드 -->
                <div id="read-mode-${article.id}" class="read-mode">
                    <!-- 이미지 표시 (이미지가 있는 경우) -->
                    ${article.image ? `
                        <div class="mb-4">
                            <img src="${article.image.url}" alt="${article.image.keyword || article.keyword}" 
                                 class="w-full max-w-md mx-auto rounded-lg shadow-sm"
                                 loading="lazy">
                            <div class="text-xs text-center mt-2">
                                ${article.image.isProfessionalPhoto ? `
                                    <div class="inline-flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                                        <i class="fas fa-camera mr-1"></i>고품질 전문 사진
                                        <span class="ml-1 text-blue-500">• ${article.image.resolution}</span>
                                    </div>
                                ` : `
                                    <div class="text-gray-500">
                                        <i class="fas fa-image mr-1"></i>${article.image.keyword}
                                        ${article.image.source ? ` | ${article.image.source}` : ''}
                                    </div>
                                `}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="prose prose-sm max-w-none" id="content-display-${article.id}">
                        ${this.markdownToHtml(article.content)}
                    </div>
                </div>
                
                <!-- 편집 모드 -->
                <div id="edit-mode-${article.id}" class="edit-mode article-editor" style="display: none;">
                    <div class="edit-toolbar">
                        <button class="toolbar-btn active" onclick="blogGenerator.switchEditView(${article.id}, 'edit')">
                            <i class="fas fa-edit"></i> 편집
                        </button>
                        <button class="toolbar-btn" onclick="blogGenerator.switchEditView(${article.id}, 'preview')">
                            <i class="fas fa-eye"></i> 미리보기
                        </button>
                        <button class="toolbar-btn" onclick="blogGenerator.switchEditView(${article.id}, 'split')">
                            <i class="fas fa-columns"></i> 분할
                        </button>
                        <div style="margin-left: auto;">
                            <button class="toolbar-btn" onclick="blogGenerator.insertMarkdown(${article.id}, 'bold')">
                                <i class="fas fa-bold"></i>
                            </button>
                            <button class="toolbar-btn" onclick="blogGenerator.insertMarkdown(${article.id}, 'italic')">
                                <i class="fas fa-italic"></i>
                            </button>
                            <button class="toolbar-btn" onclick="blogGenerator.insertMarkdown(${article.id}, 'heading')">
                                <i class="fas fa-heading"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <input type="text" id="title-input-${article.id}" value="${article.title}" 
                               placeholder="제목을 입력하세요"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg font-semibold text-lg"
                               onchange="blogGenerator.updateTitle(${article.id})">
                    </div>
                    
                    <div id="editor-container-${article.id}">
                        <!-- 편집 전용 -->
                        <div id="edit-only-${article.id}">
                            <textarea id="content-textarea-${article.id}" class="editor-textarea" 
                                      placeholder="마크다운 형식으로 내용을 작성하세요..."
                                      oninput="blogGenerator.autoSave(${article.id})">${article.content}</textarea>
                        </div>
                        
                        <!-- 미리보기 전용 -->
                        <div id="preview-only-${article.id}" style="display: none;">
                            <div class="editor-preview" id="preview-${article.id}">
                                ${this.markdownToHtml(article.content)}
                            </div>
                        </div>
                        
                        <!-- 분할 보기 -->
                        <div id="split-view-${article.id}" style="display: none;" class="grid grid-cols-2 gap-4">
                            <div>
                                <h4 class="text-sm font-medium text-gray-700 mb-2">편집</h4>
                                <textarea id="content-textarea-split-${article.id}" class="editor-textarea" 
                                          oninput="blogGenerator.updateSplitPreview(${article.id})">${article.content}</textarea>
                            </div>
                            <div>
                                <h4 class="text-sm font-medium text-gray-700 mb-2">미리보기</h4>
                                <div class="editor-preview" id="preview-split-${article.id}">
                                    ${this.markdownToHtml(article.content)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <div class="flex gap-2">
                        <button id="edit-btn-${article.id}" onclick="blogGenerator.toggleEdit(${article.id})" 
                                class="text-blue-600 hover:text-blue-800 text-sm transition">
                            <i class="fas fa-edit mr-1"></i>편집
                        </button>
                        <button onclick="blogGenerator.generateArticleImage('${article.id}')" 
                                class="text-purple-600 hover:text-purple-800 text-sm transition ${article.image ? 'opacity-50' : ''}"
                                ${article.image ? 'title="이미 고품질 사진이 있습니다"' : 'title="고품질 전문 사진 생성"'}>
                            <i class="fas fa-camera mr-1"></i>전문 사진 생성
                        </button>
                        <button onclick="blogGenerator.duplicateArticle('${article.id}')" 
                                class="text-green-600 hover:text-green-800 text-sm transition">
                            <i class="fas fa-copy mr-1"></i>복제
                        </button>
                        <button onclick="blogGenerator.deleteArticle('${article.id}')" 
                                class="text-red-600 hover:text-red-800 text-sm transition">
                            <i class="fas fa-trash mr-1"></i>삭제
                        </button>
                    </div>
                    <div class="text-xs text-gray-400 flex items-center gap-2">
                        ${article.image ? '<i class="fas fa-image text-purple-500" title="이미지 포함"></i>' : ''}
                        ${article.modified ? '<i class="fas fa-edit text-yellow-500" title="수정됨"></i>' : ''}
                        ${article.isDuplicate ? '<i class="fas fa-copy text-green-500" title="복사본"></i>' : ''}
                        <span>ID: ${article.id}</span>
                    </div>
                </div>
            `;
            container.appendChild(articleDiv);
        });

        console.log('✅ showResults() 완료, HTML 생성된 글 개수:', this.generatedArticles.length);
        this.showAlert('모든 블로그 글 생성이 완료되었습니다!', 'success');
    }

    toggleEdit(articleId) {
        console.log('✏️ toggleEdit() 호출됨, articleId:', articleId);
        
        const readMode = document.getElementById(`read-mode-${articleId}`);
        const editMode = document.getElementById(`edit-mode-${articleId}`);
        const editBtn = document.getElementById(`edit-btn-${articleId}`);
        
        console.log('📊 DOM 요소 확인:', { 
            readMode: !!readMode, 
            editMode: !!editMode, 
            editBtn: !!editBtn 
        });
        
        if (editMode.style.display === 'none') {
            // 편집 모드로 전환
            readMode.style.display = 'none';
            editMode.style.display = 'block';
            editBtn.innerHTML = '<i class="fas fa-save mr-1"></i>저장';
            editBtn.onclick = () => this.saveEdit(articleId);
            
            // 현재 편집 뷰 설정 (기본: 분할 보기)
            this.switchEditView(articleId, 'split');
        } else {
            // 읽기 모드로 전환 (저장)
            this.saveEdit(articleId);
        }
    }

    saveEdit(articleId) {
        const article = this.generatedArticles.find(a => a.id === articleId);
        if (!article) return;

        const titleInput = document.getElementById(`title-input-${articleId}`);
        const contentTextarea = document.getElementById(`content-textarea-${articleId}`) || 
                                document.getElementById(`content-textarea-split-${articleId}`);
        
        const newTitle = titleInput.value.trim();
        const newContent = contentTextarea.value.trim();

        if (!newTitle || !newContent) {
            this.showAlert('제목과 내용을 모두 입력해주세요.', 'error');
            return;
        }

        // 변경사항 확인
        const titleChanged = article.title !== newTitle;
        const contentChanged = article.content !== newContent;

        if (titleChanged || contentChanged) {
            // 변경사항 저장
            article.title = newTitle;
            article.content = newContent;
            article.modified = true;
            article.modifiedAt = new Date().toISOString();
            
            // 글자 수 업데이트
            article.wordCount = newContent.replace(/<[^>]*>/g, '').replace(/[#*\-_]/g, '').length;

            // 로컬 스토리지에 저장
            this.saveToLocalStorage();

            this.showAlert('변경사항이 저장되었습니다! ✅', 'success');
        }

        // UI 업데이트
        this.updateArticleDisplay(articleId);
        
        // 읽기 모드로 전환
        const readMode = document.getElementById(`read-mode-${articleId}`);
        const editMode = document.getElementById(`edit-mode-${articleId}`);
        const editBtn = document.getElementById(`edit-btn-${articleId}`);
        
        readMode.style.display = 'block';
        editMode.style.display = 'none';
        editBtn.innerHTML = '<i class="fas fa-edit mr-1"></i>편집';
        editBtn.onclick = () => this.toggleEdit(articleId);
        
        // SEO 분석 업데이트 (편집 완료 후)
        if (document.getElementById('seoAnalysisSection').style.display !== 'none') {
            setTimeout(() => this.analyzeSEO(), 500);
        }
    }

    updateArticleDisplay(articleId) {
        const article = this.generatedArticles.find(a => a.id === articleId);
        if (!article) return;

        // 제목 업데이트
        const titleElement = document.getElementById(`title-${articleId}`);
        titleElement.textContent = article.title;

        // 내용 업데이트
        const contentDisplay = document.getElementById(`content-display-${articleId}`);
        contentDisplay.innerHTML = this.markdownToHtml(article.content);

        // 글자 수 업데이트
        const wordCountElement = document.getElementById(`wordcount-${articleId}`);
        wordCountElement.textContent = `${article.wordCount}자`;

        // 수정됨 표시 업데이트
        const articleContainer = document.getElementById(`article-${articleId}`);
        if (article.modified) {
            articleContainer.classList.add('article-modified');
        }
    }

    switchEditView(articleId, viewType) {
        // 툴바 버튼 상태 업데이트
        const toolbar = document.querySelector(`#edit-mode-${articleId} .edit-toolbar`);
        const buttons = toolbar.querySelectorAll('.toolbar-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        
        // 현재 선택된 뷰 버튼 활성화
        const targetBtn = Array.from(buttons).find(btn => 
            btn.textContent.includes(viewType === 'edit' ? '편집' : viewType === 'preview' ? '미리보기' : '분할')
        );
        if (targetBtn) targetBtn.classList.add('active');

        // 뷰 전환
        const editOnly = document.getElementById(`edit-only-${articleId}`);
        const previewOnly = document.getElementById(`preview-only-${articleId}`);
        const splitView = document.getElementById(`split-view-${articleId}`);

        // 모든 뷰 숨기기
        editOnly.style.display = 'none';
        previewOnly.style.display = 'none';
        splitView.style.display = 'none';

        // 선택된 뷰만 보이기
        switch (viewType) {
            case 'edit':
                editOnly.style.display = 'block';
                break;
            case 'preview':
                previewOnly.style.display = 'block';
                this.updatePreview(articleId, 'preview');
                break;
            case 'split':
                splitView.style.display = 'block';
                this.updatePreview(articleId, 'preview-split');
                break;
        }
    }

    updatePreview(articleId, previewId) {
        const textarea = document.getElementById(`content-textarea-${articleId}`) ||
                        document.getElementById(`content-textarea-split-${articleId}`);
        const preview = document.getElementById(`${previewId}-${articleId}`);
        
        if (textarea && preview) {
            const content = textarea.value;
            preview.innerHTML = this.markdownToHtml(content);
        }
    }

    updateSplitPreview(articleId) {
        this.updatePreview(articleId, 'preview-split');
        this.autoSave(articleId);
    }

    updateTitle(articleId) {
        // 제목 변경시 자동 저장
        this.autoSave(articleId);
    }

    autoSave(articleId) {
        // 자동 저장 (디바운싱)
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }
        
        this.autoSaveTimeout = setTimeout(() => {
            const article = this.generatedArticles.find(a => a.id === articleId);
            if (!article) return;

            const titleInput = document.getElementById(`title-input-${articleId}`);
            const contentTextarea = document.getElementById(`content-textarea-${articleId}`) || 
                                    document.getElementById(`content-textarea-split-${articleId}`);
            
            if (titleInput && contentTextarea) {
                const currentTitle = titleInput.value.trim();
                const currentContent = contentTextarea.value.trim();
                
                // 임시 저장 (로컬 스토리지)
                const tempData = {
                    title: currentTitle,
                    content: currentContent,
                    lastEdit: new Date().toISOString()
                };
                
                localStorage.setItem(`temp_article_${articleId}`, JSON.stringify(tempData));
                
                // 미리보기 업데이트
                if (document.getElementById(`preview-${articleId}`)) {
                    this.updatePreview(articleId, 'preview');
                }
            }
        }, 1000); // 1초 지연
    }

    insertMarkdown(articleId, type) {
        const textarea = document.getElementById(`content-textarea-${articleId}`) ||
                        document.getElementById(`content-textarea-split-${articleId}`);
        
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        
        let insertText = '';
        let newCursorPos = start;

        switch (type) {
            case 'bold':
                insertText = `**${selectedText || '굵은 텍스트'}**`;
                newCursorPos = selectedText ? end + 4 : start + 2;
                break;
            case 'italic':
                insertText = `*${selectedText || '이탤릭 텍스트'}*`;
                newCursorPos = selectedText ? end + 2 : start + 1;
                break;
            case 'heading':
                insertText = `## ${selectedText || '제목'}`;
                newCursorPos = selectedText ? end + 3 : start + 3;
                break;
        }

        textarea.value = textarea.value.substring(0, start) + insertText + textarea.value.substring(end);
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        
        this.autoSave(articleId);
    }

    // 중복 메서드 제거됨 - 고급 버전은 4474번 줄 이후에 구현됨

    saveToLocalStorage() {
        try {
            const saveData = {
                articles: this.generatedArticles,
                mainKeyword: document.getElementById('mainKeyword').value,
                settings: {
                    contentStyle: document.getElementById('contentStyle').value,
                    contentLength: document.getElementById('contentLength').value,
                    targetAudience: document.getElementById('targetAudience').value
                },
                lastSaved: new Date().toISOString()
            };
            
            localStorage.setItem('blog_generator_data', JSON.stringify(saveData));
        } catch (error) {
            console.error('로컬 저장 실패:', error);
        }
    }

    loadFromLocalStorage() {
        try {
            const savedData = localStorage.getItem('blog_generator_data');
            if (savedData) {
                const data = JSON.parse(savedData);
                
                if (data.articles && data.articles.length > 0) {
                    this.generatedArticles = data.articles;
                    
                    // 설정 복원
                    if (data.settings) {
                        document.getElementById('contentStyle').value = data.settings.contentStyle || 'informative';
                        document.getElementById('contentLength').value = data.settings.contentLength || '2000';
                        document.getElementById('targetAudience').value = data.settings.targetAudience || 'general';
                    }
                    
                    if (data.mainKeyword) {
                        document.getElementById('mainKeyword').value = data.mainKeyword;
                    }
                    
                    // 결과 표시
                    document.getElementById('resultsSection').style.display = 'block';
                    this.showResults();
                    
                    this.showAlert(`이전 작업이 복원되었습니다. (${data.articles.length}개 글)`, 'info');
                }
            }
        } catch (error) {
            console.error('로컬 데이터 로드 실패:', error);
        }
    }

    selectAllArticles() {
        // 전체 선택/해제 토글
        const checkboxes = document.querySelectorAll('input[type="checkbox"][id^="select-"]');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        
        checkboxes.forEach(cb => {
            cb.checked = !allChecked;
        });

        const action = allChecked ? '해제' : '선택';
        this.showAlert(`모든 글이 ${action}되었습니다.`, 'info');
    }

    saveProject() {
        const mainKeyword = document.getElementById('mainKeyword').value.trim();
        if (!mainKeyword) {
            this.showAlert('프로젝트를 저장하려면 메인 키워드가 필요합니다.', 'error');
            return;
        }

        if (this.generatedArticles.length === 0) {
            this.showAlert('저장할 글이 없습니다.', 'error');
            return;
        }

        try {
            const projectData = {
                projectName: `${mainKeyword} 프로젝트`,
                mainKeyword: mainKeyword,
                articles: this.generatedArticles,
                settings: {
                    contentStyle: document.getElementById('contentStyle').value,
                    contentLength: document.getElementById('contentLength').value,
                    targetAudience: document.getElementById('targetAudience').value
                },
                createdAt: new Date().toISOString(),
                totalArticles: this.generatedArticles.length,
                modifiedArticles: this.generatedArticles.filter(a => a.modified).length
            };

            // JSON 파일로 다운로드
            const dataStr = JSON.stringify(projectData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            
            const exportFileDefaultName = `${mainKeyword}-프로젝트-${new Date().toISOString().slice(0,10)}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();

            this.showAlert('프로젝트가 JSON 파일로 저장되었습니다! 💾', 'success');
            
        } catch (error) {
            console.error('프로젝트 저장 오류:', error);
            this.showAlert('프로젝트 저장 중 오류가 발생했습니다.', 'error');
        }
    }

    clearAllArticles() {
        if (confirm('⚠️ 모든 글과 진행사항이 삭제됩니다. 정말 계속하시겠습니까?\\n\\n삭제된 데이터는 복구할 수 없습니다.')) {
            // 모든 데이터 초기화
            this.generatedArticles = [];
            this.currentProgress = 0;
            
            // UI 초기화
            document.getElementById('resultsSection').style.display = 'none';
            document.getElementById('progressSection').style.display = 'none';
            document.getElementById('subKeywordsSection').style.display = 'none';
            document.getElementById('mainKeyword').value = '';
            
            // 로컬 스토리지 정리
            localStorage.removeItem('blog_generator_data');
            
            // 임시 저장 데이터도 정리
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('temp_article_')) {
                    localStorage.removeItem(key);
                }
            });

            this.showAlert('모든 데이터가 삭제되었습니다.', 'info');
        }
    }

    analyzeSEO() {
        if (this.generatedArticles.length === 0) {
            return;
        }

        const mainKeyword = document.getElementById('mainKeyword').value.trim().toLowerCase();
        const subKeywords = this.getSubKeywords().map(k => k.toLowerCase());
        
        let totalScores = {
            keyword: 0,
            readability: 0,
            structure: 0,
            title: 0
        };

        let analyses = [];

        // 각 글 분석
        this.generatedArticles.forEach(article => {
            const analysis = this.analyzeSingleArticle(article, mainKeyword, subKeywords);
            analyses.push(analysis);
            
            totalScores.keyword += analysis.keywordScore;
            totalScores.readability += analysis.readabilityScore;
            totalScores.structure += analysis.structureScore;
            totalScores.title += analysis.titleScore;
        });

        // 평균 점수 계산
        const articleCount = this.generatedArticles.length;
        const avgScores = {
            keyword: Math.round(totalScores.keyword / articleCount),
            readability: Math.round(totalScores.readability / articleCount),
            structure: Math.round(totalScores.structure / articleCount),
            title: Math.round(totalScores.title / articleCount)
        };

        // 종합 점수 (가중 평균)
        const totalSeoScore = Math.round(
            (avgScores.keyword * 0.3) + 
            (avgScores.readability * 0.25) + 
            (avgScores.structure * 0.25) + 
            (avgScores.title * 0.2)
        );

        // UI 업데이트
        this.updateSEODisplay(totalSeoScore, avgScores, analyses, mainKeyword, subKeywords);
        
        // SEO 섹션 표시
        document.getElementById('seoAnalysisSection').style.display = 'block';
        document.getElementById('seoAnalysisSection').scrollIntoView({ behavior: 'smooth' });
    }

    analyzeSingleArticle(article, mainKeyword, subKeywords) {
        const title = article.title.toLowerCase();
        const content = this.stripMarkdown(article.content).toLowerCase();
        const wordCount = content.split(/\s+/).length;

        // 1. 키워드 분석
        const keywordAnalysis = this.analyzeKeywords(title, content, mainKeyword, subKeywords);
        
        // 2. 제목 분석  
        const titleAnalysis = this.analyzeTitle(article.title, mainKeyword);
        
        // 3. 가독성 분석
        const readabilityAnalysis = this.analyzeReadability(content, wordCount);
        
        // 4. 구조 분석
        const structureAnalysis = this.analyzeStructure(article.content);

        return {
            articleId: article.id,
            title: article.title,
            keywordScore: keywordAnalysis.score,
            titleScore: titleAnalysis.score,
            readabilityScore: readabilityAnalysis.score,
            structureScore: structureAnalysis.score,
            details: {
                keywords: keywordAnalysis,
                title: titleAnalysis,
                readability: readabilityAnalysis,
                structure: structureAnalysis
            }
        };
    }

    analyzeKeywords(title, content, mainKeyword, subKeywords) {
        const titleWords = title.split(/\s+/).length;
        const contentWords = content.split(/\s+/).length;
        
        // 메인 키워드 밀도
        const mainKeywordCount = (title.match(new RegExp(mainKeyword, 'g')) || []).length + 
                                (content.match(new RegExp(mainKeyword, 'g')) || []).length;
        const mainKeywordDensity = (mainKeywordCount / (titleWords + contentWords)) * 100;
        
        // 서브 키워드 사용
        let subKeywordCount = 0;
        subKeywords.forEach(keyword => {
            const matches = (title.match(new RegExp(keyword, 'g')) || []).length + 
                           (content.match(new RegExp(keyword, 'g')) || []).length;
            subKeywordCount += matches;
        });
        
        const subKeywordDensity = (subKeywordCount / (titleWords + contentWords)) * 100;
        
        // 점수 계산 (키워드 밀도 1-3% 권장)
        let score = 0;
        
        if (mainKeywordDensity >= 1 && mainKeywordDensity <= 3) {
            score += 40; // 최적 밀도
        } else if (mainKeywordDensity < 1) {
            score += Math.max(0, mainKeywordDensity * 30); // 부족
        } else {
            score += Math.max(10, 40 - (mainKeywordDensity - 3) * 5); // 과도
        }
        
        // 서브키워드 보너스
        if (subKeywordDensity > 0) {
            score += Math.min(30, subKeywordDensity * 10);
        }
        
        // 제목에 메인 키워드 포함 여부
        if (title.includes(mainKeyword)) {
            score += 30;
        }
        
        return {
            score: Math.min(100, score),
            mainKeywordCount,
            mainKeywordDensity: Number(mainKeywordDensity.toFixed(2)),
            subKeywordCount,
            subKeywordDensity: Number(subKeywordDensity.toFixed(2)),
            titleHasKeyword: title.includes(mainKeyword)
        };
    }

    analyzeTitle(title, mainKeyword) {
        const length = title.length;
        const wordCount = title.split(/\s+/).length;
        const hasKeyword = title.toLowerCase().includes(mainKeyword);
        
        let score = 0;
        
        // 길이 점수 (50-60자 권장)
        if (length >= 30 && length <= 60) {
            score += 40;
        } else if (length >= 20 && length <= 80) {
            score += 25;
        } else {
            score += 10;
        }
        
        // 키워드 포함 점수
        if (hasKeyword) {
            score += 35;
        }
        
        // 단어 수 점수 (5-12 단어 권장)
        if (wordCount >= 5 && wordCount <= 12) {
            score += 25;
        } else {
            score += 10;
        }
        
        return {
            score,
            length,
            wordCount,
            hasKeyword,
            optimal: length >= 30 && length <= 60 && hasKeyword && wordCount >= 5 && wordCount <= 12
        };
    }

    analyzeReadability(content, wordCount) {
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
        const avgSentenceLength = wordCount / sentences;
        
        // 복잡한 단어 수 (5글자 이상)
        const complexWords = content.split(/\s+/).filter(word => word.length > 5).length;
        const complexWordRatio = (complexWords / wordCount) * 100;
        
        let score = 0;
        
        // 문장 길이 점수 (15-25 단어 권장)
        if (avgSentenceLength >= 10 && avgSentenceLength <= 25) {
            score += 40;
        } else {
            score += Math.max(10, 40 - Math.abs(avgSentenceLength - 17) * 2);
        }
        
        // 복잡도 점수 (복잡한 단어 30% 이하 권장)
        if (complexWordRatio <= 30) {
            score += 35;
        } else {
            score += Math.max(10, 35 - (complexWordRatio - 30));
        }
        
        // 문단 수 점수 (적절한 문단 분리)
        const paragraphs = content.split(/\n\s*\n/).length;
        const avgWordsPerParagraph = wordCount / paragraphs;
        if (avgWordsPerParagraph >= 50 && avgWordsPerParagraph <= 150) {
            score += 25;
        } else {
            score += 10;
        }
        
        return {
            score: Math.min(100, score),
            avgSentenceLength: Number(avgSentenceLength.toFixed(1)),
            complexWordRatio: Number(complexWordRatio.toFixed(1)),
            sentences,
            paragraphs,
            fleschScore: this.calculateFleschScore(avgSentenceLength, complexWordRatio)
        };
    }

    analyzeStructure(content) {
        const h1Count = (content.match(/^# /gm) || []).length;
        const h2Count = (content.match(/^## /gm) || []).length;  
        const h3Count = (content.match(/^### /gm) || []).length;
        const listCount = (content.match(/^[\s]*[-*+]/gm) || []).length;
        const boldCount = (content.match(/\*\*.*?\*\*/g) || []).length;
        
        let score = 0;
        
        // 헤딩 구조 점수
        if (h1Count >= 1) score += 20;
        if (h2Count >= 2) score += 25;
        if (h3Count >= 1) score += 15;
        
        // 목록 사용 점수
        if (listCount >= 3) score += 20;
        
        // 강조 표시 점수
        if (boldCount >= 2) score += 10;
        
        // 구조적 균형 점수
        const totalHeadings = h1Count + h2Count + h3Count;
        if (totalHeadings >= 3 && totalHeadings <= 10) {
            score += 10;
        }
        
        return {
            score: Math.min(100, score),
            h1Count,
            h2Count, 
            h3Count,
            listCount,
            boldCount,
            totalHeadings
        };
    }

    calculateFleschScore(avgSentenceLength, complexWordRatio) {
        // 간단한 한국어 가독성 점수 (Flesch 기반 수정)
        const score = 100 - (avgSentenceLength * 1.2) - (complexWordRatio * 0.8);
        return Math.max(0, Math.min(100, score));
    }

    stripMarkdown(text) {
        return text
            .replace(/#{1,6}\s/g, '')
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/`(.*?)`/g, '$1')
            .replace(/\[.*?\]\(.*?\)/g, '')
            .replace(/^\s*[-*+]\s/gm, '')
            .trim();
    }

    updateSEODisplay(totalScore, avgScores, analyses, mainKeyword, subKeywords) {
        // 종합 점수 업데이트
        document.getElementById('totalSeoScore').textContent = totalScore;
        document.getElementById('keywordScore').textContent = avgScores.keyword;
        document.getElementById('readabilityScore').textContent = avgScores.readability;
        document.getElementById('structureScore').textContent = avgScores.structure;

        // 키워드 분석 표시
        this.displayKeywordAnalysis(analyses, mainKeyword, subKeywords);
        
        // 제목 분석 표시
        this.displayTitleAnalysis(analyses);
        
        // 가독성 분석 표시
        this.displayReadabilityAnalysis(analyses);
        
        // 구조 분석 표시
        this.displayStructureAnalysis(analyses);
        
        // 개선 제안 표시
        this.displaySEOSuggestions(totalScore, avgScores, analyses);
    }

    displayKeywordAnalysis(analyses, mainKeyword, subKeywords) {
        const container = document.getElementById('keywordAnalysis');
        
        // 전체 평균 계산
        const totalArticles = analyses.length;
        const avgMainDensity = analyses.reduce((sum, a) => sum + a.details.keywords.mainKeywordDensity, 0) / totalArticles;
        const avgSubDensity = analyses.reduce((sum, a) => sum + a.details.keywords.subKeywordDensity, 0) / totalArticles;
        const titlesWithKeyword = analyses.filter(a => a.details.keywords.titleHasKeyword).length;
        
        container.innerHTML = `
            <div class="space-y-3">
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">메인 키워드 밀도</span>
                    <div class="flex items-center gap-2">
                        <span class="font-mono text-sm">${avgMainDensity.toFixed(2)}%</span>
                        <span class="seo-badge ${this.getKeywordDensityBadge(avgMainDensity)}">${this.getKeywordDensityText(avgMainDensity)}</span>
                    </div>
                </div>
                <div class="seo-progress-bar">
                    <div class="seo-progress-fill bg-blue-500" style="width: ${Math.min(100, avgMainDensity * 33)}%"></div>
                </div>
                
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">서브 키워드 사용</span>
                    <span class="font-mono text-sm">${avgSubDensity.toFixed(2)}%</span>
                </div>
                
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">제목에 키워드 포함</span>
                    <span class="font-semibold ${titlesWithKeyword === totalArticles ? 'text-green-600' : 'text-orange-600'}">
                        ${titlesWithKeyword}/${totalArticles}
                    </span>
                </div>
                
                <div class="mt-3 p-2 bg-blue-50 rounded text-sm">
                    <strong>타겟 키워드:</strong> 
                    <span class="keyword-highlight">${mainKeyword}</span>
                </div>
            </div>
        `;
    }

    displayTitleAnalysis(analyses) {
        const container = document.getElementById('titleAnalysis');
        
        const avgLength = analyses.reduce((sum, a) => sum + a.details.title.length, 0) / analyses.length;
        const optimalTitles = analyses.filter(a => a.details.title.optimal).length;
        const shortTitles = analyses.filter(a => a.details.title.length < 30).length;
        const longTitles = analyses.filter(a => a.details.title.length > 60).length;
        
        container.innerHTML = `
            <div class="space-y-3">
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">평균 제목 길이</span>
                    <div class="flex items-center gap-2">
                        <span class="font-mono text-sm">${Math.round(avgLength)}자</span>
                        <span class="seo-badge ${this.getTitleLengthBadge(avgLength)}">${this.getTitleLengthText(avgLength)}</span>
                    </div>
                </div>
                
                <div class="grid grid-cols-3 gap-2 text-xs">
                    <div class="text-center p-2 bg-green-50 rounded">
                        <div class="font-bold text-green-600">${optimalTitles}</div>
                        <div class="text-green-600">최적</div>
                    </div>
                    <div class="text-center p-2 bg-yellow-50 rounded">
                        <div class="font-bold text-yellow-600">${shortTitles}</div>
                        <div class="text-yellow-600">짧음</div>
                    </div>
                    <div class="text-center p-2 bg-red-50 rounded">
                        <div class="font-bold text-red-600">${longTitles}</div>
                        <div class="text-red-600">긴편</div>
                    </div>
                </div>
                
                <div class="mt-2 p-2 bg-purple-50 rounded text-sm text-purple-700">
                    <strong>권장:</strong> 30-60자, 키워드 포함
                </div>
            </div>
        `;
    }

    displayReadabilityAnalysis(analyses) {
        const container = document.getElementById('readabilityAnalysis');
        
        const avgSentenceLength = analyses.reduce((sum, a) => sum + a.details.readability.avgSentenceLength, 0) / analyses.length;
        const avgComplexity = analyses.reduce((sum, a) => sum + a.details.readability.complexWordRatio, 0) / analyses.length;
        const avgFlesch = analyses.reduce((sum, a) => sum + a.details.readability.fleschScore, 0) / analyses.length;
        
        container.innerHTML = `
            <div class="space-y-3">
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">평균 문장 길이</span>
                    <span class="font-mono text-sm">${avgSentenceLength.toFixed(1)}단어</span>
                </div>
                
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">복잡한 단어 비율</span>
                    <div class="flex items-center gap-2">
                        <span class="font-mono text-sm">${avgComplexity.toFixed(1)}%</span>
                        <span class="seo-badge ${this.getComplexityBadge(avgComplexity)}">${this.getComplexityText(avgComplexity)}</span>
                    </div>
                </div>
                
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">가독성 점수</span>
                    <div class="flex items-center gap-2">
                        <span class="font-mono text-sm">${Math.round(avgFlesch)}</span>
                        <span class="seo-badge ${this.getFleschBadge(avgFlesch)}">${this.getFleschText(avgFlesch)}</span>
                    </div>
                </div>
                
                <div class="mt-2 p-2 bg-green-50 rounded text-sm text-green-700">
                    <strong>권장:</strong> 문장 10-25단어, 복잡한 단어 30% 이하
                </div>
            </div>
        `;
    }

    displayStructureAnalysis(analyses) {
        const container = document.getElementById('structureAnalysis');
        
        const totalH1 = analyses.reduce((sum, a) => sum + a.details.structure.h1Count, 0);
        const totalH2 = analyses.reduce((sum, a) => sum + a.details.structure.h2Count, 0);
        const totalH3 = analyses.reduce((sum, a) => sum + a.details.structure.h3Count, 0);
        const totalLists = analyses.reduce((sum, a) => sum + a.details.structure.listCount, 0);
        
        container.innerHTML = `
            <div class="space-y-3">
                <div class="grid grid-cols-2 gap-3 text-sm">
                    <div class="flex justify-between">
                        <span class="text-gray-600">H1 제목</span>
                        <span class="font-semibold">${totalH1}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">H2 소제목</span>
                        <span class="font-semibold">${totalH2}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">H3 제목</span>
                        <span class="font-semibold">${totalH3}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">목록 항목</span>
                        <span class="font-semibold">${totalLists}</span>
                    </div>
                </div>
                
                <div class="mt-3 space-y-2">
                    <div class="flex items-center justify-between text-sm">
                        <span>구조적 완성도</span>
                        <span class="seo-badge ${this.getStructureBadge(totalH1, totalH2, totalH3)}">
                            ${this.getStructureText(totalH1, totalH2, totalH3)}
                        </span>
                    </div>
                </div>
                
                <div class="mt-2 p-2 bg-orange-50 rounded text-sm text-orange-700">
                    <strong>권장:</strong> H1(1개), H2(2-5개), 목록 활용
                </div>
            </div>
        `;
    }

    displaySEOSuggestions(totalScore, avgScores, analyses) {
        const suggestions = [];
        
        // 키워드 관련 제안
        if (avgScores.keyword < 70) {
            const avgDensity = analyses.reduce((sum, a) => sum + a.details.keywords.mainKeywordDensity, 0) / analyses.length;
            if (avgDensity < 1) {
                suggestions.push('💡 메인 키워드를 더 자주 사용하세요. (현재: ' + avgDensity.toFixed(2) + '%, 권장: 1-3%)');
            } else if (avgDensity > 3) {
                suggestions.push('⚠️ 키워드 사용을 줄여주세요. 과도한 키워드 사용은 페널티를 받을 수 있습니다.');
            }
        }
        
        // 제목 관련 제안
        if (avgScores.title < 70) {
            const shortTitles = analyses.filter(a => a.details.title.length < 30).length;
            const longTitles = analyses.filter(a => a.details.title.length > 60).length;
            
            if (shortTitles > 0) {
                suggestions.push(`📏 ${shortTitles}개 글의 제목이 너무 짧습니다. 30-60자로 늘려보세요.`);
            }
            if (longTitles > 0) {
                suggestions.push(`📏 ${longTitles}개 글의 제목이 너무 깁니다. 60자 이하로 줄여보세요.`);
            }
        }
        
        // 가독성 관련 제안
        if (avgScores.readability < 70) {
            suggestions.push('📖 문장을 더 짧고 간단하게 작성해보세요. 평균 15-20단어가 적당합니다.');
            suggestions.push('✂️ 긴 문단을 더 작은 문단으로 나누어 주세요.');
        }
        
        // 구조 관련 제안
        if (avgScores.structure < 70) {
            suggestions.push('🏗️ 더 많은 소제목(H2, H3)을 사용하여 내용을 구조화해주세요.');
            suggestions.push('📋 목록(-, *)을 활용하여 정보를 정리해주세요.');
            suggestions.push('**굵은 글씨**로 중요한 내용을 강조해보세요.');
        }
        
        // 전체적인 제안
        if (totalScore >= 80) {
            suggestions.unshift('🎉 훌륭한 SEO 최적화 상태입니다! 이 수준을 유지하세요.');
        } else if (totalScore >= 60) {
            suggestions.unshift('👍 좋은 SEO 상태입니다. 몇 가지 개선으로 더 나아질 수 있습니다.');
        } else {
            suggestions.unshift('🔧 SEO 최적화가 필요합니다. 아래 제안사항을 참고해주세요.');
        }
        
        const container = document.getElementById('seoSuggestions');
        container.innerHTML = `
            <ul class="space-y-2">
                ${suggestions.map(suggestion => `<li class="flex items-start"><span class="mr-2">•</span><span>${suggestion}</span></li>`).join('')}
            </ul>
        `;
    }

    // 유틸리티 함수들
    getKeywordDensityBadge(density) {
        if (density >= 1 && density <= 3) return 'excellent';
        if (density >= 0.5 && density <= 4) return 'good';
        if (density >= 0.2 && density <= 5) return 'average';
        return 'poor';
    }

    getKeywordDensityText(density) {
        if (density >= 1 && density <= 3) return '최적';
        if (density < 1) return '부족';
        return '과도';
    }

    getTitleLengthBadge(length) {
        if (length >= 30 && length <= 60) return 'excellent';
        if (length >= 20 && length <= 80) return 'good';
        return 'average';
    }

    getTitleLengthText(length) {
        if (length >= 30 && length <= 60) return '최적';
        if (length < 30) return '짧음';
        return '긴편';
    }

    getComplexityBadge(ratio) {
        if (ratio <= 25) return 'excellent';
        if (ratio <= 35) return 'good';
        if (ratio <= 45) return 'average';
        return 'poor';
    }

    getComplexityText(ratio) {
        if (ratio <= 25) return '쉬움';
        if (ratio <= 35) return '보통';
        if (ratio <= 45) return '어려움';
        return '매우어려움';
    }

    getFleschBadge(score) {
        if (score >= 70) return 'excellent';
        if (score >= 50) return 'good';
        if (score >= 30) return 'average';
        return 'poor';
    }

    getFleschText(score) {
        if (score >= 70) return '매우쉬움';
        if (score >= 50) return '쉬움';
        if (score >= 30) return '보통';
        return '어려움';
    }

    getStructureBadge(h1, h2, h3) {
        const score = (h1 >= 1 ? 25 : 0) + (h2 >= 2 ? 50 : h2 * 25) + (h3 >= 1 ? 25 : 0);
        if (score >= 75) return 'excellent';
        if (score >= 50) return 'good';
        if (score >= 25) return 'average';
        return 'poor';
    }

    // ==================== 프로젝트 관리 기능 ====================

    showProjectModal() {
        document.getElementById('projectModal').style.display = 'flex';
        this.updateProjectModalInfo();
        this.loadProjectsList();
        this.loadPresetsList();
        this.loadFavoriteKeywords();
        this.switchTab('save'); // 기본 탭
    }

    hideProjectModal() {
        document.getElementById('projectModal').style.display = 'none';
    }

    switchTab(tabName) {
        // 탭 버튼 상태 변경
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.classList.add('text-gray-500');
            btn.classList.remove('text-indigo-600', 'border-indigo-600');
        });

        const activeTab = document.getElementById(tabName + 'Tab');
        activeTab.classList.add('active');
        activeTab.classList.remove('text-gray-500');
        activeTab.classList.add('text-indigo-600');

        // 탭 내용 전환
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });

        document.getElementById(tabName + 'TabContent').style.display = 'block';
    }

    updateProjectModalInfo() {
        const keywordCount = this.getSubKeywords().length;
        const articleCount = this.generatedArticles.length;
        
        document.getElementById('keywordCount').textContent = keywordCount + 1; // 메인 + 서브
        document.getElementById('articleCount').textContent = articleCount;

        // 기본 프로젝트명 설정
        const mainKeyword = document.getElementById('mainKeyword').value.trim();
        if (mainKeyword && !document.getElementById('projectName').value) {
            document.getElementById('projectName').value = `${mainKeyword} 프로젝트`;
        }
    }

    saveCurrentProject() {
        const projectName = document.getElementById('projectName').value.trim();
        const projectCategory = document.getElementById('projectCategory').value;
        const projectDescription = document.getElementById('projectDescription').value.trim();

        if (!projectName) {
            this.showAlert('프로젝트 이름을 입력해주세요.', 'error');
            return;
        }

        if (this.generatedArticles.length === 0) {
            this.showAlert('저장할 글이 없습니다. 먼저 블로그 글을 생성해주세요.', 'error');
            return;
        }

        const projectData = {
            id: Date.now().toString(),
            name: projectName,
            category: projectCategory,
            description: projectDescription,
            mainKeyword: document.getElementById('mainKeyword').value.trim(),
            subKeywords: this.getSubKeywords(),
            articles: this.generatedArticles,
            settings: {
                contentStyle: document.getElementById('contentStyle').value,
                contentLength: document.getElementById('contentLength').value,
                targetAudience: document.getElementById('targetAudience').value
            },
            seoAnalysis: this.lastSeoAnalysis || null,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            version: '1.0'
        };

        try {
            // 로컬 스토리지에 저장
            const savedProjects = this.getSavedProjects();
            savedProjects.push(projectData);
            localStorage.setItem('blog_generator_projects', JSON.stringify(savedProjects));

            this.showAlert(`프로젝트 "${projectName}"이 저장되었습니다! 💾`, 'success');
            this.loadProjectsList(); // 목록 새로고침
            
        } catch (error) {
            console.error('프로젝트 저장 오류:', error);
            this.showAlert('프로젝트 저장 중 오류가 발생했습니다.', 'error');
        }
    }

    exportProjectAsJSON() {
        const projectName = document.getElementById('projectName').value.trim() || 'unnamed-project';
        
        if (this.generatedArticles.length === 0) {
            this.showAlert('내보낼 글이 없습니다.', 'error');
            return;
        }

        const projectData = {
            name: projectName,
            category: document.getElementById('projectCategory').value,
            description: document.getElementById('projectDescription').value.trim(),
            mainKeyword: document.getElementById('mainKeyword').value.trim(),
            subKeywords: this.getSubKeywords(),
            articles: this.generatedArticles,
            settings: {
                contentStyle: document.getElementById('contentStyle').value,
                contentLength: document.getElementById('contentLength').value,
                targetAudience: document.getElementById('targetAudience').value
            },
            seoAnalysis: this.lastSeoAnalysis || null,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };

        try {
            const dataStr = JSON.stringify(projectData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            
            const exportFileDefaultName = `${this.sanitizeFilename(projectName)}-${new Date().toISOString().slice(0,10)}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();

            this.showAlert('프로젝트가 JSON 파일로 내보내졌습니다! 📤', 'success');
            
        } catch (error) {
            console.error('프로젝트 내보내기 오류:', error);
            this.showAlert('프로젝트 내보내기 중 오류가 발생했습니다.', 'error');
        }
    }

    importProjectFromFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const projectData = JSON.parse(e.target.result);
                this.loadProject(projectData);
                this.showAlert(`프로젝트 "${projectData.name}"을 불러왔습니다! 📁`, 'success');
                this.hideProjectModal();
            } catch (error) {
                console.error('프로젝트 불러오기 오류:', error);
                this.showAlert('잘못된 프로젝트 파일입니다.', 'error');
            }
        };
        reader.readAsText(file);
        
        // 파일 입력 초기화
        event.target.value = '';
    }

    getSavedProjects() {
        try {
            const saved = localStorage.getItem('blog_generator_projects');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('프로젝트 목록 로드 오류:', error);
            return [];
        }
    }

    loadProjectsList() {
        const container = document.getElementById('projectList');
        const projects = this.getSavedProjects();

        if (projects.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-folder-open text-4xl mb-4 opacity-50"></i>
                    <p>저장된 프로젝트가 없습니다.</p>
                    <p class="text-sm mt-2">첫 번째 프로젝트를 저장해보세요!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = projects.map((project, index) => `
            <div class="project-card border border-gray-200 rounded-lg p-4 hover:shadow-md">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <h5 class="font-semibold text-gray-800">${project.name}</h5>
                            <span class="category-badge category-${project.category}">${this.getCategoryName(project.category)}</span>
                        </div>
                        <p class="text-sm text-gray-600 mb-2">${project.description || '설명 없음'}</p>
                        <div class="flex items-center gap-4 text-xs text-gray-500">
                            <span><i class="fas fa-key mr-1"></i>${project.mainKeyword}</span>
                            <span><i class="fas fa-file-alt mr-1"></i>${project.articles.length}개 글</span>
                            <span><i class="fas fa-calendar mr-1"></i>${new Date(project.createdAt).toLocaleDateString('ko-KR')}</span>
                        </div>
                    </div>
                    <div class="flex gap-1">
                        <button onclick="blogGenerator.loadProjectById('${project.id}')" 
                                class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs">
                            <i class="fas fa-folder-open mr-1"></i>불러오기
                        </button>
                        <button onclick="blogGenerator.deleteProject('${project.id}')" 
                                class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs">
                            <i class="fas fa-trash mr-1"></i>삭제
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    loadProjectById(projectId) {
        const projects = this.getSavedProjects();
        const project = projects.find(p => p.id === projectId);
        
        if (project) {
            this.loadProject(project);
            this.showAlert(`프로젝트 "${project.name}"을 불러왔습니다! 📁`, 'success');
            this.hideProjectModal();
        }
    }

    loadProject(projectData) {
        try {
            // 기본 설정 복원
            document.getElementById('mainKeyword').value = projectData.mainKeyword || '';
            
            if (projectData.settings) {
                document.getElementById('contentStyle').value = projectData.settings.contentStyle || 'informative';
                document.getElementById('contentLength').value = projectData.settings.contentLength || '2000';
                document.getElementById('targetAudience').value = projectData.settings.targetAudience || 'general';
            }

            // 서브키워드 복원
            if (projectData.subKeywords && projectData.subKeywords.length > 0) {
                const keywordsData = projectData.subKeywords.map((keyword, index) => ({
                    id: index + 1,
                    keyword: keyword,
                    editable: true
                }));
                this.displaySubKeywords(keywordsData);
                document.getElementById('subKeywordsSection').style.display = 'block';
            }

            // 글 복원
            if (projectData.articles && projectData.articles.length > 0) {
                this.generatedArticles = projectData.articles;
                this.currentProgress = projectData.articles.length;
                this.totalArticles = projectData.articles.length;
                
                document.getElementById('resultsSection').style.display = 'block';
                this.showResults();

                // SEO 분석 복원 또는 재실행
                if (projectData.seoAnalysis) {
                    this.lastSeoAnalysis = projectData.seoAnalysis;
                    // SEO 섹션 표시는 하지 않고 데이터만 보관
                } else {
                    // SEO 분석 재실행
                    setTimeout(() => this.analyzeSEO(), 1000);
                }
            }

            // 데이터 저장 (현재 세션용)
            this.saveToLocalStorage();

        } catch (error) {
            console.error('프로젝트 로드 오류:', error);
            this.showAlert('프로젝트 로드 중 오류가 발생했습니다.', 'error');
        }
    }

    deleteProject(projectId) {
        if (confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
            try {
                const projects = this.getSavedProjects();
                const filteredProjects = projects.filter(p => p.id !== projectId);
                localStorage.setItem('blog_generator_projects', JSON.stringify(filteredProjects));
                
                this.loadProjectsList(); // 목록 새로고침
                this.showAlert('프로젝트가 삭제되었습니다.', 'info');
            } catch (error) {
                console.error('프로젝트 삭제 오류:', error);
                this.showAlert('프로젝트 삭제 중 오류가 발생했습니다.', 'error');
            }
        }
    }

    getCategoryName(category) {
        const categoryNames = {
            travel: '여행',
            tech: 'IT/기술',
            food: '음식/요리',
            business: '비즈니스',
            health: '건강/의료',
            education: '교육',
            entertainment: '엔터테인먼트',
            other: '기타'
        };
        return categoryNames[category] || '기타';
    }

    // ==================== 프리셋 관리 ====================

    saveCurrentPreset() {
        const presetName = prompt('프리셋 이름을 입력하세요:');
        if (!presetName || !presetName.trim()) return;

        const presetData = {
            id: Date.now().toString(),
            name: presetName.trim(),
            contentStyle: document.getElementById('contentStyle').value,
            contentLength: document.getElementById('contentLength').value,
            targetAudience: document.getElementById('targetAudience').value,
            createdAt: new Date().toISOString()
        };

        try {
            const presets = this.getSavedPresets();
            presets.push(presetData);
            localStorage.setItem('blog_generator_presets', JSON.stringify(presets));

            this.showAlert(`프리셋 "${presetName}"이 저장되었습니다! ⚙️`, 'success');
            this.loadPresetsList();
        } catch (error) {
            console.error('프리셋 저장 오류:', error);
            this.showAlert('프리셋 저장 중 오류가 발생했습니다.', 'error');
        }
    }

    getSavedPresets() {
        try {
            const saved = localStorage.getItem('blog_generator_presets');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('프리셋 목록 로드 오류:', error);
            return [];
        }
    }

    loadPresetsList() {
        const container = document.getElementById('presetList');
        const presets = this.getSavedPresets();

        if (presets.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-cog text-4xl mb-4 opacity-50"></i>
                    <p>저장된 프리셋이 없습니다.</p>
                    <p class="text-sm mt-2">자주 사용하는 설정을 저장해보세요!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = presets.map(preset => `
            <div class="border border-gray-200 rounded-lg p-4">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <h5 class="font-semibold text-gray-800 mb-2">${preset.name}</h5>
                        <div class="flex flex-wrap gap-2 text-xs">
                            <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded">${this.getStyleName(preset.contentStyle)}</span>
                            <span class="bg-green-100 text-green-800 px-2 py-1 rounded">${preset.contentLength}자</span>
                            <span class="bg-purple-100 text-purple-800 px-2 py-1 rounded">${this.getAudienceName(preset.targetAudience)}</span>
                        </div>
                        <p class="text-xs text-gray-500 mt-2">${new Date(preset.createdAt).toLocaleDateString('ko-KR')}</p>
                    </div>
                    <div class="flex gap-1">
                        <button onclick="blogGenerator.applyPreset('${preset.id}')" 
                                class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs">
                            <i class="fas fa-check mr-1"></i>적용
                        </button>
                        <button onclick="blogGenerator.deletePreset('${preset.id}')" 
                                class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs">
                            <i class="fas fa-trash mr-1"></i>삭제
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    applyPreset(presetId) {
        const presets = this.getSavedPresets();
        const preset = presets.find(p => p.id === presetId);
        
        if (preset) {
            document.getElementById('contentStyle').value = preset.contentStyle;
            document.getElementById('contentLength').value = preset.contentLength;
            document.getElementById('targetAudience').value = preset.targetAudience;
            
            this.showAlert(`프리셋 "${preset.name}"이 적용되었습니다! ⚙️`, 'success');
        }
    }

    deletePreset(presetId) {
        if (confirm('정말로 이 프리셋을 삭제하시겠습니까?')) {
            try {
                const presets = this.getSavedPresets();
                const filteredPresets = presets.filter(p => p.id !== presetId);
                localStorage.setItem('blog_generator_presets', JSON.stringify(filteredPresets));
                
                this.loadPresetsList();
                this.showAlert('프리셋이 삭제되었습니다.', 'info');
            } catch (error) {
                console.error('프리셋 삭제 오류:', error);
                this.showAlert('프리셋 삭제 중 오류가 발생했습니다.', 'error');
            }
        }
    }

    // ==================== 즐겨찾기 키워드 관리 ====================

    addFavoriteKeyword() {
        const keywordInput = document.getElementById('newFavoriteKeyword');
        const keyword = keywordInput.value.trim();
        
        if (!keyword) {
            this.showAlert('키워드를 입력해주세요.', 'error');
            return;
        }

        try {
            const favorites = this.getFavoriteKeywords();
            
            if (favorites.includes(keyword)) {
                this.showAlert('이미 추가된 키워드입니다.', 'warning');
                return;
            }
            
            favorites.push(keyword);
            localStorage.setItem('blog_generator_favorite_keywords', JSON.stringify(favorites));
            
            keywordInput.value = '';
            this.loadFavoriteKeywords();
            this.showAlert(`"${keyword}"이 즐겨찾기에 추가되었습니다! ⭐`, 'success');
        } catch (error) {
            console.error('즐겨찾기 추가 오류:', error);
            this.showAlert('즐겨찾기 추가 중 오류가 발생했습니다.', 'error');
        }
    }

    getFavoriteKeywords() {
        try {
            const saved = localStorage.getItem('blog_generator_favorite_keywords');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('즐겨찾기 로드 오류:', error);
            return [];
        }
    }

    loadFavoriteKeywords() {
        const container = document.getElementById('favoriteKeywordsList');
        const favorites = this.getFavoriteKeywords();

        if (favorites.length === 0) {
            container.innerHTML = `
                <div class="w-full text-center py-8 text-gray-500">
                    <i class="fas fa-star text-4xl mb-4 opacity-50"></i>
                    <p>즐겨찾기 키워드가 없습니다.</p>
                    <p class="text-sm mt-2">자주 사용하는 키워드를 추가해보세요!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = favorites.map(keyword => `
            <div class="flex items-center bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                <span class="flex-1 text-sm font-medium text-gray-700">${keyword}</span>
                <div class="flex gap-1">
                    <button onclick="blogGenerator.useFavoriteKeyword('${keyword}')" 
                            class="text-yellow-600 hover:text-yellow-800 text-xs">
                        <i class="fas fa-arrow-right"></i>
                    </button>
                    <button onclick="blogGenerator.removeFavoriteKeyword('${keyword}')" 
                            class="text-red-600 hover:text-red-800 text-xs">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    useFavoriteKeyword(keyword) {
        document.getElementById('mainKeyword').value = keyword;
        this.showAlert(`"${keyword}"가 메인 키워드로 설정되었습니다! 🎯`, 'success');
        this.hideProjectModal();
    }

    removeFavoriteKeyword(keyword) {
        if (confirm(`"${keyword}"를 즐겨찾기에서 제거하시겠습니까?`)) {
            try {
                const favorites = this.getFavoriteKeywords();
                const filteredFavorites = favorites.filter(k => k !== keyword);
                localStorage.setItem('blog_generator_favorite_keywords', JSON.stringify(filteredFavorites));
                
                this.loadFavoriteKeywords();
                this.showAlert('즐겨찾기에서 제거되었습니다.', 'info');
            } catch (error) {
                console.error('즐겨찾기 제거 오류:', error);
                this.showAlert('즐겨찾기 제거 중 오류가 발생했습니다.', 'error');
            }
        }
    }

    getStructureText(h1, h2, h3) {
        const score = (h1 >= 1 ? 25 : 0) + (h2 >= 2 ? 50 : h2 * 25) + (h3 >= 1 ? 25 : 0);
        if (score >= 75) return '우수';
        if (score >= 50) return '좋음';
        if (score >= 25) return '보통';
        return '부족';
    }

    downloadPDF() {
        if (this.generatedArticles.length === 0) {
            this.showAlert('먼저 블로그 글을 생성해주세요.', 'error');
            return;
        }

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // 한글 폰트 문제로 인해 기본 텍스트로만 처리
            const mainKeyword = document.getElementById('mainKeyword').value.trim();
            
            // 제목
            doc.setFontSize(20);
            doc.text(`Blog Articles: ${mainKeyword}`, 20, 30);
            
            // 생성 일시
            doc.setFontSize(10);
            doc.text(`Generated: ${new Date().toLocaleDateString('ko-KR')}`, 20, 40);
            doc.text(`Total Articles: ${this.generatedArticles.length}`, 20, 50);
            
            let yPosition = 70;
            
            this.generatedArticles.forEach((article, index) => {
                // 새 페이지 추가 (첫 번째 글 제외)
                if (index > 0) {
                    doc.addPage();
                    yPosition = 20;
                }
                
                // 글 제목
                doc.setFontSize(16);
                doc.text(`${index + 1}. ${article.title}`, 20, yPosition);
                yPosition += 20;
                
                // 키워드
                doc.setFontSize(10);
                doc.text(`Keyword: ${article.keyword}`, 20, yPosition);
                yPosition += 10;
                doc.text(`Word Count: ${article.wordCount}`, 20, yPosition);
                yPosition += 20;
                
                // 내용 (간단한 텍스트로만)
                doc.setFontSize(12);
                const plainText = this.htmlToPlainText(article.content);
                const lines = doc.splitTextToSize(plainText, 170);
                
                lines.forEach(line => {
                    if (yPosition > 280) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    doc.text(line, 20, yPosition);
                    yPosition += 7;
                });
            });
            
            doc.save(`blog-articles-${mainKeyword}-${new Date().toISOString().slice(0,10)}.pdf`);
            this.showAlert('PDF 파일이 다운로드되었습니다!', 'success');
            
        } catch (error) {
            console.error('PDF 생성 오류:', error);
            this.showAlert('PDF 생성 중 오류가 발생했습니다.', 'error');
        }
    }

    downloadWord() {
        if (this.generatedArticles.length === 0) {
            this.showAlert('먼저 블로그 글을 생성해주세요.', 'error');
            return;
        }

        try {
            const mainKeyword = document.getElementById('mainKeyword').value.trim();
            const contentStyle = document.getElementById('contentStyle').value;
            const contentLength = document.getElementById('contentLength').value;
            const targetAudience = document.getElementById('targetAudience').value;
            
            // 목차 생성
            let tableOfContents = '<h2>목차</h2><ul>';
            this.generatedArticles.forEach((article, index) => {
                tableOfContents += `<li>${index + 1}. ${article.title}</li>`;
            });
            tableOfContents += '</ul><div style="page-break-after: always;"></div>';

            // 개선된 HTML 문서 생성
            let htmlContent = `
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>${mainKeyword} - 블로그 콘텐츠 모음집</title>
                    <style>
                        body { 
                            font-family: 'Malgun Gothic', '맑은 고딕', Arial, sans-serif; 
                            line-height: 1.8; 
                            margin: 0; 
                            padding: 40px; 
                            color: #333;
                        }
                        .cover { 
                            text-align: center; 
                            margin-bottom: 60px; 
                            page-break-after: always;
                            border: 2px solid #2563eb;
                            padding: 60px 40px;
                            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                        }
                        .cover h1 { 
                            font-size: 28px; 
                            color: #1e40af; 
                            margin-bottom: 20px;
                            font-weight: bold;
                        }
                        .cover-info { 
                            background: white; 
                            padding: 20px; 
                            border-radius: 10px; 
                            margin-top: 30px;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        }
                        h1 { color: #1e40af; border-bottom: 3px solid #2563eb; padding-bottom: 15px; font-size: 24px; }
                        h2 { color: #1f2937; margin-top: 40px; font-size: 20px; border-left: 4px solid #2563eb; padding-left: 15px; }
                        h3 { color: #4b5563; font-size: 18px; }
                        .article { 
                            margin-bottom: 60px; 
                            page-break-after: always; 
                            border: 1px solid #e5e7eb;
                            padding: 30px;
                            border-radius: 10px;
                            background: #fafafa;
                        }
                        .article-header {
                            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                            color: white;
                            padding: 20px;
                            margin: -30px -30px 30px -30px;
                            border-radius: 10px 10px 0 0;
                        }
                        .meta { 
                            background-color: #f8fafc; 
                            padding: 15px; 
                            border-radius: 8px; 
                            margin-bottom: 25px;
                            border-left: 4px solid #10b981;
                        }
                        .keyword { 
                            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); 
                            color: #1d4ed8; 
                            padding: 8px 16px; 
                            border-radius: 20px; 
                            font-size: 14px; 
                            font-weight: bold;
                            display: inline-block;
                            margin-right: 15px;
                        }
                        .word-count {
                            background: #fef3c7;
                            color: #92400e;
                            padding: 6px 12px;
                            border-radius: 15px;
                            font-size: 12px;
                            font-weight: bold;
                        }
                        .toc {
                            background: #f9fafb;
                            border: 1px solid #d1d5db;
                            border-radius: 10px;
                            padding: 25px;
                            margin-bottom: 40px;
                        }
                        .toc h2 {
                            color: #1f2937;
                            margin-top: 0;
                            border: none;
                            text-align: center;
                        }
                        .toc ul {
                            list-style: none;
                            padding: 0;
                        }
                        .toc li {
                            padding: 8px 0;
                            border-bottom: 1px dotted #d1d5db;
                            font-size: 16px;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 50px;
                            padding: 20px;
                            background: #f3f4f6;
                            border-radius: 10px;
                            color: #6b7280;
                        }
                        p { margin-bottom: 15px; }
                        strong { color: #1f2937; }
                        em { color: #4b5563; font-style: italic; }
                    </style>
                </head>
                <body>
                    <!-- 표지 -->
                    <div class="cover">
                        <h1>${mainKeyword} 완벽 가이드</h1>
                        <p style="font-size: 18px; color: #64748b; margin: 20px 0;">AI가 생성한 전문 블로그 콘텐츠 모음집</p>
                        <div class="cover-info">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>메인 키워드</strong></td>
                                    <td style="padding: 10px; border: 1px solid #e5e7eb;">${mainKeyword}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>글 스타일</strong></td>
                                    <td style="padding: 10px; border: 1px solid #e5e7eb;">${this.getStyleName(contentStyle)}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>대상 독자</strong></td>
                                    <td style="padding: 10px; border: 1px solid #e5e7eb;">${this.getAudienceName(targetAudience)}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>총 글 수</strong></td>
                                    <td style="padding: 10px; border: 1px solid #e5e7eb;">${this.generatedArticles.length}개</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>생성 일시</strong></td>
                                    <td style="padding: 10px; border: 1px solid #e5e7eb;">${new Date().toLocaleDateString('ko-KR', {year: 'numeric', month: 'long', day: 'numeric'})}</td>
                                </tr>
                            </table>
                        </div>
                    </div>

                    <!-- 목차 -->
                    <div class="toc">
                        ${tableOfContents}
                    </div>

                    <!-- 글 목록 -->
            `;

            this.generatedArticles.forEach((article, index) => {
                const wordCount = article.content.replace(/<[^>]*>/g, '').length;
                htmlContent += `
                    <div class="article">
                        <div class="article-header">
                            <h1 style="margin: 0; border: none; color: white;">${index + 1}. ${article.title}</h1>
                        </div>
                        <div class="meta">
                            <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 10px;">
                                <span class="keyword"># ${article.keyword}</span>
                                <span class="word-count">${wordCount}자</span>
                                <span style="color: #6b7280; font-size: 14px;">
                                    생성일: ${new Date(article.createdAt).toLocaleDateString('ko-KR')}
                                </span>
                            </div>
                        </div>
                        <div style="font-size: 15px; line-height: 1.8;">
                            ${this.markdownToHtml(article.content)}
                        </div>
                    </div>
                `;
            });

            htmlContent += `
                    <!-- 푸터 -->
                    <div class="footer">
                        <p><strong>AI 블로그 자동 생성기</strong>로 제작된 콘텐츠입니다.</p>
                        <p>Claude AI 기반 | 생성일: ${new Date().toLocaleDateString('ko-KR')}</p>
                        <p style="font-size: 12px; color: #9ca3af;">
                            이 문서의 내용은 AI가 생성한 것으로, 참고용으로만 사용하시기 바랍니다.
                        </p>
                    </div>
                </body>
                </html>
            `;

            // Word 문서로 변환
            const converted = htmlDocx.asBlob(htmlContent);
            
            // 다운로드
            const link = document.createElement('a');
            link.href = URL.createObjectURL(converted);
            link.download = `${mainKeyword}-블로그가이드-${new Date().toISOString().slice(0,10)}.docx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            
            this.showAlert('전문적인 Word 문서가 다운로드되었습니다! 📄', 'success');
            
        } catch (error) {
            console.error('Word 문서 생성 오류:', error);
            this.showAlert('Word 문서 생성 중 오류가 발생했습니다.', 'error');
        }
    }

    downloadIndividualFiles() {
        if (this.generatedArticles.length === 0) {
            this.showAlert('먼저 블로그 글을 생성해주세요.', 'error');
            return;
        }

        try {
            const zip = new JSZip();
            const mainKeyword = document.getElementById('mainKeyword').value.trim();

            // 각 글을 개별 파일로 생성
            this.generatedArticles.forEach((article, index) => {
                // Word 파일 생성
                const htmlContent = `
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <title>${article.title}</title>
                        <style>
                            body { font-family: 'Malgun Gothic', Arial, sans-serif; line-height: 1.8; margin: 40px; }
                            h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
                            h2 { color: #1f2937; margin-top: 30px; }
                            h3 { color: #4b5563; }
                            .meta { background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
                        </style>
                    </head>
                    <body>
                        <h1>${article.title}</h1>
                        <div class="meta">
                            <p><strong>키워드:</strong> ${article.keyword}</p>
                            <p><strong>글자 수:</strong> ${article.wordCount}자</p>
                            <p><strong>생성일:</strong> ${new Date(article.createdAt).toLocaleDateString('ko-KR')}</p>
                        </div>
                        ${this.markdownToHtml(article.content)}
                    </body>
                    </html>
                `;

                // Word 문서 생성
                const docBlob = htmlDocx.asBlob(htmlContent);
                const fileName = `${index + 1}. ${this.sanitizeFilename(article.title)}.docx`;
                zip.file(fileName, docBlob);

                // 마크다운 파일도 생성
                const markdownContent = `# ${article.title}

**키워드:** ${article.keyword}  
**글자 수:** ${article.wordCount}자  
**생성일:** ${new Date(article.createdAt).toLocaleDateString('ko-KR')}

---

${article.content}
`;
                const mdFileName = `${index + 1}. ${this.sanitizeFilename(article.title)}.md`;
                zip.file(mdFileName, markdownContent);
            });

            // README 파일 생성
            const readmeContent = `# ${mainKeyword} 블로그 콘텐츠 모음

## 개요
- **총 글 수:** ${this.generatedArticles.length}개
- **생성일:** ${new Date().toLocaleDateString('ko-KR')}
- **메인 키워드:** ${mainKeyword}

## 파일 목록

### Word 문서 (.docx)
${this.generatedArticles.map((article, index) => 
    `${index + 1}. ${article.title}.docx`
).join('\n')}

### 마크다운 파일 (.md)
${this.generatedArticles.map((article, index) => 
    `${index + 1}. ${article.title}.md`
).join('\n')}

## 사용 방법
1. Word 문서: Microsoft Word, Google Docs 등에서 열기
2. 마크다운: 텍스트 에디터, Notion, Obsidian 등에서 열기

---
AI 블로그 자동 생성기로 제작됨
`;
            zip.file('README.md', readmeContent);

            // ZIP 파일 다운로드
            zip.generateAsync({type: 'blob'}).then((content) => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = `${mainKeyword}-블로그콘텐츠-${new Date().toISOString().slice(0,10)}.zip`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
            });

            this.showAlert(`${this.generatedArticles.length}개 파일이 ZIP으로 다운로드됩니다! 📦`, 'success');

        } catch (error) {
            console.error('개별 파일 생성 오류:', error);
            this.showAlert('파일 생성 중 오류가 발생했습니다.', 'error');
        }
    }

    downloadMarkdown() {
        if (this.generatedArticles.length === 0) {
            this.showAlert('먼저 블로그 글을 생성해주세요.', 'error');
            return;
        }

        try {
            const mainKeyword = document.getElementById('mainKeyword').value.trim();
            
            let markdownContent = `# ${mainKeyword} 블로그 콘텐츠 모음집

> AI가 생성한 전문 블로그 콘텐츠 ${this.generatedArticles.length}개

## 📋 목차

${this.generatedArticles.map((article, index) => 
    `${index + 1}. [${article.title}](#${index + 1}-${this.sanitizeAnchor(article.title)})`
).join('\n')}

---

## 📊 생성 정보

- **메인 키워드:** ${mainKeyword}
- **총 글 수:** ${this.generatedArticles.length}개  
- **생성일:** ${new Date().toLocaleDateString('ko-KR')}
- **AI 모델:** Claude 3.5 Haiku

---

`;

            // 각 글 추가
            this.generatedArticles.forEach((article, index) => {
                markdownContent += `
## ${index + 1}. ${article.title}

> **키워드:** \`${article.keyword}\`  
> **글자 수:** ${article.content.replace(/<[^>]*>/g, '').length}자  
> **생성일:** ${new Date(article.createdAt).toLocaleDateString('ko-KR')}

${article.content}

---

`;
            });

            markdownContent += `
## 📝 사용 안내

이 문서는 **AI 블로그 자동 생성기**로 제작되었습니다.

### 활용 방법
- 블로그 포스팅 참고 자료
- 콘텐츠 아이디어 소스  
- SEO 키워드 연구 자료

### 추가 편집 권장사항
- 개인적인 경험 추가
- 최신 정보 업데이트
- 이미지 및 미디어 삽입
- 내부 링크 연결

---

**제작:** AI Blog Generator | **일시:** ${new Date().toLocaleString('ko-KR')}
`;

            // 다운로드
            const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${mainKeyword}-블로그가이드-${new Date().toISOString().slice(0,10)}.md`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

            this.showAlert('마크다운 파일이 다운로드되었습니다! 📝', 'success');

        } catch (error) {
            console.error('마크다운 생성 오류:', error);
            this.showAlert('마크다운 생성 중 오류가 발생했습니다.', 'error');
        }
    }

    sanitizeFilename(filename) {
        // 파일명에서 특수문자 제거
        return filename.replace(/[<>:"/\\|?*]/g, '').replace(/\s+/g, ' ').trim();
    }

    sanitizeAnchor(text) {
        // 앵커 링크용 텍스트 정리
        return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    }

    getStyleName(style) {
        const styles = {
            informative: '정보성',
            review: '리뷰',
            guide: '가이드',
            news: '뉴스',
            tutorial: '튜토리얼'
        };
        return styles[style] || '정보성';
    }

    getAudienceName(audience) {
        const audiences = {
            general: '일반인',
            beginner: '초보자',
            intermediate: '중급자',
            expert: '전문가'
        };
        return audiences[audience] || '일반인';
    }

    htmlToPlainText(html) {
        // HTML을 플레인 텍스트로 변환
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || '';
    }

    async showSettingsModal() {
        document.getElementById('settingsModal').style.display = 'flex';
        // 환경 변수 상태 확인 및 표시
        await this.checkEnvironmentVariables();
        // API 키 상태도 다시 확인
        setTimeout(() => {
            this.checkApiKeyStatus();
        }, 100);
    }

    // 환경 변수 상태 확인 및 설정 모달에 표시
    async checkEnvironmentVariables() {
        try {
            const response = await fetch('/api/check-api-keys');
            const result = await response.json();
            
            const envStatus = document.getElementById('environmentStatus');
            const envApiList = document.getElementById('environmentApiList');
            
            if (result.configured && envStatus && envApiList) {
                // 환경 변수가 설정된 경우 상태 표시
                envStatus.style.display = 'block';
                
                const configuredApis = [];
                if (result.details.claude === '설정됨') configuredApis.push('🟢 Claude API');
                if (result.details.gemini === '설정됨') configuredApis.push('🟢 Gemini API');
                if (result.details.openai === '설정됨') configuredApis.push('🟢 OpenAI API');
                
                envApiList.innerHTML = `설정된 환경 변수: ${configuredApis.join(', ')}`;
                
                // 로컬 API 키 입력 필드들 비활성화 및 안내 메시지 표시
                const claudeInput = document.getElementById('claudeApiKey');
                const geminiInput = document.getElementById('geminiApiKey');
                const openaiInput = document.getElementById('openaiApiKey');
                
                if (claudeInput && result.details.claude === '설정됨') {
                    claudeInput.placeholder = '환경 변수에서 API 키가 감지됨';
                    claudeInput.disabled = true;
                    claudeInput.value = '';
                }
                if (geminiInput && result.details.gemini === '설정됨') {
                    geminiInput.placeholder = '환경 변수에서 API 키가 감지됨';
                    geminiInput.disabled = true;
                    geminiInput.value = '';
                }
                if (openaiInput && result.details.openai === '설정됨') {
                    openaiInput.placeholder = '환경 변수에서 API 키가 감지됨';
                    openaiInput.disabled = true;
                    openaiInput.value = '';
                }
            } else {
                // 환경 변수가 설정되지 않은 경우 숨김 및 입력 필드 활성화
                if (envStatus) envStatus.style.display = 'none';
                
                const claudeInput = document.getElementById('claudeApiKey');
                const geminiInput = document.getElementById('geminiApiKey');
                const openaiInput = document.getElementById('openaiApiKey');
                
                if (claudeInput) {
                    claudeInput.placeholder = 'Claude API 키를 입력하세요';
                    claudeInput.disabled = false;
                }
                if (geminiInput) {
                    geminiInput.placeholder = 'Gemini API 키를 입력하세요';
                    geminiInput.disabled = false;
                }
                if (openaiInput) {
                    openaiInput.placeholder = 'OpenAI API 키를 입력하세요';
                    openaiInput.disabled = false;
                }
            }
        } catch (error) {
            console.error('환경 변수 확인 실패:', error);
            const envStatus = document.getElementById('environmentStatus');
            if (envStatus) envStatus.style.display = 'none';
        }
    }

    hideSettingsModal() {
        document.getElementById('settingsModal').style.display = 'none';
    }

    saveSettings() {
        const claudeApiKey = document.getElementById('claudeApiKey').value.trim();
        const geminiApiKey = document.getElementById('geminiApiKey').value.trim();
        const openaiApiKey = document.getElementById('openaiApiKey').value.trim();
        
        let savedKeys = [];
        
        // Claude API 키 저장
        if (claudeApiKey) {
            localStorage.setItem('claude_api_key', claudeApiKey);
            savedKeys.push('Claude');
        } else {
            localStorage.removeItem('claude_api_key');
        }
        
        // Gemini API 키 저장
        if (geminiApiKey) {
            localStorage.setItem('gemini_api_key', geminiApiKey);
            savedKeys.push('Gemini');
        } else {
            localStorage.removeItem('gemini_api_key');
        }
        
        // OpenAI API 키 저장
        if (openaiApiKey) {
            localStorage.setItem('openai_api_key', openaiApiKey);
            savedKeys.push('OpenAI');
        } else {
            localStorage.removeItem('openai_api_key');
        }
        
        if (savedKeys.length > 0) {
            this.showAlert(`${savedKeys.join(', ')} API 키가 저장되었습니다. (총 ${savedKeys.length}개)`, 'success');
            this.hideSettingsModal();
            // API 키 상태 재확인
            setTimeout(() => {
                this.checkApiKeyStatus();
            }, 500);
        } else {
            this.showAlert('최소 하나의 API 키를 입력해주세요.', 'error');
        }
    }

    loadSettings() {
        // Claude API 키 불러오기
        const claudeApiKey = localStorage.getItem('claude_api_key');
        if (claudeApiKey) {
            document.getElementById('claudeApiKey').value = claudeApiKey;
        }
        
        // Gemini API 키 불러오기
        const geminiApiKey = localStorage.getItem('gemini_api_key');
        if (geminiApiKey) {
            document.getElementById('geminiApiKey').value = geminiApiKey;
        }
        
        // OpenAI API 키 불러오기
        const openaiApiKey = localStorage.getItem('openai_api_key');
        if (openaiApiKey) {
            document.getElementById('openaiApiKey').value = openaiApiKey;
        }
    }

    markdownToHtml(markdown) {
        if (typeof marked !== 'undefined') {
            // Marked.js 사용 (더 정확한 마크다운 파싱)
            marked.setOptions({
                breaks: true,
                gfm: true,
                headerIds: false,
                mangle: false
            });
            
            let html = marked.parse(markdown);
            
            // Tailwind CSS 클래스 추가
            html = html
                .replace(/<h1>/g, '<h1 class="text-2xl font-bold mt-8 mb-4 text-gray-900">')
                .replace(/<h2>/g, '<h2 class="text-xl font-bold mt-6 mb-3 text-gray-800">')
                .replace(/<h3>/g, '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-700">')
                .replace(/<p>/g, '<p class="mb-4 text-gray-700 leading-relaxed">')
                .replace(/<ul>/g, '<ul class="list-disc list-inside mb-4 text-gray-700">')
                .replace(/<ol>/g, '<ol class="list-decimal list-inside mb-4 text-gray-700">')
                .replace(/<li>/g, '<li class="mb-1">')
                .replace(/<strong>/g, '<strong class="font-semibold text-gray-900">')
                .replace(/<em>/g, '<em class="italic text-gray-600">')
                .replace(/<blockquote>/g, '<blockquote class="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-600">')
                .replace(/<code>/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">')
                .replace(/<pre><code/g, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4"><code');
            
            return html;
        } else {
            // 폴백: 간단한 마크다운 변환
            let html = markdown
                .replace(/### (.*?)(\n|$)/g, '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-700">$1</h3>')
                .replace(/## (.*?)(\n|$)/g, '<h2 class="text-xl font-bold mt-6 mb-3 text-gray-800">$1</h2>')
                .replace(/# (.*?)(\n|$)/g, '<h1 class="text-2xl font-bold mt-8 mb-4 text-gray-900">$1</h1>')
                .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
                .replace(/\*(.*?)\*/g, '<em class="italic text-gray-600">$1</em>')
                .replace(/\n\n/g, '</p><p class="mb-4 text-gray-700 leading-relaxed">')
                .replace(/\n/g, '<br>');
            
            // 문단으로 감싸기
            if (!html.includes('<h1>') && !html.includes('<h2>') && !html.includes('<h3>')) {
                html = '<p class="mb-4 text-gray-700 leading-relaxed">' + html + '</p>';
            }
            
            return html;
        }
    }

    // =========================== 스마트 키워드 추천 시스템 ===========================
    
    toggleSmartKeywordSuggestions() {
        const panel = document.getElementById('smartSuggestionsPanel');
        const isVisible = panel.style.display === 'block';
        
        if (isVisible) {
            panel.style.display = 'none';
        } else {
            panel.style.display = 'block';
            panel.scrollIntoView({ behavior: 'smooth' });
            
            // 패널이 열릴 때 기본적으로 관련 키워드 추천 실행
            const mainKeyword = document.getElementById('mainKeyword').value.trim();
            if (mainKeyword) {
                this.getSmartKeywordSuggestions('related');
            } else {
                this.showAlert('먼저 메인 키워드를 입력해주세요.', 'error');
                panel.style.display = 'none';
            }
        }
    }
    
    async getSmartKeywordSuggestions(type) {
        const mainKeyword = document.getElementById('mainKeyword').value.trim();
        
        if (!mainKeyword) {
            this.showAlert('메인 키워드를 먼저 입력해주세요.', 'error');
            return;
        }
        
        // 버튼 상태 업데이트
        const buttons = {
            trending: document.getElementById('getTrendingKeywords'),
            related: document.getElementById('getRelatedKeywords'),
            questions: document.getElementById('getQuestionKeywords'),
            longtail: document.getElementById('getLongtailKeywords')
        };
        
        const targetButton = buttons[type];
        const originalText = targetButton.innerHTML;
        targetButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>분석 중...';
        targetButton.disabled = true;
        
        try {
            const response = await axios.post('/api/smart-keyword-suggestions', {
                mainKeyword: mainKeyword,
                type: type
            });
            
            if (response.data.success) {
                this.displaySmartSuggestions(response.data.keywords, type, response.data.description);
                this.showAlert(`${response.data.description} ${response.data.keywords.length}개가 생성되었습니다! 🎯`, 'success');
            } else {
                this.showAlert('키워드 분석에 실패했습니다: ' + response.data.error, 'error');
            }
        } catch (error) {
            console.error('스마트 키워드 추천 오류:', error);
            this.showAlert('키워드 추천 중 오류가 발생했습니다.', 'error');
        } finally {
            targetButton.innerHTML = originalText;
            targetButton.disabled = false;
        }
    }
    
    displaySmartSuggestions(keywords, type, description) {
        const container = document.getElementById('smartSuggestionsList');
        
        if (!container) {
            console.error('smartSuggestionsList 컨테이너를 찾을 수 없습니다');
            return;
        }
        
        const typeTitle = description || this.getSuggestionTypeName(type);
        
        // 기존 내용을 추가하는 방식으로 변경
        const existingContent = container.innerHTML;
        const keywordItems = keywords.map((keywordObj, index) => {
            const keyword = keywordObj.keyword || keywordObj;
            return `
                <div class="smart-suggestion-item bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-2 cursor-pointer transition group"
                     onclick="blogGenerator.useSmartSuggestion('${keyword.replace(/'/g, "\\'")}')"> 
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-medium text-purple-800">${keyword}</span>
                        <div class="flex items-center gap-1">
                            <span class="text-xs text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">${type}</span>
                            <i class="fas fa-plus text-purple-600 text-xs"></i>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // 결과 표시 영역에 새로운 키워드들 추가
        container.innerHTML = `
            <div class="mb-3">
                <div class="flex items-center justify-between mb-2">
                    <h5 class="text-sm font-semibold text-purple-800 flex items-center">
                        <i class="fas fa-brain mr-1"></i>
                        ${typeTitle} (${keywords.length}개)
                    </h5>
                    <button onclick="blogGenerator.addAllSmartSuggestions(${JSON.stringify(keywords.map(k => k.keyword || k))})"
                            class="text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 px-2 py-1 rounded transition">
                        <i class="fas fa-plus mr-1"></i>전체 추가
                    </button>
                </div>
                <div class="grid grid-cols-1 gap-1">
                    ${keywordItems}
                </div>
            </div>
        ` + existingContent;
    }
    
    getSuggestionTypeName(type) {
        const names = {
            trending: '트렌드',
            related: '관련',
            questions: '질문형',
            longtail: '롱테일'
        };
        return names[type] || '추천';
    }
    
    useSmartSuggestion(keyword) {
        // 현재 서브키워드 목록에 추가
        const container = document.getElementById('subKeywordsList');
        if (!container) {
            this.showAlert('먼저 서브 키워드를 생성해주세요.', 'error');
            return;
        }
        
        // 중복 확인
        const existingKeywords = this.getSubKeywords();
        if (existingKeywords.includes(keyword)) {
            this.showAlert('이미 추가된 키워드입니다.', 'warning');
            return;
        }
        
        // 새 키워드 항목 생성
        const keywordDiv = document.createElement('div');
        keywordDiv.className = 'bg-gray-100 hover:bg-gray-200 p-3 rounded-lg cursor-pointer transition';
        keywordDiv.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="text-sm font-medium">${keyword}</span>
                <i class="fas fa-edit text-gray-400 text-xs"></i>
            </div>
        `;
        
        // 편집 이벤트 추가
        keywordDiv.addEventListener('click', () => {
            this.editKeyword(keywordDiv, { keyword });
        });
        
        container.appendChild(keywordDiv);
        
        this.showAlert(`"${keyword}"가 키워드 목록에 추가되었습니다! ✨`, 'success');
    }
    
    addAllSmartSuggestions(keywords) {
        const container = document.getElementById('subKeywordsList');
        if (!container) {
            this.showAlert('먼저 서브 키워드를 생성해주세요.', 'error');
            return;
        }
        
        const existingKeywords = this.getSubKeywords();
        let addedCount = 0;
        
        keywords.forEach(keyword => {
            if (!existingKeywords.includes(keyword)) {
                this.useSmartSuggestion(keyword);
                addedCount++;
            }
        });
        
        if (addedCount > 0) {
            this.showAlert(`${addedCount}개의 새로운 키워드가 추가되었습니다! 🎉`, 'success');
        } else {
            this.showAlert('추가할 새로운 키워드가 없습니다.', 'info');
        }
    }
    
    // =========================== 배치 생성 시스템 ===========================
    
    updateBatchTimeEstimate() {
        const articleCount = parseInt(document.getElementById('batchArticleCount').value) || 0;
        const concurrency = parseInt(document.getElementById('batchConcurrency').value) || 1;
        const delay = parseInt(document.getElementById('batchDelay').value) || 1000;
        
        const avgGenerationTime = 15; // 평균 15초 가정
        const totalTime = Math.ceil(articleCount / concurrency) * (avgGenerationTime + delay / 1000);
        
        document.getElementById('batchTimeEstimate').textContent = this.formatDuration(totalTime);
    }
    
    formatDuration(seconds) {
        if (seconds < 60) {
            return `약 ${seconds}초`;
        } else if (seconds < 3600) {
            return `약 ${Math.ceil(seconds / 60)}분`;
        } else {
            return `약 ${Math.ceil(seconds / 3600)}시간`;
        }
    }
    
    showBatchGenerationModal() {
        const modal = document.getElementById('batchGeneratorModal');
        modal.style.display = 'flex';
        
        // 현재 설정값으로 초기화
        const keywords = this.getSubKeywords();
        document.getElementById('batchKeywordCount').textContent = keywords.length;
        document.getElementById('batchArticleCount').value = Math.min(keywords.length, 10);
        document.getElementById('batchConcurrency').value = 3;
        document.getElementById('batchDelay').value = 1000;
        
        // 예상 소요 시간 계산
        this.updateBatchTimeEstimate();
    }
    
    async confirmBatchGeneration() {
        const keywords = this.getSubKeywords();
        const articleCount = parseInt(document.getElementById('batchArticleCount').value) || keywords.length;
        const concurrency = parseInt(document.getElementById('batchConcurrency').value) || 3;
        const delay = parseInt(document.getElementById('batchDelay').value) || 1000;
        
        if (keywords.length === 0) {
            this.showAlert('생성할 키워드가 없습니다.', 'error');
            return;
        }
        
        // 모달 닫기
        document.getElementById('batchGeneratorModal').style.display = 'none';
        
        try {
            // 배치 작업 생성 요청
            const response = await axios.post('/api/create-batch-job', {
                keywords: keywords.slice(0, articleCount),
                mainKeyword: document.getElementById('mainKeyword').value.trim(),
                settings: {
                    contentStyle: document.getElementById('contentStyle').value,
                    contentLength: document.getElementById('contentLength').value,
                    targetAudience: document.getElementById('targetAudience').value,
                    concurrency: concurrency,
                    delay: delay
                }
            });
            
            if (response.data.success) {
                const batchId = response.data.batchId;
                this.showAlert(`배치 작업이 시작되었습니다! (ID: ${batchId}) 🚀`, 'success');
                
                // 배치 진행 상황 모니터링 시작
                this.startBatchProgressMonitoring(batchId, keywords.slice(0, articleCount));
            } else {
                this.showAlert('배치 작업 생성에 실패했습니다: ' + response.data.error, 'error');
            }
        } catch (error) {
            console.error('배치 생성 오류:', error);
            this.showAlert('배치 작업 생성 중 오류가 발생했습니다.', 'error');
        }
    }
    
    async startBatchProgressMonitoring(batchId, keywords) {
        // 진행 상황 섹션 표시
        document.getElementById('progressSection').style.display = 'block';
        document.getElementById('progressSection').scrollIntoView({ behavior: 'smooth' });
        
        this.currentProgress = 0;
        this.totalArticles = keywords.length;
        this.generatedArticles = [];
        
        // 배치 진행 상황 UI 초기화
        this.initBatchProgressList(keywords, batchId);
        
        // 주기적으로 배치 상태 확인 (2초마다)
        const monitoringInterval = setInterval(async () => {
            try {
                const response = await axios.get(`/api/batch-status/${batchId}`);
                
                if (response.data.success) {
                    const status = response.data.status;
                    
                    // 진행 상황 업데이트
                    this.updateBatchProgress(status);
                    
                    // 완료된 작업들 결과 수집
                    if (status.completed && status.completed.length > 0) {
                        status.completed.forEach(result => {
                            if (result.success && !this.generatedArticles.find(a => a.keyword === result.keyword)) {
                                this.generatedArticles.push({
                                    ...result.article,
                                    id: this.generatedArticles.length + 1
                                });
                            }
                        });
                    }
                    
                    // 배치 작업 완료 확인
                    if (status.status === 'completed' || status.status === 'failed') {
                        clearInterval(monitoringInterval);
                        
                        if (status.status === 'completed') {
                            this.showAlert('배치 생성이 완료되었습니다! 🎉', 'success');
                            this.showResults();
                            
                            // 분석 실행
                            setTimeout(() => this.analyzeSEO(), 1000);
                            setTimeout(() => this.analyzeQuality(), 1500);
                        } else {
                            this.showAlert('배치 작업 중 일부 오류가 발생했습니다.', 'warning');
                        }
                    }
                } else {
                    console.error('배치 상태 확인 실패:', response.data.error);
                }
            } catch (error) {
                console.error('배치 모니터링 오류:', error);
                clearInterval(monitoringInterval);
                this.showAlert('배치 모니터링 중 오류가 발생했습니다.', 'error');
            }
        }, 2000);
    }
    
    initBatchProgressList(keywords, batchId) {
        const container = document.getElementById('progressList');
        container.innerHTML = `
            <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div class="flex items-center justify-between mb-2">
                    <h4 class="font-semibold text-blue-800">배치 작업 진행 상황</h4>
                    <span class="text-sm text-blue-600">ID: ${batchId}</span>
                </div>
                <div class="text-sm text-blue-700">
                    <div>총 작업: ${keywords.length}개</div>
                    <div id="batchCurrentProgress">진행: 0/${keywords.length}</div>
                </div>
            </div>
        `;
        
        keywords.forEach((keyword, index) => {
            const progressItem = document.createElement('div');
            progressItem.id = `batch-progress-${index}`;
            progressItem.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2';
            progressItem.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-clock text-gray-400 mr-3"></i>
                    <span class="text-sm">${keyword}</span>
                </div>
                <span class="text-xs text-gray-500">대기중</span>
            `;
            container.appendChild(progressItem);
        });
    }
    
    updateBatchProgress(status) {
        // 전체 진행 상황 업데이트
        const progressElement = document.getElementById('batchCurrentProgress');
        if (progressElement) {
            const completed = status.completed ? status.completed.length : 0;
            const inProgress = status.inProgress ? status.inProgress.length : 0;
            const failed = status.failed ? status.failed.length : 0;
            
            progressElement.innerHTML = `
                진행: ${completed + inProgress + failed}/${status.total} 
                (완료: ${completed}, 진행중: ${inProgress}, 실패: ${failed})
            `;
            
            // 프로그레스 바 업데이트
            const percentage = ((completed + failed) / status.total) * 100;
            document.getElementById('progressBar').style.width = `${percentage}%`;
            document.getElementById('progressText').textContent = `${completed + failed}/${status.total}`;
        }
        
        // 개별 항목 상태 업데이트
        status.completed?.forEach((result, index) => {
            this.updateBatchProgressItem(result.keyword, 'completed', result.success);
        });
        
        status.inProgress?.forEach((item, index) => {
            this.updateBatchProgressItem(item.keyword, 'generating');
        });
        
        status.failed?.forEach((result, index) => {
            this.updateBatchProgressItem(result.keyword, 'error');
        });
    }
    
    updateBatchProgressItem(keyword, status, success = true) {
        // 키워드로 해당 요소 찾기
        const progressItems = document.querySelectorAll('[id^="batch-progress-"]');
        
        for (let item of progressItems) {
            const keywordSpan = item.querySelector('span');
            if (keywordSpan && keywordSpan.textContent === keyword) {
                const icon = item.querySelector('i');
                const statusText = item.querySelector('span:last-child');
                
                switch (status) {
                    case 'generating':
                        icon.className = 'fas fa-spinner fa-spin text-blue-500 mr-3';
                        statusText.textContent = 'AI 생성중...';
                        statusText.className = 'text-xs text-blue-500';
                        break;
                    case 'completed':
                        if (success) {
                            icon.className = 'fas fa-check-circle text-green-500 mr-3';
                            statusText.textContent = '완료';
                            statusText.className = 'text-xs text-green-500';
                        } else {
                            icon.className = 'fas fa-times-circle text-red-500 mr-3';
                            statusText.textContent = '실패';
                            statusText.className = 'text-xs text-red-500';
                        }
                        break;
                    case 'error':
                        icon.className = 'fas fa-times-circle text-red-500 mr-3';
                        statusText.textContent = '오류';
                        statusText.className = 'text-xs text-red-500';
                        break;
                }
                break;
            }
        }
    }
    
    // =========================== 콘텐츠 자동 개선 시스템 ===========================
    
    showContentImprovementModal() {
        if (this.generatedArticles.length === 0) {
            this.showAlert('개선할 콘텐츠가 없습니다. 먼저 블로그 글을 생성해주세요.', 'error');
            return;
        }
        
        const modal = document.getElementById('contentImprovementModal');
        modal.style.display = 'flex';
        
        // 현재 상태 정보 표시
        document.getElementById('improvementArticleCount').textContent = this.generatedArticles.length;
        
        // 개선 옵션 초기화
        document.getElementById('improveSEO').checked = true;
        document.getElementById('improveReadability').checked = true;
        document.getElementById('improveEngagement').checked = false;
        document.getElementById('improveLength').checked = false;
        document.getElementById('improveStructure').checked = true;
    }
    
    async confirmContentImprovement() {
        
        // 선택된 개선 옵션들 수집
        const improvementOptions = {
            seo: document.getElementById('improveSEO').checked,
            readability: document.getElementById('improveReadability').checked,
            engagement: document.getElementById('improveEngagement').checked,
            length: document.getElementById('improveLength').checked,
            structure: document.getElementById('improveStructure').checked
        };
        
        const selectedOptions = Object.keys(improvementOptions).filter(key => improvementOptions[key]);
        
        if (selectedOptions.length === 0) {
            this.showAlert('최소 하나의 개선 옵션을 선택해주세요.', 'error');
            return;
        }
        
        // 모달 닫기
        document.getElementById('contentImprovementModal').style.display = 'none';
        
        this.showAlert(`${selectedOptions.length}개 영역의 콘텐츠 개선을 시작합니다... 🔧`, 'info');
        
        // 진행 상황 표시 준비
        let improved = 0;
        const total = this.generatedArticles.length;
        
        for (let i = 0; i < this.generatedArticles.length; i++) {
            const article = this.generatedArticles[i];
            
            try {
                const response = await axios.post('/api/auto-improve-content', {
                    article: {
                        title: article.title,
                        content: article.content,
                        keyword: article.keyword
                    },
                    improvementOptions: improvementOptions,
                    mainKeyword: document.getElementById('mainKeyword').value.trim()
                });
                
                if (response.data.success) {
                    const improvedContent = response.data.improvedContent;
                    
                    // 기존 글 업데이트
                    article.title = improvedContent.title;
                    article.content = improvedContent.content;
                    article.modified = true;
                    article.modifiedAt = new Date().toISOString();
                    article.improvedAreas = improvedContent.improvedAreas;
                    article.wordCount = improvedContent.content.replace(/<[^>]*>/g, '').length;
                    
                    improved++;
                    
                    this.showAlert(`${improved}/${total} 글 개선 완료... (${article.keyword})`, 'info');
                } else {
                    console.error(`글 개선 실패 (${article.keyword}):`, response.data.error);
                }
            } catch (error) {
                console.error(`글 개선 오류 (${article.keyword}):`, error);
            }
            
            // 요청 간 지연 (API 제한 방지)
            if (i < this.generatedArticles.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
        }
        
        // 개선 완료 후 결과 표시
        this.showResults();
        this.saveToLocalStorage();
        
        // 분석 재실행
        setTimeout(() => this.analyzeSEO(), 1000);
        setTimeout(() => this.analyzeQuality(), 1500);
        
        this.showAlert(`콘텐츠 자동 개선이 완료되었습니다! (${improved}/${total}개 개선됨) ✨`, 'success');
    }
    
    // ==================== 품질 분석 시스템 ====================

    analyzeContentQuality(content) {
        if (!content || content.trim().length === 0) {
            return {
                overall: 0,
                expertise: 0,
                originality: 0,
                readability: 0,
                engagement: 0,
                actionability: 0,
                details: {}
            };
        }

        const expertise = this.analyzeExpertise(content);
        const originality = this.analyzeOriginality(content);
        const readability = this.analyzeReadability(content);
        const engagement = this.analyzeEngagement(content);
        const actionability = this.analyzeActionability(content);

        // 전체 품질 점수 계산 (가중평균)
        const overall = Math.round(
            (expertise.score * 0.25 +
             originality.score * 0.20 +
             readability.score * 0.25 +
             engagement.score * 0.15 +
             actionability.score * 0.15)
        );

        return {
            overall,
            expertise: expertise.score,
            originality: originality.score,
            readability: readability.score,
            engagement: engagement.score,
            actionability: actionability.score,
            details: {
                expertise: expertise.details,
                originality: originality.details,
                readability: readability.details,
                engagement: engagement.details,
                actionability: actionability.details
            }
        };
    }

    analyzeExpertise(content) {
        const words = content.toLowerCase().split(/\s+/);
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        
        let score = 50; // 기본 점수
        const details = [];

        // 전문 용어 사용도 분석
        const technicalTerms = [
            // 기술 관련
            'api', '데이터베이스', '알고리즘', '인공지능', 'ai', '머신러닝', '딥러닝', 
            '클라우드', '보안', '암호화', '블록체인', '개발', '프로그래밍', '소프트웨어',
            // 마케팅 관련
            'roi', 'kpi', '전환율', '리텐션', '퍼넬', 'cta', '세그먼트', '타겟팅',
            // 비즈니스 관련
            '수익성', '매출', '비용효율', '프로세스', '최적화', '전략', '분석', '성과'
        ];

        const technicalCount = words.filter(word => 
            technicalTerms.some(term => word.includes(term))
        ).length;
        
        if (technicalCount > words.length * 0.05) {
            score += 20;
            details.push('적절한 전문 용어 사용 (+20점)');
        } else if (technicalCount > words.length * 0.02) {
            score += 10;
            details.push('전문 용어 사용 (+10점)');
        }

        // 구체적인 수치나 데이터 제시
        const numberPattern = /\d+(%|원|달러|\$|만|억|천|개|명|시간|분|초|일|주|개월|년|배|번)/g;
        const dataReferences = content.match(numberPattern) || [];
        
        if (dataReferences.length >= 5) {
            score += 15;
            details.push('풍부한 데이터 및 수치 제시 (+15점)');
        } else if (dataReferences.length >= 2) {
            score += 8;
            details.push('적절한 데이터 제시 (+8점)');
        }

        // 출처나 근거 언급
        const sourceKeywords = ['연구', '조사', '보고서', '데이터', '통계', '사례', '예시', '경험'];
        const sourceCount = sourceKeywords.filter(keyword => 
            content.includes(keyword)
        ).length;
        
        if (sourceCount >= 3) {
            score += 10;
            details.push('신뢰할 만한 근거 제시 (+10점)');
        }

        // 문장 길이와 복잡도 (전문성 표현)
        const avgSentenceLength = words.length / sentences.length;
        if (avgSentenceLength >= 15 && avgSentenceLength <= 25) {
            score += 5;
            details.push('적절한 문장 복잡도 (+5점)');
        }

        return {
            score: Math.min(100, Math.max(0, score)),
            details
        };
    }

    analyzeOriginality(content) {
        let score = 60; // 기본 점수
        const details = [];
        
        // 독창적인 관점이나 아이디어 표현
        const originalityKeywords = [
            '새로운 관점', '혁신적', '독특한', '차별화된', '창의적', '새롭게', 
            '다른 방식', '특별한', '획기적', '참신한', '색다른', '개선된'
        ];
        
        const originalityCount = originalityKeywords.filter(keyword => 
            content.includes(keyword)
        ).length;
        
        if (originalityCount >= 3) {
            score += 20;
            details.push('독창적 표현과 아이디어 (+20점)');
        } else if (originalityCount >= 1) {
            score += 10;
            details.push('참신한 관점 제시 (+10점)');
        }

        // 개인적 경험이나 사례 포함
        const personalKeywords = ['경험상', '직접', '실제로', '개인적으로', '저의 경우', '제가'];
        const personalCount = personalKeywords.filter(keyword => 
            content.includes(keyword)
        ).length;
        
        if (personalCount >= 2) {
            score += 15;
            details.push('개인적 경험과 사례 포함 (+15점)');
        }

        // 비교나 대조를 통한 독창적 분석
        const comparisonKeywords = ['반면', '그러나', '대신', '비교하면', '차이점', '반대로'];
        const comparisonCount = comparisonKeywords.filter(keyword => 
            content.includes(keyword)
        ).length;
        
        if (comparisonCount >= 2) {
            score += 10;
            details.push('비교 분석을 통한 깊이 있는 내용 (+10점)');
        }

        // 실용적인 해결책 제시
        const solutionKeywords = ['해결책', '방법', '전략', '팁', '노하우', '비결', '접근법'];
        const solutionCount = solutionKeywords.filter(keyword => 
            content.includes(keyword)
        ).length;
        
        if (solutionCount >= 3) {
            score += 10;
            details.push('실용적 해결책 제시 (+10점)');
        }

        return {
            score: Math.min(100, Math.max(0, score)),
            details
        };
    }

    analyzeReadability(content) {
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const words = content.split(/\s+/).filter(w => w.length > 0);
        
        let score = 70; // 기본 점수
        const details = [];

        // 평균 문장 길이 (15-25단어가 이상적)
        const avgSentenceLength = words.length / sentences.length;
        if (avgSentenceLength >= 10 && avgSentenceLength <= 20) {
            score += 15;
            details.push('적절한 문장 길이 (+15점)');
        } else if (avgSentenceLength > 25) {
            score -= 10;
            details.push('문장이 너무 길어 가독성 저하 (-10점)');
        } else if (avgSentenceLength < 8) {
            score -= 5;
            details.push('문장이 너무 짧아 내용 부족 (-5점)');
        }

        // 문단 구조 (제목과 소제목 사용)
        const headingCount = (content.match(/#{1,3}\s/g) || []).length;
        if (headingCount >= 3) {
            score += 10;
            details.push('체계적인 구조와 제목 사용 (+10점)');
        } else if (headingCount >= 1) {
            score += 5;
            details.push('기본적인 구조 사용 (+5점)');
        }

        // 목록이나 번호 사용 (정보 정리)
        const listItems = (content.match(/^[\s]*[-*\d\.]\s/gm) || []).length;
        if (listItems >= 5) {
            score += 10;
            details.push('목록을 통한 체계적 정보 정리 (+10점)');
        } else if (listItems >= 2) {
            score += 5;
            details.push('목록 사용으로 가독성 향상 (+5점)');
        }

        // 연결어 사용 (문장 간 자연스러운 흐름)
        const connectors = ['또한', '그리고', '하지만', '그러므로', '따라서', '예를 들어', '특히', '마지막으로'];
        const connectorCount = connectors.filter(connector => 
            content.includes(connector)
        ).length;
        
        if (connectorCount >= 4) {
            score += 10;
            details.push('연결어를 통한 자연스러운 문장 흐름 (+10점)');
        }

        // 어려운 한자어나 외래어 비율 체크
        const difficultWords = content.match(/[一-龯]+/g) || []; // 한자
        const difficultWordRatio = difficultWords.length / words.length;
        
        if (difficultWordRatio < 0.05) {
            score += 5;
            details.push('이해하기 쉬운 어휘 사용 (+5점)');
        } else if (difficultWordRatio > 0.15) {
            score -= 5;
            details.push('어려운 어휘가 많아 이해 어려움 (-5점)');
        }

        return {
            score: Math.min(100, Math.max(0, score)),
            details
        };
    }

    analyzeEngagement(content) {
        let score = 50; // 기본 점수
        const details = [];

        // 질문이나 독자 참여 요소
        const questions = (content.match(/[?？]/g) || []).length;
        if (questions >= 3) {
            score += 15;
            details.push('독자 참여를 유도하는 질문 사용 (+15점)');
        } else if (questions >= 1) {
            score += 8;
            details.push('질문을 통한 독자 관심 유도 (+8점)');
        }

        // 감정적 표현이나 강조
        const emotionalWords = ['놀라운', '흥미로운', '중요한', '핵심적인', '결정적인', '놀랍게도', '주목할만한'];
        const emotionalCount = emotionalWords.filter(word => 
            content.includes(word)
        ).length;
        
        if (emotionalCount >= 3) {
            score += 15;
            details.push('감정적 몰입을 높이는 표현 사용 (+15점)');
        }

        // 스토리텔링 요소
        const storyElements = ['이야기', '경험', '사례', '예시', '상황', '결과', '과정'];
        const storyCount = storyElements.filter(element => 
            content.includes(element)
        ).length;
        
        if (storyCount >= 4) {
            score += 20;
            details.push('스토리텔링을 통한 흥미 유발 (+20점)');
        } else if (storyCount >= 2) {
            score += 10;
            details.push('사례를 통한 이해도 증진 (+10점)');
        }

        // 독자와의 직접적 소통
        const directAddress = ['여러분', '당신', '우리', '함께', '같이'];
        const addressCount = directAddress.filter(address => 
            content.includes(address)
        ).length;
        
        if (addressCount >= 3) {
            score += 10;
            details.push('독자와의 친밀한 소통 (+10점)');
        }

        // 행동 유도 문구 (CTA)
        const ctaKeywords = ['해보세요', '시작해보세요', '적용해보세요', '도전해보세요', '확인해보세요'];
        const ctaCount = ctaKeywords.filter(cta => 
            content.includes(cta)
        ).length;
        
        if (ctaCount >= 2) {
            score += 15;
            details.push('독자 행동을 유도하는 표현 (+15점)');
        }

        return {
            score: Math.min(100, Math.max(0, score)),
            details
        };
    }

    analyzeActionability(content) {
        let score = 60; // 기본 점수
        const details = [];

        // 구체적인 단계나 방법 제시
        const stepKeywords = ['단계', '방법', '절차', '과정', '순서'];
        const stepCount = stepKeywords.filter(keyword => 
            content.includes(keyword)
        ).length;
        
        if (stepCount >= 2) {
            score += 20;
            details.push('구체적인 실행 단계 제시 (+20점)');
        }

        // 실용적인 팁이나 도구 언급
        const toolKeywords = ['도구', '툴', '앱', '서비스', '플랫폼', '방법', '기법', '전략'];
        const toolCount = toolKeywords.filter(keyword => 
            content.includes(keyword)
        ).length;
        
        if (toolCount >= 3) {
            score += 15;
            details.push('실용적인 도구와 방법 제시 (+15점)');
        }

        // 체크리스트나 할 일 목록
        const actionVerbs = ['하세요', '확인하세요', '준비하세요', '실행하세요', '적용하세요'];
        const actionCount = actionVerbs.filter(verb => 
            content.includes(verb)
        ).length;
        
        if (actionCount >= 5) {
            score += 15;
            details.push('구체적인 행동 지침 제공 (+15점)');
        } else if (actionCount >= 2) {
            score += 8;
            details.push('행동 지향적 내용 (+8점)');
        }

        // 예시나 템플릿 제공
        const templateKeywords = ['예시', '템플릿', '샘플', '예제', '모델', '양식'];
        const templateCount = templateKeywords.filter(keyword => 
            content.includes(keyword)
        ).length;
        
        if (templateCount >= 2) {
            score += 10;
            details.push('실용적 예시와 템플릿 제공 (+10점)');
        }

        // 측정 가능한 결과나 목표 제시
        const measurementKeywords = ['목표', '결과', '성과', '지표', '측정', '평가', '개선'];
        const measurementCount = measurementKeywords.filter(keyword => 
            content.includes(keyword)
        ).length;
        
        if (measurementCount >= 3) {
            score += 10;
            details.push('측정 가능한 목표와 성과 제시 (+10점)');
        }

        return {
            score: Math.min(100, Math.max(0, score)),
            details
        };
    }

    getQualityScoreColor(score) {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        if (score >= 40) return 'text-orange-600';
        return 'text-red-600';
    }

    getQualityGrade(score) {
        if (score >= 90) return 'A+';
        if (score >= 80) return 'A';
        if (score >= 70) return 'B+';
        if (score >= 60) return 'B';
        if (score >= 50) return 'C+';
        if (score >= 40) return 'C';
        return 'D';
    }

    analyzeQuality() {
        if (this.generatedArticles.length === 0) {
            this.showAlert('분석할 콘텐츠가 없습니다.', 'error');
            return;
        }

        // 전체 콘텐츠를 하나로 합쳐서 분석
        const allContent = this.generatedArticles
            .map(article => `${article.title}\n\n${article.content}`)
            .join('\n\n---\n\n');

        const qualityAnalysis = this.analyzeContentQuality(allContent);
        
        this.displayQualityAnalysis(qualityAnalysis);
        
        // 품질 분석 섹션 표시
        document.getElementById('qualityAnalysisSection').style.display = 'block';
        
        // 품질 분석 섹션으로 스크롤 (부드럽게)
        setTimeout(() => {
            document.getElementById('qualityAnalysisSection').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 100);
    }

    displayQualityAnalysis(analysis) {
        // 종합 점수 표시
        document.getElementById('overallQualityScore').textContent = analysis.overall;
        document.getElementById('overallQualityGrade').textContent = this.getQualityGrade(analysis.overall);
        document.getElementById('expertiseScore').textContent = analysis.expertise;
        document.getElementById('originalityScore').textContent = analysis.originality;
        document.getElementById('readabilityQualityScore').textContent = analysis.readability;
        document.getElementById('engagementScore').textContent = analysis.engagement;
        document.getElementById('actionabilityScore').textContent = analysis.actionability;

        // 상세 분석 결과 표시
        this.displayQualityDetails('expertiseAnalysis', analysis.details.expertise, analysis.expertise);
        this.displayQualityDetails('originalityAnalysis', analysis.details.originality, analysis.originality);
        this.displayQualityDetails('readabilityQualityAnalysis', analysis.details.readability, analysis.readability);
        this.displayQualityDetails('engagementAnalysis', analysis.details.engagement, analysis.engagement);
        this.displayQualityDetails('actionabilityAnalysis', analysis.details.actionability, analysis.actionability);

        // 품질 개선 제안 생성 및 표시
        this.generateQualitySuggestions(analysis);
    }

    displayQualityDetails(containerId, details, score) {
        const container = document.getElementById(containerId);
        const colorClass = this.getQualityScoreColor(score);
        
        container.innerHTML = `
            <div class="mb-3">
                <div class="flex items-center justify-between mb-2">
                    <span class="font-semibold text-gray-700">점수</span>
                    <span class="font-bold text-lg ${colorClass}">${score}점</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="h-2 rounded-full transition-all duration-500 ${this.getQualityProgressClass(score)}" 
                         style="width: ${score}%"></div>
                </div>
            </div>
            <div class="space-y-2">
                ${details.length > 0 ? 
                    details.map(detail => `
                        <div class="flex items-start">
                            <i class="fas fa-check-circle text-green-500 text-sm mt-0.5 mr-2"></i>
                            <span class="text-sm text-gray-700">${detail}</span>
                        </div>
                    `).join('') : 
                    '<div class="text-sm text-gray-500">특별한 특징이 발견되지 않았습니다.</div>'
                }
            </div>
        `;
    }

    getQualityProgressClass(score) {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        if (score >= 40) return 'bg-orange-500';
        return 'bg-red-500';
    }

    generateQualitySuggestions(analysis) {
        const suggestions = [];
        
        // 각 카테고리별 개선 제안
        if (analysis.expertise < 70) {
            suggestions.push("📚 전문성 향상: 더 구체적인 데이터, 통계, 전문 용어를 활용하세요.");
            suggestions.push("🔍 신뢰성 강화: 출처와 근거를 명확히 제시하세요.");
        }
        
        if (analysis.originality < 70) {
            suggestions.push("💡 독창성 증진: 개인적 경험이나 독특한 관점을 더 많이 포함하세요.");
            suggestions.push("🆕 차별화: 기존과 다른 새로운 접근법을 시도해보세요.");
        }
        
        if (analysis.readability < 70) {
            suggestions.push("📖 가독성 개선: 문장 길이를 적절히 조절하고 연결어를 활용하세요.");
            suggestions.push("🎯 구조화: 제목과 목록을 더 체계적으로 사용하세요.");
        }
        
        if (analysis.engagement < 70) {
            suggestions.push("❓ 참여도 증진: 독자에게 질문을 던지고 감정적 표현을 늘리세요.");
            suggestions.push("📖 스토리텔링: 더 많은 사례와 이야기를 포함하세요.");
        }
        
        if (analysis.actionability < 70) {
            suggestions.push("✅ 실행가능성 강화: 구체적인 단계와 실용적 도구를 제시하세요.");
            suggestions.push("🎯 행동유도: 독자가 바로 실행할 수 있는 명확한 가이드를 제공하세요.");
        }

        // 전체적인 개선 제안
        if (analysis.overall < 80) {
            suggestions.push("🚀 전체 품질 향상: 각 섹션의 밸런스를 맞추고 일관성을 유지하세요.");
        }
        
        const container = document.getElementById('qualitySuggestions');
        if (suggestions.length > 0) {
            container.innerHTML = `
                <ul class="space-y-2">
                    ${suggestions.map(suggestion => `
                        <li class="flex items-start">
                            <i class="fas fa-lightbulb text-yellow-600 mr-2 mt-1 text-sm"></i>
                            <span class="text-sm">${suggestion}</span>
                        </li>
                    `).join('')}
                </ul>
            `;
        } else {
            container.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-star text-yellow-600 mr-2"></i>
                    <span class="text-sm">훌륭합니다! 콘텐츠 품질이 매우 우수합니다.</span>
                </div>
            `;
        }
    }

    showAlert(message, type = 'info') {
        // 간단한 알림 표시
        const alertColors = {
            success: 'bg-green-100 border-green-500 text-green-700',
            error: 'bg-red-100 border-red-500 text-red-700',
            info: 'bg-blue-100 border-blue-500 text-blue-700',
            warning: 'bg-yellow-100 border-yellow-500 text-yellow-700'
        };

        const alertDiv = document.createElement('div');
        alertDiv.className = `fixed top-4 right-4 z-50 p-4 border-l-4 rounded ${alertColors[type]} shadow-lg max-w-sm`;
        alertDiv.innerHTML = `
            <div class="flex items-center">
                <span class="mr-2">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-auto">
                    <i class="fas fa-times text-sm opacity-50 hover:opacity-100"></i>
                </button>
            </div>
        `;

        document.body.appendChild(alertDiv);

        // 5초 후 자동 제거
        setTimeout(() => {
            if (alertDiv.parentElement) {
                alertDiv.remove();
            }
        }, 5000);
    }

    // 🚀 실시간 상태 표시기 시스템
    showProgressIndicator(button, message) {
        button.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>${message}`;
        button.disabled = true;
        button.classList.add('opacity-75', 'cursor-not-allowed');
    }

    hideProgressIndicator(button, originalText) {
        button.innerHTML = originalText;
        button.disabled = false;
        button.classList.remove('opacity-75', 'cursor-not-allowed');
    }

    // 📊 성능 요약 표시
    showGenerationSummary() {
        if (this.generatedArticles.length === 0) return;

        const totalTime = this.generatedArticles.reduce((sum, article) => sum + (article.generationTime || 0), 0);
        const avgTime = Math.round(totalTime / this.generatedArticles.length);
        const successCount = this.generatedArticles.length;
        
        // 품질 점수 계산
        const qualityScores = this.generatedArticles
            .map(a => a.quality?.overallScore)
            .filter(score => score !== undefined);
        const avgQuality = qualityScores.length > 0 ? 
            Math.round(qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length) : 0;

        // 사용된 모델 통계
        const modelStats = {};
        this.generatedArticles.forEach(article => {
            const model = article.performance?.successfulModel || article.performance?.usedModel || 'Unknown';
            modelStats[model] = (modelStats[model] || 0) + 1;
        });

        const summaryHtml = `
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 class="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                    <i class="fas fa-chart-line mr-2"></i>
                    생성 완료 요약
                </h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div class="bg-white rounded-lg p-3 text-center">
                        <div class="text-2xl font-bold text-green-600">${successCount}</div>
                        <div class="text-gray-600">생성된 글</div>
                    </div>
                    <div class="bg-white rounded-lg p-3 text-center">
                        <div class="text-2xl font-bold text-blue-600">${avgTime}ms</div>
                        <div class="text-gray-600">평균 생성시간</div>
                    </div>
                    <div class="bg-white rounded-lg p-3 text-center">
                        <div class="text-2xl font-bold text-purple-600">${avgQuality}</div>
                        <div class="text-gray-600">평균 품질점수</div>
                    </div>
                    <div class="bg-white rounded-lg p-3 text-center">
                        <div class="text-lg font-bold text-orange-600">${Object.keys(modelStats).length}</div>
                        <div class="text-gray-600">사용된 모델</div>
                    </div>
                </div>
                ${Object.keys(modelStats).length > 0 ? `
                    <div class="mt-3 pt-3 border-t border-blue-100">
                        <div class="flex flex-wrap gap-2">
                            <span class="text-sm text-gray-600 mr-2">사용 모델:</span>
                            ${Object.entries(modelStats).map(([model, count]) => 
                                `<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">${model} (${count})</span>`
                            ).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        // 결과 섹션 상단에 요약 삽입
        const resultsSection = document.getElementById('generatedContent');
        resultsSection.insertAdjacentHTML('afterbegin', summaryHtml);
    }

    // 💡 품질 개선 제안 표시
    showQualitySuggestions(suggestions, type) {
        if (!suggestions || suggestions.length === 0) return;

        const typeNames = {
            'keyword': '키워드',
            'content': '콘텐츠'
        };

        const suggestionHtml = `
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h5 class="text-md font-semibold text-yellow-800 mb-2 flex items-center">
                    <i class="fas fa-lightbulb mr-2"></i>
                    ${typeNames[type]} 품질 개선 제안
                </h5>
                <ul class="text-sm text-yellow-700 space-y-1">
                    ${suggestions.map(suggestion => `
                        <li class="flex items-start">
                            <i class="fas fa-arrow-right text-yellow-500 mr-2 mt-0.5 text-xs"></i>
                            <span>${suggestion}</span>
                        </li>
                    `).join('')}
                </ul>
                <button onclick="this.parentElement.style.display='none'" 
                        class="mt-2 text-xs text-yellow-600 hover:text-yellow-800 underline">
                    확인했습니다
                </button>
            </div>
        `;

        // 적절한 위치에 제안 삽입
        if (type === 'keyword') {
            const section = document.getElementById('subKeywordsSection');
            if (section) section.insertAdjacentHTML('afterbegin', suggestionHtml);
        } else {
            const section = document.getElementById('resultsSection');
            if (section) section.insertAdjacentHTML('afterbegin', suggestionHtml);
        }
    }

    // 📈 실시간 API 성능 모니터링
    updateAPIPerformanceStats(response) {
        if (!response.data.performance) return;

        const perf = response.data.performance;
        const statsHtml = `
            <div class="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                <div class="grid grid-cols-2 gap-2">
                    <div>⏱️ 응답시간: ${perf.totalTime}</div>
                    <div>🔄 재시도: ${perf.totalRetries || 0}회</div>
                    <div>🤖 모델: ${perf.successfulModel || perf.usedModel}</div>
                    <div>📡 API 시도: ${perf.apiAttempts}회</div>
                </div>
            </div>
        `;

        // 성능 통계를 어디에 표시할지 결정
        return statsHtml;
    }

    // 🎯 고급 품질 분석 표시
    displayQualityAnalysis(analysis, containerId) {
        if (!analysis || !containerId) return;

        const container = document.getElementById(containerId);
        if (!container) return;

        const qualityHtml = `
            <div class="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-2">
                <h6 class="font-semibold text-purple-800 mb-2 flex items-center text-sm">
                    <i class="fas fa-award mr-1"></i>품질 분석
                </h6>
                <div class="grid grid-cols-2 gap-2 text-xs">
                    <div class="bg-white rounded p-2 text-center">
                        <div class="font-bold text-purple-600">${analysis.overallScore || analysis.diversityScore || 0}</div>
                        <div class="text-gray-600">종합점수</div>
                    </div>
                    <div class="bg-white rounded p-2 text-center">
                        <div class="font-bold text-blue-600">${analysis.relevanceScore || analysis.seoScore || 0}</div>
                        <div class="text-gray-600">${analysis.relevanceScore ? '관련성' : 'SEO'}</div>
                    </div>
                </div>
                ${analysis.suggestions && analysis.suggestions.length > 0 ? `
                    <div class="mt-2 pt-2 border-t border-purple-100">
                        <div class="text-xs text-purple-700">
                            <strong>개선 제안:</strong> ${analysis.suggestions[0]}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        container.insertAdjacentHTML('beforeend', qualityHtml);
    }

    // 설정된 API 키들 가져오기
    getSettings() {
        return {
            claudeApiKey: localStorage.getItem('claude_api_key'),
            geminiApiKey: localStorage.getItem('gemini_api_key'),
            openaiApiKey: localStorage.getItem('openai_api_key')
        };
    }

    // API 키 상태 확인 메서드
    async checkApiKeyStatus() {
        try {
            const response = await fetch('/api/check-api-keys');
            const result = await response.json();
            
            const statusSection = document.getElementById('apiKeyStatusSection');
            const messageElement = document.getElementById('apiKeyMessage');
            
            // 로컬 설정 확인
            const settings = this.getSettings();
            const hasLocalKeys = settings.claudeApiKey || settings.geminiApiKey || settings.openaiApiKey;
            
            if (result.configured) {
                // 환경 변수에 API 키가 설정된 경우 - 알림 완전히 숨김
                if (statusSection) {
                    statusSection.style.display = 'none';
                }
                // 환경 변수 설정 상태를 모니터링에 반영
                this.updateEnvironmentApiStatus(result);
                
                // 성공 알림 표시 (한 번만)
                if (!this.environmentAlertShown) {
                    this.showAlert('환경 변수에서 API 키가 감지되었습니다! 🔐', 'success');
                    this.environmentAlertShown = true;
                }
            } else if (hasLocalKeys) {
                // 로컬에 API 키가 있는 경우 - 알림 숨김
                if (statusSection) {
                    statusSection.style.display = 'none';
                }
                // 실시간 모니터링 상태 업데이트
                this.updateLocalApiStatus();
            } else {
                // 환경 변수와 로컬 모두 설정되지 않은 경우 - 알림 표시
                if (messageElement) {
                    messageElement.innerHTML = `
                        ${result.message}<br>
                        <small class="text-yellow-600">💡 <strong>팁:</strong> 환경 변수 설정 또는 아래 '설정' 버튼에서 API 키를 입력하실 수 있습니다.</small>
                    `;
                }
                if (statusSection) {
                    statusSection.style.display = 'block';
                }
            }
        } catch (error) {
            console.error('API 키 상태 확인 실패:', error);
            // 네트워크 오류 등의 경우 로컬 설정만 확인
            const settings = this.getSettings();
            const hasLocalKeys = settings.claudeApiKey || settings.geminiApiKey || settings.openaiApiKey;
            
            const statusSection = document.getElementById('apiKeyStatusSection');
            if (statusSection) {
                statusSection.style.display = hasLocalKeys ? 'none' : 'block';
            }
        }
    }

    // 로컬 API 키 상태 업데이트
    updateLocalApiStatus() {
        const settings = this.getSettings();
        
        // 각 API 상태 업데이트
        if (typeof systemMonitor !== 'undefined') {
            systemMonitor.updateAPIStatus('claude', settings.claudeApiKey ? 'configured' : 'not_configured');
            systemMonitor.updateAPIStatus('gemini', settings.geminiApiKey ? 'configured' : 'not_configured');
            systemMonitor.updateAPIStatus('openai', settings.openaiApiKey ? 'configured' : 'not_configured');
        }
    }

    // 환경 변수 API 키 상태 업데이트
    updateEnvironmentApiStatus(result) {
        if (typeof systemMonitor !== 'undefined') {
            // 환경 변수로 설정된 경우 'active' 상태로 표시 (초록색)
            systemMonitor.updateAPIStatus('claude', result.details.claude === '설정됨' ? 'active' : 'not_configured');
            systemMonitor.updateAPIStatus('gemini', result.details.gemini === '설정됨' ? 'active' : 'not_configured');
            systemMonitor.updateAPIStatus('openai', result.details.openai === '설정됨' ? 'active' : 'not_configured');
        }
    }

    // ==================== 글 관리 기능들 ====================

    // 글 편집 모드 진입
    editArticle(articleId) {
        const article = this.generatedArticles.find(a => a.id == articleId);
        if (!article) {
            this.showAlert('글을 찾을 수 없습니다.', 'error');
            return;
        }

        const articleElement = document.querySelector(`[data-article-id="${articleId}"]`);
        if (!articleElement) return;

        // 편집 UI 생성
        const editContainer = document.createElement('div');
        editContainer.className = 'article-editor mt-4 p-4';
        editContainer.innerHTML = `
            <div class="edit-toolbar">
                <button class="toolbar-btn" onclick="blogGenerator.previewArticle('${articleId}')">
                    <i class="fas fa-eye"></i> 미리보기
                </button>
                <button class="toolbar-btn" onclick="blogGenerator.saveArticleEdit('${articleId}')">
                    <i class="fas fa-save"></i> 저장
                </button>
                <button class="toolbar-btn" onclick="blogGenerator.cancelArticleEdit('${articleId}')">
                    <i class="fas fa-times"></i> 취소
                </button>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">제목</label>
                    <input type="text" id="edit-title-${articleId}" value="${article.title.replace(/"/g, '&quot;')}" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <label class="block text-sm font-medium text-gray-700 mt-4 mb-2">내용</label>
                    <textarea id="edit-content-${articleId}" class="editor-textarea">${article.content}</textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">미리보기</label>
                    <div id="edit-preview-${articleId}" class="editor-preview">
                        ${this.markdownToHtml(article.content)}
                    </div>
                </div>
            </div>
        `;

        // 기존 콘텐츠 숨기기
        const contentElement = articleElement.querySelector('.article-content');
        contentElement.style.display = 'none';

        // 편집 UI 추가
        articleElement.appendChild(editContainer);

        // 실시간 미리보기
        const contentTextarea = document.getElementById(`edit-content-${articleId}`);
        contentTextarea.addEventListener('input', () => {
            const previewDiv = document.getElementById(`edit-preview-${articleId}`);
            previewDiv.innerHTML = this.markdownToHtml(contentTextarea.value);
        });

        this.showAlert('편집 모드로 전환되었습니다. 📝', 'info');
    }

    // 글 편집 저장
    async saveArticleEdit(articleId) {
        const titleInput = document.getElementById(`edit-title-${articleId}`);
        const contentTextarea = document.getElementById(`edit-content-${articleId}`);
        
        if (!titleInput || !contentTextarea) {
            this.showAlert('편집 데이터를 찾을 수 없습니다.', 'error');
            return;
        }

        const newTitle = titleInput.value.trim();
        const newContent = contentTextarea.value.trim();

        if (!newTitle || !newContent) {
            this.showAlert('제목과 내용을 모두 입력해주세요.', 'error');
            return;
        }

        try {
            // 서버에 저장 요청
            const response = await axios.put(`/api/articles/${articleId}/edit`, {
                title: newTitle,
                content: newContent
            });

            if (response.data.success) {
                // 로컬 데이터 업데이트
                const article = this.generatedArticles.find(a => a.id == articleId);
                if (article) {
                    article.title = newTitle;
                    article.content = newContent;
                    article.wordCount = newContent.replace(/<[^>]*>/g, '').length;
                    article.modified = true;
                    article.lastModified = new Date().toISOString();
                }

                // UI 업데이트
                this.cancelArticleEdit(articleId);
                this.showResults();
                this.saveToLocalStorage();

                this.showAlert('글이 성공적으로 저장되었습니다! ✅', 'success');
            } else {
                this.showAlert('저장에 실패했습니다: ' + response.data.error, 'error');
            }
        } catch (error) {
            console.error('글 저장 오류:', error);
            this.showAlert('저장 중 오류가 발생했습니다.', 'error');
        }
    }

    // 글 편집 취소
    cancelArticleEdit(articleId) {
        const articleElement = document.querySelector(`[data-article-id="${articleId}"]`);
        if (!articleElement) return;

        // 편집 UI 제거
        const editContainer = articleElement.querySelector('.article-editor');
        if (editContainer) {
            editContainer.remove();
        }

        // 원래 콘텐츠 표시
        const contentElement = articleElement.querySelector('.article-content');
        contentElement.style.display = 'block';

        this.showAlert('편집이 취소되었습니다.', 'info');
    }

    // 글 이미지 생성
    async generateArticleImage(articleId) {
        console.log('🖼️ generateArticleImage() 호출됨, articleId:', articleId);
        console.log('📊 현재 글 목록:', this.generatedArticles.map(a => ({ id: a.id, title: a.title })));
        
        const article = this.generatedArticles.find(a => a.id == articleId);
        if (!article) {
            console.error('❌ 글을 찾을 수 없음. 요청 ID:', articleId);
            this.showAlert('글을 찾을 수 없습니다.', 'error');
            return;
        }

        const button = document.querySelector(`[onclick="blogGenerator.generateArticleImage('${articleId}')"]`);
        if (!button) return;
        
        const originalText = button.innerHTML;
        
        try {
            button.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>생성중...';
            button.disabled = true;

            const response = await axios.post(`/api/articles/${articleId}/generate-image`, {
                keyword: article.keyword,
                title: article.title,
                articleContent: article.content
            });

            if (response.data.success) {
                const imageData = response.data.image;
                
                // 글에 이미지 정보 추가
                article.image = imageData;
                
                // UI 업데이트
                this.showResults();
                this.saveToLocalStorage();

                // 개선된 성공 메시지
                const imageType = imageData.isProfessionalPhoto ? '고품질 전문 사진' : '이미지';
                this.showAlert(`"${article.keyword}" 키워드로 ${imageType}이 생성되었습니다! 📸✨`, 'success');
            } else {
                this.showAlert('이미지 생성에 실패했습니다: ' + response.data.error, 'error');
            }
        } catch (error) {
            console.error('이미지 생성 오류:', error);
            this.showAlert('이미지 생성 중 오류가 발생했습니다.', 'error');
        } finally {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }

    // 글 복제
    async duplicateArticle(articleId) {
        console.log('📋 duplicateArticle() 호출됨, articleId:', articleId);
        console.log('📊 현재 글 목록:', this.generatedArticles.map(a => ({ id: a.id, title: a.title })));
        
        const article = this.generatedArticles.find(a => a.id == articleId);
        if (!article) {
            console.error('❌ 글을 찾을 수 없음. 요청 ID:', articleId);
            this.showAlert('글을 찾을 수 없습니다.', 'error');
            return;
        }

        try {
            const response = await axios.post(`/api/articles/${articleId}/duplicate`, {
                title: article.title,
                content: article.content,
                keyword: article.keyword
            });

            if (response.data.success) {
                const duplicatedArticle = response.data.article;
                
                // 추가 정보 설정
                duplicatedArticle.wordCount = article.wordCount;
                duplicatedArticle.generationTime = article.generationTime;
                duplicatedArticle.performance = { ...article.performance };
                
                // 이미지가 있다면 복사
                if (article.image) {
                    duplicatedArticle.image = { ...article.image };
                }

                // 배열에 추가
                this.generatedArticles.push(duplicatedArticle);
                
                // UI 업데이트
                this.showResults();
                this.saveToLocalStorage();

                this.showAlert(`"${article.title}"이 복제되었습니다! 📋`, 'success');
            } else {
                this.showAlert('복제에 실패했습니다: ' + response.data.error, 'error');
            }
        } catch (error) {
            console.error('글 복제 오류:', error);
            this.showAlert('복제 중 오류가 발생했습니다.', 'error');
        }
    }

    // 글 삭제
    async deleteArticle(articleId) {
        console.log('🗑️ deleteArticle() 호출됨, articleId:', articleId);
        console.log('📊 현재 글 목록:', this.generatedArticles.map(a => ({ id: a.id, title: a.title })));
        
        const article = this.generatedArticles.find(a => a.id == articleId);
        if (!article) {
            console.error('❌ 글을 찾을 수 없음. 요청 ID:', articleId);
            this.showAlert('글을 찾을 수 없습니다.', 'error');
            return;
        }

        const confirmed = confirm(`"${article.title}"을(를) 정말 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`);
        if (!confirmed) return;

        try {
            const response = await axios.delete(`/api/articles/${articleId}`);

            if (response.data.success) {
                // 배열에서 제거
                this.generatedArticles = this.generatedArticles.filter(a => a.id != articleId);
                
                // UI 업데이트
                this.showResults();
                this.saveToLocalStorage();

                this.showAlert(`"${article.title}"이 삭제되었습니다. 🗑️`, 'info');
            } else {
                this.showAlert('삭제에 실패했습니다: ' + response.data.error, 'error');
            }
        } catch (error) {
            console.error('글 삭제 오류:', error);
            this.showAlert('삭제 중 오류가 발생했습니다.', 'error');
        }
    }

    // 글 미리보기 (편집 중)
    previewArticle(articleId) {
        const contentTextarea = document.getElementById(`edit-content-${articleId}`);
        if (!contentTextarea) return;

        const previewDiv = document.getElementById(`edit-preview-${articleId}`);
        previewDiv.innerHTML = this.markdownToHtml(contentTextarea.value);
        
        // 미리보기 영역으로 스크롤
        previewDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // 편집 뷰 전환 (편집/미리보기/분할)
    switchEditView(articleId, viewType) {
        console.log('🔄 switchEditView() 호출됨, articleId:', articleId, 'viewType:', viewType);
        
        const editOnly = document.getElementById(`edit-only-${articleId}`);
        const previewOnly = document.getElementById(`preview-only-${articleId}`);
        const splitView = document.getElementById(`split-view-${articleId}`);
        
        // 모든 뷰 숨기기
        if (editOnly) editOnly.style.display = 'none';
        if (previewOnly) previewOnly.style.display = 'none';
        if (splitView) splitView.style.display = 'none';
        
        // 선택된 뷰 표시
        switch (viewType) {
            case 'edit':
                if (editOnly) editOnly.style.display = 'block';
                break;
            case 'preview':
                if (previewOnly) previewOnly.style.display = 'block';
                // 미리보기 업데이트
                this.updatePreview(articleId);
                break;
            case 'split':
                if (splitView) splitView.style.display = 'block';
                // 분할 보기 미리보기 업데이트
                this.updateSplitPreview(articleId);
                break;
        }
    }

    // 제목 업데이트
    updateTitle(articleId) {
        console.log('✏️ updateTitle() 호출됨, articleId:', articleId);
        const titleInput = document.getElementById(`title-input-${articleId}`);
        const titleDisplay = document.getElementById(`title-${articleId}`);
        
        if (titleInput && titleDisplay) {
            titleDisplay.textContent = titleInput.value;
        }
    }

    // 자동 저장
    autoSave(articleId) {
        console.log('💾 autoSave() 호출됨, articleId:', articleId);
        // 간단한 자동 저장 (로컬 스토리지 업데이트)
        const article = this.generatedArticles.find(a => a.id == articleId);
        if (article) {
            const textarea = document.getElementById(`content-textarea-${articleId}`);
            if (textarea) {
                article.content = textarea.value;
                article.modified = true;
                article.modifiedAt = new Date().toISOString();
                this.saveToLocalStorage();
            }
        }
    }

    // 분할 보기 미리보기 업데이트
    updateSplitPreview(articleId) {
        console.log('🔄 updateSplitPreview() 호출됨, articleId:', articleId);
        const textarea = document.getElementById(`content-textarea-split-${articleId}`);
        const preview = document.getElementById(`preview-split-${articleId}`);
        
        if (textarea && preview) {
            preview.innerHTML = this.markdownToHtml(textarea.value);
        }
    }

    // 미리보기 업데이트
    updatePreview(articleId) {
        const textarea = document.getElementById(`content-textarea-${articleId}`);
        const preview = document.getElementById(`preview-${articleId}`);
        
        if (textarea && preview) {
            preview.innerHTML = this.markdownToHtml(textarea.value);
        }
    }

    // 마크다운 삽입
    insertMarkdown(articleId, type) {
        console.log('📝 insertMarkdown() 호출됨, articleId:', articleId, 'type:', type);
        const textarea = document.getElementById(`content-textarea-${articleId}`) || 
                          document.getElementById(`content-textarea-split-${articleId}`);
        
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        let replacement = '';

        switch (type) {
            case 'bold':
                replacement = `**${selectedText || '굵은 텍스트'}**`;
                break;
            case 'italic':
                replacement = `*${selectedText || '기울임 텍스트'}*`;
                break;
            case 'heading':
                replacement = `## ${selectedText || '제목'}`;
                break;
        }

        textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
        textarea.focus();
        
        // 자동 저장 호출
        this.autoSave(articleId);
    }

    // 🧪 테스트용 더미 데이터 생성 함수
    createTestArticles() {
        console.log('🧪 테스트용 더미 글 생성 중...');
        this.generatedArticles = [
            {
                id: 1,
                title: "테스트 글 1: 여행 가이드",
                keyword: "여행",
                content: "# 여행 가이드\n\n이것은 테스트용 글입니다.\n\n## 주요 내용\n\n1. 여행 계획 수립\n2. 준비물 체크리스트\n3. 안전 수칙\n\n**테스트 완료!**",
                wordCount: 150,
                createdAt: new Date().toISOString(),
                modified: false
            },
            {
                id: 2,
                title: "테스트 글 2: 요리 레시피",
                keyword: "요리",
                content: "# 요리 레시피\n\n이것은 두 번째 테스트용 글입니다.\n\n## 재료\n\n- 재료 1\n- 재료 2\n- 재료 3\n\n**맛있게 드세요!**",
                wordCount: 120,
                createdAt: new Date().toISOString(),
                modified: false
            }
        ];
        
        console.log('🧪 더미 글 생성 완료:', this.generatedArticles.length, '개');
        this.showResults();
    }

    // ===== 편집 관련 헬퍼 메서드들 =====
    
    switchEditView(articleId, viewType) {
        console.log(`🔀 switchEditView() 호출됨: articleId=${articleId}, viewType=${viewType}`);
        
        const editOnly = document.getElementById(`edit-only-${articleId}`);
        const previewOnly = document.getElementById(`preview-only-${articleId}`);
        const splitView = document.getElementById(`split-view-${articleId}`);
        
        // 모든 뷰 숨기기
        if (editOnly) editOnly.style.display = 'none';
        if (previewOnly) previewOnly.style.display = 'none';
        if (splitView) splitView.style.display = 'none';
        
        // 선택한 뷰 표시
        switch (viewType) {
            case 'edit':
                if (editOnly) editOnly.style.display = 'block';
                break;
            case 'preview':
                if (previewOnly) previewOnly.style.display = 'block';
                this.updatePreview(articleId);
                break;
            case 'split':
                if (splitView) splitView.style.display = 'block';
                this.updateSplitPreview(articleId);
                break;
        }
        
        // 툴바 버튼 활성화 상태 업데이트
        const toolbar = document.querySelector(`#edit-mode-${articleId} .edit-toolbar`);
        if (toolbar) {
            toolbar.querySelectorAll('.toolbar-btn').forEach(btn => btn.classList.remove('active'));
            const activeBtn = toolbar.querySelector(`[onclick*="${viewType}"]`);
            if (activeBtn) activeBtn.classList.add('active');
        }
    }
    
    updateTitle(articleId) {
        console.log(`📝 updateTitle() 호출됨: articleId=${articleId}`);
        
        const titleInput = document.getElementById(`title-input-${articleId}`);
        const titleDisplay = document.getElementById(`title-${articleId}`);
        
        if (titleInput && titleDisplay) {
            const newTitle = titleInput.value.trim();
            titleDisplay.textContent = newTitle;
            
            // 메모리의 글 데이터도 업데이트
            const article = this.generatedArticles.find(a => a.id === articleId);
            if (article) {
                article.title = newTitle;
                article.modified = true;
                article.modifiedAt = new Date().toISOString();
            }
        }
    }
    
    autoSave(articleId) {
        console.log(`💾 autoSave() 호출됨: articleId=${articleId}`);
        
        const article = this.generatedArticles.find(a => a.id === articleId);
        if (!article) return;
        
        const contentTextarea = document.getElementById(`content-textarea-${articleId}`);
        if (contentTextarea) {
            article.content = contentTextarea.value;
            article.modified = true;
            article.modifiedAt = new Date().toISOString();
            
            // 로컬 저장소에 자동 저장
            this.saveToLocalStorage();
            
            // 분할 뷰가 활성화되어 있다면 미리보기 업데이트
            const splitView = document.getElementById(`split-view-${articleId}`);
            if (splitView && splitView.style.display !== 'none') {
                this.updateSplitPreview(articleId);
            }
        }
    }
    
    updateSplitPreview(articleId) {
        console.log(`🔄 updateSplitPreview() 호출됨: articleId=${articleId}`);
        
        const contentTextarea = document.getElementById(`content-textarea-split-${articleId}`);
        const previewDiv = document.getElementById(`preview-split-${articleId}`);
        
        if (contentTextarea && previewDiv) {
            const content = contentTextarea.value;
            previewDiv.innerHTML = this.markdownToHtml(content);
            
            // 메모리의 글 데이터도 업데이트
            const article = this.generatedArticles.find(a => a.id === articleId);
            if (article) {
                article.content = content;
                article.modified = true;
                article.modifiedAt = new Date().toISOString();
            }
        }
    }
    
    updatePreview(articleId) {
        console.log(`👀 updatePreview() 호출됨: articleId=${articleId}`);
        
        const contentTextarea = document.getElementById(`content-textarea-${articleId}`);
        const previewDiv = document.getElementById(`preview-${articleId}`);
        
        if (contentTextarea && previewDiv) {
            const content = contentTextarea.value;
            previewDiv.innerHTML = this.markdownToHtml(content);
        }
    }
    
    insertMarkdown(articleId, type) {
        console.log(`✏️ insertMarkdown() 호출됨: articleId=${articleId}, type=${type}`);
        
        // 현재 활성화된 텍스트 영역 찾기
        let textarea = document.getElementById(`content-textarea-${articleId}`);
        const splitView = document.getElementById(`split-view-${articleId}`);
        
        if (splitView && splitView.style.display !== 'none') {
            textarea = document.getElementById(`content-textarea-split-${articleId}`);
        }
        
        if (!textarea) return;
        
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        let replacement = '';
        
        switch (type) {
            case 'bold':
                replacement = `**${selectedText || '굵은 텍스트'}**`;
                break;
            case 'italic':
                replacement = `*${selectedText || '기울임 텍스트'}*`;
                break;
            case 'heading':
                replacement = `## ${selectedText || '제목'}`;
                break;
            case 'link':
                replacement = `[${selectedText || '링크 텍스트'}](URL)`;
                break;
            case 'list':
                replacement = `- ${selectedText || '목록 항목'}`;
                break;
            case 'code':
                replacement = `\`${selectedText || '코드'}\``;
                break;
        }
        
        // 텍스트 교체
        textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
        
        // 커서 위치 조정
        const newCursorPos = start + replacement.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
        
        // 자동 저장 실행
        this.autoSave(articleId);
    }
}

// 글로벌 함수들 - HTML에서 직접 호출되는 함수들
function openProjectModal() {
    blogGenerator.openProjectModal();
}

function closeProjectModal() {
    blogGenerator.closeProjectModal();
}

function showProjectTab(tabName) {
    blogGenerator.showProjectTab(tabName);
}

function saveProject() {
    const projectName = document.getElementById('projectName').value.trim();
    const projectCategory = document.getElementById('projectCategory').value;
    const projectDescription = document.getElementById('projectDescription').value.trim();
    
    if (!projectName) {
        blogGenerator.showAlert('프로젝트 이름을 입력해주세요.', 'error');
        return;
    }
    
    blogGenerator.saveCurrentProject(projectName, projectCategory, projectDescription);
}

function loadProjectFile() {
    const fileInput = document.getElementById('projectFile');
    const file = fileInput.files[0];
    
    if (!file) {
        blogGenerator.showAlert('파일을 선택해주세요.', 'error');
        return;
    }
    
    blogGenerator.loadProjectFromFile(file);
}

function exportProject() {
    blogGenerator.exportCurrentProject();
}

function savePreset() {
    const presetName = document.getElementById('presetName').value.trim();
    if (!presetName) {
        blogGenerator.showAlert('프리셋 이름을 입력해주세요.', 'error');
        return;
    }
    
    blogGenerator.saveSettingsPreset(presetName);
}

function addFavoriteKeyword() {
    const keyword = document.getElementById('favoriteKeywordInput').value.trim();
    if (!keyword) {
        blogGenerator.showAlert('키워드를 입력해주세요.', 'error');
        return;
    }
    
    blogGenerator.addFavoriteKeyword(keyword);
    document.getElementById('favoriteKeywordInput').value = ''; // 입력창 초기화
}

// 🔥 실시간 시스템 모니터링 클래스
class SystemMonitor {
    constructor() {
        this.isMonitoring = false;
        this.monitoringInterval = null;
        this.performanceData = [];
        this.maxDataPoints = 20;
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        const toggleBtn = document.getElementById('toggleMonitoring');
        const refreshBtn = document.getElementById('refreshSystemStatus');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggleMonitoring();
            });
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshSystemStatus();
            });
        }

        // 시스템 모니터링 섹션 표시 버튼 추가
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSystemMonitoring();
            });
        }
    }

    showSystemMonitoring() {
        const section = document.getElementById('systemMonitoringSection');
        if (section) {
            section.style.display = section.style.display === 'none' ? 'block' : 'none';
            if (section.style.display === 'block') {
                section.scrollIntoView({ behavior: 'smooth' });
                // 모니터링 화면 표시 시 API 상태 즉시 업데이트
                this.updateCurrentApiStatus();
            }
        }
    }

    // 현재 API 키 설정에 따른 상태 즉시 업데이트
    async updateCurrentApiStatus() {
        try {
            // 먼저 서버에서 환경 변수 상태 확인
            const response = await fetch('/api/check-api-keys');
            const result = await response.json();
            
            if (result.configured) {
                // 환경 변수가 설정된 경우 'active' 상태로 표시
                this.updateAPIStatus('claude', result.details.claude === '설정됨' ? 'active' : 'not_configured');
                this.updateAPIStatus('gemini', result.details.gemini === '설정됨' ? 'active' : 'not_configured');
                this.updateAPIStatus('openai', result.details.openai === '설정됨' ? 'active' : 'not_configured');
            } else {
                // 환경 변수가 없으면 로컬 설정 확인
                const settings = blogGenerator.getSettings();
                this.updateAPIStatus('claude', settings.claudeApiKey ? 'configured' : 'not_configured');
                this.updateAPIStatus('gemini', settings.geminiApiKey ? 'configured' : 'not_configured');
                this.updateAPIStatus('openai', settings.openaiApiKey ? 'configured' : 'not_configured');
            }
        } catch (error) {
            console.error('API 상태 확인 실패:', error);
            // 오류 시 로컬 설정으로 fallback
            const settings = blogGenerator.getSettings();
            this.updateAPIStatus('claude', settings.claudeApiKey ? 'configured' : 'not_configured');
            this.updateAPIStatus('gemini', settings.geminiApiKey ? 'configured' : 'not_configured');
            this.updateAPIStatus('openai', settings.openaiApiKey ? 'configured' : 'not_configured');
        }
    }

    async toggleMonitoring() {
        const button = document.getElementById('toggleMonitoring');
        
        if (this.isMonitoring) {
            // 모니터링 중지
            this.stopMonitoring();
            button.innerHTML = '<i class="fas fa-play mr-2"></i>모니터링 시작';
            button.className = 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition';
        } else {
            // 모니터링 시작
            this.startMonitoring();
            button.innerHTML = '<i class="fas fa-stop mr-2"></i>모니터링 중지';
            button.className = 'bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition';
        }
    }

    startMonitoring() {
        this.isMonitoring = true;
        
        // 초기 상태 확인
        this.refreshSystemStatus();
        
        // 5초마다 성능 데이터 수집
        this.monitoringInterval = setInterval(() => {
            this.collectPerformanceData();
        }, 5000);

        // 실시간 차트 초기화
        this.initPerformanceChart();
        
        blogGenerator.showAlert('실시간 모니터링이 시작되었습니다! 📊', 'success');
    }

    stopMonitoring() {
        this.isMonitoring = false;
        
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        
        blogGenerator.showAlert('실시간 모니터링이 중지되었습니다.', 'info');
    }

    async refreshSystemStatus() {
        try {
            const response = await axios.get('/api/system-status');
            
            if (response.data.success) {
                this.updateSystemStatus(response.data.status);
                
                // 성능 통계도 함께 업데이트
                const perfResponse = await axios.get('/api/performance-stats');
                if (perfResponse.data.success) {
                    this.updatePerformanceStats(perfResponse.data.stats);
                }
            }
        } catch (error) {
            console.error('System status check failed:', error);
            this.updateSystemStatus({
                uptime: 0,
                memory: { heapUsed: 0, heapTotal: 0 },
                apis: {
                    claude: { status: 'error', lastCheck: new Date().toISOString() },
                    gemini: { status: 'error', lastCheck: new Date().toISOString() },
                    openai: { status: 'error', lastCheck: new Date().toISOString() }
                }
            });
        }
    }

    updateSystemStatus(status) {
        // 시스템 메트릭 업데이트
        document.getElementById('systemUptime').textContent = this.formatUptime(status.uptime || 0);
        
        // API 상태 업데이트
        this.updateAPIStatus('claude', status.apis?.claude?.status || 'unknown');
        this.updateAPIStatus('gemini', status.apis?.gemini?.status || 'unknown');
        this.updateAPIStatus('openai', status.apis?.openai?.status || 'unknown');
        
        // 메모리 사용량 표시
        if (status.memory) {
            const memoryUsage = Math.round((status.memory.heapUsed / status.memory.heapTotal) * 100);
            // 메모리 사용률을 어딘가에 표시할 수 있음
        }
    }

    updateAPIStatus(apiName, status) {
        const statusElement = document.getElementById(`${apiName}Status`);
        const responseTimeElement = document.getElementById(`${apiName}ResponseTime`);
        
        // 로컬 저장소에서 API 키 상태 확인
        const settings = blogGenerator.getSettings();
        let localStatus = status;
        
        // 서버 상태가 unknown이면 로컬 설정 확인
        if (status === 'unknown' || status === 'not_configured') {
            if (apiName === 'claude' && settings.claudeApiKey) {
                localStatus = 'configured';
            } else if (apiName === 'gemini' && settings.geminiApiKey) {
                localStatus = 'configured';
            } else if (apiName === 'openai' && settings.openaiApiKey) {
                localStatus = 'configured';
            } else {
                localStatus = 'not_configured';
            }
        }
        
        if (statusElement) {
            statusElement.className = 'w-3 h-3 rounded-full mr-3 ' + this.getStatusColor(localStatus);
        }
        
        if (responseTimeElement) {
            // 상태에 따른 텍스트 설정
            let statusText = 'DISCONNECTED';
            if (localStatus === 'active') {
                statusText = 'ON AIR';
            } else if (localStatus === 'configured') {
                statusText = 'ON AIR';
            } else if (localStatus === 'error') {
                statusText = 'ERROR';
            } else if (localStatus === 'slow') {
                statusText = 'SLOW';
            } else if (localStatus === 'invalid') {
                statusText = 'INVALID';
            }
            
            responseTimeElement.textContent = statusText;
        }
    }

    getStatusColor(status) {
        switch (status) {
            case 'active': return 'bg-green-500';
            case 'configured': return 'bg-blue-500';
            case 'slow': return 'bg-yellow-500';
            case 'error': return 'bg-red-500';
            case 'invalid': return 'bg-orange-500';
            case 'not_configured': return 'bg-gray-400';
            default: return 'bg-gray-400';
        }
    }

    updatePerformanceStats(stats) {
        if (stats.last24Hours) {
            document.getElementById('avgResponseTime').textContent = stats.last24Hours.avgResponseTime + 'ms';
            document.getElementById('totalRequests').textContent = stats.last24Hours.totalRequests;
            
            const successRate = Math.round((stats.last24Hours.successfulRequests / stats.last24Hours.totalRequests) * 100);
            document.getElementById('successRate').textContent = successRate + '%';
        }
        
        if (stats.realtime) {
            // 실시간 데이터를 차트에 추가
            this.addPerformanceDataPoint({
                timestamp: new Date(),
                responseTime: stats.realtime.currentResponseTime,
                requestsPerMinute: stats.realtime.requestsPerMinute
            });
        }
    }

    collectPerformanceData() {
        // 현재 시간과 모의 성능 데이터 수집
        const now = new Date();
        const responseTime = 1500 + Math.random() * 1000; // 1.5s ~ 2.5s
        const requestsPerMinute = Math.floor(Math.random() * 20) + 5; // 5-25 req/min
        
        this.addPerformanceDataPoint({
            timestamp: now,
            responseTime: Math.round(responseTime),
            requestsPerMinute: requestsPerMinute
        });

        // 실시간 메트릭 업데이트
        document.getElementById('avgResponseTime').textContent = Math.round(responseTime) + 'ms';
    }

    addPerformanceDataPoint(dataPoint) {
        this.performanceData.push(dataPoint);
        
        // 최대 데이터 포인트 수 제한
        if (this.performanceData.length > this.maxDataPoints) {
            this.performanceData.shift();
        }
        
        this.updatePerformanceChart();
    }

    initPerformanceChart() {
        const chartContainer = document.getElementById('performanceChart');
        if (!chartContainer) return;
        
        chartContainer.innerHTML = `
            <div class="w-full h-full p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-gray-700">응답 시간 (ms)</span>
                    <span class="text-xs text-gray-500">실시간 모니터링</span>
                </div>
                <div id="chartArea" class="w-full h-24 bg-gradient-to-r from-blue-50 to-blue-100 rounded border flex items-center justify-center">
                    <canvas id="performanceCanvas" width="400" height="80"></canvas>
                </div>
                <div class="flex justify-between text-xs text-gray-500 mt-2">
                    <span>과거</span>
                    <span>현재</span>
                </div>
            </div>
        `;
    }

    updatePerformanceChart() {
        const canvas = document.getElementById('performanceCanvas');
        if (!canvas || this.performanceData.length === 0) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // 캔버스 초기화
        ctx.clearRect(0, 0, width, height);
        
        // 데이터 정규화
        const maxResponseTime = Math.max(...this.performanceData.map(d => d.responseTime));
        const minResponseTime = Math.min(...this.performanceData.map(d => d.responseTime));
        const range = maxResponseTime - minResponseTime || 1;
        
        // 라인 그리기
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        this.performanceData.forEach((point, index) => {
            const x = (index / (this.performanceData.length - 1)) * width;
            const y = height - ((point.responseTime - minResponseTime) / range) * height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // 점 그리기
        ctx.fillStyle = '#3b82f6';
        this.performanceData.forEach((point, index) => {
            const x = (index / (this.performanceData.length - 1)) * width;
            const y = height - ((point.responseTime - minResponseTime) / range) * height;
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    formatUptime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }
}

// ==================== 스마트 콘텐츠 관리 시스템 ====================

class SmartContentManager {
    constructor() {
        this.series = [];
        this.contentIdeas = [];
        this.analytics = {};
        this.currentSeries = null;
        this.init();
    }

    init() {
        this.loadSeriesData();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 시리즈 생성 버튼
        document.addEventListener('click', (e) => {
            if (e.target.id === 'createSeriesBtn') {
                this.showCreateSeriesModal();
            }
            if (e.target.id === 'saveSeriesBtn') {
                this.createSeries();
            }
            if (e.target.id === 'generateIdeasBtn') {
                this.generateContentIdeas();
            }
            if (e.target.classList.contains('view-series-btn')) {
                const seriesId = e.target.dataset.seriesId;
                this.viewSeriesDetails(seriesId);
            }
            if (e.target.classList.contains('edit-series-btn')) {
                const seriesId = e.target.dataset.seriesId;
                this.editSeries(seriesId);
            }
            if (e.target.classList.contains('delete-series-btn')) {
                const seriesId = e.target.dataset.seriesId;
                this.deleteSeries(seriesId);
            }
        });

        // SmartContentManager는 탭 전환을 직접 처리하지 않음 (전역에서 처리)
    }

    // SmartContentManager는 탭 전환을 직접 처리하지 않음 (전역에서 처리)
    // switchTab 메서드를 제거하고 개별 로드 메서드만 유지

    showCreateSeriesModal() {
        document.getElementById('createSeriesModal').classList.remove('hidden');
        document.getElementById('seriesTitle').focus();
    }

    hideCreateSeriesModal() {
        document.getElementById('createSeriesModal').classList.add('hidden');
        document.getElementById('createSeriesForm').reset();
    }

    async createSeries() {
        try {
            const formData = new FormData(document.getElementById('createSeriesForm'));
            const seriesData = {
                title: formData.get('title'),
                description: formData.get('description'),
                totalPlannedArticles: parseInt(formData.get('totalArticles')) || 0,
                targetAudience: formData.get('targetAudience'),
                contentStyle: formData.get('contentStyle'),
                estimatedCompletionDate: formData.get('completionDate'),
                tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag),
                creatorNotes: formData.get('notes')
            };

            if (!seriesData.title) {
                throw new Error('시리즈 제목을 입력해주세요');
            }

            const response = await axios.post('/api/series', seriesData);

            if (response.data.success) {
                this.showAlert('시리즈가 생성되었습니다! 🎉', 'success');
                this.hideCreateSeriesModal();
                this.loadSeriesList();
            } else {
                throw new Error(response.data.error || '시리즈 생성에 실패했습니다');
            }

        } catch (error) {
            console.error('시리즈 생성 오류:', error);
            this.showAlert(`시리즈 생성 실패: ${error.message}`, 'error');
        }
    }

    async loadSeriesList() {
        try {
            const response = await axios.get('/api/series');
            
            if (response.data.success) {
                this.series = response.data.series;
                this.renderSeriesList();
            } else {
                throw new Error(response.data.error);
            }

        } catch (error) {
            console.error('시리즈 로드 오류:', error);
            this.showAlert('시리즈 목록을 불러오는데 실패했습니다', 'error');
        }
    }

    renderSeriesList() {
        const container = document.getElementById('seriesContainer');
        if (!container) return;

        if (this.series.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-book-open text-4xl text-gray-400 mb-4"></i>
                    <h3 class="text-lg font-semibold text-gray-600 mb-2">아직 생성된 시리즈가 없습니다</h3>
                    <p class="text-gray-500 mb-6">첫 번째 시리즈를 만들어보세요!</p>
                    <button id="createSeriesBtn" class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">
                        <i class="fas fa-plus mr-2"></i>시리즈 생성
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold text-gray-800">시리즈 목록 (${this.series.length}개)</h2>
                <button id="createSeriesBtn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
                    <i class="fas fa-plus mr-2"></i>새 시리즈
                </button>
            </div>
            
            <div class="grid gap-4">
                ${this.series.map(series => `
                    <div class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div class="flex justify-between items-start mb-4">
                            <div class="flex-1">
                                <h3 class="text-lg font-semibold text-gray-800 mb-2">${series.title}</h3>
                                <p class="text-gray-600 mb-3">${series.description || '설명 없음'}</p>
                                
                                <div class="flex flex-wrap gap-2 mb-3">
                                    <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                                        ${this.getAudienceName(series.targetAudience)}
                                    </span>
                                    <span class="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                                        ${this.getStyleName(series.contentStyle)}
                                    </span>
                                    <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                                        ${series.status}
                                    </span>
                                </div>
                            </div>
                            
                            <div class="flex space-x-2 ml-4">
                                <button class="view-series-btn bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm" 
                                        data-series-id="${series.id}">
                                    <i class="fas fa-eye mr-1"></i>보기
                                </button>
                                <button class="edit-series-btn bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm" 
                                        data-series-id="${series.id}">
                                    <i class="fas fa-edit mr-1"></i>편집
                                </button>
                                <button class="delete-series-btn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm" 
                                        data-series-id="${series.id}">
                                    <i class="fas fa-trash mr-1"></i>삭제
                                </button>
                            </div>
                        </div>
                        
                        <!-- 진행률 표시 -->
                        <div class="mb-4">
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-sm text-gray-600">진행률</span>
                                <span class="text-sm font-semibold text-gray-800">
                                    ${series.currentArticleCount || 0}/${series.totalPlannedArticles || 0} 글
                                </span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                                     style="width: ${series.progress || 0}%"></div>
                            </div>
                        </div>
                        
                        <div class="text-xs text-gray-500">
                            생성일: ${new Date(series.createdAt).toLocaleDateString('ko-KR')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async viewSeriesDetails(seriesId) {
        try {
            const response = await axios.get(`/api/series/${seriesId}`);
            
            if (response.data.success) {
                this.showSeriesDetailModal(response.data.series);
            } else {
                throw new Error(response.data.error);
            }

        } catch (error) {
            console.error('시리즈 상세 조회 오류:', error);
            this.showAlert('시리즈 상세 정보를 불러오는데 실패했습니다', 'error');
        }
    }

    showSeriesDetailModal(series) {
        const modal = document.getElementById('seriesDetailModal');
        const content = document.getElementById('seriesDetailContent');
        
        content.innerHTML = `
            <div class="p-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">${series.title}</h2>
                <p class="text-gray-600 mb-6">${series.description || '설명 없음'}</p>
                
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <h4 class="font-semibold text-gray-800 mb-2">시리즈 정보</h4>
                        <div class="space-y-2 text-sm">
                            <div><span class="font-medium">상태:</span> ${series.status}</div>
                            <div><span class="font-medium">타겟 독자:</span> ${this.getAudienceName(series.targetAudience)}</div>
                            <div><span class="font-medium">콘텐츠 스타일:</span> ${this.getStyleName(series.contentStyle)}</div>
                            <div><span class="font-medium">총 계획 글:</span> ${series.totalPlannedArticles}개</div>
                        </div>
                    </div>
                    
                    <div>
                        <h4 class="font-semibold text-gray-800 mb-2">진행 상황</h4>
                        <div class="space-y-2 text-sm">
                            <div><span class="font-medium">작성 완료:</span> ${series.currentArticleCount}개</div>
                            <div><span class="font-medium">진행률:</span> ${Math.round((series.currentArticleCount / series.totalPlannedArticles) * 100) || 0}%</div>
                            <div><span class="font-medium">생성일:</span> ${new Date(series.createdAt).toLocaleDateString('ko-KR')}</div>
                        </div>
                    </div>
                </div>
                
                <!-- 시리즈 내 글 목록 -->
                <div class="mb-6">
                    <h4 class="font-semibold text-gray-800 mb-3">시리즈 글 목록</h4>
                    ${series.articles && series.articles.length > 0 ? `
                        <div class="space-y-2">
                            ${series.articles.map((article, index) => `
                                <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
                                    <div class="flex items-center">
                                        <span class="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                                            ${article.seriesOrder}
                                        </span>
                                        <div>
                                            <div class="font-medium text-gray-800">${article.title}</div>
                                            <div class="text-xs text-gray-500">
                                                상태: ${article.status} 
                                                ${article.publishedAt ? `| 발행: ${new Date(article.publishedAt).toLocaleDateString('ko-KR')}` : ''}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        ${article.status === 'published' 
                                            ? '<i class="fas fa-check-circle text-green-500"></i>' 
                                            : '<i class="fas fa-clock text-orange-500"></i>'
                                        }
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="text-center py-8 text-gray-500">
                            <i class="fas fa-inbox text-2xl mb-2"></i>
                            <p>아직 작성된 글이 없습니다</p>
                        </div>
                    `}
                </div>
                
                <div class="flex justify-end space-x-3">
                    <button onclick="document.getElementById('seriesDetailModal').classList.add('hidden')" 
                            class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
                        닫기
                    </button>
                    <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                        <i class="fas fa-plus mr-2"></i>새 글 작성
                    </button>
                </div>
            </div>
        `;
        
        modal.classList.remove('hidden');
    }

    async generateContentIdeas() {
        const topic = document.getElementById('ideasTopic').value.trim();
        const targetAudience = document.getElementById('ideasAudience').value;
        const count = parseInt(document.getElementById('ideasCount').value) || 5;

        if (!topic) {
            this.showAlert('주제를 입력해주세요', 'error');
            return;
        }

        const generateBtn = document.getElementById('generateIdeasBtn');
        const originalText = generateBtn.textContent;
        
        try {
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>아이디어 생성 중...';

            const response = await axios.post('/api/content-ideas/generate', {
                topic,
                targetAudience,
                count
            });

            if (response.data.success) {
                this.contentIdeas = response.data.ideas;
                this.renderContentIdeas();
                this.showAlert(`${response.data.ideas.length}개의 콘텐츠 아이디어가 생성되었습니다! 💡`, 'success');
            } else {
                throw new Error(response.data.error);
            }

        } catch (error) {
            console.error('아이디어 생성 오류:', error);
            this.showAlert(`아이디어 생성 실패: ${error.message}`, 'error');
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = originalText;
        }
    }

    renderContentIdeas() {
        const container = document.getElementById('ideasContainer');
        if (!container || !this.contentIdeas) return;

        if (this.contentIdeas.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-lightbulb text-3xl mb-3"></i>
                    <p>아직 생성된 아이디어가 없습니다</p>
                    <p class="text-sm">위 폼을 사용하여 콘텐츠 아이디어를 생성해보세요!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="space-y-4">
                ${this.contentIdeas.map((idea, index) => `
                    <div class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                        <div class="flex justify-between items-start mb-3">
                            <h3 class="text-lg font-semibold text-gray-800 flex-1">${idea.title}</h3>
                            <div class="flex space-x-2 ml-4">
                                <button class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
                                    <i class="fas fa-edit mr-1"></i>글 작성
                                </button>
                                <button class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">
                                    <i class="fas fa-bookmark mr-1"></i>저장
                                </button>
                            </div>
                        </div>
                        
                        ${idea.description ? `<p class="text-gray-600 mb-3">${idea.description}</p>` : ''}
                        
                        ${idea.keywords && idea.keywords.length > 0 ? `
                            <div class="flex flex-wrap gap-1 mb-3">
                                ${idea.keywords.map(keyword => `
                                    <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">${keyword}</span>
                                `).join('')}
                            </div>
                        ` : ''}
                        
                        <div class="flex justify-between items-center text-xs text-gray-500">
                            <span>아이디어 ${index + 1}</span>
                            <span>생성: ${new Date(idea.createdAt).toLocaleDateString('ko-KR')}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async loadContentIdeas() {
        // 아이디어 탭 로드 시 기본 설정
        const container = document.getElementById('ideasContainer');
        if (!container) return;

        // 기본 상태 표시 (아이디어가 없을 때)
        if (!this.contentIdeas || this.contentIdeas.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-lightbulb text-3xl mb-3"></i>
                    <p>아직 생성된 아이디어가 없습니다</p>
                    <p class="text-sm">위 폼을 사용하여 AI 기반 콘텐츠 아이디어를 생성해보세요!</p>
                </div>
            `;
        } else {
            // 기존 아이디어가 있으면 렌더링
            this.renderContentIdeas();
        }
    }

    async loadAnalytics() {
        try {
            const response = await axios.get('/api/analytics/overview');
            
            if (response.data.success) {
                this.analytics = response.data.analytics;
                this.renderAnalyticsDashboard();
            } else {
                throw new Error(response.data.error);
            }

        } catch (error) {
            console.error('분석 데이터 로드 오류:', error);
            this.showAlert('분석 데이터를 불러오는데 실패했습니다', 'error');
        }
    }

    renderAnalyticsDashboard() {
        const container = document.getElementById('analyticsContainer');
        if (!container || !this.analytics) return;

        container.innerHTML = `
            <!-- 주요 지표 카드 -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-lg border border-gray-200 p-6 text-center">
                    <div class="text-3xl font-bold text-blue-600">${this.analytics.totalArticles || 0}</div>
                    <div class="text-gray-600">총 글 수</div>
                </div>
                <div class="bg-white rounded-lg border border-gray-200 p-6 text-center">
                    <div class="text-3xl font-bold text-green-600">${this.analytics.totalSeries || 0}</div>
                    <div class="text-gray-600">시리즈 수</div>
                </div>
                <div class="bg-white rounded-lg border border-gray-200 p-6 text-center">
                    <div class="text-3xl font-bold text-purple-600">${this.analytics.totalViews?.toLocaleString() || 0}</div>
                    <div class="text-gray-600">총 조회수</div>
                </div>
                <div class="bg-white rounded-lg border border-gray-200 p-6 text-center">
                    <div class="text-3xl font-bold text-orange-600">${this.analytics.totalEngagement || 0}%</div>
                    <div class="text-gray-600">참여율</div>
                </div>
            </div>

            <!-- 최근 성과 -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div class="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">최근 30일 성과</h3>
                    ${this.analytics.recentPerformance ? `
                        <div class="space-y-3">
                            <div class="flex justify-between">
                                <span class="text-gray-600">새 글</span>
                                <span class="font-semibold">${this.analytics.recentPerformance.newArticles}개</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">평균 조회수</span>
                                <span class="font-semibold">${this.analytics.recentPerformance.averageViews?.toLocaleString()}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">최고 성과 키워드</span>
                                <span class="font-semibold text-blue-600">${this.analytics.recentPerformance.topPerformingKeyword}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">참여율 증가</span>
                                <span class="font-semibold text-green-600">+${this.analytics.recentPerformance.engagementGrowth}%</span>
                            </div>
                        </div>
                    ` : '<p class="text-gray-500">데이터 없음</p>'}
                </div>

                <!-- 시리즈 성과 -->
                <div class="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">시리즈별 성과</h3>
                    ${this.analytics.seriesPerformance && this.analytics.seriesPerformance.length > 0 ? `
                        <div class="space-y-3">
                            ${this.analytics.seriesPerformance.map(series => `
                                <div class="border-b border-gray-100 pb-3 last:border-b-0">
                                    <div class="font-medium text-gray-800">${series.title}</div>
                                    <div class="text-sm text-gray-600 flex justify-between">
                                        <span>조회수: ${series.totalViews?.toLocaleString()}</span>
                                        <span>참여율: ${series.averageEngagement}%</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p class="text-gray-500">시리즈 데이터 없음</p>'}
                </div>
            </div>

            <!-- 트렌딩 키워드 -->
            <div class="bg-white rounded-lg border border-gray-200 p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">트렌딩 키워드</h3>
                ${this.analytics.trendingKeywords && this.analytics.trendingKeywords.length > 0 ? `
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        ${this.analytics.trendingKeywords.map(keyword => `
                            <div class="p-4 bg-gray-50 rounded-lg">
                                <div class="font-medium text-gray-800">${keyword.keyword}</div>
                                <div class="text-sm text-gray-600">검색량: ${keyword.searchVolume?.toLocaleString()}</div>
                                <div class="text-xs mt-1">
                                    <span class="px-2 py-1 rounded ${
                                        keyword.trend === 'rising' ? 'bg-green-100 text-green-700' :
                                        keyword.trend === 'stable' ? 'bg-blue-100 text-blue-700' :
                                        'bg-red-100 text-red-700'
                                    }">
                                        ${keyword.trend === 'rising' ? '상승' : keyword.trend === 'stable' ? '안정' : '하락'}
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="text-gray-500">키워드 데이터 없음</p>'}
            </div>
        `;
    }

    getAudienceName(audience) {
        const audiences = {
            general: '일반인',
            beginner: '초보자',
            intermediate: '중급자',
            expert: '전문가'
        };
        return audiences[audience] || '일반인';
    }

    getStyleName(style) {
        const styles = {
            informative: '정보성',
            tutorial: '튜토리얼',
            guide: '가이드',
            news: '뉴스'
        };
        return styles[style] || '정보성';
    }

    loadSeriesData() {
        // 로컬 스토리지에서 시리즈 데이터 로드 (필요시)
        const savedSeries = localStorage.getItem('content_series');
        if (savedSeries) {
            try {
                this.series = JSON.parse(savedSeries);
            } catch (error) {
                console.error('시리즈 데이터 로드 오류:', error);
            }
        }
    }

    saveSeriesData() {
        // 로컬 스토리지에 시리즈 데이터 저장 (필요시)
        try {
            localStorage.setItem('content_series', JSON.stringify(this.series));
        } catch (error) {
            console.error('시리즈 데이터 저장 오류:', error);
        }
    }

    showAlert(message, type = 'info') {
        // 기존 BlogGenerator의 showAlert 메서드 사용
        if (window.blogGenerator && window.blogGenerator.showAlert) {
            window.blogGenerator.showAlert(message, type);
        } else {
            alert(message);
        }
    }

    async deleteSeries(seriesId) {
        if (!confirm('이 시리즈를 정말 삭제하시겠습니까?')) {
            return;
        }

        try {
            const response = await axios.delete(`/api/series/${seriesId}`);
            
            if (response.data.success) {
                this.showAlert('시리즈가 삭제되었습니다', 'success');
                this.loadSeriesList();
            } else {
                throw new Error(response.data.error);
            }

        } catch (error) {
            console.error('시리즈 삭제 오류:', error);
            this.showAlert('시리즈 삭제에 실패했습니다', 'error');
        }
    }

    editSeries(seriesId) {
        // 시리즈 편집 기능 (추후 구현)
        this.showAlert('시리즈 편집 기능은 곧 제공됩니다', 'info');
    }
}

// 스마트 콘텐츠 관리자 전역 인스턴스
window.smartContentManager = null;

// ==================== 콘텐츠 스케줄링 및 태그 관리자 ====================

class ContentScheduler {
    constructor() {
        this.schedules = [];
        this.tags = [];
        this.tagCategories = [];
        this.init();
    }

    init() {
        this.loadSchedules();
        this.loadTags();
        this.setupSchedulingEventListeners();
    }

    setupSchedulingEventListeners() {
        document.addEventListener('click', (e) => {
            // 스케줄링 관련 버튼들
            if (e.target.id === 'createScheduleBtn') {
                this.showCreateScheduleModal();
            }
            if (e.target.id === 'saveScheduleBtn') {
                this.createSchedule();
            }
            if (e.target.classList.contains('edit-schedule-btn')) {
                const scheduleId = e.target.dataset.scheduleId;
                this.editSchedule(scheduleId);
            }
            if (e.target.classList.contains('delete-schedule-btn')) {
                const scheduleId = e.target.dataset.scheduleId;
                this.deleteSchedule(scheduleId);
            }

            // 태그 관련 버튼들
            if (e.target.id === 'createTagBtn') {
                this.showCreateTagModal();
            }
            if (e.target.id === 'saveTagBtn') {
                this.createTag();
            }
            if (e.target.id === 'autoSuggestTagsBtn') {
                this.autoSuggestTags();
            }
            if (e.target.classList.contains('tag-filter-btn')) {
                const category = e.target.dataset.category;
                this.filterTagsByCategory(category);
            }
        });
    }

    // ==================== 스케줄링 기능 ====================

    showCreateScheduleModal() {
        document.getElementById('createScheduleModal').classList.remove('hidden');
        
        // 현재 날짜와 시간을 기본값으로 설정
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        
        document.getElementById('scheduleDate').value = tomorrow.toISOString().split('T')[0];
        document.getElementById('scheduleTime').value = '09:00';
    }

    hideCreateScheduleModal() {
        document.getElementById('createScheduleModal').classList.add('hidden');
        document.getElementById('createScheduleForm').reset();
    }

    async createSchedule() {
        try {
            const formData = new FormData(document.getElementById('createScheduleForm'));
            const scheduleData = {
                articleId: formData.get('articleId') || `demo_article_${Date.now()}`,
                seriesId: formData.get('seriesId') || null,
                scheduledDate: formData.get('scheduledDate'),
                scheduledTime: formData.get('scheduledTime'),
                timezone: formData.get('timezone') || 'Asia/Seoul',
                autoPublish: formData.get('autoPublish') === 'on',
                publishToPlatforms: Array.from(formData.getAll('platforms')),
                isRecurring: formData.get('isRecurring') === 'on',
                recurrencePattern: formData.get('recurrencePattern'),
                recurrenceInterval: parseInt(formData.get('recurrenceInterval')) || 1,
                recurrenceEndDate: formData.get('recurrenceEndDate') || null,
                notes: formData.get('notes')
            };

            if (!scheduleData.scheduledDate || !scheduleData.scheduledTime) {
                throw new Error('예약 날짜와 시간을 설정해주세요');
            }

            const response = await axios.post('/api/schedule', scheduleData);

            if (response.data.success) {
                this.showAlert('예약 발행이 설정되었습니다! ⏰', 'success');
                this.hideCreateScheduleModal();
                this.loadSchedulesList();
            } else {
                throw new Error(response.data.error);
            }

        } catch (error) {
            console.error('스케줄 생성 오류:', error);
            this.showAlert(`스케줄 생성 실패: ${error.message}`, 'error');
        }
    }

    async loadSchedulesList() {
        try {
            const response = await axios.get('/api/schedule');
            
            if (response.data.success) {
                this.schedules = response.data.schedules;
                this.renderSchedulesList();
            } else {
                throw new Error(response.data.error);
            }

        } catch (error) {
            console.error('스케줄 로드 오류:', error);
            this.showAlert('스케줄 목록을 불러오는데 실패했습니다', 'error');
        }
    }

    renderSchedulesList() {
        const container = document.getElementById('schedulesContainer');
        if (!container) return;

        if (this.schedules.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-calendar-alt text-4xl text-gray-400 mb-4"></i>
                    <h3 class="text-lg font-semibold text-gray-600 mb-2">예약된 발행이 없습니다</h3>
                    <p class="text-gray-500 mb-6">첫 번째 예약 발행을 설정해보세요!</p>
                    <button id="createScheduleBtn" class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">
                        <i class="fas fa-plus mr-2"></i>예약 발행 설정
                    </button>
                </div>
            `;
            return;
        }

        // 상태별 그룹화
        const groupedSchedules = {
            scheduled: this.schedules.filter(s => s.status === 'scheduled'),
            published: this.schedules.filter(s => s.status === 'published'),
            failed: this.schedules.filter(s => s.status === 'failed')
        };

        container.innerHTML = `
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold text-gray-800">예약 발행 관리 (${this.schedules.length}개)</h2>
                <button id="createScheduleBtn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
                    <i class="fas fa-plus mr-2"></i>새 예약
                </button>
            </div>

            <!-- 상태 통계 -->
            <div class="grid grid-cols-3 gap-4 mb-6">
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold text-blue-600">${groupedSchedules.scheduled.length}</div>
                    <div class="text-sm text-blue-600">예약 대기</div>
                </div>
                <div class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold text-green-600">${groupedSchedules.published.length}</div>
                    <div class="text-sm text-green-600">발행 완료</div>
                </div>
                <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold text-red-600">${groupedSchedules.failed.length}</div>
                    <div class="text-sm text-red-600">발행 실패</div>
                </div>
            </div>

            <!-- 스케줄 목록 -->
            <div class="space-y-4">
                ${this.schedules.map(schedule => `
                    <div class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div class="flex justify-between items-start mb-4">
                            <div class="flex-1">
                                <h3 class="text-lg font-semibold text-gray-800 mb-2">${schedule.articleTitle || '제목 없음'}</h3>
                                ${schedule.seriesTitle ? `
                                    <p class="text-sm text-blue-600 mb-2">
                                        <i class="fas fa-book mr-1"></i>${schedule.seriesTitle}
                                    </p>
                                ` : ''}
                                
                                <div class="flex flex-wrap gap-2 mb-3">
                                    <span class="px-2 py-1 rounded text-xs font-medium ${this.getStatusBadgeClass(schedule.status)}">
                                        ${this.getStatusText(schedule.status)}
                                    </span>
                                    ${schedule.isRecurring ? `
                                        <span class="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                                            <i class="fas fa-repeat mr-1"></i>반복 발행
                                        </span>
                                    ` : ''}
                                    ${schedule.autoPublish ? `
                                        <span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                            <i class="fas fa-robot mr-1"></i>자동 발행
                                        </span>
                                    ` : ''}
                                </div>
                            </div>
                            
                            <div class="flex space-x-2 ml-4">
                                <button class="edit-schedule-btn bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm" 
                                        data-schedule-id="${schedule.id}">
                                    <i class="fas fa-edit mr-1"></i>편집
                                </button>
                                <button class="delete-schedule-btn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm" 
                                        data-schedule-id="${schedule.id}">
                                    <i class="fas fa-trash mr-1"></i>취소
                                </button>
                            </div>
                        </div>
                        
                        <!-- 스케줄 정보 -->
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span class="font-medium text-gray-600">예정 시간:</span>
                                <span class="ml-2">${this.formatScheduleDateTime(schedule.scheduledDate, schedule.scheduledTime)}</span>
                            </div>
                            <div>
                                <span class="font-medium text-gray-600">발행 플랫폼:</span>
                                <span class="ml-2">${this.formatPlatforms(schedule.publishToPlatforms)}</span>
                            </div>
                            ${schedule.nextOccurrence ? `
                                <div class="col-span-2">
                                    <span class="font-medium text-gray-600">다음 발행:</span>
                                    <span class="ml-2">${new Date(schedule.nextOccurrence).toLocaleString('ko-KR')}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getStatusBadgeClass(status) {
        switch (status) {
            case 'scheduled': return 'bg-blue-100 text-blue-700';
            case 'published': return 'bg-green-100 text-green-700';
            case 'failed': return 'bg-red-100 text-red-700';
            case 'cancelled': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    }

    getStatusText(status) {
        switch (status) {
            case 'scheduled': return '예약 대기';
            case 'published': return '발행 완료';
            case 'failed': return '발행 실패';
            case 'cancelled': return '취소됨';
            default: return status;
        }
    }

    formatScheduleDateTime(date, time) {
        const scheduleDate = new Date(`${date} ${time}`);
        return scheduleDate.toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatPlatforms(platforms) {
        if (typeof platforms === 'string') {
            platforms = JSON.parse(platforms);
        }
        const platformNames = {
            blog: '블로그',
            social: '소셜미디어', 
            newsletter: '뉴스레터'
        };
        return platforms.map(p => platformNames[p] || p).join(', ');
    }

    async deleteSchedule(scheduleId) {
        if (!confirm('이 예약 발행을 취소하시겠습니까?')) {
            return;
        }

        try {
            const response = await axios.delete(`/api/schedule/${scheduleId}`);
            
            if (response.data.success) {
                this.showAlert('예약 발행이 취소되었습니다', 'success');
                this.loadSchedulesList();
            } else {
                throw new Error(response.data.error);
            }

        } catch (error) {
            console.error('스케줄 삭제 오류:', error);
            this.showAlert('예약 취소에 실패했습니다', 'error');
        }
    }

    editSchedule(scheduleId) {
        this.showAlert('스케줄 편집 기능은 곧 제공됩니다', 'info');
    }

    // ==================== 태그 관리 기능 ====================

    async loadTags() {
        try {
            const response = await axios.get('/api/tags');
            
            if (response.data.success) {
                this.tags = response.data.tags;
                this.tagCategories = response.data.categories;
            }

        } catch (error) {
            console.error('태그 로드 오류:', error);
        }
    }

    async loadTagsList() {
        try {
            const response = await axios.get('/api/tags');
            
            if (response.data.success) {
                this.tags = response.data.tags;
                this.tagCategories = response.data.categories;
                this.renderTagsList();
            } else {
                throw new Error(response.data.error);
            }

        } catch (error) {
            console.error('태그 목록 로드 오류:', error);
            this.showAlert('태그 목록을 불러오는데 실패했습니다', 'error');
        }
    }

    renderTagsList() {
        const container = document.getElementById('tagsContainer');
        if (!container) return;

        container.innerHTML = `
            <!-- 태그 관리 헤더 -->
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold text-gray-800">태그 관리 (${this.tags.length}개)</h2>
                <div class="flex space-x-2">
                    <button id="autoSuggestTagsBtn" class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg">
                        <i class="fas fa-magic mr-2"></i>AI 태그 추천
                    </button>
                    <button id="createTagBtn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
                        <i class="fas fa-plus mr-2"></i>새 태그
                    </button>
                </div>
            </div>

            <!-- 카테고리 필터 -->
            <div class="mb-6">
                <div class="flex flex-wrap gap-2">
                    <button class="tag-filter-btn px-3 py-1 rounded-full text-sm bg-blue-500 text-white" 
                            data-category="all">
                        전체 (${this.tags.length})
                    </button>
                    ${this.tagCategories.map(category => `
                        <button class="tag-filter-btn px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600 hover:bg-gray-200" 
                                data-category="${category.id}">
                            ${category.name} (${category.count})
                        </button>
                    `).join('')}
                </div>
            </div>

            <!-- 태그 목록 -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="tagsGrid">
                ${this.tags.map(tag => `
                    <div class="tag-card bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow" 
                         data-category="${tag.category}">
                        <div class="flex items-center justify-between mb-3">
                            <div class="flex items-center">
                                <div class="w-4 h-4 rounded-full mr-2" style="background-color: ${tag.color}"></div>
                                <h3 class="font-semibold text-gray-800">${tag.name}</h3>
                            </div>
                            <div class="text-xs text-gray-500">${tag.usageCount}회</div>
                        </div>
                        
                        <div class="flex justify-between items-center text-sm text-gray-600 mb-3">
                            <span class="px-2 py-1 bg-gray-100 rounded text-xs">${this.getCategoryName(tag.category)}</span>
                            <div class="flex space-x-2 text-xs">
                                <span>SEO: ${tag.seoValue}</span>
                                <span>트렌드: ${tag.trendScore}</span>
                            </div>
                        </div>
                        
                        <div class="flex justify-end space-x-2">
                            <button class="text-blue-500 hover:text-blue-700 text-xs">
                                <i class="fas fa-edit mr-1"></i>편집
                            </button>
                            <button class="text-red-500 hover:text-red-700 text-xs">
                                <i class="fas fa-trash mr-1"></i>삭제
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getCategoryName(categoryId) {
        const categoryNames = {
            topic: '주제',
            difficulty: '난이도', 
            format: '형식',
            audience: '대상'
        };
        return categoryNames[categoryId] || categoryId;
    }

    filterTagsByCategory(category) {
        const tagCards = document.querySelectorAll('.tag-card');
        const filterButtons = document.querySelectorAll('.tag-filter-btn');

        // 필터 버튼 스타일 업데이트
        filterButtons.forEach(btn => {
            btn.classList.remove('bg-blue-500', 'text-white');
            btn.classList.add('bg-gray-100', 'text-gray-600');
        });
        
        const activeButton = document.querySelector(`[data-category="${category}"]`);
        if (activeButton) {
            activeButton.classList.remove('bg-gray-100', 'text-gray-600');
            activeButton.classList.add('bg-blue-500', 'text-white');
        }

        // 태그 카드 필터링
        tagCards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    showCreateTagModal() {
        document.getElementById('createTagModal').classList.remove('hidden');
        document.getElementById('tagName').focus();
    }

    hideCreateTagModal() {
        document.getElementById('createTagModal').classList.add('hidden');
        document.getElementById('createTagForm').reset();
    }

    async createTag() {
        try {
            const formData = new FormData(document.getElementById('createTagForm'));
            const tagData = {
                name: formData.get('name'),
                category: formData.get('category'),
                color: formData.get('color'),
                description: formData.get('description')
            };

            if (!tagData.name) {
                throw new Error('태그 이름을 입력해주세요');
            }

            const response = await axios.post('/api/tags', tagData);

            if (response.data.success) {
                this.showAlert(`태그 "${tagData.name}"가 생성되었습니다! 🏷️`, 'success');
                this.hideCreateTagModal();
                this.loadTagsList();
            } else {
                throw new Error(response.data.error);
            }

        } catch (error) {
            console.error('태그 생성 오류:', error);
            this.showAlert(`태그 생성 실패: ${error.message}`, 'error');
        }
    }

    async autoSuggestTags() {
        // 현재 선택된 글의 내용을 기반으로 AI 태그 추천
        const articles = window.blogGenerator?.generatedArticles || [];
        
        if (articles.length === 0) {
            this.showAlert('분석할 글이 없습니다. 먼저 글을 생성해주세요.', 'error');
            return;
        }

        const latestArticle = articles[articles.length - 1];
        
        try {
            this.showAlert('AI가 태그를 분석하고 있습니다...', 'info');

            const response = await axios.post('/api/tags/auto-suggest', {
                title: latestArticle.title,
                content: latestArticle.content.substring(0, 1000),
                existingTags: this.tags.map(tag => tag.name)
            });

            if (response.data.success) {
                this.showTagSuggestions(response.data.suggestedTags);
            } else {
                throw new Error(response.data.error);
            }

        } catch (error) {
            console.error('자동 태그 추천 오류:', error);
            this.showAlert(`AI 태그 추천 실패: ${error.message}`, 'error');
        }
    }

    showTagSuggestions(suggestedTags) {
        if (suggestedTags.length === 0) {
            this.showAlert('추천할 태그가 없습니다', 'info');
            return;
        }

        // 간단한 알림으로 추천 태그 표시
        const tagNames = suggestedTags.map(tag => `${tag.name} (${Math.round(tag.confidence * 100)}%)`).join(', ');
        this.showAlert(`AI 추천 태그: ${tagNames}`, 'success');
        
        // 자동으로 태그 생성
        this.applyTagSuggestions(suggestedTags);
    }

    async applyTagSuggestions(suggestedTags) {
        try {
            let createdCount = 0;
            
            for (const tag of suggestedTags) {
                const response = await axios.post('/api/tags', {
                    name: tag.name,
                    category: tag.category,
                    color: this.getDefaultColorForCategory(tag.category),
                    description: `AI 추천 태그 (신뢰도: ${Math.round(tag.confidence * 100)}%)`
                });
                
                if (response.data.success) {
                    createdCount++;
                }
            }

            if (createdCount > 0) {
                this.showAlert(`${createdCount}개의 AI 추천 태그가 생성되었습니다! 🏷️`, 'success');
                this.loadTagsList();
            }

        } catch (error) {
            console.error('태그 적용 오류:', error);
            this.showAlert('일부 태그 생성에 실패했습니다', 'error');
        }
    }

    getDefaultColorForCategory(category) {
        const colors = {
            topic: '#3B82F6',
            difficulty: '#EF4444', 
            format: '#10B981',
            audience: '#F59E0B'
        };
        return colors[category] || '#6B7280';
    }

    loadSchedules() {
        // 로컬 스토리지에서 스케줄 데이터 로드
        const savedSchedules = localStorage.getItem('content_schedules');
        if (savedSchedules) {
            try {
                this.schedules = JSON.parse(savedSchedules);
            } catch (error) {
                console.error('스케줄 데이터 로드 오류:', error);
            }
        }
    }

    showAlert(message, type = 'info') {
        // 기존 BlogGenerator의 showAlert 메서드 사용
        if (window.blogGenerator && window.blogGenerator.showAlert) {
            window.blogGenerator.showAlert(message, type);
        } else {
            alert(message);
        }
    }
}

// 콘텐츠 스케줄러 전역 인스턴스
window.contentScheduler = null;

// 앱 초기화
const blogGenerator = new BlogGenerator();
const systemMonitor = new SystemMonitor();

// 전역 탭 전환 함수 (HTML에서 호출됨)
function switchTab(tabName) {
    console.log(`🔄 전역 switchTab() 호출됨: tabName=${tabName}`);
    
    // 모든 탭 비활성화
    document.querySelectorAll('.content-tab').forEach(tab => {
        tab.classList.remove('bg-blue-500', 'text-white');
        tab.classList.add('text-gray-600', 'hover:text-blue-500');
    });

    // 모든 탭 컨텐츠 숨기기
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });

    // 선택된 탭 활성화
    const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (selectedTab) {
        selectedTab.classList.add('bg-blue-500', 'text-white');
        selectedTab.classList.remove('text-gray-600', 'hover:text-blue-500');
    }

    // 선택된 컨텐츠 표시
    const selectedContent = document.getElementById(`${tabName}Tab`);
    if (selectedContent) {
        selectedContent.classList.remove('hidden');
    }

    // 탭별 데이터 로드 - 인스턴스 메서드 호출
    switch (tabName) {
        case 'series':
            // 시리즈 관리 탭
            if (window.smartContentManager) {
                console.log('📚 시리즈 관리 탭 로드 - SmartContentManager 사용');
                window.smartContentManager.loadSeriesList();
            } else {
                console.error('❌ SmartContentManager 인스턴스가 없습니다');
            }
            break;
        case 'ideas':
            // 아이디어 생성 탭
            if (window.smartContentManager) {
                console.log('💡 아이디어 생성 탭 로드 - SmartContentManager 사용');
                window.smartContentManager.loadContentIdeas();
            } else {
                console.error('❌ SmartContentManager 인스턴스가 없습니다');
            }
            break;
        case 'analytics':
            // 성과 분석 탭
            if (window.smartContentManager) {
                console.log('📊 성과 분석 탭 로드 - SmartContentManager 사용');
                window.smartContentManager.loadAnalytics();
            } else {
                console.error('❌ SmartContentManager 인스턴스가 없습니다');
            }
            break;
        case 'scheduling':
            // 스케줄링 탭
            if (window.contentScheduler) {
                console.log('⏰ 스케줄링 탭 로드 - ContentScheduler 사용');
                window.contentScheduler.loadSchedulesList();
            } else {
                console.error('❌ ContentScheduler 인스턴스가 없습니다');
            }
            break;
        case 'tags':
            // 태그 관리 탭
            if (window.contentScheduler) {
                console.log('🏷️ 태그 관리 탭 로드 - ContentScheduler 사용');
                window.contentScheduler.loadTagsList();
            } else {
                console.error('❌ ContentScheduler 인스턴스가 없습니다');
            }
            break;
        default:
            console.warn(`⚠️ 알 수 없는 탭: ${tabName}`);
    }
}

// 스마트 콘텐츠 관리자 및 콘텐츠 스케줄러 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOMContentLoaded 이벤트 발생 - 클래스 인스턴스 초기화 시작');
    
    // SmartContentManager 인스턴스 생성
    window.smartContentManager = new SmartContentManager();
    console.log('✅ SmartContentManager 초기화 완료');
    
    // ContentScheduler 인스턴스 생성  
    window.contentScheduler = new ContentScheduler();
    console.log('✅ ContentScheduler 초기화 완료');
    
    // 탭 클릭 이벤트 리스너 추가
    document.querySelectorAll('.content-tab').forEach(tabButton => {
        tabButton.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            console.log(`🎯 탭 클릭 이벤트 감지: ${tabName}`);
            
            if (tabName && typeof switchTab === 'function') {
                switchTab(tabName);
            } else {
                console.error(`❌ 탭 전환 실패: tabName=${tabName}, switchTab 함수 존재=${typeof switchTab}`);
            }
        });
    });
    
    console.log('🎯 모든 인스턴스 초기화 완료 - 시리즈 관리 UI 준비됨');
    console.log('🔗 탭 클릭 이벤트 리스너 추가 완료');
});