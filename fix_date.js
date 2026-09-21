const fs = require('fs');
let code = fs.readFileSync('components/home/InteractiveHome.tsx', 'utf8');
code = code.replace('import { formatDistanceToNow } from "date-fns";', '');
code = code.replace(
  'formatDistanceToNow(new Date(job.created_at), { addSuffix: true })',
  'new Date(job.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })'
);
fs.writeFileSync('components/home/InteractiveHome.tsx', code);
