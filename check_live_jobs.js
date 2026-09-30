const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('https://www.trappedintoarchitecture.com/jobs', { waitUntil: 'networkidle2' });
  const jobCards = await page.$$eval('a[href^="/jobs/"]', links => links.length);
  console.log("Job Cards count:", jobCards);
  await browser.close();
})();