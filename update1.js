const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

const regex = /let currentCompanyId = null;[\s\S]*?currentCompanyId = existingCompany.id;\s*\n\s*}\n\s*}/;

const newCompanyLogic = \let currentCompanyId = selectedCompanyId;
    
    if (status !== "draft" && firmName) {
      const companyPayload = {
        firm_name: firmName,
        city: city,
        state: state,
        neighborhood: area,
        organization_type: organizationType,
        logo_url: companyLogo,
        description: companyDescription,
        website: companyWebsite,
        email: companyEmail,
        phone: companyPhone,
        facebook: companyFacebook,
        instagram: companyInstagram,
        linkedin: companyLinkedin,
        principal_architect: principalArchitect,
        employee_size: employeeSize,
        founded_year: foundedYear ? parseInt(foundedYear) : null
      };

      if (currentCompanyId) {
        if (isCompanyProfileDirty) {
          await supabase.from("companies").update(companyPayload).eq("id", currentCompanyId);
          setIsCompanyProfileDirty(false);
        }
      } else {
        const { data: existingCompany } = await supabase
          .from("companies")
          .select("id")
          .ilike("firm_name", firmName.trim())
          .maybeSingle();

        if (!existingCompany) {
          const companySlug = firmName.toLowerCase().trim().replace(/\\s+/g, "-").replace(/[^\\w-]+/g, "");
          const { data: newComp } = await supabase.from("companies").insert([
            { ...companyPayload, slug: companySlug, created_by: currentUser?.id || null }
          ]).select().single();
          if (newComp) currentCompanyId = newComp.id;
        } else {
          currentCompanyId = existingCompany.id;
          if (isCompanyProfileDirty) {
            await supabase.from("companies").update(companyPayload).eq("id", currentCompanyId);
            setIsCompanyProfileDirty(false);
          }
        }
      }
    }\;

c = c.replace(regex, newCompanyLogic);
fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Replaced company logic');