const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const unbreakableLock = `
  // Lock #1: Tab Close & Refresh
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

  // Lock #2: Next.js Link Clicks (Sidebar)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!hasUnsavedChanges) return;
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && anchor.href && !anchor.target && !anchor.hasAttribute('download')) {
        try {
          const currentUrl = new URL(window.location.href);
          const targetUrl = new URL(anchor.href);
          if (currentUrl.pathname !== targetUrl.pathname) {
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

  // Lock #3: Browser Back/Forward Buttons (SPA Navigation)
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handlePopState = (e: PopStateEvent) => {
      if (!window.confirm("You have unsaved changes. Are you sure you want to leave without saving?")) {
        // Push a state back on to trap the user
        window.history.pushState(null, "", window.location.href);
      }
    };
    
    // We add a dummy state when it becomes dirty so the first 'back' click is intercepted safely
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedChanges]);
`;

// 1. Remove the old hook logic
const startOldHook = file.indexOf("useEffect(() => {\n    const handleBeforeUnload");
const endOldHook = file.indexOf("}, [hasUnsavedChanges]);", startOldHook) + 24;
const nextEndOldHook = file.indexOf("}, [hasUnsavedChanges]);", endOldHook) + 24; // second useEffect

if (startOldHook !== -1 && nextEndOldHook !== -1) {
   file = file.substring(0, startOldHook) + unbreakableLock + file.substring(nextEndOldHook);
} else {
   console.log("Could not find old hooks to replace!");
}

// 2. Add setHasUnsavedChanges(true) to smart extraction
const extractionTarget = 'const ai = typeof result.result === "string" ? JSON.parse(result.result) : (result.result || result);';
file = file.replace(extractionTarget, extractionTarget + '\n            setHasUnsavedChanges(true);');

fs.writeFileSync('app/admin/add-job/page.tsx', file);
console.log("Applied unbreakable safety lock!");
