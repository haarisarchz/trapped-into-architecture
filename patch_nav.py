import re

with open('components/Navbar.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Bell to imports
content = re.sub(r'import \{ Eye, EyeOff \} from "lucide-react";', 'import { Eye, EyeOff, Bell } from "lucide-react";', content)

# 2. Add Notification state logic inside Navbar component
state_logic = '''  const [showProfileMenu, setShowProfileMenu] =
  useState(false);'''

new_state_logic = '''  const [showProfileMenu, setShowProfileMenu] =
  useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const [lastRead, setLastRead] = useState<Date | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("notifLastRead");
    if (stored) setLastRead(new Date(stored));
  }, []);

  useEffect(() => {
    // Only fetch for CEO
    if (currentUser?.role && currentUser.role.toLowerCase().replace(/[\s_]+/g, "") === "ceo") {
      const fetchNotifs = async () => {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data } = await supabase.from('jobs').select('id, firm_name, position, posted_date, status').eq('status', 'published').gte('posted_date', yesterday).order('posted_date', { ascending: false });
        
        if (data) {
          const notifs: any[] = [];
          data.forEach((job: any) => {
            notifs.push({
              id: job.id + '-ig',
              message: \\ hiring post is successfully posted in Instagram\,
              time: job.posted_date
            });
            notifs.push({
              id: job.id + '-fb',
              message: \\ hiring post is successfully posted in Facebook\,
              time: job.posted_date
            });
          });
          setNotifications(notifs.sort((a,b) => new Date(b.time).getTime() - new Date(a.time).getTime()));
        }
      };
      fetchNotifs();
    }
  }, [currentUser]);

  const handleBellClick = () => {
    setShowNotif(!showNotif);
    if (!showNotif) {
      const now = new Date();
      setLastRead(now);
      localStorage.setItem("notifLastRead", now.toISOString());
    }
  };

  const hasUnread = notifications.some(n => !lastRead || new Date(n.time) > lastRead);

  const timeAgo = (dateStr: string) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return \\ minute\ ago\;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return \\ hour\ ago\;
    const days = Math.floor(hrs / 24);
    return \\ day\ ago\;
  };
'''

content = content.replace(state_logic, new_state_logic)

# 3. Add Bell HTML
bell_html = '''
        {currentUser && (
          <div className="relative flex items-center mr-2 md:mr-4">
            <button onClick={handleBellClick} className="text-white hover:text-gray-300 relative p-1 transition">
              <Bell size={24} />
              {hasUnread && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-black"></span>}
            </button>
            {showNotif && (
              <div className="absolute right-0 top-10 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-[100] text-black">
                <div className="p-4 border-b border-gray-100 font-bold text-left">Notifications</div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-gray-500 text-sm text-center">No notifications yet</div>
                  ) : (
                    notifications.map((n: any) => (
                      <div key={n.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 flex flex-col gap-1 transition text-left">
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
'''

# Desktop:
# {currentUser ? (
#    <div className="relative">
#      <button
#        onClick={() => setShowUserMenu(!showUserMenu)}
desktop_regex = re.compile(r'(\{/\* LOGIN REGISTER BUTTON \*/\}\s*)\{currentUser \? \(\s*<div className="relative">\s*<button\s*onClick=\{', re.DOTALL)
content = desktop_regex.sub(r'\1<div className="flex items-center">\n' + bell_html + r'\n{currentUser ? (\n<div className="relative">\n<button\nonClick={', content)

# Close desktop div
desktop_close_regex = re.compile(r'(<button\s*onClick=\{[^}]+\}\s*className="font-bold hover:text-gray-300 transition"\s*>\s*Register\s*</button>\s*</div>\s*)\}\s*</div>\s*</div>\s*</div>\s*</nav>', re.DOTALL)
content = desktop_close_regex.sub(r'\1}\n</div>\n</div>\n</div>\n</div>\n</nav>', content)

# Mobile:
mobile_regex = re.compile(r'(<button\s*onClick=\{[^}]+\}\s*className="flex items-center gap-2 text-lg font-medium hover:text-gray-300 transition"\s*aria-label="Open navigation menu"\s*>\s*<span className="text-2xl">.*?</span>\s*<span>Menu</span>\s*</button>\s*)<div>\s*\{currentUser \? \(', re.DOTALL)
content = mobile_regex.sub(r'\1<div className="flex items-center">\n' + bell_html + r'\n{currentUser ? (', content)

# Close mobile div
mobile_close_regex = re.compile(r'(\n\s*)({\/\* DESKTOP MENU \*\/})', re.DOTALL)
content = mobile_close_regex.sub(r'\1</div>\1\2', content)

with open('components/Navbar.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched completely!")
