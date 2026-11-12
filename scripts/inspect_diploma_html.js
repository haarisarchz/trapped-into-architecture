const fs = require('fs');

const files = [
  'scripts/diploma_2025_26.html',
  'scripts/diploma_barch_2025_26.html',
  'scripts/diploma_2024_25.html',
  'scripts/diploma_barch_2024_25.html'
];

files.forEach(f => {
  const html = fs.readFileSync(f, 'utf8');
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let match;
  const rows = [];
  while ((match = trRegex.exec(html)) !== null) {
    const tdMatches = [...match[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m =>
      m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    );
    if (tdMatches.length >= 6) {
      rows.push(tdMatches);
    }
  }

  console.log(`\n=== ${f} ===`);
  console.log(`Total data rows: ${rows.length}`);
  if (rows.length > 0) {
    console.log('Sample row 0:', rows[0].slice(0, 6));
    if (rows.length > 1) console.log('Sample row 1:', rows[1].slice(0, 6));
  }

  // Course names found
  const courseNames = new Set(rows.map(r => r[3]));
  console.log('Course names:', [...courseNames]);

  // Intake texts found
  const intakes = rows.slice(0, 5).map(r => `${r[1].slice(0, 10)} | ${r[3]} | ${r[5]}`);
  console.log('Sample intakes:', intakes);
});
