// 🔥 라이브 AI 블로그 생성기 - 간단한 3단계 UI 제어
class SimpleUI {
    constructor() {
        this.currentStep = 1;
        this.formData = {};
        this.liveStatus = null;
        this.isGenerating = false; // 중복 요청 방지 플래그
        this.initializeEventListeners();
        this.setDefaults();
        this.checkLiveStatus();
    }
    
    initializeEventListeners() {
        // 🔥 폼 제출 이벤트 처리 - 가장 중요한 기능!
        const blogForm = document.getElementById('blogForm');
        if (blogForm) {
            blogForm.addEventListener('submit', (e) => {
                e.preventDefault(); // 기본 제출 동작 방지
                this.generateBlog(); // 블로그 생성 함수 호출
            });
        }
        
        // 주제 입력 감지
        const topicInput = document.getElementById('topic');
        if (topicInput) {
            topicInput.addEventListener('input', (e) => {
                const hasValue = e.target.value.trim().length > 0;
                const nextBtn = document.getElementById('nextToStep2');
                if (nextBtn) nextBtn.disabled = !hasValue;
            });
        }
        
        // 추천 주제 클릭
        document.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const topic = btn.dataset.topic;
                document.getElementById('topic').value = topic;
                document.getElementById('nextToStep2').disabled = false;
                this.nextStep();
            });
        });
        
        // 옵션 카드 선택
        document.querySelectorAll('.option-card').forEach(card => {
            card.addEventListener('click', () => {
                const group = card.parentElement;
                group.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                
                // 값 설정
                const value = card.dataset.value;
                const parentContainer = card.closest('div').parentElement;
                const heading = parentContainer.querySelector('h3 i');
                
                if (heading && heading.classList.contains('fa-users')) {
                    document.getElementById('audience').value = value;
                } else {
                    document.getElementById('tone').value = value;
                }
                
                this.checkStep2Complete();
            });
        });
        
        // 단계 이동
        const nextBtn = document.getElementById('nextToStep2');
        const backBtn = document.getElementById('backToStep1');
        const generateBtn = document.getElementById('generateBtn');
        const newBtn = document.getElementById('newArticleBtn');
        
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextStep());
        if (backBtn) backBtn.addEventListener('click', () => this.prevStep());
        if (generateBtn) generateBtn.addEventListener('click', () => this.generateBlog());
        if (newBtn) newBtn.addEventListener('click', () => this.resetForm());
        
        // 고급 옵션 토글
        const toggleBtn = document.getElementById('toggleAdvanced');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const options = document.getElementById('advancedOptions');
                const chevron = document.getElementById('advancedChevron');
                if (options && chevron) {
                    options.classList.toggle('hidden');
                    chevron.classList.toggle('rotate-180');
                }
            });
        }
    }
    
    setDefaults() {
        // 기본값 설정
        setTimeout(() => {
            const defaultAudience = document.querySelector('[data-value="일반인"]');
            const defaultTone = document.querySelector('[data-value="친근한"]');
            
            if (defaultAudience) defaultAudience.click();
            if (defaultTone) defaultTone.click();
        }, 100);
    }
    
    nextStep() {
        if (this.currentStep < 3) {
            this.hideStep(this.currentStep);
            this.currentStep++;
            this.showStep(this.currentStep);
            this.updateProgress();
        }
    }
    
    prevStep() {
        if (this.currentStep > 1) {
            this.hideStep(this.currentStep);
            this.currentStep--;
            this.showStep(this.currentStep);
            this.updateProgress();
        }
    }
    
    showStep(step) {
        const element = document.getElementById(`step${step}`);
        if (element) {
            element.style.display = 'block';
            setTimeout(() => element.classList.add('active'), 10);
        }
    }
    
    hideStep(step) {
        const element = document.getElementById(`step${step}`);
        if (element) {
            element.classList.remove('active');
            setTimeout(() => element.style.display = 'none', 300);
        }
    }
    
    updateProgress() {
        document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
            const stepNum = index + 1;
            indicator.classList.remove('active', 'completed');
            
            if (stepNum === this.currentStep) {
                indicator.classList.add('active');
            } else if (stepNum < this.currentStep) {
                indicator.classList.add('completed');
            }
        });
    }
    
    checkStep2Complete() {
        const audience = document.getElementById('audience')?.value;
        const tone = document.getElementById('tone')?.value;
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            generateBtn.disabled = !audience || !tone;
        }
    }
    
    async generateContent() {
        const topic = document.getElementById('topic')?.value?.trim();
        const audience = document.getElementById('audience')?.value;
        const tone = document.getElementById('tone')?.value;
        const enableSEO = document.getElementById('enableSEO')?.checked;
        const aiModel = document.getElementById('aiModel')?.value;
        
        if (!topic || !audience || !tone) {
            this.showNotification('모든 필수 항목을 입력해주세요.', 'error');
            return;
        }
        
        // 로딩 표시
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>AI가 글을 작성하고 있습니다...';
        }
        
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    topic,
                    audience,
                    tone,
                    aiModel: aiModel === 'auto' ? 'auto' : aiModel,
                    enableSEO: enableSEO || false,
                    enablePhase1: true
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.help || '생성 중 오류가 발생했습니다.');
            }
            
            const result = await response.json();
            this.displayResult(result);
        } catch (error) {
            console.error('생성 오류:', error);
            this.showNotification(`생성 중 오류: ${error.message}`, 'error');
        } finally {
            if (generateBtn) {
                generateBtn.disabled = false;
                generateBtn.innerHTML = '<i class="fas fa-magic mr-2"></i>AI 블로그 생성하기';
            }
        }
    }
    
    displayResult(result) {
        const infoElement = document.getElementById('generationInfo');
        const contentElement = document.getElementById('contentReader');
        const resultSection = document.getElementById('resultSection');
        
        if (infoElement && result.content) {
            const wordCount = result.content.length;
            const readingTime = Math.ceil(wordCount / 500);
            const modelName = result.model || 'AI';
            infoElement.textContent = `모델: ${modelName} | 글자수: ${wordCount}자 | 예상 읽기 시간: ${readingTime}분`;
        }
        
        if (contentElement && result.content) {
            contentElement.innerHTML = this.markdownToHtml(result.content);
        }
        
        if (resultSection) {
            resultSection.classList.remove('hidden');
            resultSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        this.showNotification('블로그 글이 성공적으로 생성되었습니다!', 'success');
    }
    
    markdownToHtml(markdown) {
        return markdown
            .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-gray-800 mt-6 mb-3">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-gray-800 mt-8 mb-4">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-gray-900 mb-6">$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
            .replace(/\n\n/g, '</p><p class="mb-4">')
            .replace(/^(.+)$/gm, '<p class="mb-4">$1</p>')
            .replace(/<p class="mb-4"><\/p>/g, '');
    }
    
    showNotification(message, type = 'info') {
        // 간단한 알림 표시
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg max-w-sm z-50 ${
            type === 'error' ? 'bg-red-500 text-white' : 
            type === 'success' ? 'bg-green-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${
                    type === 'error' ? 'fa-exclamation-triangle' : 
                    type === 'success' ? 'fa-check-circle' :
                    'fa-info-circle'
                } mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 5초 후 자동 제거
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
    
    resetForm() {
        this.currentStep = 1;
        const topicInput = document.getElementById('topic');
        const nextBtn = document.getElementById('nextToStep2');
        const resultSection = document.getElementById('resultSection');
        
        if (topicInput) topicInput.value = '';
        if (nextBtn) nextBtn.disabled = true;
        if (resultSection) resultSection.classList.add('hidden');
        
        this.hideStep(2);
        this.showStep(1);
        this.updateProgress();
        this.setDefaults();
        
        // 페이지 맨 위로 스크롤
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // 🔑 라이브 상태 확인
    async checkLiveStatus() {
        try {
            const response = await fetch('/api/status');
            const status = await response.json();
            
            this.liveStatus = status;
            this.updateStatusDisplay(status);
            
        } catch (error) {
            console.log('상태 확인 실패:', error);
            this.updateStatusDisplay({
                status: 'demo',
                summary: { 
                    configured: '0/4',
                    message: '⚠️ API 연결 확인 중...'
                }
            });
        }
    }
    
    updateStatusDisplay(status) {
        // 헤더 상태 업데이트 (있는 경우)
        const statusElement = document.getElementById('liveStatus');
        if (statusElement) {
            const isLive = status.status === 'live';
            statusElement.innerHTML = isLive
                ? `<i class="fas fa-bolt text-yellow-500 mr-1"></i>🔥 라이브 AI 활성화 (${status.summary.configured})`
                : `<i class="fas fa-flask text-blue-500 mr-1"></i>🎭 데모 모드 (${status.summary.configured})`;
            
            statusElement.className = isLive 
                ? 'px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium'
                : 'px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium';
        }
        
        // 생성 버튼 텍스트 업데이트
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn && status.status === 'live') {
            const originalText = generateBtn.innerHTML;
            if (!originalText.includes('🔥')) {
                generateBtn.innerHTML = originalText.replace('AI 블로그 생성하기', '🔥 라이브 AI 블로그 생성하기');
            }
        }
        
        console.log(`🚀 시스템 상태: ${status.status} (${status.summary.configured})`, status.summary.message);
    }
    
    // 🚀 블로그 생성 메인 함수
    async generateBlog() {
        // 중복 요청 방지
        if (this.isGenerating) {
            console.warn('⚠️ 이미 생성 중입니다. 잠시만 기다려주세요.');
            return;
        }
        
        this.isGenerating = true;
        
        try {
            // 1. 폼 데이터 수집
            const topic = document.getElementById('topic').value.trim();
            const audience = document.getElementById('audience').value;
            const tone = document.getElementById('tone').value;
            const aiModel = document.getElementById('aiModel').value;
            
            if (!topic) {
                alert('블로그 주제를 입력해주세요!');
                this.isGenerating = false;
                return;
            }
            
            console.log('🚀 블로그 생성 시작:', { topic, audience, tone, aiModel });
            
            // 2. UI 상태 변경 - 결과 영역 보이기, 로딩 시작
            const resultDiv = document.getElementById('result');
            const loadingDiv = document.getElementById('loading');
            const contentDiv = document.getElementById('content');
            
            if (resultDiv) resultDiv.classList.remove('hidden');
            if (loadingDiv) loadingDiv.classList.remove('hidden');
            if (contentDiv) contentDiv.classList.add('hidden');
            
            // 3. API 호출 (타임아웃 포함)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
                console.warn('⏰ API 호출 타임아웃 (30초)');
            }, 30000);
            
            console.log('📡 v4.2.0 API 요청 시작 - 동적 로드!');
            console.log('📡 요청 본문:', JSON.stringify({
                topic, audience, tone, aiModel,
                enablePhase1: true,
                enableSEO: false
            }));
            
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    topic,
                    audience,
                    tone,
                    aiModel,
                    enablePhase1: true,
                    enableSEO: false
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            console.log('📡 API 응답 받음:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`API 오류: ${response.status}`);
            }
            
            // 안전한 JSON 파싱
            console.log('📄 응답 텍스트 추출 중...');
            const responseText = await response.text();
            console.log('📄 v4.2.0 응답 텍스트 길이:', responseText.length, '첫 100자:', responseText.substring(0, 100));
            
            // 디버그: 응답 헤더 정보도 출력
            console.log('📄 응답 헤더 정보:', {
                contentType: response.headers.get('content-type'),
                contentLength: response.headers.get('content-length'),
                status: response.status,
                statusText: response.statusText,
                url: response.url
            });
            
            if (!responseText || responseText.trim() === '') {
                throw new Error('서버에서 빈 응답을 받았습니다');
            }
            
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON 파싱 실패:', parseError);
                console.error('응답 텍스트:', responseText.substring(0, 200) + '...');
                throw new Error('서버 응답을 해석할 수 없습니다');
            }
            
            console.log('✅ 블로그 생성 완료:', result.metadata);
            
            // 4. 결과 화면 표시
            this.displayResult(result);
            
        } catch (error) {
            console.error('❌ 블로그 생성 오류:', error);
            
            let errorMessage = '블로그 생성 중 오류가 발생했습니다.';
            
            if (error.name === 'AbortError') {
                errorMessage = '요청이 시간 초과되었습니다. 잠시 후 다시 시도해주세요.';
            } else if (error.message.includes('네트워크')) {
                errorMessage = '네트워크 연결을 확인하고 다시 시도해주세요.';
            } else if (error.message.includes('JSON')) {
                errorMessage = '서버 응답에 문제가 있습니다. 잠시 후 다시 시도해주세요.';
            }
            
            alert(errorMessage);
            
            // 에러 시 UI 초기화
            const resultDiv = document.getElementById('result');
            const loadingDiv = document.getElementById('loading');
            if (resultDiv) resultDiv.classList.add('hidden');
            if (loadingDiv) loadingDiv.classList.add('hidden');
        } finally {
            // 생성 완료/실패와 관계없이 플래그 리셋
            this.isGenerating = false;
        }
    }
    
    // 🎨 결과 표시 함수
    displayResult(result) {
        const loadingDiv = document.getElementById('loading');
        const contentDiv = document.getElementById('content');
        const blogContentDiv = document.getElementById('blogContent');
        const metadataDiv = document.getElementById('metadata');
        
        // 로딩 숨기고 콘텐츠 보이기
        if (loadingDiv) loadingDiv.classList.add('hidden');
        if (contentDiv) contentDiv.classList.remove('hidden');
        
        // 블로그 내용 표시 (Markdown을 HTML로 간단 변환)
        if (blogContentDiv) {
            const htmlContent = this.markdownToHtml(result.content);
            blogContentDiv.innerHTML = htmlContent;
        }
        
        // 메타데이터 표시
        if (metadataDiv) {
            metadataDiv.innerHTML = `
                <div class="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <strong>🤖 AI 모델:</strong> ${result.model || result.metadata?.aiModel || 'Unknown'}
                    </div>
                    <div>
                        <strong>📊 품질 점수:</strong> ${result.metadata?.qualityScore || 'N/A'}/100
                    </div>
                    <div>
                        <strong>👥 대상 독자:</strong> ${result.metadata?.audience || 'N/A'}
                    </div>
                    <div>
                        <strong>🎭 글의 톤:</strong> ${result.metadata?.tone || 'N/A'}
                    </div>
                    <div class="md:col-span-2">
                        <strong>📅 생성 시간:</strong> ${new Date(result.metadata?.generatedAt).toLocaleString('ko-KR')}
                    </div>
                    <div class="md:col-span-2">
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${result.metadata?.isLive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                            ${result.metadata?.isLive ? '🔥 라이브 AI 생성' : '🎭 데모 모드'}
                        </span>
                    </div>
                </div>
            `;
        }
        
        // 전역 변수에 저장 (복사/다운로드용)
        window.currentBlogContent = result.content;
        window.currentBlogTitle = result.title || `${result.metadata?.topic || 'AI 블로그'} - 완벽 가이드`;
        
        // 🔍 콘텐츠 기반 키워드 추출을 위한 로그
        console.log('📝 블로그 내용 저장 완료 - 길이:', result.content.length);
        console.log('🎯 제목:', window.currentBlogTitle);
        console.log('📄 내용 미리보기:', result.content.substring(0, 300) + '...');
    }
    
    // 📝 간단한 Markdown to HTML 변환
    markdownToHtml(markdown) {
        return markdown
            .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-gray-800 mb-6 mt-8">$1</h1>')
            .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold text-gray-800 mb-4 mt-6">$1</h2>')
            .replace(/^### (.*$)/gm, '<h3 class="text-xl font-medium text-gray-800 mb-3 mt-4">$1</h3>')
            .replace(/^\- (.*$)/gm, '<li class="mb-2">$1</li>')
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
            .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-700 my-4">$1</blockquote>')
            .replace(/\n\n/g, '</p><p class="mb-4">')
            .replace(/^(?!<[h|l|b])/gm, '<p class="mb-4">')
            .replace(/<\/p><p class="mb-4">(<[h|l|b])/g, '$1')
            .replace(/(<li class="mb-2">.*<\/li>)/gs, '<ul class="list-disc list-inside mb-4 space-y-2">$1</ul>')
    }
    
    // 🇰🇷 한국 트렌드 데이터 가져오기
    async loadKoreanTrends() {
        try {
            const response = await fetch('/api/korean-trends');
            
            if (!response.ok) {
                throw new Error(`트렌드 API 오류: ${response.status}`);
            }
            
            const responseText = await response.text();
            if (!responseText || responseText.trim() === '') {
                throw new Error('트렌드 API에서 빈 응답을 받았습니다');
            }
            
            let trends;
            try {
                trends = JSON.parse(responseText);
            } catch (parseError) {
                console.error('트렌드 JSON 파싱 실패:', parseError);
                throw new Error('트렌드 데이터를 해석할 수 없습니다');
            }
            
            // 기존 API 구조에 맞춰 처리
            if (trends.success && trends.data && trends.data.hotKeywords) {
                this.displayTrendSuggestions(trends.data.hotKeywords.slice(0, 6));
            } else if (trends.realtime) {
                // 새로운 구조 대비
                this.displayTrendSuggestions(trends.realtime.slice(0, 6));
            } else {
                console.warn('트렌드 데이터 형식을 인식할 수 없습니다:', trends);
                this.showTrendError();
            }
        } catch (error) {
            console.error('트렌드 로드 실패:', error);
            this.showTrendError();
        }
    }
    
    // 트렌드 기반 주제 추천 표시
    displayTrendSuggestions(trends) {
        const container = document.getElementById('trendSuggestions');
        if (!container) return;
        
        container.innerHTML = `
            <div class="mb-4">
                <h3 class="text-lg font-semibold text-gray-800 mb-3">🔥 실시간 한국 트렌드</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                    ${trends.map(trend => `
                        <button 
                            class="trend-suggestion-btn px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all text-sm"
                            data-topic="${trend.keyword}"
                            onclick="selectTrendTopic('${trend.keyword}')"
                        >
                            ${trend.keyword} 📈 ${trend.growth || trend.volume || ''}${trend.growth ? '%' : trend.volume ? 'k' : ''}
                        </button>
                    `).join('')}
                </div>
                <p class="text-xs text-gray-500 mt-2">💡 키워드를 클릭하면 자동으로 주제가 입력됩니다</p>
            </div>
        `;
    }
    
    // 트렌드 로딩 오류 표시
    showTrendError() {
        const container = document.getElementById('trendSuggestions');
        if (!container) return;
        
        container.innerHTML = `
            <div class="mb-4">
                <h3 class="text-lg font-semibold text-gray-800 mb-3">🔥 실시간 한국 트렌드</h3>
                <div class="bg-gray-100 rounded-lg p-4 text-center">
                    <p class="text-gray-600">트렌드 데이터를 불러올 수 없습니다.</p>
                    <button 
                        onclick="refreshTrends()" 
                        class="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                        🔄 다시 시도
                    </button>
                </div>
            </div>
        `;
    }
    
    // 🖼️ 이미지 생성 요청
    async generateBlogImage(topic, content, imageType = 'thumbnail') {
        try {
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, content, imageType })
            });
            
            if (!response.ok) {
                throw new Error(`이미지 API 오류: ${response.status}`);
            }
            
            const responseText = await response.text();
            if (!responseText || responseText.trim() === '') {
                throw new Error('이미지 API에서 빈 응답을 받았습니다');
            }
            
            try {
                const result = JSON.parse(responseText);
                return result;
            } catch (parseError) {
                console.error('이미지 JSON 파싱 실패:', parseError);
                return null;
            }
        } catch (error) {
            console.error('이미지 생성 실패:', error);
            return null;
        }
    }
    
    // 블로그와 이미지 함께 생성
    async generateBlogWithImages() {
        try {
            // 기본 블로그 생성
            await this.generateBlog();
            
            // 이미지 생성 (병렬 처리)
            const topic = document.getElementById('topic').value;
            const content = window.currentBlogContent;
            
            if (topic && content) {
                console.log('🎯 블로그 내용 기반 이미지 생성 시작');
                console.log('📝 블로그 내용 일부:', content.substring(0, 200) + '...');
                
                const imagePromise = this.generateBlogImage(topic, content, 'thumbnail');
                const multiImagePromise = this.generateMultipleImages(topic);
                
                const [thumbnailResult, multiImageResult] = await Promise.all([
                    imagePromise,
                    multiImagePromise
                ]);
                
                this.displayGeneratedImages(thumbnailResult, multiImageResult);
            }
        } catch (error) {
            console.error('블로그+이미지 생성 실패:', error);
        }
    }
    
    // 다중 이미지 생성 (타임아웃 및 재시도 로직 적용)
    async generateMultipleImages(topic, retryCount = 0) {
        const maxRetries = 2;
        const timeout = 45000; // 45초 타임아웃
        
        try {
            console.log(`🖼️ 다중 이미지 생성 시작: ${topic} (시도 ${retryCount + 1}/${maxRetries + 1})`);
            
            const content = window.currentBlogContent || '';
            console.log('📝 블로그 내용 길이:', content.length);
            
            // 타임아웃 설정
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            const response = await fetch('/api/generate-blog-images', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    topic, 
                    content: content,
                    imageCount: 2, // 성능을 위해 2개로 제한
                    sections: [`${topic} 개요`, `${topic} 활용법`]
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API 오류 (${response.status}): ${errorText}`);
            }
            
            const responseText = await response.text();
            if (!responseText || responseText.trim() === '') {
                throw new Error('빈 응답을 받았습니다');
            }
            
            const result = JSON.parse(responseText);
            
            // 성공 결과 검증
            if (!result.success && result.error) {
                throw new Error(result.error);
            }
            
            console.log('🎨 다중 이미지 생성 성공:', result);
            return result;
            
        } catch (error) {
            console.error(`다중 이미지 생성 실패 (${retryCount + 1}/${maxRetries + 1}):`, error);
            
            // 재시도 로직
            if (retryCount < maxRetries && !error.name?.includes('AbortError')) {
                console.log(`🔄 ${2 + retryCount * 2}초 후 재시도...`);
                await new Promise(resolve => setTimeout(resolve, (2 + retryCount * 2) * 1000));
                return this.generateMultipleImages(topic, retryCount + 1);
            }
            
            // 최종 실패 시 폴백 처리
            return {
                success: false,
                error: error.message,
                images: [],
                fallback: true
            };
        }
    }
    
    // 🎨 생성된 이미지들 표시 (개선된 UI)
    displayGeneratedImages(thumbnailResult, multiImageResult) {
        const imagesContainer = document.getElementById('generatedImages');
        if (!imagesContainer) return;
        
        console.log('🖼️ 이미지 표시 시작');
        console.log('📌 썸네일 결과:', thumbnailResult);
        console.log('🎨 다중 이미지 결과:', multiImageResult);
        
        let imagesHtml = `
            <div class="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                <h3 class="text-2xl font-bold text-gray-800 mb-6 text-center">
                    🎨 AI가 생성한 콘텐츠 맞춤 이미지
                </h3>
                
                <!-- 콘텐츠 연관성 설명 -->
                <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                    <div class="flex items-center">
                        <i class="fas fa-lightbulb text-blue-500 mr-2"></i>
                        <p class="text-blue-700 text-sm">
                            <strong>실제 블로그 내용을 분석</strong>하여 관련 키워드를 추출하고, 
                            <strong>FAL AI nano-banana</strong>로 맞춤형 이미지를 생성했습니다!
                        </p>
                    </div>
                </div>
        `;
        
        // 썸네일 이미지 (메인 대표 이미지)
        if (thumbnailResult?.success && thumbnailResult.image?.url) {
            imagesHtml += `
                <div class="mb-8">
                    <h4 class="text-lg font-semibold mb-3 flex items-center">
                        <span class="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm mr-3">1</span>
                        📌 대표 썸네일 이미지
                    </h4>
                    <div class="bg-white rounded-lg p-4 shadow-md">
                        <img src="${thumbnailResult.image.url}" 
                             alt="블로그 대표 이미지" 
                             class="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
                             onload="console.log('✅ 썸네일 이미지 로드 성공')"
                             onerror="console.error('❌ 썸네일 이미지 로드 실패')">
                        <div class="mt-3 text-center">
                            <span class="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                <i class="fas fa-tag mr-1"></i>
                                ${thumbnailResult.image.type || 'thumbnail'}
                            </span>
                            ${thumbnailResult.image.prompt ? `
                                <p class="text-xs text-gray-500 mt-2">프롬프트: ${thumbnailResult.image.prompt.substring(0, 100)}...</p>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }
        
        // 다중 콘텐츠 이미지들
        if (multiImageResult?.success && multiImageResult.images && multiImageResult.images.length > 0) {
            imagesHtml += `
                <div class="mb-6">
                    <h4 class="text-lg font-semibold mb-3 flex items-center">
                        <span class="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm mr-3">2</span>
                        🖼️ 섹션별 콘텐츠 이미지 (${multiImageResult.images.length}개)
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-${Math.min(multiImageResult.images.length, 3)} gap-6">
                        ${multiImageResult.images.map((img, index) => `
                            <div class="bg-white rounded-lg p-4 shadow-md transform hover:scale-105 transition-transform duration-200">
                                <img src="${img.url}" 
                                     alt="${img.topic}" 
                                     class="w-full h-48 object-cover rounded-lg mb-3"
                                     onload="console.log('✅ 이미지 ${index + 1} 로드 성공: ${img.topic}')"
                                     onerror="console.error('❌ 이미지 ${index + 1} 로드 실패: ${img.topic}')">
                                <h5 class="font-semibold text-gray-800 mb-2">${img.topic}</h5>
                                <div class="flex flex-wrap gap-1 mb-2">
                                    <span class="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                                        <i class="fas fa-palette mr-1"></i>
                                        ${img.type || 'auto'}
                                    </span>
                                    ${img.note ? `
                                        <span class="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                            ${img.note}
                                        </span>
                                    ` : ''}
                                </div>
                                ${img.prompt ? `
                                    <p class="text-xs text-gray-500">키워드 반영: ${img.prompt.includes('Visual representation of key concepts') ? '✅' : '❌'}</p>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        // 이미지 생성 통계
        const totalImages = (thumbnailResult?.success ? 1 : 0) + (multiImageResult?.images?.length || 0);
        const realImages = multiImageResult?.images?.filter(img => img.type !== 'error')?.length || 0;
        
        imagesHtml += `
                <div class="bg-white rounded-lg p-4 mt-6">
                    <div class="text-center">
                        <div class="flex justify-center items-center space-x-6 text-sm">
                            <div class="flex items-center">
                                <i class="fas fa-images text-blue-500 mr-2"></i>
                                <span>총 ${totalImages}개 이미지 생성</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-robot text-green-500 mr-2"></i>
                                <span>FAL AI nano-banana 사용</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-check-circle text-purple-500 mr-2"></i>
                                <span>콘텐츠 연관성 최적화</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        imagesContainer.innerHTML = imagesHtml;
        
        // 🎯 이미지 생성 완료 알림
        console.log(`🎉 이미지 표시 완료! 총 ${totalImages}개 이미지`);
        
        // 이미지 섹션으로 스크롤
        setTimeout(() => {
            imagesContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
    }
    
    // ==================== UI/UX 개선 기능들 ====================
    
    // 로딩 오버레이 표시
    showLoadingOverlay(message) {
        const overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        overlay.innerHTML = `
            <div class="bg-white rounded-lg p-8 max-w-md w-mx-4 text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <h3 class="text-lg font-semibold mb-2">처리 중...</h3>
                <p id="loadingMessage" class="text-gray-600 text-sm">${message}</p>
                <div class="mt-4">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div id="loadingProgress" class="bg-blue-600 h-2 rounded-full transition-all duration-500" style="width: 10%"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        return overlay;
    }
    
    // 로딩 메시지 업데이트
    updateLoadingMessage(overlay, message, progress = null) {
        const messageEl = overlay.querySelector('#loadingMessage');
        if (messageEl) messageEl.textContent = message;
        
        if (progress !== null) {
            const progressBar = overlay.querySelector('#loadingProgress');
            if (progressBar) progressBar.style.width = progress + '%';
        }
    }
    
    // 로딩 오버레이 숨기기
    hideLoadingOverlay(overlay) {
        if (overlay && overlay.parentNode) {
            overlay.remove();
        }
    }
    
    // 성공 메시지 표시
    showSuccessMessage(message) {
        this.showToast(message, 'success');
    }
    
    // 에러 메시지 표시
    showErrorMessage(message, error = null) {
        console.error('UI Error:', error);
        this.showToast(message, 'error');
    }
    
    // 토스트 알림
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300`;
        
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            info: 'bg-blue-500 text-white',
            warning: 'bg-yellow-500 text-black'
        };
        
        toast.className += ' ' + (colors[type] || colors.info);
        
        const icons = {
            success: '✅',
            error: '❌', 
            info: 'ℹ️',
            warning: '⚠️'
        };
        
        toast.innerHTML = `
            <div class="flex items-center">
                <span class="mr-2">${icons[type] || icons.info}</span>
                <span>${message}</span>
                <button onclick="this.parentNode.parentNode.remove()" class="ml-4 text-lg opacity-70 hover:opacity-100">&times;</button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // 애니메이션 실행
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);
        
        // 자동 제거
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }
}

// 📋 전역 함수들 (HTML에서 직접 호출)
function copyToClipboard() {
    if (window.currentBlogContent) {
        navigator.clipboard.writeText(window.currentBlogContent).then(() => {
            alert('✅ 블로그 내용이 클립보드에 복사되었습니다!');
        }).catch(err => {
            console.error('복사 실패:', err);
            alert('❌ 복사에 실패했습니다. 브라우저가 클립보드 접근을 지원하지 않습니다.');
        });
    } else {
        alert('⚠️ 복사할 내용이 없습니다.');
    }
}

function downloadAsFile() {
    if (window.currentBlogContent && window.currentBlogTitle) {
        const blob = new Blob([window.currentBlogContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${window.currentBlogTitle}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('✅ 파일이 다운로드되었습니다!');
    } else {
        alert('⚠️ 다운로드할 내용이 없습니다.');
    }
}

// 🇰🇷 트렌드 주제 선택 (전역 함수)
function selectTrendTopic(topic) {
    const topicInput = document.getElementById('topic');
    if (topicInput) {
        topicInput.value = topic;
        document.getElementById('nextToStep2').disabled = false;
        
        // UI 인스턴스가 있으면 다음 단계로
        if (window.simpleUI) {
            window.simpleUI.nextStep();
        }
    }
}

// 🖼️ 이미지와 함께 블로그 생성 (전역 함수)
function generateWithImages() {
    if (window.simpleUI) {
        window.simpleUI.generateBlogWithImages();
    }
}

// 🔄 트렌드 새로고침 (전역 함수)
function refreshTrends() {
    if (window.simpleUI) {
        window.simpleUI.loadKoreanTrends();
    }
}

// 📊 트렌드 분석 요청 (전역 함수)
async function analyzeTrend(keyword) {
    try {
        const response = await fetch('/api/trend-analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keyword, period: '7d' })
        });
        
        if (!response.ok) {
            throw new Error(`트렌드 분석 API 오류: ${response.status}`);
        }
        
        const responseText = await response.text();
        if (!responseText || responseText.trim() === '') {
            throw new Error('트렌드 분석에서 빈 응답을 받았습니다');
        }
        
        let analysis;
        try {
            analysis = JSON.parse(responseText);
        } catch (parseError) {
            console.error('트렌드 분석 JSON 파싱 실패:', parseError);
            throw new Error('트렌드 분석 결과를 해석할 수 없습니다');
        }
        
        displayTrendAnalysis(analysis);
    } catch (error) {
        console.error('트렌드 분석 실패:', error);
        alert(`트렌드 분석에 실패했습니다: ${error.message}`);
    }
}

// 트렌드 분석 결과 표시
function displayTrendAnalysis(analysis) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 class="text-lg font-bold mb-4">📊 ${analysis.keyword} 트렌드 분석</h3>
            <div class="space-y-3">
                <div>
                    <strong>📈 트렌드 방향:</strong> 
                    <span class="px-2 py-1 rounded text-sm ${analysis.trend.direction === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${analysis.trend.direction === 'up' ? '상승' : '하락'} ${analysis.trend.change_percentage}%
                    </span>
                </div>
                <div><strong>📊 현재 검색량:</strong> ${analysis.trend.current_volume.toLocaleString()}</div>
                <div><strong>🎯 주 사용층:</strong> ${Object.entries(analysis.demographics.age_groups).map(([age, pct]) => `${age}: ${pct}%`).join(', ')}</div>
                <div>
                    <strong>💡 추천 주제:</strong>
                    <ul class="mt-2 space-y-1">
                        ${analysis.content_suggestions.slice(0, 3).map(suggestion => `
                            <li class="text-sm text-gray-600">• ${suggestion}</li>
                        `).join('')}
                    </ul>
                </div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                닫기
            </button>
        </div>
    `;
    document.body.appendChild(modal);
}

// v4.1.2 완전 자체 포함 초기화 함수
function initializeSimpleUI() {
    console.log('🚀 v4.2.0 SimpleUI 초기화 시작 - 동적 로드 완료!');
    try {
        window.simpleUI = new SimpleUI();
        console.log('✅ v4.2.0 SimpleUI 초기화 완료 - 동적 로드!');
        
        // 폼 요소 확인
        const form = document.getElementById('blogForm');
        if (form) {
            console.log('✅ blogForm 요소 발견');
        } else {
            console.warn('⚠️ blogForm 요소를 찾을 수 없습니다');
        }
        
        // 한국 트렌드 데이터 자동 로딩 (지연 실행)
        setTimeout(() => {
            if (window.simpleUI && typeof window.simpleUI.loadKoreanTrends === 'function') {
                window.simpleUI.loadKoreanTrends();
                console.log('🇰🇷 v4.1.2 한국 트렌드 데이터 로딩 시작');
            }
        }, 1000);
        
    } catch (error) {
        console.error('❌ v4.1.2 SimpleUI 초기화 실패:', error);
    }
}

// SimpleUI 클래스를 전역에 노출
window.SimpleUI = SimpleUI;

// DOM이 로드되면 즉시 실행
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSimpleUI);
} else {
    // DOM이 이미 로드된 경우 즉시 실행
    initializeSimpleUI();
}