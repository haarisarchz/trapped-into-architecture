const fs = require('fs');

let code = fs.readFileSync('app/companies/page.tsx', 'utf8');

// Add mobileFiltersOpen state
if (!code.includes('mobileFiltersOpen')) {
  code = code.replace(
    'const [activeJobsOnly, setActiveJobsOnly] = useState(false);',
    'const [activeJobsOnly, setActiveJobsOnly] = useState(false);\nconst [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);'
  );
}

// Find sidebar
const divStart = code.indexOf('<aside className="hidden lg:block w-full lg:w-72');
if (divStart !== -1) {
  let balance = 0;
  let divEnd = -1;
  for (let i = divStart; i < code.length; i++) {
    if (code.slice(i, i + 6) === '<aside') balance++;
    if (code.slice(i, i + 7) === '</aside') {
      balance--;
      if (balance === 0) {
        divEnd = i + 7 + 1; // '</aside>' length
        break;
      }
    }
  }

  const innerContent = code.slice(divStart, divEnd);

  const replacement = `
  const renderFilters = () => (
    ${innerContent.replace('hidden lg:block w-full lg:w-72 bg-white rounded-3xl shadow p-7 sticky top-24 h-fit', 'w-full')}
  );
  `;

  const returnIdx = code.indexOf('return (');
  if (returnIdx !== -1) {
      code = code.slice(0, returnIdx) + replacement + '\n  ' + code.slice(returnIdx);
  }
  
  // Replace the original with a call
  code = code.replace(innerContent, '{renderFilters()}');

  // Inject Mobile Filter button in the main header (where View Mode is)
  const headerSearch = '<div className="flex flex-col sm:flex-row gap-4 mb-6">';
  const mobileButton = `
  <div className="flex items-center gap-4 mb-6 lg:hidden">
    <button
      onClick={() => setMobileFiltersOpen(true)}
      className="bg-black text-white px-5 py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow flex-1 text-center"
    >
      Filter Companies
    </button>
  </div>
  `;
  if (!code.includes('Filter Companies')) {
      code = code.replace(headerSearch, mobileButton + headerSearch);
  }

  // Inject Mobile Drawer at the end of return
  const drawerMarkup = `
  {/* MOBILE FILTER DRAWER */}
  {mobileFiltersOpen && (
    <div className="fixed inset-0 z-[200] flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={() => setMobileFiltersOpen(false)}
      />
      {/* Drawer */}
      <div className="relative w-full max-w-xs bg-white h-full shadow-xl flex flex-col overflow-y-auto animate-in slide-in-from-left duration-300">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold">Filters</h2>
          <button 
            onClick={() => setMobileFiltersOpen(false)}
            className="text-gray-400 hover:text-black transition"
          >
            ✕
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {renderFilters()}
        </div>
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <button 
            onClick={() => setMobileFiltersOpen(false)}
            className="w-full bg-black text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition"
          >
            Show Results
          </button>
        </div>
      </div>
    </div>
  )}
  `;

  const endTag = '</main>';
  if (!code.includes('MOBILE FILTER DRAWER')) {
      code = code.replace(endTag, drawerMarkup + '\n' + endTag);
  }

  fs.writeFileSync('app/companies/page.tsx', code);
  console.log('Fixed mobile companies filters!');
} else {
  console.log('Sidebar not found!');
}
