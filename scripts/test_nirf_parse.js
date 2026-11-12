const fs = require('fs');

const years = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];

for (const y of years) {
  let html = fs.readFileSync(`scripts/nirf_${y}.html`, 'utf8');

  // Strip nested tables / hidden divs
  html = html.replace(/<div[^>]*class=["']tbl_hidden["'][^>]*>[\s\S]*?<\/div>/gi, '');
  html = html.replace(/<table[^>]*class=["']table\s*["'][^>]*>[\s\S]*?<\/table>/gi, '');

  const trMatches = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  const institutions = [];

  for (const tr of trMatches) {
    const tds = [...tr[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m => {
      // remove links and buttons
      let text = m[1].replace(/<a[^>]*>[\s\S]*?<\/a>/gi, '');
      text = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      return text;
    });

    if (tds.length >= 6) {
      const nirfId = tds[0];
      const name = tds[1];
      const city = tds[2];
      const state = tds[3];
      const score = tds[4];
      const rank = tds[5];

      // Verify rank is a number or rank range
      if (rank && rank.match(/^\d+/)) {
        institutions.push({
          year: y,
          nirfId,
          name,
          city,
          state,
          score: parseFloat(score) || null,
          rank: parseInt(rank, 10),
          rankRaw: rank
        });
      }
    }
  }

  console.log(`\n============================`);
  console.log(`YEAR ${y}: Extracted ${institutions.length} ranked institutions`);
  console.log(`Top 3:`);
  institutions.slice(0, 3).forEach(i => console.log(`  Rank ${i.rank}: ${i.name} (${i.city}, ${i.state}) [Score: ${i.score}]`));
  console.log(`Bottom 2:`);
  institutions.slice(-2).forEach(i => console.log(`  Rank ${i.rank}: ${i.name} (${i.city}, ${i.state}) [Score: ${i.score}]`));
}
