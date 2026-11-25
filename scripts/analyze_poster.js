const puppeteer = require('C:/Users/ASUS/new_website_work/node_modules/puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
  });
  const page = await browser.newPage();
  
  const uploadedLogoBase64 = fs.readFileSync('C:/Users/ASUS/.gemini/antigravity/brain/8ed394e0-e13f-4238-921f-e7efe957e8f2/.user_uploaded/media_1795106115121_e96d3d89.png').toString('base64');
  const repoLogoBase64 = fs.readFileSync('C:/Users/ASUS/new_website_work/public/logo.png').toString('base64');

  await page.setContent('<canvas id="canvas" width="300" height="300"></canvas>');

  const res = await page.evaluate(({ uB64, rB64 }) => {
    const testImg = (b64) => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const c = document.getElementById('canvas');
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext('2d');
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0);

        // Check corner pixel transparency
        const topLeft = ctx.getImageData(0, 0, 1, 1).data;
        const center = ctx.getImageData(Math.floor(img.width/2), Math.floor(img.height/2), 1, 1).data;

        resolve({
          width: img.width,
          height: img.height,
          topLeft: Array.from(topLeft),
          center: Array.from(center)
        });
      };
      img.src = 'data:image/png;base64,' + b64;
    });

    return Promise.all([testImg(uB64), testImg(rB64)]);
  }, { uB64: uploadedLogoBase64, rB64: repoLogoBase64 });

  console.log('Uploaded Logo:', res[0]);
  console.log('Repo Logo:', res[1]);
  await browser.close();
})();
