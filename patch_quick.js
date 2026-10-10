const fs = require('fs');

let content = fs.readFileSync('components/admin/AdminQuickMenu.tsx', 'utf8');

const menuStart = content.indexOf('<div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Nav</div>');
const menuEnd = content.indexOf('</div', menuStart);

const newMenu = `<div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Nav</div>
        <button onClick={() => navigate("/admin")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 font-medium">Dashboard</button>
        <button onClick={() => navigate("/admin/activity")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Activity</button>
        <button onClick={() => navigate("/admin/jobs")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Manage Jobs</button>
        <button onClick={() => navigate("/admin/add-job")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Add New Job</button>
        <button onClick={() => navigate("/admin/companies")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Companies</button>
        
        <button onClick={() => navigate("/admin/analytics")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Analytics</button>
        
        {userRole !== "jobadmin" && (
            <button onClick={() => navigate("/admin/catalog")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Database Catalog</button>
        )}
        
        {userRole === "ceo" && (
          <>
            <button onClick={() => navigate("/admin/users")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Users</button>
            <button onClick={() => navigate("/admin/contact")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Contact</button>
            <button onClick={() => navigate("/admin/social-config")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Social Config</button>
          </>
        )}
      `;

if (menuStart !== -1) {
    // Find the closing div of the menu content.
    // The previous implementation was a bit brittle, let's just replace the exact block.
    // Using Regex for safety since we know exactly what is there.
}
