const fs = require('fs');
const { PDFParse } = require('pdf-parse');

const pdfs = [
  'scripts/diploma_2026_27.pdf',
  'scripts/diploma_barch_2026_27.pdf',
  'scripts/diploma_2023_24.pdf',
  'scripts/diploma_barch_2023_24.pdf'
];

async function inspectAll() {
  for (const pdfPath of pdfs) {
    console.log(`\n========================================`);
    console.log(`FILE: ${pdfPath}`);
    console.log(`========================================`);
    const buf = fs.readFileSync(pdfPath);
    const parser = new PDFParse(new Uint8Array(buf));
    await parser.load();
    const result = await parser.getText();
    const fullText = result.text;
    console.log(`Total Pages: ${result.pages.length}`);
    console.log(`Total Text Length: ${fullText.length} characters`);
    
    // Look for institution codes pattern: e.g. APD01, GJ06, etc.
    const codeMatches = fullText.match(/\b([A-Z]{2}[D]?[0-9]{2}[A-Z]?)\b/g) || [];
    // filter out common non-codes if any
    const uniqueCodes = [...new Set(codeMatches.filter(c => !['NO', 'SL'].includes(c)))];
    console.log(`Total code occurrences: ${codeMatches.length}, Unique codes found: ${uniqueCodes.length}`);
    console.log(`Sample codes:`, uniqueCodes.slice(0, 15));

    // Look for courses
    const courses = [];
    const courseRegex = /Diploma\s+in\s+[A-Za-z\s&]+/gi;
    let cm;
    while ((cm = courseRegex.exec(fullText)) !== null) {
      courses.push(cm[0].replace(/\s+/g, ' ').trim());
    }
    const uniqueCourses = [...new Set(courses.map(c => c.split('\n')[0].trim()))];
    console.log(`Unique course mentions:`, uniqueCourses.slice(0, 10));

    // Sample lines
    const lines = fullText.split('\n').map(l => l.trim()).filter(Boolean);
    console.log(`First 20 non-empty lines:`);
    lines.slice(0, 20).forEach((l, idx) => console.log(`  ${idx+1}: ${l}`));
  }
}

inspectAll().catch(console.error);
