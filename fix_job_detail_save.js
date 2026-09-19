const fs = require('fs');

let code = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

if (!code.includes('Bookmark')) {
  code = code.replace('import Link from "next/link";', 'import Link from "next/link";\nimport { Bookmark, BookmarkCheck } from "lucide-react";');
}

const search = `<div className="flex items-center gap-1 text-gray-700 font-semibold text-base px-2 py-1.5 transition">
                        <span className="text-xl leading-none">♡</span> {job.save_count || 0}
                      </div>`;
const replace = `<div className="flex items-center gap-1.5 text-gray-700 font-semibold text-lg px-2 py-1.5" aria-label="Save count">
                        <Bookmark size={20} className="text-gray-500" /> {job.save_count || 0}
                      </div>`;
code = code.replace(search, replace);

fs.writeFileSync('app/jobs/[id]/page.tsx', code);
console.log('Fixed job detail save icon');
