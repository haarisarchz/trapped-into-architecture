const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bcifyymjfktabtsmocnc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function normalizeCourse(raw) {
  if (!raw) return 'M.Arch';
  let name = raw.replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
  name = name.replace(/Mangt\b/i, 'Management');
  if (name === 'Master of Architecture') return 'M.Arch';
  if (name.startsWith('Master of Architecture (')) {
    return name.replace(/^Master of Architecture \(/, 'M.Arch (');
  }
  if (name.startsWith('Master of Architecture')) {
    return name.replace(/^Master of Architecture\s*/, 'M.Arch ');
  }
  return name;
}

function parseArchive() {
  const html = fs.readFileSync('scripts/ecoa_pg_2024_archive.html', 'utf8');
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
      const normalizedCourse = normalizeCourse(courseName);

      const seatMatch = intakeRaw.match(/^(\d+)/);
      const seats = seatMatch ? parseInt(seatMatch[1], 10) : 0;
      const isProgressiveClosure = /progressive\s+closure/i.test(intakeRaw);
      const isPending = /pending/i.test(intakeRaw);
      const isHold = /intake\s+hold/i.test(intakeRaw);

      const years = [...intakeRaw.matchAll(/(\d{4}-\d{4})/g)].map(m => m[1]);

      list.push({
        code,
        courseName: normalizedCourse,
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
  console.log('=== STARTING ECOA 2024-2025 PG INGESTION ===');

  const { data: dbInsts } = await supabase
    .from('institutions')
    .select('id, coa_code, institution_name');

  const instByCode = new Map();
  dbInsts.forEach(i => {
    if (i.coa_code) instByCode.set(i.coa_code, i);
  });
  console.log(`Loaded ${instByCode.size} institutions from database.`);

  const list2024 = parseArchive();
  console.log(`Parsed ${list2024.length} PG rows for 2024-2025.`);

  let upsertCount = 0;
  for (const item of list2024) {
    const inst = instByCode.get(item.code);
    if (!inst) {
      console.warn(`[PG 2024] Missing college for ${item.code}`);
      continue;
    }

    const years = item.years.length > 0 ? item.years : ['2024-2025'];
    for (const yr of years) {
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

      const { error: upsErr } = await supabase
        .from('institution_annual_records')
        .upsert({
          institution_id: inst.id,
          academic_year: yr,
          course_name: item.courseName,
          approved_intake: seats,
          approval_status: status,
          reviewed_at: new Date().toISOString()
        }, { onConflict: 'institution_id,academic_year,course_name' });

      if (upsErr) {
        console.error(`[PG 2024] Error for ${item.code} (${item.courseName} ${yr}):`, upsErr.message);
      } else {
        upsertCount++;
      }
    }
  }

  console.log(`\n======================================================`);
  console.log(`INGESTION COMPLETED: Upserted ${upsertCount} records for PG 2024-2025!`);

  // Final count of records in DB
  const { count: finalTotal } = await supabase
    .from('institution_annual_records')
    .select('*', { count: 'exact', head: true });

  console.log(`Total annual records in DB now: ${finalTotal}`);
  console.log(`======================================================`);
}

main();
