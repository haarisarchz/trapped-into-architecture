const fs = require('fs');
const { PDFParse } = require('pdf-parse');

function cleanCourseName(course) {
  if (!course) return 'Diploma in Architecture';
  let c = course.replace(/\s+/g, ' ').trim();
  // Strip trailing "Course" or "Courses"
  c = c.replace(/\s+Courses?$/i, '');
  // Normalize '&' to 'and'
  c = c.replace(/\s*&\s*/g, ' and ');
  // Specific normalizations
  if (/Diploma\s+in\s+Architectural\s+Assistantship/i.test(c)) return 'Diploma in Architectural Assistantship';
  if (/Diploma\s+in\s+Architecture\s+and\s+Interior\s+Design/i.test(c)) return 'Diploma in Architecture and Interior Design';
  if (/Diploma\s+in\s+Interior\s+Design\s+and\s+Decoration/i.test(c)) return 'Diploma in Interior Design and Decoration';
  if (/Diploma\s+in\s+Interior\s+Design/i.test(c)) return 'Diploma in Interior Design';
  if (/Diploma\s+in\s+Architecture/i.test(c)) return 'Diploma in Architecture';
  return c;
}

function parseHtmlFile(filePath, defaultYear, isStandalone) {
  const html = fs.readFileSync(filePath, 'utf8');
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let match;
  const records = [];

  while ((match = trRegex.exec(html)) !== null) {
    const tds = [...match[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m =>
      m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    );

    if (tds.length >= 6) {
      const rawInfo = tds[1];
      // Code match (e.g. APD01, GJ06, MH102)
      const codeMatch = rawInfo.match(/^([A-Z]{2}(?:D\d{2}|\d{2,3}[A-Z]?))\b/);
      if (!codeMatch) continue;
      const code = codeMatch[1].toUpperCase();

      // Leadership title/designation: Head of Department, Principal, Director, Dean
      let title = 'The Principal';
      if (/Head\s+Of\s+Department/i.test(rawInfo)) title = 'Head of Department';
      else if (/Director/i.test(rawInfo)) title = 'Director';
      else if (/Dean/i.test(rawInfo)) title = 'Dean';
      else if (/Principal/i.test(rawInfo)) title = 'The Principal';

      // Affiliated university / State board
      const university = tds[2] || null;

      // Course Name
      const courseName = cleanCourseName(tds[3]);

      // Commencement year
      const commencement = tds[4] ? parseInt(tds[4], 10) : null;

      // Intake and Years
      const intakeRaw = tds[5];
      const seatMatch = intakeRaw.match(/^(\d+)/);
      const seats = seatMatch ? parseInt(seatMatch[1], 10) : 0;

      // Status
      const isClosure = /progressive\s+closure/i.test(intakeRaw);
      const isPending = /pending/i.test(intakeRaw);
      const isHold = /hold/i.test(intakeRaw);
      const status = isClosure ? 'Progressive Closure' : (isPending ? 'Pending' : (isHold ? 'Intake on Hold' : 'Approved'));

      // Years
      const yearMatches = [...intakeRaw.matchAll(/(\d{4}-\d{4})/g)].map(m => m[1]);
      const years = yearMatches.length > 0 ? yearMatches : [defaultYear];

      // Institution metadata (for standalone)
      // Extract Email, Phone, Mobile, Address, Pincode
      const emailM = rawInfo.match(/Email:\s*([^\s,;]+@[^\s,;]+)/i);
      const email = emailM ? emailM[1].trim() : null;

      const mobileM = rawInfo.match(/Mobile:\s*([0-9\s,\/-]+?)(?=\s*Website:|$)/i);
      const mobile = mobileM ? mobileM[1].trim() : null;

      const telM = rawInfo.match(/Tel:\s*([0-9\s,\/-]+?)(?=\s*Fax:|\s*Email:|$)/i);
      const tel = telM ? telM[1].trim() : null;

      const webM = rawInfo.match(/Website:\s*(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s]*)/i);
      const website = webM ? webM[1].trim() : null;

      const pinM = rawInfo.match(/Pin\s*code\s*[-:]?\s*(\d{6})/i);
      const pincode = pinM ? pinM[1] : null;

      // Extract institution name and address
      // Structure: CODE TITLE NAME , ADDRESS , CITY, Pin code... , STATE
      let instName = null;
      let address = null;
      let state = null;
      let city = null;

      const stateM = rawInfo.match(/,\s*([A-Z\s]{3,30})\s+Tel:/i);
      if (stateM) {
        state = stateM[1].trim();
      }

      // Cleanup name & address from rawInfo
      let cleanText = rawInfo
        .replace(/^([A-Z]{2}(?:D\d{2}|\d{2,3}[A-Z]?))\s+/, '')
        .replace(/^(Principal|Head Of Department|Director|Dean)\s+/i, '');

      const contactStart = cleanText.search(/Tel:|Email:|Mobile:|Fax:/i);
      if (contactStart !== -1) {
        cleanText = cleanText.substring(0, contactStart).trim();
      }

      // cleanText is e.g. "Andhra Polytechnic Yanam Road, Jagannaickpur Road , Kakinada,Pin code-533002 ,ANDHRA PRADESH"
      const parts = cleanText.split(/,\s*/);
      if (parts.length > 0) {
        instName = parts[0].trim();
        address = cleanText;
      }
      if (parts.length >= 3) {
        // city usually before pincode
        const cityCandidate = parts[parts.length - 3] || parts[parts.length - 2];
        if (cityCandidate && !cityCandidate.includes('Pin code')) {
          city = cityCandidate.trim();
        }
      }

      records.push({
        code,
        isStandalone,
        title,
        university,
        courseName,
        commencement,
        seats,
        status,
        years,
        rawInfo,
        metadata: {
          instName,
          address,
          state,
          city,
          pincode,
          email,
          phone: mobile || tel,
          website
        }
      });
    }
  }

  return records;
}

async function parsePdfs() {
  const pdfRecords = [];

  // PDF 1: scripts/diploma_2026_27.pdf
  {
    const buf = fs.readFileSync('scripts/diploma_2026_27.pdf');
    const p = new PDFParse(new Uint8Array(buf));
    await p.load();
    const res = await p.getText();
    const text = res.text;
    
    // Split by numbered items e.g. "\n1 APD01" or "\n 1 APD01"
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    let currentBlock = null;
    const blocks = [];

    for (const line of lines) {
      const startMatch = line.match(/^(\d+)\s+([A-Z]{2}D\d{2})\b/);
      if (startMatch) {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = [line];
      } else if (currentBlock) {
        currentBlock.push(line);
      }
    }
    if (currentBlock) blocks.push(currentBlock);

    for (const b of blocks) {
      const full = b.join(' ');
      const m = full.match(/^(\d+)\s+([A-Z]{2}D\d{2})\s+(.*?)(?:([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)|\b\d{10}\b)/);
      const codeM = full.match(/^(\d+)\s+([A-Z]{2}D\d{2})/);
      if (!codeM) continue;
      const code = codeM[2];

      let title = 'The Principal';
      if (/Head\s+of\s+Department/i.test(full)) title = 'Head of Department';
      else if (/Director/i.test(full)) title = 'Director';
      else if (/Principal/i.test(full)) title = 'The Principal';

      // Course
      let courseName = 'Diploma in Architecture';
      const cMatch = full.match(/Diploma\s+in\s+([A-Za-z\s&]+?)(?=\s+\d{4}\s+\d{2}|\s+\d{2}\s+2026|\s+Intake)/i);
      if (cMatch) {
        courseName = cleanCourseName('Diploma in ' + cMatch[1]);
      } else {
        courseName = cleanCourseName(full);
      }

      // Intake & Year
      const intakeMatch = full.match(/(\d{2,3})\s+(20\d{2}-20\d{2})/);
      const seats = intakeMatch ? parseInt(intakeMatch[1], 10) : 0;
      const years = intakeMatch ? [intakeMatch[2]] : ['2026-2027'];

      pdfRecords.push({
        source: 'scripts/diploma_2026_27.pdf',
        code,
        isStandalone: true,
        title,
        courseName,
        seats,
        status: 'Approved',
        years,
        rawText: full
      });
    }
  }

  // PDF 2: scripts/diploma_barch_2026_27.pdf
  {
    const buf = fs.readFileSync('scripts/diploma_barch_2026_27.pdf');
    const p = new PDFParse(new Uint8Array(buf));
    await p.load();
    const res = await p.getText();
    const text = res.text;

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    let currentBlock = null;
    const blocks = [];

    for (const line of lines) {
      const startMatch = line.match(/^(\d+)\s+([A-Z]{2}\d{2,3}-D\d?)\b/);
      if (startMatch) {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = [line];
      } else if (currentBlock) {
        currentBlock.push(line);
      }
    }
    if (currentBlock) blocks.push(currentBlock);

    for (const b of blocks) {
      const full = b.join(' ');
      const codeM = full.match(/^(\d+)\s+([A-Z]{2}\d{2,3})-D\d?/);
      if (!codeM) continue;
      const code = codeM[2];

      let title = 'The Principal';
      if (/Head\s+of\s+Department/i.test(full)) title = 'Head of Department';
      else if (/Director/i.test(full)) title = 'Director';
      else if (/Principal/i.test(full)) title = 'The Principal';

      let courseName = cleanCourseName(full);
      const intakeMatch = full.match(/(\d{2,3})\s+(20\d{2}-20\d{2})/);
      const seats = intakeMatch ? parseInt(intakeMatch[1], 10) : 0;
      const years = intakeMatch ? [intakeMatch[2]] : ['2026-2027'];

      pdfRecords.push({
        source: 'scripts/diploma_barch_2026_27.pdf',
        code,
        isStandalone: false,
        title,
        courseName,
        seats,
        status: 'Approved',
        years,
        rawText: full
      });
    }
  }

  // PDF 3: scripts/diploma_2023_24.pdf
  {
    const buf = fs.readFileSync('scripts/diploma_2023_24.pdf');
    const p = new PDFParse(new Uint8Array(buf));
    await p.load();
    const res = await p.getText();
    const text = res.text;

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    let currentBlock = null;
    const blocks = [];

    for (const line of lines) {
      const startMatch = line.match(/^(\d+)\s+([A-Z]{2}D\d{2})\b/);
      if (startMatch) {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = [line];
      } else if (currentBlock) {
        currentBlock.push(line);
      }
    }
    if (currentBlock) blocks.push(currentBlock);

    for (const b of blocks) {
      const full = b.join(' ');
      const codeM = full.match(/^(\d+)\s+([A-Z]{2}D\d{2})/);
      if (!codeM) continue;
      const code = codeM[2];

      let title = 'The Principal';
      if (/Head\s+of\s+Department/i.test(full)) title = 'Head of Department';
      else if (/Director/i.test(full)) title = 'Director';
      else if (/Principal/i.test(full)) title = 'The Principal';

      let courseName = cleanCourseName(full);
      const intakeMatch = full.match(/(\d{2,3})\s+(20\d{2}-20\d{2})/);
      const seats = intakeMatch ? parseInt(intakeMatch[1], 10) : 0;
      const years = intakeMatch ? [intakeMatch[2]] : ['2023-2024'];

      pdfRecords.push({
        source: 'scripts/diploma_2023_24.pdf',
        code,
        isStandalone: true,
        title,
        courseName,
        seats,
        status: 'Approved',
        years,
        rawText: full
      });
    }
  }

  // PDF 4: scripts/diploma_barch_2023_24.pdf
  {
    const buf = fs.readFileSync('scripts/diploma_barch_2023_24.pdf');
    const p = new PDFParse(new Uint8Array(buf));
    await p.load();
    const res = await p.getText();
    const text = res.text;

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    let currentBlock = null;
    const blocks = [];

    for (const line of lines) {
      const startMatch = line.match(/^(\d+)\s+([A-Z]{2}\d{2,3}-D\d?)\b/);
      if (startMatch) {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = [line];
      } else if (currentBlock) {
        currentBlock.push(line);
      }
    }
    if (currentBlock) blocks.push(currentBlock);

    for (const b of blocks) {
      const full = b.join(' ');
      const codeM = full.match(/^(\d+)\s+([A-Z]{2}\d{2,3})-D\d?/);
      if (!codeM) continue;
      const code = codeM[2];

      let title = 'The Principal';
      if (/Head\s+of\s+Department/i.test(full)) title = 'Head of Department';
      else if (/Director/i.test(full)) title = 'Director';
      else if (/Principal/i.test(full)) title = 'The Principal';

      let courseName = cleanCourseName(full);
      const intakeMatch = full.match(/(\d{2,3})\s+(20\d{2}-20\d{2})/);
      const seats = intakeMatch ? parseInt(intakeMatch[1], 10) : 0;
      const years = intakeMatch ? [intakeMatch[2]] : ['2023-2024'];

      pdfRecords.push({
        source: 'scripts/diploma_barch_2023_24.pdf',
        code,
        isStandalone: false,
        title,
        courseName,
        seats,
        status: 'Approved',
        years,
        rawText: full
      });
    }
  }

  return pdfRecords;
}

async function run() {
  console.log('Testing extraction across all 8 sources...');
  const h1 = parseHtmlFile('scripts/diploma_2025_26.html', '2025-2026', true);
  const h2 = parseHtmlFile('scripts/diploma_barch_2025_26.html', '2025-2026', false);
  const h3 = parseHtmlFile('scripts/diploma_2024_25.html', '2024-2025', true);
  const h4 = parseHtmlFile('scripts/diploma_barch_2024_25.html', '2024-2025', false);
  console.log(`HTML parsed: h1=${h1.length}, h2=${h2.length}, h3=${h3.length}, h4=${h4.length}`);

  const pdfRecs = await parsePdfs();
  console.log(`PDF parsed total records: ${pdfRecs.length}`);

  const allRecords = [...h1, ...h2, ...h3, ...h4, ...pdfRecs];
  console.log(`Total extracted record candidates: ${allRecords.length}`);

  // Summary by course
  const courseCount = {};
  for (const r of allRecords) {
    courseCount[r.courseName] = (courseCount[r.courseName] || 0) + 1;
  }
  console.log('\nCourse breakdown:');
  console.table(courseCount);

  // Summary by year
  const yearCount = {};
  for (const r of allRecords) {
    for (const y of r.years) {
      yearCount[y] = (yearCount[y] || 0) + 1;
    }
  }
  console.log('\nYear breakdown:');
  console.table(yearCount);
}

run().catch(console.error);
