const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const oldCheck = `          let authorId = (await supabase.auth.getUser()).data.user?.id;
          if (!authorId) {
            const activeUser = JSON.parse(localStorage.getItem("currentUser") || "null");
            authorId = activeUser?.id || null;
          }`;

const newCheck = `          let authorId = (await supabase.auth.getUser()).data.user?.id;
          if (!authorId) {
            alert("Your session has expired. Please log out and log back in to save companies securely.");
            setIsSavingCompany(false);
            return;
          }`;

// there are two instances of it in add-job/page.tsx
content = content.replace(oldCheck, newCheck);
content = content.replace(oldCheck, newCheck);
// wait, the second one might use setIsPublishing(false)
const oldCheck2 = `          let authorId = (await supabase.auth.getUser()).data.user?.id;
          if (!authorId) {
            const activeUser = JSON.parse(localStorage.getItem("currentUser") || "null");
            authorId = activeUser?.id || null;`;
// actually, let's just do a regex replace or manual replace for the second one

fs.writeFileSync('app/admin/add-job/page.tsx', content);
console.log("Updated add-job session check 1");