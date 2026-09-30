const fs = require('fs');
let content = fs.readFileSync('components/icons/BrandIcons.tsx', 'utf8');

const instagramIcon = `
export const InstagramBrandIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <radialGradient id="ig-grad" r="1.5" cx="0.3" cy="1.07" fy="0.73" fx="0.3">
        <stop offset="0" stopColor="#fdf497"/>
        <stop offset="0.05" stopColor="#fdf497"/>
        <stop offset="0.45" stopColor="#fd5949"/>
        <stop offset="0.6" stopColor="#d6249f"/>
        <stop offset="0.9" stopColor="#285AEB"/>
      </radialGradient>
    </defs>
    <rect width="24" height="24" rx="6" fill="url(#ig-grad)"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect width="16" height="16" x="4" y="4" rx="4" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
`;

if (!content.includes('InstagramBrandIcon')) {
  content += instagramIcon;
  fs.writeFileSync('components/icons/BrandIcons.tsx', content);
  console.log("Added InstagramBrandIcon");
} else {
  console.log("Already exists");
}