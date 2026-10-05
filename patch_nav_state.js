const fs = require('fs');
let file = fs.readFileSync('components/Navbar.tsx', 'utf8');

// 1. Add Bell to imports
file = file.replace(/import \{ Eye, EyeOff \} from "lucide-react";/, 'import { Eye, EyeOff, Bell } from "lucide-react";');

// 2. Add Notification state logic inside Navbar component
const stateLogic = `  const [showProfileMenu, setShowProfileMenu] =
  useState(false);`;

const newStateLogic = `  const [showProfileMenu, setShowProfileMenu] =
  useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const [lastRead, setLastRead] = useState<Date | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("notifLastRead");
    if (stored) setLastRead(new Date(stored));
  }, []);

  useEffect(() => {
    if (currentUser?.role && ["superadmin", "admin", "ceo"].includes((currentUser.role || "").toLowerCase().replace(/[\\s_]+/g, ""))) {
      const fetchNotifs = async () => {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data } = await supabase.from('jobs').select('id, firm_name, position, posted_date, status').eq('status', 'published').gte('posted_date', yesterday).order('posted_date', { ascending: false });
        
        if (data) {
          const notifs: any[] = [];
          data.forEach((job: any) => {
            notifs.push({
              id: job.id + '-ig',
              message: \`\${job.firm_name} hiring post is successfully posted in Instagram\`,
              time: job.posted_date
            });
            notifs.push({
              id: job.id + '-fb',
              message: \`\${job.firm_name} hiring post is successfully posted in Facebook\`,
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
    if (mins < 60) return \`\${mins} minute\${mins !== 1 ? 's' : ''} ago\`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return \`\${hrs} hour\${hrs !== 1 ? 's' : ''} ago\`;
    const days = Math.floor(hrs / 24);
    return \`\${days} day\${days !== 1 ? 's' : ''} ago\`;
  };
`;

file = file.replace(stateLogic, newStateLogic);

fs.writeFileSync('components/Navbar.tsx', file);
console.log("Patched states");
