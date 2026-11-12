const fs = require('fs');
let html = fs.readFileSync('scripts/nirf_2018.html', 'utf8');
html = html.replace(/<div[^>]*class=["']tbl_hidden["'][^>]*>[\s\S]*?<\/div>/gi, '');
html = html.replace(/<table[^>]*class=["']table\s*["'][^>]*>[\s\S]*?<\/table>/gi, '');

const trMatches = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
const rows = [];
for (const tr of trMatches) {
  const tds = [...tr[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m =>
    m[1].replace(/<a[^>]*>[\s\S]*?<\/a>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  );
  if (tds.length >= 6) {
    rows.push({
      id: tds[0],
      name: tds[1].replace(/\|\s*\|/g, '').trim(),
      city: tds[2],
      state: tds[3],
      score: tds[4],
      rank: tds[5]
    });
  }
}

console.log(`2018 Total rows: ${rows.length}`);
rows.forEach((r, idx) => console.log(`[${idx+1}] Rank ${r.rank}: ${r.name} (${r.city}, ${r.state})`));
