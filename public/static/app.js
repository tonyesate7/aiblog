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

// 앱 초기화
const blogGenerator = new BlogGenerator();