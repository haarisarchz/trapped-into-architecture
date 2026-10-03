const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const startIndex = file.indexOf('const fetchJob = async () => {');
const endIndex = file.indexOf('fetchJob();', startIndex);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find fetchJob block.");
  process.exit(1);
}

const replacement = `const fetchJob = async () => {
      const { data: job, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .single();
  
      if (error) {
        console.log(error);
        return;
      }
  
      if (job) {
        let query = supabase.from("jobs").select("*")
          .eq("firm_name", job.firm_name)
          .eq("status", job.status);
        
        if (job.posted_date) query = query.eq("posted_date", job.posted_date);
        else query = query.is("posted_date", null);
  
        if (job.image) query = query.eq("image", job.image);
        
        const { data: siblings } = await query;
        const validSiblings = siblings && siblings.length > 0 ? siblings : [job];
        setInitialJobIds(validSiblings.map(s => s.id));
  
        setFirmName(job.firm_name || "");
          
          if (job.firm_name) {
            const { data: comp } = await supabase.from("companies").select("*").ilike("firm_name", job.firm_name).maybeSingle();
            if (comp) {
               setSelectedCompanyId(comp.id);
               setCompanyLogo(comp.logo_url || "");
               setCompanyAddress(comp.address || "");
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
               setTimeout(() => setIsCompanyProfileDirty(false), 200);
            }
          }
  
        if (job.employment_type) setEmploymentType(job.employment_type);
        if (job.workplace_type) setWorkplaceType(job.workplace_type);
        setOrganizationType(job.organization_type || "Firm");
        setArea(job.area || "");
        setCity(job.city || "");
        setState(job.state || "");
        setSource(job.source || "");
  
        let distinctReqs = false;
        if (validSiblings.length > 1) {
            const firstQual = Array.isArray(validSiblings[0].qualifications) ? validSiblings[0].qualifications.join(", ") : (validSiblings[0].qualifications || "");
            const firstSkills = JSON.stringify(Array.isArray(validSiblings[0].skills_required) ? validSiblings[0].skills_required : (validSiblings[0].skills_required ? [validSiblings[0].skills_required] : []));
            for (let i = 1; i < validSiblings.length; i++) {
                const q = Array.isArray(validSiblings[i].qualifications) ? validSiblings[i].qualifications.join(", ") : (validSiblings[i].qualifications || "");
                const s = JSON.stringify(Array.isArray(validSiblings[i].skills_required) ? validSiblings[i].skills_required : (validSiblings[i].skills_required ? [validSiblings[i].skills_required] : []));
                if (q !== firstQual || s !== firstSkills) {
                    distinctReqs = true;
                    break;
                }
            }
        }
        if (distinctReqs) setSameRequirements(false);

        setPositions(validSiblings.map(s => {
           let rRole = "";
           let rDesc = s.job_description || "";
           if (rDesc.startsWith("**Job Role:**")) {
             const lines = rDesc.split("\\n\\n");
             if (lines.length > 1) {
               rRole = lines[0].replace("**Job Role:**", "").trim();
               rDesc = lines.slice(1).join("\\n\\n");
             }
           }
           
           let rVacancies = "";
           if (rDesc.includes("**Number of Positions:**")) {
               const lines = rDesc.split("\\n\\n");
               const vLine = lines.find(l => l.startsWith("**Number of Positions:**"));
               if (vLine) {
                   rVacancies = vLine.replace("**Number of Positions:**", "").trim();
                   rDesc = lines.filter(l => !l.startsWith("**Number of Positions:**")).join("\\n\\n");
               }
           }

           return {
             id: s.id,
             position: s.position || "",
             role: rRole,
             vacancies: rVacancies,
             salary: s.salary || "",
             description: rDesc,
             experience: Array.isArray(s.experience) ? s.experience : (s.experience ? [s.experience] : []),
             qualifications: Array.isArray(s.qualifications) ? s.qualifications.join(", ") : (s.qualifications || ""), 
             skills: Array.isArray(s.skills_required) ? s.skills_required : (s.skills_required ? [s.skills_required] : []),
             completed: false
           };
        }));
  
        setQualifications(Array.isArray(job.qualifications) ? job.qualifications : (job.qualifications ? [job.qualifications] : []));
        setSkills(Array.isArray(job.skills_required) ? job.skills_required : (job.skills_required ? [job.skills_required] : []));
        setPostedDate(job.posted_date || "");
        setLastDateToApply(job.last_date_to_apply || "");
        setPostExpiryDate(job.post_expiry_date || "");
        setImageUrl(job.image || "");
        
        if (job.apply_link && job.apply_link.trim() !== "") {
            setApplicationType("apply");
            setapply_link(job.apply_link);
          } else if (job.application_email && job.application_email.trim() !== "") {
            setApplicationType("email");
            setapplication_email(job.application_email);
          } else {
            setApplicationType("apply");
            setapply_link("");
          }
  
        if (job.status === "scheduled" && job.posted_date) {
           const d = new Date(job.posted_date);
           if (!isNaN(d.getTime())) {
               const tzOffset = d.getTimezoneOffset() * 60000;
               const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, -1);
               const parts = localISOTime.split("T");
               setScheduleDate(parts[0]);
               setScheduleTime(parts[1].substring(0, 5));
           }
        }
      }
    };
    
    `;

const newFile = file.substring(0, startIndex) + replacement + file.substring(endIndex);
fs.writeFileSync('app/admin/add-job/page.tsx', newFile);
console.log("Successfully rewrote fetchJob!");
