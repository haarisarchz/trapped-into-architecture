const fs = require('fs');

const oldFunc = `    const formatExperience = (rawExp: any) => {
      if (!rawExp) return "";
      const str = Array.isArray(rawExp) ? rawExp.join(" ") : String(rawExp);
      const lower = str.toLowerCase();
      let matched = new Set();
      if (lower.includes("fresher") || lower.includes("0 year") || lower.includes("0-1")) matched.add("Fresher");
      if (lower.includes("0-1") || lower.includes("0 to 1") || lower.includes("0 - 1")) matched.add("0-1 Years");
      if (lower.includes("1-2") || lower.includes("1 to 2") || lower.includes("1 - 2") || lower.match(/1\\s*year/)) matched.add("1-2 Years");
      if (lower.includes("2-4") || lower.includes("2 to 4") || lower.includes("2 - 4") || lower.match(/[23]\\s*year/)) matched.add("2-4 Years");
      if (lower.includes("4-6") || lower.includes("4 to 6") || lower.includes("4 - 6") || lower.match(/[45]\\s*year/)) matched.add("4-6 Years");
      if (lower.includes("6-10") || lower.includes("6 to 10") || lower.includes("6 - 10") || lower.match(/[6789]\\s*year/)) matched.add("6-10 Years");
      if (lower.includes("10+") || lower.includes("10 +") || lower.match(/1[0-9]\\s*year/)) matched.add("10+ Years");
      
      if (matched.size === 0) {
        // Only return if it matches exact predefined options that weren't caught
        const valid = ["Fresher", "0-1 Years", "1-2 Years", "2-4 Years", "4-6 Years", "6-10 Years", "10+ Years", "Not disclosed"];
        const strParts = str.split(",").map(s => s.trim());
        const validParts = strParts.filter(p => valid.includes(p));
        if (validParts.length > 0) return validParts.join(", ");
        return "";
      }
      return Array.from(matched).join(", ");
  };`;

const newFunc = `    const formatExperience = (rawExp: any) => {
      if (!rawExp) return "";
      if (Array.isArray(rawExp)) {
        const cleaned = rawExp.filter(Boolean).map(e => String(e).trim()).filter(e => e.length > 0 && e.toLowerCase() !== "not disclosed");
        if (cleaned.length > 0) return cleaned.join(", ");
        return "";
      }
      const str = String(rawExp).trim();
      return str.toLowerCase() === "not disclosed" ? "" : str;
  };`;

['app/jobs/[id]/page.tsx', 'app/companies/[slug]/page.tsx', 'components/Jobcard.tsx'].forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/\r\n/g, '\n');
  if (content.includes('const formatExperience = (rawExp: any) => {')) {
    content = content.replace(oldFunc, newFunc);
    fs.writeFileSync(filePath, content);
    console.log('Fixed formatExperience in', filePath);
  } else {
    console.log('Could not find in', filePath);
  }
});
