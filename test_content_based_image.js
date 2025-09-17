// 블로그 내용 기반 이미지 생성 테스트
const sampleBlogContent = `
# 2026년 AI 전망직종: 인공지능 시대의 새로운 기회

인공지능 기술의 급속한 발전으로 2026년까지 새로운 직종들이 등장할 것으로 예상됩니다. 

## 주요 AI 관련 직종들

### 1. AI 트레이너 (AI Trainer)
머신러닝 모델을 교육하고 데이터셋을 관리하는 전문가입니다. 
- 데이터 전처리 및 라벨링
- 모델 성능 최적화
- 학습 파이프라인 구축

### 2. AI 윤리 전문가 (AI Ethics Specialist)
인공지능의 윤리적 사용을 감독하고 가이드라인을 제정합니다.
- 알고리즘 편향성 검토
- 개인정보보호 정책 수립
- 투명성 및 설명가능성 확보

### 3. 휴먼-AI 인터랙션 디자이너
사용자와 AI 시스템 간의 자연스러운 상호작용을 설계합니다.
- 대화형 인터페이스 설계
- 음성인식 UX 최적화
- 감정 인식 시스템 개발

### 4. AI 오퍼레이션 매니저
AI 시스템의 운영과 모니터링을 총괄합니다.
- 모델 성능 모니터링
- 자동화된 배포 파이프라인
- 장애 대응 및 복구

## 필요한 핵심 스킬

### 기술적 역량
- Python, TensorFlow, PyTorch
- 클라우드 플랫폼 (AWS, GCP, Azure)
- 데이터베이스 및 빅데이터 처리
- MLOps 및 DevOps

### 비기술적 역량  
- 문제해결 능력
- 커뮤니케이션 스킬
- 비즈니스 이해도
- 창의적 사고

## 전망 및 준비방법

2026년까지 AI 관련 직종은 30% 이상 증가할 것으로 예상됩니다. 
지금부터 관련 교육과 경험을 쌓는다면 미래의 좋은 기회를 잡을 수 있을 것입니다.

온라인 강의, 실습 프로젝트, 오픈소스 기여 등을 통해 실력을 키워보세요.
`

async function testContentBasedImageGeneration() {
  try {
    console.log('🧪 블로그 내용 기반 이미지 생성 테스트 시작...')
    
    const response = await fetch('http://localhost:3000/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: '2026년 AI 전망직종',
        content: sampleBlogContent,
        imageType: 'thumbnail'
      })
    })
    
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`)
    }
    
    const result = await response.json()
    
    console.log('✅ 이미지 생성 결과:')
    console.log('- 성공:', result.success)
    console.log('- 타입:', result.image?.type)
    console.log('- 프롬프트 일부:', result.image?.prompt?.substring(0, 150) + '...')
    
    return result
  } catch (error) {
    console.error('❌ 테스트 실패:', error)
  }
}

// Node.js에서 실행
if (typeof require !== 'undefined') {
  const fetch = require('node-fetch')
  testContentBasedImageGeneration()
}