const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('https://www.trappedintoarchitecture.com/jobs', { waitUntil: 'networkidle2' });
  const content = await page.content();
  console.log(content.includes('No jobs found') ? 'Incognito: No jobs found' : 'Incognito: Jobs exist');
  await browser.close();
})();