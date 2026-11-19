const fs = require('fs');
const path = require('path');
const https = require('https');

const targetFiles = [
  { slug: 'unite-dhabitation-marseille', file: "File:Unité d'habitation Marseille, France.jpg" },
  { slug: 'the-glass-house-philip-johnson', file: 'File:Philip Johnson Glass House The House.jpg' },
  { slug: 'lloyds-building-london', file: "File:London - The Lloyd's building (1).jpg" },
  { slug: 'centre-pompidou', file: 'File:Centre Pompidou, Paris May 2004 001.jpg' },
  { slug: 'therme-vals-zumthor', file: 'File:2005-08-06-Therme-Vals-Peter-Zumthor 05.jpg' }
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'TI2A-Quiz/1.0 (contact: admin.ti2a@gmail.com)' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode));
      const f = fs.createWriteStream(dest);
      res.pipe(f);
      f.on('finish', () => {
        f.close();
        resolve(fs.statSync(dest).size);
      });
      f.on('error', reject);
    }).on('error', reject);
  });
}

function getThumb(fileTitle) {
  return new Promise(resolve => {
    const url = 'https://commons.wikimedia.org/w/api.php?action=query&titles=' + encodeURIComponent(fileTitle) + '&prop=imageinfo&iiprop=url&iiurlwidth=1200&format=json';
    https.get(url, { headers: { 'User-Agent': 'TI2A-Quiz/1.0 (admin@ti2a.com)' } }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          const pid = Object.keys(j.query.pages)[0];
          resolve(j.query.pages[pid]?.imageinfo?.[0]?.thumburl);
        } catch { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

async function run() {
  for (const t of targetFiles) {
    const thumb = await getThumb(t.file);
    console.log(t.slug, 'thumb:', thumb);
    if (thumb) {
      const dest = path.join(__dirname, '../public/quizzes', `${t.slug}.jpg`);
      const sz = await downloadFile(thumb, dest);
      console.log(`✅ Downloaded ${t.slug} (${(sz / 1024).toFixed(1)} KB)`);
    }
  }
}

run().catch(console.error);
