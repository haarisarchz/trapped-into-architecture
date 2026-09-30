const fs = require('fs');
let content = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

// 1. Convert displayPhone to array
const displayPhoneCheck = `const displayPhone = company?.phone || fallbackPhone;`;
const phoneArrayDecl = `const displayPhone = company?.phone || fallbackPhone;
      const phoneArray = displayPhone ? String(displayPhone).split(',').map((p: string) => p.trim()).filter(Boolean) : [];`;

content = content.replace(displayPhoneCheck, phoneArrayDecl);

// 2. Change the render
const oldPhoneRender = `{displayPhone && (
                              <p className="font-semibold text-black">
                                <span className="text-gray-500 font-normal mr-1">Phone:</span>
                                <a href={\`tel:\${displayPhone}\`} className="text-blue-600 hover:underline">{displayPhone}</a>
                              </p>
                            )}`;
const newPhoneRender = `{phoneArray.length > 0 && (
                              <div className="font-semibold text-black">
                                <span className="text-gray-500 font-normal mr-1">Phone{phoneArray.length > 1 ? 's' : ''}:</span>
                                {phoneArray.map((ph: string, idx: number) => (
                                  <span key={idx}>
                                    <a href={\`tel:\${ph}\`} className="text-blue-600 hover:underline">{ph}</a>
                                    {idx < phoneArray.length - 1 && <span className="text-gray-400 font-normal">, </span>}
                                  </span>
                                ))}
                              </div>
                            )}`;

content = content.replace(oldPhoneRender, newPhoneRender);

fs.writeFileSync('app/jobs/[id]/page.tsx', content);
console.log("Updated jobs page with multiple phones");