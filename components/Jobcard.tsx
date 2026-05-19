import Link from "next/link";

type JobCardProps = {
  id: string;

  firm_name: string;
  area: string;

  city: string;
  state: string;

  position: string;

  experience: string;
  salary: string;

  qualifications: string[];

  skills_required: string[];

  posted_date: string;

  last_date_to_apply: string;

  post_expiry_date: string;

  job_description: string;

  application_type: string;

  apply_link?: string;

  application_email?: string;

  source: string;

  image: string;

  viewMode: string;
};

export default function JobCard({
  id,
  firm_name,
  area,
  city,
  state,
  position,
  experience,
  salary,
  qualifications,
  skills_required,
  posted_date,
  last_date_to_apply,
  post_expiry_date,
  job_description,
  application_type,
  apply_link,
  application_email,
  source,
  image,
  viewMode,
}: JobCardProps) {

  /* =========================================
     VISUAL VIEW
     (Image Dominant / Pinterest Style)
  ========================================= */

  if (viewMode === "visual") {

    return (

       <Link href={`/jobs/${id}`}>

        <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition duration-300 border border-gray-200 cursor-pointer group">

        {/* PORTRAIT IMAGE */}
        <div className="overflow-hidden">
  {image ? (
    <img
      src={image || "/placeholder-job.jpg"}
      alt={position}
      className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition duration-500"
    />
  ) : (
    <div className="w-full aspect-[3/4] bg-gray-200 flex items-center justify-center text-gray-500">
      No Image
    </div>
  )}
</div>

        {/* CONTENT */}
        <div className="p-4">

          <h2 className="text-lg font-bold line-clamp-1">
            {position}
          </h2>

          <p className="text-gray-700 mt-1 font-medium line-clamp-1">
            {firm_name}
          </p>

          <p className="text-sm text-gray-500 mt-1">
            {city}, {state}
          </p>

        </div>

      </div>

      </Link>


    );

  }

  /* =========================================
     BALANCED VIEW
     (Medium Detail Layout)
  ========================================= */

  if (viewMode === "balanced") {

    return (

  <Link href={`/jobs/${id}`}>

    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition border border-gray-200 flex h-[240px]">

      {/* IMAGE */}
      <img
        src={image || "/placeholder-job.jpg"}
        alt={position}
        className="w-56 h-full object-cover"
      />

      {/* CONTENT */}
      <div className="p-6 flex flex-col justify-between flex-1">

        <div>

          <h2 className="text-2xl font-bold line-clamp-1">
            {position}
          </h2>

          <p className="text-lg text-gray-700 mt-1 font-medium">
            {firm_name}
          </p>

          <p className="text-sm text-gray-500 mt-1">
            {city}, {state}
          </p>

        </div>

        {/* DETAILS */}
        <div className="mt-4 space-y-2">

          <p className="text-sm text-gray-700">
            Experience: {experience}
          </p>

          <p className="text-sm font-semibold">
            Salary: {salary}
          </p>

          <p className="text-sm text-gray-600 line-clamp-1">
            {skills_required?.join(" • ")}
          </p>

        </div>

      </div>

    </div>

  </Link>

);

  }

  /* =========================================
     DENSE VIEW
     (Compact Multi Job Layout)
  ========================================= */

  return (

      <Link href={`/jobs/${id}`}>


    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-200 p-4 flex items-center gap-4 min-h-[120px]">

      {/* SMALL IMAGE */}
      {image ? (
  <img
    src={image || "/placeholder-job.jpg"}
    alt={position}
    className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition duration-500"
  />
) : (
  <div className="w-full aspect-[3/4] bg-gray-200 flex items-center justify-center text-gray-500">
    No Image
  </div>
)}

      {/* CONTENT */}
      <div className="min-w-0 flex-1">

        <h2 className="font-bold text-lg line-clamp-1">
          {position}
        </h2>

        <p className="text-sm text-gray-700 line-clamp-1 mt-1">
          {firm_name}
        </p>

        <p className="text-sm text-gray-500 line-clamp-1 mt-1">
          {city}, {state}
        </p>

      </div>

  </div>

</Link>

);

}