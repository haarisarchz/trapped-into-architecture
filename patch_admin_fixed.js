const fs = require('fs');

let content = fs.readFileSync('app/admin/page.tsx', 'utf8');

// Update allowed roles
content = content.replace(
  'const allowedRoles = ["superadmin", "admin", "ceo"];',
  'const allowedRoles = ["superadmin", "admin", "ceo", "jobadmin"];'
);

// Update useState for menus
content = content.replace(
  'const [isJobMenuOpen, setIsJobMenuOpen] = useState(false);',
  'const [isJobMenuOpen, setIsJobMenuOpen] = useState(true);'
);
content = content.replace(
  'const [isDbMenuOpen, setIsDbMenuOpen] = useState(false);',
  'const [isDbMenuOpen, setIsDbMenuOpen] = useState(true);'
);

const sidebarStart = content.indexOf('          {/* MENU */}');
const sidebarEnd = content.indexOf('            <button\n  onClick={() => window.open("/jobs", "_blank")}', sidebarStart);
const actualEnd = content.lastIndexOf('<button', sidebarEnd);

if (actualEnd !== -1) {
    const newSidebar = `          {/* MENU */}

          <div className="space-y-4 flex-1">
            
            {/* JOBS DASHBOARD */}
            <div>
              <button
                onClick={() => setIsJobMenuOpen(!isJobMenuOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-900 rounded-xl text-white font-bold hover:bg-gray-800 transition"
              >
                <span>Jobs Dashboard</span>
                {isJobMenuOpen ? <Minus size={16} /> : <Plus size={16} />}
              </button>

              {isJobMenuOpen && (
                <div className="mt-2 space-y-1 pl-2 border-l border-gray-800 ml-2">
                  <button
                    onClick={() => router.push("/admin")}
                    className="w-full text-left px-4 py-2 rounded-xl bg-black hover:bg-gray-900 transition text-sm text-gray-300 hover:text-white"
                  >
                    Dashboard Home
                  </button>
                  <button
                    onClick={() => router.push("/admin/jobs")}
                    className="w-full text-left px-4 py-2 rounded-xl hover:bg-gray-800 transition text-sm text-gray-300 hover:text-white"
                  >
                    Manage Jobs
                  </button>
                  <button
                    onClick={() => router.push("/admin/add-job")}
                    className="w-full text-left px-4 py-2 rounded-xl hover:bg-gray-800 transition text-sm text-gray-300 hover:text-white"
                  >
                    Add New Job
                  </button>
                  <button
                    onClick={() => router.push("/admin/companies")}
                    className="w-full text-left px-4 py-2 rounded-xl hover:bg-gray-800 transition text-sm text-gray-300 hover:text-white"
                  >
                    Companies
                  </button>
                </div>
              )}
            </div>

            {/* SYSTEM DASHBOARD */}
            {userRole !== "jobadmin" && (
              <div>
                <button
                  onClick={() => setIsDbMenuOpen(!isDbMenuOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-900 rounded-xl text-white font-bold hover:bg-gray-800 transition"
                >
                  <span>System Dashboard</span>
                  {isDbMenuOpen ? <Minus size={16} /> : <Plus size={16} />}
                </button>

                {isDbMenuOpen && (
                  <div className="mt-2 space-y-1 pl-2 border-l border-gray-800 ml-2">
                    <button
                      onClick={() => router.push("/admin/activity")}
                      className="w-full text-left px-4 py-2 rounded-xl hover:bg-gray-800 transition text-sm text-gray-300 hover:text-white"
                    >
                      Admin Activity
                    </button>
                    <button
                      onClick={() => router.push("/admin/analytics")}
                      className="w-full text-left px-4 py-2 rounded-xl hover:bg-gray-800 transition text-sm text-gray-300 hover:text-white"
                    >
                      Analytics
                    </button>
                    <button
                      onClick={() => router.push("/admin/catalog")}
                      className="w-full text-left px-4 py-2 rounded-xl hover:bg-gray-800 transition text-sm text-gray-300 hover:text-white"
                    >
                      Architecture Catalog
                    </button>
                    <button
                      onClick={() => router.push("/admin/social-config")}
                      className="w-full text-left px-4 py-2 rounded-xl hover:bg-gray-800 transition text-sm text-gray-300 hover:text-white"
                    >
                      Social Config
                    </button>
                    {(userRole === "ceo" || userRole === "superadmin") && (
                      <>
                        <button
                          onClick={() => router.push("/admin/users")}
                          className="w-full text-left px-4 py-2 rounded-xl hover:bg-gray-800 transition text-sm text-gray-300 hover:text-white"
                        >
                          Users
                        </button>
                        <button
                          onClick={() => router.push("/admin/contact")}
                          className="w-full text-left px-4 py-2 rounded-xl hover:bg-gray-800 transition text-sm text-gray-300 hover:text-white"
                        >
                          Contact
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            `;
        content = content.substring(0, sidebarStart) + newSidebar + content.substring(actualEnd);
        fs.writeFileSync('app/admin/page.tsx', content);
        console.log("Patched successfully!");
}
