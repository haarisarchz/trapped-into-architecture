const fs = require("fs");
let code = fs.readFileSync("app/admin/add-job/page.tsx", "utf8");

// Change default value
code = code.replace(
  "const [employmentType, setEmploymentType] = useState(\"Full-time\");",
  "const [employmentType, setEmploymentType] = useState(\"\");"
);

// Add empty option
code = code.replace(
  "<option value=\"Full-time\">Full-time</option>",
  "<option value=\"\" disabled>Select Employment Type</option>\n                    <option value=\"Full-time\">Full-time</option>"
);

// Update validation
code = code.replace(
  `    !city ||
    !state ||
    !jobDescription`,
  `    !city ||
    !state ||
    !jobDescription ||
    !employmentType`
);

fs.writeFileSync("app/admin/add-job/page.tsx", code);

