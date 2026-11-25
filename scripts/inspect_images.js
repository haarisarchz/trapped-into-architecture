const puppeteer = require('C:/Users/ASUS/new_website_work/node_modules/puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
  });
  const page = await browser.newPage();
  
  const posterBase64 = fs.readFileSync('C:/Users/ASUS/.gemini/antigravity/brain/8ed394e0-e13f-4238-921f-e7efe957e8f2/.user_uploaded/media_1795106088079_03911596.jpg').toString('base64');
  const uploadedLogoBase64 = fs.readFileSync('C:/Users/ASUS/.gemini/antigravity/brain/8ed394e0-e13f-4238-921f-e7efe957e8f2/.user_uploaded/media_1795106115121_e96d3d89.png').toString('base64');
  const repoLogoBase64 = fs.readFileSync('C:/Users/ASUS/new_website_work/public/logo.png').toString('base64');

  await page.setContent(`
    <img id="poster" src="data:image/jpeg;base64,${posterBase64}" />
    <img id="uploadedLogo" src="data:image/png;base64,${uploadedLogoBase64}" />
    <img id="repoLogo" src="data:image/png;base64,${repoLogoBase64}" />
  `);

  const dims = await page.evaluate(() => {
    return {
      poster: {
        width: document.getElementById('poster').naturalWidth,
        height: document.getElementById('poster').naturalHeight
      },
      uploadedLogo: {
        width: document.getElementById('uploadedLogo').naturalWidth,
        height: document.getElementById('uploadedLogo').naturalHeight
      },
      repoLogo: {
        width: document.getElementById('repoLogo').naturalWidth,
        height: document.getElementById('repoLogo').naturalHeight
      }
    };
  });

  console.log(JSON.stringify(dims, null, 2));
  await browser.close();
})();
