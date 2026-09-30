const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');

const oldDisplayNameBlock = `  {/* DISPLAY NAME */}
  <div>
    <label className="block mb-2 font-medium">
      Display Name
      <span className="text-red-500"> *</span>
    </label>
    <input
      id="register-display-name"
      type="text"
      placeholder="e.g. John Doe"
      className="w-full border rounded-xl px-4 py-3 text-black"
      required
    />
  </div>`;

const newDisplayNameBlock = `  {/* DISPLAY NAME */}
  <div className="relative">
    <div className="flex items-center gap-2 mb-2">
      <label className="font-medium">
        Display Name
        <span className="text-red-500"> *</span>
      </label>
      
      {/* QUESTION MARK */}
      <div className="relative group">
        <div className="w-5 h-5 rounded-full bg-gray-200 text-black flex items-center justify-center text-xs cursor-pointer">
          ?
        </div>
        
        {/* TOOLTIP */}
        <div className="absolute left-7 top-0 hidden group-hover:block bg-black text-white text-xs rounded-xl px-4 py-3 w-56 z-50 shadow-lg">
          Type Name to be displayed on the Profile
        </div>
      </div>
    </div>
    
    <input
      id="register-display-name"
      type="text"
      placeholder="e.g. John Doe"
      className="w-full border rounded-xl px-4 py-3 text-black"
      required
    />
  </div>`;

content = content.replace(oldDisplayNameBlock, newDisplayNameBlock);

fs.writeFileSync('components/Navbar.tsx', content);
console.log("Updated Display Name block with tooltip");