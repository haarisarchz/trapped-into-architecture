const fs = require('fs');
let code = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

if (!code.includes('const [smartUrl, setSmartUrl] = useState("");')) {
  code = code.replace('const [smartText, setSmartText] = useState("");', 'const [smartText, setSmartText] = useState("");\nconst [smartUrl, setSmartUrl] = useState("");');
}

code = code.replace(
  /<input\s+type="url"\s+placeholder="Paste link here\.\.\."/,
  '<input type="url" value={smartUrl} onChange={(e)=>setSmartUrl(e.target.value)} placeholder="Paste link here..."'
);

code = code.replace(
  /\} else if \(uploadMode === "image"\) \{\s*if \(\!smartImage\) throw new Error\("Please upload an image to extract\."\);\s*formData\.append\("image", smartImage\);\s*\} else \{\s*throw new Error\("Mode not supported yet\."\);\s*\}/,
  '} else if (uploadMode === "image") {\n        if (!smartImage) throw new Error("Please upload an image to extract.");\n        formData.append("image", smartImage);\n      } else if (uploadMode === "url") {\n        if (!smartUrl) throw new Error("Please paste a URL to extract.");\n        formData.append("url", smartUrl);\n      } else {\n        throw new Error("Mode not supported yet.");\n      }'
);

fs.writeFileSync('app/admin/add-job/page.tsx', code);
console.log('Added URL mode to frontend');
