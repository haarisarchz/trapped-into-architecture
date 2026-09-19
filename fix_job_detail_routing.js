const fs = require('fs');

let code = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

if (!code.includes('import { redirect }')) {
  code = code.replace('import { Metadata } from "next";', 'import { Metadata } from "next";\nimport { redirect } from "next/navigation";');
}
code = code.replace(/import \{ generateJobUrl \} from "@\/utils\/jobUrl";/g, 'import { generateJobUrl, decodeUuid } from "@/utils/jobUrl";');

const metaSearch = `  const { id: rawId } = await params;
  const uuidMatch = rawId.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  const id = uuidMatch ? uuidMatch[0] : rawId;`;
const metaReplace = `  const { id: rawId } = await params;
  let id = rawId;
  const uuidMatch = rawId.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  if (uuidMatch) {
    id = uuidMatch[0];
  } else if (rawId.length === 22 && !rawId.includes("-")) {
    const decoded = decodeUuid(rawId);
    if (decoded) id = decoded;
  }`;
code = code.replace(metaSearch, metaReplace);

const pageSearch = `  const { id: rawId } = await props.params;

  const uuidMatch = rawId.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  const id = uuidMatch ? uuidMatch[0] : rawId;`;
const pageReplace = `  const { id: rawId } = await props.params;
  let id = rawId;
  let isLegacy = false;
  
  const uuidMatch = rawId.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  if (uuidMatch) {
    id = uuidMatch[0];
    isLegacy = true;
  } else if (rawId.length === 22 && !rawId.includes("-")) {
    const decoded = decodeUuid(rawId);
    if (decoded) id = decoded;
  }`;
code = code.replace(pageSearch, pageReplace);

const fetchSearch = `  const { data: job } = await supabase.from("jobs").select("*").eq("id", id).single();

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Job not found.
      </div>
    );
  }`;
const fetchReplace = `  const { data: job } = await supabase.from("jobs").select("*").eq("id", id).single();

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Job not found.
      </div>
    );
  }

  if (isLegacy) {
    redirect(generateJobUrl(job));
  }`;
code = code.replace(fetchSearch, fetchReplace);

fs.writeFileSync('app/jobs/[id]/page.tsx', code);
console.log('Fixed Job Detail routing');
