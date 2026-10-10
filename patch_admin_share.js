const fs = require('fs');

let content = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');

// We need to replace the AdminShareButton function inside app/admin/jobs/page.tsx
const oldFuncRegex = /function AdminShareButton\(\{\s*job,\s*siteSettings\s*\}\:\s*\{\s*job\:\s*any,\s*siteSettings\:\s*any\s*\}\)\s*\{[\s\S]*?return\s*\([\s\S]*?<\/\s*div\>\s*\)\;\s*\}/;

const newFunc = `function AdminShareButton({ job }: { job: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(/Mobi|Android|iPhone/i.test(navigator.userAgent));
  }, []);
  
  const url = "https://www.trappedintoarchitecture.com" + generateJobUrl(job);
  
  const locParts = [job.area || job.neighborhood, job.city, job.state].filter(Boolean);
  const location = locParts.length > 0 ? locParts.join(", ") : "Remote";
  let text = \`Firm Name: \${job.firm_name || "Unknown"}\\nLocation: \${location}\\nPosition: \${job.position}\\n\\nFor more details, visit:\\n\${url}\`;

  const copyLink = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setIsOpen(false);
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
    { name: "Telegram", href: \`https://t.me/share/url?url=\${encodedUrl}&text=\${shareText}\` }
  ]);

  return (
    <div className="relative inline-block text-left" onMouseLeave={() => setIsOpen(false)}>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition flex items-center gap-2"
      >
        <Share size={16} /> Share
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-lg z-[99999] overflow-hidden">
          <div className="py-1">
            <button 
              onClick={copyLink} 
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex justify-between items-center"
            >
              <span>Copy Link</span>
              {copied && <Check size={14} className="text-green-500" />}
            </button>
            <div className="h-px bg-gray-100 my-1"></div>
            {shareLinks.map((link) => (
              <a 
                key={link.name}
                href={link.href}
                target="_blank" rel="noopener noreferrer"
                onClick={e => { e.stopPropagation(); setIsOpen(false); }}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}`;

content = content.replace(oldFuncRegex, newFunc);
fs.writeFileSync('app/admin/jobs/page.tsx', content);
console.log("Patched AdminShareButton in jobs/page.tsx");
