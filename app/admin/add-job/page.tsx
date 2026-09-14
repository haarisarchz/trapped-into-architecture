"use client";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useEffect } from "react";
import {
  EXPERIENCE_OPTIONS,
  SALARY_OPTIONS,
} from "@/app/constants/jobFilters"

export default function AddJobPage() {
const [jobId, setJobId] = useState<string | null>(null);

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  setJobId(params.get("id"));
}, []);
  const router = useRouter();

  const [existingFirms, setExistingFirms] = useState<any[]>([]);
const [existingCities, setExistingCities] = useState<string[]>([]);
const [existingStates, setExistingStates] = useState<string[]>([]);

const [positionOptions, setPositionOptions] = useState<string[]>([
  "Junior Architect",
  "Senior Architect",
  "Senior Interior Designer",
  "Junior Interior Designer",
  "Landscape Architect",
  "Urban Designer",
  "Planning Consultant",
  "Architectural Draftsperson",
  "BIM Architect",
  "BIM Modeler",
  "Project Architect",
  "Design Architect",
  "Site Architect",
  "Project Manager",
  "Construction Manager",
  "Quantity Surveyor",
  "Estimator",
  "3D Visualizer",
  "Visualization Artist",
  "Graphic Designer",
  "Furniture Designer",
  "Product Designer",
  "Lighting Designer",
  "MEP Engineer",
  "Structural Engineer",
  "Civil Engineer",
  "Faculty",
  "Research Associate",
  "Architectural Intern",
  "Architect",
  "Interior Designer",
  "Other",
]);

  const organizationTypes = [
  "Firm",
  "Construction Company",
  "Institution",
  "Developer",
  "Consultancy",
  "Government",
  "NGO",
  "Manufacturer",
  "Other",
];

const [organizationType, setOrganizationType] = useState(
  organizationTypes[0]
);

  const [selectedExperience, setSelectedExperience] =
    useState<string[]>([]);

  const [skillInput, setSkillInput] =
    useState("");

  const [skills, setSkills] =
    useState<string[]>([]);

  const [qualificationInput, setQualificationInput] =
    useState("");

  const [qualifications, setQualifications] =
    useState<string[]>([]);

  const [applicationType, setApplicationType] =
    useState("apply");

  
  /* MAIN JOB STATES */

  const [firmName, setFirmName] = useState("");

const [companyLogo, setCompanyLogo] = useState("");
const [companyDescription, setCompanyDescription] = useState("");
const [companyWebsite, setCompanyWebsite] = useState("");
const [companyEmail, setCompanyEmail] = useState("");
const [companyPhone, setCompanyPhone] = useState("");
const [companyFacebook, setCompanyFacebook] = useState("");
const [companyInstagram, setCompanyInstagram] = useState("");
const [companyLinkedin, setCompanyLinkedin] = useState("");
const [companyTwitter, setCompanyTwitter] = useState("");
const [companyWhatsapp, setCompanyWhatsapp] = useState("");
const [sameAsPhone, setSameAsPhone] = useState(false);
const [principalArchitect, setPrincipalArchitect] = useState("");
const [employeeSize, setEmployeeSize] = useState("");
const [foundedYear, setFoundedYear] = useState("");

const [scheduleDate, setScheduleDate] = useState("");
const [scheduleTime, setScheduleTime] = useState("");
const [showSchedule, setShowSchedule] = useState(false);


const loadCompanyDetails = async (companyName: string) => {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("firm_name", companyName)
    .single();

  if (error || !data) return;

  setOrganizationType(data.organization_type || "Architecture Firm");
  setArea(data.neighborhood || "");
  setCity(data.city || "");
  setState(data.state || "");

  setCompanyLogo(data.logo_url || "");
  setCompanyDescription(data.description || "");
  setCompanyWebsite(data.website || "");
  setCompanyEmail(data.email || "");
  setCompanyPhone(data.phone || "");
  setCompanyFacebook(data.facebook || "");
  setCompanyInstagram(data.instagram || "");
  setCompanyLinkedin(data.linkedin || "");
  setPrincipalArchitect(data.principal_architect || "");
  setEmployeeSize(data.employee_size || "");
  setFoundedYear(data.founded_year?.toString() || "");
};

const [area, setArea] = useState("");

  const [city, setCity] =
    useState("");

  const [state, setState] =
    useState("");

  const [position, setPosition] =
    useState("");

  const [salary, setSalary] =
    useState("");

  const [postedDate, setPostedDate] =
    useState("");

  const [lastDateToApply, setLastDateToApply] =
    useState("");

  const [postExpiryDate, setPostExpiryDate] =
    useState("");

  const [jobDescription, setJobDescription] =
    useState("");

  const [apply_link, setapply_link] =
    useState("");

  const [application_email, setapplication_email] =
    useState("");

  const [source, setSource] =
    useState("");
  const [image, setImage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dateType, setDateType] =
  useState("expiry");
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);
 
  useEffect(() => {
  const loadCompanies = async () => {
    const { data } = await supabase
      .from("companies")
      .select("*")
      .order("name");

    if (!data) return;

    setExistingFirms(data);

    setExistingCities([
      ...new Set(data.map((c) => c.city).filter(Boolean)),
    ]);

    setExistingStates([
      ...new Set(data.map((c) => c.state).filter(Boolean)),
    ]);
  };

  loadCompanies();
}, []);

  useEffect(() => {

  if (!jobId) return;

  const fetchJob = async () => {

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (error) {

      console.log(error);
      return;

    }

    if (data) {

  setFirmName(data.firm_name || "");
  setOrganizationType(data.organization_type || "Firm");

  setArea(data.area || "");
  setCity(data.city || "");
  setState(data.state || "");

  setPosition(data.position || "");

  /* EXPERIENCE */

  setSelectedExperience(
    Array.isArray(data.experience)
      ? data.experience
      : data.experience
      ? [data.experience]
      : []
  );

  /* SALARY */

  setSalary(data.salary || "");

  /* DATES */

  setPostedDate(data.posted_date || "");
  setLastDateToApply(data.last_date_to_apply || "");
  setPostExpiryDate(data.post_expiry_date || "");

  /* DESCRIPTION */

  setJobDescription(data.job_description || "");

  /* APPLICATION */

  setapply_link(data.apply_link || "");
  setapplication_email(data.application_email || "");

  /* SOURCE */

  setSource(data.source || "");

  /* IMAGE */

  setImage(data.image || "");
  setImageUrl(data.image || "");

  /* QUALIFICATIONS */

  setQualifications(
    Array.isArray(data.qualifications)
      ? data.qualifications
      : []
  );

  /* SKILLS */

  setSkills(
    Array.isArray(data.skills_required)
      ? data.skills_required
      : []
  );

}

  };

  fetchJob();

}, [jobId]);

const [uploadSuccess, setUploadSuccess] =
  useState(false);

  useEffect(() => {
  const fetchCompanies = async () => {
    const { data, error } = await supabase
      .from("companies")
      .select("firm_name");

    if (error) {
      console.log(error);
      return;
    }

    setExistingFirms(
      data.map((company) => company.firm_name)
    );
  };

  fetchCompanies();
}, []);

  const handleImageUpload = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {

  const file = e.target.files?.[0];

  if (!file) return;

  setUploadingImage(true);
  setUploadSuccess(false);

  const fileName =
    `${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("job-images")
    .upload(fileName, file);

  if (error) {

    console.log("UPLOAD ERROR:", error);

alert(JSON.stringify(error));

    setUploadingImage(false);

    return;

  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("job-images")
    .getPublicUrl(fileName);

  setImageUrl(publicUrl);

  setUploadingImage(false);

  setUploadSuccess(true);

};

/* PUBLISH FUNCTION */

const handleSaveDraft = async () => {
  await handlePublishJob("draft");
};

const handleSchedule = async () => {
  await handlePublishJob("scheduled");
};

const handlePublishJob = async (
  status: "draft" | "scheduled" | "published" = "published"
) => {

  // =====================================================
  // STEP 1 - COMPANY CHECK
  // =====================================================
  if (status !== "draft" && firmName) {
    const { data: existingCompany } = await supabase
      .from("companies")
      .select("id")
      .eq("firm_name", firmName)
      .maybeSingle();

    if (!existingCompany) {
      const companySlug = firmName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");
        
      await supabase.from("companies").insert([
        {
          firm_name: firmName,
          slug: companySlug,
          city: city,
          state: state,
          organization_type: organizationType,
        },
      ]);
    }
  }
  // =====================================================

  if (status !== "draft") {

  if (uploadingImage) {
    alert("Please wait until image upload finishes");
    return;
  }

  if (!imageUrl) {
    alert("Please upload job image");
    return;
  }

}

  //* MINIMUM VALIDATION FOR DRAFT */

if (
  status === "draft" &&
  (
    !firmName ||
    !position
  )
) {
  alert("Please enter at least the Company Name and Job Position to save a draft.");
  return;
}

/* FULL VALIDATION FOR PUBLISH & SCHEDULE */

if (
  status !== "draft" &&
  (
    !firmName ||
    !position ||
    !city ||
    !state ||
    !jobDescription
  )
) {
  alert("Please fill all required fields.");
  return;
}

  /* INSERT JOB */


  /* TODAY */

const today = new Date();

const formattedToday =
  today.toISOString().split("T")[0];

/* DEFAULT EXPIRY */

const expiry = new Date();

expiry.setDate(expiry.getDate() + 14);

const formattedExpiry =
  expiry.toISOString().split("T")[0];

/* FINAL EXPIRY */

const finalExpiryDate =
  lastDateToApply || formattedExpiry;

  const { data, error } = await supabase
  .from("jobs")
  .insert([
    {
      firm_name: firmName,
      area: area,
      city: city,
      state: state,
      position: position,

      experience: selectedExperience,
      salary: salary,
      qualifications: qualifications,
      skills_required: skills,

      posted_date:
        status === "published"
          ? formattedToday
          : null,

      scheduled_date:
        status === "scheduled"
          ? `${scheduleDate} ${scheduleTime}`
          : null,

      last_date_to_apply:
        lastDateToApply || null,

      post_expiry_date:
        finalExpiryDate,

      job_description: jobDescription,

      apply_link: apply_link,
      application_email: application_email,

      source: source,

      image: imageUrl,

      status: status,
    },
  ])
  .select()
  .single();

/* ERROR */

if (error) {
  console.log("SUPABASE ERROR:", error);

  alert(JSON.stringify(error));

  return;
}

//* SUCCESS */

if (status === "draft") {
  alert("Draft saved successfully.");
} else if (status === "scheduled") {
  alert("Job scheduled successfully.");
} else {
  alert("Job published successfully.");
}

router.push("/admin");

/* CLEAR FORM */

setFirmName("");
setArea("");
setCity("");
setState("");
setPosition("");
setSalary("");
setSelectedExperience([]);
setQualifications([]);
setSkills([]);
setJobDescription("");
setapply_link("");
setapplication_email("");
setSource("");
setImage("");
setImageUrl("");
setLastDateToApply("");
setPostExpiryDate("");

};

  return (

    <main className="min-h-screen bg-gray-100">

        <Navbar />

        <section className="w-full px-6 lg:px-12 py-10">

          {/* PAGE TITLE */}

<div className="flex justify-between items-start mb-10">

  <div>

    <h1 className="text-4xl font-bold">
      Add New Job
    </h1>

    <p className="text-gray-600 mt-2">
      Publish and manage job opportunities.
    </p>

  </div>

  <button
    onClick={() => router.push("/admin")}
    className="bg-black text-white px-5 py-3 rounded-xl hover:bg-gray-800 transition"
  >
    ← Dashboard
  </button>

</div>

          {/* FORM CONTAINER */}

            {/* BASIC DETAILS */}

            <div>

              <h2 className="text-2xl font-bold mb-6">
                Basic Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* ORGANIZATION TYPE */}

<div>

  <label className="block mb-2 font-medium">
    Organization Type
  </label>

  <select
    value={organizationType}
    onChange={(e) => setOrganizationType(e.target.value)}
    className="w-full border rounded-2xl px-4 py-3"
  >

    {organizationTypes.map((type) => (
      <option key={type} value={type}>
        {type}
      </option>
    ))}

  </select>

</div>
                {/* ORGANIZATION NAME */}

<div>

  <label className="block mb-2 font-medium">
    {organizationType} Name <span className="text-red-500 text-xl font-bold">*</span>
  </label>

  <input
    type="text"
    placeholder="Enter name"
    value={firmName}
    onChange={async (e) => {
  const value = e.target.value;

  setFirmName(value);

  await loadCompanyDetails(value);
}}
    list="firm-suggestions"
    autoComplete="off"
    className="w-full border rounded-2xl px-4 py-3"
  />

  <datalist id="firm-suggestions">
    {existingFirms.map((firm) => (
      <option key={firm} value={firm} />
    ))}
  </datalist>

</div>


                {/* POSITION */}

                <div>

                  <label className="block mb-2 font-medium">
                    Position <span className="text-red-500 text-xl font-bold">*</span>
                  </label>

                  <input
  type="text"
  list="positions"
  placeholder="Junior Architect"
  value={position}
  onChange={(e) =>
    setPosition(e.target.value)
  }
  className="w-full border rounded-2xl px-4 py-3"
/>
                  <datalist id="positions">

                    {positionOptions.map((position) => (

                      <option
                        key={position}
                        value={position}
                      />

                    ))}

                  </datalist>

                </div>

              </div>


            {/* LOCATION */}

            <div>

              <h2 className="text-2xl font-bold mb-6">
                Location
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* NEIGHBORHOOD */}

                <div>

                  <label className="block mb-2 font-medium">
                    Neighborhood
                  </label>

                  <input
                    type="text"
                    placeholder="Adyar"
                    className="w-full border rounded-2xl px-4 py-3"
                  />

                </div>

                {/* CITY */}

                <div>

                  <label className="block mb-2 font-medium">
                    City <span className="text-red-500 text-xl font-bold">*</span>
                  </label>

                  <input
  type="text"
  list="cities"
  placeholder="Chennai"
  value={city}
  onChange={(e) =>
    setCity(e.target.value)
  }
  className="w-full border rounded-2xl px-4 py-3"
/>

                  <datalist id="cities">

                    {existingCities.map((city) => (

                      <option
                        key={city}
                        value={city}
                      />

                    ))}

                  </datalist>

                </div>

                {/* STATE */}

                <div>

                  <label className="block mb-2 font-medium">
                    State <span className="text-red-500 text-xl font-bold">*</span>
                  </label>

                  <input
  type="text"
  list="states"
  placeholder="Tamil Nadu"
  value={state}
  onChange={(e) =>
    setState(e.target.value)
  }
  className="w-full border rounded-2xl px-4 py-3"
/>

                  <datalist id="states">

                    {existingStates.map((state) => (

                      <option
                        key={state}
                        value={state}
                      />

                    ))}

                  </datalist>

                </div>

              </div>

            </div>

            {/* REQUIREMENTS */}

            <div>

              <h2 className="text-2xl font-bold mb-4">
                Requirements
              </h2>

              {/* EXPERIENCE */}

<div className="mb-6">

  <label className="block mb-3 font-medium">
    Experience Levels
  </label>

  <div className="flex flex-wrap gap-3">

    {EXPERIENCE_OPTIONS.map((exp) => {

      const isSelected =
        selectedExperience.includes(exp);

      return (

        <label
          key={exp}
          className={`
            flex items-center gap-3 px-5 py-3 rounded-full border cursor-pointer transition whitespace-nowrap font-medium
            ${
              isSelected
                ? "bg-black text-white border-black"
                : "bg-white text-black border-gray-300 hover:bg-gray-100"
            }
          `}
        >

          {/* CHECKBOX */}

          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {

              if (isSelected) {

                setSelectedExperience(
                  selectedExperience.filter(
                    (e) => e !== exp
                  )
                );

              } else {

                setSelectedExperience([
                  ...selectedExperience,
                  exp,
                ]);

              }

            }}
            className="w-4 h-4 accent-black"
          />

          <span>{exp}</span>

        </label>

      );

    })}

  </div>

</div>

              {/* QUALIFICATION + SALARY */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* QUALIFICATIONS */}

                <div>

                  <label className="block mb-2 font-medium">
                    Qualifications
                  </label>

                  <input
                    type="text"
                    value={qualificationInput}
                    onChange={(e) => {

                      const value = e.target.value;

                      if (value.endsWith(",")) {

                        const newQualification =
                          value.replace(",", "").trim();

                        if (
                          newQualification &&
                          !qualifications.includes(
                            newQualification
                          )
                        ) {

                          setQualifications([
                            ...qualifications,
                            newQualification,
                          ]);

                        }

                        setQualificationInput("");

                      } else {

                        setQualificationInput(value);

                      }

                    }}
                    placeholder="Type qualification and press comma"
                    className="w-full border rounded-2xl px-4 py-2.5"
                  />

                  <div className="flex flex-wrap gap-2 mt-3">

                    {qualifications.map((qualification) => (

                      <div
                        key={qualification}
                        className="bg-gray-200 px-4 py-2 rounded-full flex items-center gap-2"
                      >

                        <span>{qualification}</span>

                        <button
                          type="button"
                          onClick={() =>
                            setQualifications(
                              qualifications.filter(
                                (q) => q !== qualification
                              )
                            )
                          }
                        >
                          ✕
                        </button>

                      </div>

                    ))}

                  </div>

                </div>

                {/* SALARY */}

                <div>

                  <label className="block mb-2 font-medium">
                    Salary
                  </label>

                  <select
  value={salary}
  onChange={(e) =>
    setSalary(e.target.value)
  }
  className="w-full border rounded-2xl px-4 py-2.5"
>

                    <option>
                      Select Salary Range
                    </option>

                    {SALARY_OPTIONS.map((option) => (

                      <option key={option}>
                        {option}
                      </option>

                    ))}

                  </select>

                </div>

              </div>

              {/* SKILLS */}

              <div className="mt-6">

                <label className="block mb-2 font-medium">
                  Skills Required
                </label>

                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => {

                    const value = e.target.value;

                    if (value.endsWith(",")) {

                      const newSkill =
                        value.replace(",", "").trim();

                      if (
                        newSkill &&
                        !skills.includes(newSkill)
                      ) {

                        setSkills([
                          ...skills,
                          newSkill,
                        ]);

                      }

                      setSkillInput("");

                    } else {

                      setSkillInput(value);

                    }

                  }}
                  placeholder="Type skill and press comma"
                  className="w-full border rounded-2xl px-4 py-3"
                />

                <div className="flex flex-wrap gap-2 mt-3">

                  {skills.map((skill) => (

                    <div
                      key={skill}
                      className="bg-black text-white px-4 py-2 rounded-full flex items-center gap-2"
                    >

                      <span>{skill}</span>

                      <button
                        type="button"
                        onClick={() =>
                          setSkills(
                            skills.filter(
                              (s) => s !== skill
                            )
                          )
                        }
                      >
                        ✕
                      </button>

                    </div>

                  ))}

                </div>

              </div>
            </div>

            {/* JOB DETAILS */}

            <div>

              <h2 className="text-2xl font-bold mb-6">
                Job Details
              </h2>

              {/* DESCRIPTION */}

              <div>

                <label className="block mb-2 font-medium">
                  Job Description <span className="text-red-500 text-xl font-bold">*</span>
                </label>

                <textarea
  rows={8}
  placeholder="Write detailed job description..."
  value={jobDescription}
  onChange={(e) =>
    setJobDescription(e.target.value)
  }
  className="w-full border rounded-2xl px-4 py-3"
/>

              </div>

            </div>

            {/* APPLICATION */}

            <div>

              <h2 className="text-2xl font-bold mb-4">
                Application Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              
                {/* SOURCE LINK */}

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

  {/* DATE TYPE */}

  <div>

    <label className="block mb-2 font-medium">
      Date Type
    </label>

    <select
      value={dateType}
      onChange={(e) =>
        setDateType(e.target.value)
      }
      className="w-full border rounded-2xl px-4 py-2.5"
    >

      <option value="expiry">
        Expiry Date
      </option>

      <option value="apply">
        Last Date To Apply
      </option>

    </select>

  </div>

  {/* DATE */}

  <div>

    <label className="block mb-2 font-medium">

      {dateType === "apply"
        ? "Last Date To Apply"
        : "Expiry Date"}

    </label>

    <input
      type="date"

      value={
        dateType === "apply"
          ? lastDateToApply
          : postExpiryDate
      }

      onChange={(e) => {

        if (dateType === "apply") {

          setLastDateToApply(
            e.target.value
          );

        } else {

          setPostExpiryDate(
            e.target.value
          );

        }

      }}

      className="w-full border rounded-2xl px-4 py-2.5"
    />

  </div>

</div>
                <div>

                  <label className="block mb-2 font-medium">
                    Source Link
                  </label>

                  <input
  type="text"
  placeholder="https://..."
  value={source}
  onChange={(e) =>
    setSource(e.target.value)
  }
  className="w-full border rounded-2xl px-4 py-2.5"
/>

                </div>

              </div>

            </div>

            {/* MEDIA */}

            <div>

              <h2 className="text-2xl font-bold mb-6">
                Media
              </h2>

              {/* IMAGE URL */}

<div>

  <label className="block mb-2 font-medium">
    Upload Job Image{" "}
    <span className="text-red-500 text-xl font-bold">*</span>
  </label>

  <input
    type="file"
    accept="image/*"
    onChange={handleImageUpload}
    className="w-full border rounded-2xl px-4 py-3"
  />

  {/* UPLOADING */}

  {uploadingImage && (

    <div className="mt-3 flex items-center gap-2 text-blue-600">

      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>

      <p>Uploading image...</p>

    </div>

  )}

  {/* SUCCESS */}

  {uploadSuccess && (

    <div className="mt-3 flex items-center gap-2 text-green-600">

      <span className="text-xl">✓</span>

      <p>Image uploaded successfully</p>

    </div>

  )}

  {/* IMAGE PREVIEW */}

  {imageUrl && (

    <div className="mt-5">

      <img
        src={imageUrl}
        alt="Job Preview"
        className="w-full max-w-md h-64 object-cover rounded-2xl border shadow-sm"
      />

    </div>

  )}

</div>
            </div>
            {/* APPLICATION BUTTON TYPE */}

            <div>

              <h2 className="text-2xl font-bold mb-6">
                Application Method
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* APPLICATION TYPE */}

                <div>

                  <label className="block mb-2 font-medium">
                    Button Type <span className="text-red-500 text-xl font-bold">*</span>
                  </label>

                  <select
                    value={applicationType}
                    onChange={(e) =>
                      setApplicationType(e.target.value)
                    }
                    className="w-full border rounded-2xl px-4 py-3"
                  >

                    <option value="apply">
                      Apply Now
                    </option>

                    <option value="email">
                      Email Now
                    </option>

                  </select>

                </div>

                {/* APPLY LINK */}

{applicationType === "apply" && (

  <div className="md:col-span-2">

    <label className="block mb-2 font-medium">
      Apply Link <span className="text-red-500 text-xl font-bold">*</span>
    </label>

    <input
      type="text"
      placeholder="https://..."
      value={apply_link}
      onChange={(e) =>
        setapply_link(e.target.value)
      }
      className="w-full border rounded-2xl px-4 py-3"
    />

  </div>

)}

{/* EMAIL */}

{applicationType === "email" && (

  <div className="md:col-span-2">

    <label className="block mb-2 font-medium">
      Application Email <span className="text-red-500 text-xl font-bold">*</span>
    </label>

    <input
      type="email"
      placeholder="careers@firm.com"
      value={application_email}
      onChange={(e) =>
        setapplication_email(e.target.value)
      }
      className="w-full border rounded-2xl px-4 py-3"
    />

  </div>

)}

              </div>

            </div>

            {/* ACTION BUTTONS */}

<div className="flex justify-center gap-4 mt-8 mb-6">
  <button
  type="button"
  onClick={handleSaveDraft}
    className="px-8 py-4 rounded-2xl border-2 border-black bg-white text-black font-semibold hover:bg-gray-100 transition"
  >
    Save Draft
  </button>

  <button
  type="button"
  onClick={() => setShowSchedule(true)}
  className="px-8 py-4 rounded-2xl border-2 border-black bg-white text-black font-semibold hover:bg-gray-100 transition"
>
  Schedule
</button>

  <button
    type="button"
    disabled={uploadingImage}
    onClick={() => handlePublishJob("published")}
    className={`px-8 py-4 rounded-2xl text-lg font-semibold transition ${
      uploadingImage
        ? "bg-gray-400 text-white cursor-not-allowed"
        : "bg-black text-white hover:bg-gray-800"
    }`}
  >
    {uploadingImage ? "Uploading Image..." : "Publish Job"}
  </button>
</div>
          
 <div className="flex-1 border-t border-black-300"></div>

            {/* ================= ORGANIZATION INFORMATION ================= */}
            <div className="mt-8 mb-6">
  <h2 className="text-3xl font-bold">
    Company Profile
  </h2>
</div>

{/* Logo + Website */}

<div className="grid md:grid-cols-2 gap-6">

  <div>
    <label className="block mb-2 font-medium">
      {organizationType} Logo
    </label>

    <input
      type="file"
      className="w-full border rounded-2xl px-4 py-3"
    />
  </div>

  <div>
    <label className="block mb-2 font-medium">
      Website
    </label>

    <input
      type="url"
      placeholder="https://"
      value={companyWebsite}
      onChange={(e) => setCompanyWebsite(e.target.value)}
      className="w-full border rounded-2xl px-4 py-3"
    />
  </div>

</div>

{/* Email + Phone */}

<div className="grid md:grid-cols-2 gap-6 mt-6">

  <div>
    <label className="block mb-2 font-medium">
      Email
    </label>

    <input
      type="email"
      placeholder="office@example.com"
      value={companyEmail}
      onChange={(e) => setCompanyEmail(e.target.value)}
      className="w-full border rounded-2xl px-4 py-3"
    />
  </div>

  <div>
    <label className="block mb-2 font-medium">
      Phone Number
    </label>

    <input
      type="text"
      placeholder="+91 XXXXX XXXXX"
      value={companyPhone}
      onChange={(e) => {
        const value = e.target.value;
        setCompanyPhone(value);

        if (sameAsPhone) {
          setCompanyWhatsapp(value);
        }
      }}
      className="w-full border rounded-2xl px-4 py-3"
    />
  </div>

</div>

{/* WhatsApp (Left) + Empty (Right) */}

<div className="grid md:grid-cols-2 gap-6 mt-6">

  <div>

    <label className="block mb-2 font-medium">
      WhatsApp Number
    </label>

    <div className="flex items-center gap-2 mb-2">

      <input
        type="checkbox"
        checked={sameAsPhone}
        onChange={(e) => {
          const checked = e.target.checked;

          setSameAsPhone(checked);

          if (checked) {
            setCompanyWhatsapp(companyPhone);
          } else {
            setCompanyWhatsapp("");
          }
        }}
      />

      <span className="text-sm">
        Same as Phone Number
      </span>

    </div>

    <input
      type="text"
      placeholder="+91 XXXXX XXXXX"
      value={companyWhatsapp}
      onChange={(e) => setCompanyWhatsapp(e.target.value)}
      disabled={sameAsPhone}
      className={`w-full border rounded-2xl px-4 py-3 ${
        sameAsPhone ? "bg-gray-100 cursor-not-allowed" : ""
      }`}
    />

  </div>

  <div></div>

</div>

{/* Founded Year + Employee Size */}

<div className="grid md:grid-cols-2 gap-6 mt-6">

  <div>

    <label className="block mb-2 font-medium">
      Founded Year
    </label>

    <input
      type="number"
      min="1800"
      max={new Date().getFullYear()}
      value={foundedYear}
      onChange={(e) => setFoundedYear(e.target.value)}
      placeholder="Founded Year"
      className="w-full border rounded-2xl px-4 py-3"
    />

  </div>

  <div>

    <label className="block mb-2 font-medium">
      Employee Size
    </label>

    <select
      value={employeeSize}
      onChange={(e) => setEmployeeSize(e.target.value)}
      className="w-full border rounded-2xl px-4 py-3"
    >
      <option value="">Select Employee Size</option>
      <option>1–5</option>
      <option>6–10</option>
      <option>11–25</option>
      <option>26–50</option>
      <option>51–100</option>
      <option>101–250</option>
      <option>251–500</option>
      <option>500+</option>
    </select>

  </div>

</div>

{/* About */}

<div className="mt-6">

  <label className="block mb-2 font-medium">
    About {organizationType}
  </label>

  <textarea
    rows={5}
    placeholder={`Write about the ${organizationType.toLowerCase()}...`}
    value={companyDescription}
    onChange={(e) => setCompanyDescription(e.target.value)}
    className="w-full border rounded-2xl px-4 py-3"
  />

</div>

{/* ================= SOCIAL MEDIA ================= */}

<h3 className="text-2xl font-semibold mt-10 mb-6">
  Social Media
</h3>

<div className="grid md:grid-cols-2 gap-6">

  <input
    type="url"
    placeholder="Facebook URL"
    value={companyFacebook}
    onChange={(e) => setCompanyFacebook(e.target.value)}
    className="w-full border rounded-2xl px-4 py-3"
  />

  <input
    type="url"
    placeholder="Instagram URL"
    value={companyInstagram}
    onChange={(e) => setCompanyInstagram(e.target.value)}
    className="w-full border rounded-2xl px-4 py-3"
  />

  <input
    type="url"
    placeholder="LinkedIn URL"
    value={companyLinkedin}
    onChange={(e) => setCompanyLinkedin(e.target.value)}
    className="w-full border rounded-2xl px-4 py-3"
  />

  <input
    type="url"
    placeholder="X (Twitter) URL"
    value={companyTwitter}
    onChange={(e) => setCompanyTwitter(e.target.value)}
    className="w-full border rounded-2xl px-4 py-3"
  />

</div>

          {/* ACTION BUTTONS */}

<div className="flex justify-center gap-4 mt-8 mb-6">
  <button
  type="button"
  onClick={handleSaveDraft}
    className="px-8 py-4 rounded-2xl border-2 border-black bg-white text-black font-semibold hover:bg-gray-100 transition"
  >
    Save Draft
  </button>

  <button
  type="button"
  onClick={() => setShowSchedule(true)}
  className="px-8 py-4 rounded-2xl border-2 border-black bg-white text-black font-semibold hover:bg-gray-100 transition"
>
  Schedule
</button>

  <button
    type="button"
    disabled={uploadingImage}
    onClick={() => handlePublishJob("published")}
    className={`px-8 py-4 rounded-2xl text-lg font-semibold transition ${
      uploadingImage
        ? "bg-gray-400 text-white cursor-not-allowed"
        : "bg-black text-white hover:bg-gray-800"
    }`}
  >
    {uploadingImage ? "Uploading Image..." : "Publish Job"}
  </button>
</div>
          
 <div className="flex-1 border-t border-black-300"></div>  

          </div>
          {/* ================= SCHEDULE MODAL ================= */}

{showSchedule && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-8 w-full max-w-md">

      <h2 className="text-2xl font-bold mb-6">
        Schedule Job
      </h2>

      <div className="space-y-5">

        <div>
          <label className="block mb-2 font-medium">
            Date
          </label>

          <input
            type="date"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Time
          </label>

          <input
            type="time"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
          />
        </div>

        {scheduleDate && scheduleTime && (
  <p className="mt-2 text-sm text-green-600">
    Scheduled for{" "}
    {new Date(`${scheduleDate}T${scheduleTime}`).toLocaleString("en-IN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}

    {(() => {
      const diff =
        new Date(`${scheduleDate}T${scheduleTime}`).getTime() -
        new Date().getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));

      return hours > 0 && hours < 24
        ? ` (in ${hours} hour${hours > 1 ? "s" : ""})`
        : "";
    })()}
  </p>
)}

      </div>

      <div className="flex justify-end gap-3 mt-8">

        <button
          type="button"
          onClick={() => setShowSchedule(false)}
          className="px-6 py-3 border rounded-xl"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() => setShowSchedule(true)}
          className="px-6 py-3 bg-black text-white rounded-xl"
        >
          Schedule
        </button>

      </div>

    </div>
  </div>
)}


{/* ================= SCHEDULE POPUP ================= */}

{showSchedule && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white rounded-2xl p-8 w-full max-w-md">

      <h2 className="text-2xl font-bold mb-6">
        Schedule Job
      </h2>

      <div className="space-y-5">

        <div>
          <label className="block mb-2 font-medium">
            Schedule Date
          </label>

          <input
            type="date"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Schedule Time
          </label>

          <input
            type="time"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
          />
        </div>

      </div>

      <div className="flex justify-end gap-3 mt-8">

        <button
          type="button"
          onClick={() => setShowSchedule(false)}
          className="px-6 py-3 border rounded-xl"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSchedule}
          className="px-6 py-3 bg-black text-white rounded-xl"
        >
          Schedule Job
        </button>

      </div>

    </div>

  </div>
)}

        </section>

        <Footer />

      </main>

    );

  }