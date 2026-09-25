const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

// 1. Move POSITIONS & DESCRIPTIONS below LOCATION
// We find POSITIONS & DESCRIPTIONS (starts at {/* POSITIONS & DESCRIPTIONS */}) 
// up to (but not including) {/* LOCATION */}
const posMatch = c.match(/\s*\{\/\* POSITIONS & DESCRIPTIONS \*\/\}([\s\S]*?)(?=\s*\{\/\* LOCATION \*\/\})/);
if (posMatch) {
  const posBlock = posMatch[0];
  c = c.replace(posBlock, ''); // remove it from current location
  // now find QUALIFICATION and insert it right before that
  c = c.replace(/\s*\{\/\* QUALIFICATION \*\/\}/, '\n\n' + posBlock + '\n\n              {/* QUALIFICATION */}');
}

// 2. Add isPublishing state
c = c.replace(/const \[uploadingImage, setUploadingImage\] = useState\(false\);/, 'const [uploadingImage, setUploadingImage] = useState(false);\n  const [isPublishing, setIsPublishing] = useState(false);');

// 3. Update handlePublishJob to handle the transaction-like logic and isPublishing
const handlePubOld = /const handlePublishJob = async \([\s\S]*?if \(jobError\) \{\s*console\.log\("SUPABASE ERROR:", jobError\);\s*alert\(JSON\.stringify\(jobError\)\);\s*return;\s*\}/;

const handlePubNew = \const handlePublishJob = async (
    status: "draft" | "scheduled" | "published" = "published"
  ) => {
    setIsPublishing(true);
    try {
      if (status !== "draft" && firmName) {
        const { data: existingCompany } = await supabase
          .from("companies")
          .select("id")
          .ilike("firm_name", firmName.trim())
          .maybeSingle();
        if (!existingCompany) {
          const companySlug = firmName
            .toLowerCase()
            .trim()
            .replace(/\\s+/g, "-")
            .replace(/[^\\w-]+/g, "");
          const { data: newComp } = await supabase.from("companies").insert([{
              firm_name: firmName,
              slug: companySlug,
              city: city,
              state: state,
              organization_type: organizationType,
              created_by: currentUser?.id || null
            }]).select().single();
          if (newComp) currentCompanyId = newComp.id;
        }
      }

      if (status !== "draft") {
        if (uploadingImage) {
          alert("Please wait until image upload finishes");
          setIsPublishing(false);
          return;
        }
        if (!imageUrl) {
          alert("Please upload job image");
          setIsPublishing(false);
          return;
        }
      }

      if (status === "draft" && (!firmName || !positions[0]?.position)) {
        alert("Please enter at least the Company Name and Job Position to save a draft.");
        setIsPublishing(false);
        return;
      }

      if (status !== "draft" && (!firmName || !positions[0]?.position || !city || !state || !positions[0]?.description)) {
        alert("Please fill all required fields.");
        setIsPublishing(false);
        return;
      }

      const today = new Date();
      const formattedToday = today.toISOString().split("T")[0];
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 14);
      const formattedExpiry = expiry.toISOString().split("T")[0];

      let finalExpiryDate = postExpiryDate;
      if (!finalExpiryDate) {
        finalExpiryDate = formattedExpiry;
      }

      const adminPayload = {
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
        posted_date: status === "published" ? formattedToday : (status === "scheduled" ? scheduleDate : null),
        last_date_to_apply: lastDateToApply || null,
        post_expiry_date: finalExpiryDate,
        apply_link: apply_link,
        application_email: application_email,
        source: source,
        image: imageUrl,
        status: status,
        author_id: currentUser?.id || null,
        schedule_time: status === "scheduled" ? scheduleTime : null
      };

      let jobData;
      
      if (jobId) {
        // First delete old public jobs tied to this admin_post_id to avoid duplication/orphans
        if (status === "published") {
            await supabase.from("jobs").delete().eq("admin_post_id", jobId);
        }
        const { data, error } = await supabase.from("admin_jobs").update(adminPayload).eq("id", jobId).select().single();
        if (error) throw error;
        jobData = data;
      } else {
        const { data, error } = await supabase.from("admin_jobs").insert([adminPayload]).select().single();
        if (error) throw error;
        jobData = data;
      }

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
        
        const { error: jobsErr } = await supabase.from("jobs").insert(publicJobs);
        if (jobsErr) {
            // Rollback admin job if we failed to create public jobs and it's a new post
            if (!jobId) {
                await supabase.from("admin_jobs").delete().eq("id", jobData.id);
            }
            throw jobsErr;
        }
      }

      if (jobData && jobData.id) {
        setJobId(jobData.id);
        window.history.replaceState(null, "", \/admin/add-job?id=\\);
      }
    } catch (jobError) {
      console.error("SUPABASE ERROR:", jobError);
      alert(JSON.stringify(jobError));
      setIsPublishing(false);
      return;
    }
    setIsPublishing(false);
\;

c = c.replace(handlePubOld, handlePubNew);

// 4. Update the publish button to disable during isPublishing
c = c.replace(/disabled=\{uploadingImage\}/g, 'disabled={uploadingImage || isPublishing}');
c = c.replace(/\{uploadingImage \? "Uploading Image\.\.\." : "Publish Job"\}/g, '{isPublishing ? "Publishing..." : uploadingImage ? "Uploading Image..." : "Publish Job"}');

fs.writeFileSync('app/admin/add-job/page.tsx', c);