const fs = require('fs');
let content = fs.readFileSync('components/Navbar.tsx', 'utf8');

content = content.replace(
  /\{\/\* EMAIL IS COMPULSORY, PHONE IS OPTIONAL \*\/[\s\S]*?let fullPhone = null;/,
  `{/* CONTACT METHOD */}
  
  <div className="space-y-5">
  
    
  
    {/* EMAIL */}
  
    <div>
  
      <label className="block mb-2 font-medium">
        Email
        <span className="text-red-500">
          {" "}*
        </span>
      </label>
  
      <input
        id="register-email"
        type="email"
        placeholder="Enter email"
        className="w-full border rounded-xl px-4 py-3"
        onChange={(e) => {
  
          const value =
            e.target.value.toLowerCase();
  
          const emailMessage =
            document.getElementById(
              "email-message"
            );
  
          if (!emailMessage) return;
  
          const validEmail = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
          if (!validEmail.test(value)) {
            emailMessage.innerHTML = "Enter valid email address";
            emailMessage.className = "text-sm mt-2 text-red-500";
          } else {
            emailMessage.innerHTML = "Checking availability...";
            emailMessage.className = "text-sm mt-2 text-gray-500";
            
            supabase.from('profiles').select('email').ilike('email', value).maybeSingle().then(({ data }) => {
              if (data) {
                emailMessage.innerHTML = "Email already registered";
                emailMessage.className = "text-sm mt-2 text-red-500";
              } else {
                emailMessage.innerHTML = "Email available ✓";
                emailMessage.className = "text-sm mt-2 text-green-600";
              }
            });
          }
  
        }}
      />
  
      <p
        id="email-message"
        className="text-sm mt-2"
      ></p>
  
    </div>
  
   {/* PHONE */}
  
  <div>
  
    <label className="block mb-2 font-medium">
      Phone Number <span className="text-sm font-normal text-gray-500">(Optional)</span>
    </label>
  
    {/* INSTRUCTION */}
  
    <p className="text-sm text-gray-500 mb-2">
      Enter number along with country code
      (Example: +91 9876543210)
    </p>
  
    <div className="flex gap-3">
  
      {/* COUNTRY CODE */}
  
      <input
        type="text"
        placeholder="+91"
        id="country-code"
        className="w-24 border rounded-xl px-4 py-3"
      />
  
      {/* PHONE NUMBER */}
  
      <input
        id="register-phone"
        type="tel"
        placeholder="9876543210"
        className="flex-1 border rounded-xl px-4 py-3"
        onChange={(e) => {
  
          const value =
            e.target.value;
  
          const code =
            (
              document.getElementById(
                "country-code"
              ) as HTMLInputElement
            )?.value || "";
  
          const fullPhone =
            code + value;
  
          const phoneMessage =
            document.getElementById(
              "phone-message"
            );
  
          if (!phoneMessage) return;
  
          
          const validPhone = /^[0-9]{10}$/;
          if (value.trim() === "") {
            phoneMessage.innerHTML = "";
          } else if (!validPhone.test(value)) {
            phoneMessage.innerHTML = "Enter 10-digit number";
            phoneMessage.className = "text-sm mt-2 text-red-500";
          } else {
            phoneMessage.innerHTML = "Checking availability...";
            phoneMessage.className = "text-sm mt-2 text-gray-500";
            
            supabase.from('profiles').select('phone').eq('phone', fullPhone).maybeSingle().then(({ data }) => {
              if (data) {
                phoneMessage.innerHTML = "Phone number already registered";
                phoneMessage.className = "text-sm mt-2 text-red-500";
              } else {
                phoneMessage.innerHTML = "Phone available ✓";
                phoneMessage.className = "text-sm mt-2 text-green-600";
              }
            });
          }
  
        }}
      />
  
    </div>
  
    {/* MESSAGE */}
  
    <p
      id="phone-message"
      className="text-sm mt-2"
    ></p>
  
  </div>
  
  </div>

  /* EMAIL IS COMPULSORY, PHONE IS OPTIONAL */

        if (!email) {
          alert("Enter email address");
          return;
        }

        let fullPhone = null;`
);

fs.writeFileSync('components/Navbar.tsx', content);
console.log("Restored JSX correctly");