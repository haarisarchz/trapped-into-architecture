const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');

// 1. Add "success" to authTab type
content = content.replace(
  `useState<"login" | "register">("login");`,
  `useState<"login" | "register" | "success">("login");`
);

// 2. Add Profession dropdown in Register form before Display Name
const profHTML = `
  {/* PROFESSION */}
  <div>
    <label className="block mb-2 font-medium">
      Profession
      <span className="text-red-500"> *</span>
    </label>
    <select
      id="register-profession"
      className="w-full border rounded-xl px-4 py-3"
      required
    >
      <option value="">Select Profession</option>
      <option value="Practising Architect">Practising Architect</option>
      <option value="Academician">Academician</option>
      <option value="Undergraduate Student">Undergraduate Student</option>
      <option value="Postgraduate Student">Postgraduate Student</option>
      <option value="Research Scholar">Research Scholar</option>
    </select>
  </div>
`;

content = content.replace(
  `{/* DISPLAY NAME */}`,
  profHTML + `\n  {/* DISPLAY NAME */}`
);

// 3. Extract Profession value in onClick
content = content.replace(
  `const contactMethod = (`,
  `const profession = (
            document.getElementById(
              "register-profession"
            ) as HTMLSelectElement
          )?.value;
          
          const contactMethod = (`
);

// 4. Validate Profession
content = content.replace(
  `if (!displayName) {`,
  `if (!profession) {
              alert("Select profession");
              return;
            }
            if (!displayName) {`
);

// 5. Add Profession to Profile insert
content = content.replace(
  `phone,
                role: "user",`,
  `phone,
                profession,
                role: "user",`
);

// 6. Update Success Action
const oldSuccess = `alert("Account created successfully! Please log in.");
          await supabase.auth.signOut();
          setAuthTab("login");`;

const newSuccess = `
          await supabase.auth.signOut();
          setAuthTab("success");`;

content = content.replace(oldSuccess, newSuccess);

// 7. Add Success UI block
const successUI = `
{/* SUCCESS */}

{authTab === "success" && (
  <div className="text-center space-y-6 py-8">
    <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto text-4xl mb-4">✓</div>
    <h2 className="text-3xl font-bold">Registration Successful</h2>
    <p className="text-gray-600 text-lg">Your account has been created successfully. Login to continue.</p>
    <button 
      onClick={() => setAuthTab("login")} 
      className="w-full bg-black text-white py-4 rounded-2xl font-semibold hover:opacity-90 transition mt-6"
    >
      Login
    </button>
  </div>
)}
`;

content = content.replace(`{/* REGISTER */}`, successUI + `\n{/* REGISTER */}`);

fs.writeFileSync('components/Navbar.tsx', content);
console.log("Updated Navbar for registration success flow and profession");