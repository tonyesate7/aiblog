const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // 콘솔 로그 캡처
  page.on('console', msg => console.log('브라우저 로그:', msg.text()));
  
  await page.goto('https://5526f4f7.ai-blog-generator-v2.pages.dev');
  
  // 폼 채우기
  await page.fill('#topic', '인공지능의 미래');
  await page.selectOption('#audience', '일반인');
  await page.selectOption('#tone', '친근한');
  await page.selectOption('#aiModel', 'auto');
  
  console.log('폼 작성 완료, 생성 버튼 클릭 중...');
  
  // 생성 버튼 클릭
  await page.click('#generateBtn');
  
  // 결과 기다리기 (최대 30초)
  try {
    await page.waitForSelector('#resultSection:not(.hidden)', { timeout: 30000 });
    console.log('결과 섹션이 표시됨!');
    
    const content = await page.textContent('#content');
    console.log('생성된 콘텐츠:', content?.substring(0, 200) + '...');
    
  } catch (error) {
    console.error('결과 표시 타임아웃:', error.message);
    
    // 현재 상태 확인
    const resultHidden = await page.evaluate(() => {
      const resultSection = document.getElementById('resultSection');
      return resultSection ? resultSection.classList.contains('hidden') : 'element not found';
    });
    
    console.log('resultSection hidden 상태:', resultHidden);
  }
  
  await browser.close();
})();