const fs = require('fs');

const years = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];

function cleanName(n) {
  return n
    .replace(/\|\s*\|/g, '')
    .replace(/\|\s*$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseYear(year) {
  let html = fs.readFileSync(`scripts/nirf_${year}.html`, 'utf8');
  html = html.replace(/<div[^>]*class=["']tbl_hidden["'][^>]*>[\s\S]*?<\/div>/gi, '');
  html = html.replace(/<table[^>]*class=["']table\s*["'][^>]*>[\s\S]*?<\/table>/gi, '');

  const trMatches = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  const list = [];

  for (const tr of trMatches) {
    const tds = [...tr[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m => {
      let text = m[1].replace(/<a[^>]*>[\s\S]*?<\/a>/gi, '');
      text = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      return text;
    });

    if (tds.length >= 6) {
      const nirfId = tds[0];
      const name = cleanName(tds[1]);
      const city = tds[2];
      const state = tds[3];
      const score = parseFloat(tds[4]) || null;
      const rank = parseInt(tds[5], 10);

      // In 2018, only take the first 10 rows (overall rankings)
      if (year === 2018 && list.length >= 10) {
        break;
      }

      if (!isNaN(rank)) {
        list.push({
          year,
          nirfId,
          name,
          city,
          state,
          score,
          rank
        });
      }
    }
  }

  return list;
}

const allRanks = [];
for (const y of years) {
  const items = parseYear(y);
  console.log(`Year ${y}: ${items.length} rankings`);
  allRanks.push(...items);
}

console.log(`Total NIRF records across 2018-2025: ${allRanks.length}`);

// Unique institutions
const uniqueInstitutions = new Map();
allRanks.forEach(r => {
  const key = `${r.name}__${r.city}__${r.state}`.toLowerCase();
  if (!uniqueInstitutions.has(key)) {
    uniqueInstitutions.set(key, {
      name: r.name,
      city: r.city,
      state: r.state,
      nirfId: r.nirfId,
      yearsRanked: []
    });
  }
  uniqueInstitutions.get(key).yearsRanked.push(`${r.year} (#${r.rank})`);
});

console.log(`Unique institutions ranked across 2018-2025: ${uniqueInstitutions.size}`);
fs.writeFileSync('scripts/all_nirf_extracted.json', JSON.stringify(allRanks, null, 2));
fs.writeFileSync('scripts/unique_nirf_institutions.json', JSON.stringify(Array.from(uniqueInstitutions.values()), null, 2));
console.log('Saved to scripts/all_nirf_extracted.json and scripts/unique_nirf_institutions.json');
