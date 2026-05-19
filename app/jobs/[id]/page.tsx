import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";


export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const { id } = await params;

const { data: job, error } = await supabase
  .from("jobs")
  .select("*")
  .eq("id", id)
  .single();

const { data: jobs = [] } = await supabase
  .from("jobs")
  .select("*");

if (!job || error) {
  return (
    <main className="p-10">
      <h1 className="text-5xl font-bold">
        Job Not Found
      </h1>
    </main>
  );
}

  return (

    <main className="min-h-screen bg-gray-100">
      <Navbar />

      {/* CONTENT */}

      <section className="w-full px-4 lg:px-15 py-15">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">

        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden flex flex-col lg:flex-row items-start">
          {/* LEFT IMAGE */}

<div className="lg:w-[38%] bg-gray-100 flex items-start justify-center p-4">

  {job.image ? (
  <img
    src={job.image}
    alt={job.position}
    className="w-full object-contain rounded-2xl"
  />
) : (
  <div className="w-full h-[300px] bg-gray-200 rounded-2xl flex items-center justify-center text-gray-500">
    No Image Available
  </div>
)}

</div>

{/* RIGHT CONTENT */}

<div className="flex-1 p-8">

          {/* TITLE */}

          <div className="mb-5">

            <h1 className="text-3xl font-bold">
              {job.position}
            </h1>

            <p className="text-xl text-gray-700 mt-1">
              {job.firm_name}
            </p>

            <p className="text-gray-500 mt-1 text-lg">
              {job.city}, {job.state}
            </p>

          </div>

          {/* QUICK INFO */}

<div className="flex flex-wrap gap-4 mb-5">

  {/* EXPERIENCE */}

  {job.experience && (

    <div className="bg-gray-50 rounded-xl px-4 py-3 border min-w-[160px]">

      <p className="text-xs text-gray-500">
        Experience
      </p>

      <h3 className="text-lg font-semibold mt-1">
        {job.experience}
      </h3>

    </div>

  )}

  {/* SALARY */}

  {job.salary && (

    <div className="bg-gray-50 rounded-xl px-4 py-3 border min-w-[200px]">

      <p className="text-xs text-gray-500">
        Salary
      </p>

      <h3 className="text-lg font-semibold mt-1">
        {job.salary}
      </h3>

    </div>

  )}

  {/* QUALIFICATION */}

  {job.qualifications?.length > 0 && (

    <div className="bg-gray-50 rounded-xl px-4 py-3 border min-w-[180px]">

      <p className="text-xs text-gray-500">
        Qualification
      </p>

      <h3 className="text-lg font-semibold mt-1">
        {Array.isArray(job.qualifications)
  ? job.qualifications.join(", ")
  : job.qualifications}
      </h3>

    </div>

  )}

</div>
          {/* SKILLS */}

          <div className="mb-5">

            <h2 className="text-2xl font-bold mb-2">
              Skills Required
            </h2>

            <div className="flex flex-wrap gap-3">

  {job.skills_required
    ?.split(",")
    .map((skill: string) => (

      <div
        key={skill.trim()}
        className="bg-black text-white px-4 py-2 rounded-full text-sm"
      >
        {skill.trim()}
      </div>

    ))}

</div>

          </div>

          {/* DESCRIPTION */}

          <div className="mb-5">

            <h2 className="text-2xl font-bold mb-2">
              Job Description
            </h2>

            <p className="text-gray-700 leading-8 text-lg">
              {job.job_description}
            </p>

          </div>

          {/* DATES */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">

            <div>

              <p className="text-sm text-gray-500">
                Posted Date
              </p>

              <p className="font-semibold mt-1">
                {job.posted_date}
              </p>

            </div>

            <div>

              <p className="text-sm text-gray-500">
                Last Date To Apply
              </p>

              <p className="font-semibold mt-1">
                {job.last_date_to_apply}
              </p>

            </div>

            <div>

              <p className="text-sm text-gray-500">
                Post Expiry Date
              </p>

              <p className="font-semibold mt-1">
                {job.post_expiry_date}
              </p>

            </div>

          </div>

          {/* APPLY BUTTON */}

          <a
            href={job.applyLink}
            target="_blank"
            className="inline-block bg-black text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-gray-800 transition"
          >
            Apply Now
          </a>

        </div> {/* RIGHT CONTENT */}

      </div> {/* MAIN CONTAINER */}

        {/* SIDEBAR */}

<aside className="space-y-6">

  {/* JOBS IN SAME CITY */}

  <div className="bg-white rounded-3xl p-6 shadow-lg border">

    <div className="flex items-center justify-between mb-5">

      <h2 className="text-xl font-bold">
        Jobs In {job.city}
      </h2>

      <button className="text-sm font-medium text-gray-500 hover:text-black transition">
        View All
      </button>

    </div>

    <div className="space-y-3">

      {jobs?.filter(
          (cityJob) =>
            cityJob.id !== job.id &&
            cityJob.city === job.city
        )
        .slice(0, 5)
        .map((cityJob) => (

          <div
            key={cityJob.id}
            className="border rounded-2xl p-4 hover:bg-gray-50 transition cursor-pointer"
          >

            <h3 className="font-semibold text-lg">
              {cityJob.position}
            </h3>

            <p className="text-gray-600 text-sm mt-1">
              {cityJob.firmName}
            </p>

            <p className="text-gray-400 text-sm mt-1">
              {cityJob.city}
            </p>

          </div>

        ))}

    </div>

  </div>

  {/* SAME POSITION JOBS */}

  <div className="bg-white rounded-3xl p-6 shadow-lg border">

    <div className="flex items-center justify-between mb-5">

      <h2 className="text-xl font-bold">
        {job.position} Jobs
      </h2>

      <button className="text-sm font-medium text-gray-500 hover:text-black transition">
        View All
      </button>

    </div>

    <div className="space-y-3">

      {jobs?.filter(
          (positionJob) =>
            positionJob.id !== job.id &&
            positionJob.position === job.position
        )
        .slice(0, 5)
        .map((positionJob) => (

          <div
            key={positionJob.id}
            className="border rounded-2xl p-4 hover:bg-gray-50 transition cursor-pointer"
          >

            <h3 className="font-semibold text-lg">
              {positionJob.position}
            </h3>

            <p className="text-gray-600 text-sm mt-1">
              {positionJob.firmName}
            </p>

            <p className="text-gray-400 text-sm mt-1">
              {positionJob.city}
            </p>

          </div>

        ))}

    </div>

  </div>

  {/* RECENT JOBS */}

<div className="bg-white rounded-3xl p-6 shadow-lg border">

  <div className="flex items-center justify-between mb-2">

    <h2 className="text-xl font-bold">
      Recent Jobs
    </h2>

    <button className="text-sm font-medium text-gray-500 hover:text-black transition">
      View All
    </button>

  </div>

  <div className="space-y-2">

    {jobs?.slice(0, 5).map((recentJob) => (

      <div
        key={recentJob.id}
        className="py-3 border-b last:border-none"
      >

        <p className="text-sm leading-7 text-gray-700">

          <span className="font-semibold text-black">
            {recentJob.firmName}
          </span>

          {" "}is hiring{" "}

          <span className="font-semibold text-black">
            {recentJob.position}
          </span>

          {" "}in{" "}

          <span className="text-gray-500">
            {recentJob.city}
          </span>

        </p>

      </div>

    ))}

  </div>

</div>



{/* POPULAR JOBS */}

<div className="bg-white rounded-3xl p-6 shadow-lg border">

  <div className="flex items-center justify-between mb-2">

    <h2 className="text-xl font-bold">
      Popular Jobs
    </h2>

    <button className="text-sm font-medium text-gray-500 hover:text-black transition">
      View All
    </button>

  </div>

  <div className="space-y-4">

    {jobs?.slice(0, 5).map((popularJob) => (

      <div
        key={popularJob.id}
        className="py-3 border-b last:border-none"
      >

        <p className="text-sm leading-7 text-gray-700">

          <span className="font-semibold text-black">
            {popularJob.firmName}
          </span>

          {" "}is hiring{" "}

          <span className="font-semibold text-black">
            {popularJob.position}
          </span>

          {" "}in{" "}

          <span className="text-gray-500">
            {popularJob.city}
          </span>

        </p>

      </div>

    ))}

  </div>

</div>

</aside>

</div>

      </section>
      
      <Footer />

    </main>
  );

}