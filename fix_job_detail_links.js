const fs = require('fs');

let code = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

// Position
const oldPosition = `<Link href={job.apply_link || "#"} className="group">
                    <h1 className="text-3xl sm:text-4xl font-bold mt-4 text-gray-900 group-hover:text-black transition">
                      {job.position}
                    </h1>
                  </Link>`;

const newPosition = `<Link href={\`/jobs?position=\${encodeURIComponent(job.position)}\`} className="group">
                    <h1 className="text-3xl sm:text-4xl font-bold mt-4 text-gray-900 group-hover:text-black transition hover:underline">
                      {job.position}
                    </h1>
                  </Link>`;

code = code.replace(oldPosition, newPosition);

// Location (City and State)
const oldLocation = `<p className="text-gray-500 mt-1">
                    {job.city}{job.state ? \`, \${job.state}\` : ""}
                  </p>`;

const newLocation = `<p className="text-gray-500 mt-1">
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

code = code.replace(oldLocation, newLocation);

fs.writeFileSync('app/jobs/[id]/page.tsx', code);
console.log('Fixed job links');
