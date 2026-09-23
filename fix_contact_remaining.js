const fs = require('fs');
let code = fs.readFileSync('app/admin/contact/page.tsx', 'utf8');

// I will just manually replace the remaining ones
code = code.replace(
  `<div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Direct WhatsApp Number</label>
                  <p className="text-xs text-gray-500 mb-2">Number used for direct WhatsApp chats (e.g. 918608609661)</p>
                  <input type="text" value={settings.whatsapp} onChange={e => setSettings({...settings, whatsapp: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition" placeholder="918608609661" />
                </div>`,
  `<LockedField label="Direct WhatsApp Number" type="text" value={settings.whatsapp} onChange={e => setSettings({...settings, whatsapp: e.target.value})} />`
);

code = code.replace(
  `<div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Contact Address</label>
                  <textarea value={settings.contact_address} onChange={e => setSettings({...settings, contact_address: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition resize-y min-h-[100px]" placeholder="Full office address"></textarea>
                </div>`,
  `<LockedField label="Contact Address" type="text" value={settings.contact_address} onChange={e => setSettings({...settings, contact_address: e.target.value})} />`
);

code = code.replace(
  `<div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">WhatsApp Channel URL</label>
                  <p className="text-xs text-gray-500 mb-2">Used for the floating social icon</p>
                  <input type="url" value={settings.whatsapp_channel_url} onChange={e => setSettings({...settings, whatsapp_channel_url: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition" placeholder="https://whatsapp.com/channel/..." />
                </div>`,
  `<LockedField label="WhatsApp Channel URL" type="url" value={settings.whatsapp_channel_url} onChange={e => setSettings({...settings, whatsapp_channel_url: e.target.value})} />`
);

// We should also replace the about_us textareas.
code = code.replace(
  `<div>
              <label className="block text-sm font-bold text-gray-700 mb-1">About Us Statement</label>
              <textarea value={settings.about_us} onChange={e => setSettings({...settings, about_us: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition min-h-[120px]" placeholder="Brief introduction about the platform..."></textarea>
            </div>`,
  `<LockedField label="About Us Statement" type="text" value={settings.about_us} onChange={e => setSettings({...settings, about_us: e.target.value})} />`
);
code = code.replace(
  `<div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Our History</label>
              <textarea value={settings.about_history} onChange={e => setSettings({...settings, about_history: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition min-h-[120px]" placeholder="How it started..."></textarea>
            </div>`,
  `<LockedField label="Our History" type="text" value={settings.about_history} onChange={e => setSettings({...settings, about_history: e.target.value})} />`
);
code = code.replace(
  `<div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Our Mission</label>
              <textarea value={settings.about_mission} onChange={e => setSettings({...settings, about_mission: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition min-h-[120px]" placeholder="Our goal and mission..."></textarea>
            </div>`,
  `<LockedField label="Our Mission" type="text" value={settings.about_mission} onChange={e => setSettings({...settings, about_mission: e.target.value})} />`
);

fs.writeFileSync('app/admin/contact/page.tsx', code);
console.log('Fixed remaining inputs');
