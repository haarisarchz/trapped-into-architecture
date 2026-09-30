const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const regex1 = /const activeUser = JSON\.parse\(localStorage\.getItem\("currentUser"\) \|\| "null"\);\s*let authorId = null;\s*if \(activeUser\) \{\s*const lookupVal = activeUser\.username \|\| activeUser\.email;\s*const lookupField = activeUser\.username \? "username" : "email";\s*if \(lookupVal\) \{\s*const \{ data: cp \} = await supabase\.from\("profiles"\)\.select\("id"\)\.eq\(lookupField, lookupVal\)\.maybeSingle\(\);\s*if \(cp\) authorId = cp\.id;\s*\}\s*\}/;

const replacement1 = `        let authorId = (await supabase.auth.getUser()).data.user?.id;
        if (!authorId) {
          const activeUser = JSON.parse(localStorage.getItem("currentUser") || "null");
          authorId = activeUser?.id || null;
          if (!authorId && activeUser) {
             const lookupVal = activeUser.username || activeUser.email;
             const lookupField = activeUser.username ? "username" : "email";
             if (lookupVal) {
               const { data: cp } = await supabase.from("profiles").select("id").eq(lookupField, lookupVal).maybeSingle();
               if (cp) authorId = cp.id;
             }
          }
        }`;

content = content.replace(regex1, replacement1);

const regex2 = /const activeUser = JSON\.parse\(localStorage\.getItem\("currentUser"\) \|\| "null"\);\s*let authorId = activeUser\?\.id \|\| null;\s*if \(\!authorId && activeUser\) \{\s*const lookupVal = activeUser\.username \|\| activeUser\.email;\s*const lookupField = activeUser\.username \? "username" : "email";\s*if \(lookupVal\) \{\s*const \{ data: cp \} = await supabase\.from\("profiles"\)\.select\("id"\)\.eq\(lookupField, lookupVal\)\.maybeSingle\(\);\s*if \(cp\) authorId = cp\.id;\s*\}\s*\}/;

const replacement2 = `        let authorId = (await supabase.auth.getUser()).data.user?.id;
        if (!authorId) {
          const activeUser = JSON.parse(localStorage.getItem("currentUser") || "null");
          authorId = activeUser?.id || null;
          if (!authorId && activeUser) {
             const lookupVal = activeUser.username || activeUser.email;
             const lookupField = activeUser.username ? "username" : "email";
             if (lookupVal) {
               const { data: cp } = await supabase.from("profiles").select("id").eq(lookupField, lookupVal).maybeSingle();
               if (cp) authorId = cp.id;
             }
          }
        }`;

content = content.replace(regex2, replacement2);

fs.writeFileSync('app/admin/add-job/page.tsx', content);
console.log("Updated authorId resolution");