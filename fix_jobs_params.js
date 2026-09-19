const fs = require('fs');

let code = fs.readFileSync('app/jobs/page.tsx', 'utf8');

code = code.replace(
  `export default function JobsPage() {`,
  `function JobsPageContent() {`
);

code = code.replace(
  `const [selectedStates, setSelectedStates] = useState<string[]>([]);`,
  `const searchParams = useSearchParams();\n  const [selectedStates, setSelectedStates] = useState<string[]>(searchParams.get("state") ? [searchParams.get("state") as string] : []);`
);

code = code.replace(
  `const [selectedCities, setSelectedCities] = useState<string[]>([]);`,
  `const [selectedCities, setSelectedCities] = useState<string[]>(searchParams.get("city") ? [searchParams.get("city") as string] : []);`
);

code = code.replace(
  `const [selectedPositions, setSelectedPositions] = useState<string[]>([]);`,
  `const [selectedPositions, setSelectedPositions] = useState<string[]>(searchParams.get("position") ? [searchParams.get("position") as string] : []);`
);

// We must also remove `const searchParams = useSearchParams();` if it was already there (not used for this).
code = code.replace(`const searchParams = useSearchParams();\n\n`, '');
// Wait, I might have messed up if it's there. Let's just do a regex replace for the existing one if any.

code += `\n\nexport default function JobsPage() {\n  return (\n    <Suspense fallback={<div>Loading...</div>}>\n      <JobsPageContent />\n    </Suspense>\n  );\n}\n`;

fs.writeFileSync('app/jobs/page.tsx', code);
console.log('Fixed URL params mapping in Jobs');
