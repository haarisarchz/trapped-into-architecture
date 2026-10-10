const fs = require('fs');

let content = fs.readFileSync('app/admin/contact/page.tsx', 'utf8');

if (content.startsWith('import Link from "next/link";\n"use client";')) {
    content = content.replace('import Link from "next/link";\n"use client";', '"use client";\nimport Link from "next/link";');
    fs.writeFileSync('app/admin/contact/page.tsx', content);
    console.log("Fixed use client order");
}
