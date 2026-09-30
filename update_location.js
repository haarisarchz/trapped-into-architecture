const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

// 1. Add country state
if (!content.includes('const [country, setCountry]')) {
  content = content.replace(
    'const [state, setState] = useState("");',
    'const [state, setState] = useState("");\n  const [country, setCountry] = useState("India");'
  );
}

// 2. Change grid-cols-3 to grid-cols-4 for Location block
const oldGrid = `<div className="grid grid-cols-1 md:grid-cols-3 gap-6">`;
const newGrid = `<div className="grid grid-cols-1 md:grid-cols-4 gap-6">`;
content = content.replace(oldGrid, newGrid);

// 3. Update the inputs for City, State, and add Country
const locationRegex = /<div>\s*<label className="block mb-1.5 text-sm font-medium">\s*City[^]*?<div>\s*<label className="block mb-1.5 text-sm font-medium">\s*State[^]*?<\/div>/;

const newLocationBlock = `<div>
                    <label className="block mb-1.5 text-sm font-medium"> City </label>
                    <input 
                      type="text" 
                      list="citiesList"
                      placeholder="e.g. Mumbai" 
                      value={city} 
                      onChange={(e) => setCity(e.target.value)} 
                      className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white text-black" 
                    />
                    <datalist id="citiesList">
                      <option value="Mumbai" />
                      <option value="Delhi" />
                      <option value="Bengaluru" />
                      <option value="Hyderabad" />
                      <option value="Ahmedabad" />
                      <option value="Chennai" />
                      <option value="Kolkata" />
                      <option value="Surat" />
                      <option value="Pune" />
                      <option value="Jaipur" />
                      <option value="Lucknow" />
                      <option value="Kanpur" />
                      <option value="Nagpur" />
                      <option value="Indore" />
                      <option value="Thane" />
                      <option value="Bhopal" />
                      <option value="Visakhapatnam" />
                      <option value="Patna" />
                      <option value="Vadodara" />
                      <option value="Ghaziabad" />
                      <option value="Ludhiana" />
                      <option value="Agra" />
                      <option value="Nashik" />
                      <option value="Faridabad" />
                      <option value="Meerut" />
                      <option value="Rajkot" />
                      <option value="Varanasi" />
                      <option value="Srinagar" />
                      <option value="Aurangabad" />
                      <option value="Dhanbad" />
                      <option value="Amritsar" />
                      <option value="Allahabad" />
                      <option value="Ranchi" />
                      <option value="Gwalior" />
                      <option value="Jabalpur" />
                      <option value="Coimbatore" />
                      <option value="Vijayawada" />
                      <option value="Jodhpur" />
                      <option value="Madurai" />
                      <option value="Raipur" />
                      <option value="Chandigarh" />
                      <option value="Guwahati" />
                    </datalist>
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium"> State </label>
                    <input 
                      type="text" 
                      list="statesList"
                      placeholder="e.g. Maharashtra" 
                      value={state} 
                      onChange={(e) => setState(e.target.value)} 
                      className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white text-black" 
                    />
                    <datalist id="statesList">
                      <option value="Andhra Pradesh" />
                      <option value="Arunachal Pradesh" />
                      <option value="Assam" />
                      <option value="Bihar" />
                      <option value="Chhattisgarh" />
                      <option value="Goa" />
                      <option value="Gujarat" />
                      <option value="Haryana" />
                      <option value="Himachal Pradesh" />
                      <option value="Jharkhand" />
                      <option value="Karnataka" />
                      <option value="Kerala" />
                      <option value="Madhya Pradesh" />
                      <option value="Maharashtra" />
                      <option value="Manipur" />
                      <option value="Meghalaya" />
                      <option value="Mizoram" />
                      <option value="Nagaland" />
                      <option value="Odisha" />
                      <option value="Punjab" />
                      <option value="Rajasthan" />
                      <option value="Sikkim" />
                      <option value="Tamil Nadu" />
                      <option value="Telangana" />
                      <option value="Tripura" />
                      <option value="Uttar Pradesh" />
                      <option value="Uttarakhand" />
                      <option value="West Bengal" />
                      <option value="Andaman and Nicobar Islands" />
                      <option value="Chandigarh" />
                      <option value="Dadra and Nagar Haveli and Daman and Diu" />
                      <option value="Delhi" />
                      <option value="Jammu and Kashmir" />
                      <option value="Ladakh" />
                      <option value="Lakshadweep" />
                      <option value="Puducherry" />
                    </datalist>
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium"> Country <span className="text-red-500 font-bold">*</span></label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. India" 
                      value={country} 
                      onChange={(e) => setCountry(e.target.value)} 
                      className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white text-black" 
                    />
                  </div>`;
                  
content = content.replace(locationRegex, newLocationBlock);

// 4. Update payload to include country for company
// Note: We don't update jobPayload with country because it threw PGRST204 (column missing). We only update companyPayload.
content = content.replace(
  'city: city || "",\n          state: state || "",\n          neighborhood: area || "",',
  'city: city || "",\n          state: state || "",\n          country: country || "India",\n          neighborhood: area || "",'
);
content = content.replace(
  'city: city,\n            state: state,\n            neighborhood: area,',
  'city: city,\n            state: state,\n            country: country,\n            neighborhood: area,'
);

fs.writeFileSync('app/admin/add-job/page.tsx', content);
console.log("Updated location section with country and datalists");