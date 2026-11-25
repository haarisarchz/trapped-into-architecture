const puppeteer = require('C:/Users/ASUS/new_website_work/node_modules/puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
  });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 576, height: 200 });
  const b64 = fs.readFileSync('C:/Users/ASUS/.gemini/antigravity/brain/8ed394e0-e13f-4238-921f-e7efe957e8f2/.user_uploaded/media_1795106088079_03911596.jpg').toString('base64');
  
  await page.setContent(`
    <style>body { margin: 0; padding: 0; background: #000; }</style>
    <img src="data:image/jpeg;base64,${b64}" style="width: 576px;" />
  `);

  const originalCrop = 'C:/Users/ASUS/.gemini/antigravity/brain/8ed394e0-e13f-4238-921f-e7efe957e8f2/original_top_crop.png';
  await page.screenshot({ path: originalCrop });
  console.log('Saved original top crop to:', originalCrop);

  await browser.close();
})();
