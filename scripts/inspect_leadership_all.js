const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function inspectLeadership() {
  const htmlFiles = [
    'scripts/diploma_2025_26.html',
    'scripts/diploma_barch_2025_26.html',
    'scripts/diploma_2024_25.html',
    'scripts/diploma_barch_2024_25.html'
  ];

  for (const f of htmlFiles) {
    const html = fs.readFileSync(f, 'utf8');
    // regex for column 2 containing code, title, institution name
    const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let match;
    const titles = new Set();
    const records = [];
    while ((match = trRegex.exec(html)) !== null) {
      const tdMatches = [...match[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m =>
        m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      );
      if (tdMatches.length >= 6) {
        records.push(tdMatches);
        // check second column
        const col2 = tdMatches[1];
        // extract title: usually between Code and Institution Name
        const m = col2.match(/^([A-Z]{2}[D]?[0-9]{2}[A-Z]?)\s+([A-Za-z\s]+?)\s+(Andhra|HAM-AK|Vyavasay|Shri|Raman|Government|Govt|Women|SMT|Seth|Dr|Smt|Department|Polytechnic|[A-Z][a-z]+)/i);
        if (m) {
          titles.add(m[2].trim());
        }
      }
    }
    console.log(`\nHTML File: ${f}`);
    console.log(`Total rows: ${records.length}`);
    console.log(`Detected titles/head roles:`, [...titles]);
    console.log(`First 3 raw col2 strings:`);
    records.slice(0, 3).forEach((r, i) => console.log(` [${i+1}] ${r[1].slice(0, 120)}`));
  }

  // Now PDF files
  const pdfFiles = [
    'scripts/diploma_2026_27.pdf',
    'scripts/diploma_barch_2026_27.pdf',
    'scripts/diploma_2023_24.pdf',
    'scripts/diploma_barch_2023_24.pdf'
  ];

  for (const f of pdfFiles) {
    const buf = fs.readFileSync(f);
    const p = new PDFParse(new Uint8Array(buf));
    await p.load();
    const textRes = await p.getText();
    const text = textRes.text;
    console.log(`\nPDF File: ${f}`);
    
    // Look for lines with code followed by designation/name
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const sampleHeaders = [];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/^[0-9]+\s+[A-Z]{2}[D]?[0-9]{2}/)) {
        sampleHeaders.push(lines[i] + ' ' + (lines[i+1] || ''));
      }
    }
    console.log(`Found entries: ${sampleHeaders.length}`);
    console.log(`First 4 sample entries:`);
    sampleHeaders.slice(0, 4).forEach((s, idx) => console.log(` [${idx+1}] ${s}`));
  }
}

inspectLeadership().catch(console.error);
