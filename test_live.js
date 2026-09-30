const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('LIVE PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('LIVE PAGE ERROR:', err.toString()));
    
    // Set localStorage for live site
    await page.goto('https://www.trappedintoarchitecture.com', { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      localStorage.setItem("currentUser", JSON.stringify({ id: "test", role: "superadmin" }));
    });
    
    console.log("Navigating to live companies page...");
    await page.goto('https://www.trappedintoarchitecture.com/admin/companies', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 3000));
    
    const text = await page.evaluate(() => document.body.innerText);
    console.log("PAGE TEXT EXTRACT:", text.substring(0, 200));
    
    await browser.close();
  } catch(e) {
    console.error("SCRIPT ERROR:", e);
  }
})();