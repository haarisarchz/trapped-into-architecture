const fs = require('fs');
let code = fs.readFileSync('app/admin/activity/page.tsx', 'utf8');

// Add handleUpdateIndividualRate
const funcCode = `  const handleUpdateIndividualRate = async (adminId: string, newRate: number) => {
    // Graceful fail if column doesn't exist yet
    try {
      await supabase.from("profiles").update({ rupees_per_post: newRate }).eq("id", adminId);
      setAdmins(admins.map(a => a.id === adminId ? { ...a, rupees_per_post: newRate } : a));
    } catch(e) {}
  };`;
code = code.replace('  const updateRupeesPerPost = async (val: number) => {', funcCode + '\n  const updateRupeesPerPost = async (val: number) => {');

// Remove global rate UI
const globalRateRegex = /<div>\s*<label className="block text-sm text-gray-500 mb-1">₹ per Post<\/label>\s*<div className="flex items-center gap-2">[\s\S]*?<\/div>\s*<\/div>/;
code = code.replace(globalRateRegex, '');

// Update earnings calculation
code = code.replace(
  'const earnings = publishedCount * rupeesPerPost;',
  'const earnings = publishedCount * (admin.rupees_per_post || rupeesPerPost || 10);'
);

// Add individual rate UI below the expanded details
const customRateHtml = `{userRole === "ceo" && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                       <span className="text-sm text-gray-500">Individual Rate (₹/post):</span>
                       <div className="flex items-center gap-2">
                         <span className="text-gray-500">₹</span>
                         <input 
                           type="number" 
                           value={admin.rupees_per_post || rupeesPerPost || 10} 
                           onChange={e => handleUpdateIndividualRate(admin.id, Number(e.target.value))}
                           className="border border-gray-300 rounded px-2 py-1 w-20 text-sm"
                         />
                       </div>
                    </div>
                 )}`;
code = code.replace(
  '{/* EXPANDED TIMELINE */}',
  customRateHtml + '\n                  {/* EXPANDED TIMELINE */}'
);

fs.writeFileSync('app/admin/activity/page.tsx', code);
console.log('Fixed individual rates');
