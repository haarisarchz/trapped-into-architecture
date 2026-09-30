const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      localStorage.setItem("currentUser", JSON.stringify({ id: "test", role: "superadmin" }));
    });
    
    await page.goto('http://localhost:3000/admin/companies', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));
    
    await page.screenshot({ path: 'companies_page.png' });
    
    await browser.close();
  } catch(e) {
    console.error("SCRIPT ERROR:", e);
  }
})();