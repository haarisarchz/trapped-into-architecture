const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const regex1 = /const activeUser = JSON\.parse\(localStorage\.getItem\("currentUser"\) \|\| "null"\);/s;
const replacement1 = `const activeUser = JSON.parse(localStorage.getItem("currentUser") || "null");
      let authorId = activeUser?.id || null;
      if (!authorId && activeUser) {
         const lookupVal = activeUser.username || activeUser.email;
         const lookupField = activeUser.username ? "username" : "email";
         if (lookupVal) {
            const { data: cp } = await supabase.from("profiles").select("id").eq(lookupField, lookupVal).maybeSingle();
            if (cp) authorId = cp.id;
         }
      }`;

content = content.replace(regex1, replacement1);

// Then replace author_id: activeUser?.id || null with author_id: authorId
content = content.replace(/author_id: activeUser\?\.id \|\| null/g, "author_id: authorId");

fs.writeFileSync('app/admin/add-job/page.tsx', content);