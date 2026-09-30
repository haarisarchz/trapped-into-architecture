const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const fetchAuthorLogic = `        let authorId = null;
        if (activeUser) {
           const lookupVal = activeUser.username || activeUser.email;
           const lookupField = activeUser.username ? "username" : "email";
           if (lookupVal) {
             const { data: cp } = await supabase.from("profiles").select("id").eq(lookupField, lookupVal).maybeSingle();
             if (cp) authorId = cp.id;
           }
        }
        
        const companyPayload = {`;

content = content.replace('const companyPayload = {', fetchAuthorLogic);
// Replace both instances of created_by: activeUser?.id || null
content = content.replace(/created_by: activeUser\?\.id \|\| null/g, 'created_by: authorId');

fs.writeFileSync('app/admin/add-job/page.tsx', content);
console.log("Updated created_by logic");