const fs = require('fs');
let file = 'app/admin/social-config/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Find the spot after the closing </div> of the button in the map
const searchStr = `</button>\n                </div>\n              </div>`;
if (content.includes(searchStr)) {
    content = content.replace(searchStr, `</button>\n                </div>\n              </div>\n              {p.id === 'facebook' && <div className="px-4 pb-4 bg-white border-x border-b border-gray-200 rounded-b-xl -mt-6 pt-4"><TestFacebookButton /></div>}`);
    fs.writeFileSync(file, content);
    console.log("Patched correctly");
} else {
    console.log("Could not find string");
}
