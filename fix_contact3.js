const fs = require('fs');
let code = fs.readFileSync('app/admin/contact/page.tsx', 'utf8');

const newLockedField = `const LockedField = ({ label, value, onChange, fieldKey, type = "text", subLabel, isTextarea = false }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSave = async (e: any) => {
     e.preventDefault();
     if (!fieldKey) {
        setIsEditing(false);
        if (onChange) onChange(localValue);
        return;
     }
     setSaving(true);
     const { error } = await supabase.from('site_settings').update({ [fieldKey]: localValue }).eq('id', 1);
     setSaving(false);
     if (error) {
       alert("Failed to save: " + error.message);
       return;
     }
     if (onChange) onChange(localValue);
     setIsEditing(false);
  };
  
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center justify-between">
        <span>{label}</span>
        {!isEditing && (
          <button type="button" onClick={() => setIsEditing(true)} className="text-blue-500 hover:text-blue-700 text-xs font-semibold">
             ✎ Edit
          </button>
        )}
      </label>
      {subLabel && <p className="text-xs text-gray-400 mb-2">{subLabel}</p>}
      
      {isEditing ? (
        <div className="flex flex-col sm:flex-row gap-2">
          {isTextarea ? (
             <textarea value={localValue} onChange={e => setLocalValue(e.target.value)} className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black min-h-[100px]" />
          ) : (
             <input type={type} value={localValue} onChange={e => setLocalValue(e.target.value)} className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" />
          )}
          <button type="button" onClick={handleSave} disabled={saving} className="bg-black text-white px-6 py-2 sm:py-0 rounded-xl disabled:opacity-50 font-medium shrink-0 h-[46px] sm:self-start">
            {saving ? '...' : 'Done'}
          </button>
        </div>
      ) : (
        <div className={\`w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed select-none \${isTextarea ? 'whitespace-pre-wrap min-h-[100px]' : 'truncate'}\`}>
          {localValue || "Not Set"}
        </div>
      )}
    </div>
  );
};
`;

code = code.replace(/const LockedField = \(\{[\s\S]*?^export default function ContactSettingsPage/m, newLockedField + '\nexport default function ContactSettingsPage');

// Now we need to fix the HTML inside ContactSettingsPage to use this new LockedField for WhatsApp, Address, WhatsApp Channel, About Us, History, Mission
const wNumberHtml = `<div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Direct WhatsApp Number</label>
                  <p className="text-xs text-gray-400 mb-2">Number used for direct WhatsApp chats (e.g. 918608609661)</p>
                  <input type="text" value={settings.whatsapp} onChange={e => setSettings({...settings, whatsapp: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition" placeholder="918608609661" />
                </div>`;
code = code.replace(wNumberHtml, `<LockedField label="Direct WhatsApp Number" subLabel="Number used for direct WhatsApp chats (e.g. 918608609661)" type="text" fieldKey="whatsapp" value={settings.whatsapp} onChange={(val: string) => setSettings({...settings, whatsapp: val})} />`);

const addrHtml = `<div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Contact Address</label>
                  <textarea value={settings.contact_address} onChange={e => setSettings({...settings, contact_address: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition min-h-[100px]" placeholder="123 Architecture Lane, City..." />
                </div>`;
code = code.replace(addrHtml, `<LockedField label="Contact Address" isTextarea={true} fieldKey="contact_address" value={settings.contact_address} onChange={(val: string) => setSettings({...settings, contact_address: val})} />`);

const wChannelHtml = `<div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">WhatsApp Channel URL</label>
                  <p className="text-xs text-gray-400 mb-2">Public channel link (NOT your direct WhatsApp number)</p>
                  <input type="url" value={settings.whatsapp_channel_url} onChange={e => setSettings({...settings, whatsapp_channel_url: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition" placeholder="https://whatsapp.com/channel/..." />
                </div>`;
code = code.replace(wChannelHtml, `<LockedField label="WhatsApp Channel URL" subLabel="Public channel link (NOT your direct WhatsApp number)" type="url" fieldKey="whatsapp_channel_url" value={settings.whatsapp_channel_url} onChange={(val: string) => setSettings({...settings, whatsapp_channel_url: val})} />`);

const aboutHtml = `<div>
              <label className="block text-sm font-bold text-gray-700 mb-2">About Us</label>
              <textarea 
                value={settings.about_us} 
                onChange={e => setSettings({...settings, about_us: e.target.value})} 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl min-h-[160px] focus:outline-none focus:ring-2 focus:ring-black transition" 
                placeholder="Enter the public About Us text..." 
              />
            </div>`;
code = code.replace(aboutHtml, `<LockedField label="About Us" isTextarea={true} fieldKey="about_us" value={settings.about_us} onChange={(val: string) => setSettings({...settings, about_us: val})} />`);

const historyHtml = `<div>
              <label className="block text-sm font-bold text-gray-700 mb-2">History</label>
              <textarea 
                value={settings.about_history} 
                onChange={e => setSettings({...settings, about_history: e.target.value})} 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl min-h-[160px] focus:outline-none focus:ring-2 focus:ring-black transition" 
                placeholder="Enter organization history..." 
              />
            </div>`;
code = code.replace(historyHtml, `<LockedField label="History" isTextarea={true} fieldKey="about_history" value={settings.about_history} onChange={(val: string) => setSettings({...settings, about_history: val})} />`);

const missionHtml = `<div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Mission</label>
              <textarea 
                value={settings.about_mission} 
                onChange={e => setSettings({...settings, about_mission: e.target.value})} 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl min-h-[160px] focus:outline-none focus:ring-2 focus:ring-black transition" 
                placeholder="Enter organization mission..." 
              />
            </div>`;
code = code.replace(missionHtml, `<LockedField label="Mission" isTextarea={true} fieldKey="about_mission" value={settings.about_mission} onChange={(val: string) => setSettings({...settings, about_mission: val})} />`);

// Remove "Or enter Logo URL directly:" input box because that should be a locked field too?
// No, the prompt specifically listed the text fields. I will leave the Logo upload as it is because it's a visual uploader.

fs.writeFileSync('app/admin/contact/page.tsx', code);
console.log('Fixed Contact fields completely');
