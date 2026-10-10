const fs = require('fs');
let content = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');

const oldShareBlock = `          <button 
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
          )}`;

const newShareBlock = `          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowShare(!showShare); }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition flex items-center justify-between font-medium text-gray-700"
            >
              <div className="flex items-center gap-3"><Share size={16} className="text-gray-400" /> Share</div>
              <ChevronRight size={16} className={\`text-gray-400 transition-transform \${showShare ? 'rotate-90 md:rotate-0' : ''}\`} />
            </button>

            {showShare && (
              <div className="
                md:absolute md:right-full md:top-0 md:mr-1 md:w-48 md:bg-white md:border md:border-gray-100 md:rounded-2xl md:shadow-xl md:py-2
                bg-gray-50 border-y border-gray-100 py-1
              ">
                <button 
                  onClick={copyLink}
                  className="w-full text-left px-4 py-2 text-xs md:text-sm hover:bg-gray-100 transition flex items-center gap-2 text-gray-600 md:pl-4 pl-10"
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
                    className="w-full text-left px-4 py-2 text-xs md:text-sm hover:bg-gray-100 transition block text-gray-600 md:pl-4 pl-10"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            )}
          </div>`;

content = content.replace(oldShareBlock, newShareBlock);
fs.writeFileSync('app/admin/jobs/page.tsx', content);
console.log("Patched AdminActionMenu share block");
