const fs = require('fs');

let content = fs.readFileSync('components/Jobcard.tsx', 'utf8');

const balancedStart = content.indexOf('if (viewMode === "balanced") {');
const denseStart = content.indexOf('/* =========================================\n     DENSE VIEW');

if (balancedStart !== -1 && denseStart !== -1) {
  const replacement = `if (viewMode === "balanced") {
      const showExperience = experience && experience.toLowerCase() !== "not disclosed" && experience.toLowerCase() !== "not specified";
      const showSalary = salary && salary.toLowerCase() !== "not disclosed" && salary.toLowerCase() !== "negotiable" && salary.trim() !== "";
      
      return (
        <div 
          onClick={() => router.push(generateJobUrl({ id, firm_name, position }))}
          className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition border border-gray-200 flex flex-col md:flex-row h-auto md:h-[240px] cursor-pointer group"
        >
          <img src={image || "/placeholder-job.jpg"} alt={position} className="w-full md:w-56 h-48 md:h-full object-cover" />
  
          <div className="p-5 md:p-6 flex flex-col justify-between flex-1">
            <div>
              <div className="flex items-center justify-between mb-3">
                {isExpired ? (
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">Expired</span>
                ) : (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Active</span>
                )}
  
                <div className="flex items-center gap-3">
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
  
              <h2 onClick={(e) => navigateTo(e, \`/jobs?position=\${encodeURIComponent(position)}\`)} className="text-xl md:text-2xl font-bold line-clamp-2 md:line-clamp-1 hover:underline hover:text-gray-600">
                {position}
              </h2>
              <p onClick={(e) => navigateTo(e, \`/companies/\${getCompanySlug(firm_name)}\`)} className="text-base md:text-lg text-gray-700 mt-1 font-medium hover:underline hover:text-gray-900">
                {firm_name}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                <span onClick={(e) => navigateTo(e, \`/jobs?city=\${encodeURIComponent(city)}\`)} className="hover:underline hover:text-gray-800">{city}</span>,{" "}
                <span onClick={(e) => navigateTo(e, \`/jobs?state=\${encodeURIComponent(state)}\`)} className="hover:underline hover:text-gray-800">{state}</span>
              </p>
            </div>
  
            <div className="mt-4 space-y-1 md:space-y-2">
              {showExperience && <p className="text-sm text-gray-700">Experience: {experience}</p>}
              {showSalary && <p className="text-sm font-semibold">Salary: {salary}</p>}
            </div>
          </div>
        </div>
      );
    }

    `;

  content = content.substring(0, balancedStart) + replacement + content.substring(denseStart);
  fs.writeFileSync('components/Jobcard.tsx', content);
  console.log("Replaced balanced view via index slicing");
} else {
  console.log("Could not find boundaries");
}