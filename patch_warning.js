const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const hookLogic = `
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && anchor.href && !anchor.target) {
        try {
          const currentUrl = new URL(window.location.href);
          const targetUrl = new URL(anchor.href);
          if (currentUrl.pathname !== targetUrl.pathname && hasUnsavedChanges) {
            if (!window.confirm("You have unsaved changes. Are you sure you want to leave without saving?")) {
              e.preventDefault();
              e.stopPropagation();
            }
          }
        } catch(err) {}
      }
    };
    document.addEventListener('click', handleClick, { capture: true });
    return () => document.removeEventListener('click', handleClick, { capture: true });
  }, [hasUnsavedChanges]);
`;

file = file.replace('const [initialJobIds, setInitialJobIds] = useState<string[]>([]);', 'const [initialJobIds, setInitialJobIds] = useState<string[]>([]);' + hookLogic);

file = file.replace('const updatePosition = (index, field, value) => {', 'const updatePosition = (index, field, value) => { setHasUnsavedChanges(true); ');

file = file.replace('<section className="w-full px-6 lg:px-12 py-8">', '<section className="w-full px-6 lg:px-12 py-8" onChangeCapture={() => setHasUnsavedChanges(true)}>');

file = file.replace('if (jobData && jobData.id) {', 'if (jobData && jobData.id) { setHasUnsavedChanges(false); ');

file = file.replace('setTimeout(() => setIsCompanyProfileDirty(false), 200);', 'setTimeout(() => setIsCompanyProfileDirty(false), 200);\n               setTimeout(() => setHasUnsavedChanges(false), 500);');

file = file.replace('setScheduleTime(parts[1].substring(0, 5));\n           }\n        }', 'setScheduleTime(parts[1].substring(0, 5));\n           }\n        }\n        setTimeout(() => setHasUnsavedChanges(false), 500);');

fs.writeFileSync('app/admin/add-job/page.tsx', file);
console.log("Added unsaved changes warning logic!");
