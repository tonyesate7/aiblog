// 🔥 라이브 AI 블로그 생성기 - 간단한 3단계 UI 제어
class SimpleUI {
    constructor() {
        this.currentStep = 1;
        this.formData = {};
        this.liveStatus = null;
        this.initializeEventListeners();
        this.setDefaults();
        this.checkLiveStatus();
    }
    
    initializeEventListeners() {
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
        if (generateBtn) generateBtn.addEventListener('click', () => this.generateContent());
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
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    new SimpleUI();
});