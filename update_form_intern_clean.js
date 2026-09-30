const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

// revert the bad end tag
content = content.replace(
`                            </div>
                            </>
                            )}
                            
                            <div className="mt-4`,
`                            </div>
                            
                            <div className="mt-4`
);

const exactTarget = `<div className="md:col-span-1 border-l border-gray-100 pl-4">
                            <label className="block mb-1.5 text-sm font-medium">Required Experience <span className="text-red-500">*</span></label>
                            <div className="flex flex-wrap gap-2">`;

content = content.replace(exactTarget, 
`<div className="md:col-span-1 border-l border-gray-100 pl-4">
                            {employmentType === "Internship" ? (
                              <div className="h-full flex flex-col justify-center text-center text-gray-500 py-4">
                                <span className="text-xl mb-2">🎓</span>
                                <p className="text-sm font-medium">Experience not required for internships</p>
                              </div>
                            ) : (
                              <>
                                <label className="block mb-1.5 text-sm font-medium">Required Experience <span className="text-red-500">*</span></label>
                                <div className="flex flex-wrap gap-2">`
);

content = content.replace(
`                                </button>
                              );
                            })}
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-gray-100 hidden md:block">`,
`                                </button>
                              );
                            })}
                            </div>
                            </>
                            )}
                            
                            <div className="mt-4 pt-4 border-t border-gray-100 hidden md:block">`
);

fs.writeFileSync('app/admin/add-job/page.tsx', content);
console.log("Updated add-job UI to hide Experience for Internships cleanly");