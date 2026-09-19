const fs = require('fs');

let code = fs.readFileSync('components/Navbar.tsx', 'utf8');

const regex = /<nav className="bg-black text-white px-4 md:px-8 py-5 flex items-center justify-between relative z-50">[\s\S]*?<div className="hidden md:flex items-center gap-8">/;

const newNav = `<nav className="bg-black text-white relative z-50">

  {/* MOBILE HEADER - 2 LINES */}
  <div className="md:hidden flex flex-col w-full">
    <div className="w-full text-center py-4 border-b border-gray-800">
      <Link href="/" className="text-xl font-bold tracking-widest uppercase">
        Trapped Into Architecture
      </Link>
    </div>
    
    <div className="flex items-center justify-between px-4 py-3">
      <button 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="flex items-center gap-2 text-lg font-medium hover:text-gray-300 transition"
      >
        <span className="text-2xl">☰</span>
        <span>Menu</span>
      </button>

      <div>
        {currentUser ? (
          currentUser.displayName && currentUser.displayName.trim() !== "" ? (
            <span className="font-semibold text-gray-200">{currentUser.displayName}</span>
          ) : (
            <button 
              onClick={() => {
                router.push(\`/profile/\${currentUser.username}\`);
              }} 
              className="text-red-400 font-bold hover:text-red-300 transition"
            >
              Set Display Name
            </button>
          )
        ) : (
          <div className="flex gap-4">
            <button 
              onClick={() => { setAuthTab("login"); setShowAuthPopup(true); }}
              className="font-semibold hover:text-gray-300 transition"
            >
              Login
            </button>
            <button 
              onClick={() => { setAuthTab("register"); setShowAuthPopup(true); }}
              className="font-semibold hover:text-gray-300 transition"
            >
              Register
            </button>
          </div>
        )}
      </div>
    </div>
  </div>

  {/* DESKTOP HEADER */}
  <div className="hidden md:flex px-8 py-5 items-center justify-between w-full">
    <Link href="/" className="text-2xl font-bold">
      Trapped Into Architecture
    </Link>

    <div className="flex items-center gap-8">`;

code = code.replace(regex, newNav);
code = code.replace('</nav>', '  </div>\n</nav>');

fs.writeFileSync('components/Navbar.tsx', code);
console.log('Fixed header');
