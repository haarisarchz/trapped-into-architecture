const fs = require("fs");
let code = fs.readFileSync("app/jobs/[id]/page.tsx", "utf8");

const metadataInsert = `import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data: job } = await supabase.from("jobs").select("*").eq("id", id).single();
  
  if (!job) {
    return {
      title: "Job Not Found",
    };
  }
  
  return {
    title: \`\${job.position} at \${job.firm_name}\`,
    description: \`\${job.firm_name} is hiring a \${job.position} in \${job.city}, \${job.state}. \${job.employment_type || ""} \${job.workplace_type || ""}\`,
    openGraph: {
      title: \`\${job.position} | \${job.firm_name}\`,
      description: \`Apply for the \${job.position} position at \${job.firm_name} in \${job.city}.\`,
      images: job.image ? [job.image] : [],
    },
  };
}
`;

code = code.replace(
  `export default async function JobDetailsPage`,
  `${metadataInsert}\nexport default async function JobDetailsPage`
);

const structuredDataInsert = `
  const jobJsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.position,
    "description": job.job_description,
    "datePosted": job.posted_date || new Date().toISOString(),
    "validThrough": job.post_expiry_date || undefined,
    "employmentType": job.employment_type === "Full-time" ? "FULL_TIME" :
                      job.employment_type === "Part-time" ? "PART_TIME" :
                      job.employment_type === "Contract" ? "CONTRACTOR" :
                      job.employment_type === "Internship" ? "INTERN" : "OTHER",
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.firm_name,
      "logo": job.image || undefined
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.city,
        "addressRegion": job.state,
        "addressCountry": "US"
      }
    }
  };
`;

// Insert the structured data object right before the second return statement
const returnIndex = code.lastIndexOf(`  return (\n\n    <main className="min-h-screen bg-gray-100">`);
if (returnIndex !== -1) {
  code = code.substring(0, returnIndex) + structuredDataInsert + `\n  return (\n    <>\n      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobJsonLd) }} />\n    <main className="min-h-screen bg-gray-100">` + code.substring(returnIndex + 60);
}

// ONLY replace the final closing tag
const lastIndex = code.lastIndexOf(`    </main>\n  );\n}`);
if (lastIndex !== -1) {
  code = code.substring(0, lastIndex) + `    </main>\n    </>\n  );\n}` + code.substring(lastIndex + 16);
}

fs.writeFileSync("app/jobs/[id]/page.tsx", code);

