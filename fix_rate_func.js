const fs = require('fs');
let c = fs.readFileSync('app/admin/activity/page.tsx', 'utf-8');

c = c.replace(
  /const handleUpdateIndividualRate = async \\(adminId: string, newRate: number\\) => \\{\r?\n\s*\/\/ Graceful fail if column doesn't exist yet\r?\n\s*try \\{\r?\n\s*await supabase\.from\\("profiles"\\)\.update\\(\\{ rupees_per_post: newRate \\}\\)\.eq\\("id", adminId\\);\r?\n\s*setAdmins\\(admins\.map\\(a => a\.id === adminId \? \\{ \.\.\.a, rupees_per_post: newRate \\} : a\\)\\);\r?\n\s*\\} catch\\(e\\) \\{\\}\\r?\n\s*\\};/g,
  \const [editingRateAdminId, setEditingRateAdminId] = useState<string | null>(null);
  const [editingRateValue, setEditingRateValue] = useState("");

  const handleUpdateIndividualRate = async (adminId: string, newRate: number) => {
    try {
      await supabase.from("profiles").update({ rupees_per_post: newRate }).eq("id", adminId);
      setAdmins(admins.map(a => a.id === adminId ? { ...a, rupees_per_post: newRate } : a));
      setEditingRateAdminId(null);
    } catch(e) {}
  };\
);

fs.writeFileSync('app/admin/activity/page.tsx', c);
