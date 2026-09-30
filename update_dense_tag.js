const fs = require('fs');
let content = fs.readFileSync('components/Jobcard.tsx', 'utf8');

const denseStart = content.indexOf('/* =========================================\n       DENSE VIEW');

if (denseStart !== -1) {
  const replacement = `/* =========================================
       DENSE VIEW
    ========================================= */
    return (
      <div 
        onClick={() => router.push(generateJobUrl({ id, firm_name, position }))}
        className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-200 px-3 md:px-4 py-3 flex items-center gap-3 cursor-pointer group"
      >
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden bg-gray-100">
            {image ? (
              <img src={image} alt={position} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500 text-center">No Image</div>
            )}
          </div>
          {isExpired ? (
            <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider w-full text-center leading-none">Expired</span>
          ) : (
            <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider w-full text-center leading-none">Active</span>
          )}
        </div>
  
        <div className="flex-1 min-w-0 pr-1">
          <p className="text-sm md:text-base text-gray-800 leading-snug">
            <span className="font-bold">{firm_name}</span>{" "}is hiring{" "}
            <span className="font-semibold">{position}</span>{" "}at{" "}
            <span className="text-gray-600">{city}, {state}</span>
          </p>
        </div>
  
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2 flex-shrink-0">
          <SaveButton jobId={id} initialSaves={save_count} />
          <ShareButtons 
            url={jobUrlString} 
            jobId={id} 
            companyName={firm_name} 
            position={position} 
            organizationType={organization_type}
            city={city}
            state={state}
            initialShares={share_count} 
          />
        </div>
      </div>
    );
  }
`;
  content = content.substring(0, denseStart) + replacement;
  fs.writeFileSync('components/Jobcard.tsx', content);
  console.log("Updated dense view active tag placement");
} else {
  console.log("Not found");
}