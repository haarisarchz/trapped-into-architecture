const fs = require('fs');
let code = fs.readFileSync('app/api/extract-job/route.ts', 'utf8');
code = code.replace(
  /const apiKey = process\.env\.GEMINI_API_KEY \|\| process\.env\.NEXT_PUBLIC_GEMINI_API_KEY;/,
  'const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GOOGLE_API_KEY;\n    if (!apiKey) return NextResponse.json({ keys: Object.keys(process.env).filter(k => k.includes("GEMINI") || k.includes("GOOGLE") || k.includes("API")) });'
);
fs.writeFileSync('app/api/extract-job/route.ts', code);
