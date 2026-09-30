const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('https://www.trappedintoarchitecture.com/companies', { waitUntil: 'networkidle2' });
  const companies = await page.$$eval('a[href^="/companies/"]', links => links.length);
  console.log("Live Companies Count:", companies);
  await browser.close();
})();