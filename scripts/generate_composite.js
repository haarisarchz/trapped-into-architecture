const puppeteer = require('C:/Users/ASUS/new_website_work/node_modules/puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
  });
  const page = await browser.newPage();
  
  // Set viewport to 1080x1920 for ultra crisp full HD mobile status!
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  
  const posterBase64 = fs.readFileSync('C:/Users/ASUS/.gemini/antigravity/brain/8ed394e0-e13f-4238-921f-e7efe957e8f2/.user_uploaded/media_1795106088079_03911596.jpg').toString('base64');
  const uploadedLogoBase64 = fs.readFileSync('C:/Users/ASUS/.gemini/antigravity/brain/8ed394e0-e13f-4238-921f-e7efe957e8f2/.user_uploaded/media_1795106115121_e96d3d89.png').toString('base64');
  const iconBase64 = fs.readFileSync('C:/Users/ASUS/new_website_work/public/icon.png').toString('base64');

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body, html { margin: 0; padding: 0; overflow: hidden; background: #000; }
        canvas { display: block; width: 1080px; height: 1920px; }
      </style>
    </head>
    <body>
      <canvas id="c" width="1080" height="1920"></canvas>
      <script>
        const canvas = document.getElementById('c');
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        function loadImage(src) {
          return new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = src;
          });
        }

        async function render() {
          const poster = await loadImage('data:image/jpeg;base64,${posterBase64}');
          const logo = await loadImage('data:image/png;base64,${uploadedLogoBase64}');
          const icon = await loadImage('data:image/png;base64,${iconBase64}');

          // 1. Draw base poster scaled to 1080x1920 (original is 576x1024, scale factor = 1.875)
          const scale = 1080 / 576;
          ctx.drawImage(poster, 0, 0, 1080, 1920);

          // 2. Sample background color around the top logo to create seamless clean patch
          // Original bounds: y: 15 to 135 in 576x1024 -> in 1080x1920: y: 28 to 253
          // The horizontal divider line is at y: ~70 (in 576x1024) -> ~131 (in 1080x1920)
          // Let's create a temporary canvas to process the logo with transparency
          const logoCanvas = document.createElement('canvas');
          logoCanvas.width = logo.width;
          logoCanvas.height = logo.height;
          const lCtx = logoCanvas.getContext('2d');
          lCtx.drawImage(logo, 0, 0);
          
          const imgData = lCtx.getImageData(0, 0, logo.width, logo.height);
          const data = imgData.data;
          // Make white background transparent
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i+1], b = data[i+2];
            // If near white
            if (r > 240 && g > 240 && b > 240) {
              data[i+3] = 0;
            } else if (r > 220 && g > 220 && b > 220) {
              // Smooth feathering
              const avg = (r + g + b) / 3;
              data[i+3] = Math.max(0, Math.min(255, (255 - avg) * 7));
            }
          }
          lCtx.putImageData(imgData, 0, 0);

          // 3. Cover the old generic logo at the top
          // We patch from x: 260 to 820, y: 18 to 240
          // Sample gradient from surrounding sky
          const grad = ctx.createLinearGradient(0, 15, 0, 255);
          grad.addColorStop(0, '#EAE8ED');
          grad.addColorStop(0.5, '#ECEBF0');
          grad.addColorStop(1, '#EAE7EC');

          ctx.fillStyle = grad;
          // Soft rounded or subtle blended rect
          ctx.beginPath();
          ctx.roundRect(260, 20, 560, 225, 20);
          ctx.fill();

          // Also sample horizontal line color and restore the elegant line dividers on left and right
          ctx.strokeStyle = '#B8BAC4';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(80, 138);
          ctx.lineTo(310, 138);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(770, 138);
          ctx.lineTo(1000, 138);
          ctx.stroke();

          // 4. Draw the official brand logo in the center
          // Desired width around 360px, maintaining aspect ratio (150:112 -> 360 x 268)
          const targetW = 320;
          const targetH = (logo.height / logo.width) * targetW;
          const targetX = (1080 - targetW) / 2;
          const targetY = 26; // perfectly centered in the top header

          ctx.drawImage(logoCanvas, targetX, targetY, targetW, targetH);

          // 5. Also check the helmet at bottom left (around x: 70-220, y: 1400-1550)
          // The helmet has a tiny generic logo. Let's patch it with clean white helmet color
          // and stamp the miniature 3D icon on it!
          window.rendered = true;
        }

        render();
      </script>
    </body>
    </html>
  `);

  await page.waitForFunction('window.rendered === true');
  await new Promise(r => setTimeout(r, 1000));

  const outDir = 'C:/Users/ASUS/.gemini/antigravity/brain/8ed394e0-e13f-4238-921f-e7efe957e8f2';
  const outPath = path.join(outDir, 'tia_whatsapp_status_poster_v1.png');
  await page.screenshot({ path: outPath, type: 'png' });
  console.log('Saved composite to:', outPath);

  await browser.close();
})();
