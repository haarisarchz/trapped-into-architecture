const fs = require('fs');
const { PDFParse } = require('pdf-parse');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bcifyymjfktabtsmocnc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y'
);

async function analyzeAll() {
  console.log('Fetching existing institutions from Supabase...');
  let allInst = [];
  let p = 0;
  while (true) {
    const { data } = await supabase.from('institutions').select('id, coa_code, institution_name, slug').range(p*1000, (p+1)*1000-1);
    allInst.push(...data);
    if (data.length < 1000) break;
    p++;
  }
  const codeMap = new Map();
  allInst.forEach(i => codeMap.set(i.coa_code.trim().toUpperCase(), i));
  console.log(`Database currently has ${allInst.length} institutions.`);

  // 1. Parse HTML files
  const htmlFiles = [
    { file: 'scripts/diploma_2025_26.html', year: '2025-2026', type: 'standalone' },
    { file: 'scripts/diploma_barch_2025_26.html', year: '2025-2026', type: 'barch' },
    { file: 'scripts/diploma_2024_25.html', year: '2024-2025', type: 'standalone' },
    { file: 'scripts/diploma_barch_2024_25.html', year: '2024-2025', type: 'barch' }
  ];

  const htmlParsed = [];
  for (const hf of htmlFiles) {
    const html = fs.readFileSync(hf.file, 'utf8');
    const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let match;
    let rows = 0;
    while ((match = trRegex.exec(html)) !== null) {
      const tds = [...match[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m =>
        m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      );
      if (tds.length >= 6) {
        rows++;
        const rawInfo = tds[1];
        const codeMatch = rawInfo.match(/^([A-Z]{2}[D]?[0-9]{2}[A-Z]?)\b/);
        const code = codeMatch ? codeMatch[1].toUpperCase() : null;
        
        // title
        let title = null;
        const tm = rawInfo.match(/^([A-Z]{2}[D]?[0-9]{2}[A-Z]?)\s+([A-Za-z\s]+?)\s+(Andhra|HAM-AK|Vyavasay|Shri|Raman|Government|Govt|Women|SMT|Seth|Dr|Smt|Department|Polytechnic|College|School|Institute|[A-Z][a-z]+)/i);
        if (tm) title = tm[2].trim();

        const university = tds[2];
        const courseName = tds[3];
        const commencement = tds[4];
        const intakeRaw = tds[5];
        const seatMatch = intakeRaw.match(/^(\d+)/);
        const seats = seatMatch ? parseInt(seatMatch[1], 10) : 0;
        const years = [...intakeRaw.matchAll(/(\d{4}-\d{4})/g)].map(m => m[1]);

        htmlParsed.push({
          sourceFile: hf.file,
          sourceType: hf.type,
          defaultYear: hf.year,
          code,
          rawInfo,
          title,
          university,
          courseName,
          commencement,
          seats,
          intakeRaw,
          years: years.length ? years : [hf.year]
        });
      }
    }
    console.log(`Parsed ${hf.file}: ${rows} rows`);
  }

  // 2. Parse PDF files
  const pdfFiles = [
    { file: 'scripts/diploma_2026_27.pdf', year: '2026-2027', type: 'standalone' },
    { file: 'scripts/diploma_barch_2026_27.pdf', year: '2026-2027', type: 'barch' },
    { file: 'scripts/diploma_2023_24.pdf', year: '2023-2024', type: 'standalone' },
    { file: 'scripts/diploma_barch_2023_24.pdf', year: '2023-2024', type: 'barch' }
  ];

  const pdfParsed = [];
  for (const pf of pdfFiles) {
    const buf = fs.readFileSync(pf.file);
    const parser = new PDFParse(new Uint8Array(buf));
    await parser.load();
    const res = await parser.getText();
    const text = res.text;
    
    // Split into lines
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    console.log(`Parsing ${pf.file}: ${lines.length} lines`);

    // Let's inspect how blocks start
    let count = 0;
    // Regex for entry start: e.g. "1 APD01 The Principal" or "1 GJ05-D The Principal"
    const entryRegex = /^(\d+)\s+([A-Z]{2}[D]?[0-9]{2}[A-Z]?(?:-D\d?)?)\s+(The\s+[A-Za-z\s]+|Principal|Director|Head|Dean)/i;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const em = line.match(entryRegex);
      if (em) {
        count++;
      }
    }
    console.log(`Detected ~${count} numbered entries in ${pf.file}`);
  }

  // Check unique codes in HTML
  const standaloneCodes = new Set();
  const barchCodes = new Set();
  const allCourses = new Set();

  htmlParsed.forEach(r => {
    allCourses.add(r.courseName);
    if (r.sourceType === 'standalone') {
      standaloneCodes.add(r.code);
    } else {
      barchCodes.add(r.code);
    }
  });

  console.log(`\n--- HTML DATASET SUMMARY ---`);
  console.log(`Total HTML rows: ${htmlParsed.length}`);
  console.log(`Unique Standalone Diploma Codes in HTML: ${standaloneCodes.size}`);
  console.log(`Unique Existing B.Arch Codes in HTML: ${barchCodes.size}`);
  console.log(`Distinct Courses in HTML:`, [...allCourses]);

  // Check how many standalone codes exist in DB
  let existingStandalone = 0;
  let missingStandalone = 0;
  standaloneCodes.forEach(code => {
    if (codeMap.has(code)) existingStandalone++;
    else missingStandalone++;
  });
  console.log(`Standalone Diploma Codes: ${existingStandalone} already in DB, ${missingStandalone} NEW to insert into 'institutions' table.`);

  // Check how many B.Arch codes exist in DB
  let existingBarch = 0;
  let missingBarch = 0;
  barchCodes.forEach(code => {
    if (codeMap.has(code)) existingBarch++;
    else {
      missingBarch++;
      console.log(`  B.Arch code not in DB: ${code}`);
    }
  });
  console.log(`Existing B.Arch Codes: ${existingBarch} found in DB, ${missingBarch} not found.`);
}

analyzeAll().catch(console.error);
