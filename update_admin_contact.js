const fs = require('fs');
let code = fs.readFileSync('app/admin/contact/page.tsx', 'utf8');

if (!code.includes('about_history: ""')) {
  // Add to initial state
  code = code.replace(
    /about_us: "",/,
    'about_us: "",\n    about_history: "",\n    about_mission: "",'
  );
  
  // Add to fetchSettings
  code = code.replace(
    /about_us: data.about_us \|\| "",/,
    'about_us: data.about_us || "",\n        about_history: data.about_history || "",\n        about_mission: data.about_mission || "",'
  );

  // Add to UI (we will find the about_us textarea and append the others)
  const aboutUsHtml = `<textarea 
                value={settings.about_us} 
                onChange={(e) => setSettings({ ...settings, about_us: e.target.value })}
                className="w-full border rounded p-2 h-32"
                placeholder="Write about the company..."
              />
            </div>`;
            
  const newHtml = `<textarea 
                value={settings.about_us} 
                onChange={(e) => setSettings({ ...settings, about_us: e.target.value })}
                className="w-full border rounded p-2 h-32"
                placeholder="Write about the company..."
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">History</label>
              <textarea 
                value={settings.about_history} 
                onChange={(e) => setSettings({ ...settings, about_history: e.target.value })}
                className="w-full border rounded p-2 h-32"
                placeholder="Write the history..."
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Mission</label>
              <textarea 
                value={settings.about_mission} 
                onChange={(e) => setSettings({ ...settings, about_mission: e.target.value })}
                className="w-full border rounded p-2 h-32"
                placeholder="Write the mission..."
              />
            </div>`;
            
  code = code.replace(aboutUsHtml, newHtml);
  fs.writeFileSync('app/admin/contact/page.tsx', code);
  console.log('Updated admin contact page');
}
