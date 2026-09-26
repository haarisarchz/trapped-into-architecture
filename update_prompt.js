const fs = require('fs');
let content = fs.readFileSync('app/api/extract-job/route.ts', 'utf8');

const regex = /- 'description': After extracting role, qualifications, and skills, write a clean, natural paragraph summarizing the remaining context of the position\. Combine the position details into a concise paragraph\. Do not just blindly copy raw text if it includes software or degrees\./s;

const replacement = `- 'description': Write a concise, natural, and precise narrative paragraph using ONLY the extracted details for this specific position. You must strictly follow this template format (adapt grammar naturally): 
    "[Firm Name] is hiring [Position] who is expected to have skills in [skills], and hold qualifications in [qualifications]. The primary role involves [role duties]. The position is located in [City], [State]. Interested candidates can apply via [Application method/Email/Phone]." 
    Do NOT mention any details that are not present in the image (e.g. do not guess the city if it is not in the image, just omit that part). Ensure the paragraph is cohesive and professional.`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('app/api/extract-job/route.ts', content);
  console.log("Success updating AI prompt");
} else {
  console.log("Regex not found");
}