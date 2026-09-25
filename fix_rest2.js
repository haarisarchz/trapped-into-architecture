const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

c = c.replace(/const \\\[image, setImage\\\] = useState\\(""\\);/, "const [lastDateToApply, setLastDateToApply] = useState('');\\nconst [postExpiryDate, setPostExpiryDate] = useState('');\\nconst [apply_link, setapply_link] = useState('');\\nconst [application_email, setapplication_email] = useState('');\\nconst [source, setSource] = useState('');\\nconst [image, setImage] = useState('');");

c = c.replace(/setSalary\(data\.salary \|\| ""\);/g, "setPositions([{ ...positions[0], salary: data.salary || '' }]);");

c = c.replace(/\{\/\* QUALIFICATION \+ SALARY \*\/\}[\s\S]*?\{\/\* SALARY \*\/\}[\s\S]*?<\/div>\r?\n\s*<\/div>/, "{/* QUALIFICATION */} <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\"> <div> <label className=\"block mb-2 font-medium\"> Qualifications </label> <input type=\"text\" placeholder=\"B.Arch\" value={qualifications} onChange={(e) => setQualifications(e.target.value)} className=\"w-full border rounded-2xl px-4 py-3\" /> </div> </div>");

c = c.replace(/\{\/\* JOB DESCRIPTION \*\/\}[\s\S]*?<textarea[\s\S]*?value=\{jobDescription\}[\s\S]*?<\/div>/, "");

fs.writeFileSync('app/admin/add-job/page.tsx', c);
