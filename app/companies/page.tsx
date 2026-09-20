"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { LayoutGrid, Rows3, List } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CompaniesPage() {

  const router = useRouter();

  const [jobs, setJobs] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState<
    "visual" | "balanced" | "dense"
  >("balanced");

  const [search, setSearch] = useState("");

  const [sortBy, setSortBy] =
    useState("Most Jobs");

  const [selectedStates, setSelectedStates] =
    useState<string[]>([]);

  const [selectedCities, setSelectedCities] =
    useState<string[]>([]);

  const [selectedCategories, setSelectedCategories] =
    useState<string[]>([]);

  const [selectedSoftware, setSelectedSoftware] =
    useState<string[]>([]);

  const [selectedSpecialisation,
    setSelectedSpecialisation] =
    useState<string[]>([]);

    const [selectedFirmSize, setSelectedFirmSize] = useState<string[]>([]);
const [activeJobsOnly, setActiveJobsOnly] = useState(false);
const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {

    fetchCompanies();

  }, []);

  const fetchCompanies = async () => {

    const { data, error } =
      await supabase
        .from("jobs")
        .select("*");

    if (error) {

      console.log(error);

    } else {

      setJobs(data || []);

    }

    setLoading(false);

  };

  const companies = useMemo(() => {
  const grouped: any = {};

  jobs.forEach((job) => {
    const name = job.firm_name || "Unknown Company";

    if (!grouped[name]) {
     grouped[name] = {

  company: name,

  slug: name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, ""),

  city: job.city || "",

  state: job.state || "",

  organizationType:
    job.organization_type ||
    "Architecture Firm",

  logo: job.company_logo || "",

  totalJobs: 0,

};
    }

    grouped[name].totalJobs++;
  });

  return Object.values(grouped);
}, [jobs]);

const categories = useMemo(
  () =>
    [...new Set(companies.map((c: any) => c.organizationType))]
      .filter(Boolean)
      .sort(),
  [companies]
);

const states = useMemo(
  () =>
    [...new Set(companies.map((c: any) => c.state))]
      .filter(Boolean)
      .sort(),
  [companies]
);

const cities = useMemo(() => {

  const filtered =
    selectedStates.length === 0
      ? companies
      : companies.filter((c: any) =>
          selectedStates.includes(c.state)
        );

  return [...new Set(filtered.map((c: any) => c.city))]
    .filter(Boolean)
    .sort();

}, [companies, selectedStates]);

const softwares = useMemo(() => {

  const list: string[] = [];

  jobs.forEach((job: any) => {

    if (!job.required_software) return;

    if (Array.isArray(job.required_software)) {

      list.push(...job.required_software);

    } else {

      list.push(
        ...String(job.required_software)
          .split(",")
          .map((x: any) => typeof x === "string" ? x.trim() : String(x || ""))
      );

    }

  });

  return [...new Set(list)].sort();

}, [jobs]);

const specialisations = useMemo(() => {

  return [
    ...new Set(
      jobs.map((j: any) => j.specialisation)
    ),
  ]
    .filter(Boolean)
    .sort();

    const filteredCompanies = useMemo(() => {

  let data = [...companies];

  // SEARCH

  if (search.trim() !== "") {

    const keyword = search.toLowerCase();

    data = data.filter((company: any) =>

      company.company.toLowerCase().includes(keyword) ||

      company.city.toLowerCase().includes(keyword) ||

      company.state.toLowerCase().includes(keyword) ||

      company.organizationType
        .toLowerCase()
        .includes(keyword)

    );

  }

  // CATEGORY

  if (selectedCategories.length > 0) {

    data = data.filter((company: any) =>

      selectedCategories.includes(
        company.organizationType
      )

    );

  }

  // STATE

  if (selectedStates.length > 0) {

    data = data.filter((company: any) =>

      selectedStates.includes(company.state)

    );

  }

  // CITY

  if (selectedCities.length > 0) {

    data = data.filter((company: any) =>

      selectedCities.includes(company.city)

    );

  }

  // SOFTWARE

  if (selectedSoftware.length > 0) {

    data = data.filter((company: any) => {

      const software = Array.isArray(company.software)

        ? company.software

        : String(company.software)
            .split(",");

      return selectedSoftware.some((x) =>
        software.includes(x)
      );

    });

  }

  // SPECIALISATION

  if (selectedSpecialisation.length > 0) {

    data = data.filter((company: any) =>

      selectedSpecialisation.includes(
        company.specialisation
      )

    );

  }

  // ACTIVE JOBS

  if (activeJobsOnly) {

    data = data.filter(
      (company: any) =>
        company.totalJobs > 0
    );

  }

  // SORT

  if (sortBy === "A-Z") {

    data.sort((a: any, b: any) =>
      a.company.localeCompare(b.company)
    );

  }

  if (sortBy === "Most Jobs") {

    data.sort(
      (a: any, b: any) =>
        b.totalJobs - a.totalJobs
    );

  }

  return data;

}, [

  companies,

  search,

  sortBy,

  selectedStates,

  selectedCities,

  selectedCategories,

  selectedSoftware,

  selectedSpecialisation,

  activeJobsOnly,

]);

}, [jobs]);

  if (loading) {

    
  const renderFilters = () => (
    <aside className="w-full">

    <div className="flex justify-between items-center mb-7">
      <h2 className="text-3xl font-bold">
        Filters
      </h2>

      <button
        onClick={() => {
          setSelectedStates([]);
          setSelectedCities([]);
          setSelectedCategories([]);
          setSelectedSoftware([]);
          setSelectedSpecialisation([]);
          setSelectedFirmSize([]);
          setActiveJobsOnly(false);
          setSearch("");
        }}
        className="text-orange-500 text-sm hover:text-orange-600"
      >
        Clear Filters
      </button>
    </div>

    {/* COMPANY CATEGORY */}

    <div className="mb-8">

      <h3 className="font-semibold mb-3">
        Company Category
      </h3>

      {categories.map((category) => (

        <label
          key={category}
          className="flex items-center gap-2 mb-2 cursor-pointer"
        >

          <input
            type="checkbox"
            checked={selectedCategories.includes(category)}
            onChange={(e) =>

              e.target.checked
                ? setSelectedCategories([
                    ...selectedCategories,
                    category,
                  ])
                : setSelectedCategories(
                    selectedCategories.filter(
                      (x) => x !== category
                    )
                  )
            }
          />

          {category}

        </label>

      ))}

    </div>

    {/* STATE */}

    <div className="mb-8">

      <h3 className="font-semibold mb-3">
        State
      </h3>

      {states.map((state) => (

        <label
          key={state}
          className="flex items-center gap-2 mb-2 cursor-pointer"
        >

          <input
            type="checkbox"
            checked={selectedStates.includes(state)}
            onChange={(e) =>

              e.target.checked
                ? setSelectedStates([
                    ...selectedStates,
                    state,
                  ])
                : setSelectedStates(
                    selectedStates.filter(
                      (x) => x !== state
                    )
                  )
            }
          />

          {state}

        </label>

      ))}

    </div>

    {/* CITY */}

    <div className="mb-8">

      <h3 className="font-semibold mb-3">
        City
      </h3>

      {cities.map((city) => (

        <label
          key={city}
          className="flex items-center gap-2 mb-2 cursor-pointer"
        >

          <input
            type="checkbox"
            checked={selectedCities.includes(city)}
            onChange={(e) =>

              e.target.checked
                ? setSelectedCities([
                    ...selectedCities,
                    city,
                  ])
                : setSelectedCities(
                    selectedCities.filter(
                      (x) => x !== city
                    )
                  )
            }
          />

          {city}

        </label>

      ))}

    </div>

    {/* SOFTWARE */}

    <div className="mb-8">

      <h3 className="font-semibold mb-3">
        Software
      </h3>

      {softwares.map((software) => (

        <label
          key={software}
          className="flex items-center gap-2 mb-2 cursor-pointer"
        >

          <input
            type="checkbox"
            checked={selectedSoftware.includes(software)}
            onChange={(e) =>

              e.target.checked
                ? setSelectedSoftware([
                    ...selectedSoftware,
                    software,
                  ])
                : setSelectedSoftware(
                    selectedSoftware.filter(
                      (x) => x !== software
                    )
                  )
            }
          />

          {software}

        </label>

      ))}

    </div>

    {/* SPECIALISATION */}

    <div className="mb-8">

      <h3 className="font-semibold mb-3">
        Specialisation
      </h3>

      {specialisations.map((item) => (

        <label
          key={item}
          className="flex items-center gap-2 mb-2 cursor-pointer"
        >

          <input
            type="checkbox"
            checked={selectedSpecialisation.includes(item)}
            onChange={(e) =>

              e.target.checked
                ? setSelectedSpecialisation([
                    ...selectedSpecialisation,
                    item,
                  ])
                : setSelectedSpecialisation(
                    selectedSpecialisation.filter(
                      (x) => x !== item
                    )
                  )
            }
          />

          {item}

        </label>

      ))}

    </div>

    {/* FIRM SIZE */}

    <div className="mb-8">

      <h3 className="font-semibold mb-3">
        Firm Size
      </h3>

      {["1-10","11-50","51-200","200+"].map((size)=>(

        <label
          key={size}
          className="flex items-center gap-2 mb-2 cursor-pointer"
        >

          <input
            type="checkbox"
            checked={selectedFirmSize.includes(size)}
            onChange={(e)=>

              e.target.checked
                ? setSelectedFirmSize([
                    ...selectedFirmSize,
                    size,
                  ])
                : setSelectedFirmSize(
                    selectedFirmSize.filter(
                      (x)=>x!==size
                    )
                  )
            }
          />

          {size} Employees

        </label>

      ))}

    </div>

    {/* HIRING NOW */}

    <label className="flex items-center gap-2 font-medium cursor-pointer">

      <input
        type="checkbox"
        checked={activeJobsOnly}
        onChange={() =>
          setActiveJobsOnly(!activeJobsOnly)
        }
      />

      Hiring Now

    </label>

  </aside>
  );
  
  return (

      <main className="min-h-screen flex items-center justify-center">

        Loading...

      
  {/* MOBILE FILTER DRAWER */}
  {mobileFiltersOpen && (
    <div className="fixed inset-0 z-[200] flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={() => setMobileFiltersOpen(false)}
      />
      {/* Drawer */}
      <div className="relative w-full max-w-xs bg-white h-full shadow-xl flex flex-col overflow-y-auto animate-in slide-in-from-left duration-300">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold">Filters</h2>
          <button 
            onClick={() => setMobileFiltersOpen(false)}
            className="text-gray-400 hover:text-black transition"
          >
            ✕
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {renderFilters()}
        </div>
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <button 
            onClick={() => setMobileFiltersOpen(false)}
            className="w-full bg-black text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition"
          >
            Show Results
          </button>
        </div>
      </div>
    </div>
  )}
  
</main>

    );

  }

  return (

    <main className="min-h-screen bg-gray-100">

      <Navbar />

      <section className="w-full px-6 lg:px-12 py-10">

        <div className="mb-10">

          <h1 className="text-5xl font-bold">

            Companies

          </h1>

          <p className="text-gray-600 mt-2">

            Explore architecture firms across India.

          </p>


  {/* ================= MAIN LAYOUT ================= */}

<div className="flex flex-col lg:flex-row gap-8 mt-8 items-start w-full">

  {/* ================= LEFT FILTER SIDEBAR ================= */}

  {renderFilters()}

  {/* ================= RIGHT CONTENT ================= */}

  <div className="flex-1 min-w-0 w-full">

    {/* TOOLBAR */}

    <div className="flex items-center gap-5 mb-8">

      <div className="flex items-center gap-3">

        <span className="font-semibold whitespace-nowrap">
          View By :
        </span>

        <div className="flex border rounded-xl overflow-hidden">

          <button
            onClick={() => setViewMode("visual")}
            className={`px-4 py-3 ${
              viewMode === "visual"
                ? "bg-black text-white"
                : "bg-white"
            }`}
          >
            <LayoutGrid size={18}/>
          </button>

          <button
            onClick={() => setViewMode("balanced")}
            className={`px-4 py-3 ${
              viewMode === "balanced"
                ? "bg-black text-white"
                : "bg-white"
            }`}
          >
            <Rows3 size={18}/>
          </button>

          <button
            onClick={() => setViewMode("dense")}
            className={`px-4 py-3 ${
              viewMode === "dense"
                ? "bg-black text-white"
                : "bg-white"
            }`}
          >
            <List size={18}/>
          </button>

        </div>

      </div>

      <input
        value={search}
        onChange={(e)=>setSearch(e.target.value)}
        placeholder="Search companies..."
        className="flex-1 border rounded-xl px-5 py-3"
      />

      <div className="flex items-center gap-3">

        <span className="font-semibold">
          Sort By :
        </span>

        <select
          value={sortBy}
          onChange={(e)=>setSortBy(e.target.value)}
          className="border rounded-xl px-5 py-3"
        >
          <option>Most Jobs</option>
          <option>A-Z</option>
          <option>Recently Added</option>
        </select>

      </div>

    </div>


    {/* COMPANY CARDS */}

<div
  className={
    viewMode === "visual"
      ? "grid grid-cols-1 lg:grid-cols-3 gap-8 w-full"

      : viewMode === "balanced"
      ? "grid grid-cols-2 xl:grid-cols-4 gap-6 w-full"

      : "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 w-full auto-rows-min"
  }
>
  {companies.map((company: any) => (
    <div
      key={company.company}
    className={`
bg-white
rounded-3xl
shadow
hover:shadow-xl
transition
overflow-hidden

${
  viewMode === "dense"
    ? "flex items-center px-4 py-3 h-28"
    : ""
}
`}
    >

      {/* ================= LOGO ================= */}

      <div
        className={`
          bg-gray-100
          flex
          items-center
          justify-center

          ${
            viewMode === "visual"
              ? "h-40"
              : viewMode === "balanced"
              ? "h-28"
              : "w-16 h-16 rounded-full ml-3 flex-shrink-0"
          }
        `}
      >

        {company.logo ? (
          <img
            src={company.logo}
            alt={company.company}
            className={`
              object-contain

              ${
                viewMode === "visual"
                  ? "w-24 h-24"
                  : viewMode === "balanced"
                  ? "w-16 h-16"
                  : "w-12 h-12 rounded-full"
              }
            `}
          />
        ) : (
          <div
            className={`
              rounded-full
              bg-black
              text-white
              flex
              items-center
              justify-center
              font-bold

              ${
                viewMode === "visual"
                  ? "w-24 h-24 text-5xl"
                  : viewMode === "balanced"
                  ? "w-16 h-16 text-3xl"
                  : "w-12 h-12 text-xl"
              }
            `}
          >
            {company.company.charAt(0)}
          </div>
        )}

      </div>

      {/* ================= CONTENT ================= */}

      <div
        className={
          viewMode === "dense"
            ? "flex-1 px-4"
            : viewMode === "balanced"
            ? "p-4"
            : "p-6"
        }
      >

        <h2
          className={`
            font-bold

            ${
              viewMode === "visual"
                ? "text-2xl"
                : viewMode === "balanced"
                ? "text-lg"
                : "text-lg"
            }
          `}
        >
          {company.company}
        </h2>

        <p
          className={`
            text-gray-500

            ${
              viewMode === "dense"
                ? "text-xs mt-1"
                : "text-sm mt-2"
            }
          `}
        >
          {company.organizationType}
        </p>

        <p
          className={`
            text-gray-500

            ${
              viewMode === "dense"
                ? "text-xs mt-1"
                : "text-sm mt-2"
            }
          `}
        >
          📍 {company.city}, {company.state}
        </p>

        <div
          className={`
            flex justify-between items-center

            ${
              viewMode === "dense"
                ? "mt-2"
                : "mt-5"
            }
          `}
        >

          <span
            className={`
              bg-gray-200
              text-gray-900
              rounded-full

              ${
                viewMode === "dense"
                  ? "px-2 py-0.5 text-[11px]"
                  : "px-3 py-1 text-sm"
              }
            `}
          >
            {company.totalJobs} Jobs
          </span>

         <button
  onClick={() =>
    router.push(`/companies/${company.slug}`)
  }
  className="text-black font-semibold hover:underline"
>
  View →
</button>

        </div>

      </div>

    </div>
  ))}
</div>

  </div>

</div>
</div>

      </section>

      <Footer />

    </main>

  );

}