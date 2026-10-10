const fs = require('fs');
let content = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');

if (!content.includes('import { Settings')) {
  content = content.replace('import { Share, Check, Copy } from "lucide-react";', 'import { Share, Check, Copy, Settings, Eye, Edit2, Trash2, ChevronRight } from "lucide-react";');
}

const actionMenuCode = `
function AdminActionMenu({ job, canEdit, deleteJob, loggedProfile }: { job: any, canEdit: boolean, deleteJob: any, loggedProfile: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobile(/Mobi|Android|iPhone/i.test(navigator.userAgent));
    const handleClickOutside = (event: any) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowShare(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const url = "https://www.trappedintoarchitecture.com" + generateJobUrl(job);
  const locParts = [job.area || job.neighborhood, job.city, job.state].filter(Boolean);
  const location = locParts.length > 0 ? locParts.join(", ") : "Remote";
  let text = \`Firm Name: \${job.firm_name || "Unknown"}\\nLocation: \${location}\\nPosition: \${job.position}\\n\\nFor more details, visit:\\n\${url}\`;
  
  const copyLink = async (e: any) => {
    e.preventDefault(); e.stopPropagation();
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);
  
  let shareLinks = [];
  if (isMobile) {
    shareLinks.push({ name: "WhatsApp", href: \`https://api.whatsapp.com/send?text=\${shareText}\` });
  } else {
    shareLinks.push({ name: "WhatsApp App", href: \`whatsapp://send?text=\${shareText}\` });
    shareLinks.push({ name: "WhatsApp Web", href: \`https://web.whatsapp.com/send?text=\${shareText}\` });
  }
  shareLinks = shareLinks.concat([
    { name: "Facebook", href: \`https://www.facebook.com/sharer/sharer.php?u=\${encodedUrl}\` },
    { name: "X", href: \`https://twitter.com/intent/tweet?url=\${encodedUrl}&text=\${encodeURIComponent(job.position + ' at ' + job.firm_name + '\\n')}\` },
    { name: "LinkedIn", href: \`https://www.linkedin.com/sharing/share-offsite/?url=\${encodedUrl}\` },
    { name: "Telegram", href: \`https://t.me/share/url?url=\${encodedUrl}&text=\${shareText}\`}
  ]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); setShowShare(false); }}
        className="p-2 rounded-full hover:bg-gray-200 transition text-gray-800"
      >
        <Settings strokeWidth={2.5} size={22} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden py-1">
          <button 
            onClick={(e) => { e.stopPropagation(); window.open(\`/jobs/\${job.id}\`, "_blank"); setIsOpen(false); }}
            className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition flex items-center gap-3 font-medium text-gray-700"
          >
            <Eye size={16} className="text-gray-400" /> View
          </button>

          {canEdit && (
            <button 
              onClick={(e) => { e.stopPropagation(); window.open(\`/admin/add-job?id=\${job.id}\`, "_blank"); setIsOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition flex items-center gap-3 font-medium text-gray-700"
            >
              <Edit2 size={16} className="text-gray-400" /> Edit
            </button>
          )}

          <button 
            onClick={(e) => { e.stopPropagation(); setShowShare(!showShare); }}
            className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition flex items-center justify-between font-medium text-gray-700"
          >
            <div className="flex items-center gap-3"><Share size={16} className="text-gray-400" /> Share</div>
            <ChevronRight size={16} className={\`text-gray-400 transition-transform \${showShare ? 'rotate-90' : ''}\`} />
          </button>

          {showShare && (
            <div className="bg-gray-50 border-y border-gray-100 py-1">
              <button 
                onClick={copyLink}
                className="w-full text-left px-4 py-2 text-xs hover:bg-gray-100 transition flex items-center gap-2 text-gray-600 pl-10"
              >
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />} 
                {copied ? "Copied!" : "Copy Link"}
              </button>
              {shareLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-left px-4 py-2 text-xs hover:bg-gray-100 transition block text-gray-600 pl-10"
                >
                  {link.name}
                </a>
              ))}
            </div>
          )}

          {canEdit && (
            <button 
              onClick={(e) => { e.stopPropagation(); deleteJob(job); setIsOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 text-red-600 transition flex items-center gap-3 font-medium border-t border-gray-100 mt-1"
            >
              <Trash2 size={16} className="text-red-500" /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
`;

if (!content.includes('AdminActionMenu')) {
  content = content.replace('export default function AdminJobs() {', actionMenuCode + '\nexport default function AdminJobs() {');
}

// Replace the Actions div ONLY inside the <td>
const actionsMarker = "{/* ACTIONS */}";
const actionsIndex = content.indexOf(actionsMarker);
if (actionsIndex !== -1) {
  const tdIndex = content.indexOf('<td', actionsIndex);
  const tdEnd = content.indexOf('</td>', tdIndex) + 5;
  
  const newTd = `<td className="px-6 py-5 text-right">
                        {(() => {
                          const myRole = (loggedProfile?.role || "").toLowerCase().replace(/[\\s_]+/g, "");
                          const canEdit = myRole === "ceo" || loggedProfile?.id === job.author_id;
                          return <AdminActionMenu job={job} canEdit={canEdit} deleteJob={deleteJob} loggedProfile={loggedProfile} />;
                        })()}
                      </td>`;
  
  content = content.substring(0, tdIndex) + newTd + content.substring(tdEnd);
}

fs.writeFileSync('app/admin/jobs/page.tsx', content);
console.log("Admin jobs patched successfully.");
