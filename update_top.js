const fs = require('fs');
let content = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

const regex = /const hasSource = [^\n]*\n/;

const regexExtraction = `const hasSource = job.source && job.source.trim();
    
    // Auto-extract contact details for older jobs
    const phoneRegex = /(?:\\+?91|0)?\\s*([6-9]\\d{9})/g;
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})/g;
    
    let extractedPhones = [];
    let match;
    while ((match = phoneRegex.exec(cleanDescription)) !== null) {
      extractedPhones.push(match[1]);
    }
    const fallbackPhone = extractedPhones.length > 0 ? extractedPhones[0] : null;
    
    let extractedEmails = [];
    while ((match = emailRegex.exec(cleanDescription)) !== null) {
      extractedEmails.push(match[1]);
    }
    const fallbackEmail = extractedEmails.length > 0 ? extractedEmails[0] : null;
    
    const displayEmail = job.application_email || company?.email || fallbackEmail;
    const displayPhone = company?.phone || fallbackPhone;
    
`;

content = content.replace(regex, regexExtraction);
fs.writeFileSync('app/jobs/[id]/page.tsx', content);
console.log("Updated top logic");