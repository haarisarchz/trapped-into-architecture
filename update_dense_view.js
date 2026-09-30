const fs = require('fs');
let content = fs.readFileSync('components/Jobcard.tsx', 'utf8');

// Remove onClick sub-navigation from Visual View
content = content.replace(/<h2 onClick=\{\(e\) => navigateTo\(e, `\/jobs\?position=\$\{encodeURIComponent\(position\)\}`\)\} className="text-lg font-bold line-clamp-1 hover:underline hover:text-gray-600">/g, '<h2 className="text-lg font-bold line-clamp-1 group-hover:text-gray-600">');
content = content.replace(/<p onClick=\{\(e\) => navigateTo\(e, `\/companies\/\$\{getCompanySlug\(firm_name\)\}`\)\} className="text-gray-700 mt-1 font-medium line-clamp-1 hover:underline hover:text-gray-900">/g, '<p className="text-gray-700 mt-1 font-medium line-clamp-1">');
content = content.replace(/<span onClick=\{\(e\) => navigateTo\(e, `\/jobs\?city=\$\{encodeURIComponent\(city\)\}`\)\} className="hover:underline hover:text-gray-800">\{city\}<\/span>/g, '<span>{city}</span>');
content = content.replace(/<span onClick=\{\(e\) => navigateTo\(e, `\/jobs\?state=\$\{encodeURIComponent\(state\)\}`\)\} className="hover:underline hover:text-gray-800">\{state\}<\/span>/g, '<span>{state}</span>');

// Remove onClick sub-navigation from Balanced View
content = content.replace(/<h2 onClick=\{\(e\) => navigateTo\(e, `\/jobs\?position=\$\{encodeURIComponent\(position\)\}`\)\} className="text-xl md:text-2xl font-bold line-clamp-2 md:line-clamp-1 hover:underline hover:text-gray-600">/g, '<h2 className="text-xl md:text-2xl font-bold line-clamp-2 md:line-clamp-1 group-hover:text-gray-600">');
content = content.replace(/<p onClick=\{\(e\) => navigateTo\(e, `\/companies\/\$\{getCompanySlug\(firm_name\)\}`\)\} className="text-base md:text-lg text-gray-700 mt-1 font-medium hover:underline hover:text-gray-900">/g, '<p className="text-base md:text-lg text-gray-700 mt-1 font-medium">');

// Now replace Dense View completely to fix layout and remove links
const denseStart = content.indexOf('/* =========================================\n       DENSE VIEW');

if (denseStart !== -1) {
  const replacement = `/* =========================================
       DENSE VIEW
    ========================================= */
    return (
      <div 
        onClick={() => router.push(generateJobUrl({ id, firm_name, position }))}
        className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-200 px-3 md:px-4 py-3 flex items-start md:items-center gap-3 cursor-pointer group"
      >
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 mt-1 md:mt-0">
          {image ? (
            <img src={image} alt={position} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500 text-center">No Image</div>
          )}
        </div>
  
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-sm md:text-base text-gray-800 leading-snug">
            <span className="font-bold">{firm_name}</span>{" "}is hiring{" "}
            <span className="font-semibold">{position}</span>{" "}at{" "}
            <span className="text-gray-600">{city}, {state}</span>
          </p>
        </div>
  
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {isExpired ? (
            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap mb-1">Expired</span>
          ) : (
            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap mb-1">Active</span>
          )}
          
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2">
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
      </div>
    );
  }
`;
  content = content.substring(0, denseStart) + replacement;
  fs.writeFileSync('components/Jobcard.tsx', content);
  console.log("Updated dense view and removed internal links");
} else {
  console.log("Could not find Dense View section");
}