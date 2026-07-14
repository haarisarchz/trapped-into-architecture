"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

export default function CompanyPage() {

  const { slug } = useParams();

  const router = useRouter();

  const [company, setCompany] = useState<any>(null);

  const [jobs, setJobs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("jobs");

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    fetchCompany();

  }, []);

  const fetchCompany = async () => {

    const { data } = await supabase
      .from("jobs")
      .select("*");

    if (!data) return;

    const companyJobs = data.filter((job: any) => {

      const companySlug = job.firm_name
        ?.toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");

      return companySlug === slug;

    });

    if (companyJobs.length > 0) {

      setCompany(companyJobs[0]);

      setJobs(companyJobs);

    }

    setLoading(false);

  };

  if (loading) {

    return (

      <main className="min-h-screen flex items-center justify-center">

        Loading...

      </main>

    );

  }

  if (!company) {

    return (

      <main className="min-h-screen">

        <Navbar />

        <div className="max-w-7xl mx-auto py-24 text-center">

          <h1 className="text-4xl font-bold">

            Company Not Found

          </h1>

        </div>

        <Footer />

      </main>

    );

  }

  return (

    <><main className="min-h-screen bg-gray-100">

      <Navbar />

      <section className="max-w-7xl mx-auto px-6 py-8">

        <button
          onClick={() => router.back()}
          className="mb-6 text-purple-600"
        >
          ← Back
        </button>

        <div className="grid grid-cols-12 gap-8">

          {/* LEFT COLUMN */}

          <div className="col-span-9 space-y-8">

            {/* HERO */}

            <div className="bg-white rounded-3xl shadow p-8">

              <div className="flex items-start gap-6">

                {/* Logo */}

                <div className="w-28 h-28 rounded-full bg-white border shadow flex items-center justify-center overflow-hidden flex-shrink-0">

                  {company.company_logo ? (

                    <img
                      src={company.company_logo}
                      alt={company.firm_name}
                      className="w-full h-full object-cover" />

                  ) : (

                    <div className="text-5xl font-bold">
                      {company.firm_name.charAt(0)}
                    </div>

                  )}

                </div>

                {/* Company Info */}

                <div className="flex-1">

                  <h1 className="text-4xl font-bold">
                    {company.firm_name}
                  </h1>

                  <p className="text-purple-600 mt-2">
                    {company.organization_type}
                  </p>

                  <p className="text-gray-500 mt-2">
                    📍 {company.city}, {company.state}
                  </p>

                  <div className="flex flex-wrap gap-3 mt-5">

                    <span className="px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm">
                      {jobs.length} Active Jobs
                    </span>

                    <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm">
                      {company.state}
                    </span>

                    <span className="px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm">
                      Verified Company
                    </span>

                  </div>

                </div>

              </div>

            </div>
            


            {/* ABOUT + CONTACT */}

            <div className="grid lg:grid-cols-3 gap-8">

              <div className="lg:col-span-2 bg-white rounded-3xl shadow p-8">

                <h2 className="text-2xl font-bold mb-5">

                  About Company

                </h2>

                <p className="text-gray-600 leading-8">

                  {company.company_description ||

                    "This company has not added its profile yet. Once verified, the complete company description, vision, services, founder information and practice philosophy will appear here."}

                </p>

                <div className="grid md:grid-cols-2 gap-6 mt-8">

                  <div>

                    <h4 className="font-semibold">

                      Founder

                    </h4>

                    <p className="text-gray-500">

                      {company.founder || "Not Available"}

                    </p>

                  </div>

                  <div>

                    <h4 className="font-semibold">

                      Founded

                    </h4>

                    <p className="text-gray-500">

                      {company.founded_year || "Not Available"}

                    </p>

                  </div>

                  <div>

                    <h4 className="font-semibold">

                      Company Size

                    </h4>

                    <p className="text-gray-500">

                      {company.company_size || "Not Available"}

                    </p>

                  </div>

                  <div>

                    <h4 className="font-semibold">

                      Specialisation

                    </h4>

                    <p className="text-gray-500">

                      {company.specialisation || "Architecture"}

                    </p>

                  </div>

                </div>


              </div>

              <div className="space-y-6">

                <div className="bg-white rounded-3xl shadow p-6">

                  <h2 className="text-xl font-bold mb-5">

                    Contact

                  </h2>

                  <div className="space-y-4 text-gray-600">

                    <p>📍 {company.city}, {company.state}</p>

                    <p>📧 {company.email || "Not Available"}</p>

                    <p>📞 {company.phone || "Not Available"}</p>

                    <p>🌐 {company.website || "Not Available"}</p>

                  </div>

                </div>

                <div className="bg-white rounded-3xl shadow p-6">

                  <h2 className="text-xl font-bold mb-5">

                    Company Statistics

                  </h2>

                  <div className="grid grid-cols-2 gap-4">

                    <div className="bg-gray-100 rounded-xl p-4 text-center">

                      <h3 className="text-2xl font-bold">

                        {jobs.length}

                      </h3>

                      <p className="text-sm text-gray-500">

                        Jobs

                      </p>

                    </div>

                    <div className="bg-gray-100 rounded-xl p-4 text-center">

                      <h3 className="text-2xl font-bold">

                        0

                      </h3>

                      <p className="text-sm text-gray-500">

                        Projects

                      </p>

                    </div>

                    <div className="bg-gray-100 rounded-xl p-4 text-center">

                      <h3 className="text-2xl font-bold">

                        0

                      </h3>

                      <p className="text-sm text-gray-500">

                        Employees

                      </p>

                    </div>

                    <div className="bg-gray-100 rounded-xl p-4 text-center">

                      <h3 className="text-2xl font-bold">

                        ★★★★★

                      </h3>

                      <p className="text-sm text-gray-500">

                        Rating

                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>


          {/* TABS */}

<div className="bg-white rounded-3xl shadow overflow-hidden">

            <div className="flex border-b">

              <button

                onClick={() => setActiveTab("jobs")}

                className={`px-8 py-5 font-semibold ${activeTab === "jobs"
                    ? "border-b-4 border-purple-600 text-purple-600"
                    : "text-gray-500"}`}

              >

                Jobs ({jobs.length})

              </button>

              <button

                onClick={() => setActiveTab("projects")}

                className={`px-8 py-5 font-semibold ${activeTab === "projects"
                    ? "border-b-4 border-purple-600 text-purple-600"
                    : "text-gray-500"}`}

              >

                Projects

              </button>

              <button

                onClick={() => setActiveTab("people")}

                className={`px-8 py-5 font-semibold ${activeTab === "people"
                    ? "border-b-4 border-purple-600 text-purple-600"
                    : "text-gray-500"}`}

              >

                People

              </button>

            </div>

          </div>

        {activeTab === "jobs" && (

  <div className="bg-white rounded-3xl shadow p-8">

    <h2 className="text-2xl font-bold mb-6">
      Current Openings
    </h2>

    <div className="space-y-5">

      {jobs.map((job: any) => (

        <div
          key={job.id}
          className="border rounded-2xl p-6 flex justify-between items-center"
        >

          <div>

            <h3 className="text-xl font-semibold">
              {job.job_title}
            </h3>

            <p className="text-gray-500 mt-2">
              {job.city}, {job.state}
            </p>

          </div>

          <button
            onClick={() => router.push(`/jobs/${job.id}`)}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl"
          >
            View Job
          </button>

        </div>

      ))}

    </div>

  </div>

  

)}

        </div> {/* END LEFT COLUMN */}

        {/* RIGHT SIDEBAR */}

        <aside className="col-span-3 space-y-6">

          {/* Similar Companies */}

          <div className="bg-white rounded-2xl border p-5">

            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">
                Similar Companies
              </h3>

              <button className="text-sm text-purple-600 hover:underline">
                View All
              </button>
            </div>

            <div className="space-y-4">

              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div>
                  <p className="font-medium">Morphogenesis</p>
                  <p className="text-xs text-gray-500">Delhi</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div>
                  <p className="font-medium">CP Kukreja</p>
                  <p className="text-xs text-gray-500">Delhi</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div>
                  <p className="font-medium">Studio Lotus</p>
                  <p className="text-xs text-gray-500">New Delhi</p>
                </div>
              </div>

            </div>

          </div>

          {/* Companies in City */}

          <div className="bg-white rounded-2xl border p-5">

            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">
                Companies in {company.city}
              </h3>

              <button className="text-sm text-purple-600 hover:underline">
                View All
              </button>
            </div>

            <div className="space-y-4">

              <div className="pb-3 border-b">Example Company</div>

              <div className="pb-3 border-b">Another Company</div>

              <div>XYZ Architects</div>

            </div>

          </div>

          {/* Recently Added */}

          <div className="bg-white rounded-2xl border p-5">

            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">
                Recently Added
              </h3>

              <button className="text-sm text-purple-600 hover:underline">
                View All
              </button>
            </div>

            <div className="space-y-4">

              <div className="pb-3 border-b">Company A</div>

              <div className="pb-3 border-b">Company B</div>

              <div>Company C</div>

            </div>

          </div>
          

        </aside>

     </div> {/* END GRID */}

</section>

<Footer />

</main>

</>

);
}