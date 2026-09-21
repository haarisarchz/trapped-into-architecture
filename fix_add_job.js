const fs = require('fs');
let code = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const oldCompanyCheckRegex = /\/\/\s*STEP 1 - COMPANY CHECK[\s\S]*?\/\/\s*=====================================================/;

const newCompanyCheck = `// STEP 1 - COMPANY CHECK
  // =====================================================
  let finalCompanyId = null;
  if (firmName) {
    const { data: existingCompany } = await supabase
      .from("companies")
      .select("id")
      .ilike("firm_name", firmName.trim())
      .maybeSingle();

    if (existingCompany && existingCompany.id) {
      finalCompanyId = existingCompany.id;
    } else {
      const companySlug = firmName
        .toLowerCase()
        .trim()
        .replace(/\\s+/g, "-")
        .replace(/[^\\w-]+/g, "");
        
      const { data: newCompany, error: compErr } = await supabase.from("companies").insert([
        {
          firm_name: firmName.trim(),
          slug: companySlug,
          city: city,
          state: state,
          organization_type: organizationType,
        },
      ]).select('id').single();
      
      if (newCompany && newCompany.id) {
        finalCompanyId = newCompany.id;
      }
    }
  }
  // =====================================================`;

code = code.replace(oldCompanyCheckRegex, newCompanyCheck);

const oldJobPayloadRegex = /const jobPayload = \{[\s\S]*?status: status,\n\s*\};/;
const match = code.match(oldJobPayloadRegex);

if (match) {
  let jobPayload = match[0];
  if (!jobPayload.includes('company_id: finalCompanyId')) {
    jobPayload = jobPayload.replace(/status: status,/, 'status: status,\n    company_id: finalCompanyId,');
    code = code.replace(oldJobPayloadRegex, jobPayload);
  }
}

fs.writeFileSync('app/admin/add-job/page.tsx', code);
console.log('Fixed company association in add job');
