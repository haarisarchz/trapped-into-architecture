const fs = require('fs');

let code = fs.readFileSync('app/admin/page.tsx', 'utf8');

if (!code.includes('import Link from "next/link";')) {
  code = code.replace('import { useRouter } from "next/navigation";', 'import { useRouter } from "next/navigation";\nimport Link from "next/link";');
}

const oldButton = `<button
          onClick={() => {
            window.location.href = "/";
          }}
          className="border border-gray-700 rounded-2xl px-5 py-4 hover:bg-gray-800 transition"
        >
          View Website
        </button>`;

const newButton = `<Link
          href="/"
          className="border border-gray-700 rounded-2xl px-5 py-4 hover:bg-gray-800 transition text-center block w-full"
        >
          View Website
        </Link>`;

if (code.includes(oldButton)) {
  code = code.replace(oldButton, newButton);
  fs.writeFileSync('app/admin/page.tsx', code);
  console.log("Successfully replaced button with Link");
} else {
  console.log("Button not found.");
}
