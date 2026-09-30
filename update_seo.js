const fs = require('fs');

// Fix sitemap.ts
let sitemapContent = fs.readFileSync('app/sitemap.ts', 'utf8');
if (!sitemapContent.includes('generateJobUrl')) {
  sitemapContent = 'import { generateJobUrl } from "@/utils/jobUrl";\n' + sitemapContent;
  fs.writeFileSync('app/sitemap.ts', sitemapContent);
  console.log("Fixed sitemap.ts");
} else {
  // It has generateJobUrl but wait, did it import it?
  if (!sitemapContent.includes('import { generateJobUrl }')) {
    sitemapContent = 'import { generateJobUrl } from "@/utils/jobUrl";\n' + sitemapContent;
    fs.writeFileSync('app/sitemap.ts', sitemapContent);
    console.log("Fixed sitemap.ts missing import");
  } else {
    console.log("sitemap.ts already has import");
  }
}

// Fix app/jobs/[id]/page.tsx
let jobPageContent = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

const jsonLdBlock = `        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org/",
              "@type": "JobPosting",
              "title": job.position,
              "description": job.description || \`Job opportunity for \${job.position} at \${job.firm_name}.\`,
              "identifier": {
                "@type": "PropertyValue",
                "name": job.firm_name,
                "value": job.id
              },
              "datePosted": job.created_at,
              "validThrough": job.post_expiry_date || new Date(new Date(job.created_at).getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(),
              "employmentType": job.employment_type === "Full Time" ? "FULL_TIME" : job.employment_type === "Part Time" ? "PART_TIME" : job.employment_type === "Internship" ? "INTERN" : job.employment_type === "Freelance" ? "CONTRACTOR" : "OTHER",
              "hiringOrganization": {
                "@type": "Organization",
                "name": job.firm_name,
                "sameAs": job.website || "https://trappedintoarchitecture.com",
                "logo": job.logo_url || "https://trappedintoarchitecture.com/default-logo.png"
              },
              "jobLocation": {
                "@type": "Place",
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": job.city,
                  "addressRegion": job.state,
                  "addressCountry": "IN"
                }
              },
              ...(job.salary && job.salary.toLowerCase() !== "not disclosed" && job.salary.toLowerCase() !== "negotiable" ? {
                "baseSalary": {
                  "@type": "MonetaryAmount",
                  "currency": "INR",
                  "value": {
                    "@type": "QuantitativeValue",
                    "value": job.salary,
                    "unitText": "MONTH"
                  }
                }
              } : {})
            })
          }}
        />`;

if (!jobPageContent.includes('application/ld+json')) {
  const insertIndex = jobPageContent.indexOf('<main className="min-h-screen bg-gray-50 text-black">') + 53;
  jobPageContent = jobPageContent.substring(0, insertIndex) + '\n' + jsonLdBlock + jobPageContent.substring(insertIndex);
  fs.writeFileSync('app/jobs/[id]/page.tsx', jobPageContent);
  console.log("Injected JSON-LD to job page");
} else {
  console.log("JSON-LD already exists in job page");
}