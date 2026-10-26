"use client";
import AdminQuickMenu from "@/components/admin/AdminQuickMenu";
import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PaginationControls from "@/components/PaginationControls";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Search,
  Download,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Calendar,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Copy,
  Check,
  Eye,
  RefreshCw,
  X,
  Users,
  ShieldCheck,
  UserCheck,
  PhoneCall,
  MessageCircle,
  Trash2,
  AlertTriangle,
  Settings,
} from "lucide-react";

// Map raw DB role values to clean display labels
function displayRole(role: string): string {
  if (!role) return "User";
  const r = role.toLowerCase().replace(/[\s_]+/g, "");
  if (r === "ceo") return "CEO";
  if (r === "superadmin") return "Super Admin";
  if (r === "jobadmin") return "Job Admin";
  if (r === "admin") return "Job Admin"; // Fallback if legacy admin exists
  return "User";
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getProfessionBadge(prof?: string | null) {
  if (!prof) return { label: "Not Set", bg: "bg-gray-100 text-gray-700 border-gray-200" };
  const p = prof.toLowerCase();
  if (p.includes("practising")) return { label: prof, bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (p.includes("academician")) return { label: prof, bg: "bg-indigo-50 text-indigo-700 border-indigo-200" };
  if (p.includes("undergraduate") || p.includes("student")) return { label: prof, bg: "bg-sky-50 text-sky-700 border-sky-200" };
  if (p.includes("postgraduate")) return { label: prof, bg: "bg-purple-50 text-purple-700 border-purple-200" };
  if (p.includes("scholar") || p.includes("research")) return { label: prof, bg: "bg-amber-50 text-amber-700 border-amber-200" };
  return { label: prof, bg: "bg-gray-100 text-gray-700 border-gray-200" };
}

function getWhatsAppUrl(phone?: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/[^0-9]/g, "");
  if (!digits || digits.length < 10) return null;
  const num = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${num}`;
}

// ---- Confirmation Modal ----
function ConfirmRoleModal({
  userName,
  oldRole,
  newRole,
  onConfirm,
  onCancel,
}: {
  userName: string;
  oldRole: string;
  newRole: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        <h2 className="text-xl font-bold mb-3">Change User Role?</h2>
        <p className="text-gray-600 mb-2">
          You are about to change{" "}
          <span className="font-semibold text-black">{userName}</span>&apos;s role from{" "}
          <span className="font-semibold text-black">{displayRole(oldRole)}</span> to{" "}
          <span className="font-semibold text-black">{displayRole(newRole)}</span>.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          This will change the administrative access and permissions available to this account.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-sm transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl bg-black text-white font-medium hover:bg-gray-800 text-sm transition shadow-sm"
          >
            Confirm Change
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Locked Role Cell ----
function LockedRoleField({
  userObj,
  isSelf,
  isCEO,
  onSave,
}: {
  userObj: any;
  isSelf: boolean;
  isCEO: boolean;
  onSave: (uid: string, newRole: string) => Promise<boolean>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRole, setSelectedRole] = useState(userObj.role || "User");
  const [saving, setSaving] = useState(false);
  const [pendingRole, setPendingRole] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState(userObj.role || "User");

  useEffect(() => {
    setCurrentRole(userObj.role || "User");
    setSelectedRole(userObj.role || "User");
  }, [userObj.role]);

  const handleEditClick = () => {
    setSelectedRole(currentRole);
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    if (selectedRole === currentRole) {
      setIsEditing(false);
      return;
    }
    setPendingRole(selectedRole);
  };

  const handleConfirm = async () => {
    if (!pendingRole) return;
    setSaving(true);
    const success = await onSave(userObj.id, pendingRole);
    setSaving(false);
    if (success) {
      setCurrentRole(pendingRole);
    }
    setPendingRole(null);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setPendingRole(null);
    setIsEditing(false);
    setSelectedRole(currentRole);
  };

  const roleLabel = displayRole(currentRole);
  const isSuper = roleLabel === "CEO" || roleLabel === "Super Admin";
  const isJobAdmin = roleLabel === "Job Admin";

  return (
    <>
      {pendingRole && (
        <ConfirmRoleModal
          userName={userObj.display_name || userObj.full_name || userObj.username || "User"}
          oldRole={currentRole}
          newRole={pendingRole}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

      {isEditing ? (
        <div className="flex items-center gap-2">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-black font-medium"
            disabled={saving}
          >
            <option value="User">User</option>
            <option value="Job_Admin">Job Admin</option>
            <option value="Super_Admin">Super Admin</option>
            <option value="CEO">CEO</option>
          </select>
          <button
            onClick={handleSaveClick}
            disabled={saving}
            className="bg-black text-white text-xs px-3 py-1.5 rounded-lg font-medium disabled:opacity-50 hover:bg-gray-800 transition"
          >
            {saving ? "..." : "Save"}
          </button>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="text-gray-500 hover:text-black text-xs px-1 font-medium"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
              isSuper
                ? "bg-purple-50 text-purple-700 border-purple-200"
                : isJobAdmin
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-gray-100 text-gray-700 border-gray-200"
            }`}
          >
            {roleLabel}
          </span>
          {isCEO && !isSelf && (
            <button
              onClick={handleEditClick}
              title="Change User Role"
              className="text-blue-600 hover:text-blue-800 text-xs font-medium underline underline-offset-2 ml-1"
            >
              Edit
            </button>
          )}
          {isSelf && (
            <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">You</span>
          )}
        </div>
      )}
    </>
  );
}

// ---- User Full Details Modal ----
function UserDetailModal({
  user,
  onClose,
  onCopy,
  copiedField,
  canDelete,
  onDeleteUser,
}: {
  user: any;
  onClose: () => void;
  onCopy: (val: string, id: string) => void;
  copiedField: string | null;
  canDelete?: boolean;
  onDeleteUser?: (u: any) => void;
}) {
  if (!user) return null;

  const profBadge = getProfessionBadge(user.profession);
  const waUrl = getWhatsAppUrl(user.phone);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-gray-100 flex items-start justify-between bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-black text-white font-bold text-xl flex items-center justify-center shadow-md">
              {(user.full_name || user.display_name || user.username || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {user.full_name || user.display_name || user.username || "User"}
                </h2>
                {user.verified ? (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                    <CheckCircle2 size={12} /> Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 font-medium">
                    Unverified
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                @{user.username || "—"} • Role: <strong className="text-gray-800">{displayRole(user.role)}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black p-2 rounded-xl hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Identity & Display */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Identity Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
              <div>
                <span className="text-xs text-gray-500 block">Full Name</span>
                <span className="font-semibold text-gray-900">{user.full_name || "—"}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Display Name</span>
                <span className="font-semibold text-gray-900">{user.display_name || "—"}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Username</span>
                <span className="font-mono text-gray-900">@{user.username || "—"}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">User UUID</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs text-gray-600 truncate max-w-[180px]">{user.id}</span>
                  <button
                    onClick={() => onCopy(user.id, "modal_id")}
                    className="text-gray-400 hover:text-black transition"
                    title="Copy UUID"
                  >
                    {copiedField === "modal_id" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
              <div>
                <span className="text-xs text-gray-500 block">Email Address</span>
                {user.email ? (
                  <div className="flex items-center gap-2 mt-0.5">
                    <a
                      href={`mailto:${user.email}`}
                      className="font-medium text-blue-600 hover:underline break-all"
                    >
                      {user.email}
                    </a>
                    <button
                      onClick={() => onCopy(user.email, "modal_email")}
                      className="text-gray-400 hover:text-black flex-shrink-0"
                      title="Copy Email"
                    >
                      {copiedField === "modal_email" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Phone Number</span>
                {user.phone ? (
                  <div className="flex items-center gap-2 mt-0.5">
                    <a
                      href={`tel:${user.phone}`}
                      className="font-medium text-blue-600 hover:underline font-mono"
                    >
                      {user.phone}
                    </a>
                    <button
                      onClick={() => onCopy(user.phone, "modal_phone")}
                      className="text-gray-400 hover:text-black flex-shrink-0"
                      title="Copy Phone"
                    >
                      {copiedField === "modal_phone" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 ml-1"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle size={16} />
                      </a>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </div>
            </div>
          </div>

          {/* Professional & Education */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Professional & Education</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
              <div>
                <span className="text-xs text-gray-500 block mb-1">Profession</span>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${profBadge.bg}`}>
                  {profBadge.label}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block mb-1">Educational Qualification</span>
                <span className="font-semibold text-gray-900">{user.education || "Not added"}</span>
              </div>
            </div>
          </div>

          {/* Personal & Bio */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Personal & Bio</h3>
            <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 space-y-3">
              <div>
                <span className="text-xs text-gray-500 block">Date of Birth (DOB)</span>
                <span className="font-medium text-gray-900">{formatDate(user.dob)}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block mb-1">Bio / About</span>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed bg-white p-3 rounded-xl border border-gray-200">
                  {user.bio || "No bio added yet."}
                </p>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">System & Metadata</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
              <div>
                <span className="text-xs text-gray-500 block">Joined Date</span>
                <span className="font-semibold text-gray-900">{formatDate(user.created_at)}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Verification Status</span>
                <span className="font-semibold text-gray-900">{user.verified ? "Verified Account" : "Unverified"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
          {user.username ? (
            <a
              href={`/profile/${encodeURIComponent(user.username)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-black px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 transition shadow-sm"
            >
              <ExternalLink size={14} /> Open Public Profile
            </a>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-black text-white text-xs font-semibold hover:bg-gray-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- User Row Settings Dropdown Menu ----
function UserSettingsActionMenu({
  user,
  onView,
  onDelete,
  canDelete,
}: {
  user: any;
  onView: () => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const updatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setMenuStyle({
          position: "fixed",
          top: rect.bottom + 6,
          right: window.innerWidth - rect.right,
          zIndex: 9999,
        });
      }
    };

    updatePosition();
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  const menu = (
    <div
      ref={menuRef}
      style={menuStyle}
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.15)] border border-gray-100 py-1.5 w-44 overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-0.5 text-xs font-semibold"
    >
      <button
        onClick={() => {
          setIsOpen(false);
          onView();
        }}
        className="w-full text-left px-3.5 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700 hover:text-black transition cursor-pointer"
      >
        <Eye size={14} className="text-gray-500" />
        <span>View Details</span>
      </button>

      {canDelete && (
        <>
          <div className="h-px bg-gray-100 my-0.5" />
          <button
            onClick={() => {
              setIsOpen(false);
              onDelete();
            }}
            className="w-full text-left px-3.5 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600 transition cursor-pointer"
          >
            <Trash2 size={14} className="text-red-500" />
            <span>Remove User</span>
          </button>
        </>
      )}
    </div>
  );

  return (
    <>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 transition cursor-pointer shadow-xs border border-gray-200/60"
        title="Settings / Actions"
      >
        <Settings size={13} className="text-gray-600" />
        <span>Settings</span>
      </button>
      {isOpen && typeof document !== "undefined" && createPortal(menu, document.body)}
    </>
  );
}

// ---- Main Page Component ----
export default function AdminUsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [loggedUser, setLoggedUser] = useState<any>(null);
  const [isCEO, setIsCEO] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [professionFilter, setProfessionFilter] = useState("all");
  const [sortOption, setSortOption] = useState("recent");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // User Deletion State
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteUser = (user: any) => {
    if (!user) return;
    if (user.id === loggedUser?.id) {
      alert("You cannot remove your own account.");
      return;
    }
    setUserToDelete(user);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete || isDeleting) return;
    setIsDeleting(true);
    const userId = userToDelete.id;

    try {
      // 1. Unlink foreign references safely
      try {
        await supabase.from("jobs").update({ author_id: null }).eq("author_id", userId);
      } catch (e) {}
      try {
        await supabase.from("companies").update({ created_by: null }).eq("created_by", userId);
        await supabase.from("companies").update({ updated_by: null }).eq("updated_by", userId);
        await supabase.from("companies").update({ claimed_by: null, is_claimed: false }).eq("claimed_by", userId);
      } catch (e) {}
      try {
        await supabase.from("company_claim_requests").update({ reviewed_by: null }).eq("reviewed_by", userId);
        await supabase.from("company_claim_requests").delete().eq("user_id", userId);
      } catch (e) {}
      try {
        await supabase.from("saved_jobs").delete().eq("user_id", userId);
      } catch (e) {}
      try {
        await supabase.from("favorite_companies").delete().eq("user_id", userId);
      } catch (e) {}
      try {
        await supabase.from("profile_likes").delete().or(`user_id.eq.${userId},profile_id.eq.${userId}`);
      } catch (e) {}
      try {
        await supabase.from("candidate_education").delete().eq("user_id", userId);
      } catch (e) {}
      try {
        await supabase.from("candidate_experience").delete().eq("user_id", userId);
      } catch (e) {}

      // 2. Delete the profile
      const { error } = await supabase.from("profiles").delete().eq("id", userId);
      if (error) throw error;

      // 3. Update local list state
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
      }
      setSaveMsg(`User "${userToDelete.full_name || userToDelete.username || userToDelete.email || "User"}" was removed successfully.`);
      setTimeout(() => setSaveMsg(""), 5000);
      setUserToDelete(null);
    } catch (err: any) {
      console.error("Error removing user:", err);
      alert("Failed to remove user: " + (err.message || "Unknown error"));
    } finally {
      setIsDeleting(false);
    }
  };

  // Detail Modal
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const stored = JSON.parse(localStorage.getItem("currentUser") || "null");
      if (!stored) {
        router.push("/admin");
        return;
      }

      const lookupField = stored.username ? "username" : "email";
      const lookupValue = stored.username || stored.email;

      if (!lookupValue) {
        router.push("/admin");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq(lookupField, lookupValue)
        .single();

      if (!profile) {
        router.push("/admin");
        return;
      }

      const roleNorm = (profile.role || "").toLowerCase().replace(/[\s_]+/g, "");
      if (roleNorm !== "ceo") {
        router.push("/admin");
        return;
      }

      setLoggedUser(profile);
      setIsCEO(true);
      fetchData();
    } catch (err) {
      console.error("checkAccess error:", err);
      router.push("/admin");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching profiles:", error);
    }
    if (data) setUsers(data);
    setLoading(false);
  };

  const handleCopy = (text: string, fieldId: string) => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.warn("Copy failed:", err);
    }
  };

  // Server-side guarded role save
  const handleSaveRole = async (userId: string, newRole: string): Promise<boolean> => {
    if (!loggedUser) return false;

    // Re-verify caller is still CEO on server before writing
    const { data: freshProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", loggedUser.id)
      .single();

    const callerRole = (freshProfile?.role || "").toLowerCase().replace(/[\s_]+/g, "");
    if (callerRole !== "ceo") {
      alert("Only CEO can change roles.");
      return false;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      alert("Failed to update role: " + error.message);
      return false;
    }

    // Update local list state
    const targetUser = users.find((u) => u.id === userId);
    const oldRole = targetUser?.role || "User";

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );

    // Send role change notification email
    try {
      const notifyRes = await fetch("/api/admin/notify-role-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          oldRole,
          newRole,
        }),
      });
      const notifyJson = await notifyRes.json();
      if (notifyJson?.message) {
        setSaveMsg(notifyJson.message);
      } else {
        setSaveMsg(`Role updated to ${displayRole(newRole)} successfully.`);
      }
    } catch (e) {
      console.warn("Failed to send role notification:", e);
      setSaveMsg(`Role updated to ${displayRole(newRole)} successfully.`);
    }

    setTimeout(() => setSaveMsg(""), 5000);
    return true;
  };

  // Filtered & Sorted Users
  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Search query across all text fields
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((u) => {
        return (
          (u.full_name && u.full_name.toLowerCase().includes(q)) ||
          (u.display_name && u.display_name.toLowerCase().includes(q)) ||
          (u.username && u.username.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.phone && u.phone.toLowerCase().includes(q)) ||
          (u.profession && u.profession.toLowerCase().includes(q)) ||
          (u.education && u.education.toLowerCase().includes(q)) ||
          (u.role && u.role.toLowerCase().includes(q)) ||
          (u.id && u.id.toLowerCase().includes(q))
        );
      });
    }

    // Role filter
    if (roleFilter !== "all") {
      result = result.filter((u) => {
        const norm = (u.role || "user").toLowerCase().replace(/[\s_]+/g, "");
        if (roleFilter === "ceo") return norm === "ceo";
        if (roleFilter === "superadmin") return norm === "superadmin";
        if (roleFilter === "jobadmin") return norm === "jobadmin" || norm === "admin";
        if (roleFilter === "user") return norm === "user" || norm === "";
        return true;
      });
    }

    // Profession filter
    if (professionFilter !== "all") {
      result = result.filter((u) => {
        if (professionFilter === "not_set") return !u.profession;
        return (u.profession || "").toLowerCase() === professionFilter.toLowerCase();
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortOption === "username_asc") {
        const nameA = (a.display_name || a.full_name || a.username || "").toLowerCase();
        const nameB = (b.display_name || b.full_name || b.username || "").toLowerCase();
        return nameA.localeCompare(nameB);
      }
      if (sortOption === "username_desc") {
        const nameA = (a.display_name || a.full_name || a.username || "").toLowerCase();
        const nameB = (b.display_name || b.full_name || b.username || "").toLowerCase();
        return nameB.localeCompare(nameA);
      }
      if (sortOption === "profession_asc") {
        const pA = (a.profession || "").toLowerCase();
        const pB = (b.profession || "").toLowerCase();
        return pA.localeCompare(pB);
      }
      if (sortOption === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      // Default: newest first
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [users, searchQuery, roleFilter, professionFilter, sortOption]);

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, professionFilter, sortOption]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  // CSV Export Function
  const handleExportCSV = () => {
    if (filteredUsers.length === 0) {
      alert("No user records to export.");
      return;
    }

    const headers = [
      "S.No",
      "User ID",
      "Full Name",
      "Display Name",
      "Username",
      "Email",
      "Phone",
      "Role",
      "Profession",
      "Education",
      "Date of Birth",
      "Bio",
      "Verified",
      "Joined Date",
    ];

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filteredUsers.map((u, i) => [
      i + 1,
      u.id || "",
      u.full_name || "",
      u.display_name || "",
      u.username || "",
      u.email || "",
      u.phone || "",
      displayRole(u.role),
      u.profession || "",
      u.education || "",
      u.dob || "",
      u.bio || "",
      u.verified ? "Yes" : "No",
      u.created_at || "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.map(escapeCSV).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `users_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Distinct professions for dropdown
  const distinctProfessions = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => {
      if (u.profession && u.profession.trim()) set.add(u.profession.trim());
    });
    return Array.from(set).sort();
  }, [users]);

  // Stats Counters
  const adminCount = useMemo(() => {
    return users.filter((u) => {
      const r = (u.role || "").toLowerCase().replace(/[\s_]+/g, "");
      return ["ceo", "superadmin", "jobadmin", "admin"].includes(r);
    }).length;
  }, [users]);

  const verifiedCount = useMemo(() => {
    return users.filter((u) => !!u.verified).length;
  }, [users]);

  const phoneCount = useMemo(() => {
    return users.filter((u) => !!u.phone && u.phone.trim().length > 0).length;
  }, [users]);

  return (
    <main className="min-h-screen bg-gray-50 text-black flex flex-col">
      <Navbar />
      <section className="flex-1 w-full px-4 sm:px-6 lg:px-10 py-10 max-w-[1700px] mx-auto">
        {/* Page Top Header */}
        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Manage Users</h1>
              <span className="bg-black text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                {users.length} Total
              </span>
            </div>
            <p className="text-gray-600 mt-1.5 text-sm sm:text-base max-w-2xl">
              Complete user registry with all Supabase profile details, contact information, credentials, and administrative permissions.
            </p>
          </div>
          <AdminQuickMenu />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-800">
              <Users size={20} />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{users.length}</div>
              <div className="text-xs text-gray-500 font-medium">Registered Accounts</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{adminCount}</div>
              <div className="text-xs text-gray-500 font-medium">Admins & Staff</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <UserCheck size={20} />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{verifiedCount}</div>
              <div className="text-xs text-gray-500 font-medium">Verified Users</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
              <PhoneCall size={20} />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{phoneCount}</div>
              <div className="text-xs text-gray-500 font-medium">Phone Numbers</div>
            </div>
          </div>
        </div>

        {/* Role update alert message */}
        {saveMsg && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-3.5 rounded-2xl text-sm font-semibold flex items-center gap-2 shadow-sm animate-in fade-in duration-200">
            <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
            <span>{saveMsg}</span>
          </div>
        )}

        {/* Controls Bar: Search, Filters & CSV Export */}
        <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search by name, email, phone, profession..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-gray-200 bg-gray-50 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="ceo">CEO</option>
              <option value="superadmin">Super Admin</option>
              <option value="jobadmin">Job Admin</option>
              <option value="user">User</option>
            </select>

            {/* Profession Filter */}
            <select
              value={professionFilter}
              onChange={(e) => setProfessionFilter(e.target.value)}
              className="border border-gray-200 bg-gray-50 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black cursor-pointer max-w-[200px] truncate"
            >
              <option value="all">All Professions</option>
              {distinctProfessions.map((prof) => (
                <option key={prof} value={prof}>
                  {prof}
                </option>
              ))}
              <option value="not_set">Not Set</option>
            </select>

            {/* Sort Options */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="border border-gray-200 bg-gray-50 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
            >
              <option value="recent">Joined — Newest First</option>
              <option value="oldest">Joined — Oldest First</option>
              <option value="username_asc">Name — A to Z</option>
              <option value="username_desc">Name — Z to A</option>
              <option value="profession_asc">Profession — A to Z</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchData}
              title="Refresh Data"
              className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 transition"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white hover:bg-gray-800 text-xs sm:text-sm font-semibold transition shadow-sm"
            >
              <Download size={15} /> Export CSV
            </button>
          </div>
        </div>

        {/* Results summary chip */}
        <div className="flex items-center justify-between text-xs text-gray-500 font-medium px-1 mb-3">
          <div>
            Showing{" "}
            <strong className="text-gray-900">
              {filteredUsers.length === 0
                ? 0
                : `${(currentPage - 1) * itemsPerPage + 1}–${Math.min(
                    currentPage * itemsPerPage,
                    filteredUsers.length
                  )}`}
            </strong>{" "}
            of <strong className="text-gray-900">{filteredUsers.length}</strong>{" "}
            {filteredUsers.length === 1 ? "user" : "users"}
            {filteredUsers.length !== users.length && (
              <span className="text-gray-400 ml-1">({users.length} total)</span>
            )}
            {(searchQuery || roleFilter !== "all" || professionFilter !== "all") && (
              <span
                className="ml-2 text-blue-600 font-semibold cursor-pointer hover:underline"
                onClick={() => {
                  setSearchQuery("");
                  setRoleFilter("all");
                  setProfessionFilter("all");
                }}
              >
                (Clear filters)
              </span>
            )}
          </div>
          <div className="hidden sm:block text-gray-400">
            Scroll horizontally to view all columns →
          </div>
        </div>

        {/* Table Container */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm">
            <RefreshCw size={28} className="animate-spin mx-auto text-gray-400 mb-3" />
            <div className="text-gray-500 font-medium text-sm">Loading user database...</div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm">
            <Users size={32} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-800">No users found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              No registered user records matched your search query or filters.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1280px]">
                <thead>
                  <tr className="bg-gray-50/90 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3.5 text-center w-12">#</th>
                    <th className="px-4 py-3.5 min-w-[180px]">Full Name</th>
                    <th className="px-4 py-3.5 min-w-[140px]">Display Name</th>
                    <th className="px-4 py-3.5 min-w-[140px]">Username</th>
                    <th className="px-4 py-3.5 min-w-[200px]">Email</th>
                    <th className="px-4 py-3.5 min-w-[160px]">Phone</th>
                    <th className="px-4 py-3.5 min-w-[150px]">Role</th>
                    <th className="px-4 py-3.5 min-w-[180px]">Profession</th>
                    <th className="px-4 py-3.5 min-w-[160px]">Education</th>
                    <th className="px-4 py-3.5 min-w-[120px]">DOB</th>
                    <th className="px-4 py-3.5 min-w-[100px] text-center">Verified</th>
                    <th className="px-4 py-3.5 min-w-[130px]">Joined</th>
                    <th className="px-4 py-3.5 text-right sticky right-0 bg-gray-50/95 min-w-[110px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {currentUsers.map((u, i) => {
                    const profBadge = getProfessionBadge(u.profession);
                    const waUrl = getWhatsAppUrl(u.phone);
                    const globalIndex = (currentPage - 1) * itemsPerPage + i + 1;

                    return (
                      <tr
                        key={u.id}
                        className="hover:bg-gray-50/80 transition group"
                      >
                        {/* Serial number taking current page into account */}
                        <td className="px-4 py-3.5 text-center text-gray-400 font-medium">
                          {globalIndex}
                        </td>

                        {/* Full Name */}
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-gray-900 flex items-center gap-1.5">
                            {u.full_name || "—"}
                          </div>
                        </td>

                        {/* Display Name */}
                        <td className="px-4 py-3.5 font-medium text-gray-800">
                          {u.display_name ? (
                            <span className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md text-[11px] font-semibold border border-gray-200/60">
                              {u.display_name}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Username */}
                        <td className="px-4 py-3.5">
                          {u.username ? (
                            <a
                              href={`/profile/${encodeURIComponent(u.username)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-gray-700 hover:text-blue-600 hover:underline flex items-center gap-1"
                              title="View public profile"
                            >
                              @{u.username}
                              <ExternalLink size={11} className="opacity-0 group-hover:opacity-100 text-gray-400 transition" />
                            </a>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Email */}
                        <td className="px-4 py-3.5">
                          {u.email ? (
                            <div className="flex items-center gap-1.5">
                              <a
                                href={`mailto:${u.email}`}
                                className="text-gray-700 hover:text-blue-600 hover:underline truncate max-w-[170px]"
                                title={u.email}
                              >
                                {u.email}
                              </a>
                              <button
                                onClick={() => handleCopy(u.email, `email_${u.id}`)}
                                className="text-gray-300 hover:text-gray-600 transition flex-shrink-0"
                                title="Copy Email"
                              >
                                {copiedField === `email_${u.id}` ? (
                                  <Check size={12} className="text-emerald-600" />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Phone */}
                        <td className="px-4 py-3.5">
                          {u.phone ? (
                            <div className="flex items-center gap-1.5">
                              <a
                                href={`tel:${u.phone}`}
                                className="font-mono text-gray-700 hover:text-blue-600 hover:underline"
                              >
                                {u.phone}
                              </a>
                              <button
                                onClick={() => handleCopy(u.phone, `phone_${u.id}`)}
                                className="text-gray-300 hover:text-gray-600 transition flex-shrink-0"
                                title="Copy Phone"
                              >
                                {copiedField === `phone_${u.id}` ? (
                                  <Check size={12} className="text-emerald-600" />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>
                              {waUrl && (
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-600 hover:text-emerald-700 flex-shrink-0"
                                  title="WhatsApp Chat"
                                >
                                  <MessageCircle size={13} />
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Role (LockedRoleField with CEO edit) */}
                        <td className="px-4 py-3.5">
                          <LockedRoleField
                            userObj={u}
                            isSelf={loggedUser?.id === u.id}
                            isCEO={isCEO}
                            onSave={handleSaveRole}
                          />
                        </td>

                        {/* Profession */}
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${profBadge.bg}`}
                          >
                            {profBadge.label}
                          </span>
                        </td>

                        {/* Education */}
                        <td className="px-4 py-3.5 text-gray-800">
                          {u.education ? (
                            <span className="truncate max-w-[150px] block" title={u.education}>
                              {u.education}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* DOB */}
                        <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                          {formatDate(u.dob)}
                        </td>

                        {/* Verified status */}
                        <td className="px-4 py-3.5 text-center">
                          {u.verified ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              <CheckCircle2 size={11} /> Verified
                            </span>
                          ) : (
                            <span className="inline-block text-[11px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                              No
                            </span>
                          )}
                        </td>

                        {/* Joined Date */}
                        <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                          {formatDate(u.created_at)}
                        </td>

                        {/* Actions (Sticky Right) */}
                        <td className="px-4 py-3.5 text-right sticky right-0 bg-white group-hover:bg-gray-50 transition shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.03)]">
                          <div className="flex items-center justify-end">
                            <UserSettingsActionMenu
                              user={u}
                              onView={() => setSelectedUser(u)}
                              onDelete={() => handleDeleteUser(u)}
                              canDelete={isCEO && u.id !== loggedUser?.id}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredUsers.length > 0 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filteredUsers.length}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onItemsPerPageChange={(sz) => {
              setItemsPerPage(sz);
              setCurrentPage(1);
            }}
            pageSizeOptions={[20, 50, 100]}
            itemLabel="users"
            className="mt-6"
          />
        )}
      </section>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onCopy={handleCopy}
          copiedField={copiedField}
          canDelete={isCEO && selectedUser.id !== loggedUser?.id}
          onDeleteUser={handleDeleteUser}
        />
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Remove User Account</h3>
                <p className="text-xs text-gray-500">Permanent action • Cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to remove{" "}
              <strong className="text-gray-900">
                {userToDelete.full_name || userToDelete.display_name || userToDelete.username || "this user"}
              </strong>{" "}
              {userToDelete.username && (
                <span className="font-mono text-gray-500">(@{userToDelete.username})</span>
              )}
              ? Their account profile and saved data will be permanently removed.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setUserToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition flex items-center gap-2 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Removing...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} /> Yes, Remove User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
