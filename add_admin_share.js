const fs = require('fs');

let content = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');

const shareComponent = `
import { Share, Check, Copy } from "lucide-react";
import { generateJobUrl } from "@/utils/jobUrl";

function AdminShareButton({ job, siteSettings }: { job: any, siteSettings: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const url = "https://www.trappedintoarchitecture.com" + generateJobUrl(job);
  const text = \`\${job.position} at \${job.firm_name}\\n\\nApply here: \${url}\`;

  const copyAndOpen = (e: any, link: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    window.open(link, "_blank");
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  return (
    <div className="relative inline-block text-left" onMouseLeave={() => setIsOpen(false)}>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition flex items-center gap-2"
      >
        <Share size={16} /> Share
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="py-1">
            <button 
              onClick={(e) => copyAndOpen(e, "https://web.whatsapp.com/send?text=" + encodedText)} 
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              WhatsApp Web
            </button>
            <button 
              onClick={(e) => copyAndOpen(e, "https://api.whatsapp.com/send?text=" + encodedText)} 
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              WhatsApp App (Channel)
            </button>
            <a 
              href={\`https://www.facebook.com/sharer/sharer.php?u=\${encodedUrl}\`}
              target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Facebook
            </a>
            <a 
              href={\`https://twitter.com/intent/tweet?url=\${encodedUrl}&text=\${encodeURIComponent(job.position + " at " + job.firm_name)}\`}
              target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              X / Twitter
            </a>
            <a 
              href={\`https://www.linkedin.com/sharing/share-offsite/?url=\${encodedUrl}\`}
              target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              LinkedIn
            </a>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
            >
              Copy Text {copied && <Check size={14} className="text-green-500" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
`;

// Insert the component before AdminJobsContent
content = content.replace('function AdminJobsContent() {', shareComponent + '\nfunction AdminJobsContent() {');

// Insert the Share button in the action buttons row
const buttonsRegex = /\{\/\* EDIT \*\/\}\s*<button onClick=\{\(e\) => \{ e\.stopPropagation\(\); window\.open\(`\/admin\/add-job\?id=\$\{job\.id\}`,\s*"_blank"\);\s*\}\}\s*className="px-4 py-2 rounded-xl border hover:bg-white transition">Edit<\/button>/;

const buttonsReplace = `<AdminShareButton job={job} siteSettings={null} />
        {/* EDIT */}
        <button onClick={(e) => { e.stopPropagation(); window.open(\`/admin/add-job?id=\${job.id}\`, "_blank"); }} className="px-4 py-2 rounded-xl border hover:bg-white transition">Edit</button>`;

if (content.match(buttonsRegex)) {
  content = content.replace(buttonsRegex, buttonsReplace);
  fs.writeFileSync('app/admin/jobs/page.tsx', content);
  console.log("Added AdminShareButton to admin jobs page");
} else {
  console.log("Could not find action buttons row in admin jobs page");
}