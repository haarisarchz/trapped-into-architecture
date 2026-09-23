const fs = require('fs');

let code = fs.readFileSync('app/admin/page.tsx', 'utf8');

const oldButton = `<button
          onClick={() =>
            router.push("/")
          }
          className="border border-gray-700 rounded-2xl px-5 py-4 hover:bg-gray-800 transition"
        >
          View Website
        </button>`;

const newButton = `<button
          onClick={() => {
            window.location.href = "/";
          }}
          className="border border-gray-700 rounded-2xl px-5 py-4 hover:bg-gray-800 transition"
        >
          View Website
        </button>`;

if (code.includes(oldButton)) {
  code = code.replace(oldButton, newButton);
  fs.writeFileSync('app/admin/page.tsx', code);
  console.log("Successfully replaced button");
} else {
  console.log("Button not found. Trying regex...");
  const regex = /<button\s*onClick=\{\(\) =>\s*router\.push\("\/"\)\s*\}\s*className="border border-gray-700 rounded-2xl px-5 py-4 hover:bg-gray-800 transition"\s*>\s*View Website\s*<\/button>/m;
  if(code.match(regex)) {
    code = code.replace(regex, newButton);
    fs.writeFileSync('app/admin/page.tsx', code);
    console.log("Successfully replaced button using regex");
  } else {
    console.log("Still not found");
  }
}
