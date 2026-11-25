const puppeteer = require('C:/Users/ASUS/new_website_work/node_modules/puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
  });
  const page = await browser.newPage();
  
  // Crop the top 350px of the generated poster
  await page.setViewport({ width: 1080, height: 350 });
  const b64 = fs.readFileSync('C:/Users/ASUS/.gemini/antigravity/brain/8ed394e0-e13f-4238-921f-e7efe957e8f2/tia_whatsapp_status_poster_v1.png').toString('base64');
  
  await page.setContent(`
    <style>body { margin: 0; padding: 0; background: #000; }</style>
    <img src="data:image/png;base64,${b64}" style="width: 1080px; margin-top: 0px;" />
  `);

  const previewCrop = 'C:/Users/ASUS/.gemini/antigravity/brain/8ed394e0-e13f-4238-921f-e7efe957e8f2/preview_top_crop_v1.png';
  await page.screenshot({ path: previewCrop });
  console.log('Saved top crop to:', previewCrop);

  // Also let's inspect what is inside public/icon.png
  await page.setViewport({ width: 512, height: 512 });
  const iconB64 = fs.readFileSync('C:/Users/ASUS/new_website_work/public/icon.png').toString('base64');
  await page.setContent(`
    <style>body { margin: 0; padding: 0; background: #eee; }</style>
    <img src="data:image/png;base64,${iconB64}" style="width: 512px; height: 512px;" />
  `);
  const iconCrop = 'C:/Users/ASUS/.gemini/antigravity/brain/8ed394e0-e13f-4238-921f-e7efe957e8f2/preview_icon.png';
  await page.screenshot({ path: iconCrop });
  console.log('Saved icon preview to:', iconCrop);

  await browser.close();
})();
