const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

const fetchJobRegex = /const fetchJob = async \(\) => \{[\s\S]*?fetchJob\(\);\s*\}, \[jobId\]\);/;
const replacement = \const fetchJob = async () => {
    const { data, error } = await supabase
      .from("admin_jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    if (data) {
      setFirmName(data.firm_name || "");
      setEmploymentType(data.employment_type || "Full-time");
      setWorkplaceType(data.workplace_type || "On-site");
      setOrganizationType(data.organization_type || "Firm");
      setArea(data.area || "");
      setCity(data.city || "");
      setState(data.state || "");

      if (data.positions && Array.isArray(data.positions) && data.positions.length > 0) {
        setPositions(data.positions);
      } else if (data.position) {
        setPositions([{ 
          position: data.position || "",
          salary: data.salary || "",
          description: data.job_description || "",
          experience: Array.isArray(data.experience) ? data.experience : (data.experience ? [data.experience] : []),
          completed: false
        }]);
      }

      setQualifications(data.qualifications || "");
      setSkills(data.skills_required || "");
      setPostedDate(data.posted_date || "");
      setLastDateToApply(data.last_date_to_apply || "");
      setPostExpiryDate(data.post_expiry_date || "");
      setImageUrl(data.image || "");
      
      if (data.apply_link) {
        setApplicationType("apply");
        setapply_link(data.apply_link);
      } else if (data.application_email) {
        setApplicationType("email");
        setapplication_email(data.application_email);
      }

      if (data.status === "scheduled" && data.schedule_time) {
         setScheduleTime(data.schedule_time);
         setScheduleDate(data.posted_date);
      }
    }
  };

  fetchJob();
}, [jobId]);\;

c = c.replace(fetchJobRegex, replacement);
fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('fetchJob updated');