const fs = require('fs');
let content = fs.readFileSync('app/profile/[username]/page.tsx', 'utf8');

// Add missing imports
if (!content.includes('import Link')) {
    content = content.replace('"use client";', '"use client";\n\nimport Link from "next/link";');
}
if (!content.includes('Building2')) {
    content = content.replace(
        'import {\n  Bookmark,\n  BookmarkCheck,\n} from "lucide-react";',
        'import {\n  Bookmark,\n  BookmarkCheck,\n  Building2,\n} from "lucide-react";'
    );
}
fs.writeFileSync('app/profile/[username]/page.tsx', content);