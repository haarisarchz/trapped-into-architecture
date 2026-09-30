const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const target = `                            })}
                              </div>
                              
                              <div className="mt-4 pt-4 border-t border-gray-100 hidden md:block">`;

const replacement = `                            })}
                              </div>
                              </>
                            )}
                              
                              <div className="mt-4 pt-4 border-t border-gray-100 hidden md:block">`;

content = content.replace(target, replacement);
fs.writeFileSync('app/admin/add-job/page.tsx', content);
console.log("Updated add-job UI end");