const fs = require('fs');
let content = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

const oldLoc = `<p className="text-gray-500 mt-1">
                    <Link href={\`/jobs?city=\${encodeURIComponent(job.city)}\`} className="hover:underline hover:text-gray-800 transition">
                      {job.city}
                    </Link>
                    {job.state ? (
                      <>
                        ,{" "}
                        <Link href={\`/jobs?state=\${encodeURIComponent(job.state)}\`} className="hover:underline hover:text-gray-800 transition">
                          {job.state}
                        </Link>
                      </>
                    ) : ""}
                  </p>`;

const newLoc = `<p className="text-gray-500 mt-1">
                    {job.area && (
                      <>
                        <span className="text-gray-800">{job.area}</span>,{" "}
                      </>
                    )}
                    <Link href={\`/jobs?city=\${encodeURIComponent(job.city)}\`} className="hover:underline hover:text-gray-800 transition">
                      {job.city}
                    </Link>
                    {job.state ? (
                      <>
                        ,{" "}
                        <Link href={\`/jobs?state=\${encodeURIComponent(job.state)}\`} className="hover:underline hover:text-gray-800 transition">
                          {job.state}
                        </Link>
                      </>
                    ) : ""}
                  </p>`;

content = content.replace(oldLoc, newLoc);

fs.writeFileSync('app/jobs/[id]/page.tsx', content);
console.log("Updated app/jobs/[id]/page.tsx to show neighborhood");