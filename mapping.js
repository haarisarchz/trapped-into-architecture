const fs = require('fs');
let code = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const parseBlock = `      const ai = typeof result.result === "string" ? JSON.parse(result.result) : (result.result || result);

      // Normalization helpers
      const normEmp = (e) => {
        if(!e) return "";
        const low = e.toLowerCase().replace(/[^a-z]/g, '');
        if(low.includes('full')) return 'Full-time';
        if(low.includes('part')) return 'Part-time';
        if(low.includes('contract')) return 'Contract';
        if(low.includes('temp')) return 'Temporary';
        if(low.includes('free')) return 'Freelance';
        if(low.includes('intern')) return 'Internship';
        return "";
      };
      
      const normWork = (w) => {
        if(!w) return "";
        const low = w.toLowerCase().replace(/[^a-z]/g, '');
        if(low.includes('remot') || low.includes('wfh') || low.includes('home')) return 'Remote / Work from Home';
        if(low.includes('hyb')) return 'Hybrid';
        if(low.includes('site') || low.includes('office')) return 'On-site';
        return "";
      };

      // Preview
      setFirmName(ai.company || ai.firm_name || "");
      setOrganizationType(ai.organization_type || "");
      
      setCity(ai.city || "");
      setState(ai.state || "");

      setPosition(ai.position || ai.job_title || "");

      // Handle experience carefully (frontend expects array or string?)
      if (Array.isArray(ai.experience)) setSelectedExperience(ai.experience);
      else if (ai.experience) setSelectedExperience([ai.experience]);

      if (ai.employmentType || ai.employment_type) setEmploymentType(normEmp(ai.employmentType || ai.employment_type));
      if (ai.workplaceType || ai.workplace_type) setWorkplaceType(normWork(ai.workplaceType || ai.workplace_type));

      setJobDescription(ai.description || ai.job_description || "");

      setLastDateToApply(ai.deadline || ai.application_deadline || "");

      setapplication_email(ai.applicationEmail || ai.application_email || ai.email || "");
      setapply_link(ai.apply_link || ai.website || ai.website_url || "");
      if(ai.phone || ai.contact_phone) setCompanyPhone(ai.phone || ai.contact_phone);

      setLoadingAI("done");`;

const oldParseStart = 'const ai = typeof result.result === "string" ? JSON.parse(result.result) : (result.result || result);';
const oldParseEnd = 'setLoadingAI("done");';
const oldParseBlock = code.substring(code.indexOf(oldParseStart), code.indexOf(oldParseEnd) + oldParseEnd.length);

code = code.replace(oldParseBlock, parseBlock);

// Also replace the alert("Extraction Failed") with the actual error message
code = code.replace(/alert\(\"Extraction Failed\"\);/g, 'alert(err.message || \"Extraction Failed\");');

fs.writeFileSync('app/admin/add-job/page.tsx', code);
console.log('Fixed mapping and normalization');
