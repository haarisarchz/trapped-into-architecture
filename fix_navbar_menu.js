const fs = require('fs');
let code = fs.readFileSync('components/Navbar.tsx', 'utf8');

const mobileMenuStart = code.indexOf('{/* MOBILE MENU */}');
const authPopupStart = code.indexOf('{/* AUTH POPUP */}');
const navEnd = code.lastIndexOf('</nav>', authPopupStart);

// Extract mobile menu content
let mobileMenuBlock = code.substring(mobileMenuStart, navEnd);
// The remaining content up to mobileMenuStart
let beforeMobileMenu = code.substring(0, mobileMenuStart);

// We need to move mobileMenuBlock so that it is AFTER the closing </div> of the Desktop header.
// Actually, looking at beforeMobileMenu, it ends with:
//         </div>
// Let's just fix it by closing the Desktop Header BEFORE the Mobile Menu.
// And then the Mobile Menu can just sit inside the <nav> directly.

let newCode = beforeMobileMenu.trimEnd();

if (newCode.endsWith('</div>')) {
    // Wait, the desktop header div needs to be closed.
    // Right now, beforeMobileMenu ends with `</div>` (which closes `<div className="flex items-center gap-8">`),
    // We need to add one more `</div>` to close `<div className="hidden md:flex px-8 py-5 items-center justify-between w-full">`
    newCode += '\n\n  </div>\n\n  ';
}

newCode += mobileMenuBlock + '\n</nav>\n\n';
newCode += code.substring(authPopupStart);

fs.writeFileSync('components/Navbar.tsx', newCode);
console.log('Fixed mobile menu visibility in Navbar.tsx');
