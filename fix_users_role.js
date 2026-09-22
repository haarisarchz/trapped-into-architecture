const fs = require('fs');

let code = fs.readFileSync('app/admin/users/page.tsx', 'utf8');

const oldCheck = /const checkAccess = async \(\) => \{[\s\S]*?fetchData\(\);\s*\};/;

const newCheck = `const checkAccess = async () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!currentUser) {
      router.push("/admin");
      return;
    }
    
    // Fetch actual role from DB to avoid stale localStorage
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("username", currentUser.username)
      .single();
      
    const roleStr = (profile?.role || "").toLowerCase().replace(/[\\s_]+/g, "");
    if (roleStr !== 'ceo') {
      router.push("/admin");
      return;
    }
    
    fetchData();
  };`;

if (code.match(oldCheck)) {
  code = code.replace(oldCheck, newCheck);
  fs.writeFileSync('app/admin/users/page.tsx', code);
}
