const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

// We need to fix both occurrences of posted_date injection
const oldLine1 = 'posted_date: status === "published" ? formattedToday : (status === "scheduled" ? scheduleDate : null)';
const newLine1 = 'posted_date: status === "published" ? new Date().toISOString() : (status === "scheduled" ? (scheduleDate && scheduleTime ? new Date(`${scheduleDate}T${scheduleTime}`).toISOString() : scheduleDate) : null)';

// For draft saving (just in case they change status to something else), using new Date().toISOString() is better for published instead of formattedToday which truncates to date.

let updated = content.split(oldLine1).join(newLine1);

fs.writeFileSync('app/admin/add-job/page.tsx', updated);
console.log('Fixed posted_date logic');