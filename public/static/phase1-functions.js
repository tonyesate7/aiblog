// ==================== Phase 1 품질 향상 전용 함수들 ====================

// BlogGenerator가 로드될 때까지 대기하는 함수
function waitForBlogGenerator() {
    return new Promise((resolve) => {
        if (typeof BlogGenerator !== 'undefined') {
            resolve();
        } else {
            const checkInterval = setInterval(() => {
                if (typeof BlogGenerator !== 'undefined') {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        }
    });
}

// Phase 1 함수들을 안전하게 추가
waitForBlogGenerator().then(() => {
    console.log('🔥 Phase 1 함수들 BlogGenerator에 추가 중...');

    // Phase 1 진행률 표시 함수를 BlogGenerator 클래스에 추가
    BlogGenerator.prototype.showPhase1Progress = function() {
    const progressHtml = `
        <div id="phase1Progress" class="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <h4 class="font-bold text-blue-800 mb-4 flex items-center">
                🔥 Phase 1 품질 향상 진행 중...
                <span class="ml-2 text-sm bg-blue-100 px-2 py-1 rounded-full">실시간</span>
            </h4>
            <div class="space-y-3">
                <div class="flex items-center space-x-3" id="phase1Step1">
                    <div class="w-5 h-5 rounded-full bg-blue-500 animate-pulse flex items-center justify-center">
                        <i class="fas fa-heart text-white text-xs"></i>
                    </div>
                    <div class="flex-1">
                        <span class="text-sm font-medium text-gray-800">감정적 훅 적용</span>
                        <div class="text-xs text-gray-500">독자의 관심을 끄는 도입부 생성 중...</div>
                    </div>
                    <div class="text-xs text-blue-600 font-medium">진행 중</div>
                </div>
                
                <div class="flex items-center space-x-3" id="phase1Step2">
                    <div class="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center">
                        <i class="fas fa-tasks text-gray-500 text-xs"></i>
                    </div>
                    <div class="flex-1">
                        <span class="text-sm text-gray-500">실용성 강화</span>
                        <div class="text-xs text-gray-400">즉시 실행 가능한 액션 아이템 추가 대기 중...</div>
                    </div>
                    <div class="text-xs text-gray-400">대기 중</div>
                </div>
                
                <div class="flex items-center space-x-3" id="phase1Step3">
                    <div class="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center">
                        <i class="fas fa-check-circle text-gray-500 text-xs"></i>
                    </div>
                    <div class="flex-1">
                        <span class="text-sm text-gray-500">출처 검증</span>
                        <div class="text-xs text-gray-400">신뢰할만한 출처 및 데이터 추가 대기 중...</div>
                    </div>
                    <div class="text-xs text-gray-400">대기 중</div>
                </div>
                
                <div class="flex items-center space-x-3" id="phase1Step4">
                    <div class="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center">
                        <i class="fas fa-text-height text-gray-500 text-xs"></i>
                    </div>
                    <div class="flex-1">
                        <span class="text-sm text-gray-500">문장 최적화</span>
                        <div class="text-xs text-gray-400">읽기 편한 문장 길이로 조정 대기 중...</div>
                    </div>
                    <div class="text-xs text-gray-400">대기 중</div>
                </div>
            </div>
            
            <div class="mt-4 pt-4 border-t border-blue-200">
                <div class="flex items-center justify-between text-xs">
                    <span class="text-gray-600">
                        <i class="fas fa-clock mr-1"></i>
                        예상 시간: 30-45초
                    </span>
                    <span class="text-blue-600 font-medium">
                        품질 향상률: +20-40%
                    </span>
                </div>
            </div>
        </div>
    `
    
    if (this.contentDiv) {
        this.contentDiv.innerHTML = progressHtml
        
        // 단계별 애니메이션 시뮬레이션
        this.simulatePhase1Progress()
    }
}

// Phase 1 진행 시뮬레이션
BlogGenerator.prototype.simulatePhase1Progress = function() {
    const steps = [
        { id: 'phase1Step1', delay: 2000, name: '감정적 훅' },
        { id: 'phase1Step2', delay: 5000, name: '실용성 강화' },
        { id: 'phase1Step3', delay: 8000, name: '출처 검증' },
        { id: 'phase1Step4', delay: 12000, name: '문장 최적화' }
    ]
    
    steps.forEach((step, index) => {
        setTimeout(() => {
            const stepElement = document.getElementById(step.id)
            if (stepElement) {
                // 이전 단계 완료 처리
                if (index > 0) {
                    const prevStep = document.getElementById(steps[index-1].id)
                    if (prevStep) {
                        const prevCircle = prevStep.querySelector('.w-5')
                        const prevStatus = prevStep.querySelector('.text-xs:last-child')
                        
                        prevCircle.className = 'w-5 h-5 rounded-full bg-green-500 flex items-center justify-center'
                        prevCircle.innerHTML = '<i class="fas fa-check text-white text-xs"></i>'
                        prevStatus.textContent = '완료'
                        prevStatus.className = 'text-xs text-green-600 font-medium'
                    }
                }
                
                // 현재 단계 진행 중으로 변경
                const circle = stepElement.querySelector('.w-5')
                const status = stepElement.querySelector('.text-xs:last-child')
                const title = stepElement.querySelector('.text-sm')
                const desc = stepElement.querySelector('.text-xs.text-gray-400')
                
                circle.className = 'w-5 h-5 rounded-full bg-blue-500 animate-pulse flex items-center justify-center'
                title.className = 'text-sm font-medium text-gray-800'
                desc.className = 'text-xs text-gray-600'
                desc.textContent = `${step.name} 적용 중...`
                status.textContent = '진행 중'
                status.className = 'text-xs text-blue-600 font-medium'
            }
        }, step.delay)
    })
    
    // 마지막 단계도 완료 처리
    setTimeout(() => {
        const lastStep = document.getElementById('phase1Step4')
        if (lastStep) {
            const circle = lastStep.querySelector('.w-5')
            const status = lastStep.querySelector('.text-xs:last-child')
            
            circle.className = 'w-5 h-5 rounded-full bg-green-500 flex items-center justify-center'
            circle.innerHTML = '<i class="fas fa-check text-white text-xs"></i>'
            status.textContent = '완료'
            status.className = 'text-xs text-green-600 font-medium'
        }
    }, 15000)
}

// Phase 1 품질 결과 표시
BlogGenerator.prototype.displayPhase1Results = function(phase1Results) {
    if (!phase1Results) return
    
    const { overallScore, breakdown, improvements, status } = phase1Results
    
    // 기존 진행률을 결과로 교체
    const phase1Progress = document.getElementById('phase1Progress')
    if (phase1Progress) {
        const statusColor = status === 'excellent' ? 'green' : status === 'good' ? 'blue' : 'orange'
        const statusIcon = status === 'excellent' ? 'fa-star' : status === 'good' ? 'fa-thumbs-up' : 'fa-exclamation-triangle'
        const statusText = status === 'excellent' ? '우수' : status === 'good' ? '양호' : '개선 필요'
        
        phase1Progress.innerHTML = `
            <div class="p-6 bg-gradient-to-r from-${statusColor}-50 to-${statusColor}-100 rounded-xl border border-${statusColor}-200">
                <h4 class="font-bold text-${statusColor}-800 mb-4 flex items-center">
                    <i class="fas ${statusIcon} mr-2"></i>
                    Phase 1 품질 분석 결과
                    <span class="ml-2 text-sm bg-${statusColor}-200 text-${statusColor}-800 px-2 py-1 rounded-full">${statusText}</span>
                </h4>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-${statusColor}-600">${overallScore}</div>
                        <div class="text-xs text-gray-600">종합 점수</div>
                    </div>
                    <div class="text-center">
                        <div class="text-lg font-bold text-blue-600">${breakdown.emotionalHook.score}</div>
                        <div class="text-xs text-gray-600">감정적 연결</div>
                    </div>
                    <div class="text-center">
                        <div class="text-lg font-bold text-green-600">${breakdown.practicality.score}</div>
                        <div class="text-xs text-gray-600">실용성</div>
                    </div>
                    <div class="text-center">
                        <div class="text-lg font-bold text-purple-600">${breakdown.sources.score}</div>
                        <div class="text-xs text-gray-600">신뢰성</div>
                    </div>
                </div>
                
                ${improvements.length > 0 ? `
                <div class="mt-4 p-3 bg-white bg-opacity-60 rounded-lg">
                    <h5 class="font-semibold text-gray-800 mb-2">💡 추가 개선 제안:</h5>
                    <ul class="text-sm text-gray-700 space-y-1">
                        ${improvements.map(imp => `<li>• ${imp}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                ${phase1Results.improvedScore ? `
                <div class="mt-3 p-3 bg-green-100 rounded-lg">
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-green-800 font-medium">
                            <i class="fas fa-arrow-up mr-1"></i>
                            자동 개선 완료
                        </span>
                        <span class="text-green-600">
                            ${phase1Results.improvement > 0 ? '+' : ''}${phase1Results.improvement}점 향상
                        </span>
                    </div>
                </div>
                ` : ''}
            </div>
        `
    }
}

// 기존 displayResult 함수 확장
const originalDisplayResult = BlogGenerator.prototype.displayResult
BlogGenerator.prototype.displayResult = function(result) {
    // Phase 1 결과가 있으면 먼저 표시
    if (result.phase1Results) {
        this.displayPhase1Results(result.phase1Results)
    }
    
    // 기존 결과 표시 로직 실행
    originalDisplayResult.call(this, result)
    
    // Phase 1 강화 표시 추가
    if (result.qualityEnhanced) {
        const generationInfo = document.getElementById('generationInfo')
        if (generationInfo) {
            const enhancedBadge = document.createElement('div')
            enhancedBadge.className = 'mt-2 inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm rounded-full'
            enhancedBadge.innerHTML = `
                <i class="fas fa-rocket mr-1"></i>
                Phase 1 품질 강화 적용
            `
            generationInfo.appendChild(enhancedBadge)
        }
    }
}

    console.log('✅ Phase 1 함수들이 BlogGenerator에 성공적으로 추가되었습니다!');
});