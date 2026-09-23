const fs = require('fs');
let code = fs.readFileSync('app/admin/activity/page.tsx', 'utf8');

// 1. Add datePreset state
const stateCode = `const [datePreset, setDatePreset] = useState("this_month");`;
code = code.replace('const [startDate, setStartDate] = useState(() => {', stateCode + '\n  const [startDate, setStartDate] = useState(() => {');

// 2. Add effect
const effectCode = `
  useEffect(() => {
    if (datePreset === "custom") return;
    if (!currentUser || !userRole) return;
    
    const now = new Date();
    let start = "";
    let end = "";
    
    if (datePreset === "this_month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    } else if (datePreset === "last_month") {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
    } else if (datePreset === "last_3_months") {
      start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).toISOString().split('T')[0];
    } else if (datePreset === "last_6_months") {
      start = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()).toISOString().split('T')[0];
    } else if (datePreset === "last_1_year") {
      start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString().split('T')[0];
    } else if (datePreset === "lifetime") {
      start = "";
      end = "";
    }
    
    setStartDate(start);
    setEndDate(end);
    fetchData(currentUser, userRole, start, end);
  }, [datePreset]);
`;
code = code.replace('const handleSubmitDateRange = () => {', effectCode + '\n  const handleSubmitDateRange = () => {');

// 3. Replace the render block
const renderRegex = /<div className="flex flex-col md:flex-row gap-4 items-end">[\s\S]*?<button onClick=\{handleSubmitDateRange\}[\s\S]*?<\/button>\s*<\/div>\s*<\/div>/;

const newRender = `<div className="flex flex-col md:flex-row gap-4 items-end">
                {userRole === "ceo" && (
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Administrator:</label>
                    <select value={selectedAdminId} onChange={e => setSelectedAdminId(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2">
                      <option value="all">All Administrators</option>
                      {admins.map(a => (
                        <option key={a.id} value={a.id}>{a.display_name || a.full_name || a.username}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Date Range:</label>
                  <select value={datePreset} onChange={e => setDatePreset(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2">
                    <option value="this_month">This Month</option>
                    <option value="last_month">Last Month</option>
                    <option value="last_3_months">Last 3 Months</option>
                    <option value="last_6_months">Last 6 Months</option>
                    <option value="last_1_year">Last 1 Year</option>
                    <option value="lifetime">Lifetime</option>
                    <option value="custom">Custom Date Range</option>
                  </select>
                </div>
                
                {datePreset === "custom" && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">From:</label>
                      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">To:</label>
                      <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2" />
                    </div>
                    <button onClick={handleSubmitDateRange} className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition">
                      Submit
                    </button>
                  </>
                )}
              </div>`;

code = code.replace(renderRegex, newRender);

fs.writeFileSync('app/admin/activity/page.tsx', code);
console.log('Fixed activity date picker');
