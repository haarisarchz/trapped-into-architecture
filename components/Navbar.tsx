// @ts-nocheck
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Bell, Menu, X, ChevronDown, Check, ArrowRight, Mail, ShieldCheck, RefreshCw, AlertCircle } from "lucide-react";
import { calculateProfileCompletion } from "@/utils/profileCompletion";
import { calculateCompanyLevel } from "@/utils/companyLevel";

export default function Navbar() {
  const router = useRouter();

  const [showVacanciesMenu, setShowVacanciesMenu] = useState(false);
  const [showProfilesMenu, setShowProfilesMenu] = useState(false);
  const [mobileVacanciesOpen, setMobileVacanciesOpen] = useState(false);
  const [mobileProfilesOpen, setMobileProfilesOpen] = useState(false);

  const [showUserMenu, setShowUserMenu] = useState(false);

  const [showAuthPopup, setShowAuthPopup] =
    useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [showRegisterPassword, setShowRegisterPassword] =
  useState(false);

    const [currentUser, setCurrentUser] =
  useState<any>(null);
  const [showCompanyAdminModal, setShowCompanyAdminModal] = useState(false);
  const [isCompanyAdmin, setIsCompanyAdmin] = useState(false);

  const userRoleNormalized = (currentUser?.role || "").toLowerCase().replace(/[\s_]+/g, "");
  const isInternalAdmin = ["superadmin", "admin", "ceo", "jobadmin"].includes(userRoleNormalized);
  const isSuperAdminOrCeo = ["superadmin", "ceo"].includes(userRoleNormalized);
  const [userTier, setUserTier] = useState<string>("bronze");

  const getDisplayNameTierStyles = (tier: string) => {
    switch (tier) {
      case "diamond":
        return "bg-gradient-to-r from-purple-700 via-fuchsia-600 to-indigo-700 text-white border border-purple-300 shadow-sm font-black";
      case "platinum":
        return "bg-gradient-to-r from-cyan-400 via-sky-300 to-teal-300 text-slate-950 border border-cyan-200 shadow-sm font-black";
      case "gold":
        return "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-950 border border-amber-300 shadow-sm font-black";
      case "silver":
        return "bg-gradient-to-r from-slate-200 via-gray-100 to-slate-200 text-slate-950 border border-slate-300 shadow-sm font-black";
      case "bronze":
        return "bg-gradient-to-r from-[#935624] to-[#713D14] text-white border border-[#AD6E35] shadow-sm font-bold";
      default:
        return "border border-white/80 bg-white/10 text-white hover:bg-white hover:text-black font-semibold";
    }
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    if (currentUser && typeof window !== 'undefined') {
      const hasSeen = localStorage.getItem('tia_has_seen_welcome');
      if (!hasSeen) {
        setShowWelcomeModal(true);
      }
    }
  }, [currentUser]);
  const [settings, setSettings] = useState<any>(null);

    const [authTab, setAuthTab] =
    useState<"login" | "register" | "verify" | "success">("login");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationFullName, setVerificationFullName] = useState("");
  const [verificationUserId, setVerificationUserId] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [verifyStatusMessage, setVerifyStatusMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);
  const [resendingCode, setResendingCode] = useState(false);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const [calloutDismissed, setCalloutDismissed] = useState(false);
  const [lastRead, setLastRead] = useState<Date | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (!(event.target).closest('.notif-container')) {
        setShowNotif(false);
      }
      if (!(event.target).closest('.vacancies-menu-container')) {
        setShowVacanciesMenu(false);
      }
      if (!(event.target).closest('.profiles-menu-container')) {
        setShowProfilesMenu(false);
      }
      if (!(event.target).closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    if (showNotif) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotif]);

  useEffect(() => {
    const stored = localStorage.getItem("notifLastRead");
    if (stored) setLastRead(new Date(stored));
  }, []);

  useEffect(() => {
    const fetchNotifs = async () => {
      if (!currentUser) return;
      const role = (currentUser.role || "").toLowerCase().replace(/[\s_]+/g, "");
      const notifs: any[] = [];

      let userId = currentUser.id;
      let userProf: any = null;
      if (userId) {
        const { data: pData } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
        userProf = pData;
      }
      if (!userProf && currentUser.username) {
        const { data: pData } = await supabase.from("profiles").select("*").eq("username", currentUser.username).maybeSingle();
        userProf = pData;
        if (userProf) userId = userProf.id;
      }
      if (!userProf && currentUser.email) {
        const { data: pData } = await supabase.from("profiles").select("*").eq("email", currentUser.email).maybeSingle();
        userProf = pData;
        if (userProf) userId = userProf.id;
      }

      // A. Member Milestone Level-Up Notifications (Silver 45%, Gold 66%, Platinum 81%, Diamond 91%)
      if (userProf && userId) {
        try {
          const { data: edus } = await supabase.from("educations").select("*").eq("user_id", userId);
          const { data: exps } = await supabase.from("experiences").select("*").eq("user_id", userId);
          const { percentage, badgeTier } = calculateProfileCompletion(userProf, edus || [], exps || []);
          const profTime = userProf.updated_at || userProf.created_at || new Date().toISOString();
          let calculatedTier = badgeTier || "bronze";
          if (percentage >= 91) calculatedTier = "diamond";
          else if (percentage >= 81) calculatedTier = "platinum";
          else if (percentage >= 66) calculatedTier = "gold";
          else if (percentage >= 45) calculatedTier = "silver";
          else calculatedTier = "bronze";
          setUserTier(calculatedTier);

          if (percentage >= 91) {
            notifs.push({
              id: `member-tier-diamond-${userId}`,
              message: `👑 Diamond Rank Unlocked (${percentage}%)! Your profile is among the top 1% of architecture professionals.`,
              time: profTime,
              link: `/profile/${userProf.username || ""}`
            });
          } else if (percentage >= 81) {
            notifs.push({
              id: `member-tier-platinum-${userId}`,
              message: `💎 Platinum Member Unlocked (${percentage}%)! You receive priority recommendations and exclusive alerts.`,
              time: profTime,
              link: `/profile/${userProf.username || ""}`
            });
          } else if (percentage >= 66) {
            notifs.push({
              id: `member-tier-gold-${userId}`,
              message: `🏆 Gold Member Unlocked (${percentage}%)! You can now publish job openings and feature your profile.`,
              time: profTime,
              link: `/profile/${userProf.username || ""}`
            });
          } else if (percentage >= 45) {
            notifs.push({
              id: `member-tier-silver-${userId}`,
              message: `🥈 Silver Member Unlocked (${percentage}%)! You can now claim existing studios or register a new practice.`,
              time: profTime,
              link: `/profile/${userProf.username || ""}`
            });
          }
        } catch (e) {
          console.warn("Could not calculate profile milestone notif:", e);
        }
      }

      // B. Studio Milestone Level-Up Notifications (for companies owned or claimed by this user)
      if (userId) {
        try {
          const { data: myComps } = await supabase
            .from("companies")
            .select("*")
            .or(`created_by.eq.${userId},claimed_by.eq.${userId}`);

          (myComps || []).forEach((c: any) => {
            const compLvl = calculateCompanyLevel(c);
            const compTime = c.updated_at || c.created_at || new Date().toISOString();
            if (compLvl.score >= 45) {
              notifs.push({
                id: `comp-tier-${c.id}-${compLvl.tier}`,
                message: `${compLvl.icon} ${compLvl.isInstitution ? "Institution Milestone" : "Studio Milestone"}: ${c.firm_name} is a ${compLvl.label} (${compLvl.score}%).${compLvl.tier === 'gold' || compLvl.tier === 'platinum' || compLvl.tier === 'diamond' ? (compLvl.isInstitution ? ' Eligible to post academic openings!' : ' Eligible to post job openings!') : ''}`,
                time: compTime,
                link: compLvl.isInstitution ? `/institutions/${c.slug}` : `/companies/${c.slug}`
              });
            }
          });
        } catch (e) {
          console.warn("Could not calculate studio milestone notif:", e);
        }
      }

      // C. User's Submitted Jobs Review Notifications (Approved / Rejected)
      if (userId) {
        try {
          const { data: userJobs } = await supabase
            .from("jobs")
            .select("id, firm_name, position, status, updated_at, posted_date")
            .eq("author_id", userId)
            .order("posted_date", { ascending: false })
            .limit(5);

          (userJobs || []).forEach((j: any) => {
            const jTime = j.updated_at || j.posted_date || new Date().toISOString();
            if (j.status === "published") {
              notifs.push({
                id: `job-pub-${j.id}`,
                message: `✅ Your job listing for "${j.position}" at ${j.firm_name} has been approved and published!`,
                time: jTime,
                link: `/jobs`
              });
            } else if (j.status === "rejected") {
              notifs.push({
                id: `job-rej-${j.id}`,
                message: `⚠️ Your job submission for "${j.position}" was not approved. Review details and resubmit.`,
                time: jTime,
                link: `/post-job`
              });
            }
          });
        } catch (e) {
          console.warn("Could not fetch user job status notif:", e);
        }
      }
      
      // 1. CEO Instagram Notifs
      if (role === "ceo") {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data } = await supabase.from('jobs')
          .select('id, firm_name, position, posted_date, status')
          .eq('status', 'published')
          .gte('posted_date', yesterday)
          .order('posted_date', { ascending: false });
          
        if (data) {
            const groupedJobs: Record<string, any> = {};
            data.forEach((job: any) => {
              if (!groupedJobs[job.firm_name]) {
                groupedJobs[job.firm_name] = job;
              }
            });
            Object.values(groupedJobs).forEach((job: any) => {
              notifs.push({
                id: job.id + '-pub',
                message: `${job.firm_name} hiring post is successfully published on the website`,
                time: job.posted_date,
                link: null
              });
            });
          }
      }
      
      // 2. Admin/Superadmin/CEO/JobAdmin missing logo notifs
      if (["superadmin", "admin", "ceo", "jobadmin", "companyadmin"].includes(role)) {
        let userId = currentUser.id;
        if (!userId && currentUser.username) {
          const { data: pData } = await supabase.from("profiles").select("id").eq("username", currentUser.username).maybeSingle();
          if (pData) userId = pData.id;
        }
        
        if (userId) {
          // Fetch missing logos only for companies created by the logged-in user
          const { data: noLogoComps } = await supabase
            .from("companies")
            .select("id, firm_name, created_at, logo_url")
            .eq("created_by", userId);
            
          if (noLogoComps) {
            const missingLogos = noLogoComps.filter((c: any) => !c.logo_url || c.logo_url.trim() === "");
            const now = new Date();

            // First 3 days: notify for each individual company
            const recentMissing = missingLogos.filter((comp: any) => {
              const createdDate = new Date(comp.created_at || now);
              const ageDays = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
              return ageDays <= 3;
            });

            recentMissing.forEach((comp: any) => {
              notifs.push({
                id: comp.id + '-logo',
                message: `The company you added (${comp.firm_name}) is missing a logo. Please add one.`,
                time: comp.created_at || now.toISOString(),
                link: `/admin/companies?filter=missing-logo`
              });
            });

            // Older than 3 days: notify weekly on Sundays as a digest
            const olderMissing = missingLogos.filter((comp: any) => {
              const createdDate = new Date(comp.created_at || now);
              const ageDays = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
              return ageDays > 3;
            });

            const isSunday = now.getDay() === 0;
            if (isSunday && olderMissing.length > 0) {
              const count = olderMissing.length;
              const names = olderMissing.slice(0, 2).map((c: any) => c.firm_name).join(', ');
              const extra = count > 2 ? ` and ${count - 2} other${count - 2 > 1 ? 's' : ''}` : '';
              notifs.push({
                id: 'sunday-digest-missing-logos-' + now.toISOString().split('T')[0],
                message: `Weekly Reminder: You have ${count} ${count === 1 ? 'company' : 'companies'} (${names}${extra}) missing logos. Please upload them.`,
                time: (function(){ const d = new Date(); d.setHours(9, 0, 0, 0); return d.toISOString(); })(),
                link: `/admin/companies?filter=missing-logo`
              });
            }
          }
        }
      }
      
      // 3. User activities, Email dispatches & Studio requests for CEO & Admins
      if (["ceo", "superadmin", "admin", "jobadmin"].includes(role)) {
        try {
          const { data: emailLogs } = await supabase
            .from("contact_inquiries")
            .select("id, name, email, subject, message, created_at")
            .in("subject", [
              "NOTIFIED_COMPANY_JOB_POSTING",
              "COMPANY_JOB_EMAIL_SENT",
              "COMPANY_JOB_EMAIL_PENDING",
              "NEW_USER_REGISTERED",
              "USER_VERIFIED",
              "USER_PHONE_VERIFIED",
              "STUDIO_CLAIM_REQUEST",
              "NEW_STUDIO_REGISTERED",
            ])
            .order("created_at", { ascending: false })
            .limit(30);

          (emailLogs || []).forEach((log: any) => {
            let icon = "✉️";
            let link: string | null = `/admin/jobs`;

            if (log.subject === "COMPANY_JOB_EMAIL_PENDING") {
              icon = "⏳";
              link = "/admin/jobs";
            } else if (log.subject === "NEW_USER_REGISTERED") {
              icon = "👤";
              link = "/admin/users";
            } else if (log.subject === "USER_VERIFIED") {
              icon = "🔒";
              link = "/admin/users";
            } else if (log.subject === "USER_PHONE_VERIFIED") {
              icon = "📱";
              link = "/admin/users";
            } else if (log.subject === "STUDIO_CLAIM_REQUEST") {
              icon = "🏛️";
              link = "/admin/claims";
            } else if (log.subject === "NEW_STUDIO_REGISTERED") {
              icon = "🏢";
              link = "/admin/companies";
            }

            notifs.push({
              id: `email-log-${log.id}`,
              message: `${icon} ${log.message}`,
              time: log.created_at,
              link,
            });
          });
        } catch (err) {
          console.warn("Failed to fetch email logs for notifications:", err);
        }
      }

      setNotifications(notifs.sort((a,b) => new Date(b.time).getTime() - new Date(a.time).getTime()));
    };
    
    fetchNotifs();
  }, [currentUser]);

  const handleBellClick = () => {
    setShowNotif(!showNotif);
    setCalloutDismissed(true);
    if (!showNotif) {
      const now = new Date();
      setLastRead(now);
      localStorage.setItem("notifLastRead", now.toISOString());
    }
  };

  const unreadNotifs = notifications.filter(n => !lastRead || new Date(n.time) > lastRead);
  const hasUnread = unreadNotifs.length > 0;
  const unreadCount = unreadNotifs.length;

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
    let isMounted = true;
    const checkCompanyAdminStatus = async () => {
      if (!currentUser) {
        setIsCompanyAdmin(false);
        return;
      }
      const r = (currentUser.role || "").toLowerCase().replace(/[\s_]+/g, "");
      if (["superadmin", "admin", "ceo", "jobadmin"].includes(r)) {
        return;
      }
      if (r === "companyadmin") {
        if (isMounted) setIsCompanyAdmin(true);
        return;
      }
      let uid = currentUser.id;
      if (!uid && currentUser.username) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("id, role")
          .eq("username", currentUser.username)
          .maybeSingle();
        if (prof) {
          uid = prof.id;
          const profRole = (prof.role || "").toLowerCase().replace(/[\s_]+/g, "");
          if (profRole === "companyadmin") {
            if (isMounted) setIsCompanyAdmin(true);
            return;
          }
        }
      }
      if (uid) {
        const { data: comps } = await supabase
          .from("companies")
          .select("id")
          .or(`created_by.eq.${uid},claimed_by.eq.${uid}`)
          .limit(1);
        if (isMounted) {
          setIsCompanyAdmin(!!(comps && comps.length > 0));
        }
      }
    };
    checkCompanyAdminStatus();
    const handleOpenModal = () => setShowCompanyAdminModal(true);
    window.addEventListener("openCompanyAdminModal", handleOpenModal);
    return () => {
      isMounted = false;
      window.removeEventListener("openCompanyAdminModal", handleOpenModal);
    };
  }, [currentUser]);

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


  const handleVerifyOtp = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setVerifyStatusMessage({ text: "Please enter the 6-digit code.", type: "error" });
      return;
    }
    setIsVerifyingCode(true);
    setVerifyStatusMessage(null);

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: verificationEmail,
          userId: verificationUserId,
          code: verificationCode.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVerifyStatusMessage({
          text: data.message || "Email verified successfully! You've unlocked your Verified Badge (+5%).",
          type: "success",
        });
      } else {
        setVerifyStatusMessage({
          text: data.error || "Invalid verification code. Please try again.",
          type: "error",
        });
      }
    } catch (err: any) {
      setVerifyStatusMessage({ text: "Network error. Please try again.", type: "error" });
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleResendVerificationCode = async () => {
    if (!verificationEmail) return;
    setResendingCode(true);
    try {
      const res = await fetch("/api/auth/send-verification-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: verificationEmail,
          fullName: verificationFullName,
          userId: verificationUserId,
          isResend: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVerifyStatusMessage({ text: "A fresh 6-digit code has been sent to your email!", type: "success" });
      } else {
        setVerifyStatusMessage({ text: data.error || "Failed to resend code.", type: "error" });
      }
    } catch (e) {
      setVerifyStatusMessage({ text: "Could not resend code. Please try again.", type: "error" });
    } finally {
      setResendingCode(false);
    }
  };

  return (
    <>

  <nav className="bg-black text-white relative z-50">

  {/* MOBILE HEADER - 2 LINES */}
  <div className="md:hidden flex flex-col w-full">
    <div className="w-full text-center py-4 border-b border-gray-800">
      <Link href="/" className="text-sm sm:text-base md:text-xl font-bold tracking-wide md:tracking-widest uppercase flex items-center justify-center gap-2 whitespace-nowrap">
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
        <Menu size={24} />
        <span>Menu</span>
      </button>

      <div className="flex items-center">


          {currentUser ? (
          
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)} 
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm transition flex items-center gap-1.5 ${getDisplayNameTierStyles(userTier)}`}
                aria-label="Open account menu"
                title={`${userTier.toUpperCase()} Member`}
              >
                <span>{currentUser.displayName || currentUser.username || "Profile"}</span>
                <ChevronDown size={14} className="opacity-80" />
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

        {/* Internal Admins (Super Admin, CEO, Job Admin) */}
        {isInternalAdmin && (
          <>
            <button
              onClick={() => {
                router.push("/admin/add-job");
                setShowUserMenu(false);
              }}
              className="w-full text-left px-5 py-4 hover:bg-gray-50 border-b border-gray-100 font-medium text-gray-900"
            >
              Add New Job
            </button>
            {isSuperAdminOrCeo && (
              <button
                onClick={() => {
                  router.push("/post-a-job?preview=true");
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-5 py-4 hover:bg-gray-50 border-b border-gray-100 font-medium text-gray-900 flex items-center gap-1.5"
              >
                <span>Post a Job (User View)</span>
              </button>
            )}
            <button
              onClick={() => {
                router.push("/admin");
                setShowUserMenu(false);
              }}
              className="w-full text-left px-5 py-4 hover:bg-gray-50 border-b border-gray-100 font-medium text-gray-900"
            >
              Admin Panel
            </button>
          </>
        )}

        {/* Company Admins (Client-side / Employer Admins) */}
        {!isInternalAdmin && isCompanyAdmin && (
          <button
            onClick={() => {
              router.push("/post-a-job");
              setShowUserMenu(false);
            }}
            className="w-full text-left px-5 py-4 hover:bg-gray-50 border-b border-gray-100 font-medium text-gray-900"
          >
            Post a Job
          </button>
        )}

        {/* Regular Users (Job Seekers / Unregistered / Non-admin) */}
        {!isInternalAdmin && !isCompanyAdmin && (
          <button
            onClick={() => {
              setShowCompanyAdminModal(true);
              setShowUserMenu(false);
            }}
            className="w-full text-left px-5 py-4 hover:bg-gray-50 border-b border-gray-100 font-medium text-gray-900"
          >
            Post a Job
          </button>
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
          <div className="relative flex items-center ml-3 md:ml-4 notif-container">
            <button onClick={handleBellClick} className="text-white hover:text-gray-300 relative p-1 transition">
              <Bell size={24} />
              {hasUnread && unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-black shadow">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            {/* FLOATING CALLOUT POPUP */}
            {hasUnread && !calloutDismissed && unreadCount > 0 && !showNotif && (
              <div className="absolute right-0 top-full mt-2.5 z-50 flex items-center bg-zinc-950 text-white text-xs font-semibold py-1.5 pl-3 pr-2 rounded-full shadow-2xl border border-zinc-700 whitespace-nowrap">
                <div 
                  onClick={handleBellClick} 
                  className="cursor-pointer flex items-center gap-1.5 hover:text-gray-200 transition"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  <span>{unreadCount} new notification{unreadCount !== 1 ? 's' : ''}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCalloutDismissed(true);
                  }}
                  className="ml-2 p-0.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition"
                  title="Dismiss"
                  aria-label="Dismiss"
                >
                  <X size={13} />
                </button>
              </div>
            )}

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

    <div className="flex items-center gap-4 lg:gap-5">

      {/* HOME */}
      <Link
        href="/"
        className="text-sm font-semibold text-gray-200 hover:text-white transition whitespace-nowrap py-1"
      >
        Home
      </Link>

      {/* FEED */}
      <Link
        href="/news-feed"
        className="text-sm font-semibold text-gray-200 hover:text-white transition whitespace-nowrap py-1"
      >
        Feed
      </Link>

      {/* VACANCIES (DROPDOWN: JOBS & INTERNSHIP) */}
      <div className="relative vacancies-menu-container">
        <button
          onClick={() => {
            setShowVacanciesMenu(!showVacanciesMenu);
            setShowProfilesMenu(false);
          }}
          className="text-sm font-semibold text-gray-200 hover:text-white transition flex items-center gap-1 cursor-pointer whitespace-nowrap py-1"
          aria-expanded={showVacanciesMenu}
        >
          <span>Vacancies</span>
          <ChevronDown size={14} className={`transition-transform duration-200 opacity-80 ${showVacanciesMenu ? 'rotate-180' : ''}`} />
        </button>

        {showVacanciesMenu && (
          <div className="absolute left-0 mt-2.5 w-52 rounded-2xl bg-white text-black shadow-2xl overflow-hidden z-50 border border-gray-200 animate-in fade-in zoom-in-95 duration-100 divide-y divide-gray-200">
            <Link
              href="/jobs"
              onClick={() => setShowVacanciesMenu(false)}
              className="w-full text-left px-5 py-3.5 hover:bg-gray-100 text-[15px] font-bold text-gray-900 flex items-center justify-between transition group"
            >
              <span>Jobs</span>
              <span className="text-xs text-gray-400 group-hover:text-black transition">&rarr;</span>
            </Link>
            <Link
              href="/internships"
              onClick={() => setShowVacanciesMenu(false)}
              className="w-full text-left px-5 py-3.5 hover:bg-gray-100 text-[15px] font-bold text-gray-900 flex items-center justify-between transition group"
            >
              <span>Internship</span>
              <span className="text-xs text-gray-400 group-hover:text-black transition">&rarr;</span>
            </Link>
          </div>
        )}
      </div>

      {/* PROFILES (DROPDOWN: COMPANIES & PROFESSIONALS) */}
      <div className="relative profiles-menu-container">
        <button
          onClick={() => {
            setShowProfilesMenu(!showProfilesMenu);
            setShowVacanciesMenu(false);
          }}
          className="text-sm font-semibold text-gray-200 hover:text-white transition flex items-center gap-1 cursor-pointer whitespace-nowrap py-1"
          aria-expanded={showProfilesMenu}
        >
          <span>Profiles</span>
          <ChevronDown size={14} className={`transition-transform duration-200 opacity-80 ${showProfilesMenu ? 'rotate-180' : ''}`} />
        </button>

        {showProfilesMenu && (
          <div className="absolute left-0 mt-2.5 w-56 rounded-2xl bg-white text-black shadow-2xl overflow-hidden z-50 border border-gray-200 animate-in fade-in zoom-in-95 duration-100 divide-y divide-gray-200">
            <Link
              href="/companies"
              onClick={() => setShowProfilesMenu(false)}
              className="w-full text-left px-5 py-3.5 hover:bg-gray-100 text-[15px] font-bold text-gray-900 flex items-center justify-between transition group"
            >
              <span>Companies & Firms</span>
              <span className="text-xs text-gray-400 group-hover:text-black transition">&rarr;</span>
            </Link>
            <Link
              href="/institutions"
              onClick={() => setShowProfilesMenu(false)}
              className="w-full text-left px-5 py-3.5 hover:bg-gray-100 text-[15px] font-bold text-gray-900 flex items-center justify-between transition group"
            >
              <span>Institutions & Colleges</span>
              <span className="text-xs text-gray-400 group-hover:text-black transition">&rarr;</span>
            </Link>
            <Link
              href="/individuals"
              onClick={() => setShowProfilesMenu(false)}
              className="w-full text-left px-5 py-3.5 hover:bg-gray-100 text-[15px] font-bold text-gray-900 flex items-center justify-between transition group"
            >
              <span>Professionals</span>
              <span className="text-xs text-gray-400 group-hover:text-black transition">&rarr;</span>
            </Link>
          </div>
        )}
      </div>

      {/* INSTITUTIONS */}
      <Link
        href="/institutions"
        className="text-sm font-semibold text-gray-200 hover:text-white transition whitespace-nowrap py-1"
      >
        Institutions
      </Link>

      {/* QUIZZES */}
      <Link
        href="/quizzes"
        className="text-sm font-semibold text-gray-200 hover:text-white transition whitespace-nowrap py-1"
      >
        Quizzes
      </Link>

      {/* CONTACTS */}
      <Link
        href="/contact"
        className="text-sm font-semibold text-gray-200 hover:text-white transition whitespace-nowrap py-1"
      >
        Contacts
      </Link>

          {/* LOGIN REGISTER BUTTON */}


  {currentUser ? (
  <div className="relative user-menu-container">
    <button
      onClick={() => setShowUserMenu(!showUserMenu)}
      className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs ${getDisplayNameTierStyles(userTier)}`}
      title={`${userTier.toUpperCase()} Member`}
    >
      <span>{currentUser.displayName || currentUser.username || "Profile"}</span>
      <ChevronDown size={14} className="opacity-80" />
    </button>

    {showUserMenu && (
      <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white text-black shadow-lg overflow-hidden z-50">

        <button
          onClick={() => {
            router.push(`/profile/${currentUser.username}`);
            setShowUserMenu(false);
          }}
          className="w-full text-left px-5 py-4 hover:bg-red-50 text-red-500 font-bold"
        >
          My Profile
        </button>

        {/* Internal Admins (Super Admin, CEO, Job Admin) */}
        {isInternalAdmin && (
          <>
            <button
              onClick={() => {
                router.push("/admin/add-job");
                setShowUserMenu(false);
              }}
              className="w-full text-left px-5 py-3 hover:bg-gray-100 border-b border-gray-100 font-medium text-gray-900"
            >
              Add New Job
            </button>
            {isSuperAdminOrCeo && (
              <button
                onClick={() => {
                  router.push("/post-a-job?preview=true");
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-5 py-3 hover:bg-gray-100 border-b border-gray-100 font-medium text-gray-900 flex items-center gap-1.5"
              >
                <span>Post a Job (User View)</span>
              </button>
            )}
            <button
              onClick={() => {
                router.push("/admin");
                setShowUserMenu(false);
              }}
              className="w-full text-left px-5 py-3 hover:bg-gray-100 border-b border-gray-100 font-medium text-gray-900"
            >
              Admin Panel
            </button>
          </>
        )}

        {/* Company Admins (Client-side / Employer Admins) */}
        {!isInternalAdmin && isCompanyAdmin && (
          <button
            onClick={() => {
              router.push("/post-a-job");
              setShowUserMenu(false);
            }}
            className="w-full text-left px-5 py-3 hover:bg-gray-100 border-b border-gray-100 font-medium text-gray-900"
          >
            Post a Job
          </button>
        )}

        {/* Regular Users (Job Seekers / Unregistered / Non-admin) */}
        {!isInternalAdmin && !isCompanyAdmin && (
          <button
            onClick={() => {
              setShowCompanyAdminModal(true);
              setShowUserMenu(false);
            }}
            className="w-full text-left px-5 py-3 hover:bg-gray-100 border-b border-gray-100 font-medium text-gray-900"
          >
            Post a Job
          </button>
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
          <div className="relative flex items-center ml-3 md:ml-4 notif-container">
            <button onClick={handleBellClick} className="text-white hover:text-gray-300 relative p-1 transition">
              <Bell size={24} />
              {hasUnread && unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-black shadow">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            {/* FLOATING CALLOUT POPUP */}
            {hasUnread && !calloutDismissed && unreadCount > 0 && !showNotif && (
              <div className="absolute right-0 top-full mt-2.5 z-50 flex items-center bg-zinc-950 text-white text-xs font-semibold py-1.5 pl-3 pr-2 rounded-full shadow-2xl border border-zinc-700 whitespace-nowrap">
                <div 
                  onClick={handleBellClick} 
                  className="cursor-pointer flex items-center gap-1.5 hover:text-gray-200 transition"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  <span>{unreadCount} new notification{unreadCount !== 1 ? 's' : ''}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCalloutDismissed(true);
                  }}
                  className="ml-2 p-0.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition"
                  title="Dismiss"
                  aria-label="Dismiss"
                >
                  <X size={13} />
                </button>
              </div>
            )}

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
    <Link href="/" className="block px-6 py-2.5 border-b border-gray-800 text-lg hover:bg-gray-900 transition" onClick={() => setMobileMenuOpen(false)}>Home</Link>
    <Link href="/news-feed" className="block px-6 py-2.5 border-b border-gray-800 text-lg hover:bg-gray-900 transition" onClick={() => setMobileMenuOpen(false)}>Feed</Link>
    
    {/* MOBILE VACANCIES DROPDOWN */}
    <div className="border-b border-gray-800">
      <button
        onClick={() => setMobileVacanciesOpen(!mobileVacanciesOpen)}
        className="w-full flex items-center justify-between px-6 py-2.5 text-lg hover:bg-gray-900 transition text-left cursor-pointer"
      >
        <span>Vacancies</span>
        <ChevronDown size={18} className={`transition-transform duration-200 opacity-80 ${mobileVacanciesOpen ? 'rotate-180' : ''}`} />
      </button>
      {mobileVacanciesOpen && (
        <div className="bg-gray-900 pl-10 pr-6 py-1 divide-y divide-gray-800">
          <Link href="/jobs" className="block py-2.5 text-base font-bold text-white hover:text-amber-400 transition" onClick={() => setMobileMenuOpen(false)}>Jobs</Link>
          <Link href="/internships" className="block py-2.5 text-base font-bold text-white hover:text-amber-400 transition" onClick={() => setMobileMenuOpen(false)}>Internship</Link>
        </div>
      )}
    </div>

    {/* MOBILE PROFILES DROPDOWN */}
    <div className="border-b border-gray-800">
      <button
        onClick={() => setMobileProfilesOpen(!mobileProfilesOpen)}
        className="w-full flex items-center justify-between px-6 py-2.5 text-lg hover:bg-gray-900 transition text-left cursor-pointer"
      >
        <span>Profiles</span>
        <ChevronDown size={18} className={`transition-transform duration-200 opacity-80 ${mobileProfilesOpen ? 'rotate-180' : ''}`} />
      </button>
      {mobileProfilesOpen && (
        <div className="bg-gray-900 pl-10 pr-6 py-1 divide-y divide-gray-800">
          <Link href="/companies" className="block py-2.5 text-base font-bold text-white hover:text-amber-400 transition" onClick={() => setMobileMenuOpen(false)}>Companies & Firms</Link>
          <Link href="/institutions" className="block py-2.5 text-base font-bold text-white hover:text-amber-400 transition" onClick={() => setMobileMenuOpen(false)}>Institutions & Colleges</Link>
          <Link href="/individuals" className="block py-2.5 text-base font-bold text-white hover:text-amber-400 transition" onClick={() => setMobileMenuOpen(false)}>Professionals</Link>
        </div>
      )}
    </div>

    <Link href="/institutions" className="block px-6 py-2.5 border-b border-gray-800 text-lg hover:bg-gray-900 transition" onClick={() => setMobileMenuOpen(false)}>Institutions</Link>
    <Link href="/quizzes" className="block px-6 py-2.5 border-b border-gray-800 text-lg hover:bg-gray-900 transition" onClick={() => setMobileMenuOpen(false)}>Quizzes</Link>
    <Link href="/contact" className="block px-6 py-2.5 border-b border-gray-800 text-lg hover:bg-gray-900 transition" onClick={() => setMobileMenuOpen(false)}>Contacts</Link>
  </div>
)}
</nav>


{/* COMPANY ADMIN ACCESS REQUIRED MODAL */}
      {showCompanyAdminModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white text-black w-full max-w-md rounded-3xl p-6 sm:p-8 relative shadow-2xl border border-gray-100 text-center">
            <button
              type="button"
              onClick={() => setShowCompanyAdminModal(false)}
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:text-black hover:bg-gray-200 transition cursor-pointer"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <ShieldCheck size={28} />
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-2">
              Company Admin Access Required
            </h3>

            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              You must own or be registered as a Company Admin to post a job.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => {
                  setShowCompanyAdminModal(false);
                  router.push("/companies");
                }}
                className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-5 rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <span>Register / Claim Company</span>
                <ArrowRight size={15} />
              </button>
              <button
                type="button"
                onClick={() => setShowCompanyAdminModal(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-5 rounded-xl transition text-sm cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
             aria-label="Close dialog">
              <X size={20} />
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
        onClick={async () => {
          const email = prompt("Enter your registered email address to recover your username:");
          if (!email) return;
          try {
            const res = await fetch("/api/auth/forgot-username", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: email.trim() }),
            });
            const data = await res.json();
            if (res.ok) {
              alert(data.message || "Your username has been emailed to you.");
            } else {
              alert(data.error || "Could not retrieve username. Please verify your email.");
            }
          } catch (e) {
            alert("Error sending username reminder. Please try again.");
          }
        }}
        className="text-gray-500 hover:text-black transition cursor-pointer"
      >
        Forgot Username?
      </button>

      <button
        type="button"
        onClick={async () => {
          const email = prompt("Enter your registered email address to receive a password reset link:");
          if (!email) return;
          try {
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
              redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) {
              alert(error.message);
            } else {
              alert("Password reset link has been sent to your email!");
            }
          } catch (e) {
            alert("Failed to send reset link. Please try again.");
          }
        }}
        className="text-gray-500 hover:text-black transition cursor-pointer"
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

{/* VERIFY CODE */}
{authTab === "verify" && (
  <div className="text-center space-y-5 py-3">
    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-blue-100">
      <Mail size={32} strokeWidth={2.2} />
    </div>

    <div className="space-y-1">
      <h2 className="text-2xl font-extrabold text-gray-900">
        Verify Your Email
      </h2>
      <p className="text-xs font-semibold text-blue-700 bg-blue-50 py-1 px-3 rounded-full inline-block border border-blue-200">
        Verification Code Sent
      </p>
    </div>

    <p className="text-gray-600 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
      We sent a 6-digit verification code to <strong className="text-gray-900">{verificationEmail || "your email"}</strong>. Enter it below to unlock your <strong className="text-emerald-700">Verified Badge (+5% score)</strong>.
    </p>

    {verifyStatusMessage && (
      <div className={`p-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 ${
        verifyStatusMessage.type === "success" 
          ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
          : "bg-red-50 text-red-700 border border-red-200"
      }`}>
        {verifyStatusMessage.type === "success" ? <Check size={14} /> : <AlertCircle size={14} />}
        <span>{verifyStatusMessage.text}</span>
      </div>
    )}

    {verifyStatusMessage?.type === "success" ? (
      <button
        type="button"
        onClick={() => {
          setAuthTab("login");
          setVerifyStatusMessage(null);
          setVerificationCode("");
        }}
        className="w-full bg-black hover:bg-gray-800 text-white py-3.5 rounded-2xl font-bold transition shadow-sm mt-2 cursor-pointer flex items-center justify-center gap-2"
      >
        <span>Proceed to Login</span>
        <ArrowRight size={16} />
      </button>
    ) : (
      <div className="space-y-3">
        <div>
          <input
            type="text"
            maxLength={6}
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
            placeholder="• • • • • •"
            className="w-full text-center tracking-[12px] text-2xl font-mono font-bold py-3.5 px-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-black focus:bg-white focus:outline-none transition shadow-inner"
          />
        </div>

        <button
          type="button"
          disabled={verificationCode.length !== 6 || isVerifyingCode}
          onClick={handleVerifyOtp}
          className="w-full bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-2xl font-bold transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
        >
          {isVerifyingCode ? (
            <span>Verifying Code...</span>
          ) : (
            <>
              <ShieldCheck size={18} />
              <span>Verify Email (+5% Score)</span>
            </>
          )}
        </button>

        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 px-1">
          <button
            type="button"
            disabled={resendingCode}
            onClick={handleResendVerificationCode}
            className="hover:text-black font-semibold underline underline-offset-4 cursor-pointer disabled:opacity-50"
          >
            {resendingCode ? "Sending fresh code..." : "Resend Code"}
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthTab("login");
              setVerifyStatusMessage(null);
            }}
            className="hover:text-gray-900 cursor-pointer text-gray-400"
          >
            Verify later & Log In →
          </button>
        </div>
      </div>
    )}
  </div>
)}

{authTab === "success" && (
  <div className="text-center space-y-5 py-6">
    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
      <Check size={44} strokeWidth={2.5} />
    </div>
    <div className="space-y-1">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
        Thanks for Registering with Us! 🎉
      </h2>
      <p className="text-xs sm:text-sm font-semibold text-emerald-700 bg-emerald-50 py-1 px-3 rounded-full inline-block border border-emerald-200 mt-1">
        Welcome to Trapped Into Architecture
      </p>
    </div>
    <p className="text-gray-600 text-sm max-w-sm mx-auto leading-relaxed">
      Your account is ready. Log in now to build your architectural profile, explore studios, and connect with firms across India.
    </p>

    <div className="space-y-3 pt-2">
      <button 
        type="button"
        onClick={() => setAuthTab("login")} 
        className="w-full bg-black hover:bg-gray-800 text-white py-3.5 rounded-2xl font-bold transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
      >
        <span>Proceed to Login</span>
        <ArrowRight size={16} />
      </button>

      {verificationEmail && (
        <button
          type="button"
          disabled={resendingCode}
          onClick={async () => {
            await handleResendVerificationCode();
            setAuthTab("verify");
          }}
          className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 py-3 rounded-2xl font-bold transition cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm"
        >
          <ShieldCheck size={16} />
          <span>{resendingCode ? "Sending code..." : "Request Verification Code (+5% Score)"}</span>
        </button>
      )}
    </div>
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

        &bull; Minimum 5 characters <br />
        &bull; Maximum 12 characters <br />
        &bull; Username is non-case sensitive <br />
        &bull; Only letters, numbers, dots and underscore allowed <br />
        &bull; No spaces allowed

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
              usernameMessage.innerHTML = "Username available &#10003;";
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
              emailMessage.innerHTML = "Email available &#10003;";
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
              phoneMessage.innerHTML = "Phone available &#10003;";
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

        &bull; Minimum 8 characters <br />
        &bull; Maximum 16 characters <br />
        &bull; Must contain letters and numbers <br />
        &bull; Special characters allowed

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
          "Strong password &#10003;";

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

    {/* PRIVACY POLICY CHECKBOX */}
    <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-700 mb-4 select-none group">
      <input
        type="checkbox"
        id="agree-privacy-policy"
        checked={agreedToPolicy}
        onChange={(e) => setAgreedToPolicy(e.target.checked)}
        className="w-4 h-4 mt-0.5 rounded border-gray-300 text-black focus:ring-black accent-black cursor-pointer shrink-0"
      />
      <span className="leading-snug">
        I have read and agree to the{" "}
        <Link
          href="/privacy-policy"
          onClick={() => setShowAuthPopup(false)}
          className="text-black underline font-semibold hover:text-gray-600"
        >
          Privacy Policy
        </Link>
        .
      </span>
    </label>

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
            "Username must be 5 to 12 characters and only contain letters, numbers, dots, or underscores."
          );
          return;
        }

        /* PASSWORD RULES */

        const passwordRegex =
          /^[a-zA-Z0-9!@#$%^&*()_+={}:;"'<>,.?/-]{8,16}$/;

        if (!passwordRegex.test(password)) {
          alert("Password must be 8 to 16 characters.");
          return;
        }

        /* EMAIL IS COMPULSORY, PHONE IS OPTIONAL */

        if (!email) {
          alert("Enter email address");
          return;
        }

        if (!agreedToPolicy) {
          alert("Please tick the checkbox to agree to the Privacy Policy before registering.");
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

          // Dispatch CEO Alert for New User Registration
          fetch("/api/notify/ceo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "USER_REGISTRATION",
              data: {
                userId: authData.user.id,
                fullName,
                username,
                email,
                phone: fullPhone || null,
                profession,
              },
            }),
          }).catch((err) => console.warn("Failed to notify CEO of new registration:", err));

          
                    // Save registration details in case user requests verification
          setVerificationEmail(email);
          setVerificationFullName(fullName);
          setVerificationUserId(authData.user.id);
          setVerificationCode("");
          setVerifyStatusMessage(null);

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
  
      {/* FIRST-TIME LOGIN WELCOME MODAL */}
      {showWelcomeModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => {
            localStorage.setItem("tia_has_seen_welcome", "true");
            setShowWelcomeModal(false);
          }}
        >
          <div
            className="bg-[#FBF9F5] border border-[#E8E2D5] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-left relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background architectural glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
                  🏛️ Welcome to TIA
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  Welcome, {currentUser?.displayName || currentUser?.username || "Architect"}!
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                  You are now part of India&apos;s premier platform dedicated exclusively to architecture, interior design, and studio careers.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem("tia_has_seen_welcome", "true");
                  setShowWelcomeModal(false);
                }}
                className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100 transition cursor-pointer"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* 3 Quick Action Steps */}
            <div className="space-y-2.5 mb-6 relative z-10">
              <Link
                href={`/profile/${currentUser?.username || ""}?tab=details`}
                onClick={() => {
                  localStorage.setItem("tia_has_seen_welcome", "true");
                  setShowWelcomeModal(false);
                }}
                className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-gray-200 hover:border-black transition group cursor-pointer shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                  1
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-900 group-hover:text-black">
                    Complete Your Profile
                  </h4>
                  <p className="text-[11px] text-gray-500 truncate">
                    Reach Gold Tier (66%+) to post jobs and unlock verified perks.
                  </p>
                </div>
                <ArrowRight size={14} className="text-gray-400 group-hover:text-black transition" />
              </Link>

              <Link
                href="/companies"
                onClick={() => {
                  localStorage.setItem("tia_has_seen_welcome", "true");
                  setShowWelcomeModal(false);
                }}
                className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-gray-200 hover:border-black transition group cursor-pointer shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm shrink-0">
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-900 group-hover:text-black">
                    Claim or Register Your Studio
                  </h4>
                  <p className="text-[11px] text-gray-500 truncate">
                    Manage your practice dossier, invite team, and publish openings.
                  </p>
                </div>
                <ArrowRight size={14} className="text-gray-400 group-hover:text-black transition" />
              </Link>

              <div className="p-3 rounded-2xl bg-[#E8F8EE] border border-[#A7E8BD] flex items-center gap-3.5 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center text-lg shrink-0">
                  📲
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-900">
                    Invite Peers on WhatsApp
                  </h4>
                  <p className="text-[11px] text-gray-600">
                    Help fellow architects, students, and studios discover the portal.
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons: Direct WhatsApp Invite + Get Started */}
            <div className="flex flex-col sm:flex-row gap-2.5 relative z-10">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  "Hey! I just joined Trapped Into Architecture — India's dedicated architectural job, studio directory & professional networking portal. Explore studios, jobs & perks: https://trappedintoarchitecture.com"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition"
              >
                <span>📲</span>
                <span>Invite Friends on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  localStorage.setItem("tia_has_seen_welcome", "true");
                  setShowWelcomeModal(false);
                }}
                className="py-3 px-5 rounded-xl bg-black hover:bg-gray-800 text-white font-bold text-xs sm:text-sm transition cursor-pointer"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
</>
);
}