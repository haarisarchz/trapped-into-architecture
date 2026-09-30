const fs = require('fs');
let content = fs.readFileSync('app/companies/[slug]/page.tsx', 'utf8');

const regexCompanySynthesize = /company = \{\s*firm_name: representativeJob\.firm_name \|\| "Unknown Firm",[\s\S]*?\};/;

const newSynthesize = `company = {
          firm_name: representativeJob.firm_name || "Unknown Firm",
          organization_type: representativeJob.organization_type || "Firm",
          city: representativeJob.city || "",
          state: representativeJob.state || "",
          address: representativeJob.address || "",
          neighborhood: representativeJob.neighborhood || "",
          logo_url: representativeJob.logo_url || representativeJob.company_logo || representativeJob.image || "",
          company_description: representativeJob.description || "",
          website_link: representativeJob.website || "",
          contact_email: representativeJob.email || representativeJob.application_email || "",
          phone: representativeJob.phone || "",
          linkedin: representativeJob.linkedin || "",
          instagram: representativeJob.instagram || "",
          facebook: representativeJob.facebook || "",
        };`;

content = content.replace(regexCompanySynthesize, newSynthesize);
fs.writeFileSync('app/companies/[slug]/page.tsx', content);