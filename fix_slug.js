const fs = require('fs');
let content = fs.readFileSync('app/companies/[slug]/page.tsx', 'utf8');

const regexCompanySynthesize = /company = \{\s*firm_name: representativeJob\.firm_name \|\| "Unknown Firm",[\s\S]*?\};/;

const newSynthesize = `company = {
          firm_name: representativeJob.firm_name || "Unknown Firm",
          organization_type: representativeJob.organization_type || "Firm",
          city: representativeJob.city || "",
          state: representativeJob.state || "",
          neighborhood: representativeJob.area || "",
          logo_url: representativeJob.image || "",
          company_description: "",
          website_link: "",
          contact_email: representativeJob.application_email || "",
          phone: "",
          linkedin: "",
          instagram: "",
          facebook: "",
        };`;

content = content.replace(regexCompanySynthesize, newSynthesize);
fs.writeFileSync('app/companies/[slug]/page.tsx', content);