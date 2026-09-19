"use client";

import { generateJobUrl } from "@/utils/jobUrl";
import ShareButtons from "@/components/ShareButtons";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  save_count?: number;
  share_count?: number;
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
  save_count = 0,
  share_count = 0,
}: JobCardProps) {
  const router = useRouter();
  
  const [isSaved, setIsSaved] = useState(false);
  const [saveCount, setSaveCount] = useState(save_count);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("currentUser");
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        setIsSaved(user.savedJobs?.includes(id));
      }
    }
  }, [id]);

  const isExpired =
    post_expiry_date && new Date(post_expiry_date) < new Date();

  const saveJob = () => {
    if (!currentUser) {
      alert("Please login first");
      return;
    }

    const savedJobs = currentUser.savedJobs || [];
    let newSavedJobs;

    if (savedJobs.includes(id)) {
      newSavedJobs = savedJobs.filter((jobId: string) => jobId !== id);
      setSaveCount((prev) => Math.max(0, prev - 1));
      setIsSaved(false);
    } else {
      newSavedJobs = [...savedJobs, id];
      setSaveCount((prev) => prev + 1);
      setIsSaved(true);
    }

    currentUser.savedJobs = newSavedJobs;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const updatedUsers = users.map((u: any) =>
      u.username === currentUser.username ? currentUser : u
    );
    localStorage.setItem("users", JSON.stringify(updatedUsers));
  };

  const getCompanySlug = (name: string) => {
    return name.toLowerCase().trim().replace(/s+/g, "-").replace(/[^w-]+/g, "");
  };

  const navigateTo = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(path);
  };

  const jobUrlString = typeof window !== "undefined" ? `${window.location.origin}${generateJobUrl({ id, firm_name, position })}` : "";

  /* =========================================
     VISUAL VIEW
  ========================================= */
  if (viewMode === "visual") {
    return (
      <div 
        onClick={() => router.push(generateJobUrl({ id, firm_name, position }))}
        className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition duration-300 border border-gray-200 cursor-pointer group"
      >
        <div className="overflow-hidden">
          {image ? (
            <img src={image} alt={position} className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition duration-500" />
          ) : (
            <div className="w-full aspect-[3/4] bg-gray-200 flex items-center justify-center text-gray-500">No Image</div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            {isExpired ? (
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">Expired</span>
            ) : (
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Active</span>
            )}
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); saveJob(); }}
                  aria-label={`Save ${position} job`}
                  className={`p-2 rounded-full transition ${isSaved ? "bg-black text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                >
                  {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                </button>
                <span className="text-sm font-semibold text-gray-700">{saveCount}</span>
              </div>
              <ShareButtons 
                url={jobUrlString} 
                jobId={id} 
                companyName={firm_name} 
                position={position} 
                experience={experience} 
                initialShares={share_count} 
              />
            </div>
          </div>

          <h2 onClick={(e) => navigateTo(e, `/jobs?position=${encodeURIComponent(position)}`)} className="text-lg font-bold line-clamp-1 hover:underline hover:text-gray-600">
            {position}
          </h2>

          <p onClick={(e) => navigateTo(e, `/companies/${getCompanySlug(firm_name)}`)} className="text-gray-700 mt-1 font-medium line-clamp-1 hover:underline hover:text-gray-900">
            {firm_name}
          </p>

          <p className="text-sm text-gray-500 mt-1">
            <span onClick={(e) => navigateTo(e, `/jobs?city=${encodeURIComponent(city)}`)} className="hover:underline hover:text-gray-800">{city}</span>,{" "}
            <span onClick={(e) => navigateTo(e, `/jobs?state=${encodeURIComponent(state)}`)} className="hover:underline hover:text-gray-800">{state}</span>
          </p>
        </div>
      </div>
    );
  }

  /* =========================================
     BALANCED VIEW
  ========================================= */
  if (viewMode === "balanced") {
    return (
      <div 
        onClick={() => router.push(generateJobUrl({ id, firm_name, position }))}
        className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition border border-gray-200 flex h-[240px] cursor-pointer group"
      >
        <img src={image || "/placeholder-job.jpg"} alt={position} className="w-56 h-full object-cover" />

        <div className="p-6 flex flex-col justify-between flex-1">
          <div>
            <div className="flex items-center justify-between mb-3">
              {isExpired ? (
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">Expired</span>
              ) : (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Active</span>
              )}

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); saveJob(); }}
                    aria-label={`Save ${position} job`}
                    className={`p-2 rounded-full transition ${isSaved ? "bg-black text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                  >
                    {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                  </button>
                  <span className="text-sm font-semibold text-gray-700">{saveCount}</span>
                </div>
                <ShareButtons 
                  url={jobUrlString} 
                  jobId={id} 
                  companyName={firm_name} 
                  position={position} 
                  experience={experience} 
                  initialShares={share_count} 
                />
              </div>
            </div>

            <h2 onClick={(e) => navigateTo(e, `/jobs?position=${encodeURIComponent(position)}`)} className="text-2xl font-bold line-clamp-1 hover:underline hover:text-gray-600">
              {position}
            </h2>
            <p onClick={(e) => navigateTo(e, `/companies/${getCompanySlug(firm_name)}`)} className="text-lg text-gray-700 mt-1 font-medium hover:underline hover:text-gray-900">
              {firm_name}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              <span onClick={(e) => navigateTo(e, `/jobs?city=${encodeURIComponent(city)}`)} className="hover:underline hover:text-gray-800">{city}</span>,{" "}
              <span onClick={(e) => navigateTo(e, `/jobs?state=${encodeURIComponent(state)}`)} className="hover:underline hover:text-gray-800">{state}</span>
            </p>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-700">Experience: {experience}</p>
            <p className="text-sm font-semibold">Salary: {salary}</p>
            <p className="text-sm text-gray-600 line-clamp-1">{skills_required?.join(" • ")}</p>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================
     DENSE VIEW
  ========================================= */
  return (
    <div 
      onClick={() => router.push(generateJobUrl({ id, firm_name, position }))}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-200 px-4 py-3 flex items-center gap-3 cursor-pointer group"
    >
      <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        {image ? (
          <img src={image} alt={position} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">No Image</div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 leading-snug line-clamp-2">
          <span onClick={(e) => navigateTo(e, `/companies/${getCompanySlug(firm_name)}`)} className="font-semibold hover:underline">
            {firm_name}
          </span>
          {" "}is hiring{" "}
          <span onClick={(e) => navigateTo(e, `/jobs?position=${encodeURIComponent(position)}`)} className="font-medium hover:underline">
            {position}
          </span>
          {" "}at{" "}
          <span className="text-gray-600">
            <span onClick={(e) => navigateTo(e, `/jobs?city=${encodeURIComponent(city)}`)} className="hover:underline hover:text-gray-800">{city}</span>,{" "}
            <span onClick={(e) => navigateTo(e, `/jobs?state=${encodeURIComponent(state)}`)} className="hover:underline hover:text-gray-800">{state}</span>
          </span>
        </p>
      </div>

      <div className="flex items-center gap-2">
        {isExpired ? (
          <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap">Expired</span>
        ) : (
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap">Active</span>
        )}
        
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); saveJob(); }}
            aria-label={`Save ${position} job`}
            className={`p-2 rounded-full transition ${isSaved ? "bg-black text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
          >
            {isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
          </button>
          <span className="text-xs font-semibold text-gray-700">{saveCount}</span>
        </div>
        
        <ShareButtons 
          url={jobUrlString} 
          jobId={id} 
          companyName={firm_name} 
          position={position} 
          experience={experience} 
          initialShares={share_count} 
        />
      </div>
    </div>
  );
}