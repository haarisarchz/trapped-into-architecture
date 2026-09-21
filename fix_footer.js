const fs = require('fs');
let code = fs.readFileSync('components/Footer.tsx', 'utf8');

const fetchHtml = `  const [settings, setSettings] = useState<any>(null);
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { supabase } = require('@/lib/supabase');
        const { data } = await supabase.from('site_settings').select('*').eq('id', 'global').maybeSingle();
        if(data) setSettings(data);
      } catch(e) {}
    };
    fetchSettings();
  }, []);`;
  
if (!code.includes('site_settings')) {
  code = code.replace(/const \[username, setUsername\] = useState\(\"\"\);/, 'const [username, setUsername] = useState("");\n' + fetchHtml);
}

// Ensure the links point to real pages
code = code.replace(/href=\"\/\" className=\"text-gray-500 hover:text-orange-500 transition-colors\">\s*About Us/g, 'href=\"/about\" className=\"text-gray-500 hover:text-orange-500 transition-colors\">About Us');
code = code.replace(/href=\"\/\" className=\"text-gray-500 hover:text-orange-500 transition-colors\">\s*Contact Us/g, 'href=\"/contact\" className=\"text-gray-500 hover:text-orange-500 transition-colors\">Contact Us');
code = code.replace(/href=\"\/\" className=\"text-gray-500 hover:text-orange-500 transition-colors\">\s*Privacy Policy/g, 'href=\"/privacy-policy\" className=\"text-gray-500 hover:text-orange-500 transition-colors\">Privacy Policy');

code = code.replace(/href=\"\/\" className=\"w-10 h-10[^>]*?>\s*<Instagram/g, 'href={settings?.instagram || "/"} target="_blank" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-orange-50 hover:text-orange-500 hover:border-orange-500 transition-all text-gray-500">\n                <Instagram');
code = code.replace(/href=\"\/\" className=\"w-10 h-10[^>]*?>\s*<Twitter/g, 'href={settings?.twitter || "/"} target="_blank" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-orange-50 hover:text-orange-500 hover:border-orange-500 transition-all text-gray-500">\n                <Twitter');
code = code.replace(/href=\"\/\" className=\"w-10 h-10[^>]*?>\s*<Linkedin/g, 'href={settings?.linkedin || "/"} target="_blank" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-orange-50 hover:text-orange-500 hover:border-orange-500 transition-all text-gray-500">\n                <Linkedin');
code = code.replace(/href=\"\/\" className=\"w-10 h-10[^>]*?>\s*<Facebook/g, 'href={settings?.facebook || "/"} target="_blank" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-orange-50 hover:text-orange-500 hover:border-orange-500 transition-all text-gray-500">\n                <Facebook');

fs.writeFileSync('components/Footer.tsx', code);
console.log('Fixed Footer links');
