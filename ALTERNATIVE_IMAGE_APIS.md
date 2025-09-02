# 대안 AI 이미지 생성 API 옵션

## 1. **DALL-E 3 (OpenAI)**
```javascript
// OpenAI DALL-E 3 통합 예시
const response = await fetch('https://api.openai.com/v1/images/generations', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${openaiApiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: "dall-e-3",
    prompt: imagePrompt,
    size: "1024x1024",
    quality: "standard",
    n: 1,
  })
})
```
**장점**: 높은 품질, 텍스트 렌더링 우수
**비용**: $0.040 per image (standard), $0.080 per image (HD)

## 2. **Stable Diffusion (Stability.ai)**
```javascript
const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${stabilityApiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text_prompts: [{ text: imagePrompt }],
    cfg_scale: 7,
    height: 1024,
    width: 1024,
    steps: 30,
    samples: 1,
  })
})
```
**장점**: 저렴한 비용, 다양한 모델
**비용**: $0.002-0.01 per image

## 3. **Midjourney (비공식 API)**
```javascript
// Midjourney API 래퍼 서비스 사용 (예: midjourney-api.xyz)
const response = await fetch('https://api.midjourney-api.xyz/mj/v1/imagine', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${midjourneyApiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: imagePrompt,
    aspect_ratio: "16:9"
  })
})
```
**장점**: 예술적 품질, 창의적 결과
**비용**: $0.05-0.15 per image

## 4. **Replicate (다양한 모델)**
```javascript
const response = await fetch('https://api.replicate.com/v1/predictions', {
  method: 'POST',
  headers: {
    'Authorization': `Token ${replicateApiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    version: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
    input: {
      prompt: imagePrompt,
      width: 1024,
      height: 1024
    }
  })
})
```
**장점**: 다양한 오픈소스 모델, 유연한 설정
**비용**: 모델별 상이 ($0.002-0.05 per image)

## 추천 순서
1. **FAL.AI nano-banana** (현재) - 균형잡힌 품질과 속도
2. **Stability.ai** - 비용 효율성
3. **OpenAI DALL-E 3** - 최고 품질 필요시
4. **Replicate** - 특수 모델 필요시