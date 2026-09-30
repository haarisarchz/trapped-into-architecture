const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const regexStart = /<div className="md:col-span-1 border-l border-gray-100 pl-4">\s*<label className="block mb-1\.5 text-sm font-medium">Required Experience <span className="text-red-500">\*<\/span><\/label>\s*<div className="flex flex-wrap gap-2">/;

const replacementStart = `<div className="md:col-span-1 border-l border-gray-100 pl-4">
                            {employmentType === "Internship" ? (
                              <div className="h-full flex flex-col justify-center text-center text-gray-500 py-4">
                                <span className="text-xl mb-2">🎓</span>
                                <p className="text-sm font-medium">Experience not required for internships</p>
                              </div>
                            ) : (
                              <>
                                <label className="block mb-1.5 text-sm font-medium">Required Experience <span className="text-red-500">*</span></label>
                                <div className="flex flex-wrap gap-2">`;

content = content.replace(regexStart, replacementStart);

const regexEnd = /([ \t]*)\}\)\}\n([ \t]*)<\/div>\n([ \t]*)<div className="mt-4 pt-4 border-t border-gray-100 hidden md:block">/;
const replacementEnd = `$1})}` + "\n" + `$2</div>\n$2</>\n$2)}\n$3<div className="mt-4 pt-4 border-t border-gray-100 hidden md:block">`;

content = content.replace(regexEnd, replacementEnd);

fs.writeFileSync('app/admin/add-job/page.tsx', content);
console.log("Updated add-job UI via regex safely");