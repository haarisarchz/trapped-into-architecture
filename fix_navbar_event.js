const fs = require('fs');

let code = fs.readFileSync('components/Navbar.tsx', 'utf8');

const eventListener = `useEffect(() => {
  const handleOpenAuth = (e) => {
    setAuthTab(e.detail);
    setShowAuthPopup(true);
  };
  window.addEventListener('openAuth', handleOpenAuth);
  return () => window.removeEventListener('openAuth', handleOpenAuth);
}, []);`;

code = code.replace(/useEffect\(\(\) => \{\n  const storedUser = localStorage.getItem/, eventListener + '\n\nuseEffect(() => {\n  const storedUser = localStorage.getItem');

fs.writeFileSync('components/Navbar.tsx', code);
console.log('Added event listener');
