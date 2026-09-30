const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const regex = /setFirmName\(job\.firm_name \|\| ""\);\s*if \(job\.employment_type\)/;
const replacement = `setFirmName(job.firm_name || "");
        
        // Also fetch the company profile to load the logo and details!
        if (job.firm_name) {
          const { data: comp } = await supabase.from("companies").select("*").ilike("firm_name", job.firm_name).maybeSingle();
          if (comp) {
             setSelectedCompanyId(comp.id);
             setCompanyLogo(comp.logo_url || "");
             setCompanyDescription(comp.description || "");
             setCompanyWebsite(comp.website || "");
             setCompanyEmail(comp.email || "");
             setCompanyPhone(comp.phone || "");
             setCompanyFacebook(comp.facebook || "");
             setCompanyInstagram(comp.instagram || "");
             setCompanyLinkedin(comp.linkedin || "");
             setCompanyWhatsapp(comp.whatsapp || "");
             setCompanyTwitter(comp.twitter || "");
             setPrincipalArchitect(comp.principal_architect || "");
             setEmployeeSize(comp.employee_size?.toString() || "");
             setFoundedYear(comp.founded_year?.toString() || "");
             
             // Give the form a moment before allowing the dirty state to activate
             setTimeout(() => setIsCompanyProfileDirty(false), 200);
          }
        }

        if (job.employment_type)`;

content = content.replace(regex, replacement);

fs.writeFileSync('app/admin/add-job/page.tsx', content);
console.log("Updated add-job to load company profile when editing job");