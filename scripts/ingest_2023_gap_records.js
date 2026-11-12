const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bcifyymjfktabtsmocnc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function normalizeCourse(raw, defaultCourse = 'B.Arch') {
  if (!raw) return defaultCourse;
  let name = raw.replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
  name = name.replace(/Mangt\b/i, 'Management');
  if (name === 'Bachelor of Architecture') return 'B.Arch';
  if (name === 'Master of Architecture') return 'M.Arch';
  if (name.startsWith('Master of Architecture (')) {
    return name.replace(/^Master of Architecture \(/, 'M.Arch (');
  }
  if (name.startsWith('Master of Architecture')) {
    return name.replace(/^Master of Architecture\s*/, 'M.Arch ');
  }
  return name;
}

function parseFile(filePath, defaultCourse = 'B.Arch') {
  const html = fs.readFileSync(filePath, 'utf8');
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let match;
  const list = [];
  while ((match = trRegex.exec(html)) !== null) {
    const rowHtml = match[1];
    const tdMatches = [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m =>
      m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    );
    if (tdMatches.length >= 6) {
      const [sno, rawInfo, affiliatingUniversity, courseName, commencementYear, intakeRaw] = tdMatches;
      const codeMatch = rawInfo.match(/^([A-Z]{2}\d{2,3}[A-Z]?)\b/);
      if (!codeMatch) continue;

      const code = codeMatch[1];
      const normCourse = normalizeCourse(courseName || defaultCourse, defaultCourse);

      const seatMatch = intakeRaw.match(/^(\d+)/);
      const seats = seatMatch ? parseInt(seatMatch[1], 10) : 0;
      const isProgressiveClosure = /progressive\s+closure/i.test(intakeRaw);
      const isPending = /pending/i.test(intakeRaw);
      const isHold = /intake\s+hold/i.test(intakeRaw);

      let years = [...intakeRaw.matchAll(/(\d{4}-\d{4})/g)].map(m => m[1]);
      // If no explicit academic year string, this 2023-2024 list entry represents session 2023-2024
      if (years.length === 0) {
        if (/^\d+$/.test(intakeRaw.trim()) || seats > 0) {
          years = ['2023-2024'];
        }
      }

      list.push({
        code,
        courseName: normCourse,
        rawCourse: courseName,
        commencementYear,
        intakeRaw,
        seats,
        isProgressiveClosure,
        isPending,
        isHold,
        years
      });
    }
  }
  return list;
}

async function main() {
  console.log('=== STARTING 2023-2024 LIST GAP INGESTION & RECONCILIATION ===');

  // Load existing institutions and existing records
  const { data: dbInsts } = await supabase.from('institutions').select('id, coa_code, institution_name');
  const instByCode = new Map();
  dbInsts.forEach(i => {
    if (i.coa_code) instByCode.set(i.coa_code, i);
  });
  console.log(`Loaded ${instByCode.size} institutions from DB.`);

  let allDbRecords = [];
  let page = 0;
  const pageSize = 1000;
  while (true) {
    const { data } = await supabase
      .from('institution_annual_records')
      .select('id, institution_id, academic_year, course_name, approved_intake')
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (!data || data.length === 0) break;
    allDbRecords.push(...data);
    if (data.length < pageSize) break;
    page++;
  }
  console.log(`Loaded ${allDbRecords.length} existing records from DB.`);

  const dbRecordSet = new Set();
  allDbRecords.forEach(r => {
    dbRecordSet.add(`${r.institution_id}__${r.academic_year}__${r.course_name}`);
  });

  const ugList = parseFile('scripts/ecoa_2023_ug.html', 'B.Arch');
  const pgList = parseFile('scripts/ecoa_2023_pg.html', 'M.Arch');

  let newUgInserted = 0;
  let newPgInserted = 0;

  // Process UG
  console.log('\n--- Processing UG List from 2023 portal ---');
  for (const item of ugList) {
    const inst = instByCode.get(item.code);
    if (!inst) continue;

    for (const yr of item.years) {
      const key = `${inst.id}__${yr}__${item.courseName}`;
      if (!dbRecordSet.has(key)) {
        let status = 'Approved';
        let seats = item.seats;

        if (item.isProgressiveClosure) {
          status = 'Progressive Closure';
          seats = 0;
        } else if (item.isPending) {
          status = 'Pending Approval';
          seats = 0;
        } else if (item.isHold) {
          status = 'Intake Hold';
          seats = 0;
        } else if (seats === 0) {
          status = 'Zero Intake / Discontinued';
        }

        const { error: insErr } = await supabase
          .from('institution_annual_records')
          .insert({
            institution_id: inst.id,
            academic_year: yr,
            course_name: item.courseName,
            approved_intake: seats,
            approval_status: status,
            reviewed_at: new Date().toISOString()
          });

        if (insErr) {
          console.error(`Insert error for UG [${item.code}] (${yr}):`, insErr.message);
        } else {
          dbRecordSet.add(key);
          newUgInserted++;
          console.log(`Inserted new UG record: [${item.code}] ${item.courseName} (${yr}): ${seats} seats`);
        }
      }
    }
  }

  // Process PG
  console.log('\n--- Processing PG List from 2023 portal ---');
  for (const item of pgList) {
    const inst = instByCode.get(item.code);
    if (!inst) continue;

    for (const yr of item.years) {
      const key = `${inst.id}__${yr}__${item.courseName}`;
      if (!dbRecordSet.has(key)) {
        let status = 'Approved';
        let seats = item.seats;

        if (item.isProgressiveClosure) {
          status = 'Progressive Closure';
          seats = 0;
        } else if (item.isPending) {
          status = 'Pending Approval';
          seats = 0;
        } else if (item.isHold) {
          status = 'Intake Hold';
          seats = 0;
        } else if (seats === 0) {
          status = 'Zero Intake / Discontinued';
        }

        const { error: insErr } = await supabase
          .from('institution_annual_records')
          .insert({
            institution_id: inst.id,
            academic_year: yr,
            course_name: item.courseName,
            approved_intake: seats,
            approval_status: status,
            reviewed_at: new Date().toISOString()
          });

        if (insErr) {
          console.error(`Insert error for PG [${item.code}] (${item.courseName} ${yr}):`, insErr.message);
        } else {
          dbRecordSet.add(key);
          newPgInserted++;
          console.log(`Inserted new PG record: [${item.code}] ${item.courseName} (${yr}): ${seats} seats`);
        }
      }
    }
  }

  console.log('\n======================================================');
  console.log(`INGESTION SUMMARY:`);
  console.log(`- New UG records inserted: ${newUgInserted}`);
  console.log(`- New PG records inserted: ${newPgInserted}`);

  // Final count
  const { count: finalTotal } = await supabase
    .from('institution_annual_records')
    .select('*', { count: 'exact', head: true });

  console.log(`Total annual records in DB now: ${finalTotal}`);
  console.log('======================================================');
}

main();
