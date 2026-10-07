// @ts-nocheck
"use client";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import ImageUploader from "@/components/ImageUploader";
import { useState } from "react";
import { useEffect } from "react";
import {
  EXPERIENCE_OPTIONS,
  SALARY_OPTIONS,
} from "@/app/constants/jobFilters"
import Autocomplete from "@/components/Autocomplete";

export default function AddJobPage() {
const [jobId, setJobId] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = new URLSearchParams(window.location.search).get("id");
      if (id) setJobId(id);
    }
  }, []);
const [initialJobIds, setInitialJobIds] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  
  // Lock #1: Tab Close & Refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Lock #2: Next.js Link Clicks (Sidebar)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!hasUnsavedChanges) return;
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && anchor.href && !anchor.target && !anchor.hasAttribute('download')) {
        try {
          const currentUrl = new URL(window.location.href);
          const targetUrl = new URL(anchor.href);
          if (currentUrl.pathname !== targetUrl.pathname) {
            if (!window.confirm("You have unsaved changes. Are you sure you want to leave without saving?")) {
              e.preventDefault();
              e.stopPropagation();
            }
          }
        } catch(err) {}
      }
    };
    document.addEventListener('click', handleClick, { capture: true });
    return () => document.removeEventListener('click', handleClick, { capture: true });
  }, [hasUnsavedChanges]);

  // Lock #3: Browser Back/Forward Buttons (SPA Navigation)
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handlePopState = (e: PopStateEvent) => {
      if (!window.confirm("You have unsaved changes. Are you sure you want to leave without saving?")) {
        // Push a state back on to trap the user
        window.history.pushState(null, "", window.location.href);
      }
    };
    
    // We add a dummy state when it becomes dirty so the first 'back' click is intercepted safely
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedChanges]);




  const router = useRouter();

  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [isCompanyProfileDirty, setIsCompanyProfileDirty] = useState(false);

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
const [companyAddress, setCompanyAddress] = useState("");
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

const [loadingAI, setLoadingAI] = useState<string | boolean>(false);
  const [showAiSettings, setShowAiSettings] = useState(false);
  const [apiKeys, setApiKeys] = useState<string[]>(['', '', '', '', '']);
  const [keyStatuses, setKeyStatuses] = useState<string[]>(['Ready', 'Ready', 'Ready', 'Ready', 'Ready']);

  useEffect(() => {
    const saved = localStorage.getItem('ti2a_api_keys');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const padded = [...parsed, '', '', '', '', ''].slice(0, 5);
          setApiKeys(padded);
        }
      } catch(e) {}
    }
  }, []);

  const saveApiKeys = (newKeys: string[]) => {
    setApiKeys(newKeys);
    setKeyStatuses(['Ready', 'Ready', 'Ready', 'Ready', 'Ready']);
    localStorage.setItem('ti2a_api_keys', JSON.stringify(newKeys));
  };
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
  setCompanyAddress(data.address || "");
    setCompanyDescription(data.description || "");
  setCompanyWebsite(data.website || "");
  setCompanyEmail(data.email || "");
  setCompanyPhone(data.phone || "");
  setCompanyFacebook(data.facebook || "");
  setCompanyInstagram(data.instagram || "");
  setCompanyLinkedin(data.linkedin || "");
    setCompanyWhatsapp(data.whatsapp || "");
    setCompanyTwitter(data.twitter || "");
  setPrincipalArchitect(data.principal_architect || "");
  setEmployeeSize(data.employee_size || "");
  setFoundedYear(data.founded_year?.toString() || "");
};

const [area, setArea] = useState("");

  const [country, setCountry] = useState("India");
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
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [positions, setPositions] = useState([{position: "", role: "", experience: [], salary: "", description: "", qualifications: "", skills: [], completed: false}]);
const [sameRequirements, setSameRequirements] = useState(true);
const updatePosition = (index, field, value) => { setHasUnsavedChanges(true); 
  const newPositions = [...positions];
  newPositions[index][field] = value;
  setPositions(newPositions);
};
const addPosition = () => {
  setPositions([...positions, {position: "", role: "", experience: [], salary: "", description: "", qualifications: "", skills: [], completed: false}]);
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
    setIsCompanyProfileDirty(true);
  }, [companyAddress, companyLogo, companyDescription, companyWebsite, companyEmail, companyPhone, companyFacebook, companyInstagram, companyLinkedin, companyTwitter, companyWhatsapp, principalArchitect, employeeSize, foundedYear, organizationType, area, city, state]);

  // Removed obsolete loadCompanies since we now use dynamic Autocomplete.

  useEffect(() => {

  if (!jobId) return;

  const fetchJob = async () => {
      const { data: job, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .single();
  
      if (error) {
        console.log(error);
        return;
      }
  
      if (job) {
        let query = supabase.from("jobs").select("*")
          .eq("firm_name", job.firm_name)
          .eq("status", job.status);
        
        if (job.posted_date) query = query.eq("posted_date", job.posted_date);
        else query = query.is("posted_date", null);
  
        if (job.image) query = query.eq("image", job.image);
        
        const { data: siblings } = await query;
        const validSiblings = siblings && siblings.length > 0 ? siblings : [job];
        setInitialJobIds(validSiblings.map(s => s.id));
  
        setFirmName(job.firm_name || "");
        setImageUrl(job.image || "");

        if (job.application_email && job.application_email.trim() !== "") {
            setApplicationType("email");
            setapplication_email(job.application_email);
            setapply_link(job.apply_link || "");
        } else if (job.apply_link && job.apply_link.trim() !== "") {
            setApplicationType("apply");
            setapply_link(job.apply_link);
            setapplication_email("");
        } else {
            setApplicationType("apply");
            setapply_link("");
            setapplication_email("");
        }
          
          if (job.firm_name || job.company_id) {
            let comp = null;
            if (job.company_id) {
              const { data } = await supabase.from("companies").select("*").eq("id", job.company_id).maybeSingle();
              comp = data;
            }
            if (!comp && job.firm_name) {
              const { data } = await supabase.from("companies").select("*").ilike("firm_name", job.firm_name).maybeSingle();
              comp = data;
            }
            if (comp) {
               setSelectedCompanyId(comp.id);
               setCompanyLogo(comp.logo_url || "");
               setCompanyAddress(comp.address || "");
               setCompanyDescription(comp.description || "");
               setCompanyWebsite(comp.website || "");
               setCompanyEmail(comp.email || "");
               setCompanyPhone(comp.phone || "");
               setCompanyFacebook(comp.facebook || "");
               setCompanyInstagram(comp.instagram || "");
               setCompanyLinkedin(comp.linkedin || "");
               setCompanyWhatsapp(comp.whatsapp || "");
               setCompanyTwitter(comp.twitter || "");
               setPrincipalArchitect(comp.principal_architect || "");
               setEmployeeSize(comp.employee_size?.toString() || "");
               setFoundedYear(comp.founded_year?.toString() || "");
               setTimeout(() => setIsCompanyProfileDirty(false), 200);
               setTimeout(() => setHasUnsavedChanges(false), 500);
            }
          }
  
        if (job.employment_type) setEmploymentType(job.employment_type);
        if (job.workplace_type) setWorkplaceType(job.workplace_type);
        setOrganizationType(job.organization_type || "Firm");
        setArea(job.area || "");
        setCity(job.city || "");
        setState(job.state || "");
        setSource(job.source || "");
  
        let distinctReqs = false;
        if (validSiblings.length > 1) {
            const firstQual = Array.isArray(validSiblings[0].qualifications) ? validSiblings[0].qualifications.join(", ") : (validSiblings[0].qualifications || "");
            const firstSkills = JSON.stringify(Array.isArray(validSiblings[0].skills_required) ? validSiblings[0].skills_required : (validSiblings[0].skills_required ? [validSiblings[0].skills_required] : []));
            for (let i = 1; i < validSiblings.length; i++) {
                const q = Array.isArray(validSiblings[i].qualifications) ? validSiblings[i].qualifications.join(", ") : (validSiblings[i].qualifications || "");
                const s = JSON.stringify(Array.isArray(validSiblings[i].skills_required) ? validSiblings[i].skills_required : (validSiblings[i].skills_required ? [validSiblings[i].skills_required] : []));
                if (q !== firstQual || s !== firstSkills) {
                    distinctReqs = true;
                    break;
                }
            }
        }
        if (distinctReqs) setSameRequirements(false);

        setPositions(validSiblings.map(s => {
           let rRole = "";
           let rDesc = s.job_description || "";
           if (rDesc.startsWith("**Job Role:**")) {
             const lines = rDesc.split("\n\n");
             if (lines.length > 1) {
               rRole = lines[0].replace("**Job Role:**", "").trim();
               rDesc = lines.slice(1).join("\n\n");
             }
           }
           
           let rVacancies = "";
           if (rDesc.includes("**Number of Positions:**")) {
               const lines = rDesc.split("\n\n");
               const vLine = lines.find(l => l.startsWith("**Number of Positions:**"));
               if (vLine) {
                   rVacancies = vLine.replace("**Number of Positions:**", "").trim();
                   rDesc = lines.filter(l => !l.startsWith("**Number of Positions:**")).join("\n\n");
               }
           }

           return {
             id: s.id,
             position: s.position || "",
             role: rRole,
             vacancies: rVacancies,
             salary: s.salary || "",
             description: rDesc,
             experience: Array.isArray(s.experience) ? s.experience : (s.experience ? [s.experience] : []),
             qualifications: Array.isArray(s.qualifications) ? s.qualifications.join(", ") : (s.qualifications || ""), 
             skills: Array.isArray(s.skills_required) ? s.skills_required : (s.skills_required ? [s.skills_required] : []),
             completed: false
           };
        }));
  
        setQualifications(Array.isArray(job.qualifications) ? job.qualifications : (job.qualifications ? [job.qualifications] : []));
        setSkills(Array.isArray(job.skills_required) ? job.skills_required : (job.skills_required ? [job.skills_required] : []));
        setPostedDate(job.posted_date || "");
        setLastDateToApply(job.last_date_to_apply || "");
        setPostExpiryDate(job.post_expiry_date || "");
        
        
        // email logic hoisted
  
        if (job.status === "scheduled" && job.posted_date) {
           const d = new Date(job.posted_date);
           if (!isNaN(d.getTime())) {
               const tzOffset = d.getTimezoneOffset() * 60000;
               const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, -1);
               const parts = localISOTime.split("T");
               setScheduleDate(parts[0]);
               setScheduleTime(parts[1].substring(0, 5));
           }
        }
        setTimeout(() => setHasUnsavedChanges(false), 500);
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
    setShowSchedule(false);
  };


  const [isSavingCompany, setIsSavingCompany] = useState(false);

  const handleSaveCompany = async (e?: any) => {
    if (e) e.preventDefault();
    if (!firmName) {
      alert("Organization name is required to save company details.");
      return;
    }
    setIsSavingCompany(true);
    try {
              let authorId = (await supabase.auth.getUser()).data.user?.id;
        if (!authorId) {
          const activeUser = JSON.parse(localStorage.getItem("currentUser") || "null");
          authorId = activeUser?.id || null;
          if (!authorId && activeUser) {
             const lookupVal = activeUser.username || activeUser.email;
             const lookupField = activeUser.username ? "username" : "email";
             if (lookupVal) {
               const { data: cp } = await supabase.from("profiles").select("id").eq(lookupField, lookupVal).maybeSingle();
               if (cp) authorId = cp.id;
             }
          }
        }
        
        const companyPayload = {
        firm_name: firmName.trim(),
        city: city || "",
        state: state || "",
        neighborhood: area || "",
        organization_type: organizationType || "Firm",
        logo_url: companyLogo || "",
        description: companyDescription || "",
        website: companyWebsite || "",
        email: companyEmail || "",
        phone: companyPhone || "",
        facebook: companyFacebook || "",
        instagram: companyInstagram || "",
        linkedin: companyLinkedin || "",
        whatsapp: companyWhatsapp || "",
        twitter: companyTwitter || "",
        principal_architect: principalArchitect || "",
        employee_size: employeeSize || null,
        founded_year: foundedYear ? parseInt(foundedYear) : null
      };

      if (selectedCompanyId) {
        const { error } = await supabase.from("companies").update(companyPayload).eq("id", selectedCompanyId);
        if (error) throw error;
        alert("Company details updated successfully!");
        setIsCompanyProfileDirty(false);
      } else {
        const { data: existingCompany } = await supabase.from("companies").select("id").ilike("firm_name", firmName.trim()).maybeSingle();
        if (existingCompany) {
           const { error } = await supabase.from("companies").update(companyPayload).eq("id", existingCompany.id);
           if (error) throw error;
           setSelectedCompanyId(existingCompany.id);
           alert("Company details updated successfully!");
           setIsCompanyProfileDirty(false);
        } else {
           const companySlug = firmName.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
           const { data: newComp, error } = await supabase.from("companies").insert([
             { ...companyPayload, slug: companySlug, created_by: authorId, is_active: status === "published" }
           ]).select().single();
           if (error) throw error;
           if (newComp) setSelectedCompanyId(newComp.id);
           alert("Company created and saved successfully!");
           setIsCompanyProfileDirty(false);
        }
      }
    } catch (err) {
      console.error("Error saving company:", err);
      alert("Failed to save company details: " + (err.message || err.details || err.hint || JSON.stringify(err)));
    } finally {
      setIsSavingCompany(false);
    }
  };

const handlePublishJob = async (
  status: "draft" | "scheduled" | "published" = "published"
) => {
  setActionLoading(status);

  try {
              let authorId = (await supabase.auth.getUser()).data.user?.id;
        if (!authorId) {
          const activeUser = JSON.parse(localStorage.getItem("currentUser") || "null");
          authorId = activeUser?.id || null;
          if (!authorId && activeUser) {
             const lookupVal = activeUser.username || activeUser.email;
             const lookupField = activeUser.username ? "username" : "email";
             if (lookupVal) {
               const { data: cp } = await supabase.from("profiles").select("id").eq(lookupField, lookupVal).maybeSingle();
               if (cp) authorId = cp.id;
             }
          }
        }
      let currentCompanyId = selectedCompanyId;

    if (firmName) {
      const companyPayload = {
          firm_name: firmName,
          city: city,
          state: state,
          neighborhood: area,
          organization_type: organizationType,
          logo_url: companyLogo,
          description: companyDescription,
          website: companyWebsite,
          email: companyEmail,
          phone: companyPhone,
          facebook: companyFacebook,
          instagram: companyInstagram,
          linkedin: companyLinkedin,
          whatsapp: companyWhatsapp,
          twitter: companyTwitter,
          principal_architect: principalArchitect,
          employee_size: employeeSize || null,
          founded_year: foundedYear ? parseInt(foundedYear) : null
        };

      if (currentCompanyId) {
        if (isCompanyProfileDirty) {
          await supabase.from("companies").update(companyPayload).eq("id", currentCompanyId);
          setIsCompanyProfileDirty(false);
        }
      } else {
        const { data: existingCompany } = await supabase
          .from("companies")
          .select("id")
          .ilike("firm_name", firmName.trim())
          .maybeSingle();

        if (!existingCompany) {
          const companySlug = firmName.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
          const { data: newComp } = await supabase.from("companies").insert([
            { ...companyPayload, slug: companySlug, created_by: authorId }
          ]).select().single();
          if (newComp) currentCompanyId = newComp.id;
        } else {
          currentCompanyId = existingCompany.id;
          if (isCompanyProfileDirty) {
            await supabase.from("companies").update(companyPayload).eq("id", currentCompanyId);
            setIsCompanyProfileDirty(false);
          }
        }
      }
    }

    if (status !== "draft") {
      if (uploadingImage) {
        alert("Please wait until image upload finishes");
        setActionLoading(null);
        return;
      }
      if (!imageUrl) {
        alert("Please upload job image");
        setActionLoading(null);
        return;
      }
    }

    if (status === "draft" && (!firmName || !positions[0]?.position)) {
      alert("Please enter at least the Company Name and Job Position to save a draft.");
      setActionLoading(null);
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
      setActionLoading(null);
      return;
    }

    const today = new Date();
    const formattedToday = today.toISOString().split("T")[0];
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 14);
    const formattedExpiry = expiry.toISOString().split("T")[0];

    const finalExpiryDate = postExpiryDate || formattedExpiry;
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
      posted_date: status === "published" ? new Date().toISOString() : (status === "scheduled" ? (scheduleDate && scheduleTime ? new Date(`${scheduleDate}T${scheduleTime}`).toISOString() : scheduleDate) : null),
      last_date_to_apply: lastDateToApply || null,
      post_expiry_date: finalExpiryDate,
      apply_link: applicationType === "apply" ? apply_link : null,
      application_email: applicationType === "email" ? application_email : null,
      source: source,
      image: imageUrl,
      status: status,
      author_id: authorId
    };

    let jobData = null;

    const publicJobs = positions.map(pos => ({
      ...(pos.id ? { id: pos.id } : {}),
      firm_name: firmName,
      company_id: currentCompanyId,
      employment_type: employmentType,
      workplace_type: workplaceType,
      area: area,
      city: city,
      state: state,
      position: pos.position,
      experience: (employmentType === "Internship" || (pos.position && pos.position.toLowerCase().includes("intern"))) ? [] : pos.experience,
      salary: pos.salary,
      job_description: [pos.role ? `**Job Role:** ${pos.role}` : "", pos.vacancies ? `**Number of Positions:** ${pos.vacancies}` : "", pos.description].filter(Boolean).join("\n\n"),
      qualifications: sameRequirements 
          ? (Array.isArray(qualifications) ? qualifications : (qualifications ? [qualifications] : []))
          : (Array.isArray(pos.qualifications) ? pos.qualifications : (pos.qualifications ? [pos.qualifications] : (qualifications ? (Array.isArray(qualifications) ? qualifications : [qualifications]) : []))),
      skills_required: sameRequirements ? skills : (pos.skills || skills),
      posted_date: status === "published" ? new Date().toISOString() : (status === "scheduled" ? (scheduleDate && scheduleTime ? new Date(`${scheduleDate}T${scheduleTime}`).toISOString() : scheduleDate) : null),
      last_date_to_apply: lastDateToApply || null,
      post_expiry_date: finalExpiryDate,
      apply_link: applicationType === "apply" ? apply_link : null,
      application_email: applicationType === "email" ? application_email : null,
      source: source,
      image: imageUrl,
      status: status,
      author_id: authorId
    }));

    if (jobId) {
      // First, delete any siblings that were removed from the UI
      const currentIds = publicJobs.map(p => p.id).filter(Boolean);
      const toDelete = initialJobIds.filter(id => !currentIds.includes(id));
      if (toDelete.length > 0) {
        await supabase.from("jobs").delete().in("id", toDelete);
      }
      
      // Upsert the entire batch (inserts new ones without IDs, updates existing ones with IDs)
      const { data, error } = await supabase.from("jobs").upsert(publicJobs).select();
      if (error) throw error;
        jobData = data && data.length > 0 ? data[0] : null;
        if (data) {
           const updatedPositions = positions.map((p, i) => ({ ...p, id: data[i]?.id || p.id }));
           setPositions(updatedPositions);
           setInitialJobIds(data.map(d => d.id));
        }
      } else {
        const { data, error } = await supabase.from("jobs").insert(publicJobs).select();
        if (error) throw error;
        jobData = data && data.length > 0 ? data[0] : null;
        if (data) {
           const updatedPositions = positions.map((p, i) => ({ ...p, id: data[i]?.id || p.id }));
           setPositions(updatedPositions);
           setInitialJobIds(data.map(d => d.id));
        }
      }

    if (jobData && jobData.id) { setHasUnsavedChanges(false); 
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
        router.push("/admin/jobs");
      }
    }
  } catch (err) {
    console.error("SUPABASE ERROR:", err);
    alert(JSON.stringify(err.message || err));
  }
  
  setActionLoading(null);
};

const handleSmartExtraction = async () => {

};

  return (
    <>

    <main className="min-h-screen bg-white text-black relative overflow-visible">

        <Navbar />

        <section className="w-full px-6 lg:px-12 py-8" onChangeCapture={() => setHasUnsavedChanges(true)}>

          {/* PAGE TITLE */}

<div className="flex justify-between items-start mb-6">

  <div>

    <h1 className="text-3xl font-bold">
      Add New Job
    </h1>

    <p className="text-gray-600 mt-2">
      Publish and manage job opportunities.
    </p>

  </div>

  <button type="button"
    onClick={() => { if (hasUnsavedChanges) { if (!window.confirm("You have unsaved changes. Are you sure you want to leave without saving?")) return; } router.push("/admin"); }}
    className="bg-black text-white px-5 py-3 rounded-xl hover:bg-gray-800 transition flex items-center gap-2 shrink-0"
  >
    ← Back to Dashboard
  </button>

</div>


          {/* FORM CONTAINER */}

            {/* BASIC DETAILS */}

            <div>

              <h2 className="text-lg font-bold mb-3 border-b border-gray-100 pb-2">
                Basic Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* ORGANIZATION TYPE */}

<div>

  <label className="block mb-1.5 text-sm font-medium">
    Organization Type
  </label>

  <button type="button" onClick={() => setShowAiSettings(true)} className="text-xs bg-gray-100 px-3 py-1.5 rounded-lg font-bold text-gray-600 hover:bg-gray-200 transition-colors">?? API Config</button>
                </div>
                <p className="text-black text-xs mb-6 uppercase tracking-widest font-bold">Extraction Mode</p>

                <div className="flex-1 flex flex-col justify-center overflow-hidden">
                  {uploadMode === 'image' && (
                    <div className="w-full">
                      {!smartImage ? (
                        <label className="border-2 border-dashed border-gray-200 rounded-[2rem] p-6 flex flex-col items-center justify-center bg-white hover:border-black cursor-pointer transition-all h-[40vh] min-h-[200px] max-h-[350px]">
                          <span className="text-4xl mb-3">🖼️</span>
                          <span className="text-[10px] font-bold text-black md:text-black uppercase tracking-widest text-center">Upload your image</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setSmartImage(file);
                              if (file) setPreviewUrl(URL.createObjectURL(file));
                              else setPreviewUrl(null);
                            }} 
                          />
                        </label>
                      ) : (
                        <div className="relative w-full h-[40vh] min-h-[200px] max-h-[350px] rounded-[2rem] overflow-hidden border bg-gray-100 flex items-center justify-center shadow-inner">
                          <img 
                            src={previewUrl || ""} 
                            alt="Selected" 
                            className="w-full h-full object-contain p-2" 
                          />
                          <button type="button" 
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

                <button type="button"
  disabled={loadingAI === "loading"}
    onClick={async () => {
    try {
      setLoadingAI("loading");

      if (uploadMode === "image" && smartImage) {
          if (smartImage.size > 4 * 1024 * 1024) {
            throw new Error("Image is too large (over 4MB). Please compress it before uploading to avoid server timeouts.");
          }
        try {
          const extMatch = smartImage.name.match(/\.[0-9a-z]+$/i);
          const ext = extMatch ? extMatch[0].toLowerCase() : '';
          const fileName = `smart-upload-${Date.now()}${ext}`;
          const { data, error } = await supabase.storage.from("job-images").upload(fileName, smartImage);
          if (!error) {
             const { data: { publicUrl } } = supabase.storage.from("job-images").getPublicUrl(fileName);
             setImageUrl(publicUrl);
          } else {
             console.error("Smart image upload failed", error);
          }
        } catch (e) {
          console.error("Storage error:", e);
        }
      }

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

      const userGeminiKey = localStorage.getItem("admin_gemini_key");
        
        const headers: any = {};
        if (userGeminiKey) {
          headers["x-user-gemini-key"] = userGeminiKey;
        }

                const validKeys = apiKeys.filter(k => typeof k === 'string' && k.trim().length > 0);
        let result = null;
        let lastError = null;
        
        if (validKeys.length > 0) {
          const newStatuses = [...keyStatuses];
          for (let i = 0; i < apiKeys.length; i++) {
            const key = apiKeys[i];
            if (typeof key !== 'string' || !key.trim()) continue;
            
            headers["x-user-gemini-key"] = key.trim();
            try {
              const res = await fetch("/api/extract-job", { headers, method: "POST", body: formData });
              let data;
              try { data = await res.json(); } catch(e) { throw new Error("Timeout. Try a smaller screenshot."); }
              
              if (!res.ok) {
                if (data.error && data.error.toLowerCase().includes("quota")) {
                  newStatuses[i] = "Quota Exceeded";
                  setKeyStatuses([...newStatuses]);
                  continue; 
                }
                if (data.error && data.error.toLowerCase().includes("busy")) {
                  newStatuses[i] = "Server Busy";
                  setKeyStatuses([...newStatuses]);
                  continue; 
                }
                throw new Error(data.error || "Failed to extract");
              }
              
              result = data;
              newStatuses[i] = "Success";
              setKeyStatuses([...newStatuses]);
              break; 
            } catch(e: any) {
              lastError = e.message;
            }
          }
        } else {
          const res = await fetch("/api/extract-job", { headers, method: "POST", body: formData });
          let data;
          try { data = await res.json(); } catch(e) { throw new Error("Timeout. Try a smaller screenshot."); }
          if (!res.ok) throw new Error(data.error || "Failed to extract");
          result = data;
        }
        
        if (!result) throw new Error(lastError || "All configured API keys failed or ran out of quota. Please check the API Config.");

            const ai = typeof result.result === "string" ? JSON.parse(result.result) : (result.result || result);
            setHasUnsavedChanges(true);

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

      if (ai.positions && Array.isArray(ai.positions) && ai.positions.length > 0) {
        let hasDistinctRequirements = false;
        if (ai.positions.length > 1) {
          const firstQual = ai.positions[0].qualifications || "";
          const firstSkills = JSON.stringify(ai.positions[0].skills || []);
          for (let i = 1; i < ai.positions.length; i++) {
            if (ai.positions[i].qualifications !== firstQual || JSON.stringify(ai.positions[i].skills || []) !== firstSkills) {
              hasDistinctRequirements = true;
              break;
            }
          }
        }
        if (hasDistinctRequirements) setSameRequirements(false);

        
        const parseExperience = (rawExp) => {
          if (!rawExp) return [];
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
          if (matched.size === 0) matched.add("Not disclosed");
          return Array.from(matched);
        };

        setPositions(ai.positions.map((p, index) => {
          // IMPORTANT: Preserve existing job ID if replacing an already saved position!
          // We use a functional state update to guarantee we access the latest positions safely,
          // but since this is an async closure, we map from the current positions array in scope.
          const existingId = positions[index] ? positions[index].id : undefined;
          return {
            ...(existingId ? { id: existingId } : {}),
            position: p.position || p.job_title || "",
          role: p.role || "",
          experience: Array.isArray(p.experience) ? p.experience : (p.experience ? [p.experience] : []),
          salary: p.salary || "",
          description: p.description || p.job_description || (index === 0 ? ai.description : "") || "",
          qualifications: p.qualifications || "",
          skills: p.skills || [],
          skill_input: "",
          completed: false
        };
      }));
      } else {
        setPositions([{
          position: ai.position || ai.job_title || "",
          role: ai.role || "",
          experience: Array.isArray(ai.experience) ? ai.experience : (ai.experience ? [ai.experience] : []),
          salary: ai.salary || "",
          description: ai.description || ai.job_description || "",
          qualifications: ai.qualifications || "",
          skills: ai.skills || [],
          skill_input: "",
          completed: false
        }]);
      }

      setLastDateToApply(ai.deadline || ai.application_deadline || "");

      if (ai.applicationEmail || ai.email) setapplication_email(ai.applicationEmail || ai.email || "");
      if (ai.apply_link) setapply_link(ai.apply_link);
      
      if (ai.phone) setCompanyPhone(ai.phone);
      if (ai.whatsapp) setCompanyWhatsapp(ai.whatsapp);
      if (ai.website) setCompanyWebsite(ai.website);
      if (ai.email) setCompanyEmail(ai.email);
      if (ai.facebook) setCompanyFacebook(ai.facebook);
      if (ai.instagram) setCompanyInstagram(ai.instagram);
      if (ai.linkedin) setCompanyLinkedin(ai.linkedin);
      if (ai.twitter) setCompanyTwitter(ai.twitter);
      if (ai.principalArchitect) setPrincipalArchitect(ai.principalArchitect);
      if (ai.employeeSize) setEmployeeSize(ai.employeeSize);
      if (ai.foundedYear) setFoundedYear(ai.foundedYear);
      if (ai.organization_type) setOrganizationType(ai.organization_type);

      setLoadingAI("done");

    } catch (err) {
      console.error(err);
      alert(err.message || "Extraction Failed");
      setLoadingAI(false);
    }
  }}
  className={`mt-6 w-full py-5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
    loadingAI === "loading"
      ? "bg-white text-black md:text-black"
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
            <button type="button"
              onClick={() => { setUploadMode('image'); setShowSmartUpload(true); setShowUploadOptions(false); }}
              className="bg-white text-black shadow-2xl rounded-xl px-6 py-4 w-64 text-left font-bold flex items-center gap-4 border border-gray-100 hover:bg-white transition-all"
            >
              <span className="bg-blue-50 p-2 rounded-xl text-lg">📷</span> 
              <div className="flex flex-col">
                <span className="text-sm">Image</span>
                <span className="text-[10px] text-black md:text-black uppercase font-bold">Extract from Pic</span>
              </div>
            </button>
            <button type="button"
              onClick={() => { setUploadMode('text'); setShowSmartUpload(true); setShowUploadOptions(false); }}
              className="bg-white text-black shadow-2xl rounded-xl px-6 py-4 w-64 text-left font-bold flex items-center gap-4 border border-gray-100 hover:bg-white transition-all"
            >
              <span className="bg-green-50 p-2 rounded-xl text-lg">📄</span>
              <div className="flex flex-col">
                <span className="text-sm">Text</span>
                <span className="text-[10px] text-black md:text-black uppercase font-bold">Paste & Summarize</span>
              </div>
            </button>
            <button type="button"
              onClick={() => { setUploadMode('url'); setShowSmartUpload(true); setShowUploadOptions(false); }}
              className="bg-white text-black shadow-2xl rounded-xl px-6 py-4 w-64 text-left font-bold flex items-center gap-4 border border-gray-100 hover:bg-white transition-all"
            >
              <span className="bg-purple-50 p-2 rounded-xl text-lg">🌐</span>
              <div className="flex flex-col">
                <span className="text-sm">Link</span>
                <span className="text-[10px] text-black md:text-black uppercase font-bold">Import from URL</span>
              </div>
            </button>
          </div>
        )}

        <button type="button"
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









