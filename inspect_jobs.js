const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.evaluate(async () => {
    // Run an introspection query using Supabase client if possible, or just a REST call.
    // Easiest is to fetch one job and print its keys.
    const res = await fetch('http://localhost:3000/api/extract-job', { method: 'POST', body: JSON.stringify({ url: '' }) }).catch(e=>null);
  });
  
  await browser.close();
})();