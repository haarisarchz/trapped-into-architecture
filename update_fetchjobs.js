const fs = require('fs');
let c = fs.readFileSync('app/admin/jobs/page.tsx', 'utf-8');

const regex = /let query = supabase[\s\S]*?setJobs\(filteredJobs\);\s*\n\s*\};/;

const replacement = 'let queryAdmin = supabase.from("admin_jobs").select("*");\n' +
'    let queryLegacy = supabase.from("jobs").select("*").is("admin_post_id", null);\n' +
'    if (statusFilter && !["active", "expired"].includes(statusFilter)) {\n' +
'      queryAdmin = queryAdmin.eq("status", statusFilter);\n' +
'      queryLegacy = queryLegacy.eq("status", statusFilter);\n' +
'    }\n' +
'    const [adminRes, legacyRes] = await Promise.all([\n' +
'      queryAdmin.order("id", { ascending: false }),\n' +
'      queryLegacy.order("id", { ascending: false })\n' +
'    ]);\n' +
'    if (adminRes.error) console.log(adminRes.error);\n' +
'    if (legacyRes.error) console.log(legacyRes.error);\n' +
'    let filteredJobs = [...(adminRes.data || []), ...(legacyRes.data || [])];\n' +
'    filteredJobs.sort((a, b) => new Date(b.created_at || b.posted_date || 0).getTime() - new Date(a.created_at || a.posted_date || 0).getTime());\n' +
'    const { data: profilesData } = await supabase.from("profiles").select("id, display_name, full_name, username, role");\n' +
'    const profilesMap = {};\n' +
'    if (profilesData) {\n' +
'      profilesData.forEach(p => profilesMap[p.id] = p);\n' +
'    }\n' +
'    const roleStr = (callerProfile?.role || stored?.role || "").toLowerCase().replace(/[\\s_]+/g, "");\n' +
'    if (roleStr !== "ceo") {\n' +
'      filteredJobs = filteredJobs.filter((job) =>\n' +
'        !job.author_id || job.author_id === callerProfile?.id\n' +
'      );\n' +
'    }\n' +
'    filteredJobs = filteredJobs.map((job) => ({\n' +
'      ...job,\n' +
'      profiles: job.author_id ? profilesMap[job.author_id] : null\n' +
'    }));\n' +
'    if (statusFilter === "active") {\n' +
'      const today = new Date();\n' +
'      filteredJobs = filteredJobs.filter(\n' +
'        (job) => !job.post_expiry_date || new Date(job.post_expiry_date) >= today\n' +
'      );\n' +
'    }\n' +
'    if (statusFilter === "expired") {\n' +
'      const today = new Date();\n' +
'      filteredJobs = filteredJobs.filter(\n' +
'        (job) => job.post_expiry_date && new Date(job.post_expiry_date) < today\n' +
'      );\n' +
'    }\n' +
'    setJobs(filteredJobs);\n' +
'  };';

c = c.replace(regex, replacement);
fs.writeFileSync('app/admin/jobs/page.tsx', c);
console.log('Done fetchJobs replacement');