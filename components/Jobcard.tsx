"use client";

import { generateJobUrl } from "@/utils/jobUrl";
import ShareButtons from "@/components/ShareButtons";
import SaveButton from "@/components/SaveButton";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type JobCardProps = {
  id: string;
  firm_name: string;
  organization_type?: string;
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
  employment_type?: string;
};

export default function JobCard({
  id,
  firm_name, organization_type,
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
  employment_type,
}: JobCardProps) {
  const router = useRouter();
  
    const formatExperience = (rawExp: any) => {
      if (!rawExp) return "";
      const str = Array.isArray(rawExp) ? rawExp.join(" ") : String(rawExp);
      const lower = str.toLowerCase();
      let matched = new Set();
      if (lower.includes("fresher") || lower.includes("0 year") || lower.includes("0-1")) matched.add("Fresher");
      if (lower.includes("0-1") || lower.includes("0 to 1") || lower.includes("0 - 1")) matched.add("0-1 Years");
      if (lower.includes("1-2") || lower.includes("1 to 2") || lower.includes("1 - 2") || lower.match(/1\s*year/)) matched.add("1-2 Years");
      if (lower.includes("2-4") || lower.includes("2 to 4") || lower.includes("2 - 4") || lower.match(/[23]\s*year/)) matched.add("2-4 Years");
      if (lower.includes("4-6") || lower.includes("4 to 6") || lower.includes("4 - 6") || lower.match(/[45]\s*year/)) matched.add("4-6 Years");
      if (lower.includes("6-10") || lower.includes("6 to 10") || lower.includes("6 - 10") || lower.match(/[6789]\s*year/)) matched.add("6-10 Years");
      if (lower.includes("10+") || lower.includes("10 +") || lower.match(/1[0-9]\s*year/)) matched.add("10+ Years");
      
      if (matched.size === 0) {
        // Only return if it matches exact predefined options that weren't caught
        const valid = ["Fresher", "0-1 Years", "1-2 Years", "2-4 Years", "4-6 Years", "6-10 Years", "10+ Years", "Not disclosed"];
        const strParts = str.split(",").map(s => s.trim());
        const validParts = strParts.filter(p => valid.includes(p));
        if (validParts.length > 0) return validParts.join(", ");
        return "";
      }
      return Array.from(matched).join(", ");
  };
  const formattedExperience = formatExperience(experience);

  
  

  

  const isExpired =
    post_expiry_date && new Date(post_expiry_date) < new Date();

  const locationString = [area, city, state].filter(Boolean).join(", ");

  

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
        className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition duration-300 border border-gray-200 cursor-pointer group"
      >
        <div className="overflow-hidden rounded-t-2xl">
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
              <SaveButton jobId={id} initialSaves={save_count} />
              <ShareButtons 
  url={jobUrlString} 
  jobId={id} 
  companyName={firm_name} 
  position={position} 
  organizationType={organization_type}
  city={city}
  state={state}
              area={area}
              experience={experience}
              employmentType={employment_type}
  initialShares={share_count} 
/>
            </div>
          </div>

          <h2 className="text-lg font-bold line-clamp-1 group-hover:text-gray-600">
            {position}
          </h2>

          <p className="text-gray-700 mt-1 font-medium line-clamp-1">
            {firm_name}
          </p>

          <p className="text-sm text-gray-500 mt-1">
            <span>{locationString}</span>
          </p>
        </div>
      </div>
    );
  }

  /* =========================================
     BALANCED VIEW
  ========================================= */
  if (viewMode === "balanced") {
      const expStr = experience ? String(formattedExperience).toLowerCase().trim() : "";
      const isIntern = employment_type === "Internship" || (position && position.toLowerCase().includes("intern"));
        const showExperience = !isIntern && expStr && expStr !== "not disclosed" && expStr !== "not specified" && expStr !== "null";
      
      const salStr = salary ? String(salary).toLowerCase().trim() : "";
      const showSalary = salStr && !["not disclosed", "not specified", "negotiable", "-", "null", "as per industry standards"].includes(salStr);
      
      return (
        <div 
          onClick={() => router.push(generateJobUrl({ id, firm_name, position }))}
          className="bg-white rounded-2xl shadow-md hover:shadow-xl transition border border-gray-200 flex flex-col md:flex-row h-auto md:h-[240px] cursor-pointer group"
        >
          <img src={image || "/placeholder-job.jpg"} alt={position} className="w-full md:w-56 h-48 md:h-full object-cover" />
  
          <div className="p-5 md:p-6 flex flex-col justify-between flex-1">
            <div>
              <div className="flex items-center justify-between mb-3">
                {isExpired ? (
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">Expired</span>
                ) : (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Active</span>
                )}
  
                <div className="flex items-center gap-3">
                  <SaveButton jobId={id} initialSaves={save_count} />
                  <ShareButtons 
                    url={jobUrlString} 
                    jobId={id} 
                    companyName={firm_name} 
                    position={position} 
                    organizationType={organization_type}
                    city={city}
                    state={state}
              area={area}
              experience={experience}
              employmentType={employment_type}
                    initialShares={share_count} 
                  />
                </div>
              </div>
  
              <h2 className="text-xl md:text-2xl font-bold line-clamp-2 md:line-clamp-1 group-hover:text-gray-600">
                {position}
              </h2>
              <p className="text-base md:text-lg text-gray-700 mt-1 font-medium">
                {firm_name}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                <span>{locationString}</span>
              </p>
            </div>
  
            <div className="mt-4 space-y-1 md:space-y-2">
              {showExperience && <p className="text-sm text-gray-700">Experience: {formattedExperience}</p>}
              {showSalary && <p className="text-sm font-semibold">Salary: {salary}</p>}
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
        className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-200 px-3 md:px-4 py-3 flex items-center gap-3 cursor-pointer group"
      >
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden bg-gray-100">
            {image ? (
              <img src={image} alt={position} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500 text-center">No Image</div>
            )}
          </div>
          {isExpired ? (
            <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider w-full text-center leading-none">Expired</span>
          ) : (
            <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider w-full text-center leading-none">Active</span>
          )}
        </div>
  
        <div className="flex-1 min-w-0 pr-1">
          <p className="text-sm md:text-base text-gray-800 leading-snug">
            <span className="font-bold">{firm_name}</span>{" "}is hiring{" "}
            <span className="font-semibold">{position}</span>{" "}at{" "}
            <span className="text-gray-600">{locationString}</span>
          </p>
        </div>
  
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2 flex-shrink-0">
          <SaveButton jobId={id} initialSaves={save_count} />
          <ShareButtons 
            url={jobUrlString} 
            jobId={id} 
            companyName={firm_name} 
            position={position} 
            organizationType={organization_type}
            city={city}
            state={state}
              area={area}
              experience={experience}
              employmentType={employment_type}
            initialShares={share_count} 
          />
        </div>
      </div>
    );
  }
