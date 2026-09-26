const fs = require('fs');
let content = fs.readFileSync('components/SaveButton.tsx', 'utf8');

// 1. Check saved logic
const checkSavedRegex = /if \(user && user\.id\) \{/g;
const checkSavedReplace = `
        let userId = user?.id;
        if (!userId && (user?.username || user?.email)) {
           const { data: pData } = await supabase.from('profiles').select('id').eq(user.username ? 'username' : 'email', user.username || user.email).maybeSingle();
           if (pData) userId = pData.id;
        }
        if (userId) {`;

content = content.replace(checkSavedRegex, checkSavedReplace);

// 2. Toggle save logic
const toggleSaveRegex = /if \(!user \|\| !user\.id\) \{\s*alert\("Please login first to save jobs"\);\s*return;\s*\}/s;
const toggleSaveReplace = `
    let userId = user?.id;
    if (!userId && (user?.username || user?.email)) {
       const { data: pData } = await supabase.from('profiles').select('id').eq(user.username ? 'username' : 'email', user.username || user.email).maybeSingle();
       if (pData) userId = pData.id;
    }
    
    if (!userId) {
      alert("Please login first to save jobs");
      return;
    }
`;

content = content.replace(toggleSaveRegex, toggleSaveReplace);
content = content.replace(/user\.id/g, 'userId'); // Replace usages of user.id with userId

fs.writeFileSync('components/SaveButton.tsx', content);
console.log("Success updating SaveButton");