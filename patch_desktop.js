const fs = require('fs');
let file = fs.readFileSync('components/Navbar.tsx', 'utf8');

const bellHtml = `
  {currentUser && (
    <div className="relative flex items-center mr-2">
      <button onClick={handleBellClick} className="text-white hover:text-gray-300 relative p-1 transition">
        <Bell size={24} />
        {hasUnread && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-black"></span>}
      </button>
      {showNotif && (
        <div className="absolute right-0 top-10 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 text-black">
          <div className="p-4 border-b border-gray-100 font-bold">Notifications</div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-gray-500 text-sm text-center">No notifications yet</div>
            ) : (
              notifications.map((n: any) => (
                <div key={n.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 flex flex-col gap-1 transition">
                  <p className="text-sm font-medium leading-tight">{n.message}</p>
                  <p className="text-xs text-gray-400">{timeAgo(n.time)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )}
`;

const desktopOld = `{/* LOGIN REGISTER BUTTON */}

  {currentUser ? (
    <div className="relative">`;

const desktopNew = `{/* LOGIN REGISTER BUTTON */}
<div className="flex items-center">
  ${bellHtml}
  {currentUser ? (
    <div className="relative">`;

const desktopOldClose = `    </div>
          )}
        </div>
      </div>
    </nav>`;

const desktopNewClose = `    </div>
          )}
        </div>
        </div>
      </div>
    </nav>`;

file = file.replace(desktopOld, desktopNew);
file = file.replace(desktopOldClose, desktopNewClose);

fs.writeFileSync('components/Navbar.tsx', file);
console.log("Patched desktop");
