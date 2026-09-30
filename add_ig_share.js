const fs = require('fs');
let content = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');

const shareMenuRegex = /<a\s*href=\{\`https:\/\/www\.facebook\.com\/sharer\/sharer\.php\?u=\$\{encodedUrl\}\`\}[\s\S]*?Facebook\s*<\/a>/;

const shareMenuReplace = `<a 
              href={\`https://www.facebook.com/sharer/sharer.php?u=\${encodedUrl}\`}
              target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Facebook
            </a>
            <a 
              href="https://www.instagram.com/"
              target="_blank" rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              title="Instagram doesn't support direct link sharing. Text copied to clipboard."
            >
              Instagram (Copies Text)
            </a>`;

if (content.match(shareMenuRegex)) {
  content = content.replace(shareMenuRegex, shareMenuReplace);
  fs.writeFileSync('app/admin/jobs/page.tsx', content);
  console.log("Added Instagram to Admin Share Menu");
} else {
  console.log("Could not find Facebook link in AdminShareButton");
}