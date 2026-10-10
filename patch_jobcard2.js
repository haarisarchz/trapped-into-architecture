const fs = require('fs');
let content = fs.readFileSync('components/Jobcard.tsx', 'utf8');

// Replace standard view badges (List & Grid modes)
const oldExpired = `{isExpired ? (
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">Expired</span>
            ) : (
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Active</span>
            )}`;

const newExpired = `{isExpired ? (
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">Expired</span>
            ) : isOutdated ? (
              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">Outdated</span>
            ) : (
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Active</span>
            )}`;

content = content.replace(oldExpired, newExpired); // Grid mode
content = content.replace(oldExpired, newExpired); // List mode

// Replace visual mode badge (Visual mode uses different classes)
const oldExpiredVisual = `{isExpired ? (
            <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider w-full text-center leading-none">Expired</span>
          ) : (
            <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider w-full text-center leading-none">Active</span>
          )}`;

const newExpiredVisual = `{isExpired ? (
            <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider w-full text-center leading-none">Expired</span>
          ) : isOutdated ? (
            <span className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider w-full text-center leading-none">Outdated</span>
          ) : (
            <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider w-full text-center leading-none">Active</span>
          )}`;

content = content.replace(oldExpiredVisual, newExpiredVisual);

fs.writeFileSync('components/Jobcard.tsx', content);
console.log("Jobcard updated");
