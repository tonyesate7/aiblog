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

        const apiKey = localStorage.getItem('openai_api_key');
        if (!apiKey) {
            this.showAlert('OpenAI API 키가 설정되지 않았습니다. 설정에서 API 키를 입력해주세요.', 'error');
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
        const apiKey = localStorage.getItem('openai_api_key');
        if (!apiKey) {
            this.showAlert('OpenAI API 키가 설정되지 않았습니다. 설정에서 API 키를 입력해주세요.', 'error');
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

        const apiKey = localStorage.getItem('openai_api_key');
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
            articleDiv.className = 'border border-gray-200 rounded-lg p-4';
            articleDiv.innerHTML = `
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-lg font-bold text-gray-800">${article.title}</h3>
                    <div class="flex items-center text-sm text-gray-500">
                        <i class="fas fa-file-alt mr-1"></i>
                        <span>${article.wordCount}자</span>
                    </div>
                </div>
                <div class="text-sm text-gray-600 mb-3">
                    <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        ${article.keyword}
                    </span>
                </div>
                <div class="prose prose-sm max-w-none">
                    ${this.markdownToHtml(article.content)}
                </div>
                <div class="mt-4 pt-3 border-t border-gray-100">
                    <button onclick="blogGenerator.editArticle(${article.id})" 
                            class="text-blue-600 hover:text-blue-800 text-sm">
                        <i class="fas fa-edit mr-1"></i>수정
                    </button>
                </div>
            `;
            container.appendChild(articleDiv);
        });

        this.showAlert('모든 블로그 글 생성이 완료되었습니다!', 'success');
    }

    editArticle(articleId) {
        // 글 편집 기능 (추후 구현)
        this.showAlert('글 편집 기능은 곧 추가될 예정입니다.', 'info');
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
            
            // HTML 문서 생성
            let htmlContent = `
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Blog Articles - ${mainKeyword}</title>
                    <style>
                        body { font-family: 'Malgun Gothic', Arial, sans-serif; line-height: 1.6; margin: 40px; }
                        h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
                        h2 { color: #1f2937; margin-top: 30px; }
                        h3 { color: #4b5563; }
                        .article { margin-bottom: 50px; page-break-after: always; }
                        .meta { background-color: #f3f4f6; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
                        .keyword { background-color: #dbeafe; color: #1d4ed8; padding: 5px 10px; border-radius: 15px; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <h1>AI 블로그 자동 생성 결과</h1>
                    <div class="meta">
                        <p><strong>메인 키워드:</strong> ${mainKeyword}</p>
                        <p><strong>생성 일시:</strong> ${new Date().toLocaleDateString('ko-KR')}</p>
                        <p><strong>총 글 수:</strong> ${this.generatedArticles.length}개</p>
                    </div>
            `;

            this.generatedArticles.forEach((article, index) => {
                htmlContent += `
                    <div class="article">
                        <h2>${index + 1}. ${article.title}</h2>
                        <div class="meta">
                            <span class="keyword">${article.keyword}</span>
                            <span style="margin-left: 10px; font-size: 12px; color: #6b7280;">
                                ${article.wordCount}자 | ${new Date(article.createdAt).toLocaleDateString('ko-KR')}
                            </span>
                        </div>
                        <div>${this.markdownToHtml(article.content)}</div>
                    </div>
                `;
            });

            htmlContent += `
                </body>
                </html>
            `;

            // Word 문서로 변환
            const converted = htmlDocx.asBlob(htmlContent);
            
            // 다운로드
            const link = document.createElement('a');
            link.href = URL.createObjectURL(converted);
            link.download = `blog-articles-${mainKeyword}-${new Date().toISOString().slice(0,10)}.docx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showAlert('Word 파일이 다운로드되었습니다!', 'success');
            
        } catch (error) {
            console.error('Word 문서 생성 오류:', error);
            this.showAlert('Word 문서 생성 중 오류가 발생했습니다.', 'error');
        }
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
        const apiKey = document.getElementById('openaiApiKey').value.trim();
        
        if (apiKey) {
            localStorage.setItem('openai_api_key', apiKey);
            this.showAlert('설정이 저장되었습니다.', 'success');
            this.hideSettingsModal();
        } else {
            this.showAlert('API 키를 입력해주세요.', 'error');
        }
    }

    loadSettings() {
        const apiKey = localStorage.getItem('openai_api_key');
        if (apiKey) {
            document.getElementById('openaiApiKey').value = apiKey;
        }
    }

    markdownToHtml(markdown) {
        // 간단한 마크다운 HTML 변환
        let html = markdown
            .replace(/### (.*?)\n/g, '<h3 class="text-lg font-semibold mt-6 mb-3">$1</h3>')
            .replace(/## (.*?)\n/g, '<h2 class="text-xl font-bold mt-8 mb-4">$1</h2>')
            .replace(/# (.*?)\n/g, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p class="mb-4">')
            .replace(/\n/g, '<br>');
        
        // 문단으로 감싸기
        if (!html.startsWith('<h1>') && !html.startsWith('<h2>') && !html.startsWith('<h3>')) {
            html = '<p class="mb-4">' + html + '</p>';
        }
        
        return html;
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