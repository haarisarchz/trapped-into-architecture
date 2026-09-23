"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";


const LockedRoleField = ({ userObj, currentUser, onSave }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRole, setSelectedRole] = useState(userObj.role || "User");
  const isSelf = userObj.id === currentUser?.id;
  
  const handleConfirm = () => {
     if (selectedRole === (userObj.role || "User")) {
        setIsEditing(false);
        return;
     }
     if (true) {
        onSave(userObj.id, selectedRole);
        setIsEditing(false);
     }
  };
  
  return (
     <div className="flex items-center gap-3">
        {isEditing ? (
           <>
              <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:outline-none">
                 <option value="User">User</option>
                 <option value="Admin">Admin</option>
                 <option value="Super_Admin">Super_Admin</option>
                 <option value="CEO">CEO</option>
              </select>
              <button onClick={handleConfirm} className="bg-black text-white text-xs px-3 py-1 rounded">Save</button>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-black text-xs">Cancel</button>
           </>
        ) : (
           <>
              <span className="capitalize">{userObj.role || "User"}</span>
              {!isSelf && (
                 <button onClick={() => setIsEditing(true)} className="text-blue-500 hover:text-blue-700 text-xs">
                    ✎ Edit Role
                 </button>
              )}
           </>
        )}
     </div>
  );
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [sortOption, setSortOption] = useState("recent");
  
  const sortedUsers = [...users].sort((a, b) => {
     if (sortOption === "username_asc") {
        const nameA = a.display_name || a.full_name || a.username || '';
        const nameB = b.display_name || b.full_name || b.username || '';
        return nameA.localeCompare(nameB);
     }
     if (sortOption === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
     }
     // recent
     return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });


  
  const handleRoleChange = async (userId: string, userName: string, oldRole: string, newRole: string) => {
    if (newRole === oldRole) return;
    if (window.confirm(`Change ${userName} from ${oldRole || 'User'} to ${newRole}?`)) {
      setLoading(true);
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      if (!error) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      } else {
        alert("Failed to update role");
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAccess();
  }, []);

  const [loggedUser, setLoggedUser] = useState<any>(null);
  const checkAccess = async () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!currentUser) {
      router.push("/admin");
      return;
    }
    
    // Fetch actual role from DB to avoid stale localStorage
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("username", currentUser.username)
      .single();
      
    const roleStr = (profile?.role || "").toLowerCase().replace(/[\s_]+/g, "");
    if (roleStr !== 'ceo') {
      router.push("/admin");
      return;
    }
    setLoggedUser(currentUser);
    fetchData();
  };

  const fetchData = async () => {
    setLoading(true);
    // Fetch profiles
    const { data: profilesData } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    
    if (profilesData) {
      setUsers(profilesData);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <section className="flex-1 w-full px-6 lg:px-12 py-10 max-w-[1400px] mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Manage Users</h1>
            <p className="text-gray-600 mt-2 mb-4">View and manage registered users and administrators.</p>
            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm bg-white cursor-pointer focus:outline-none">
               <option value="recent">Date Joined - Recent First</option>
               <option value="oldest">Date Joined - Oldest First</option>
               <option value="username_asc">Username - Ascending</option>
            </select>
          </div>
          <button onClick={() => router.push("/admin")} className="bg-black text-white px-5 py-3 rounded-xl hover:bg-gray-800 transition flex items-center gap-2 shrink-0">
            ← Back to Dashboard
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">Loading data...</div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left min-w-[800px]">
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
                  <tr key={u.id || i} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-500 font-medium">{i + 1}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{u.display_name || u.full_name || u.username || 'User'}</div>
                      <div className="text-sm text-gray-500">{u.email}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      <LockedRoleField userObj={u} currentUser={loggedUser} onSave={(uid: string, newR: string) => handleRoleChange(uid, u.display_name || u.username || 'User', u.role, newR)} />
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(u.created_at).toLocaleDateString()}
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
