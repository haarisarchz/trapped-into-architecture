const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

// Hide "Required Experience" block when employmentType === "Internship"
const target = `<div className="md:col-span-1 border-l border-gray-100 pl-4">
                            <label className="block mb-1.5 text-sm font-medium">Required Experience <span className="text-red-500">*</span></label>
                            <div className="flex flex-wrap gap-2">`;

const replacement = `<div className="md:col-span-1 border-l border-gray-100 pl-4">
                            {employmentType === "Internship" ? (
                              <div className="h-full flex flex-col justify-center text-center text-gray-500 py-4">
                                <span className="text-xl mb-2">🎓</span>
                                <p className="text-sm font-medium">Experience not required for internships</p>
                              </div>
                            ) : (
                              <>
                                <label className="block mb-1.5 text-sm font-medium">Required Experience <span className="text-red-500">*</span></label>
                                <div className="flex flex-wrap gap-2">`;

const targetEnd = `                                </button>
                              );
                            })}
                            </div>`;

const replacementEnd = `                                </button>
                              );
                            })}
                            </div>
                            </>
                            )}`;

// Because targetEnd is too generic, let's use a regex
content = content.replace(target, replacement);

const regexEnd = /([ \t]*)\}\)\}\n([ \t]*)<\/div>/;
content = content.replace(regexEnd, `$1})}` + "\n" + `$2</div>\n$2</>\n$2)}`);

fs.writeFileSync('app/admin/add-job/page.tsx', content);
console.log("Updated add-job UI to hide Experience for Internships");