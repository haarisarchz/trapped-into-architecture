const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function testPdfExtraction() {
  const pdfs = [
    { file: 'scripts/diploma_2026_27.pdf', label: '2026-27 Standalone Diploma' },
    { file: 'scripts/diploma_barch_2026_27.pdf', label: '2026-27 B.Arch with Diploma' },
    { file: 'scripts/diploma_2023_24.pdf', label: '2023-24 Standalone Diploma' },
    { file: 'scripts/diploma_barch_2023_24.pdf', label: '2023-24 B.Arch with Diploma' }
  ];

  for (const p of pdfs) {
    const buf = fs.readFileSync(p.file);
    const parser = new PDFParse(new Uint8Array(buf));
    await parser.load();
    const res = await parser.getText();
    const text = res.text;

    console.log(`\n========================================`);
    console.log(`${p.label} (${p.file})`);
    console.log(`========================================`);

    // Match all codes with -D or standalone D codes
    const matches = [...text.matchAll(/\b([A-Z]{2}(?:D\d{2}|\d{2,3}(?:-D\d?)?))\b/g)].map(m => m[1]);
    const unique = [...new Set(matches.filter(m => !['SL', 'NO'].includes(m)))];
    console.log(`Unique institution codes found: ${unique.length}`);
    console.log(`First 10 codes:`, unique.slice(0, 10));

    // Check course occurrences
    const courses = [...text.matchAll(/Diploma\s+in\s+([A-Za-z\s&]+?)(?=\s+\d{4}|\s+\d{2}\b)/gi)].map(m =>
      m[0].replace(/\s+/g, ' ').trim()
    );
    const uniqueC = [...new Set(courses)];
    console.log(`Unique Course titles:`, uniqueC);
  }
}

testPdfExtraction().catch(console.error);
