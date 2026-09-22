"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminUsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    checkAccess();
  }, []);

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
            <p className="text-gray-600 mt-2">View and manage registered users and administrators.</p>
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
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{u.display_name || u.full_name || u.username || 'User'}</div>
                      <div className="text-sm text-gray-500">{u.email}</div>
                    </td>
                    <td className="px-6 py-4 capitalize text-gray-700">
                      {u.role || "User"}
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
