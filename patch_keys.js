const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const fetchLogic = `
  useEffect(() => {
    const fetchApiServers = async () => {
      const { data } = await supabase.from("api_keys").select("*").order("created_at", { ascending: true });
      if (data) {
        setDbKeys(data);
        const personal = data.filter((k: any) => k.type === "personal" && k.key_value && k.key_value.trim());
        if (personal.length > 0) {
          setSelectedServer(personal[0].id);
        } else {
          const shared = data.filter((k: any) => k.type === "shared");
          if (shared.length > 0) setSelectedServer(shared[0].id);
        }
      }
    };
    fetchApiServers();
  }, []);
`;

// Insert it right after the existing useEffect that loads localstorage keys
if (!content.includes('fetchApiServers')) {
    content = content.replace(/localStorage\.setItem\('ti2a_api_keys', JSON\.stringify\(newKeys\)\);\s*\};/g, 
      "localStorage.setItem('ti2a_api_keys', JSON.stringify(newKeys));\n  };\n\n" + fetchLogic
    );
    fs.writeFileSync('app/admin/add-job/page.tsx', content);
    console.log("Patched successfully");
} else {
    console.log("Already patched");
}
