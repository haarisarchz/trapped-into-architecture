const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const oldQ = 'const { data: jData } = await supabase.from("jobs").select("firm_name, city, state, organization_type, neighborhood, description, website, email, phone, logo_url").ilike("firm_name", "%" + q + "%").limit(10);';

const newQ = `const { data: jData } = await supabase.from("jobs").select("firm_name, city, state, organization_type, area, application_email, image").ilike("firm_name", "%" + q + "%").limit(10);
      if (jData) {
        jData.forEach(j => {
          j.neighborhood = j.area;
          j.email = j.application_email;
          j.logo_url = j.image;
        });
      }`;

content = content.replace(oldQ, newQ);
fs.writeFileSync('app/admin/add-job/page.tsx', content);