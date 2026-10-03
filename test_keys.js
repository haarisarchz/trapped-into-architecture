const fs = require('fs');

async function test() {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const envKey = ''; // Assuming we don't have it locally, let's just parse it
  const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/);
  if (match) {
    const keys = match[1].split(',').map(k => k.trim()).filter(Boolean);
    console.log("Found", keys.length, "keys in .env.local");
  } else {
    console.log("No keys in .env.local");
  }
}
test();
