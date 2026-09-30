const fs = require('fs');

let content = fs.readFileSync('components/Navbar.tsx', 'utf8');

// 1. Mobile Header
const mobileLogoRegex = /<Link href="\/" className="text-xl font-bold tracking-widest uppercase">\{settings\?\.logo_url \? <img src=\{settings\.logo_url\} alt="Site Logo" className="h-8 md:h-10 object-contain inline-block" \/> : "Trapped Into Architecture"\}<\/Link>/;

const mobileLogoReplace = `<Link href="/" className="text-xl font-bold tracking-widest uppercase flex items-center justify-center gap-3">
        {settings?.logo_url && <img src={settings.logo_url} alt="Site Logo" className="h-8 md:h-10 object-contain inline-block" />}
        <span>Trapped Into Architecture</span>
      </Link>`;

content = content.replace(mobileLogoRegex, mobileLogoReplace);

// 2. Desktop Header
const desktopLogoRegex = /<Link href="\/" className="text-2xl font-bold">\{settings\?\.logo_url \? <img src=\{settings\.logo_url\} alt="Site Logo" className="h-8 md:h-10 object-contain inline-block" \/> : "Trapped Into Architecture"\}<\/Link>/;

const desktopLogoReplace = `<Link href="/" className="text-2xl font-bold flex items-center gap-3">
        {settings?.logo_url && <img src={settings.logo_url} alt="Site Logo" className="h-8 md:h-10 object-contain inline-block" />}
        <span>Trapped Into Architecture</span>
      </Link>`;

content = content.replace(desktopLogoRegex, desktopLogoReplace);

fs.writeFileSync('components/Navbar.tsx', content);
console.log("Updated Navbar logo logic");