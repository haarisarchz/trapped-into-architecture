const fs = require('fs');

let content = fs.readFileSync('components/Jobcard.tsx', 'utf8');

// Replace the isExpired logic with isExpired and isOutdated
const logicTarget = /const isExpired =[\s\S]*?new Date\(\);/;

const newLogic = `
  const isExpired = post_expiry_date && new Date(post_expiry_date) < new Date();
  const postedDate = posted_date ? new Date(posted_date) : null;
  const isOutdated = !isExpired && postedDate && ((new Date().getTime() - postedDate.getTime()) / (1000 * 60 * 60 * 24) > 30);
`;
content = content.replace(logicTarget, newLogic);

const oldVisual = `{isExpired ? (
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">Expired</span>
            ) : (
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Active</span>
            )}`;

const newVisual = `{isExpired ? (
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold border border-red-200">Expired</span>
            ) : isOutdated ? (
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold border border-yellow-200">Outdated</span>
            ) : (
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold border border-green-200">Active</span>
            )}`;

content = content.split(oldVisual).join(newVisual);

const oldGrid = `{isExpired ? (
            <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider w-full text-center leading-none">Expired</span>
          ) : (
            <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider w-full text-center leading-none">Active</span>
          )}`;

const newGrid = `{isExpired ? (
            <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider w-full text-center leading-none border border-red-200">Expired</span>
          ) : isOutdated ? (
            <span className="bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider w-full text-center leading-none border border-yellow-200">Outdated</span>
          ) : (
            <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider w-full text-center leading-none border border-green-200">Active</span>
          )}`;

content = content.split(oldGrid).join(newGrid);

fs.writeFileSync('components/Jobcard.tsx', content);
console.log("Patched Jobcard");
