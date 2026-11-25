const puppeteer = require('C:/Users/ASUS/new_website_work/node_modules/puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
  });
  const page = await browser.newPage();
  const b64 = fs.readFileSync('C:/Users/ASUS/new_website_work/public/icon.png').toString('base64');
  await page.setContent(`<canvas id="c" width="512" height="512"></canvas>`);
  const info = await page.evaluate((data) => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const c = document.getElementById('c');
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const p0 = ctx.getImageData(0, 0, 1, 1).data;
        const pCenter = ctx.getImageData(256, 256, 1, 1).data;
        resolve({
          cornerAlpha: p0[3],
          cornerRGB: [p0[0], p0[1], p0[2]],
          centerRGB: [pCenter[0], pCenter[1], pCenter[2]],
          width: img.width,
          height: img.height
        });
      };
      img.src = 'data:image/png;base64,' + data;
    });
  }, b64);
  console.log('icon.png info:', info);
  await browser.close();
})();
