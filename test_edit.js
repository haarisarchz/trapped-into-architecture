const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      localStorage.setItem("currentUser", JSON.stringify({ id: "test", role: "superadmin" }));
    });
    
    // Go to edit page with parameters
    const url = 'http://localhost:3000/admin/companies/edit/new?name=Tattvam&city=Thane&state=Maharashtra';
    console.log("Navigating to", url);
    await page.goto(url, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));
    
    await page.screenshot({ path: 'edit_page.png' });
    
    await browser.close();
  } catch(e) {
    console.error("SCRIPT ERROR:", e);
  }
})();