const puppeteer = require('C:/Users/ASUS/new_website_work/node_modules/puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  
  const posterBase64 = fs.readFileSync('C:/Users/ASUS/.gemini/antigravity/brain/8ed394e0-e13f-4238-921f-e7efe957e8f2/.user_uploaded/media_1795106088079_03911596.jpg').toString('base64');
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
          const icon = await loadImage('data:image/png;base64,${iconBase64}');

          // 1. Draw base poster (1080 x 1920)
          ctx.drawImage(poster, 0, 0, 1080, 1920);

          // 2. Erase old logo with seamless radial white cloud glow
          // Center of old logo is at x: 540, y: 135 (in 1080px space)
          // We create an ellipse / radial glow that dissolves seamlessly into the sky
          const glow = ctx.createRadialGradient(540, 135, 60, 540, 135, 340);
          glow.addColorStop(0, '#FFFFFF');
          glow.addColorStop(0.5, '#F7F8FA');
          glow.addColorStop(0.8, '#EEF1F6');
          glow.addColorStop(0.95, '#E2E7F0');
          glow.addColorStop(1, 'rgba(226, 231, 240, 0)');

          ctx.save();
          ctx.fillStyle = glow;
          // Fill soft ellipse
          ctx.beginPath();
          ctx.ellipse(540, 135, 340, 130, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // 3. Process the 512x512 official icon to make white background fully transparent with anti-aliasing
          const iconCanvas = document.createElement('canvas');
          iconCanvas.width = icon.width;
          iconCanvas.height = icon.height;
          const iCtx = iconCanvas.getContext('2d');
          iCtx.drawImage(icon, 0, 0);

          const imgData = iCtx.getImageData(0, 0, icon.width, icon.height);
          const d = imgData.data;
          for (let i = 0; i < d.length; i += 4) {
            const r = d[i], g = d[i+1], b = d[i+2];
            // Compute distance from pure white (255, 255, 255)
            const diff = Math.min(255 - r, 255 - g, 255 - b);
            if (diff < 10) {
              d[i+3] = 0; // completely transparent
            } else if (diff < 35) {
              // Smooth feather
              d[i+3] = Math.floor((diff / 35) * 255);
            }
          }
          iCtx.putImageData(imgData, 0, 0);

          // 4. Draw the clean, high-resolution official logo
          // The logo is 512x512. In the flyer, let's draw it prominently in the center
          const logoW = 280;
          const logoH = 280;
          const logoX = (1080 - logoW) / 2;
          const logoY = 5; // centers the 3D emblem and text right above the blue banner
          ctx.drawImage(iconCanvas, logoX, logoY, logoW, logoH);

          // 5. Restore clean divider lines on left and right
          ctx.save();
          ctx.strokeStyle = '#9AA2B5';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(80, 135);
          ctx.lineTo(360, 135);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(720, 135);
          ctx.lineTo(1000, 135);
          ctx.stroke();
          ctx.restore();

          window.rendered = true;
        }

        render();
      </script>
    </body>
    </html>
  `);

  await page.waitForFunction('window.rendered === true');
  await new Promise(r => setTimeout(r, 800));

  const outPath = 'C:/Users/ASUS/.gemini/antigravity/brain/8ed394e0-e13f-4238-921f-e7efe957e8f2/tia_whatsapp_status_v2.png';
  await page.screenshot({ path: outPath, type: 'png' });
  console.log('Saved v2 to:', outPath);

  // Also crop top to inspect
  await page.setViewport({ width: 1080, height: 400 });
  await page.setContent(`
    <style>body { margin: 0; padding: 0; background: #000; }</style>
    <img src="file:///${outPath.replace(/\\/g, '/')}" style="width: 1080px;" />
  `);
  const cropPath = 'C:/Users/ASUS/.gemini/antigravity/brain/8ed394e0-e13f-4238-921f-e7efe957e8f2/preview_top_crop_v2.png';
  await page.screenshot({ path: cropPath });
  console.log('Saved v2 crop to:', cropPath);

  await browser.close();
})();
