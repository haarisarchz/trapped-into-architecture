import Link from "next/link";
import {
  Bookmark,
  BookmarkCheck,
} from "lucide-react";

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
  const isExpired =
  post_expiry_date &&
  new Date(post_expiry_date) <
    new Date();
const currentUser =
  typeof window !== "undefined"
    ? JSON.parse(
        localStorage.getItem("currentUser") || "null"
      )
    : null;

const isSaved =
  currentUser?.savedJobs?.includes(id);

   const saveJob = () => {

  const currentUser =
    JSON.parse(
      localStorage.getItem("currentUser") || "null"
    );

  if (!currentUser) {
    alert("Please login first");
    return;
  }

  const savedJobs =
    currentUser.savedJobs || [];

  // Toggle save / unsave
  if (savedJobs.includes(id)) {

    currentUser.savedJobs =
      savedJobs.filter(
        (jobId: string) => jobId !== id
      );

  } else {

    currentUser.savedJobs = [
      ...savedJobs,
      id,
    ];

  }

  localStorage.setItem(
    "currentUser",
    JSON.stringify(currentUser)
  );

  const users =
    JSON.parse(
      localStorage.getItem("users") || "[]"
    );

  const updatedUsers =
    users.map((u: any) =>
      u.username === currentUser.username
        ? currentUser
        : u
    );

  localStorage.setItem(
    "users",
    JSON.stringify(updatedUsers)
  );

  window.location.reload();

};


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

  <div className="flex items-center justify-between mb-3">

    {isExpired ? (
      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
        Expired
      </span>
    ) : (
      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
        Active
      </span>
    )}

   <button
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    saveJob();
  }}
  className={`p-2 rounded-full transition ${
    isSaved
      ? "bg-black text-white"
      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
  }`}
>
  {isSaved ? (
    <BookmarkCheck size={16} />
  ) : (
    <Bookmark size={16} />
  )}
</button>

  </div>

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

<div className="flex items-center justify-between mb-3">

  {isExpired ? (

    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">

      Expired

    </span>

  ) : (

    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">

      Active

    </span>

  )}

  <button
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    saveJob();
  }}
  className={`p-2 rounded-full transition ${
  isSaved
    ? "bg-black text-white"
    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
}`}
>
  {isSaved ? (

    <BookmarkCheck size={18} />
  ) : (
    <Bookmark size={18} />
  )}
</button>

</div>
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

    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-200 px-4 py-3 flex items-center gap-3">

      {/* SMALL IMAGE */}

      <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">

        {image ? (

          <img
            src={image}
            alt={position}
            className="w-full h-full object-cover"
          />

        ) : (

          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">
            No Image
          </div>

        )}

      </div>

      {/* CONTENT */}

      <div className="flex-1 min-w-0">

        <p className="text-sm text-gray-800 leading-snug line-clamp-2">

          <span className="font-semibold">
            {firm_name}
          </span>

          {" "}is hiring{" "}

          <span className="font-medium">
            {position}
          </span>

          {" "}at{" "}

          <span className="text-gray-600">
            {city}, {state}
          </span>

        </p>

      </div>

      <button
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    saveJob();
  }}
  className={`p-2 rounded-full transition ${
    isSaved
      ? "bg-black text-white"
      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
  }`}
>
  {isSaved ? (
    <BookmarkCheck size={14} />
  ) : (
    <Bookmark size={14} />
  )}
</button>

      {/* STATUS */}

      {isExpired ? (

        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap">

          Expired

        </span>

      ) : (

        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap">

          Active

        </span>

      )}

    </div>

  </Link>

);

}