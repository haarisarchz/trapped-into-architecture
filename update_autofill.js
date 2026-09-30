const fs = require('fs');

let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

// The AI sets setPositions(response.positions)
// We need to intercept the response and map experience to the closest predefined option.
// Or we can just use a useEffect to sanitize positions, or sanitize them right before setting.

const mapLogic = `
            const parseExperience = (rawExp) => {
              if (!rawExp) return [];
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
              if (matched.size === 0) matched.add("Not disclosed");
              return Array.from(matched);
            };

            const mappedPositions = response.positions.map(p => ({
              ...p,
              experience: parseExperience(p.experience)
            }));
            setPositions(mappedPositions);
`;

content = content.replace(
  'setPositions(response.positions);',
  mapLogic
);

fs.writeFileSync('app/admin/add-job/page.tsx', content);
console.log("Updated AI autofill mapping");