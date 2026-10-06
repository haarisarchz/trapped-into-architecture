// @ts-nocheck
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Bell } from "lucide-react";

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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  const [authTab, setAuthTab] =
    useState<"login" | "register" | "success">("login");

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const [lastRead, setLastRead] = useState<Date | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("notifLastRead");
    if (stored) setLastRead(new Date(stored));
  }, []);

  useEffect(() => {
    const fetchNotifs = async () => {
      if (!currentUser?.role) return;
      const role = currentUser.role.toLowerCase().replace(/[\s_]+/g, "");
      const notifs: any[] = [];
      
      // 1. CEO Instagram Notifs
      if (role === "ceo") {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data } = await supabase.from('jobs')
          .select('id, firm_name, position, posted_date, status')
          .eq('status', 'published')
          .gte('posted_date', yesterday)
          .order('posted_date', { ascending: false });
          
        if (data) {
          data.forEach((job: any) => {
            notifs.push({
              id: job.id + '-ig',
              message: `${job.firm_name} hiring post is successfully posted in Instagram`,
              time: job.posted_date,
              link: null
            });
          });
        }
      }
      
      // 2. Admin/Superadmin/CEO missing logo notifs
      if (["superadmin", "admin", "ceo"].includes(role)) {
        let userId = currentUser.id;
        if (!userId && currentUser.username) {
          const { data: pData } = await supabase.from("profiles").select("id").eq("username", currentUser.username).maybeSingle();
          if (pData) userId = pData.id;
        }
        
        if (userId) {
          const { data: noLogoComps } = await supabase.from("companies")
            .select("id, firm_name, created_at, logo_url")
            .eq("created_by", userId);
            
          if (noLogoComps) {
            const missingLogos = noLogoComps.filter((c: any) => !c.logo_url || c.logo_url.trim() === "");
            missingLogos.forEach((comp: any) => {
              notifs.push({
                id: comp.id + '-logo',
                message: `The recent company that you added (${comp.firm_name}) doesn't have a logo. Add a logo.`,
                time: comp.created_at || new Date().toISOString(),
                link: `/admin/companies/edit/${comp.id}`
              });
            });
          }
        }
      }
      
      setNotifications(notifs.sort((a,b) => new Date(b.time).getTime() - new Date(a.time).getTime()));
    };
    
    fetchNotifs();
  }, [currentUser]);

  const handleBellClick = () => {
    setShowNotif(!showNotif);
    if (!showNotif) {
      const now = new Date();
      setLastRead(now);
      localStorage.setItem("notifLastRead", now.toISOString());
    }
  };

  const hasUnread = notifications.some(n => !lastRead || new Date(n.time) > lastRead);

  const timeAgo = (dateStr: string) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

useEffect(() => {
    supabase.from("site_settings").select("logo_url").eq("id", "global").maybeSingle().then(({data}) => {
      if(data) setSettings(data);
    });
  }, []);

  useEffect(() => {
  const handleOpenAuth = (e) => {
    setAuthTab(e.detail);
    setShowAuthPopup(true);
  };
  window.addEventListener('openAuth', handleOpenAuth);
  return () => window.removeEventListener('openAuth', handleOpenAuth);
}, []);

useEffect(() => {
  const storedUser = localStorage.getItem("currentUser");
  if (storedUser) {
    const parsed = JSON.parse(storedUser);
    setCurrentUser(parsed);
    
    // Auto-patch missing role for older sessions
    if (!parsed.role && parsed.username) {
      supabase.from("profiles").select("role").eq("username", parsed.username).single().then(({data}) => {
        if (data && data.role) {
          parsed.role = data.role;
          localStorage.setItem("currentUser", JSON.stringify(parsed));
          setCurrentUser({...parsed});
        }
      });
    }
  }
}, []);

  return (
    <>

  <nav className="bg-black text-white relative z-50">

  {/* MOBILE HEADER - 2 LINES */}
  <div className="md:hidden flex flex-col w-full">
    <div className="w-full text-center py-4 border-b border-gray-800">
      <Link href="/" className="text-xl font-bold tracking-widest uppercase flex items-center justify-center gap-3">
        {settings?.logo_url && <img src={settings.logo_url} alt="Site Logo" className="h-8 md:h-10 object-contain inline-block" />}
        <span>Trapped Into Architecture</span>
      </Link>
    </div>
    
    <div className="flex items-center justify-between px-4 py-3">
      <button 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="flex items-center gap-2 text-lg font-medium hover:text-gray-300 transition"
        aria-label="Open navigation menu"
      >
        <span className="text-2xl">☰</span>
        <span>Menu</span>
      </button>

      <div className="flex items-center">


          {currentUser ? (
          (currentUser.displayName && currentUser.displayName.trim() !== "" && currentUser.profession && currentUser.profession.trim() !== "") ? (
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)} 
                className="font-semibold text-gray-200 hover:text-white transition flex items-center gap-1"
                aria-label="Open account menu"
              >
                {currentUser.displayName}
                <span className="text-xs">▼</span>
              </button>
              
    {showUserMenu && (
      <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white text-black shadow-lg overflow-hidden z-[100] border border-gray-100">
        <button
          onClick={() => {
            router.push(`/profile/${currentUser.username}?highlight=displayName`);
            setShowUserMenu(false);
          }}
          className="w-full text-left px-5 py-4 hover:bg-red-50 text-red-500 font-bold border-b border-gray-100"
        >
          My Profile
        </button>

        {currentUser?.role && ["superadmin", "admin", "ceo"].includes((currentUser.role || "").toLowerCase().replace(/[\s_]+/g, "")) && (
          <>
            <button
              onClick={() => {
                router.push("/admin");
                setShowUserMenu(false);
              }}
              className="w-full text-left px-5 py-4 hover:bg-gray-50 border-b border-gray-100 font-medium"
            >
              Admin Dashboard
            </button>

            <button
              onClick={() => {
                router.push("/admin/add-job");
                setShowUserMenu(false);
              }}
              className="w-full text-left px-5 py-4 hover:bg-gray-50 border-b border-gray-100 font-medium"
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
          className="w-full text-left px-5 py-4 hover:bg-gray-50 text-red-600 font-medium"
        >
          Logout
        </button>
      </div>
    )}

            </div>
          ) : (
            <button 
              onClick={() => {
                router.push(`/profile/${currentUser.username}`);
              }} 
              className="text-red-400 font-bold hover:text-red-300 transition"
            >Complete Profile</button>
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
        {/* BELL ICON */}
        {currentUser && (
          <div className="relative flex items-center ml-3 md:ml-4">
            <button onClick={handleBellClick} className="text-white hover:text-gray-300 relative p-1 transition">
              <Bell size={24} />
              {hasUnread && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-black"></span>}
            </button>
            {showNotif && (
              <div className="absolute right-0 top-10 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-[999] text-black">
                <div className="p-4 border-b border-gray-100 font-bold text-left text-black">Notifications</div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-gray-500 text-sm text-center">No notifications yet</div>
                  ) : (
                    notifications.map((n: any) => (
                      <div 
                        key={n.id} 
                        className={`p-4 border-b border-gray-50 flex flex-col gap-1 transition text-left ${n.link ? 'cursor-pointer hover:bg-gray-100' : 'hover:bg-gray-50'}`}
                        onClick={() => {
                          if (n.link) {
                            router.push(n.link);
                            setShowNotif(false);
                          }
                        }}
                      >
                        <p className="text-sm font-medium leading-tight text-gray-800">{n.message}</p>
                        <p className="text-xs text-gray-400">{timeAgo(n.time)}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </div>

  {/* DESKTOP HEADER */}
  <div className="hidden md:flex px-8 py-5 items-center justify-between w-full">
    <Link href="/" className="text-2xl font-bold flex items-center gap-3">
        {settings?.logo_url && <img src={settings.logo_url} alt="Site Logo" className="h-8 md:h-10 object-contain inline-block" />}
        <span>Trapped Into Architecture</span>
      </Link>

    <div className="flex items-center gap-8">

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
      <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white text-black shadow-lg overflow-hidden z-50">

        <button
          onClick={() => {
            router.push(`/profile/${currentUser.username}`);
            setShowUserMenu(false);
          }}
          className="w-full text-left px-5 py-4 hover:bg-red-50 text-red-500 font-bold"
        >
          My Profile
        </button>

        {currentUser?.role && ["superadmin", "admin", "ceo"].includes((currentUser.role || "").toLowerCase().replace(/[\s_]+/g, "")) && (
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
        {/* BELL ICON */}
        {currentUser && (
          <div className="relative flex items-center ml-3 md:ml-4">
            <button onClick={handleBellClick} className="text-white hover:text-gray-300 relative p-1 transition">
              <Bell size={24} />
              {hasUnread && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-black"></span>}
            </button>
            {showNotif && (
              <div className="absolute right-0 top-10 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-[999] text-black">
                <div className="p-4 border-b border-gray-100 font-bold text-left text-black">Notifications</div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-gray-500 text-sm text-center">No notifications yet</div>
                  ) : (
                    notifications.map((n: any) => (
                      <div 
                        key={n.id} 
                        className={`p-4 border-b border-gray-50 flex flex-col gap-1 transition text-left ${n.link ? 'cursor-pointer hover:bg-gray-100' : 'hover:bg-gray-50'}`}
                        onClick={() => {
                          if (n.link) {
                            router.push(n.link);
                            setShowNotif(false);
                          }
                        }}
                      >
                        <p className="text-sm font-medium leading-tight text-gray-800">{n.message}</p>
                        <p className="text-xs text-gray-400">{timeAgo(n.time)}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        </div>

  </div>

  {/* MOBILE MENU */}
{mobileMenuOpen && (
  <div className="absolute top-full left-0 w-full bg-black text-white border-t border-gray-800 md:hidden z-50 shadow-2xl flex flex-col">
    <Link href="/" className="block px-6 py-4 border-b border-gray-800 text-lg hover:bg-gray-900 transition" onClick={() => setMobileMenuOpen(false)}>Home</Link>
    <Link href="/jobs" className="block px-6 py-4 border-b border-gray-800 text-lg hover:bg-gray-900 transition" onClick={() => setMobileMenuOpen(false)}>Jobs</Link>
    <Link href="/companies" className="block px-6 py-4 border-b border-gray-800 text-lg hover:bg-gray-900 transition" onClick={() => setMobileMenuOpen(false)}>Companies</Link>
    <Link href="/internships" className="block px-6 py-4 border-b border-gray-800 text-lg hover:bg-gray-900 transition" onClick={() => setMobileMenuOpen(false)}>Internships</Link>
      <Link href="/contact" className="block px-6 py-4 border-b border-gray-800 text-lg hover:bg-gray-900 transition" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
    
    
    
    {!currentUser && (
      <div className="flex bg-gray-900">
        <button
          onClick={() => {
            setAuthTab("login");
            setShowAuthPopup(true);
            setMobileMenuOpen(false);
          }}
          className="flex-1 text-center px-6 py-4 font-bold hover:bg-gray-800 transition border-r border-gray-800"
        >
          Login
        </button>
        <button
          onClick={() => {
            setAuthTab("register");
            setShowAuthPopup(true);
            setMobileMenuOpen(false);
          }}
          className="flex-1 text-center px-6 py-4 font-bold hover:bg-gray-800 transition"
        >
          Register
        </button>
      </div>
    )}
  </div>
)}
</nav>


{/* AUTH POPUP */}

      {showAuthPopup && (

        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[999] p-4">

          <div className="bg-white text-black w-full max-w-md rounded-3xl p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto">

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
        role: profile.role,
        profession: profile.profession,
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

      
        if (value.length < 5) {
          usernameMessage.innerHTML = "Minimum 5 characters required";
          usernameMessage.className = "text-sm mt-2 text-red-500";
        } else if (value.length > 12) {
          usernameMessage.innerHTML = "Maximum 12 characters allowed";
          usernameMessage.className = "text-sm mt-2 text-red-500";
        } else if (!validPattern.test(value)) {
          usernameMessage.innerHTML = "Only letters, numbers, dots and underscore allowed";
          usernameMessage.className = "text-sm mt-2 text-red-500";
        } else {
          usernameMessage.innerHTML = "Checking availability...";
          usernameMessage.className = "text-sm mt-2 text-gray-500";
          
          supabase.from('profiles').select('username').ilike('username', value).maybeSingle().then(({ data }) => {
            if (data) {
              usernameMessage.innerHTML = "Username already taken";
              usernameMessage.className = "text-sm mt-2 text-red-500";
            } else {
              usernameMessage.innerHTML = "Username available ✓";
              usernameMessage.className = "text-sm mt-2 text-green-600";
            }
          });
        }

    }}
  />

  {/* LIVE MESSAGE */}

  <p
    id="username-message"
    className="text-sm mt-2"
  ></p>

</div>


  
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

  {/* DISPLAY NAME */}
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
  </div>
  
  {/* CONTACT METHOD */}

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

        const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
        if (!validPhone.test(value)) {
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

        
          const displayName = (
            document.getElementById(
              "register-display-name"
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

        const profession = (
            document.getElementById(
              "register-profession"
            ) as HTMLSelectElement
          )?.value;
          
          

        /* VALIDATIONS */

        if (!fullName) {
          alert("Enter full name");
          return;
        }

        /* USERNAME RULES */

        
          if (!profession) {
              alert("Select profession");
              return;
            }
            if (!displayName) {
            alert("Enter display name");
            return;
          }
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

        /* EMAIL IS COMPULSORY, PHONE IS OPTIONAL */

        if (!email) {
          alert("Enter email address");
          return;
        }

        let fullPhone = null;
        if (phone) {
          const countryCode = (document.getElementById("country-code") as HTMLInputElement)?.value || "";
          fullPhone = countryCode + phone;
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
                display_name: displayName,
                email,
                phone: fullPhone || null,
                profession,
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

          
          await supabase.auth.signOut();
          setAuthTab("success");
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