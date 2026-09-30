const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  const result = await page.evaluate(async () => {
    // Just fetch a single job using the public API or something, to see all fields
    const res = await fetch('/api/extract-job', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: "test" })
    }).catch(()=>null);
    return null;
  });
  
  await browser.close();
})();