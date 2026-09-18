"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff } from "lucide-react";

export default function Navbar() {
  const router = useRouter();

  const [showProfileMenu, setShowProfileMenu] =
  useState(false);

const [showUserMenu, setShowUserMenu] =
  useState(false);

  const [showAuthPopup, setShowAuthPopup] =
    useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [showRegisterPassword, setShowRegisterPassword] =
  useState(false);

    const [currentUser, setCurrentUser] =
  useState<any>(null);

  const [mobileMenuOpen, setMobileMenuOpen] =
useState(false);

  const [authTab, setAuthTab] =
    useState<"login" | "register">("login");
useEffect(() => {

  const storedUser =
    localStorage.getItem("currentUser");

    const isAdmin =
  currentUser &&
  currentUser?.role && ["ceo", "admin", "super_admin", "owner"].includes(currentUser.role.toLowerCase());

  if (storedUser) {

    setCurrentUser(
      JSON.parse(storedUser)
    );

  }

}, []);

  return (
    <>

  <nav className="bg-black text-white px-4 md:px-8 py-5 flex items-center justify-between relative">

    {/* WEBSITE LOGO / NAME */}

    <Link
      href="/"
      className="text-2xl font-bold"
    >
      Trapped Into Architecture
    </Link>

    {/* MOBILE MENU BUTTON */}

    <button
      onClick={() =>
        setMobileMenuOpen(!mobileMenuOpen)
      }
      className="md:hidden text-3xl"
    >
      ☰
    </button>

    {/* RIGHT SIDE */}

    <div className="hidden md:flex items-center gap-8">

      {/* HOME */}

      <Link
        href="/"
        className="hover:text-gray-300 transition"
      >
        Home
      </Link>

      {/* JOBS */}

      <Link
        href="/jobs"
        className="hover:text-gray-300 transition"
      >
        Jobs
      </Link>

      {/* INTERNSHIPS */}

      <Link
        href="/internships"
        className="hover:text-gray-300 transition"
      >
        Internships
      </Link>

     {/* COMPANIES */}

<Link
  href="/companies"
  className="hover:text-gray-300 transition"
>
  Companies
</Link>

          {/* PRACTICE EXAMS */}

          <Link
            href="/practice-exams"
            className="hover:text-gray-300 transition"
          >
            Practice Exams
          </Link>

          {/* CONTACT */}

          <Link
            href="/contact"
            className="hover:text-gray-300 transition"
          >
            Contact
          </Link>

          {/* LOGIN REGISTER BUTTON */}

{currentUser ? (
  <div className="relative">
    <button
      onClick={() => setShowUserMenu(!showUserMenu)}
      className="border border-white px-5 py-2 rounded-xl hover:bg-white hover:text-black transition"
    >
      <div className="flex items-center gap-2">
        {currentUser.displayName}
      </div>
    </button>

    {showUserMenu && (
      <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white text-black shadow-lg overflow-hidden">

        <button
          onClick={() => {
            router.push(`/profile/${currentUser.username}`);
            setShowUserMenu(false);
          }}
          className="w-full text-left px-5 py-4 hover:bg-gray-100"
        >
          My Profile
        </button>

        {currentUser?.role && ["ceo", "admin", "super_admin", "owner"].includes(currentUser.role.toLowerCase()) && (
          <>
            <button
              onClick={() => {
                router.push("/admin");
                setShowUserMenu(false);
              }}
              className="w-full text-left px-5 py-4 hover:bg-gray-100"
            >
              Admin Dashboard
            </button>

            <button
              onClick={() => {
                router.push("/admin/add-job");
                setShowUserMenu(false);
              }}
              className="w-full text-left px-5 py-4 hover:bg-gray-100"
            >
              Add New Job
            </button>
          </>
        )}

        <button
          onClick={() => {
            localStorage.removeItem("currentUser");
            window.location.href = "/";
          }}
          className="w-full text-left px-5 py-4 hover:bg-gray-100 text-red-500"
        >
          Logout
        </button>

      </div>
    )}
  </div>
) : (
  <button
    onClick={() => setShowAuthPopup(true)}
    className="border border-white px-5 py-2 rounded-xl hover:bg-white hover:text-black transition"
  >
    Login / Register
  </button>
)}

        </div>

{/* MOBILE MENU */}

{mobileMenuOpen && (

  <div className="absolute top-full left-0 w-full bg-black text-white border-t border-gray-800 md:hidden z-50">

    <Link
      href="/"
      className="block px-6 py-1 border-b border-gray-800"
      onClick={() => setMobileMenuOpen(false)}
    >
      Home
    </Link>

    <Link
      href="/jobs"
      className="block px-6 py-1 border-b border-gray-800"
      onClick={() => setMobileMenuOpen(false)}
    >
      Jobs
    </Link>

    <Link
      href="/internships"
      className="block px-6 py-1 border-b border-gray-800"
      onClick={() => setMobileMenuOpen(false)}
    >
      Internships
    </Link>

    <div className="border-b border-gray-800">

      <div className="px-6 py-1 font-medium">
        Profile
      </div>

      <Link
        href="/companies"
        className="block pl-10 py-1 text-gray-300"
        onClick={() => setMobileMenuOpen(false)}
      >
        Companies
      </Link>

      <Link
        href="/individuals"
        className="block pl-10 py-1 text-gray-300"
        onClick={() => setMobileMenuOpen(false)}
      >
        Individuals
      </Link>

    </div>

    <Link
      href="/practice-exams"
      className="block px-6 py-1 border-b border-gray-800"
      onClick={() => setMobileMenuOpen(false)}
    >
      Practice Exams
    </Link>

    <Link
      href="/contact"
      className="block px-6 py-1 border-b border-gray-800"
      onClick={() => setMobileMenuOpen(false)}
    >
      Contact
    </Link>

    {currentUser ? (

      <>
        <button
          onClick={() => {
            router.push(`/profile/${currentUser.username}`);
            setMobileMenuOpen(false);
          }}
          className="w-full text-left px-6 py-1 border-b border-gray-800"
        >
          My Profile
        </button>

        <button
          onClick={() => {
            localStorage.removeItem("currentUser");
            window.location.href = "/";
          }}
          className="w-full text-left px-6 py-1 text-red-400"
        >
          Logout
        </button>
      </>

    ) : (

      <>
        <button
          onClick={() => {
            setAuthTab("login");
            setShowAuthPopup(true);
            setMobileMenuOpen(false);
          }}
          className="w-full text-left px-6 py-4 border-b border-gray-800"
        >
          Login
        </button>

        <button
          onClick={() => {
            setAuthTab("register");
            setShowAuthPopup(true);
            setMobileMenuOpen(false);
          }}
          className="w-full text-left px-6 py-4"
        >
          Register
        </button>
      </>

    )}

  </div>

)}

</nav>

      {/* AUTH POPUP */}

      {showAuthPopup && (

        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[999] p-4">

          <div className="bg-white w-full max-w-md rounded-3xl p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto">

            {/* CLOSE BUTTON */}

            <button
              onClick={() =>
                setShowAuthPopup(false)
              }
              className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md text-3xl hover:bg-gray-100 transition z-50"
            >
              ×
            </button>

            {/* TABS */}

            <div className="flex mb-8 border rounded-2xl overflow-hidden">

              <button
                onClick={() =>
                  setAuthTab("login")
                }
                className={`flex-1 py-3 font-semibold transition
                ${
                  authTab === "login"
                    ? "bg-black text-white"
                    : "bg-white text-black"
                }`}
              >
                Login
              </button>

              <button
                onClick={() =>
                  setAuthTab("register")
                }
                className={`flex-1 py-3 font-semibold transition
                ${
                  authTab === "register"
                    ? "bg-black text-white"
                    : "bg-white text-black"
                }`}
              >
                Register
              </button>

            </div>

{/* LOGIN */}

{authTab === "login" && (

  <div className="space-y-5">

    <h2 className="text-3xl font-bold text-center">
      Welcome Back
    </h2>

    {/* EMAIL / PHONE / USERNAME */}

    <div>

      <label className="block mb-2 font-medium">
        Email / Phone / Username
        <span className="text-red-500">
          {" "}*
        </span>
      </label>

      <input
        id="login-identity"
        type="text"
        placeholder="Enter email, phone or username"
        className="w-full border rounded-xl px-4 py-3"
        required
      />

    </div>

    {/* PASSWORD */}

    <div>

      <label className="block mb-2 font-medium">
        Password
        <span className="text-red-500">
          {" "}*
        </span>
      </label>

      <div className="relative">

  <div className="relative">

  <input
    id="login-password"
    type={showLoginPassword ? "text" : "password"}
    placeholder="Enter password"
    className="w-full border rounded-xl px-4 py-3 pr-12"
    required
  />

  <button
    type="button"
    onClick={() =>
      setShowLoginPassword(!showLoginPassword)
    }
    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
  >
    {showLoginPassword ? (
  <EyeOff size={20} />
) : (
  <Eye size={20} />
)}
  </button>

</div>

</div>

    </div>

    {/* FORGOT OPTIONS */}

    <div className="flex justify-between text-sm">

      <button
        type="button"
        className="text-gray-500 hover:text-black transition"
      >
        Forgot Username?
      </button>

      <button
        type="button"
        className="text-gray-500 hover:text-black transition"
      >
        Forgot Password?
      </button>

    </div>

    {/* LOGIN BUTTON */}

    <button
      onClick={async () => {

        const identity =
          (
            document.getElementById(
              "login-identity"
            ) as HTMLInputElement
          ).value;

        const password =
          (
            document.getElementById(
              "login-password"
            ) as HTMLInputElement
          ).value;

        if (!identity || !password) {

          alert(
            "Please fill all required fields."
          );

          return;

        }

        const { data, error } =
  await supabase.auth.signInWithPassword({
    email: identity,
    password,
  });

if (error) {

  alert(error.message);

  return;

}

if (data.user) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", data.user.email)
    .single();

  if (profile) {
    localStorage.setItem(
      "currentUser",
      JSON.stringify({
        fullName: profile.full_name,
        displayName: profile.display_name,
        email: profile.email,
        username: profile.username,
      })
    );
  }
}

setShowAuthPopup(false);

window.location.reload();

      }}
      className="w-full bg-black text-white py-3 rounded-xl hover:opacity-90 transition"
    >
      Login
    </button>

  </div>

)}

{/* REGISTER */}

{authTab === "register" && (

  <div className="space-y-5">

    <h2 className="text-3xl font-bold text-center">
      Create Account
    </h2>

    {/* FULL NAME */}

    <div>

      <label className="block mb-2 font-medium">
        Full Name
        <span className="text-red-500">
          {" "}*
        </span>
      </label>

      <input
        id="register-name"
        type="text"
        placeholder="Enter full name"
        className="w-full border rounded-xl px-4 py-3"
        required
      />

    </div>
{/* USERNAME */}

<div className="relative">

  {/* LABEL */}

  <div className="flex items-center gap-2 mb-2">

    <label className="font-medium">
      Username
      <span className="text-red-500">
        {" "}*
      </span>
    </label>

    {/* QUESTION MARK */}

    <div className="relative group">

      <div className="w-5 h-5 rounded-full bg-gray-200 text-black flex items-center justify-center text-xs cursor-pointer">
        ?
      </div>

      {/* TOOLTIP */}

      <div className="absolute left-7 top-0 hidden group-hover:block bg-black text-white text-xs rounded-xl px-4 py-3 w-72 z-50 shadow-lg">

        • Minimum 5 characters <br />
        • Maximum 12 characters <br />
        • Username is non-case sensitive <br />
        • Only letters, numbers, dots and underscore allowed <br />
        • No spaces allowed

      </div>

    </div>

  </div>

  {/* INPUT */}

  <input
    id="register-username"
    type="text"
    placeholder="Choose username"
    className="w-full border rounded-xl px-4 py-3"
    required
    minLength={5}
    maxLength={12}
    onChange={(e) => {

      const value =
        e.target.value.toLowerCase();

      const usernameMessage =
        document.getElementById(
          "username-message"
        );

      if (!usernameMessage) return;

      /* VALID CHARACTERS */

      const validPattern =
        /^[a-z0-9._]+$/;

      /* DEMO EXISTING USERNAMES */

      const takenUsernames = [
        "admin",
        "john123",
        "architecture",
        "designer"
      ];

      if (value.length < 5) {

        usernameMessage.innerHTML =
          "Minimum 5 characters required";

        usernameMessage.className =
          "text-sm mt-2 text-red-500";

      } else if (value.length > 12) {

        usernameMessage.innerHTML =
          "Maximum 12 characters allowed";

        usernameMessage.className =
          "text-sm mt-2 text-red-500";

      } else if (!validPattern.test(value)) {

        usernameMessage.innerHTML =
          "Only letters, numbers, dots and underscore allowed";

        usernameMessage.className =
          "text-sm mt-2 text-red-500";

      } else if (
        takenUsernames.includes(value)
      ) {

        usernameMessage.innerHTML =
          "Username already taken";

        usernameMessage.className =
          "text-sm mt-2 text-red-500";

      } else {

        usernameMessage.innerHTML =
          "Username available ✓";

        usernameMessage.className =
          "text-sm mt-2 text-green-600";

      }

    }}
  />

  {/* LIVE MESSAGE */}

  <p
    id="username-message"
    className="text-sm mt-2"
  ></p>

</div>

{/* CONTACT METHOD */}

<div className="space-y-5">

  {/* SELECT METHOD */}

  <div>

    <label className="block mb-2 font-medium">
      Preferred Login Method
      <span className="text-red-500">
        {" "}*
      </span>
    </label>

    <select
      id="contact-method"
      className="w-full border rounded-xl px-4 py-3"
      onChange={(e) => {

        const method = e.target.value;

        const emailBox =
          document.getElementById(
            "email-box"
          );

        const phoneBox =
          document.getElementById(
            "phone-box"
          );

        if (
          !emailBox ||
          !phoneBox
        ) return;

        if (method === "email") {

          emailBox.style.display =
            "block";

          phoneBox.style.display =
            "none";

        } else {

          emailBox.style.display =
            "none";

          phoneBox.style.display =
            "block";

        }

      }}
    >

      <option value="email">
        Email
      </option>

      <option value="phone">
        Phone Number
      </option>

    </select>

  </div>

  {/* EMAIL */}

  <div id="email-box">

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

        const existingEmails = [
          "admin@gmail.com",
          "test@gmail.com"
        ];

        const validEmail =
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!validEmail.test(value)) {

          emailMessage.innerHTML =
            "Enter valid email address";

          emailMessage.className =
            "text-sm mt-2 text-red-500";

        } else if (
          existingEmails.includes(value)
        ) {

          emailMessage.innerHTML =
            "Email already registered";

          emailMessage.className =
            "text-sm mt-2 text-red-500";

        } else {

          emailMessage.innerHTML =
            "Email available ✓";

          emailMessage.className =
            "text-sm mt-2 text-green-600";

        }

      }}
    />

    <p
      id="email-message"
      className="text-sm mt-2"
    ></p>

  </div>

 {/* PHONE */}

<div
  id="phone-box"
  style={{ display: "none" }}
>

  <label className="block mb-2 font-medium">
    Phone Number
    <span className="text-red-500">
      {" "}*
    </span>
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

        /* DEMO EXISTING NUMBERS */

        const existingPhones = [
          "+919876543210",
          "+919999999999"
        ];

        const validPhone =
          /^[0-9]{10}$/;

        if (!code.startsWith("+")) {

          phoneMessage.innerHTML =
            "Country code must start with +";

          phoneMessage.className =
            "text-sm mt-2 text-red-500";

        } else if (
          !validPhone.test(value)
        ) {

          phoneMessage.innerHTML =
            "Enter valid 10 digit phone number";

          phoneMessage.className =
            "text-sm mt-2 text-red-500";

        } else if (
          existingPhones.includes(fullPhone)
        ) {

          phoneMessage.innerHTML =
            "Phone number already registered";

          phoneMessage.className =
            "text-sm mt-2 text-red-500";

        } else {

          phoneMessage.innerHTML =
            "Phone number available ✓";

          phoneMessage.className =
            "text-sm mt-2 text-green-600";

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

    {/* PASSWORD */}

<div className="relative">

  {/* LABEL */}

  <div className="flex items-center gap-2 mb-2">

    <label className="font-medium">
      Password
      <span className="text-red-500">
        {" "}*
      </span>
    </label>

    {/* QUESTION MARK */}

    <div className="relative group">

      <div className="w-5 h-5 rounded-full bg-gray-200 text-black flex items-center justify-center text-xs cursor-pointer">
        ?
      </div>

      {/* TOOLTIP */}

      <div className="absolute left-7 top-0 hidden group-hover:block bg-black text-white text-xs rounded-xl px-4 py-3 w-64 z-50 shadow-lg">

        • Minimum 8 characters <br />
        • Maximum 16 characters <br />
        • Must contain letters and numbers <br />
        • Special characters allowed

      </div>

    </div>

  </div>

  {/* PASSWORD INPUT */}

  <div className="relative">

  <input
    id="register-password"
    type={
      showRegisterPassword
        ? "text"
        : "password"
    }
    placeholder="Create password"
    className="w-full border rounded-xl px-4 py-3 pr-12"
    required
    minLength={8}
    maxLength={16}
    onChange={(e) => {

      const value = e.target.value;

      const passwordMessage =
        document.getElementById(
          "password-message"
        );

      if (!passwordMessage) return;

      if (value.length < 8) {

        passwordMessage.innerHTML =
          "Minimum 8 characters required";

        passwordMessage.className =
          "text-sm mt-2 text-red-500";

      } else if (value.length > 16) {

        passwordMessage.innerHTML =
          "Maximum 16 characters allowed";

        passwordMessage.className =
          "text-sm mt-2 text-red-500";

      } else if (
        !/[A-Za-z]/.test(value) ||
        !/[0-9]/.test(value)
      ) {

        passwordMessage.innerHTML =
          "Password must contain letters and numbers";

        passwordMessage.className =
          "text-sm mt-2 text-red-500";

      } else {

        passwordMessage.innerHTML =
          "Strong password ✓";

        passwordMessage.className =
          "text-sm mt-2 text-green-600";

      }

    }}
  />

  <button
  type="button"
  onClick={() =>
    setShowRegisterPassword(
      !showRegisterPassword
    )
  }
  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
>
  {showRegisterPassword ? (
    <EyeOff size={20} />
  ) : (
    <Eye size={20} />
  )}
</button>

</div>

  {/* LIVE MESSAGE */}

  <p
    id="password-message"
    className="text-sm mt-2"
  ></p>

</div>

    {/* REGISTER BUTTON */}

    <button
      type="button"
      onClick={async () => {
        /* GET VALUES */

        const fullName = (
          document.getElementById(
            "register-name"
          ) as HTMLInputElement
        )?.value.trim();

        const username = (
          document.getElementById(
            "register-username"
          ) as HTMLInputElement
        )?.value.trim();

        const password = (
          document.getElementById(
            "register-password"
          ) as HTMLInputElement
        )?.value;

        const email = (
          document.getElementById(
            "register-email"
          ) as HTMLInputElement
        )?.value.trim();

        const phone = (
          document.getElementById(
            "register-phone"
          ) as HTMLInputElement
        )?.value.trim();

        const contactMethod = (
          document.getElementById(
            "contact-method"
          ) as HTMLSelectElement
        )?.value;

        /* VALIDATIONS */

        if (!fullName) {
          alert("Enter full name");
          return;
        }

        /* USERNAME RULES */

        const usernameRegex = /^[a-zA-Z0-9._]{5,12}$/;

        if (!usernameRegex.test(username)) {
          alert(
            "Username must be 5–12 characters and only contain letters, numbers, dots, or underscores."
          );
          return;
        }

        /* PASSWORD RULES */

        const passwordRegex =
          /^[a-zA-Z0-9!@#$%^&*()_+={}:;"'<>,.?/-]{8,16}$/;

        if (!passwordRegex.test(password)) {
          alert("Password must be 8–16 characters.");
          return;
        }

        /* CONTACT METHOD */

        if (contactMethod === "email") {
          if (!email) {
            alert("Enter email");
            return;
          }
        }

        if (contactMethod === "phone") {
          if (!phone) {
            alert("Enter phone number with country code");
            return;
          }
        }

        /* CREATE USER IN SUPABASE AUTH */

        const { data: authData, error: authError } =
          await supabase.auth.signUp({
            email,
            password,
          });

        if (authError) {
          alert(authError.message);
          return;
        }

        /* CREATE PROFILE */

        if (authData.user) {
          console.log("AUTH USER:", authData.user);

          const {
            data: profileData,
            error: profileError,
          } = await supabase
            .from("profiles")
            .insert([
              {
                id: authData.user.id,
                username,
                full_name: fullName,
                email,
                phone,
                role: "user",
                bio: "",
              },
            ])
            .select();

          console.log("PROFILE DATA:", profileData);
          console.log("PROFILE ERROR:", profileError);

          if (profileError) {
            alert(profileError.message);
            return;
          }

          console.log("PROFILE CREATED SUCCESSFULLY");

          alert("Account created successfully!");

          setShowAuthPopup(false);

          router.push(`/profile/${username}`);
        }
      }}
      className="w-full bg-black text-white py-4 rounded-2xl font-semibold hover:opacity-90 transition"
    >
      Register
    </button>
  </div>
)}

</div>

</div>

)}
  </>
);
}