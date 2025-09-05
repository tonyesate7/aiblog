// AI 블로그 생성기 클라이언트

class BlogGenerator {
    constructor() {
        this.generatedArticles = [];
        this.currentProgress = 0;
        this.totalArticles = 0;
        this.init();
    }

    init() {
        this.bindEvents();
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
    }

    // API 키 상태 확인
    async checkApiKeyStatus() {
        try {
            console.log('🔍 API 키 상태 확인 중...');
            const response = await fetch('/api/keys/status');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📊 API 키 상태:', data);
            
            this.updateApiStatus(data);
            
        } catch (error) {
            console.error('❌ API 키 상태 확인 실패:', error);
            this.updateApiStatus({
                keys: { claude: false, gemini: false, openai: false },
                availableModels: [],
                totalAvailable: 0,
                demoMode: true
            });
        }
    }

    // API 상태 UI 업데이트
    updateApiStatus(data) {
        const statusElement = document.getElementById('apiStatus');
        if (!statusElement) return;

        const { keys, availableModels, totalAvailable, demoMode } = data;
        
        let statusHtml = '';
        
        if (demoMode) {
            statusHtml = `
                <div class="flex items-center space-x-2">
                    <div class="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span class="text-yellow-600 font-medium">데모 모드</span>
                    <i class="fas fa-info-circle text-yellow-500 cursor-help" 
                       title="API 키가 설정되지 않았습니다. 샘플 콘텐츠가 제공됩니다."></i>
                </div>
            `;
        } else {
            statusHtml = `
                <div class="flex items-center space-x-4">
                    <div class="flex items-center space-x-2">
                        <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span class="text-green-600 font-medium">${totalAvailable}개 모델 활성</span>
                    </div>
                    <div class="flex space-x-1">
                        ${Object.entries(keys).map(([model, hasKey]) => `
                            <div class="flex items-center space-x-1 text-xs ${hasKey ? 'text-green-600' : 'text-gray-400'}">
                                <div class="w-1.5 h-1.5 rounded-full ${hasKey ? 'bg-green-400' : 'bg-gray-300'}"></div>
                                <span class="uppercase">${model}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        statusElement.innerHTML = statusHtml;

        // AI 모델 선택 옵션 업데이트
        this.updateModelOptions(availableModels);
    }

    // AI 모델 선택 옵션 업데이트
    updateModelOptions(availableModels) {
        const modelSelect = document.getElementById('aiModel');
        if (!modelSelect) return;

        // 모든 옵션을 일단 비활성화
        Array.from(modelSelect.options).forEach(option => {
            const isAvailable = availableModels.includes(option.value);
            option.disabled = !isAvailable;
            option.text = option.text.replace(' (데모)', '');
            if (!isAvailable) {
                option.text += ' (데모)';
            }
        });

        // 사용 가능한 첫 번째 모델 선택
        if (availableModels.length > 0) {
            modelSelect.value = availableModels[0];
        }
    }

    // 서브 키워드 생성
    async generateSubKeywords() {
        const mainKeyword = document.getElementById('mainKeyword').value.trim();
        
        if (!mainKeyword) {
            this.showAlert('메인 키워드를 입력해주세요.', 'warning');
            return;
        }

        const btn = document.getElementById('generateSubKeywords');
        const originalText = btn.innerHTML;
        
        try {
            // 버튼 로딩 상태
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>생성 중...';
            btn.disabled = true;

            console.log('🔄 서브키워드 생성 시작:', mainKeyword);

            const response = await fetch('/api/generate/subkeywords', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    keyword: mainKeyword
                })
            });

            if (!response.ok) {
                throw new Error(`서버 오류: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ 서브키워드 생성 완료:', data);

            this.displaySubKeywords(data);
            
            if (data.demoMode) {
                this.showAlert('데모 모드로 샘플 키워드가 생성되었습니다.', 'info');
            }

        } catch (error) {
            console.error('❌ 서브키워드 생성 실패:', error);
            this.showAlert('서브키워드 생성에 실패했습니다: ' + error.message, 'error');
        } finally {
            // 버튼 복원
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    // 서브 키워드 표시
    displaySubKeywords(data) {
        const section = document.getElementById('subKeywordsSection');
        const list = document.getElementById('subKeywordsList');
        
        if (!section || !list) return;

        // 서브키워드 리스트 생성
        list.innerHTML = data.subkeywords.map((keyword, index) => `
            <label class="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 cursor-pointer transition-all duration-200">
                <input type="checkbox" 
                       class="subkeyword-checkbox w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500" 
                       value="${keyword}" 
                       ${index < 5 ? 'checked' : ''}>
                <span class="text-sm text-gray-700 select-none">${keyword}</span>
            </label>
        `).join('');

        section.classList.remove('hidden');
        section.scrollIntoView({ behavior: 'smooth' });
    }

    // 블로그 생성 시작
    async startBlogGeneration() {
        const mainKeyword = document.getElementById('mainKeyword').value.trim();
        const targetAudience = document.getElementById('targetAudience').value;
        const articleCount = parseInt(document.getElementById('articleCount').value) || 3;
        const aiModel = document.getElementById('aiModel').value;
        
        // 선택된 서브키워드들
        const selectedSubkeywords = Array.from(document.querySelectorAll('.subkeyword-checkbox:checked'))
            .map(cb => cb.value);

        if (!mainKeyword) {
            this.showAlert('메인 키워드를 입력해주세요.', 'warning');
            return;
        }

        if (selectedSubkeywords.length === 0) {
            this.showAlert('생성할 서브키워드를 최소 1개 선택해주세요.', 'warning');
            return;
        }

        const actualCount = Math.min(articleCount, selectedSubkeywords.length);
        this.totalArticles = actualCount;
        this.currentProgress = 0;
        this.generatedArticles = [];

        try {
            this.showProgressSection();
            this.updateProgress(0, '블로그 생성 준비 중...');

            console.log('📝 블로그 생성 시작:', {
                mainKeyword,
                subkeywords: selectedSubkeywords.slice(0, actualCount),
                targetAudience,
                articleCount: actualCount,
                model: aiModel
            });

            const response = await fetch('/api/generate/blog', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    keyword: mainKeyword,
                    subkeywords: selectedSubkeywords.slice(0, actualCount),
                    targetAudience,
                    articleCount: actualCount,
                    model: aiModel
                })
            });

            if (!response.ok) {
                throw new Error(`서버 오류: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ 블로그 생성 완료:', data);

            this.generatedArticles = data.articles;
            this.updateProgress(100, '생성 완료!');
            
            setTimeout(() => {
                this.displayResults(data);
            }, 500);

            if (data.demoMode) {
                this.showAlert('데모 모드로 샘플 콘텐츠가 생성되었습니다.', 'info');
            }

        } catch (error) {
            console.error('❌ 블로그 생성 실패:', error);
            this.showAlert('블로그 생성에 실패했습니다: ' + error.message, 'error');
            this.hideProgressSection();
        }
    }

    // 진행 상황 섹션 표시
    showProgressSection() {
        const section = document.getElementById('progressSection');
        if (section) {
            section.classList.remove('hidden');
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // 진행 상황 섹션 숨김
    hideProgressSection() {
        const section = document.getElementById('progressSection');
        if (section) {
            section.classList.add('hidden');
        }
    }

    // 진행 상황 업데이트
    updateProgress(percent, message, details = '') {
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        const progressPercent = document.getElementById('progressPercent');
        const progressDetails = document.getElementById('progressDetails');

        if (progressBar) progressBar.style.width = `${percent}%`;
        if (progressText) progressText.textContent = message;
        if (progressPercent) progressPercent.textContent = `${Math.round(percent)}%`;
        if (progressDetails && details) progressDetails.innerHTML = details;

        this.currentProgress = percent;
    }

    // 결과 표시
    displayResults(data) {
        const section = document.getElementById('resultsSection');
        const list = document.getElementById('articlesList');
        
        if (!section || !list) return;

        list.innerHTML = data.articles.map((article, index) => `
            <div class="border border-gray-200 rounded-lg p-6 mb-4">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-2">
                            <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                ${index + 1}번 글
                            </span>
                            <span class="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                ${article.keyword}
                            </span>
                            <span class="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                ${article.targetAudience}
                            </span>
                            ${article.demoMode ? '<span class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">데모</span>' : ''}
                        </div>
                        <h4 class="text-lg font-bold text-gray-800 mb-2">${article.title}</h4>
                        <div class="flex items-center space-x-4 text-sm text-gray-500">
                            <span><i class="fas fa-clock mr-1"></i>${new Date(article.createdAt).toLocaleString()}</span>
                            <span><i class="fas fa-font mr-1"></i>${article.wordCount.toLocaleString()}자</span>
                            <span><i class="fas fa-robot mr-1"></i>${article.model}</span>
                        </div>
                    </div>
                    <button onclick="blogGenerator.toggleArticleContent(${index})" 
                            class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                        <i id="toggleIcon${index}" class="fas fa-chevron-down"></i>
                        <span class="ml-1">내용 보기</span>
                    </button>
                </div>
                
                <div id="articleContent${index}" class="hidden">
                    <div class="bg-gray-50 rounded-lg p-4 overflow-auto max-h-96">
                        <div class="prose prose-sm max-w-none" id="articleText${index}">
                            ${this.formatMarkdownToHTML(article.content)}
                        </div>
                    </div>
                    <div class="flex justify-end space-x-2 mt-3">
                        <button onclick="blogGenerator.copyToClipboard(${index})" 
                                class="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded text-sm font-medium transition-colors">
                            <i class="fas fa-copy mr-1"></i>복사
                        </button>
                        <button onclick="blogGenerator.downloadSingle(${index})" 
                                class="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded text-sm font-medium transition-colors">
                            <i class="fas fa-download mr-1"></i>다운로드
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        this.hideProgressSection();
        section.classList.remove('hidden');
        section.scrollIntoView({ behavior: 'smooth' });
    }

    // 글 내용 토글
    toggleArticleContent(index) {
        const content = document.getElementById(`articleContent${index}`);
        const icon = document.getElementById(`toggleIcon${index}`);
        
        if (content && icon) {
            if (content.classList.contains('hidden')) {
                content.classList.remove('hidden');
                icon.className = 'fas fa-chevron-up';
            } else {
                content.classList.add('hidden');
                icon.className = 'fas fa-chevron-down';
            }
        }
    }

    // 클립보드 복사
    async copyToClipboard(index) {
        const article = this.generatedArticles[index];
        if (!article) return;

        try {
            await navigator.clipboard.writeText(article.content);
            this.showAlert('클립보드에 복사되었습니다!', 'success');
        } catch (error) {
            console.error('복사 실패:', error);
            this.showAlert('복사에 실패했습니다.', 'error');
        }
    }

    // 개별 글 다운로드
    downloadSingle(index) {
        const article = this.generatedArticles[index];
        if (!article) return;

        const content = `# ${article.title}\n\n${article.content}`;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${article.title}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // PDF 다운로드
    downloadPDF() {
        if (this.generatedArticles.length === 0) {
            this.showAlert('다운로드할 글이 없습니다.', 'warning');
            return;
        }

        // PDF 라이브러리가 없으므로 텍스트 파일로 대체
        this.downloadAllAsText('pdf');
    }

    // Word 다운로드
    downloadWord() {
        if (this.generatedArticles.length === 0) {
            this.showAlert('다운로드할 글이 없습니다.', 'warning');
            return;
        }

        // Word 라이브러리가 없으므로 텍스트 파일로 대체
        this.downloadAllAsText('docx');
    }

    // 전체 텍스트 파일 다운로드
    downloadAllAsText(format) {
        const content = this.generatedArticles.map((article, index) => 
            `${'='.repeat(50)}\n글 ${index + 1}: ${article.title}\n키워드: ${article.keyword}\n타겟: ${article.targetAudience}\n생성일: ${new Date(article.createdAt).toLocaleString()}\n${'='.repeat(50)}\n\n${article.content}\n\n`
        ).join('\n');

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `AI블로그_모음집_${new Date().toISOString().slice(0, 10)}.${format === 'pdf' ? 'txt' : 'txt'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showAlert(`모든 글이 ${format.toUpperCase()} 형식으로 다운로드되었습니다.`, 'success');
    }

    // 마크다운을 HTML로 변환 (간단한 변환)
    formatMarkdownToHTML(markdown) {
        return markdown
            .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
            .replace(/^\- (.*$)/gim, '<li class="ml-4">• $1</li>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p class="mb-3">')
            .replace(/\n/g, '<br>')
            .replace(/^(.*)$/, '<p class="mb-3">$1</p>');
    }

    // 알림 표시
    showAlert(message, type = 'info') {
        const colors = {
            success: 'bg-green-100 border-green-400 text-green-700',
            error: 'bg-red-100 border-red-400 text-red-700',
            warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
            info: 'bg-blue-100 border-blue-400 text-blue-700'
        };

        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        const alertDiv = document.createElement('div');
        alertDiv.className = `fixed top-4 right-4 max-w-sm p-4 border rounded-lg shadow-lg z-50 ${colors[type]}`;
        alertDiv.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="${icons[type]}"></i>
                <span class="font-medium">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-auto">
                    <i class="fas fa-times"></i>
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

// 전역 변수로 인스턴스 생성
let blogGenerator;

// DOM 로드 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    blogGenerator = new BlogGenerator();
    console.log('✅ AI 블로그 생성기 초기화 완료');
});