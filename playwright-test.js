const { chromium } = require('playwright');

async function testBlogGeneration() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // 모든 콘솔 로그 캡처
    page.on('console', msg => {
        const msgText = msg.text();
        if (msgText.includes('🔥🔥🔥') || msgText.includes('displayResult') || msgText.includes('DOM 요소') || msgText.includes('결과')) {
            console.log('🎯 중요한 로그:', msgText);
        }
    });
    
    console.log('페이지 로딩 중...');
    await page.goto('https://5526f4f7.ai-blog-generator-v2.pages.dev');
    
    // 페이지 로드 대기
    await page.waitForSelector('#generateBtn', { timeout: 10000 });
    console.log('페이지 로드 완료');
    
    // 폼 입력
    console.log('폼 입력 중...');
    await page.fill('#topic', '인공지능 테스트');
    await page.selectOption('#audience', '일반인');
    await page.selectOption('#tone', '친근한');
    await page.selectOption('#aiModel', 'auto');
    
    console.log('생성 버튼 클릭...');
    
    // 버튼 클릭과 동시에 로그 감시
    await Promise.all([
        page.click('#generateBtn'),
        page.waitForTimeout(30000) // 30초 대기
    ]);
    
    // 결과 확인
    const resultSectionVisible = await page.evaluate(() => {
        const resultSection = document.getElementById('resultSection');
        return resultSection && !resultSection.classList.contains('hidden');
    });
    
    console.log('결과 섹션 표시됨:', resultSectionVisible);
    
    if (resultSectionVisible) {
        const content = await page.textContent('#content');
        console.log('생성된 콘텐츠 길이:', content?.length || 0);
    }
    
    await browser.close();
}

testBlogGeneration().catch(console.error);