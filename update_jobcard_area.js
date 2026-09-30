const fs = require('fs');
let content = fs.readFileSync('components/Jobcard.tsx', 'utf8');

// Insert locationString right after isExpired
content = content.replace(
  'const isExpired =\n    post_expiry_date && new Date(post_expiry_date) < new Date();',
  'const isExpired =\n    post_expiry_date && new Date(post_expiry_date) < new Date();\n\n  const locationString = [area, city, state].filter(Boolean).join(", ");'
);

// Replace Visual view location
content = content.replace(
  /<span>\{city\}<\/span>,\{" "\}\s*<span>\{state\}<\/span>/,
  '<span>{locationString}</span>'
);

// Replace Balanced view location (there might be multiple occurrences)
content = content.replace(
  /<span>\{city\}<\/span>,\{" "\}\s*<span>\{state\}<\/span>/g,
  '<span>{locationString}</span>'
);

// Replace Text view location
content = content.replace(
  /<span className="text-gray-600">\{city\}, \{state\}<\/span>/,
  '<span className="text-gray-600">{locationString}</span>'
);

fs.writeFileSync('components/Jobcard.tsx', content);
console.log("Updated Jobcard.tsx to show neighborhood");