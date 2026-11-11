const fs = require('fs');
const { PDFParse } = require('pdf-parse');

function cleanCourseName(course) {
  if (!course) return 'Diploma in Architecture';
  let c = course.replace(/\s+/g, ' ').trim();
  c = c.replace(/\s+Courses?$/i, '');
  c = c.replace(/\s*&\s*/g, ' and ');
  if (/Diploma\s+in\s+Architectural\s+Assistantship/i.test(c)) return 'Diploma in Architectural Assistantship';
  if (/Diploma\s+in\s+Architecture\s+and\s+Interior\s+Design/i.test(c)) return 'Diploma in Architecture and Interior Design';
  if (/Diploma\s+in\s+Interior\s+Design\s+and\s+Decoration/i.test(c)) return 'Diploma in Interior Design and Decoration';
  if (/Diploma\s+in\s+Interior\s+Design/i.test(c)) return 'Diploma in Interior Design';
  if (/Diploma\s+in\s+Architecture/i.test(c)) return 'Diploma in Architecture';
  return c;
}

const STATE_CODE_MAP = {
  AP: 'Andhra Pradesh',
  AS: 'Assam',
  BR: 'Bihar',
  CG: 'Chhattisgarh',
  CH: 'Chandigarh',
  DL: 'Delhi',
  GA: 'Goa',
  GJ: 'Gujarat',
  HP: 'Himachal Pradesh',
  HR: 'Haryana',
  JH: 'Jharkhand',
  JK: 'Jammu and Kashmir',
  KA: 'Karnataka',
  KL: 'Kerala',
  MH: 'Maharashtra',
  ML: 'Meghalaya',
  MP: 'Madhya Pradesh',
  NL: 'Nagaland',
  OD: 'Odisha',
  PB: 'Punjab',
  RJ: 'Rajasthan',
  TN: 'Tamil Nadu',
  TS: 'Telangana',
  UP: 'Uttar Pradesh',
  UK: 'Uttarakhand',
  WB: 'West Bengal'
};

function getStateFromCode(code) {
  const prefix = code.slice(0, 2);
  return STATE_CODE_MAP[prefix] || 'India';
}

function cleanInstName(rawName) {
  if (!rawName) return '';
  let n = rawName.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  n = n.replace(/\s+(VILL\s*[:-].*|KAUSHILYA\s+BHAWAN.*|Sector\s+\d+.*|Yanam\s+Road.*|At\s+Post.*|Near\s+.*|Opp\s+.*|Opposite\s+.*|P\.?O\.?\s+.*|Taluka\s+.*|Survey\s+No.*)$/i, '');
  n = n.replace(/,\s*$/, '').trim();
  return n;
}

function generateSlug(name, city, code) {
  const base = `${name} ${city || ''} ${code}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return base;
}

async function buildMasterDiplomaData() {
  const standaloneInstitutions = new Map();
  const annualRecords = [];

  // Priority 1: HTML files
  const htmlStandalone = [
    { file: 'scripts/diploma_2025_26.html', defaultYear: '2025-2026' },
    { file: 'scripts/diploma_2024_25.html', defaultYear: '2024-2025' }
  ];

  for (const h of htmlStandalone) {
    const html = fs.readFileSync(h.file, 'utf8');
    const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let match;
    while ((match = trRegex.exec(html)) !== null) {
      const tds = [...match[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m =>
        m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      );
      if (tds.length >= 6) {
        const rawInfo = tds[1];
        const codeM = rawInfo.match(/^([A-Z]{2}D\d{2})\b/);
        if (!codeM) continue;
        const code = codeM[1].toUpperCase();

        let headTitle = 'The Principal';
        if (/Head\s+Of\s+Department/i.test(rawInfo)) headTitle = 'Head of Department';
        else if (/Director/i.test(rawInfo)) headTitle = 'Director';
        else if (/Dean/i.test(rawInfo)) headTitle = 'Dean';
        else if (/Principal/i.test(rawInfo)) headTitle = 'The Principal';

        const university = tds[2] || null;
        const courseName = cleanCourseName(tds[3]);
        const commencement = tds[4] ? parseInt(tds[4], 10) : null;
        const intakeRaw = tds[5];
        const seatMatch = intakeRaw.match(/^(\d+)/);
        const seats = seatMatch ? parseInt(seatMatch[1], 10) : 0;
        const isClosure = /progressive\s+closure/i.test(intakeRaw);
        const isPending = /pending/i.test(intakeRaw);
        const status = isClosure ? 'Progressive Closure' : (isPending ? 'Pending' : 'Approved');

        const yearMatches = [...intakeRaw.matchAll(/(\d{4}-\d{4})/g)].map(m => m[1]);
        const years = yearMatches.length > 0 ? yearMatches : [h.defaultYear];

        // Metadata extraction
        const emailM = rawInfo.match(/Email:\s*([^\s,;]+@[^\s,;]+)/i);
        const mobileM = rawInfo.match(/Mobile:\s*([0-9\s,\/-]+?)(?=\s*Website:|$)/i);
        const telM = rawInfo.match(/Tel:\s*([0-9\s,\/-]+?)(?=\s*Fax:|\s*Email:|$)/i);
        const webM = rawInfo.match(/Website:\s*(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s]*)/i);
        const pinM = rawInfo.match(/Pin\s*code\s*[-:]?\s*(\d{6})/i);
        const pincode = pinM ? pinM[1] : null;

        const state = getStateFromCode(code);

        let clean = rawInfo.replace(/^([A-Z]{2}D\d{2})\s+/, '').replace(/^(Principal|Head Of Department|Director|Dean)\s+/i, '');
        const contactIdx = clean.search(/\s+(Tel:|Email:|Mobile:|Fax:)/i);
        if (contactIdx !== -1) clean = clean.substring(0, contactIdx).trim();

        let city = null;
        const cityM = clean.match(/,\s*([A-Za-z\s]+?)\s*,\s*Pin\s*code/i);
        if (cityM) city = cityM[1].trim();

        clean = clean.replace(/,?\s*Pin\s*code\s*[-:]?\s*\d{6}/i, '');
        clean = clean.replace(/,?\s*[A-Z\s]{4,30}$/i, '').trim();

        const parts = clean.split(/,\s*/);
        const instName = cleanInstName(parts[0].trim());
        const address = `${clean}${pincode ? ` - ${pincode}` : ''}, ${state}`;

        if (!standaloneInstitutions.has(code)) {
          standaloneInstitutions.set(code, {
            coa_code: code,
            institution_name: instName,
            slug: generateSlug(instName, city || state, code),
            city: city || state,
            state: state,
            country: 'India',
            address: address,
            official_email: emailM ? emailM[1].trim() : null,
            official_phone: mobileM ? mobileM[1].trim() : (telM ? telM[1].trim() : null),
            website: webM ? webM[1].trim() : null,
            head_of_institution: headTitle,
            affiliated_university: university,
            establishment_year: commencement,
            institution_type: 'Polytechnic / Diploma Institution'
          });
        }

        for (const yr of years) {
          annualRecords.push({
            coa_code: code,
            academic_year: yr,
            course_name: courseName,
            approved_intake: seats,
            approval_status: status,
            head_of_institution: headTitle,
            affiliated_university: university,
            source: `ECOA Portal (Diploma ${h.defaultYear})`
          });
        }
      }
    }
  }

  // Priority 2: Standalone PDFs (2026-27 & 2023-24)
  const standalonePdfFiles = [
    { file: 'scripts/diploma_2026_27.pdf', defaultYear: '2026-2027' },
    { file: 'scripts/diploma_2023_24.pdf', defaultYear: '2023-2024' }
  ];

  for (const pf of standalonePdfFiles) {
    const buf = fs.readFileSync(pf.file);
    const p = new PDFParse(new Uint8Array(buf));
    await p.load();
    const res = await p.getText();
    const lines = res.text.split('\n').map(l => l.trim()).filter(Boolean);

    let i = 0;
    while (i < lines.length) {
      const startM = lines[i].match(/^(\d+)\s+([A-Z]{2}D\d{2})\s+(The\s+Principal|Principal|Director|Head\s+of\s+Department|Dean)\s*(.*)/i);
      if (startM) {
        const code = startM[2].toUpperCase();
        const headTitle = startM[3].trim();
        const leftoverOnLine = startM[4] ? startM[4].trim() : '';

        // If leftoverOnLine has text (like "ACHARYA POLYTECHNIC, Acharya"), that's the institution name!
        let instNameCandidate = leftoverOnLine ? leftoverOnLine : (lines[i+1] ? lines[i+1].trim() : code);
        instNameCandidate = cleanInstName(instNameCandidate);

        let j = leftoverOnLine ? (i + 1) : (i + 2);
        let email = null;
        let phone = null;
        let courseName = null;
        let intake = null;
        let period = pf.defaultYear;

        while (j < lines.length && !lines[j].match(/^(\d+)\s+([A-Z]{2}D\d{2})\b/)) {
          const l = lines[j];
          if (l.includes('@')) {
            const em = l.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/);
            if (em) email = em[1];
          }
          const ph = l.match(/\b([6-9]\d{9})\b/);
          if (ph) phone = ph[1];

          if (l.match(/Diploma\s+in/i)) {
            let cStr = l;
            if (lines[j+1] && !lines[j+1].match(/^\d{4}\b/) && !lines[j+1].match(/Diploma/i)) {
              cStr += ' ' + lines[j+1];
            }
            courseName = cleanCourseName(cStr);
          }
          const endM = l.match(/^(\d{4})\s+(\d{1,3})\s+(20\d{2}-20\d{2})/);
          if (endM) {
            intake = parseInt(endM[2], 10);
            period = endM[3];
            j++;
            break;
          }
          j++;
        }

        if (!standaloneInstitutions.has(code)) {
          const state = getStateFromCode(code);
          standaloneInstitutions.set(code, {
            coa_code: code,
            institution_name: instNameCandidate,
            slug: generateSlug(instNameCandidate, state, code),
            city: state,
            state: state,
            country: 'India',
            address: `${instNameCandidate}, ${state}`,
            official_email: email,
            official_phone: phone,
            head_of_institution: headTitle,
            institution_type: 'Polytechnic / Diploma Institution'
          });
        }

        if (courseName && intake !== null) {
          annualRecords.push({
            coa_code: code,
            academic_year: period,
            course_name: courseName,
            approved_intake: intake,
            approval_status: 'Approved',
            head_of_institution: headTitle,
            source: `COA Official Gazette (Diploma ${pf.defaultYear})`
          });
        }

        i = j;
      } else {
        i++;
      }
    }
  }

  // Priority 3: Existing B.Arch with Diploma (HTML 2024-25 & 2025-26)
  const htmlBarch = [
    { file: 'scripts/diploma_barch_2024_25.html', defaultYear: '2024-2025' },
    { file: 'scripts/diploma_barch_2025_26.html', defaultYear: '2025-2026' }
  ];

  for (const h of htmlBarch) {
    const html = fs.readFileSync(h.file, 'utf8');
    const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let match;
    while ((match = trRegex.exec(html)) !== null) {
      const tds = [...match[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m =>
        m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      );
      if (tds.length >= 6) {
        const rawInfo = tds[1];
        const codeM = rawInfo.match(/^([A-Z]{2}\d{2,3}[A-Z]?)\b/);
        if (!codeM) continue;
        const code = codeM[1].toUpperCase();

        let headTitle = 'The Principal';
        if (/Head\s+Of\s+Department/i.test(rawInfo)) headTitle = 'Head of Department';
        else if (/Director/i.test(rawInfo)) headTitle = 'Director';
        else if (/Dean/i.test(rawInfo)) headTitle = 'Dean';
        else if (/Principal/i.test(rawInfo)) headTitle = 'The Principal';

        const university = tds[2] || null;
        const courseName = cleanCourseName(tds[3]);
        const intakeRaw = tds[5];
        const seatMatch = intakeRaw.match(/^(\d+)/);
        const seats = seatMatch ? parseInt(seatMatch[1], 10) : 0;
        const isClosure = /progressive\s+closure/i.test(intakeRaw);
        const isPending = /pending/i.test(intakeRaw);
        const status = isClosure ? 'Progressive Closure' : (isPending ? 'Pending' : 'Approved');

        const yearMatches = [...intakeRaw.matchAll(/(\d{4}-\d{4})/g)].map(m => m[1]);
        const years = yearMatches.length > 0 ? yearMatches : [h.defaultYear];

        for (const yr of years) {
          annualRecords.push({
            coa_code: code,
            academic_year: yr,
            course_name: courseName,
            approved_intake: seats,
            approval_status: status,
            head_of_institution: headTitle,
            affiliated_university: university,
            source: `ECOA Portal (B.Arch Diploma ${h.defaultYear})`
          });
        }
      }
    }
  }

  // Priority 4: Existing B.Arch with Diploma (PDF 2026-27 & 2023-24)
  const pdfBarchFiles = [
    { file: 'scripts/diploma_barch_2026_27.pdf', defaultYear: '2026-2027' },
    { file: 'scripts/diploma_barch_2023_24.pdf', defaultYear: '2023-2024' }
  ];

  for (const pf of pdfBarchFiles) {
    const buf = fs.readFileSync(pf.file);
    const p = new PDFParse(new Uint8Array(buf));
    await p.load();
    const res = await p.getText();
    const lines = res.text.split('\n').map(l => l.trim()).filter(Boolean);

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
      const code = codeM[2].toUpperCase();

      let headTitle = 'The Principal';
      if (/Head\s+of\s+Department/i.test(full)) headTitle = 'Head of Department';
      else if (/Director/i.test(full)) headTitle = 'Director';
      else if (/Principal/i.test(full)) headTitle = 'The Principal';

      let courseName = cleanCourseName(full);
      const intakeMatch = full.match(/(\d{2,3})\s+(20\d{2}-20\d{2})/);
      const seats = intakeMatch ? parseInt(intakeMatch[1], 10) : 0;
      const period = intakeMatch ? intakeMatch[2] : pf.defaultYear;

      annualRecords.push({
        coa_code: code,
        academic_year: period,
        course_name: courseName,
        approved_intake: seats,
        approval_status: 'Approved',
        head_of_institution: headTitle,
        source: `COA Official Gazette (B.Arch Diploma ${pf.defaultYear})`
      });
    }
  }

  // Deduplicate
  const dedupMap = new Map();
  for (const r of annualRecords) {
    const key = `${r.coa_code}__${r.academic_year}__${r.course_name}`;
    if (!dedupMap.has(key)) {
      dedupMap.set(key, r);
    } else {
      const existing = dedupMap.get(key);
      if (r.approved_intake > 0 && existing.approved_intake === 0) {
        dedupMap.set(key, r);
      }
    }
  }

  const finalRecords = Array.from(dedupMap.values());
  console.log(`Standalone Institutions: ${standaloneInstitutions.size}`);
  console.log(`De-duplicated Annual Records: ${finalRecords.length}`);

  fs.writeFileSync('scripts/consolidated_diploma_institutions.json', JSON.stringify(Array.from(standaloneInstitutions.values()), null, 2));
  fs.writeFileSync('scripts/consolidated_diploma_records.json', JSON.stringify(finalRecords, null, 2));
}

buildMasterDiplomaData().catch(console.error);
