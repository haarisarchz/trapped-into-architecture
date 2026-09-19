const fs = require('fs');
let code = fs.readFileSync('components/Navbar.tsx', 'utf8');

const effectCode = `useEffect(() => {
  const storedUser = localStorage.getItem("currentUser");
  if (storedUser) {
    const parsed = JSON.parse(storedUser);
    setCurrentUser(parsed);
    
    // Auto-patch missing role for older sessions
    if (!parsed.role && parsed.username) {
      supabase.from("profiles").select("role").eq("username", parsed.username).single().then(({data}) => {
        if (data && data.role) {
          parsed.role = data.role;
          localStorage.setItem("currentUser", JSON.stringify(parsed));
          setCurrentUser({...parsed});
        }
      });
    }
  }
}, []);`;

code = code.replace(/useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);/, effectCode);
fs.writeFileSync('components/Navbar.tsx', code);
console.log('✅ Patched useEffect to auto-fetch role');
