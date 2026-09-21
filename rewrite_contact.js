const fs = require('fs');
let code = fs.readFileSync('app/admin/contact/page.tsx', 'utf8');

// 1. Remove telegram from fetchSettings
code = code.replace(/telegram: data\.telegram \|\| "",\s*/, '');
// 2. Remove telegram from UI input
code = code.replace(/<div>\s*<label className="block text-sm font-semibold mb-1">Telegram<\/label>\s*<input type="text" value=\{settings\.telegram\} onChange=\{e => setSettings\(\{\.\.\.settings, telegram: e\.target\.value\}\)\} className="w-full px-4 py-2 border rounded-xl" placeholder="t\.me\/username" \/>\s*<\/div>/, '');

// 3. Add userRole state
if (!code.includes('userRole')) {
  code = code.replace(/const \[loading, setLoading\] = useState\(true\);/, 'const [loading, setLoading] = useState(true);\n  const [userRole, setUserRole] = useState("");');
}

// 4. Update checkAuth to set userRole
code = code.replace(/const allowedRoles = \["superadmin", "admin", "ceo"\];/, 'const roleNormalized = (profile.role || "").toLowerCase().replace(/[\\s_]+/g, "");\n    setUserRole(roleNormalized);\n    const allowedRoles = ["superadmin", "admin", "ceo"];');
code = code.replace(/allowedRoles\.includes\(\(profile\.role \|\| ""\)\.toLowerCase\(\)\.replace\(\/\[\\s_\]\+\/g, ""\)\)/, 'allowedRoles.includes(roleNormalized)');

// 5. Update handleSave to verify permissions
code = code.replace(/const handleSave = async \(e: React\.FormEvent\) => \{\s*e\.preventDefault\(\);\s*setSaving\(true\);/, 
  `const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== "superadmin" && userRole !== "ceo") {
      alert("Only CEO or Super Admin can update contact settings.");
      return;
    }
    setSaving(true);`);

// 6. Update button text
const oldButton = `<button disabled={saving} type="submit" className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50">
            {saving ? "Saving..." : "Save Settings"}
          </button>`;
const newButton = `<button disabled={saving || (userRole !== "superadmin" && userRole !== "ceo")} type="submit" className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50">
            {saving ? "Updating..." : "Update"}
          </button>`;
code = code.replace(oldButton, newButton);

fs.writeFileSync('app/admin/contact/page.tsx', code);
