const fs = require('fs');

let content = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');

const oldFuncRegex = /function AdminShareButton\(\{ job \}: \{ job: any \}\) \{[\s\S]*?return \([\s\S]*?\n\}\n/m;

const newFunc = `import { createPortal } from "react-dom";
function AdminShareButton({ job }: { job: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobile(/Mobi|Android|iPhone/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (menuRef.current && !menuRef.current.contains(event.target) && buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    function updatePosition() {
      if (isOpen && buttonRef.current && !isMobile) {
        const rect = buttonRef.current.getBoundingClientRect();
        const goesOffBottom = rect.bottom + 250 > window.innerHeight;
        setMenuStyle({
          position: "fixed",
          top: goesOffBottom ? 'auto' : rect.bottom + 8,
          bottom: goesOffBottom ? window.innerHeight - rect.top + 8 : 'auto',
          left: rect.right - 224 > 0 ? rect.right - 224 : rect.left,
          width: "224px",
          zIndex: 999999
        });
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      updatePosition();
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, isMobile]);
  
  const url = "https://www.trappedintoarchitecture.com" + generateJobUrl(job);
  
  const locParts = [job.area || job.neighborhood, job.city, job.state].filter(Boolean);
  const location = locParts.length > 0 ? locParts.join(", ") : "Remote";
  let text = \`Firm Name: \${job.firm_name || "Unknown"}\\nLocation: \${location}\\nPosition: \${job.position}\\n\\nFor more details, visit:\\n\${url}\`;

  const copyLink = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => { setCopied(false); setIsOpen(false); }, 1500);
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

  const renderMenu = () => {
    if (!isOpen || typeof document === 'undefined') return null;
    
    const menuContent = (
      <div 
        ref={menuRef}
        className={isMobile ? "fixed left-0 bottom-0 w-full bg-white border-t border-gray-100 rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] z-[999999] p-4 text-left pb-10" : "bg-white border border-gray-100 rounded-xl shadow-2xl p-2 text-left"}
        style={isMobile ? {} : menuStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {isMobile && (
          <div className="flex justify-between items-center mb-4 px-2">
            <span className="font-bold text-lg">Share Job</span>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 text-xl font-bold p-2">&times;</button>
          </div>
        )}
        <button 
          onClick={copyLink} 
          className={\`w-full text-left px-3 \${isMobile ? 'py-4 text-base' : 'py-2 text-sm'} text-gray-700 hover:bg-gray-50 flex justify-between items-center rounded-lg\`}
        >
          <span>Copy Link</span>
          {copied && <Check size={14} className="text-green-500" />}
        </button>
        <div className="h-px bg-gray-100 my-1 mx-2"></div>
        {shareLinks.map((link) => (
          <a 
            key={link.name}
            href={link.href}
            target="_blank" rel="noopener noreferrer"
            onClick={e => { e.stopPropagation(); setIsOpen(false); }}
            className={\`block px-3 \${isMobile ? 'py-4 text-base' : 'py-2 text-sm'} text-gray-700 hover:bg-gray-50 rounded-lg\`}
          >
            {link.name}
          </a>
        ))}
      </div>
    );
    return createPortal(menuContent, document.body);
  };

  return (
    <>
      <button 
        ref={buttonRef}
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition flex items-center gap-2"
      >
        <Share size={16} /> Share
      </button>
      {renderMenu()}
    </>
  );
}
`;

// Remove the import statement from newFunc and prepend it to the file if it doesn't exist
let finalFunc = newFunc;
if (!content.includes('import { createPortal }')) {
  content = 'import { createPortal } from "react-dom";\n' + content;
}
finalFunc = finalFunc.replace('import { createPortal } from "react-dom";\n', '');

content = content.replace(oldFuncRegex, finalFunc);
fs.writeFileSync('app/admin/jobs/page.tsx', content);
console.log("Patched AdminShareButton in jobs/page.tsx with Portal");
