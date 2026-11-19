const puppeteer = require('C:/Users/ASUS/new_website_work/node_modules/puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 576, height: 1024 });
  
  const posterBase64 = fs.readFileSync('C:/Users/ASUS/.gemini/antigravity/brain/8ed394e0-e13f-4238-921f-e7efe957e8f2/.user_uploaded/media_1795106088079_03911596.jpg').toString('base64');
  const iconBase64 = fs.readFileSync('C:/Users/ASUS/new_website_work/public/icon.png').toString('base64');

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <body>
      <canvas id="c" width="576" height="1024"></canvas>
      <script>
        const canvas = document.getElementById('c');
        const ctx = canvas.getContext('2d');

        function loadImage(src) {
          return new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = src;
          });
        }

        async function process() {
          const poster = await loadImage('data:image/jpeg;base64,${posterBase64}');
          const icon = await loadImage('data:image/png;base64,${iconBase64}');

          // 1. Draw original poster
          ctx.drawImage(poster, 0, 0);

          // 2. Intelligent inpainting of the old logo in box [x: 130 to 446, y: 10 to 125]
          const imgData = ctx.getImageData(0, 0, 576, 1024);
          const d = imgData.data;

          // Mask: true for pixels that belong to old logo
          const isLogo = (x, y) => {
            if (x < 140 || x > 436 || y < 10 || y > 125) return false;
            const idx = (y * 576 + x) * 4;
            const r = d[idx], g = d[idx+1], b = d[idx+2];
            // Dark navy text/buildings or orange '2'
            const isDark = (r < 195 && g < 195 && b < 210);
            const isOrange = (r > 190 && g < 155 && b < 80);
            return isDark || isOrange;
          };

          // Step A: Mark logo pixels and dilate mask slightly (1px) so edges are cleanly removed
          const mask = new Uint8Array(576 * 1024);
          for (let y = 10; y <= 125; y++) {
            for (let x = 140; x <= 436; x++) {
              if (isLogo(x, y)) {
                mask[y * 576 + x] = 1;
              }
            }
          }

          // Dilate mask by 1px
          const dilatedMask = new Uint8Array(576 * 1024);
          for (let y = 10; y <= 125; y++) {
            for (let x = 140; x <= 436; x++) {
              if (mask[y * 576 + x]) {
                for (let dy = -1; dy <= 1; dy++) {
                  for (let dx = -1; dx <= 1; dx++) {
                    dilatedMask[(y + dy) * 576 + (x + dx)] = 1;
                  }
                }
              }
            }
          }

          // Step B: Vertical & Horizontal interpolation from clean surrounding sky
          for (let y = 10; y <= 125; y++) {
            for (let x = 140; x <= 436; x++) {
              if (dilatedMask[y * 576 + x]) {
                // Find clean pixel above
                let topY = y;
                while (topY > 5 && dilatedMask[topY * 576 + x]) topY--;
                
                // Find clean pixel below
                let botY = y;
                while (botY < 135 && dilatedMask[botY * 576 + x]) botY++;

                // Interpolate vertically
                const idx = (y * 576 + x) * 4;
                const topIdx = (topY * 576 + x) * 4;
                const botIdx = (botY * 576 + x) * 4;

                const distTotal = (botY - topY) || 1;
                const wBot = (y - topY) / distTotal;
                const wTop = 1 - wBot;

                d[idx]   = Math.round(d[topIdx] * wTop + d[botIdx] * wBot);
                d[idx+1] = Math.round(d[topIdx+1] * wTop + d[botIdx+1] * wBot);
                d[idx+2] = Math.round(d[topIdx+2] * wTop + d[botIdx+2] * wBot);
                d[idx+3] = 255;
              }
            }
          }

          ctx.putImageData(imgData, 0, 0);

          // 3. Now the sky background is 100% natural and seamless!
          // Next, prepare the official logo with clean transparency
          const iconCanvas = document.createElement('canvas');
          iconCanvas.width = icon.width;
          iconCanvas.height = icon.height;
          const iCtx = iconCanvas.getContext('2d');
          iCtx.drawImage(icon, 0, 0);

          const iData = iCtx.getImageData(0, 0, icon.width, icon.height);
          const id = iData.data;
          for (let i = 0; i < id.length; i += 4) {
            const r = id[i], g = id[i+1], b = id[i+2];
            const diff = Math.min(255 - r, 255 - g, 255 - b);
            if (diff < 8) {
              id[i+3] = 0;
            } else if (diff < 30) {
              id[i+3] = Math.floor((diff / 30) * 255);
            }
          }
          iCtx.putImageData(iData, 0, 0);

          // 4. Draw the official brand logo
          // In 576 width: logo width around 165px
          const targetW = 160;
          const targetH = 160;
          const targetX = (576 - targetW) / 2;
          const targetY = -8; // perfectly vertically balanced with the divider lines
          ctx.drawImage(iconCanvas, targetX, targetY, targetW, targetH);

          // 5. Clean up divider lines to touch neatly
          ctx.strokeStyle = '#a4abb8';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(35, 68);
          ctx.lineTo(190, 68);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(386, 68);
          ctx.lineTo(541, 68);
          ctx.stroke();

          window.rendered = true;
        }

        process();
      </script>
    </body>
    </html>
  `);

  await page.waitForFunction('window.rendered === true');
  await new Promise(r => setTimeout(r, 600));

  const outPath = 'C:/Users/ASUS/.gemini/antigravity/brain/8ed394e0-e13f-4238-921f-e7efe957e8f2/tia_whatsapp_status_seamless.png';
  await page.screenshot({ path: outPath, type: 'png' });
  console.log('Saved seamless composite to:', outPath);

  await browser.close();
})();
