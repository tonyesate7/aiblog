// 블로그 자동 생성기 클라이언트 JavaScript

class BlogGenerator {
    constructor() {
        this.generatedArticles = [];
        this.currentProgress = 0;
        this.totalArticles = 10;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSettings();
        this.loadFromLocalStorage();
    }

    bindEvents() {
        // 서브 키워드 생성
        document.getElementById('generateSubKeywords').addEventListener('click', () => {
            this.generateSubKeywords();
        });

        // 블로그 글 생성 시작
        document.getElementById('startGeneration').addEventListener('click', () => {
            this.startBlogGeneration();
        });

        // 설정 모달
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showSettingsModal();
        });

        document.getElementById('closeSettings').addEventListener('click', () => {
            this.hideSettingsModal();
        });

        document.getElementById('saveSettings').addEventListener('click', () => {
            this.saveSettings();
        });

        // 파일 다운로드
        document.getElementById('downloadPDF').addEventListener('click', () => {
            this.downloadPDF();
        });

        document.getElementById('downloadWord').addEventListener('click', () => {
            this.downloadWord();
        });

        document.getElementById('downloadIndividual').addEventListener('click', () => {
            this.downloadIndividualFiles();
        });

        document.getElementById('downloadMarkdown').addEventListener('click', () => {
            this.downloadMarkdown();
        });

        // 추가 기능 버튼들
        document.getElementById('selectAllArticles').addEventListener('click', () => {
            this.selectAllArticles();
        });

        document.getElementById('saveProject').addEventListener('click', () => {
            this.saveProject();
        });

        document.getElementById('clearAll').addEventListener('click', () => {
            this.clearAllArticles();
        });

        // SEO 분석 버튼
        document.getElementById('refreshSeoAnalysis').addEventListener('click', () => {
            this.analyzeSEO();
        });

        // 프로젝트 관리 모달
        document.getElementById('showProjectModal').addEventListener('click', () => {
            this.showProjectModal();
        });

        document.getElementById('closeProject').addEventListener('click', () => {
            this.hideProjectModal();
        });

        // 탭 전환
        document.getElementById('saveTab').addEventListener('click', () => this.switchTab('save'));
        document.getElementById('loadTab').addEventListener('click', () => this.switchTab('load'));
        document.getElementById('presetsTab').addEventListener('click', () => this.switchTab('presets'));
        document.getElementById('keywordsTab').addEventListener('click', () => this.switchTab('keywords'));

        // 프로젝트 저장/불러오기
        document.getElementById('saveProjectBtn').addEventListener('click', () => {
            this.saveCurrentProject();
        });

        document.getElementById('exportProject').addEventListener('click', () => {
            this.exportProjectAsJSON();
        });

        document.getElementById('importProject').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });

        document.getElementById('importFile').addEventListener('change', (e) => {
            this.importProjectFromFile(e);
        });

        // 프리셋 관리
        document.getElementById('savePreset').addEventListener('click', () => {
            this.saveCurrentPreset();
        });

        // 즐겨찾기 키워드
        document.getElementById('addFavoriteKeyword').addEventListener('click', () => {
            this.addFavoriteKeyword();
        });

        document.getElementById('newFavoriteKeyword').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addFavoriteKeyword();
            }
        });

        // 모달 외부 클릭시 닫기
        document.getElementById('settingsModal').addEventListener('click', (e) => {
            if (e.target.id === 'settingsModal') {
                this.hideSettingsModal();
            }
        });
    }

    async generateSubKeywords() {
        const mainKeyword = document.getElementById('mainKeyword').value.trim();
        
        if (!mainKeyword) {
            this.showAlert('메인 키워드를 입력해주세요.', 'error');
            return;
        }

        const apiKey = localStorage.getItem('claude_api_key');
        if (!apiKey) {
            this.showAlert('Claude API 키가 설정되지 않았습니다. 설정에서 API 키를 입력해주세요.', 'error');
            return;
        }

        const button = document.getElementById('generateSubKeywords');
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>AI가 키워드 생성 중...';
        button.disabled = true;

        try {
            const response = await axios.post('/api/generate-subkeywords', {
                mainKeyword: mainKeyword,
                apiKey: apiKey
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
        const apiKey = localStorage.getItem('claude_api_key');
        if (!apiKey) {
            this.showAlert('Claude API 키가 설정되지 않았습니다. 설정에서 API 키를 입력해주세요.', 'error');
            return;
        }

        const keywords = this.getSubKeywords();
        if (keywords.length === 0) {
            this.showAlert('서브 키워드를 먼저 생성해주세요.', 'error');
            return;
        }

        document.getElementById('progressSection').style.display = 'block';
        document.getElementById('progressSection').scrollIntoView({ behavior: 'smooth' });
        
        this.currentProgress = 0;
        this.generatedArticles = [];
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
            this.showResults();
            
            // SEO 분석 실행
            setTimeout(() => {
                this.analyzeSEO();
            }, 1000);
            
            this.showAlert('모든 블로그 글 생성이 완료되었습니다!', 'success');
            return;
        }

        const keyword = keywords[index];
        this.updateProgressItem(index, 'generating');

        const apiKey = localStorage.getItem('claude_api_key');
        const mainKeyword = document.getElementById('mainKeyword').value.trim();
        const contentStyle = document.getElementById('contentStyle').value;
        const contentLength = document.getElementById('contentLength').value;
        const targetAudience = document.getElementById('targetAudience').value;

        try {
            const response = await axios.post('/api/generate-article', {
                keyword: keyword,
                mainKeyword: mainKeyword,
                contentStyle: contentStyle,
                contentLength: contentLength,
                targetAudience: targetAudience,
                apiKey: apiKey
            });

            if (response.data.success) {
                const article = {
                    ...response.data.article,
                    id: index + 1
                };
                this.generatedArticles.push(article);
                this.updateProgressItem(index, 'completed');
            } else {
                this.updateProgressItem(index, 'error');
                console.error('글 생성 실패:', response.data.error);
            }
        } catch (error) {
            console.error('글 생성 오류:', error);
            this.updateProgressItem(index, 'error');
        }

        this.currentProgress++;
        this.updateProgress();

        // 다음 글 생성 (500ms 지연)
        setTimeout(() => {
            this.generateArticlesSequentially(keywords, index + 1);
        }, 500);
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
            case 'error':
                icon.className = 'fas fa-times-circle text-red-500 mr-3';
                statusText.textContent = '오류';
                statusText.className = 'text-xs text-red-500';
                break;
        }
    }

    updateProgress() {
        const percentage = (this.currentProgress / this.totalArticles) * 100;
        document.getElementById('progressBar').style.width = `${percentage}%`;
        document.getElementById('progressText').textContent = `${this.currentProgress}/${this.totalArticles}`;
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
                        <button onclick="blogGenerator.duplicateArticle(${article.id})" 
                                class="text-green-600 hover:text-green-800 text-sm transition">
                            <i class="fas fa-copy mr-1"></i>복제
                        </button>
                        <button onclick="blogGenerator.deleteArticle(${article.id})" 
                                class="text-red-600 hover:text-red-800 text-sm transition">
                            <i class="fas fa-trash mr-1"></i>삭제
                        </button>
                    </div>
                    <div class="text-xs text-gray-400">
                        ID: ${article.id}
                    </div>
                </div>
            `;
            container.appendChild(articleDiv);
        });

        this.showAlert('모든 블로그 글 생성이 완료되었습니다!', 'success');
    }

    toggleEdit(articleId) {
        const readMode = document.getElementById(`read-mode-${articleId}`);
        const editMode = document.getElementById(`edit-mode-${articleId}`);
        const editBtn = document.getElementById(`edit-btn-${articleId}`);
        
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

    duplicateArticle(articleId) {
        const article = this.generatedArticles.find(a => a.id === articleId);
        if (!article) return;

        const newArticle = {
            ...article,
            id: Date.now(), // 새로운 ID
            title: `${article.title} (복사본)`,
            createdAt: new Date().toISOString(),
            modified: true,
            modifiedAt: new Date().toISOString()
        };

        this.generatedArticles.push(newArticle);
        this.showResults(); // 결과 다시 표시
        this.saveToLocalStorage();
        
        this.showAlert('글이 복제되었습니다! 📋', 'success');
    }

    deleteArticle(articleId) {
        if (confirm('정말로 이 글을 삭제하시겠습니까?')) {
            this.generatedArticles = this.generatedArticles.filter(a => a.id !== articleId);
            this.showResults(); // 결과 다시 표시
            this.saveToLocalStorage();
            
            this.showAlert('글이 삭제되었습니다.', 'info');
        }
    }

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

    showSettingsModal() {
        document.getElementById('settingsModal').style.display = 'flex';
    }

    hideSettingsModal() {
        document.getElementById('settingsModal').style.display = 'none';
    }

    saveSettings() {
        const apiKey = document.getElementById('claudeApiKey').value.trim();
        
        if (apiKey) {
            localStorage.setItem('claude_api_key', apiKey);
            this.showAlert('Claude API 키가 저장되었습니다.', 'success');
            this.hideSettingsModal();
        } else {
            this.showAlert('Claude API 키를 입력해주세요.', 'error');
        }
    }

    loadSettings() {
        const apiKey = localStorage.getItem('claude_api_key');
        if (apiKey) {
            document.getElementById('claudeApiKey').value = apiKey;
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

    showAlert(message, type = 'info') {
        // 간단한 알림 표시
        const alertColors = {
            success: 'bg-green-100 border-green-500 text-green-700',
            error: 'bg-red-100 border-red-500 text-red-700',
            info: 'bg-blue-100 border-blue-500 text-blue-700'
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

// 앱 초기화
const blogGenerator = new BlogGenerator();