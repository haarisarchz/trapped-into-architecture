const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
    
    // Add local storage for auth to bypass redirect
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      localStorage.setItem("currentUser", JSON.stringify({ id: "test", role: "superadmin" }));
    });
    
    await page.goto('http://localhost:3000/admin/companies', { waitUntil: 'networkidle0' });
    
    // Wait a bit to ensure client-side rendering crashes if any
    await new Promise(r => setTimeout(r, 2000));
    
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    if (bodyHTML.includes("Application error") || bodyHTML.includes("Error")) {
      console.log("HTML CONTAINS ERROR:", bodyHTML.substring(0, 500));
    }
    
    await browser.close();
  } catch(e) {
    console.error("SCRIPT ERROR:", e);
  }
})();