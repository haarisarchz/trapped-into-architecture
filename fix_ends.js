const fs = require('fs');
let c = fs.readFileSync('app/admin/activity/page.tsx', 'utf-8');

c = c.replace(
  /if \\(datePreset === "this_month"\\) \\{\r?\n\s*start = new Date\\(now.getFullYear\\(\\), now.getMonth\\(\\), 1\\).toISOString\\(\\).split\\('T'\\)\\[0\\];\r?\n\s*\\} else if \\(datePreset === "previous_month"\\)/g,
  \if (datePreset === "this_month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    } else if (datePreset === "previous_month")\
);

c = c.replace(
  /\} else if \\(datePreset === "last_3_months"\\) \{\r?\n\s*start = new Date\\(now.getFullYear\\(\\), now.getMonth\\(\\) - 2, 1\\).toISOString\\(\\).split\\('T'\\)\\[0\\];\r?\n\s*\} else if \\(datePreset === "last_6_months"\\)/g,
  \} else if (datePreset === "last_3_months") {
      start = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().split('T')[0];
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    } else if (datePreset === "last_6_months")\
);

c = c.replace(
  /\} else if \\(datePreset === "last_6_months"\\) \{\r?\n\s*start = new Date\\(now.getFullYear\\(\\), now.getMonth\\(\\) - 5, 1\\).toISOString\\(\\).split\\('T'\\)\\[0\\];\r?\n\s*\} else if \\(datePreset === "last_1_year"\\)/g,
  \} else if (datePreset === "last_6_months") {
      start = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().split('T')[0];
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    } else if (datePreset === "last_1_year")\
);

c = c.replace(
  /\} else if \\(datePreset === "last_1_year"\\) \{\r?\n\s*start = new Date\\(now.getFullYear\\(\\) - 1, now.getMonth\\(\\), 1\\).toISOString\\(\\).split\\('T'\\)\\[0\\];\r?\n\s*\} else if \\(datePreset === "lifetime"\\)/g,
  \} else if (datePreset === "last_1_year") {
      start = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1).toISOString().split('T')[0];
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    } else if (datePreset === "lifetime")\
);

fs.writeFileSync('app/admin/activity/page.tsx', c);
