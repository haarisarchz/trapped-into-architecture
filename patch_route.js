const fs = require('fs');
let file = fs.readFileSync('app/api/extract-job/route.ts', 'utf8');

const missingLogic = `
    const formData = await req.formData();
    const mode = formData.get("mode") as string;
    
    const prompt = \`You are an expert HR assistant analyzing a job posting. 
Extract the following information and return ONLY a strict JSON object. Do not include markdown formatting like \\\`\\\`\\\`json.
Fields to extract:
- company (string, exact name)
- organization_type (string, usually "Firm", "Company", "Studio")
- city (string)
- state (string)
- description (string, concise summary of the firm or overall role)
- employmentType (string, e.g., "Full Time", "Part Time", "Contract", "Internship")
- workplaceType (string, e.g., "Remote", "On-site", "Hybrid")
- positions (array of objects, each containing):
  - position (string, e.g., "Junior Architect", "Interior Designer")
  - role (string, brief 1-2 line summary of what this specific role entails)
  - vacancies (string, the number of openings, e.g., "2", "3-5", leave empty if not specified)
  - experience (array of strings, e.g., ["1-2 Years", "Fresher"])
  - salary (string, e.g., "₹ 3,00,000 PA", "Based on experience")
  - qualifications (array of strings, e.g., ["B.Arch", "M.Arch"])
  - skills (array of strings, e.g., ["AutoCAD", "SketchUp", "Revit"])

If the text contains multiple roles (e.g. Hiring Junior Architect and 3D Visualizer), add each to the positions array.
If any field is missing, return an empty string or empty array as appropriate.\`;

`;

const insertIndex = file.indexOf('const envKey = process.env.GEMINI_API_KEY');
if (insertIndex !== -1) {
    const finalFile = file.substring(0, insertIndex) + missingLogic + file.substring(insertIndex);
    fs.writeFileSync('app/api/extract-job/route.ts', finalFile);
    console.log("Fixed missing formData and mode!");
} else {
    console.log("Could not find insert point.");
}
