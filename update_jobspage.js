const fs = require('fs');
let code = fs.readFileSync('app/jobs/page.tsx', 'utf8');
code = code.replace(/\r\n/g, '\n');

const oldHeader = `        <h1 className="text-2xl md:text-5xl font-bold mb-4">
         Architecture Jobs
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">`;

const newHeader = `        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-5xl font-bold">
              {selectedCities.length === 1 ? \`Architecture Jobs in \${selectedCities[0]}\` : selectedStates.length === 1 ? \`Architecture Jobs in \${selectedStates[0]}\` : "Architecture Jobs"}
            </h1>
            {selectedCities.length > 0 && (
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                <span>Filtered by city: <strong className="text-black">{selectedCities.join(", ")}</strong></span>
                <button
                  onClick={() => setSelectedCities([])}
                  className="text-xs text-blue-600 hover:underline font-semibold ml-2"
                >
                  Clear location (View all jobs)
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">`;

code = code.replace(oldHeader, newHeader);
fs.writeFileSync('app/jobs/page.tsx', code);
console.log('Successfully updated app/jobs/page.tsx');
