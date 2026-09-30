const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

content = content.replace(/let authorId = \(await supabase\.auth\.getUser\(\)\)\.data\.user\?\.id;\s*if \(\!authorId\) \{\s*const activeUser = JSON\.parse\(localStorage\.getItem\("currentUser"\) \|\| "null"\);\s*authorId = activeUser\?\.id \|\| null;\s*\}/g, 
  `let authorId = (await supabase.auth.getUser()).data.user?.id;
        if (!authorId) {
          alert("Your session has expired. Please log out and log back in to save securely.");
          setIsSavingCompany(false);
          setIsPublishing(false);
          return;
        }`);

fs.writeFileSync('app/admin/add-job/page.tsx', content);
console.log("Regex replace done");