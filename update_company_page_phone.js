const fs = require('fs');
let content = fs.readFileSync('app/companies/[slug]/page.tsx', 'utf8');

const emailRender = `{company.contact_email && (
                  <a href={\`mailto:\${company.contact_email}\`} className="flex items-center gap-2 hover:text-black transition">
                    <Mail size={18} className="text-gray-400" />
                    Email
                  </a>
                )}`;

const phoneRender = `{company.phone && (
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    <div className="flex gap-1">
                      {String(company.phone).split(',').map(p => p.trim()).filter(Boolean).map((ph, idx, arr) => (
                        <span key={idx}>
                          <a href={\`tel:\${ph}\`} className="hover:text-black transition">{ph}</a>
                          {idx < arr.length - 1 && <span>,</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}`;

content = content.replace(emailRender, emailRender + '\n                ' + phoneRender);
fs.writeFileSync('app/companies/[slug]/page.tsx', content);
console.log("Updated company page with phone");