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

const [employmentType, setEmploymentType] = useState("");
const [workplaceType, setWorkplaceType] = useState("On-site");

  

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
const [showSmartUpload, setShowSmartUpload] = useState(false);

const [showUploadOptions, setShowUploadOptions] = useState(false);
const [smartText, setSmartText] = useState("");
const [smartUrl, setSmartUrl] = useState("");

const [smartImage, setSmartImage] = useState<File | null>(null);

const [loadingAI, setLoadingAI] = useState<string | boolean>(false);
const [activeTab, setActiveTab] = useState("text");

const [uploadMode, setUploadMode] = useState('text');
const [autoPublishSocial, setAutoPublishSocial] = useState(true);
const [previewData,setPreviewData]=useState(null);
const [aiResult, setAiResult] = useState<any>(null);

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

// Deprecated single-position state variables removed.
  const [lastDateToApply, setLastDateToApply] = useState('');
  const [postExpiryDate, setPostExpiryDate] = useState('');
  const [apply_link, setapply_link] = useState('');
  const [application_email, setapplication_email] = useState('');
  const [source, setSource] = useState('');
  const [image, setImage] = useState('');
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [positions, setPositions] = useState([{position: "", experience: [], salary: "", description: "", completed: false}]);
const updatePosition = (index, field, value) => {
  const newPositions = [...positions];
  newPositions[index][field] = value;
  setPositions(newPositions);
};
const addPosition = () => {
  setPositions([...positions, {position: "", experience: [], salary: "", description: "", completed: false}]);
};
const removePosition = (index) => {
  if (positions.length > 1) {
    const newPositions = [...positions];
    newPositions.splice(index, 1);
    setPositions(newPositions);
  }
};


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
      .from("admin_jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    if (data) {
      setFirmName(data.firm_name || "");
      if (data.employment_type) setEmploymentType(data.employment_type);
      if (data.workplace_type) setWorkplaceType(data.workplace_type);
      setOrganizationType(data.organization_type || "Firm");
      setArea(data.area || "");
      setCity(data.city || "");
      setState(data.state || "");

      if (data.positions && Array.isArray(data.positions) && data.positions.length > 0) {
        setPositions(data.positions);
      } else if (data.position) {
        setPositions([{ 
          position: data.position || "",
          salary: data.salary || "",
          description: data.job_description || "",
          experience: Array.isArray(data.experience) ? data.experience : (data.experience ? [data.experience] : []),
          completed: false
        }]);
      }

      setQualifications(data.qualifications || "");
      setSkills(data.skills_required || "");
      setPostedDate(data.posted_date || "");
      setLastDateToApply(data.last_date_to_apply || "");
      setPostExpiryDate(data.post_expiry_date || "");
      setImageUrl(data.image || "");
      
      if (data.apply_link) {
        setApplicationType("apply");
        setapply_link(data.apply_link);
      } else if (data.application_email) {
        setApplicationType("email");
        setapplication_email(data.application_email);
      }

      if (data.status === "scheduled" && data.schedule_time) {
         setScheduleTime(data.schedule_time);
         setScheduleDate(data.posted_date);
      }
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

    // Generate SEO friendly file name
  let safeFirm = firmName ? firmName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '';
  let safePosition = positions[0]?.position ? positions[0]?.position.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '';
  let seoName = '';
  if (safeFirm && safePosition) {
    seoName = `${safeFirm}-hiring-${safePosition}`;
  } else if (safeFirm) {
    seoName = safeFirm;
  } else if (safePosition) {
    seoName = safePosition;
  } else {
    seoName = `job-${jobId || 'post'}`;
  }
  seoName = seoName.replace(/-+/g, '-');
  
  const extMatch = file.name.match(/.[0-9a-z]+$/i);
  const ext = extMatch ? extMatch[0].toLowerCase() : '';
  
  const fileName = `${seoName}-${Date.now()}${ext}`;

  const { data, error } = await supabase.storage
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
  setIsPublishing(true);

  try {
    let currentCompanyId = null;

    if (status !== "draft" && firmName) {
      const { data: existingCompany } = await supabase
        .from("companies")
        .select("id")
        .ilike("firm_name", firmName.trim())
        .maybeSingle();

      if (!existingCompany) {
        const companySlug = firmName
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]+/g, "");
          
        const { data: newComp } = await supabase.from("companies").insert([
          {
            firm_name: firmName,
            slug: companySlug,
            city: city,
            state: state,
            organization_type: organizationType,
            created_by: currentUser?.id || null
          },
        ]).select().single();
        
        if (newComp) {
          currentCompanyId = newComp.id;
        }
      } else {
        currentCompanyId = existingCompany.id;
      }
    }

    if (status !== "draft") {
      if (uploadingImage) {
        alert("Please wait until image upload finishes");
        setIsPublishing(false);
        return;
      }
      if (!imageUrl) {
        alert("Please upload job image");
        setIsPublishing(false);
        return;
      }
    }

    if (status === "draft" && (!firmName || !positions[0]?.position)) {
      alert("Please enter at least the Company Name and Job Position to save a draft.");
      setIsPublishing(false);
      return;
    }

    let missingFields = false;
    if (status !== "draft") {
      if (!firmName || !city || !state) missingFields = true;
      positions.forEach(p => {
        if (!p.position || !p.description) missingFields = true;
      });
    }

    if (missingFields) {
      alert("Please fill all required fields, including position titles and descriptions.");
      setIsPublishing(false);
      return;
    }

    const today = new Date();
    const formattedToday = today.toISOString().split("T")[0];
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 14);
    const formattedExpiry = expiry.toISOString().split("T")[0];

    const finalExpiryDate = postExpiryDate || formattedExpiry;
    const activeUser = JSON.parse(localStorage.getItem("currentUser") || "null");

    const adminPayload = {
      firm_name: firmName,
      company_id: currentCompanyId,
      employment_type: employmentType,
      workplace_type: workplaceType,
      area: area,
      city: city,
      state: state,
      positions: positions,
      qualifications: qualifications,
      skills_required: skills,
      posted_date: status === "published" ? formattedToday : null,
      last_date_to_apply: lastDateToApply || null,
      post_expiry_date: finalExpiryDate,
      apply_link: apply_link,
      application_email: application_email,
      source: source,
      image: imageUrl,
      status: status,
      author_id: activeUser?.id || null,
      schedule_time: status === "scheduled" ? scheduleTime : null
    };

    let jobData = null;

    if (jobId) {
      if (status === "published") {
        await supabase.from("jobs").delete().eq("admin_post_id", jobId);
      }
      const { data, error } = await supabase.from("admin_jobs").update(adminPayload).eq("id", jobId).select().single();
      if (error) throw error;
      jobData = data;
    } else {
      const { data, error } = await supabase.from("admin_jobs").insert([adminPayload]).select().single();
      if (error) throw error;
      jobData = data;
    }

    if (jobData && jobData.id && status === "published") {
      const publicJobs = positions.map(pos => ({
        admin_post_id: jobData.id,
        firm_name: firmName,
        company_id: currentCompanyId,
        employment_type: employmentType,
        workplace_type: workplaceType,
        area: area,
        city: city,
        state: state,
        position: pos.position,
        experience: pos.experience,
        salary: pos.salary,
        job_description: pos.description,
        qualifications: qualifications,
        skills_required: skills,
        posted_date: formattedToday,
        last_date_to_apply: lastDateToApply || null,
        post_expiry_date: finalExpiryDate,
        apply_link: apply_link,
        application_email: application_email,
        source: source,
        image: imageUrl,
        status: status,
        author_id: activeUser?.id || null
      }));

      const { error: jobsErr } = await supabase.from("jobs").insert(publicJobs);
      if (jobsErr) {
        if (!jobId) {
          await supabase.from("admin_jobs").delete().eq("id", jobData.id);
        }
        throw jobsErr;
      }
    }

    if (jobData && jobData.id) {
      setJobId(jobData.id);
      window.history.replaceState(null, "", `/admin/add-job?id=${jobData.id}`);

      if (status === "published" && autoPublishSocial) {
        fetch("/api/publish/social", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ job_id: jobData.id })
        }).catch(err => console.error("Social publish request failed", err));
      }

      if (status === "draft") {
        alert("Draft saved successfully.");
      } else if (status === "scheduled") {
        alert("Job scheduled successfully.");
      } else {
        alert("Job published successfully.");
      }

      if (status !== "draft") {
        router.push("/admin/activity");
      }
    }
  } catch (err) {
    console.error("SUPABASE ERROR:", err);
    alert(JSON.stringify(err.message || err));
  }
  
  setIsPublishing(false);
};

const handleSmartExtraction = async () => {

};

  return (
    <>

    <main className="min-h-screen bg-white text-black relative overflow-visible">

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
    className="bg-black text-white px-5 py-3 rounded-xl hover:bg-gray-800 transition flex items-center gap-2 shrink-0"
  >
    ← Back to Dashboard
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

              

              {/* POSITIONS & DESCRIPTIONS */}
              <div className="mt-10 mb-10">
                <div className="flex justify-between items-end mb-6">
                  <h2 className="text-2xl font-bold">Roles & Requirements</h2>
                  <button type="button" onClick={addPosition} className="text-blue-600 font-bold hover:underline">+ Add Position</button>
                </div>
                
                <div className="space-y-6">
                  {positions.map((pos, index) => (
                    <div key={index} className="border border-gray-200 p-6 rounded-2xl bg-white shadow-sm relative text-black">
                      {positions.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removePosition(index)} 
                          className="absolute top-6 right-6 text-red-500 text-sm font-bold hover:underline"
                        >
                          Remove
                        </button>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label className="block mb-2 font-medium">Position Title <span className="text-red-500">*</span></label>
                          <input 
                            type="text" 
                            list="positionsList"
                            value={pos.position} 
                            onChange={(e) => updatePosition(index, "position", e.target.value)} 
                            className="w-full border rounded-2xl px-4 py-3 bg-white text-black" 
                            placeholder="e.g. Junior Architect" 
                          />
                          <datalist id="positionsList">
                            {positionOptions.map((opt) => <option key={opt} value={opt} />)}
                          </datalist>
                        </div>
                        <div>
                          <label className="block mb-2 font-medium">Salary / Compensation</label>
                          <input 
                            type="text" 
                            value={pos.salary} 
                            onChange={(e) => updatePosition(index, "salary", e.target.value)} 
                            className="w-full border rounded-2xl px-4 py-3 bg-white text-black" 
                            placeholder="e.g. ₹ 3,00,000 - ₹ 5,00,000" 
                          />
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <label className="block mb-2 font-medium">Required Experience <span className="text-red-500">*</span></label>
                        <div className="flex flex-wrap gap-2">
                          {EXPERIENCE_OPTIONS.map((exp) => {
                            const currentExps = Array.isArray(pos.experience) ? pos.experience : (pos.experience ? [pos.experience] : []);
                            const isSelected = currentExps.includes(exp);
                            return (
                              <button
                                key={exp}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    updatePosition(index, "experience", currentExps.filter(e => e !== exp));
                                  } else {
                                    updatePosition(index, "experience", [...currentExps, exp]);
                                  }
                                }}
                                className={`px-4 py-2 border rounded-full text-sm font-semibold transition ${
                                  isSelected
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-black border-gray-300 hover:bg-gray-100"
                                }`}
                              >
                                {exp}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block mb-2 font-medium">Job Description <span className="text-red-500">*</span></label>
                        <textarea 
                          rows={6}
                          value={pos.description}
                          onChange={(e) => updatePosition(index, "description", e.target.value)}
                          className="w-full border rounded-2xl px-4 py-3 bg-white text-black"
                          placeholder="Write detailed job description..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              

              {/* QUALIFICATION */} <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> <div> <label className="block mb-2 font-medium"> Qualifications </label> <input type="text" placeholder="B.Arch" value={qualifications} onChange={(e) => setQualifications(e.target.value)} className="w-full border rounded-2xl px-4 py-3" /> </div> </div>

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

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block mb-2 font-medium">Employment Type <span className="text-red-500 text-xl font-bold">*</span></label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full border rounded-2xl px-4 py-3"
                  >
                    <option value="" disabled>Select Employment Type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Temporary">Temporary</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 font-medium">Workplace Type</label>
                  <select
                    value={workplaceType}
                    onChange={(e) => setWorkplaceType(e.target.value)}
                    className="w-full border rounded-2xl px-4 py-3"
                  >
                    <option value="On-site">On-site</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
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
  <button type="button" disabled={isPublishing} onClick={handleSaveDraft} className="px-8 py-4 rounded-2xl border-2 border-black bg-white text-black font-semibold hover:bg-white transition"
  >
    Save Draft
  </button>

  <button type="button" disabled={isPublishing} onClick={() => setShowSchedule(true)} className="px-8 py-4 rounded-2xl border-2 border-black bg-white text-black font-semibold hover:bg-white transition"
>
  Schedule
</button>

  <button
    type="button"
    disabled={uploadingImage || isPublishing}
    onClick={() => handlePublishJob("published")}
    className={`px-8 py-4 rounded-2xl text-lg font-semibold transition ${
      uploadingImage
        ? "bg-gray-400 text-white cursor-not-allowed"
        : "bg-black text-white hover:bg-gray-800"
    }`}
  >
    {isPublishing ? "Publishing..." : uploadingImage ? "Uploading Image..." : "Publish Job"}
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
        sameAsPhone ? "bg-white cursor-not-allowed" : ""
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
  <button type="button" disabled={isPublishing} onClick={handleSaveDraft} className="px-8 py-4 rounded-2xl border-2 border-black bg-white text-black font-semibold hover:bg-white transition"
  >
    Save Draft
  </button>

  <button type="button" disabled={isPublishing} onClick={() => setShowSchedule(true)} className="px-8 py-4 rounded-2xl border-2 border-black bg-white text-black font-semibold hover:bg-white transition"
>
  Schedule
</button>

  <button
    type="button"
    disabled={uploadingImage || isPublishing}
    onClick={() => handlePublishJob("published")}
    className={`px-8 py-4 rounded-2xl text-lg font-semibold transition ${
      uploadingImage
        ? "bg-gray-400 text-white cursor-not-allowed"
        : "bg-black text-white hover:bg-gray-800"
    }`}
  >
    {isPublishing ? "Publishing..." : uploadingImage ? "Uploading Image..." : "Publish Job"}
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

        </section>

      <Footer />
      </main>

      {/* ================= SMART JOB POPUP (9:16 RATIO) ================= */}
      {showSmartUpload && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000000] p-4 backdrop-blur-md">
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 transition-all duration-500 w-full max-w-[1050px] mx-auto p-2">
            
            {/* LEFT PANE: PREVIEW BOX (Visible after extraction) */}
            {String(loadingAI) === 'done' && (
              <div className="bg-white rounded-[32px] w-full max-w-[500px] h-[85vh] max-h-[780px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="p-6 bg-white border-b">
                  <h3 className="font-bold text-xl">🔎 Preview</h3>
                  <p className="text-xs text-gray-800 md:text-gray-500">Confirm detected details</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-800 font-extrabold">Firm</label>
                    <p className="font-semibold border-b border-gray-100 pb-1">{firmName || "---"}</p>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-800 font-extrabold">Position</label>
                    <p className="font-semibold border-b border-gray-100 pb-1">{positions[0]?.position || '---'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-700 md:text-gray-400 font-extrabold">Location</label>
                    <p className="font-semibold border-b border-gray-100 pb-1">{city}, {state}</p>
                  </div>
                </div>

                <div className="p-6">
                  <button
                    onClick={() => {
                      setShowSmartUpload(false);
                      setLoadingAI(false);
                    }}
                    className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold hover:bg-green-700 shadow-lg active:scale-95 transition-all"
                  >
                    Confirm & Auto-Fill
                  </button>
                </div>
              </div>
            )}

            {/* RIGHT PANE: UPLOAD BOX (9:16 Ratio) */}
            <div className="bg-white rounded-[32px] w-full max-w-[500px] h-[85vh] max-h-[780px] shadow-2xl flex flex-col relative overflow-hidden border border-white/20">
              <button
                onClick={() => { setShowSmartUpload(false); setLoadingAI(false); }}
                className="absolute right-5 top-5 bg-white text-gray-800 md:text-gray-500 hover:text-black w-8 h-8 rounded-full flex items-center justify-center z-20"
              >✕</button>

              <div className="p-8 flex-1 flex flex-col">
                <h2 className="text-2xl font-black mt-4 tracking-tight">Smart Job</h2>
                <p className="text-gray-800 text-xs mb-6 uppercase tracking-widest font-bold">Extraction Mode</p>

                <div className="flex-1 flex flex-col justify-center overflow-hidden">
                  {uploadMode === 'image' && (
                    <div className="w-full">
                      {!smartImage ? (
                        <label className="border-2 border-dashed border-gray-200 rounded-[2rem] p-6 flex flex-col items-center justify-center bg-white hover:border-black cursor-pointer transition-all h-[40vh] min-h-[200px] max-h-[350px]">
                          <span className="text-4xl mb-3">🖼️</span>
                          <span className="text-[10px] font-bold text-gray-700 md:text-gray-400 uppercase tracking-widest text-center">Upload your image</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => setSmartImage(e.target.files?.[0] || null)} 
                          />
                        </label>
                      ) : (
                        <div className="relative w-full h-[40vh] min-h-[200px] max-h-[350px] rounded-[2rem] overflow-hidden border bg-gray-100 flex items-center justify-center shadow-inner">
                          <img 
                            src={URL.createObjectURL(smartImage)} 
                            alt="Selected" 
                            className="w-full h-full object-contain p-2" 
                          />
                          <button 
                            onClick={() => setSmartImage(null)}
                            className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white w-6 h-6 rounded-full text-xs hover:bg-red-500 transition-colors"
                          >✕</button>
                        </div>
                      )}
                    </div>
                  )}

                  {uploadMode === 'text' && (
                    <textarea
                      rows={12}
                      value={smartText}
                      onChange={(e) => setSmartText(e.target.value)}
                      placeholder="Paste job text here..."
                      className="w-full border-2 border-gray-100 rounded-3xl p-5 text-sm outline-none focus:border-black transition-all h-[320px] resize-none"
                    />
                  )}

                  {uploadMode === 'url' && (
                    <input type="url" value={smartUrl} onChange={(e)=>setSmartUrl(e.target.value)} placeholder="Paste link here..."
                      className="w-full border-2 border-gray-100 rounded-full px-6 py-4 text-sm outline-none focus:border-black transition-all"
                    />
                  )}
                </div>

                <button
  disabled={loadingAI === "loading"}
  onClick={async () => {
    try {
      setLoadingAI("loading");

      let formData = new FormData();
      formData.append("mode", uploadMode);
      if (uploadMode === "text") {
        if (!smartText) throw new Error("Please paste text to extract.");
        formData.append("text", smartText);
      } else if (uploadMode === "image") {
        if (!smartImage) throw new Error("Please upload an image to extract.");
        formData.append("image", smartImage);
      } else if (uploadMode === "url") {
        if (!smartUrl) throw new Error("Please paste a URL to extract.");
        formData.append("url", smartUrl);
      } else {
        throw new Error("Mode not supported yet.");
      }

      const response = await fetch("/api/extract-job", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to extract");

            const ai = typeof result.result === "string" ? JSON.parse(result.result) : (result.result || result);

      // Normalization helpers
      const normEmp = (e) => {
        if(!e) return "";
        const low = e.toLowerCase().replace(/[^a-z]/g, '');
        if(low.includes('full')) return 'Full-time';
        if(low.includes('part')) return 'Part-time';
        if(low.includes('contract')) return 'Contract';
        if(low.includes('temp')) return 'Temporary';
        if(low.includes('free')) return 'Freelance';
        if(low.includes('intern')) return 'Internship';
        return "";
      };
      
      const normWork = (w) => {
        if(!w) return "";
        const low = w.toLowerCase().replace(/[^a-z]/g, '');
        if(low.includes('remot') || low.includes('wfh') || low.includes('home')) return 'Remote / Work from Home';
        if(low.includes('hyb')) return 'Hybrid';
        if(low.includes('site') || low.includes('office')) return 'On-site';
        return "";
      };

      // Preview
      setFirmName(ai.company || ai.firm_name || "");
      setOrganizationType(ai.organization_type || "");
      
      setCity(ai.city || "");
      setState(ai.state || "");

      

      // Handle experience carefully (frontend expects array or string?)
      if (Array.isArray(ai.experience)) setSelectedExperience(ai.experience);
      else if (ai.experience) setSelectedExperience([ai.experience]);

      if (ai.employmentType || ai.employment_type) setEmploymentType(normEmp(ai.employmentType || ai.employment_type));
      if (ai.workplaceType || ai.workplace_type) setWorkplaceType(normWork(ai.workplaceType || ai.workplace_type));

      setPositions([{
  position: ai.position || ai.job_title || "",
  experience: Array.isArray(ai.experience) ? ai.experience : (ai.experience ? [ai.experience] : []),
  salary: ai.salary || "",
  description: ai.description || ai.job_description || "",
  completed: false
}]);


      setLastDateToApply(ai.deadline || ai.application_deadline || "");

      setapplication_email(ai.applicationEmail || ai.application_email || ai.email || "");
      setapply_link(ai.apply_link || ai.website || ai.website_url || "");
      if(ai.phone || ai.contact_phone) setCompanyPhone(ai.phone || ai.contact_phone);

      setLoadingAI("done");

    } catch (err) {
      console.error(err);
      alert(err.message || "Extraction Failed");
      setLoadingAI(false);
    }
  }}
  className={`mt-6 w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
    loadingAI === "loading"
      ? "bg-white text-gray-700 md:text-gray-400"
      : "bg-black text-white hover:bg-gray-800 shadow-xl"
  }`}
>
  {loadingAI === "loading" ? (
    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
  ) : (
    "✨ Extract Details"
  )}
</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= FLOATING ACTION BUTTON (FORCED BOTTOM RIGHT) ================= */}
      <div 
        style={{ position: 'fixed', bottom: '40px', right: '40px', zIndex: 999999 }} 
        className="flex flex-col items-end"
      >
        {showUploadOptions && (
          <div className="flex flex-col gap-3 mb-5 items-end animate-in fade-in slide-in-from-bottom-5 duration-300">
            <button
              onClick={() => { setUploadMode('image'); setShowSmartUpload(true); setShowUploadOptions(false); }}
              className="bg-white text-black shadow-2xl rounded-2xl px-6 py-4 w-64 text-left font-bold flex items-center gap-4 border border-gray-100 hover:bg-white transition-all"
            >
              <span className="bg-blue-50 p-2 rounded-xl text-lg">📷</span> 
              <div className="flex flex-col">
                <span className="text-sm">Image</span>
                <span className="text-[10px] text-gray-700 md:text-gray-400 uppercase font-bold">Extract from Pic</span>
              </div>
            </button>
            <button
              onClick={() => { setUploadMode('text'); setShowSmartUpload(true); setShowUploadOptions(false); }}
              className="bg-white text-black shadow-2xl rounded-2xl px-6 py-4 w-64 text-left font-bold flex items-center gap-4 border border-gray-100 hover:bg-white transition-all"
            >
              <span className="bg-green-50 p-2 rounded-xl text-lg">📄</span>
              <div className="flex flex-col">
                <span className="text-sm">Text</span>
                <span className="text-[10px] text-gray-700 md:text-gray-400 uppercase font-bold">Paste & Summarize</span>
              </div>
            </button>
            <button
              onClick={() => { setUploadMode('url'); setShowSmartUpload(true); setShowUploadOptions(false); }}
              className="bg-white text-black shadow-2xl rounded-2xl px-6 py-4 w-64 text-left font-bold flex items-center gap-4 border border-gray-100 hover:bg-white transition-all"
            >
              <span className="bg-purple-50 p-2 rounded-xl text-lg">🌐</span>
              <div className="flex flex-col">
                <span className="text-sm">Link</span>
                <span className="text-[10px] text-gray-700 md:text-gray-400 uppercase font-bold">Import from URL</span>
              </div>
            </button>
          </div>
        )}

        <button
          onClick={() => setShowUploadOptions(!showUploadOptions)}
          className={`bg-black text-white rounded-full px-8 py-5 shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-90 ${showUploadOptions ? 'bg-red-500 scale-90' : 'hover:scale-105'}`}
        >
          <span className="text-2xl">{showUploadOptions ? '✕' : '🧠'}</span>
          <span className="font-bold text-lg tracking-tight">Smart Job Upload</span>
        </button>
      </div>
    </>
  );
}







