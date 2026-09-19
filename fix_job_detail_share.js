const fs = require('fs');

let code = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

const searchSaved = `<div className="flex items-center text-gray-500 text-sm">
                        <span className="mr-1">♡</span> {job.save_count || 0} saved
                      </div>`;

const replaceSaved = `<div className="flex items-center gap-1 text-gray-700 font-semibold text-base px-2 py-1.5 transition">
                        <span className="text-xl leading-none">♡</span> {job.save_count || 0}
                      </div>`;

const searchShare = `<ShareButtons url={\`https://trappedintoarchitecture.com\${generateJobUrl(job)}\`} jobId={job.id} initialShares={job.share_count || 0} />`;

const replaceShare = `<ShareButtons url={\`https://trappedintoarchitecture.com\${generateJobUrl(job)}\`} jobId={job.id} companyName={job.firm_name} position={job.position} experience={job.experience} initialShares={job.share_count || 0} />`;

code = code.replace(searchSaved, replaceSaved).replace(searchShare, replaceShare);

fs.writeFileSync('app/jobs/[id]/page.tsx', code);
console.log('Fixed job details page share buttons');
