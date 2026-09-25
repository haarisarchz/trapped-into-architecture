const fs = require("fs");
let content = fs.readFileSync("app/admin/add-job/page.tsx", "utf-8");

content = content.replace(/!position/g, "!positions[0]?.position");
content = content.replace(/!jobDescription/g, "!positions[0]?.description");
content = content.replace(/position \?/g, "positions[0]?.position ?");

content = content.replace(/const adminPayload = \{[\s\S]*?author_id: currentUser\?\.id \|\| null,\r?\n\s*\};/m, `const adminPayload = {
    firm_name: firmName,
    company_id: currentCompanyId,
    employment_type: employmentType,
    workplace_type: workplaceType,
    area: area,
    city: city,
    state: state,
    positions: positions,
    qualifications: qualifications,
    skills_required: skills,
    posted_date: status === "published" ? formattedToday : null,
    scheduled_date: status === "scheduled" ? \`\${scheduleDate} \${scheduleTime}\` : null,
    last_date_to_apply: lastDateToApply || null,
    post_expiry_date: finalExpiryDate,
    apply_link: apply_link,
    application_email: application_email,
    source: source,
    image: imageUrl,
    status: status,
    author_id: currentUser?.id || null,
  };`);

content = content.replace(/const res = await supabase\.from\("jobs"\)\.update\(jobPayload\)[\s\S]*?jobError = res\.error;\r?\n\s*\}/m, `// TODO: Multi-position updates if jobId exists
    const res = await supabase.from("admin_jobs").update(adminPayload).eq("id", jobId).select().single();
    jobData = res.data;
    jobError = res.error;
  } else {
    const res = await supabase.from("admin_jobs").insert([adminPayload]).select().single();
    jobData = res.data;
    jobError = res.error;
    
    if (jobData && jobData.id && status === "published") {
      const publicJobs = positions.map(pos => ({
        admin_post_id: jobData.id,
        firm_name: firmName,
        company_id: currentCompanyId,
        employment_type: employmentType,
        workplace_type: workplaceType,
        area: area,
        city: city,
        state: state,
        position: pos.position,
        experience: pos.experience,
        salary: pos.salary,
        job_description: pos.description,
        qualifications: qualifications,
        skills_required: skills,
        posted_date: formattedToday,
        last_date_to_apply: lastDateToApply || null,
        post_expiry_date: finalExpiryDate,
        apply_link: apply_link,
        application_email: application_email,
        source: source,
        image: imageUrl,
        status: status,
        author_id: currentUser?.id || null
      }));
      await supabase.from("jobs").insert(publicJobs);
    }
    
    if (jobData && jobData.id) {
      setJobId(jobData.id);
      window.history.replaceState(null, "", \`/admin/add-job?id=\${jobData.id}\`);
    }
  }`);

fs.writeFileSync("app/admin/add-job/page.tsx", content);
