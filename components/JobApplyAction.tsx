"use client";

interface JobApplyActionProps {
  jobId: string;
  firmName: string;
  position: string;
  applyLink?: string | null;
  displayEmail?: string | null;
  isExpired?: boolean;
}

export default function JobApplyAction({
  jobId,
  firmName,
  position,
  applyLink,
  displayEmail,
  isExpired,
}: JobApplyActionProps) {
  if (isExpired) {
    return (
      <button disabled className="bg-gray-200 text-gray-500 px-8 py-3.5 rounded-xl text-lg font-bold cursor-not-allowed w-full sm:w-auto text-center">
        Post Expired
      </button>
    );
  }

  const handleApplyClick = () => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "apply_click", {
        job_id: jobId,
        firm_name: firmName,
        position: position,
      });
    }
  };

  const handleEmailClick = () => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "email_click", {
        job_id: jobId,
        firm_name: firmName,
        position: position,
      });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
      {applyLink && (
        <a
          href={applyLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleApplyClick}
          className="bg-black text-white px-8 py-3 rounded-xl text-base font-bold hover:bg-gray-800 transition w-full sm:w-auto text-center shadow-md"
        >
          Apply Now ↗
        </a>
      )}
      {displayEmail && (
        <a
          href={`mailto:${displayEmail}?subject=Application for ${encodeURIComponent(position)} at ${encodeURIComponent(firmName)}`}
          onClick={handleEmailClick}
          className="bg-white text-black px-8 py-3 rounded-xl text-base font-bold border-2 border-black hover:bg-gray-50 transition w-full sm:w-auto text-center shadow-sm"
        >
          Email Now
        </a>
      )}
      {!applyLink && !displayEmail && (
        <span className="text-gray-500 text-sm italic">No application method provided</span>
      )}
    </div>
  );
}
