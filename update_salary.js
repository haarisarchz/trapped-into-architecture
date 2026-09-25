const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

const regex = /<label className="block mb-2 font-medium">Salary<\/label>[\s\S]*?<input[\s\S]*?value={pos\.salary}[\s\S]*?onChange={\(e\) => updatePosition\(index, "salary", e\.target\.value\)}[\s\S]*?className="w-full border rounded-2xl px-4 py-3 bg-white text-black"[\s\S]*?\/>/;

const replacement = \<label className="block mb-2 font-medium">Salary</label>
                          <Autocomplete
                            value={pos.salary}
                            onChange={(val) => updatePosition(index, "salary", val)}
                            fetchSuggestions={async (q) => {
                              const { data } = await supabase.from('jobs').select('salary').ilike('salary', \\\%\\\%\\\).limit(20);
                              return Array.from(new Set(data?.map(d => d.salary).filter(Boolean))) || [];
                            }}
                            placeholder="e.g. ₹ 3,00,000 - ₹ 5,00,000"
                            className="w-full border rounded-2xl px-4 py-3 bg-white text-black"
                          />\;

c = c.replace(regex, replacement);
fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Done');