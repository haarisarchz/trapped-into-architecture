const fs = require('fs');
let code = fs.readFileSync('app/admin/contact/page.tsx', 'utf8');

// 1. Fix LockedField's Supabase update to use id = 'global'
code = code.replace(
  "const { error } = await supabase.from('site_settings').update({ [fieldKey]: localValue }).eq('id', 1);",
  "const { error } = await supabase.from('site_settings').update({ [fieldKey]: localValue }).eq('id', 'global');"
);

// 2. Remove <form onSubmit={handleSave} className="space-y-8"> and replace with <div className="space-y-8">
code = code.replace(
  /<form onSubmit=\{handleSave\} className="space-y-8">/,
  '<div className="space-y-8">'
);
code = code.replace(
  /<\/form>\s*<\/div>\s*<Footer \/>/,
  '</div>\n      </div>\n      <Footer />'
);

// 3. Remove old handleSave from ContactSettingsPage
const oldHandleSaveRegex = /const handleSave = async \(e: React\.FormEvent\) => \{[\s\S]*?fetchSettings\(\); \/\/ Refresh\n    \}\n  \};/m;
code = code.replace(oldHandleSaveRegex, '');

fs.writeFileSync('app/admin/contact/page.tsx', code);
console.log('Fixed Contact page DB save ID and removed form tag');
