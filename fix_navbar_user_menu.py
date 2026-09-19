import re

with open("components/Navbar.tsx", "r", encoding="utf-8") as f:
    code = f.read()

user_menu_tsx = """
    {showUserMenu && (
      <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white text-black shadow-lg overflow-hidden z-[100] border border-gray-100">
        <button
          onClick={() => {
            router.push(`/profile/${currentUser.username}`);
            setShowUserMenu(false);
          }}
          className="w-full text-left px-5 py-4 hover:bg-red-50 text-red-500 font-bold border-b border-gray-100"
        >
          My Profile
        </button>

        {currentUser?.role && ["superadmin", "admin", "ceo"].includes((currentUser.role || "").toLowerCase().replace(/[\\s_]+/g, "")) && (
          <>
            <button
              onClick={() => {
                router.push("/admin");
                setShowUserMenu(false);
              }}
              className="w-full text-left px-5 py-4 hover:bg-gray-50 border-b border-gray-100 font-medium"
            >
              Admin Dashboard
            </button>

            <button
              onClick={() => {
                router.push("/admin/add-job");
                setShowUserMenu(false);
              }}
              className="w-full text-left px-5 py-4 hover:bg-gray-50 border-b border-gray-100 font-medium"
            >
              Add New Job
            </button>
          </>
        )}

        <button
          onClick={() => {
            localStorage.removeItem("currentUser");
            window.location.href = "/";
          }}
          className="w-full text-left px-5 py-4 hover:bg-gray-50 text-red-600 font-medium"
        >
          Logout
        </button>
      </div>
    )}
"""

# Replace the mobile display name span with a button and dropdown
mobile_search = '<span className="font-semibold text-gray-200">{currentUser.displayName}</span>'
mobile_replace = f"""<div className="relative">
              <button 
                onClick={{() => setShowUserMenu(!showUserMenu)}} 
                className="font-semibold text-gray-200 hover:text-white transition flex items-center gap-1"
                aria-label="Open account menu"
              >
                {{currentUser.displayName}}
                <span className="text-xs">▼</span>
              </button>
              {user_menu_tsx}
            </div>"""

code = code.replace(mobile_search, mobile_replace)

# Ensure mobile menu button has aria-label
mobile_menu_btn_search = '<button \n        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}\n        className="flex items-center gap-2 text-lg font-medium hover:text-gray-300 transition"\n      >'
mobile_menu_btn_replace = '<button \n        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}\n        className="flex items-center gap-2 text-lg font-medium hover:text-gray-300 transition"\n        aria-label="Open navigation menu"\n      >'
code = code.replace(mobile_menu_btn_search, mobile_menu_btn_replace)

with open("components/Navbar.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("Updated mobile user menu and aria-labels")
