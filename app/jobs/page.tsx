"use client";

import Navbar from "@/components/Navbar";
import JobCard from "@/components/Jobcard";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

import {
  LayoutGrid,
  Rows3,
  List,
} from "lucide-react";

import { useState, useEffect } from "react";

export default function JobsPage() {

  const [selectedStates, setSelectedStates] = useState<string[]>([]);

  const [selectedCities, setSelectedCities] = useState<string[]>([]);

  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);

  const [selectedQualifications, setSelectedQualifications] = useState<string[]>([]);

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");

 const [viewMode, setViewMode] = useState("visual");

 const [sortBy, setSortBy] = useState("latest");

 const [jobs, setJobs] = useState<any[]>([]);
 const [excludeExpired, setExcludeExpired] =
  useState(false);

  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);

const [selectedSalary, setSelectedSalary] = useState<string[]>([]);

 const uniqueStates = [
  ...new Set(
    jobs.map((job: any) => job.state)
  ),
];

const uniqueCities = [
  ...new Set(
    jobs
      .filter((job: any) => {

        if (selectedStates.length === 0) {
          return true;
        }

        return selectedStates.includes(
          job.state
        );

      })
      .map((job: any) => job.city)
  ),
];
  useEffect(() => {

  const fetchJobs = async () => {

    const { data, error } =
      await supabase
        .from("jobs")
        .select("*");

    if (error) {

      console.log(error);

    } else {

      setJobs(
  data.map((job) => ({
    id: job.id,
    firmName: job.firm_name,
    organizationType: job.organization_type,
    area: job.area,
    city: job.city,
    state: job.state,
    position: job.position,
    experience: Array.isArray(job.experience)
  ? job.experience
  : [],
    salary: job.salary,

    qualifications: Array.isArray(job.qualifications)
      ? job.qualifications
      : [],

    skills_required: Array.isArray(job.skills_required)
      ? job.skills_required
      : [],

    postedDate: job.posted_date,
    lastDateToApply: job.last_date_to_apply,
    postExpiryDate: job.post_expiry_date,
    jobDescription: job.job_description,
    applicationType: job.application_type,
    apply_link: job.apply_link,
    application_email: job.application_email,
    source: job.source,
    image: job.image,
  }))
);

    }

  };

  fetchJobs();

}, []);

  return (
    <main className="min-h-screen bg-gray-100">

      <Navbar />

      <section className="p-10">

        <h1 className="text-5xl font-bold mb-8">
          Architecture Jobs
        </h1>

        <div className="flex gap-8">

  {/* FILTER SIDEBAR */}

<div className="w-72 bg-white p-6 rounded-2xl shadow-md h-fit border border-gray-200">

  <div className="flex items-center justify-between mb-6">

    <h2 className="text-2xl font-bold">
      Filters
    </h2>

    <button
      onClick={() => {
        setSelectedStates([]);
        setSelectedCities([]);
        setSelectedPositions([]);
        setSelectedQualifications([]);
        setSelectedSkills([]);
        setSelectedExperience([]);
setSelectedSalary([]);
      }}
      className="text-sm text-orange-500 font-medium"
    >
      Clear Filters
    </button>

  </div>

  <div className="space-y-8">

    {/* STATE */}

    <div>

      <h3 className="font-semibold mb-3">
        State
      </h3>

      <div className="space-y-2 text-sm">

        {uniqueStates.map((state) => (

          <label
            key={state}
            className="flex items-center gap-2"
          >

            <input
              type="checkbox"

              checked={selectedStates.includes(state)}

              onChange={(e) => {

                if (e.target.checked) {

                  setSelectedStates([
                    ...selectedStates,
                    state
                  ]);

                } else {

                  setSelectedStates(
                    selectedStates.filter(
                      (s) => s !== state
                    )
                  );

                }

              }}
            />

            {state}

          </label>

        ))}

      </div>

    </div>

    {/* CITY */}

    <div>

      <h3 className="font-semibold mb-3">
        City
      </h3>

      <div className="space-y-2 text-sm">

        {uniqueCities.map((city) => (

          <label
            key={city}
            className="flex items-center gap-2"
          >

            <input
              type="checkbox"

              checked={selectedCities.includes(city)}

              onChange={(e) => {

                if (e.target.checked) {

                  setSelectedCities([
                    ...selectedCities,
                    city
                  ]);

                } else {

                  setSelectedCities(
                    selectedCities.filter(
                      (c) => c !== city
                    )
                  );

                }

              }}
            />

            {city}

          </label>

        ))}

      </div>

    </div>

    {/* EXPERIENCE */}

<div>

  <h3 className="font-semibold mb-3">
    Experience
  </h3>

  <div className="space-y-2 text-sm">

    {[
      ...new Set(
        jobs.flatMap((job) =>

          Array.isArray(job.experience)
            ? job.experience.map((exp: string) => exp.trim())
            : []

        )
      ),
    ]
      .filter(Boolean)
      .map((experience: string, index) => (

        <label
          key={`${experience}-${index}`}
          className="flex items-center gap-2"
        >

          <input
            type="checkbox"

            checked={selectedExperience.includes(experience)}

            onChange={(e) => {

              if (e.target.checked) {

                setSelectedExperience([
                  ...selectedExperience,
                  experience
                ]);

              } else {

                setSelectedExperience(
                  selectedExperience.filter(
                    (exp) => exp !== experience
                  )
                );

              }

            }}
          />

          {experience}

        </label>

      ))}

  </div>

</div>

    {/* SALARY */}

<div>

  <h3 className="font-semibold mb-3">
    Salary Range
  </h3>

  <div className="space-y-2 text-sm">

    {[
      ...new Set(
        jobs.map((job) => job.salary)
      ),
    ].map((salary) => (

      <label
        key={salary}
        className="flex items-center gap-2"
      >

        <input
          type="checkbox"

          checked={selectedSalary.includes(salary)}

          onChange={(e) => {

            if (e.target.checked) {

              setSelectedSalary([
                ...selectedSalary,
                salary
              ]);

            } else {

              setSelectedSalary(
                selectedSalary.filter(
                  (sal) => sal !== salary
                )
              );

            }

          }}
        />

        {salary}

      </label>

    ))}

  </div>

</div>

    {/* QUALIFICATION */}

<div>

  <h3 className="font-semibold mb-3">
    Qualification
  </h3>

  <div className="space-y-2 text-sm">

    {[
      ...new Set(
        jobs.flatMap((job) =>

          Array.isArray(job.qualifications)
            ? job.qualifications.map((q: string) => q.trim())
            : []

        )
      ),
    ]
      .filter(Boolean)
      .map((qualification, index) => (

        <label
          key={`${qualification}-${index}`}
          className="flex items-center gap-2"
        >

          <input
            type="checkbox"

            checked={selectedQualifications.includes(qualification)}

            onChange={(e) => {

              if (e.target.checked) {

                setSelectedQualifications([
                  ...selectedQualifications,
                  qualification
                ]);

              } else {

                setSelectedQualifications(
                  selectedQualifications.filter(
                    (q) => q !== qualification
                  )
                );

              }

            }}
          />

          {qualification}

        </label>

      ))}

  </div>

</div>

    {/* SKILLS */}

<div>

  <h3 className="font-semibold mb-3">
    Skills Required
  </h3>

  <div className="space-y-2 text-sm">

    {[
      ...new Set(
        jobs.flatMap((job) =>

          Array.isArray(job.skills_required)
            ? job.skills_required.map((skill: string) => skill.trim())
            : []

        )
      ),
    ]
      .filter(Boolean)
      .map((skill: string, index) => (

        <label
          key={`${skill}-${index}`}
          className="flex items-center gap-2"
        >

          <input
            type="checkbox"

            checked={selectedSkills.includes(skill)}

            onChange={(e) => {

              if (e.target.checked) {

                setSelectedSkills([
                  ...selectedSkills,
                  skill
                ]);

              } else {

                setSelectedSkills(
                  selectedSkills.filter(
                    (s) => s !== skill
                  )
                );

              }

            }}
          />

          {skill}

        </label>

      ))}

  </div>

</div>

<div className="mt-6 flex items-center gap-3">

  <h3 className="font-semibold">
    Exclude Expired Jobs
  </h3>

  <input
    type="checkbox"
    checked={excludeExpired}
    onChange={() =>
      setExcludeExpired(!excludeExpired)
    }
  />

</div>

    </div>

  </div>


{/* RIGHT SIDE */}

<div className="flex-1">

  {/* VIEW + SORT BAR */}

<div className="flex justify-between items-center mb-3 gap-10">

  {/* VIEW BY */}

<div className="flex items-center gap-4">

  <p className="font-medium whitespace-nowrap">
    View By :
  </p>

  <div className="flex border rounded-xl overflow-hidden">

  <button
    onClick={() => setViewMode("visual")}
    className={`px-4 py-3 ${
      viewMode === "visual"
        ? "bg-black text-white"
        : "bg-white text-black"
    }`}
  >
    <LayoutGrid size={18} />
  </button>

  <button
    onClick={() => setViewMode("balanced")}
    className={`px-4 py-3 ${
      viewMode === "balanced"
        ? "bg-black text-white"
        : "bg-white text-black"
    }`}
  >
    <Rows3 size={18} />
  </button>

  <button
  onClick={() => setViewMode("dense")}
  className={`px-4 py-3 transition ${
    viewMode === "dense"
      ? "bg-black text-white"
      : "bg-white text-black hover:bg-gray-100"
  }`}
>
  <List size={18} />
</button>

</div>

</div>

  {/* SEARCH */}

  <input
    type="text"
    placeholder="Search jobs..."
    value={searchQuery}
    onChange={(e) =>
      setSearchQuery(e.target.value)
    }
    className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
  />

  {/* SORT BY */}

  <div className="flex items-center gap-4">

    <p className="font-medium">
      Sort By :
    </p>

<select
  value={sortBy}
  onChange={(e) =>
    setSortBy(e.target.value)
  }
  className="border border-gray-300 rounded-lg px-4 py-2">
     <option value="latest">
  Latest Posted
</option>

<option value="salaryHigh">
  Salary High to Low
</option>

<option value="salaryLow">
  Salary Low to High
</option>

<option value="expiry">
  Expiry Date
</option>

    </select>

  </div>

</div>
{/* ACTIVE FILTERS */}

{(
  selectedStates.length > 0 ||
  selectedCities.length > 0 ||
  selectedPositions.length > 0 ||
  selectedQualifications.length > 0 ||
  selectedSkills.length > 0
) && (

  <div className="flex flex-wrap gap-2 mb-3">

    {/* STATES */}

    {selectedStates.map((state) => (

      <div
        key={state}
        className="bg-white border border-gray-300 rounded-full px-2 py-1 text-sm flex items-center gap-2 shadow-sm"
      >

        {state}

        <button
          onClick={() =>
            setSelectedStates(
              selectedStates.filter(
                (s) => s !== state
              )
            )
          }
          className="text-gray-500 hover:text-black"
        >
          ×
        </button>

      </div>

    ))}

    {/* CITIES */}

    {selectedCities.map((city) => (

      <div
        key={city}
        className="bg-white border border-gray-300 rounded-full px-2 py-1 text-sm flex items-center gap-2 shadow-sm"
      >

        {city}

        <button
          onClick={() =>
            setSelectedCities(
              selectedCities.filter(
                (c) => c !== city
              )
            )
          }
          className="text-gray-500 hover:text-black"
        >
          ×
        </button>

      </div>

    ))}

    {/* POSITIONS */}

    {selectedPositions.map((position) => (

      <div
        key={position}
        className="bg-white border border-gray-300 rounded-full px-2 py-1 text-sm flex items-center gap-2 shadow-sm"
      >

        {position}

        <button
          onClick={() =>
            setSelectedPositions(
              selectedPositions.filter(
                (p) => p !== position
              )
            )
          }
          className="text-gray-500 hover:text-black"
        >
          ×
        </button>

      </div>

    ))}

    {/* QUALIFICATIONS */}

    {selectedQualifications.map((qualification) => (

      <div
        key={qualification}
        className="bg-white border border-gray-300 rounded-full px-2 py-1 text-sm flex items-center gap-2 shadow-sm"
      >

        {qualification}

        <button
          onClick={() =>
            setSelectedQualifications(
              selectedQualifications.filter(
                (q) => q !== qualification
              )
            )
          }
          className="text-gray-500 hover:text-black"
        >
          ×
        </button>

      </div>

    ))}

    {/* SKILLS */}

    {selectedSkills.map((skill) => (

      <div
        key={skill}
        className="bg-white border border-gray-300 rounded-full px-2 py-1 text-sm flex items-center gap-2 shadow-sm"
      >

        {skill}

        <button
          onClick={() =>
            setSelectedSkills(
              selectedSkills.filter(
                (s) => s !== skill
              )
            )
          }
          className="text-gray-500 hover:text-black"
        >
          ×
        </button>

      </div>

    ))}

  </div>

)}
  {/* JOB LIST */}

<div
  className={
    viewMode === "visual"
      ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"

      : viewMode === "balanced"
      ? "grid grid-cols-1 xl:grid-cols-2 gap-5"

      : viewMode === "dense"
      ? "grid grid-cols-1 md:grid-cols-2 gap-3"

      : ""
  }
>
 {jobs
  .filter((job: any) => {

    const stateMatch =
      selectedStates.length === 0 ||
      selectedStates.includes(job.state);

    const cityMatch =
      selectedCities.length === 0 ||
      selectedCities.includes(job.city);

    const positionMatch =
      selectedPositions.length === 0 ||
      selectedPositions.includes(job.position);

    const qualificationMatch =
      selectedQualifications.length === 0 ||

      job.qualifications?.some(
        (qualification: string) =>

          selectedQualifications.includes(
            qualification
          )
      );

    const skillsMatch =
      selectedSkills.length === 0 ||

      job.skillsRequired?.some(
        (skill: string) =>

          selectedSkills.includes(skill)
      );

    const experienceMatch =
      selectedExperience.length === 0 ||

      job.experience?.some(
        (exp: string) =>

          selectedExperience.includes(exp)
      );

    const salaryMatch =
      selectedSalary.length === 0 ||
      selectedSalary.includes(job.salary);

    const searchMatch =
      searchQuery === "" ||

      job.firmName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||

      job.position
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||

      job.city
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||

      job.skillsRequired?.some(
        (skill: string) =>

          skill
            .toLowerCase()
            .includes(
              searchQuery.toLowerCase()
            )
      );

    const expiryMatch =
      !excludeExpired ||

      !job.postExpiryDate ||

      new Date(job.postExpiryDate) >=
        new Date();

    return (
      stateMatch &&
      cityMatch &&
      positionMatch &&
      qualificationMatch &&
      skillsMatch &&
      experienceMatch &&
      salaryMatch &&
      searchMatch &&
      expiryMatch
    );

  })

  .sort((a, b) => {

    if (sortBy === "salaryLow") {

      return (
        Number(a.salary.replace(/\D/g, "")) -
        Number(b.salary.replace(/\D/g, ""))
      );

    }

    if (sortBy === "salaryHigh") {

      return (
        Number(b.salary.replace(/\D/g, "")) -
        Number(a.salary.replace(/\D/g, ""))
      );

    }

    if (sortBy === "expiry") {

      return (
        new Date(a.postExpiryDate).getTime() -
        new Date(b.postExpiryDate).getTime()
      );

    }

    return 0;

  })

  .map((job, index) => (

    <JobCard
      key={index}
      id={job.id}
      viewMode={viewMode}
      firm_name={job.firmName}
      area={job.area}
      city={job.city}
      state={job.state}
      position={job.position}
      experience={job.experience}
      salary={job.salary}
      qualifications={job.qualifications}
      skills_required={job.skillsRequired}
      posted_date={job.postedDate}
      last_date_to_apply={job.lastDateToApply}
      post_expiry_date={job.postExpiryDate}
      job_description={job.jobDescription}
      application_type={job.applicationType}
      apply_link={job.apply_link}
      application_email={job.application_email}
      source={job.source}
      image={job.image}
    />

  ))}
   </div> {/* closes job grid */}

</div> {/* closes flex-1 */}

</div> {/* closes flex gap-8 */}

</section>

<Footer />

</main>
  );
}