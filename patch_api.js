const fs = require('fs');
let file = fs.readFileSync('app/api/extract-job/route.ts', 'utf8');

// Replace the key fetching logic
const oldLogic = 'const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GOOGLE_API_KEY;';
const newLogic = 'const apiKey = req.headers.get("x-user-gemini-key") || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GOOGLE_API_KEY;';

if(file.includes(oldLogic)) {
    file = file.replace(oldLogic, newLogic);
    fs.writeFileSync('app/api/extract-job/route.ts', file);
    console.log('Successfully updated api route.');
} else {
    console.log('Could not find old logic to replace.');
}
