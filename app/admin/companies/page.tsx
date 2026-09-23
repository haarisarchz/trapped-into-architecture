"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Edit2, EyeOff, Eye } from "lucide-react";

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!user) {
      router.push("/");
      return;
    }
    setCurrentUser(user);
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    // Fetch all companies
    const { data: companiesData, error: companiesError } = await supabase
      .from("companies")
      .select("*");
      
    // Fetch jobs to count them and aggregate companies if RLS blocks companies table
        // Fetch jobs to count them
    const { data: profilesData } = await supabase.from("profiles").select("id, display_name, full_name, username");
    const profilesMap: Record<string, any> = {};
    if (profilesData) profilesData.forEach(p => profilesMap[p.id] = p);
    
    const { data: jobsData, error: jobsError } = await supabase.from("jobs").select("company_id, status, firm_name, city, organization_type, author_id, posted_date");
    
    if (jobsError) return console.error(jobsError);

    const jobCounts: Record<string, { total: number; active: number }> = {};
    const fallbackCompanies: Record<string, any> = {};

    if (jobsData) {
      jobsData.forEach((job: any) => {
        if (job.company_id) {
          if (!jobCounts[job.company_id]) {
            jobCounts[job.company_id] = { total: 0, active: 0 };
          }
          jobCounts[job.company_id].total += 1;
          if (job.status === "published") {
            jobCounts[job.company_id].active += 1;
          }
        }
        
        // Fallback aggregation if RLS blocks the actual companies table
        if (job.firm_name) {
           if (!fallbackCompanies[job.firm_name]) {
              fallbackCompanies[job.firm_name] = {
                 id: "fallback-" + job.firm_name,
                 firm_name: job.firm_name,
                 city: job.city || "",
                 organization_type: job.organization_type || "Architecture Firm",
                 is_hidden: false,
                 totalJobs: 0,
                 activeJobs: 0,
                 created_by: job.author_id,
                 created_at: job.posted_date,
                 isFallback: true
              };
           }
           fallbackCompanies[job.firm_name].totalJobs += 1;
           if (job.status === "published") fallbackCompanies[job.firm_name].activeJobs += 1;
        }
      });
    }

    let merged = (companiesData || []).map((company: any) => ({
      ...company,
      totalJobs: jobCounts[company.id]?.total || 0,
      activeJobs: jobCounts[company.id]?.active || 0,
      profiles: company.created_by ? profilesMap[company.created_by] : null
    }));
    
    // If companiesData is empty (due to RLS), use the fallback aggregated from jobs!
    if (merged.length === 0) {
       merged = Object.values(fallbackCompanies).map(c => ({ ...c, profiles: c.created_by ? profilesMap[c.created_by] : null }));
    }

    setCompanies(merged);
  };

  const handleHideToggle = async (company: any) => {
    const action = company.is_hidden ? "Unhide" : "Hide";
    const confirmMessage = company.is_hidden 
      ? "Unhide this company? It will become visible in public listings again." 
      : "Hide this company?\\n\\nThis will remove the company from public company listings. Existing job records will not be deleted.";
      
    if (confirm(confirmMessage)) {
      const { error } = await supabase
        .from("companies")
        .update({ is_hidden: !company.is_hidden })
        .eq("id", company.id);
        
      if (!error) {
        fetchCompanies();
      } else {
        alert("Error updating visibility");
      }
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <section className="flex-1 w-full px-6 lg:px-12 py-10 max-w-[1400px] mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Companies</h1>
            <p className="text-gray-600 mt-2">Manage registered companies and their visibility.</p>
          </div>
          <button onClick={() => router.push("/admin")} className="bg-black text-white px-5 py-3 rounded-xl hover:bg-gray-800 transition flex items-center gap-2 shrink-0">
            ← Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1000px]">
              <thead className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600 uppercase">
                <tr>
                  <th className="px-6 py-4 font-semibold">Company</th>
                  <th className="px-6 py-4 font-semibold">Location</th>
                  <th className="px-6 py-4 font-semibold">Created By</th>
                  <th className="px-6 py-4 font-semibold">Created On</th>
                  <th className="px-6 py-4 font-semibold">Jobs (Total / Active)</th>
                  <th className="px-6 py-4 font-semibold">Visibility</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {companies.length > 0 ? (
                  companies.map((c, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {c.logo_url ? (
                            <img src={c.logo_url} alt="Logo" className="w-10 h-10 object-contain rounded-md border bg-white" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-md border flex items-center justify-center text-gray-400 text-xs">No Logo</div>
                          )}
                          <div>
                            <div className="font-bold text-gray-900">{c.firm_name}</div>
                            <div className="text-sm text-gray-500">{c.organization_type || "Architecture Firm"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {c.city} {c.state ? `, ${c.state}` : ""}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {c.profiles?.display_name || c.profiles?.full_name || c.profiles?.username || "Admin"}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{c.totalJobs}</span> / <span className="text-green-600 font-medium">{c.activeJobs} active</span>
                      </td>
                      <td className="px-6 py-4">
                        {c.is_hidden ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Hidden
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Visible
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button onClick={() => alert("Company editing will be implemented in the specific company edit modal/page.")} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit Company">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleHideToggle(c)} className={`p-2 rounded-lg transition ${c.is_hidden ? "text-gray-500 hover:text-green-600 hover:bg-green-50" : "text-gray-500 hover:text-red-600 hover:bg-red-50"}`} title={c.is_hidden ? "Unhide Company" : "Hide Company"}>
                            {c.is_hidden ? <Eye size={18} /> : <EyeOff size={18} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No companies found. Add a job to auto-create a company.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
