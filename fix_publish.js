const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

const regex = /let jobData = null;[\s\S]*?if \(jobsErr\) \{[\s\S]*?throw jobsErr;[\s\S]*?\}[\s\S]*?\}[\s\S]*?if \(jobData && jobData\.id\) \{/m;

const replacement = \let jobData = null;

    const publicJobs = positions.map(pos => ({
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
      posted_date: status === "published" ? formattedToday : null,
      last_date_to_apply: lastDateToApply || null,
      post_expiry_date: finalExpiryDate,
      apply_link: apply_link,
      application_email: application_email,
      source: source,
      image: imageUrl,
      status: status,
      author_id: activeUser?.id || null,
      schedule_time: status === "scheduled" ? scheduleTime : null
    }));

    if (jobId) {
      const { data, error } = await supabase.from("jobs").update(publicJobs[0]).eq("id", jobId).select().single();
      if (error) throw error;
      jobData = data;
    } else {
      const { data, error } = await supabase.from("jobs").insert(publicJobs).select();
      if (error) throw error;
      jobData = data && data.length > 0 ? data[0] : null;
    }

    if (jobData && jobData.id) {\;

c = c.replace(regex, replacement);
fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Fixed handlePublishJob');