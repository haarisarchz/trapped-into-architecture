const fs = require('fs');

let content = fs.readFileSync('components/admin/AdminQuickMenu.tsx', 'utf8');

// Add usePathname
content = content.replace(
  'import { useRouter } from "next/navigation";',
  'import { useRouter, usePathname } from "next/navigation";'
);

// Add usePathname hook
content = content.replace(
  'const router = useRouter();',
  'const router = useRouter();\n  const pathname = usePathname();'
);

// Replace renderMenu
const start = content.indexOf('const renderMenu = () => {');
const end = content.indexOf('return createPortal(', start);

const replacement = `const renderMenu = () => {
    if (!isOpen || typeof document === 'undefined') return null;

    const navItem = (href, label) => {
        const isActive = pathname === href;
        return (
            <button 
                onClick={() => navigate(href)} 
                className={\`w-full text-left px-4 py-1.5 text-sm transition \${
                    isActive 
                    ? "bg-black text-white font-semibold" 
                    : "text-gray-700 hover:bg-gray-100 font-medium"
                }\`}
            >
                {label}
            </button>
        );
    };
    
    const menuContent = (
      <div 
        ref={menuRef}
        className="bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 py-2 overflow-hidden flex flex-col gap-0.5"
        style={menuStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Nav</div>
        {navItem("/admin/activity", "Activity")}
        {navItem("/admin", "Job Dashboard")}
        {navItem("/admin/jobs", "Manage Jobs")}
        {navItem("/admin/add-job", "Add New Job")}
        {navItem("/admin/companies", "Companies")}
        
        {userRole !== "jobadmin" && navItem("/admin/catalog", "Database Catalog")}
        {navItem("/admin/analytics", "Analytics")}
        
        {userRole === "ceo" && (
          <>
            {navItem("/admin/users", "Users")}
            {navItem("/admin/contact", "Contact")}
          </>
        )}
      </div>
    );
    
    `;

if (start !== -1 && end !== -1) {
    content = content.substring(0, start) + replacement + content.substring(end);
    fs.writeFileSync('components/admin/AdminQuickMenu.tsx', content);
    console.log("Patched Quick Menu successfully");
} else {
    console.log("Could not find boundaries.");
}
