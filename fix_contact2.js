const fs = require('fs');
let code = fs.readFileSync('app/admin/contact/page.tsx', 'utf8');

// Replace LockedField
const newLockedField = `const LockedField = ({ label, value, onChange, fieldKey, type = "text" }: any) => {
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
          <button type="button" onClick={() => setIsEditing(true)} className="text-blue-500 hover:text-blue-700 text-xs">
             ✎ Edit
          </button>
        )}
      </label>
      {isEditing ? (
        <div className="flex gap-2">
          <input type={type} value={localValue} onChange={e => setLocalValue(e.target.value)} className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" />
          <button type="button" onClick={handleSave} disabled={saving} className="bg-black text-white px-4 rounded-xl disabled:opacity-50">
            {saving ? '...' : 'Done'}
          </button>
        </div>
      ) : (
        <div className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 truncate cursor-not-allowed select-none">
          {localValue || "Not Set"}
        </div>
      )}
    </div>
  );
};`;

code = code.replace(/const LockedField = \(\{ label, value, onChange, type = "text" \}: any\) => \{[\s\S]*?^export default function ContactSettingsPage\(\) \{/m, newLockedField + '\n\nexport default function ContactSettingsPage() {');

// Inject fieldKey into all LockedField usages
code = code.replace(/<LockedField label="Contact Email".*?onChange=\{e => setSettings\(\{\.\.\.settings, email: e\.target\.value\}\)\}.*?\/>/, '<LockedField label="Contact Email" type="email" fieldKey="email" value={settings.email} onChange={(val: string) => setSettings({...settings, email: val})} />');
code = code.replace(/<LockedField label="Contact Phone".*?onChange=\{e => setSettings\(\{\.\.\.settings, phone: e\.target\.value\}\)\}.*?\/>/, '<LockedField label="Contact Phone" type="text" fieldKey="phone" value={settings.phone} onChange={(val: string) => setSettings({...settings, phone: val})} />');
code = code.replace(/<LockedField label="Direct WhatsApp Number".*?onChange=\{e => setSettings\(\{\.\.\.settings, whatsapp: e\.target\.value\}\)\}.*?\/>/, '<LockedField label="Direct WhatsApp Number" type="text" fieldKey="whatsapp" value={settings.whatsapp} onChange={(val: string) => setSettings({...settings, whatsapp: val})} />');
code = code.replace(/<LockedField label="Contact Address".*?onChange=\{e => setSettings\(\{\.\.\.settings, contact_address: e\.target\.value\}\)\}.*?\/>/, '<LockedField label="Contact Address" type="text" fieldKey="contact_address" value={settings.contact_address} onChange={(val: string) => setSettings({...settings, contact_address: val})} />');
code = code.replace(/<LockedField label="WhatsApp Channel URL".*?onChange=\{e => setSettings\(\{\.\.\.settings, whatsapp_channel_url: e\.target\.value\}\)\}.*?\/>/, '<LockedField label="WhatsApp Channel URL" type="url" fieldKey="whatsapp_channel_url" value={settings.whatsapp_channel_url} onChange={(val: string) => setSettings({...settings, whatsapp_channel_url: val})} />');
code = code.replace(/<LockedField label="Facebook Page URL".*?onChange=\{e => setSettings\(\{\.\.\.settings, facebook: e\.target\.value\}\)\}.*?\/>/, '<LockedField label="Facebook Page URL" type="url" fieldKey="facebook" value={settings.facebook} onChange={(val: string) => setSettings({...settings, facebook: val})} />');
code = code.replace(/<LockedField label="X \/ Twitter URL".*?onChange=\{e => setSettings\(\{\.\.\.settings, twitter: e\.target\.value\}\)\}.*?\/>/, '<LockedField label="X / Twitter URL" type="url" fieldKey="twitter" value={settings.twitter} onChange={(val: string) => setSettings({...settings, twitter: val})} />');
code = code.replace(/<LockedField label="Instagram URL".*?onChange=\{e => setSettings\(\{\.\.\.settings, instagram: e\.target\.value\}\)\}.*?\/>/, '<LockedField label="Instagram URL" type="url" fieldKey="instagram" value={settings.instagram} onChange={(val: string) => setSettings({...settings, instagram: val})} />');
code = code.replace(/<LockedField label="LinkedIn URL".*?onChange=\{e => setSettings\(\{\.\.\.settings, linkedin: e\.target\.value\}\)\}.*?\/>/, '<LockedField label="LinkedIn URL" type="url" fieldKey="linkedin" value={settings.linkedin} onChange={(val: string) => setSettings({...settings, linkedin: val})} />');
code = code.replace(/<LockedField label="About Us Statement".*?onChange=\{e => setSettings\(\{\.\.\.settings, about_us: e\.target\.value\}\)\}.*?\/>/, '<LockedField label="About Us Statement" type="text" fieldKey="about_us" value={settings.about_us} onChange={(val: string) => setSettings({...settings, about_us: val})} />');
code = code.replace(/<LockedField label="Our History".*?onChange=\{e => setSettings\(\{\.\.\.settings, about_history: e\.target\.value\}\)\}.*?\/>/, '<LockedField label="Our History" type="text" fieldKey="about_history" value={settings.about_history} onChange={(val: string) => setSettings({...settings, about_history: val})} />');
code = code.replace(/<LockedField label="Our Mission".*?onChange=\{e => setSettings\(\{\.\.\.settings, about_mission: e\.target\.value\}\)\}.*?\/>/, '<LockedField label="Our Mission" type="text" fieldKey="about_mission" value={settings.about_mission} onChange={(val: string) => setSettings({...settings, about_mission: val})} />');

// Remove the global save button
const globalSaveRegex = /<div className="pt-6 border-t border-gray-200 flex justify-end">[\s\S]*?<\/div>/;
code = code.replace(globalSaveRegex, '');

fs.writeFileSync('app/admin/contact/page.tsx', code);
console.log('Fixed Contact page to save individually');
