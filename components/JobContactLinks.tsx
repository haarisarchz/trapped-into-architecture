"use client";

interface JobContactLinksProps {
  jobId: string;
  firmName: string;
  position: string;
  displayEmail?: string | null;
  displayPhone?: string | null;
  website?: string | null;
}

export default function JobContactLinks({
  jobId,
  firmName,
  position,
  displayEmail,
  displayPhone,
  website,
}: JobContactLinksProps) {
  const handleEmailClick = () => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "email_click", {
        job_id: jobId,
        firm_name: firmName,
        position: position,
      });
    }
  };

  const handlePhoneClick = () => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "contact_click", {
        job_id: jobId,
        firm_name: firmName,
        channel: "phone",
      });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {displayEmail && (
        <p className="font-semibold text-black break-all">
          <span className="text-gray-500 font-normal mr-1">Email:</span>
          <a
            href={`mailto:${displayEmail}`}
            onClick={handleEmailClick}
            className="text-blue-600 hover:underline"
          >
            {displayEmail}
          </a>
        </p>
      )}
      {displayPhone && (
        <p className="font-semibold text-black">
          <span className="text-gray-500 font-normal mr-1">Phone:</span>
          <a
            href={`tel:${displayPhone}`}
            onClick={handlePhoneClick}
            className="text-blue-600 hover:underline"
          >
            {displayPhone}
          </a>
        </p>
      )}
      {website && (
        <p className="font-semibold text-black break-all">
          <span className="text-gray-500 font-normal mr-1">Website:</span>
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {website}
          </a>
        </p>
      )}
    </div>
  );
}
