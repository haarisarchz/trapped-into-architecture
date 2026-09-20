const fs = require('fs');

let code = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

if (!code.includes('autoPublishSocial')) {
  // 1. Add state
  code = code.replace(
    'const [uploadMode, setUploadMode] = useState(\'text\');',
    'const [uploadMode, setUploadMode] = useState(\'text\');\nconst [autoPublishSocial, setAutoPublishSocial] = useState(true);'
  );

  // 2. Fix the .insert() to .select() to get the ID, and then trigger social publish
  const insertPattern = /.from\("jobs"\)\s*\.insert\(\[([\s\S]*?)\]\)/;
  const match = code.match(insertPattern);

  if (match) {
    const originalInsert = match[0];
    const updatedInsert = originalInsert + '.select().single()';
    code = code.replace(originalInsert, updatedInsert);

    // 3. Inject social publishing API call right before success alert
    const successPattern = '\\/\\/* SUCCESS \\*\\/';
    const socialCall = `
      //* TRIGGER SOCIAL PUBLISHING */
      if (status === "published" && autoPublishSocial && data && data.id) {
        // Do not await to avoid blocking UI unnecessarily
        fetch("/api/publish/social", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ job_id: data.id })
        }).catch(err => console.error("Social publish request failed", err));
      }
    `;
    code = code.replace('//* SUCCESS */', socialCall + '\n\n//* SUCCESS */');

    // Make sure we have the "data" from the insert
    code = code.replace('const { error } = await supabase', 'const { data, error } = await supabase');
  }

  // 4. Inject UI toggle
  const toggleUI = `
    {/* SOCIAL AUTOMATION TOGGLE */}
    <div className="col-span-1 md:col-span-3 mt-6 p-6 border rounded-2xl bg-gray-50 flex items-center justify-between">
      <div>
        <h3 className="font-bold text-lg">Automatic Social Publishing</h3>
        <p className="text-gray-500 text-sm">Post to WhatsApp, Telegram, Facebook, Instagram, X, and LinkedIn</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          className="sr-only peer" 
          checked={autoPublishSocial}
          onChange={(e) => setAutoPublishSocial(e.target.checked)}
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
      </label>
    </div>
  `;

  // Inject before `<div className="mt-10 flex gap-4">` which is usually the buttons area
  const buttonsStart = '<div className="mt-10 flex gap-4">';
  if (code.includes(buttonsStart)) {
    code = code.replace(buttonsStart, toggleUI + '\n\n' + buttonsStart);
  } else {
    // try finding the publish buttons
    code = code.replace('{/* PUBLISH BUTTONS */}', toggleUI + '\n\n{/* PUBLISH BUTTONS */}');
  }

  fs.writeFileSync('app/admin/add-job/page.tsx', code);
  console.log('Fixed Add Job social automation');
}
