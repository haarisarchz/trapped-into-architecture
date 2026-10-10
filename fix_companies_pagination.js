const fs = require('fs');
let content = fs.readFileSync('app/companies/page.tsx', 'utf8');

const anchor = '}, [companies, searchQuery, selectedCategories, selectedStates, selectedCities, sortBy]);';

const insertion = `
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const paginatedCompanies = filteredCompanies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredCompanies.length]);
`;

if (content.includes(anchor)) {
  content = content.replace(anchor, anchor + '\n' + insertion);
  fs.writeFileSync('app/companies/page.tsx', content);
  console.log("Fixed companies page pagination variables");
} else {
  console.log("Could not find anchor");
}
