const fs = require('fs');

const pages = [
  { path: 'app/practice-exams/page.tsx', title: 'Practice Exams', desc: 'We are working hard to bring you comprehensive practice exams for architecture students.' },
  { path: 'app/resources/page.tsx', title: 'Resources', desc: 'A curated library of architecture resources is coming soon.' },
  { path: 'app/career-advice/page.tsx', title: 'Career Advice', desc: 'Expert career advice and industry insights are on the way.' },
  { path: 'app/resume-tips/page.tsx', title: 'Resume Tips', desc: 'Professional resume building tips tailored for architects will be available shortly.' },
];

pages.forEach(p => {
  const code = `import ComingSoon from "@/components/ComingSoon";

export default function Page() {
  return <ComingSoon title="${p.title}" description="${p.desc}" />;
}
`;
  
  const dir = p.path.substring(0, p.path.lastIndexOf('/'));
  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(p.path, code);
});

console.log('Created Coming Soon pages');
