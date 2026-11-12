const fs = require('fs');

const years = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];

for (const y of years) {
  const html = fs.readFileSync(`scripts/nirf_${y}.html`, 'utf8');
  console.log(`\n============================`);
  console.log(`YEAR ${y} (Length: ${html.length})`);
  console.log(`============================`);

  // Check table
  const trMatches = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  console.log(`Total rows: ${trMatches.length}`);

  // Check headers (th)
  const thMatches = [...html.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)].map(m =>
    m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  );
  console.log(`Table headers:`, thMatches.slice(0, 8));

  // Check first data row (td)
  const rows = [];
  for (const tr of trMatches) {
    const tds = [...tr[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m =>
      m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    );
    if (tds.length >= 4) {
      rows.push(tds);
    }
  }

  console.log(`Extracted data rows: ${rows.length}`);
  if (rows.length > 0) {
    console.log(`Top 1:`, rows[0].slice(0, 6));
    console.log(`Top 2:`, rows[1]?.slice(0, 6));
    console.log(`Last:`, rows[rows.length - 1]?.slice(0, 6));
  }
}
