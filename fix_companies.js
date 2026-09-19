const fs = require('fs');
let page = fs.readFileSync('app/admin/companies/page.tsx', 'utf8');

// The original table has `<table className="w-full text-left">`
// Let's just do a regex replace
page = page.replace(
  /<table className="w-full text-left">/,
  '<div className="overflow-x-auto">\n          <table className="w-full text-left min-w-[600px]">'
);

page = page.replace(
  /<\/table>\n\s*<\/div>\n\s*<\/section>/,
  '</table>\n          </div>\n        </div>\n      </section>'
);

fs.writeFileSync('app/admin/companies/page.tsx', page);
console.log('Fixed company table overflow');
