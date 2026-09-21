const fs = require('fs');
let code = fs.readFileSync('components/Navbar.tsx', 'utf8');

if (!code.includes('const [settings, setSettings]')) {
  code = code.replace(
    /const \[mobileMenuOpen, setMobileMenuOpen\] =\s*useState\(false\);/,
    'const [mobileMenuOpen, setMobileMenuOpen] = useState(false);\n  const [settings, setSettings] = useState<any>(null);'
  );

  code = code.replace(
    /useEffect\(\(\) => \{\s*const handleOpenAuth/g,
    'useEffect(() => {\n    supabase.from("site_settings").select("logo_url").eq("id", "global").maybeSingle().then(({data}) => {\n      if(data) setSettings(data);\n    });\n  }, []);\n\n  useEffect(() => {\n  const handleOpenAuth'
  );

  code = code.replace(
    />\s*Trapped Into Architecture\s*<\/Link>/g,
    '>{settings?.logo_url ? <img src={settings.logo_url} alt="Site Logo" className="h-8 md:h-10 object-contain inline-block" /> : "Trapped Into Architecture"}</Link>'
  );

  fs.writeFileSync('components/Navbar.tsx', code);
}
