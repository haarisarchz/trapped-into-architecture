const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

c = c.replace(/position: pos\.position,\s*experience: pos\.experience,\s*salary: pos\.salary,\s*job_description: pos\.description,\s*qualifications: qualifications,\s*skills_required: skills,/, 
'position: pos.position,\\n      experience: pos.experience,\\n      salary: pos.salary,\\n      job_description: pos.role ? **Job Role:** \\\\n\\n\\ : pos.description,\\n      qualifications: sameRequirements ? qualifications : (pos.qualifications || qualifications),\\n      skills_required: sameRequirements ? skills : (pos.skills || skills),'
);

fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Fixed publish payload');