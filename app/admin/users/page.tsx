"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Map raw DB role values to clean display labels
function displayRole(role: string): string {
  if (!role) return "User";
  const r = role.toLowerCase().replace(/[\s_]+/g, "");
  if (r === "ceo") return "CEO";
  if (r === "superadmin") return "Super Admin";
  if (r === "admin") return "Admin";
  return "User";
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <h2 className="text-xl font-bold mb-3">Change User Role?</h2>
        <p className="text-gray-600 mb-2">
          You are about to change{" "}
          <span className="font-semibold">{userName}</span>&apos;s role from{" "}
          <span className="font-semibold">{displayRole(oldRole)}</span> to{" "}
          <span className="font-semibold">{displayRole(newRole)}</span>.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          This will change the permissions available to this account.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl bg-black text-white font-medium hover:bg-gray-800"
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

  const handleEditClick = () => {
    setSelectedRole(currentRole);
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    if (selectedRole === currentRole) {
      setIsEditing(false);
      return;
    }
    // Show confirmation modal
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
            className="border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:outline-none"
            disabled={saving}
          >
            <option value="User">User</option>
            <option value="Admin">Admin</option>
            <option value="Super_Admin">Super Admin</option>
            <option value="CEO">CEO</option>
          </select>
          <button
            onClick={handleSaveClick}
            disabled={saving}
            className="bg-black text-white text-xs px-3 py-1.5 rounded font-medium disabled:opacity-50"
          >
            {saving ? "..." : "Save"}
          </button>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="text-gray-400 hover:text-black text-xs"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-gray-800 font-medium">{displayRole(currentRole)}</span>
          {isCEO && !isSelf && (
            <button
              onClick={handleEditClick}
              className="text-blue-500 hover:text-blue-700 text-xs font-semibold"
            >
              ✎ Edit Role
            </button>
          )}
          {isSelf && (
            <span className="text-xs text-gray-400">(You)</span>
          )}
        </div>
      )}
    </>
  );
}

// ---- Main Page ----
export default function AdminUsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [loggedUser, setLoggedUser] = useState<any>(null);
  const [isCEO, setIsCEO] = useState(false);
  const [sortOption, setSortOption] = useState("recent");
  const [saveMsg, setSaveMsg] = useState("");

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

      // Login stores username (not id) in localStorage — look up by username
      // Also try email as fallback
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
    const { data } = await supabase
      .from("profiles")
      .select("id, username, display_name, full_name, email, role, created_at")
      .order("created_at", { ascending: false });

    if (data) setUsers(data);
    setLoading(false);
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
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );

    setSaveMsg("Role updated successfully.");
    setTimeout(() => setSaveMsg(""), 3500);
    return true;
  };

  const sortedUsers = [...users].sort((a, b) => {
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
    if (sortOption === "oldest") {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    // Default: newest first
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <section className="flex-1 w-full px-6 lg:px-12 py-10 max-w-[1400px] mx-auto">
        <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold">Manage Users</h1>
            <p className="text-gray-600 mt-2 mb-4">
              View and manage registered users and administrators.
            </p>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-500 font-medium">Sort by:</label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm bg-white cursor-pointer focus:outline-none"
              >
                <option value="recent">Date Joined — Newest First</option>
                <option value="oldest">Date Joined — Oldest First</option>
                <option value="username_asc">Username — A to Z</option>
                <option value="username_desc">Username — Z to A</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => router.push("/admin")}
            className="bg-black text-white px-5 py-3 rounded-xl hover:bg-gray-800 transition flex items-center gap-2 shrink-0"
          >
            ← Back to Dashboard
          </button>
        </div>

        {saveMsg && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-5 py-3 rounded-xl text-sm font-medium">
            ✓ {saveMsg}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading users...</div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600 uppercase">
                <tr>
                  <th className="px-6 py-4 font-semibold w-16">S.No.</th>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedUsers.map((u, i) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-400 font-medium">{i + 1}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">
                        {u.display_name || u.full_name || u.username || "—"}
                      </div>
                      <div className="text-sm text-gray-400">{u.email || ""}</div>
                    </td>
                    <td className="px-6 py-4">
                      <LockedRoleField
                        userObj={u}
                        isSelf={loggedUser?.id === u.id}
                        isCEO={isCEO}
                        onSave={handleSaveRole}
                      />
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {u.created_at
                        ? new Date(u.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
