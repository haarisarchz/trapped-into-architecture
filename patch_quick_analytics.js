const fs = require('fs');

let content = fs.readFileSync('components/admin/AdminQuickMenu.tsx', 'utf8');

const start = content.indexOf('const renderMenu = () => {');
const end = content.indexOf('return createPortal(', start);

const replacement = `const renderMenu = () => {
    if (!isOpen || typeof document === 'undefined') return null;
    
    const menuContent = (
      <div 
        ref={menuRef}
        className="bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 py-2"
        style={menuStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Nav</div>
        <button onClick={() => navigate("/admin")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 font-medium">Dashboard</button>
        <button onClick={() => navigate("/admin/activity")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Activity</button>
        <button onClick={() => navigate("/admin/jobs")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Manage Jobs</button>
        <button onClick={() => navigate("/admin/add-job")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Add New Job</button>
        <button onClick={() => navigate("/admin/companies")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Companies</button>
        
        {userRole !== "jobadmin" && (
            <button onClick={() => navigate("/admin/catalog")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Database Catalog</button>
        )}
        
        <div className="border-t border-gray-100 my-1"></div>
        <button onClick={() => navigate("/admin/analytics")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 font-medium text-gray-700">Analytics</button>
        
        {userRole === "ceo" && (
          <>
            <button onClick={() => navigate("/admin/social-config")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Social Config</button>
            <button onClick={() => navigate("/admin/users")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Users</button>
            <button onClick={() => navigate("/admin/contact")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Contact</button>
          </>
        )}
      </div>
    );
    
    `;

if (start !== -1 && end !== -1) {
    content = content.substring(0, start) + replacement + content.substring(end);
    fs.writeFileSync('components/admin/AdminQuickMenu.tsx', content);
    console.log("Patched Quick Menu");
}
