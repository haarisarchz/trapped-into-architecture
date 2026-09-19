const fs = require('fs');

let code = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

const shareStatSearch = `<ShareButtons url={\`https://trappedintoarchitecture.com\${generateJobUrl(job)}\`} jobId={job.id} companyName={job.firm_name} position={job.position} experience={job.experience} initialShares={job.share_count || 0} />`;
const shareStatReplace = `<ShareButtons url={\`https://trappedintoarchitecture.com\${generateJobUrl(job)}\`} jobId={job.id} companyName={job.firm_name} position={job.position} experience={job.experience} initialShares={job.share_count || 0} variant="statistic" />`;

code = code.replace(shareStatSearch, shareStatReplace);

const ctaSearch = `</a>\n                        )}`;
const ctaReplace = `</a>\n                        )}\n                        <ShareButtons url={\`https://trappedintoarchitecture.com\${generateJobUrl(job)}\`} jobId={job.id} companyName={job.firm_name} position={job.position} experience={job.experience} initialShares={job.share_count || 0} variant="button" />`;

code = code.replace(ctaSearch, ctaReplace);

fs.writeFileSync('app/jobs/[id]/page.tsx', code);
console.log('Fixed job detail share buttons');
