const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/edit/[id]/page.tsx', 'utf8');

const oldCheck = `          let authorId = (await supabase.auth.getUser()).data.user?.id;
          if (!authorId) {
            const user = JSON.parse(localStorage.getItem("currentUser") || "null");
            authorId = user ? user.id : null;
          }`;

const newCheck = `          let authorId = (await supabase.auth.getUser()).data.user?.id;
          if (!authorId) {
            alert("Your session has expired or is invalid. Please log out and log in again to save companies.");
            setSaving(false);
            return;
          }`;

content = content.replace(oldCheck, newCheck);
fs.writeFileSync('app/admin/companies/edit/[id]/page.tsx', content);
console.log("Updated edit page session check");