const fs = require('fs');
let code = fs.readFileSync('app/admin/contact/page.tsx', 'utf8');

const oldButton = `<button disabled={saving} type="submit" className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50">
            {saving ? "Updating..." : "Update"}
          </button>`;
const newButton = `<button disabled={saving || (userRole !== "superadmin" && userRole !== "ceo")} type="submit" className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50">
            {saving ? "Updating..." : "Update"}
          </button>`;

code = code.replace(oldButton, newButton);
fs.writeFileSync('app/admin/contact/page.tsx', code);
