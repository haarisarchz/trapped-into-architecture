"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminUsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users"); // 'users' or 'admins'
  const [users, setUsers] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [jobCounts, setJobCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!currentUser) {
      router.push("/");
      return;
    }
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("username", currentUser.username)
      .single();

    const allowedRoles = ["superadmin", "admin", "ceo"];
    if (error || !profile || !allowedRoles.includes((profile.role || "").toLowerCase().replace(/[\s_]+/g, ""))) {
      router.push("/");
      return;
    }
    fetchData();
  };

  const fetchData = async () => {
    setLoading(true);
    // Fetch profiles
    const { data: profilesData } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    
    if (profilesData) {
      const allUsers = profilesData;
      const allAdmins = profilesData.filter(p => ["admin", "superadmin", "ceo"].includes((p.role || "").toLowerCase().replace(/[\s_]+/g, "")));
      
      setUsers(allUsers);
      setAdmins(allAdmins);

      const { data: jobsData } = await supabase.from("jobs").select("username");
      if (jobsData) {
        const counts: Record<string, number> = {};
        jobsData.forEach(job => {
          if (job.username) {
            counts[job.username] = (counts[job.username] || 0) + 1;
          }
        });
        setJobCounts(counts);
      }
    }
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    if (error) {
      alert("Failed to update role: " + error.message);
    } else {
      alert("Role updated successfully.");
      fetchData(); // refresh data
    }
  };

  if (loading) return <div className="p-10 text-center font-bold">Loading...</div>;

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-6xl mx-auto py-12 px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">User Management</h1>
          <button onClick={() => router.push('/admin')} className="bg-black text-white px-5 py-2 rounded-xl">
            Back to Dashboard
          </button>
        </div>

        <div className="flex border-b mb-6">
          <button 
            className={`px-6 py-3 font-semibold ${activeTab === 'users' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}
            onClick={() => setActiveTab("users")}
          >
            All Users
          </button>
          <button 
            className={`px-6 py-3 font-semibold ${activeTab === 'admins' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}
            onClick={() => setActiveTab("admins")}
          >
            Administrators
          </button>
        </div>

        <div className="bg-white border rounded-xl overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-4 font-bold text-sm">Name / Username</th>
                <th className="p-4 font-bold text-sm">Email / Phone</th>
                <th className="p-4 font-bold text-sm">Registered</th>
                {activeTab === 'admins' && <th className="p-4 font-bold text-sm">Posts Created</th>}
                <th className="p-4 font-bold text-sm">Role</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === 'users' ? users : admins).map(user => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-semibold">{user.display_name || "Unknown"}</div>
                    <div className="text-xs text-gray-500">@{user.username || user.id.slice(0, 8)}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">{user.email || "N/A"}</div>
                    {user.phone && <div className="text-xs text-gray-500">{user.phone}</div>}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  {activeTab === 'admins' && (
                    <td className="p-4 text-sm font-bold">
                      {jobCounts[user.username] || 0}
                    </td>
                  )}
                  <td className="p-4">
                    <select 
                      value={user.role || 'user'} 
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="border rounded p-1 text-sm bg-white"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Super Admin</option>
                      <option value="ceo">CEO</option>
                    </select>
                  </td>
                </tr>
              ))}
              {(activeTab === 'users' ? users : admins).length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </main>
  );
}
