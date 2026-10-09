import { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminQuickMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState("");
  const router = useRouter();
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
      if (profile) setUserRole(profile.role);
    };
    checkAccess();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigate = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-black text-white p-3 rounded-xl hover:bg-gray-800 transition flex items-center justify-center shrink-0 shadow-sm"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
          <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Quick Nav</div>
          <button onClick={() => navigate("/admin")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 font-medium">Dashboard</button>
          <button onClick={() => navigate("/admin/activity")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Activity</button>
          <button onClick={() => navigate("/admin/jobs")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Manage Jobs</button>
          <button onClick={() => navigate("/admin/add-job")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Add New Job</button>
          <button onClick={() => navigate("/admin/companies")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Companies</button>
          <button onClick={() => navigate("/admin/catalog")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Database Catalog</button>
          <button onClick={() => navigate("/admin/analytics")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Analytics</button>
          
          {userRole === "ceo" && (
            <>
              <div className="border-t border-gray-100 my-1"></div>
              <button onClick={() => navigate("/admin/users")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Users</button>
              <button onClick={() => navigate("/admin/contact")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Contact</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
