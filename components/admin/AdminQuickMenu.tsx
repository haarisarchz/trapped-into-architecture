"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Menu, X, ChevronDown, ChevronRight, Activity, Briefcase, Database, BarChart3, Users, MoreHorizontal } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminQuickMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [menuStyle, setMenuStyle] = useState({});
  const router = useRouter();
  const pathname = usePathname();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Accordion state
  const isJobActive = pathname === "/admin" || pathname === "/admin/jobs" || pathname === "/admin/add-job" || pathname === "/admin/companies" || pathname === "/admin/subscriptions";
  const isDbActive = pathname === "/admin/catalog" || pathname === "/admin/quizzes";
  const isOthersActive = pathname === "/admin/news-feed" || pathname === "/admin/contact" || pathname === "/admin/mails" || pathname === "/admin/whatsapp";

  const [jobOpen, setJobOpen] = useState(isJobActive);
  const [dbOpen, setDbOpen] = useState(isDbActive);
  const [othersOpen, setOthersOpen] = useState(isOthersActive);

  // Keep accordion open if user is currently on a child route
  useEffect(() => {
    if (isJobActive) setJobOpen(true);
    if (isDbActive) setDbOpen(true);
    if (isOthersActive) setOthersOpen(true);
  }, [pathname, isJobActive, isDbActive, isOthersActive]);

  useEffect(() => {
    const checkAccess = async () => {
      // 1. Check Supabase auth session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        if (profile?.role) {
          setUserRole((profile.role || "").toLowerCase().replace(/[\s_]+/g, ""));
          return;
        }
      }

      // 2. Check localStorage currentUser (TI2A admin pattern)
      try {
        const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
        if (currentUser?.role) {
          setUserRole(currentUser.role.toLowerCase().replace(/[\s_]+/g, ""));
          return;
        }
        if (currentUser?.username) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("username", currentUser.username)
            .single();
          if (profile?.role) {
            setUserRole((profile.role || "").toLowerCase().replace(/[\s_]+/g, ""));
          }
        }
      } catch (err) {
        console.error("Quick menu auth check error:", err);
      }
    };
    checkAccess();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    function updatePosition() {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const isRightSide = rect.left > window.innerWidth / 2;

        setMenuStyle({
          position: "fixed",
          top: rect.bottom + 8,
          left: isRightSide ? "auto" : rect.left,
          right: isRightSide ? window.innerWidth - rect.right : "auto",
          width: "250px",
          zIndex: 999999,
        });
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      updatePosition();
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  const navigate = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  const isCeoOrSuper = userRole === "ceo" || userRole === "superadmin";

  const renderMenu = () => {
    if (!isOpen || typeof document === "undefined") return null;

    const navItem = (href: string, label: string, isSub: boolean = false) => {
      const isActive = pathname === href;
      return (
        <button
          key={href}
          onClick={() => navigate(href)}
          className={`w-full text-left transition flex items-center justify-between ${
            isSub ? "pl-8 pr-4 py-1.5 text-[13px]" : "px-4 py-2 text-sm font-semibold"
          } ${
            isActive
              ? "bg-black text-white font-bold"
              : isSub
              ? "text-gray-600 hover:text-black hover:bg-gray-100"
              : "text-gray-800 hover:bg-gray-100"
          }`}
        >
          <span>{label}</span>
          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white ml-2" />}
        </button>
      );
    };

    const menuContent = (
      <div
        ref={menuRef}
        className="bg-white rounded-2xl shadow-[0_12px_45px_rgba(0,0,0,0.18)] border border-gray-100 py-2.5 overflow-hidden flex flex-col max-h-[85vh] overflow-y-auto"
        style={menuStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-1 text-[11px] font-black text-gray-400 uppercase tracking-wider flex items-center justify-between border-b border-gray-100 pb-1.5 mb-1">
          <span>Admin Quick Nav</span>
          <span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-1.5 py-0.5 rounded uppercase">
            {userRole || "Admin"}
          </span>
        </div>

        {/* 1. Activity */}
        {navItem("/admin/activity", "Activity")}

        {/* 2. Job Dashboard (Expandable) */}
        <div>
          <button
            onClick={() => setJobOpen(!jobOpen)}
            className={`w-full px-4 py-2 text-sm font-semibold flex items-center justify-between transition ${
              isJobActive ? "text-black bg-gray-50 font-bold" : "text-gray-800 hover:bg-gray-100"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span>Job Dashboard</span>
            </span>
            {jobOpen ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
          </button>
          {jobOpen && (
            <div className="bg-gray-50/70 py-1 border-y border-gray-100 space-y-0.5">
              {navItem("/admin", "Overview", true)}
              {navItem("/admin/jobs", "Manage Jobs", true)}
              {navItem("/admin/add-job", "Add New Job", true)}
              {navItem("/admin/companies", "Manage Companies", true)}
              {navItem("/admin/subscriptions", "Subscriptions & SEO Pages", true)}
            </div>
          )}
        </div>

        {/* 3. Database Catalog (Expandable) */}
        {isCeoOrSuper && (
          <div>
            <button
              onClick={() => setDbOpen(!dbOpen)}
              className={`w-full px-4 py-2 text-sm font-semibold flex items-center justify-between transition ${
                isDbActive ? "text-black bg-gray-50 font-bold" : "text-gray-800 hover:bg-gray-100"
              }`}
            >
              <span>Database Catalog</span>
              {dbOpen ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
            </button>
            {dbOpen && (
              <div className="bg-gray-50/70 py-1 border-y border-gray-100 space-y-0.5">
                {navItem("/admin/catalog", "Architecture Catalog", true)}
                {navItem("/admin/quizzes", "Architecture Quizzes", true)}
              </div>
            )}
          </div>
        )}

        {/* 4. Institutions (Separate Heading) */}
        {isCeoOrSuper && navItem("/admin/institutions", "Institutions")}

        {/* 4. Analytics */}
        {navItem("/admin/analytics", "Analytics")}

        {/* 5. Users (CEO only) */}
        {(userRole === "ceo" || userRole === "superadmin") && navItem("/admin/users", "Users")}

        {/* 6. Others (Expandable) */}
        <div>
          <button
            onClick={() => setOthersOpen(!othersOpen)}
            className={`w-full px-4 py-2 text-sm font-semibold flex items-center justify-between transition ${
              isOthersActive ? "text-black bg-gray-50 font-bold" : "text-gray-800 hover:bg-gray-100"
            }`}
          >
            <span>Others</span>
            {othersOpen ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
          </button>
          {othersOpen && (
            <div className="bg-gray-50/70 py-1 border-y border-gray-100 space-y-0.5">
              {navItem("/admin/news-feed", "News Feed Management", true)}
              {navItem("/admin/contact", "Contact & Suggestions", true)}
              {navItem("/admin/mails", "Mail & WhatsApp Center", true)}
            </div>
          )}
        </div>
      </div>
    );

    return createPortal(menuContent, document.body);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="bg-black text-white p-2.5 rounded-xl hover:bg-gray-800 transition flex items-center justify-center shrink-0 shadow-sm cursor-pointer"
        aria-label="Toggle Admin Quick Menu"
      >
        {isOpen ? <X size={18} /> : <Menu size={18} />}
      </button>
      {renderMenu()}
    </>
  );
}
