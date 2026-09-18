const fs = require("fs");
let code = fs.readFileSync("components/Navbar.tsx", "utf8");
code = code.replace(
  `<nav className="bg-black text-white px-4 md:px-8 py-5 flex items-center justify-between relative">`,
  `<nav className="bg-black text-white px-4 md:px-8 py-5 flex items-center justify-between relative z-50">`
);
code = code.replace(
  `<div className="absolute right-0 mt-2 w-56 rounded-xl bg-white text-black shadow-lg overflow-hidden">`,
  `<div className="absolute right-0 mt-2 w-56 rounded-xl bg-white text-black shadow-lg overflow-hidden z-50">`
);
fs.writeFileSync("components/Navbar.tsx", code);

