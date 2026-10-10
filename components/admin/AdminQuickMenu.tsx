"use client";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
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

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
      if (profile) setUserRole((profile.role || "").toLowerCase().replace(/[\s_]+/g, ""));
    };
    checkAccess();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    function updatePosition() {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        
        // If button is on the right side of the screen, open to the left (align right edges)
        // If button is on the left side, open to the right (align left edges)
        const isRightSide = rect.left > window.innerWidth / 2;
        
        setMenuStyle({
          position: "fixed",
          top: rect.bottom + 8,
          left: isRightSide ? 'auto' : rect.left,
          right: isRightSide ? window.innerWidth - rect.right : 'auto',
          width: "224px",
          zIndex: 999999
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

  const renderMenu = () => {
    if (!isOpen || typeof document === 'undefined') return null;

    const navItem = (href, label) => {
        const isActive = pathname === href;
        return (
            <button 
                onClick={() => navigate(href)} 
                className={`w-full text-left px-4 py-1.5 text-sm transition ${
                    isActive 
                    ? "bg-black text-white font-semibold" 
                    : "text-gray-700 hover:bg-gray-100 font-medium"
                }`}
            >
                {label}
            </button>
        );
    };
    
    const menuContent = (
      <div 
        ref={menuRef}
        className="bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 py-2 overflow-hidden flex flex-col gap-0.5"
        style={menuStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Nav</div>
        {navItem("/admin/activity", "Activity")}
        {navItem("/admin", "Job Dashboard")}
        {navItem("/admin/jobs", "Manage Jobs")}
        {navItem("/admin/add-job", "Add New Job")}
        {navItem("/admin/companies", "Companies")}
        
        {userRole !== "jobadmin" && navItem("/admin/catalog", "Database Catalog")}
        {navItem("/admin/analytics", "Analytics")}
        
        {userRole === "ceo" && (
          <>
            {navItem("/admin/users", "Users")}
            {navItem("/admin/contact", "Contact")}
          </>
        )}
      </div>
    );
    
    return createPortal(menuContent, document.body);
  };

  return (
    <>
      <button 
        ref={buttonRef}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(!isOpen); }}
        className="bg-black text-white p-3 rounded-xl hover:bg-gray-800 transition flex items-center justify-center shrink-0 shadow-sm"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      {renderMenu()}
    </>
  );
}
