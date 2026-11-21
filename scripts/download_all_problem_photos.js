const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error('Status ' + res.statusCode));
      const f = fs.createWriteStream(dest);
      res.pipe(f);
      f.on('finish', () => {
        f.close();
        resolve(dest);
      });
      f.on('error', reject);
    }).on('error', reject);
  });
}

function getCommonsThumb(title, width = 1200) {
  return new Promise(resolve => {
    const url = 'https://commons.wikimedia.org/w/api.php?action=query&titles=' + encodeURIComponent(title) + '&prop=imageinfo&iiprop=url&iiurlwidth=' + width + '&format=json';
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
  const tasks = [
    // 1. Kanchanjunga Apartments (Mumbai) - Exterior tower showing stepped red-and-white terraces
    {
      slug: 'kanchanjunga-apartments-mumbai',
      directUrl: 'https://live.staticflickr.com/7143/6798305457_d143aa0575_b.jpg'
    },
    // 2. Sangath (Ahmedabad) - B.V. Doshi's mosaic vaulted studio
    {
      slug: 'sangath-doshi',
      directUrl: 'https://live.staticflickr.com/7799/17774804525_d7b0926248_b.jpg'
    },
    // 3. IIM Ahmedabad - Louis Kahn Plaza red brick arches
    {
      slug: 'iim-ahmedabad-louis-kahn',
      commonsFile: 'File:Louis Kahn Plaza, IIM Ahmedabad.jpg'
    },
    // 4. IIM Bangalore - B.V. Doshi Central Pergola stone corridor
    {
      slug: 'iim-bangalore-doshi',
      commonsFile: 'File:Indian Institute of Management Bangalore, Central Pergola in 2015.jpg'
    },
    // 5. Jawahar Kala Kendra (JKK) Jaipur - Charles Correa Central Courtyard
    {
      slug: 'jawahar-kala-kendra',
      commonsFile: 'File:Central courtyard, Jawahar Kala Kendra, Jaipur, Rajasthan.jpg'
    },
    // 6. City of Arts and Sciences (Valencia) - Santiago Calatrava
    {
      slug: 'city-of-arts-and-sciences',
      commonsFile: 'File:City of Arts and Sciences Valencia in 2014.jpg'
    },
    // 7. The Getty Center (Los Angeles) - Richard Meier
    {
      slug: 'the-getty-center-meier',
      commonsFile: 'File:Getty Center Los Angeles by Richard Meier.jpg'
    },
    // 8. IIT Kanpur PK Kelkar Library - Achyut Kanvinde
    {
      slug: 'iit-kanpur-kanvinde',
      commonsFile: 'File:P.K.kelkar library iit kanpur.jpg'
    },
    // 9. Paimio Sanatorium (Finland) - Alvar Aalto
    {
      slug: 'paimio-sanatorium-aalto',
      commonsFile: 'File:The Paimio Sanatorium, designed by Alvar Aalto, pictured in 1961 (JOKAVKH2F01-5).tif'
    },
    // 10. Bharat Bhavan (Bhopal) - Charles Correa terrace campus
    {
      slug: 'bharat-bhavan-correa',
      commonsFile: 'File:Bharat Bhavan campus 01.jpg'
    },
    // 11. Casa Luis Barragán (Mexico City) - Luis Barragán
    {
      slug: 'casa-luis-barragan',
      commonsFile: 'File:Luis Barragán House and Studio-115241.jpg'
    },
    // 12. IIFM Bhopal - Anant Raje
    {
      slug: 'iifm-bhopal-anant-raje',
      commonsFile: 'File:Iifm.jpg'
    }
  ];

  const destDir = path.join(__dirname, '../public/quizzes');

  for (const item of tasks) {
    let url = item.directUrl;
    if (!url && item.commonsFile) {
      url = await getCommonsThumb(item.commonsFile, 1200);
    }
    if (!url) {
      console.error(`❌ Could not get URL for ${item.slug}`);
      continue;
    }

    const tmpFile = path.join(destDir, `${item.slug}-tmp.jpg`);
    const finalFile = path.join(destDir, `${item.slug}.jpg`);

    try {
      console.log(`Downloading ${item.slug} from ${url}...`);
      await download(url, tmpFile);

      // Process with sharp (convert to optimized progressive jpeg max width 1200)
      const meta = await sharp(tmpFile).metadata();
      console.log(`  Source: ${meta.width}x${meta.height}, format: ${meta.format}`);

      await sharp(tmpFile)
        .resize({ width: 1200, withoutEnlargement: true })
        .jpeg({ quality: 85, progressive: true })
        .toFile(finalFile + '.opt');

      fs.renameSync(finalFile + '.opt', finalFile);
      fs.unlinkSync(tmpFile);

      const finalStat = fs.statSync(finalFile);
      console.log(`✅ Success: ${item.slug}.jpg (${(finalStat.size / 1024).toFixed(1)} KB)`);
    } catch (e) {
      console.error(`❌ Failed ${item.slug}:`, e.message);
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    }
  }
}

run().catch(console.error);
