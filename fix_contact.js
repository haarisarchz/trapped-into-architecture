const fs = require('fs');
let code = fs.readFileSync('app/admin/contact/page.tsx', 'utf8');

const helper = `
const LockedField = ({ label, value, onChange, type = "text" }: any) => {
  const [isEditing, setIsEditing] = useState(!value);
  const handleSave = async (e: any) => {
     e.preventDefault();
     setIsEditing(false);
  };
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center justify-between">
        <span>{label}</span>
        {value && !isEditing && (
          <button type="button" onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-black">
             ✎ Edit
          </button>
        )}
      </label>
      {isEditing ? (
        <div className="flex gap-2">
          <input type={type} value={value} onChange={onChange} className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" />
          {value && <button type="button" onClick={handleSave} className="bg-black text-white px-4 rounded-xl">Done</button>}
        </div>
      ) : (
        <div className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 truncate cursor-not-allowed select-none">
          {value || "Not Set"}
        </div>
      )}
    </div>
  );
};
`;

if (!code.includes('LockedField')) {
   code = code.replace('export default function ContactSettingsPage() {', helper + '\nexport default function ContactSettingsPage() {');
}

// Replace each input block. It looks like:
/*
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Contact Email</label>
                  <input type="email" value={settings.email} onChange={e => setSettings({...settings, email: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" placeholder="admin@trappedintoarchitecture.com" />
                </div>
*/

const replaceRegex = /<div>\s*<label[^>]*>(.*?)<\/label>\s*<input type="(.*?)" value=\{(.*?)\} onChange=\{(.*?)\}.*?\/>\s*<\/div>/g;

code = code.replace(replaceRegex, (match, label, type, value, onChange) => {
  return `<LockedField label="${label}" type="${type}" value={${value}} onChange={${onChange}} />`;
});

// For textareas
const textareaRegex = /<div>\s*<label[^>]*>(.*?)<\/label>\s*<textarea rows=\{3\} value=\{(.*?)\} onChange=\{(.*?)\}.*?><\/textarea>\s*<\/div>/g;
code = code.replace(textareaRegex, (match, label, value, onChange) => {
  return `<LockedField label="${label}" type="text" value={${value}} onChange={${onChange}} />`;
});


fs.writeFileSync('app/admin/contact/page.tsx', code);
console.log('Fixed contact page inputs');
