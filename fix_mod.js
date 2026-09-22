const fs = require('fs');
let code = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');
code = code.replace(
  '(jobPayload as any).moderator = currentUser.displayName || currentUser.username || currentUser.fullName || "Admin";',
  '// Removed invalid moderator field injection to prevent schema cache error'
);
fs.writeFileSync('app/admin/add-job/page.tsx', code);
