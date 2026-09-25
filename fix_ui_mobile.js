const fs = require('fs');
let c = fs.readFileSync('app/admin/activity/page.tsx', 'utf-8');

c = c.replace(/<div>\s*<label className="block text-sm text-gray-500 mb-1">Administrator:<\/label>\s*<select\s*value=\{selectedAdminId\}\s*onChange=\{\(e\) => setSelectedAdminId\(e\.target\.value\)\}\s*className="border border-gray-300 rounded-lg px-4 py-2 bg-white"\s*>/m, 
  \<div className="w-full sm:w-auto">
  <label className="block text-sm text-gray-500 mb-1">Administrator:</label>
  <select
    value={selectedAdminId}
    onChange={(e) => setSelectedAdminId(e.target.value)}
    className="w-full sm:w-auto border border-gray-300 rounded-lg px-4 py-2 bg-white"
  >\);

c = c.replace(/<div>\s*<label className="block text-sm text-gray-500 mb-1">Period:<\/label>\s*<select\s*value=\{datePreset\}\s*onChange=\{\(e\) => setDatePreset\(e\.target\.value\)\}\s*className="border border-gray-300 rounded-lg px-4 py-2 bg-white"\s*>/m, 
  \<div className="w-full sm:w-auto">
  <label className="block text-sm text-gray-500 mb-1">Period:</label>
  <select
    value={datePreset}
    onChange={(e) => setDatePreset(e.target.value)}
    className="w-full sm:w-auto border border-gray-300 rounded-lg px-4 py-2 bg-white"
  >\);

c = c.replace(/<div>\s*<label className="block text-sm text-gray-500 mb-1">From:<\/label>\s*<input type="date" value=\{startDate\} onChange=\{e => setStartDate\(e\.target\.value\)\} className="border border-gray-300 rounded-lg px-4 py-2" \/>\s*<\/div>/m, 
  \<div className="w-full sm:w-auto">
  <label className="block text-sm text-gray-500 mb-1">From:</label>
  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full sm:w-auto border border-gray-300 rounded-lg px-4 py-2" />
</div>\);

c = c.replace(/<div>\s*<label className="block text-sm text-gray-500 mb-1">To:<\/label>\s*<input type="date" value=\{endDate\} onChange=\{e => setEndDate\(e\.target\.value\)\} className="border border-gray-300 rounded-lg px-4 py-2" \/>\s*<\/div>/m, 
  \<div className="w-full sm:w-auto">
  <label className="block text-sm text-gray-500 mb-1">To:</label>
  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full sm:w-auto border border-gray-300 rounded-lg px-4 py-2" />
</div>\);

c = c.replace(/<button\s*onClick=\{handleSubmitDateRange\}\s*className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"\s*>/m, 
  \<button 
  onClick={handleSubmitDateRange}
  className="w-full sm:w-auto bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
>\);

// Fix the flex wrapper to stretch full width on mobile
c = c.replace(/<div className="flex flex-wrap gap-4 items-end">/g, '<div className="flex flex-wrap gap-4 items-end w-full lg:w-auto">');

fs.writeFileSync('app/admin/activity/page.tsx', c);
