"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    // Fetch all companies
    const { data: companiesData, error: companiesError } = await supabase.from("companies").select("*");
    if (companiesError) return console.error(companiesError);

    // Fetch jobs to count them
    const { data: jobsData, error: jobsError } = await supabase.from("jobs").select("company_id");
    if (jobsError) return console.error(jobsError);

    const jobCounts: Record<string, number> = {};
    if (jobsData) {
      jobsData.forEach((job: any) => {
        if (job.company_id) {
          jobCounts[job.company_id] = (jobCounts[job.company_id] || 0) + 1;
        }
      });
    }

    const merged = (companiesData || []).map((company: any) => ({
      ...company,
      jobCount: jobCounts[company.id] || 0,
    }));

    setCompanies(merged);
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="w-full px-6 lg:px-12 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Companies</h1>
            <p className="text-gray-600 mt-2">Manage registered companies.</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow border overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-white border-b">
              <tr>
                <th className="px-6 py-5">Company</th>
                <th className="px-6 py-5">Location</th>
                <th className="px-6 py-5">Jobs</th>
                <th className="px-6 py-5">Type</th>
              </tr>
            </thead>
            <tbody>
              {companies.length > 0 ? (
                companies.map((c, i) => (
                  <tr key={i} className="hover:bg-white">
                    <td className="px-6 py-4 border-b">
                      <div className="font-semibold">{c.firm_name}</div>
                    </td>
                    <td className="px-6 py-4 border-b">
                      {c.city} {c.state ? `, ${c.state}` : ""}
                    </td>
                    <td className="px-6 py-4 border-b">{c.jobCount}</td>
                    <td className="px-6 py-4 border-b">{c.organization_type}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    No companies registered yet.
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

