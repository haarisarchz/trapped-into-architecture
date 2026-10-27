// @ts-nocheck
"use client";
import AdminQuickMenu from "@/components/admin/AdminQuickMenu";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import ImageUploader from "@/components/ImageUploader";
import { useState } from "react";
import { useEffect } from "react";
import ApiServerManager from "@/components/ApiServerManager";
import { AlertCircle } from "lucide-react";
import { findMatchingCompany, MatchResult } from "@/utils/companyMatcher";


const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDimension = 1600;
        
        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressed = new File([blob], file.name, { type: "image/jpeg", lastModified: Date.now() });
              resolve(compressed);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          0.7
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

import {
  EXPERIENCE_OPTIONS,
  SALARY_OPTIONS,
} from "@/app/constants/jobFilters"
import Autocomplete from "@/components/Autocomplete";
import { AdminExperienceSlider, AdminSalarySlider } from "@/components/AdminSliderInputs";

const AI_PROMPT_TEMPLATE = `Please extract all architectural job vacancy details from this image/flyer into the exact "Heading: Answer" format.

CRITICAL INSTRUCTION:
There are two sections. Write the Studio & Contact details ONLY ONCE in Section 1. Do NOT repeat Firm Name, City, State, Address, Email, or Phone for each position!

SECTION 1: STUDIO & CONTACT DETAILS (Write this ONCE at the top. Never repeat under positions):
Firm Name: [Studio / Company name]
City: [Job city location]
State: [State in India, e.g. Tamil Nadu, Karnataka, Maharashtra, etc.]
Workplace Type: [On-site / Hybrid / Remote]
Employment Type: [Default employment type, e.g. Full-time / Internship]
Application Email: [Email address to send applications/portfolios to]
(Include the following ONLY if clearly mentioned in the flyer; otherwise omit heading entirely):
Studio Address: [Office or street address if given]
Phone: [Contact phone number if given]
WhatsApp: [WhatsApp number if given]
Studio Website: [Website URL if given]
Last Date to Apply: [Deadline in YYYY-MM-DD if given]
Organization Type: [MUST strictly be one of: Architecture Firm / Interior Design Studio / Architecture & Interior Design / Landscape & Urban Design / Construction & Development / Institution / Academic]
Principal Architect: [Lead architect name if given]

SECTION 2: OPEN POSITIONS (List each vacancy with ONLY its position-specific details):
For every position advertised in the flyer, output:
Position: [Exact job title, e.g. Junior Architect, 3D Visualizer, Architecture Intern, Civil Engineer]
Role: [Functional focus / what to do on the job, e.g. Site Supervision & Coordination, Architectural Planning & Working Drawings, 3D Rendering & Realistic Visualization, Quantity Estimation & BOQ]
Experience: [Experience required if stated, or Fresher]
Qualifications: [Degrees separated by COMMAS only, e.g. B.Arch, M.Arch or B.E, B.Tech, Diploma in Civil Engineering. Never use slashes '/']
Skills: [Comma-separated software & tools, e.g. AutoCAD, SketchUp, Revit, Lumion, Enscape, V-Ray]
Salary: [Salary range or stipend if stated]
Job Description: [A complete professional summary stating which firm is hiring what position where, qualifications, software skills, and functional role. MUST ALSO include the application and contact instructions at the end (e.g. "Send your CV and portfolio to [Application Email]. Contact / WhatsApp: [Phone/WhatsApp]."). E.g.: "Tamil Architects is hiring an Architect / Junior Architect in Madurai, Tamil Nadu. Candidates should hold a B.Arch, M.Arch with skills in AutoCAD, SketchUp, Revit, and Lumion for architectural planning and working drawings. Interested candidates should send their resume/portfolio to careers@tamilarchitects.com. Contact / WhatsApp: +91 9876543210."]

RULES:
1. Output ONLY in "Heading: Answer" format. Do NOT use JSON, markdown code blocks, or conversational text.
2. NEVER repeat Section 1 fields (Firm Name, City, State, Address, Phone, Email) under each position!
3. If an essential studio field (Firm Name, City, State, Application Email) is missing in the image, keep the heading and leave the answer blank after the colon (e.g. "City: ").
4. If a non-essential field is not found in the flyer, omit the heading completely.
5. In Qualifications, separate different degrees with COMMAS only (e.g. B.Arch, M.Arch). Never combine them with slashes '/'.
6. Role must specify the functional focus / what to do (e.g. Site Supervision, Architectural Planning, 3D Rendering). Job Description must be a complete narrative summary answering which firm is hiring what position where, qualifications, skills, role duties, AND MUST explicitly include application & contact instructions (e.g., "Send CV to [email]. Contact / WhatsApp: [phone/whatsapp]").
7. Organization Type MUST strictly be one of these 6 standard types: Architecture Firm, Interior Design Studio, Architecture & Interior Design, Landscape & Urban Design, Construction & Development, Institution / Academic.`;

function parseJobLocally(rawText: string): any | null {
  if (!rawText || !rawText.trim()) return null;
  const trimmed = rawText.trim();

  // 1. Try JSON parsing (handles raw JSON or markdown code fence if pasted)
  let jsonString = "";
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    jsonString = codeBlockMatch[1].trim();
  } else {
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonString = trimmed.substring(firstBrace, lastBrace + 1);
    }
  }

  if (jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    } catch (e) {
      // JSON syntax error, fallback to Heading: Answer
    }
  }

  // 2. Structured "Heading: Answer" parsing
  const lines = trimmed.split("\n");
  const kvObj: any = {};
  const collectedPositions: any[] = [];
  let currentPos: any = null;

  const keyMap: Record<string, string> = {
    // Studio & Firm
    "firm": "firm_name",
    "firm name": "firm_name",
    "company": "firm_name",
    "company name": "firm_name",
    "studio": "firm_name",
    "studio name": "firm_name",
    "organization type": "organization_type",
    "firm type": "organization_type",
    "company type": "organization_type",
    "principal architect": "principal_architect",
    "lead architect": "principal_architect",
    "founder": "principal_architect",
    "employee size": "employee_size",
    "team size": "employee_size",
    "founded year": "founded_year",
    "established": "founded_year",
    "founded": "founded_year",
    "studio address": "company_address",
    "office address": "company_address",
    "address": "company_address",
    "company description": "company_description",
    "studio description": "company_description",
    "about firm": "company_description",
    "about studio": "company_description",

    // Location
    "city": "city",
    "location": "city",
    "job location": "city",
    "state": "state",
    "area": "area",
    "neighborhood": "area",
    "locality": "area",
    "country": "country",

    // Employment
    "employment type": "employment_type",
    "job type": "employment_type",
    "workplace type": "workplace_type",
    "workplace": "workplace_type",
    "work mode": "workplace_type",
    "work model": "workplace_type",

    // Positions & Roles
    "position": "position",
    "position 1": "position",
    "position 2": "position",
    "position 3": "position",
    "position 4": "position",
    "job title": "position",
    "title": "position",
    "role": "role",
    "specialization": "role",
    "experience": "experience",
    "experience required": "experience",
    "exp": "experience",
    "salary": "salary",
    "pay": "salary",
    "stipend": "salary",
    "ctc": "salary",
    "remuneration": "salary",
    "qualifications": "qualifications",
    "qualification": "qualifications",
    "education": "qualifications",
    "degree": "qualifications",
    "skills": "skills",
    "skills required": "skills",
    "software": "skills",
    "software skills": "skills",
    "job description": "description",
    "description": "description",
    "responsibilities": "description",
    "duties": "description",

    // Application & Contacts
    "application email": "application_email",
    "apply email": "application_email",
    "email to apply": "application_email",
    "send cv to": "application_email",
    "send resume to": "application_email",
    "email": "application_email",
    "apply link": "apply_link",
    "application link": "apply_link",
    "form link": "apply_link",
    "google form": "apply_link",
    "link": "apply_link",
    "phone": "phone",
    "contact": "phone",
    "mobile": "phone",
    "phone number": "phone",
    "contact number": "phone",
    "whatsapp": "whatsapp",
    "whatsapp number": "whatsapp",
    "studio website": "website",
    "website": "website",
    "website link": "website",
    "studio email": "company_email",
    "company email": "company_email",
    "instagram": "instagram",
    "instagram handle": "instagram",
    "insta": "instagram",
    "linkedin": "linkedin",
    "linkedin url": "linkedin",
    "facebook": "facebook",
    "twitter": "twitter",
    "x": "twitter",
    "last date to apply": "deadline",
    "last date": "deadline",
    "deadline": "deadline",
    "apply before": "deadline"
  };

  const posFields = ["position", "role", "experience", "salary", "qualifications", "skills", "description"];

  for (let rawLine of lines) {
    let line = rawLine.trim();
    if (!line) continue;

    // Skip Section header lines like "SECTION 1:", "SECTION 2:", "---", etc.
    if (/^(?:section\s*\d|---+|===+|\*\*\*+|rules:?)/i.test(line)) continue;

    // Strip leading list symbols like - , * , 1. , • , # , etc.
    line = line.replace(/^[-*•#\d\.\)\s]+/, "").trim();

    // Match "Heading: Answer", "**Heading**: Answer", or "Heading - Answer"
    const match = line.match(/^\*{0,2}([\w\s\d]+?)\*{0,2}\s*[:=–—]\s*(.*)$/);
    if (!match) continue;

    const rawHeading = match[1].trim().toLowerCase();
    let val = match[2].trim();

    // Clean surrounding quotes or markdown formatting from value
    val = val.replace(/^["'`*]+|["'`*]+$/g, "").trim();

    // If answer is empty or placeholder like "[Not mentioned]", treat as blank
    if (/^\[?(not specified|not mentioned|not provided|n\/?a|none|nil|-+)\]?$/i.test(val)) {
      val = "";
    }

    const field = keyMap[rawHeading];
    if (!field) continue;

    if (field === "position") {
      if (currentPos && (currentPos.position || currentPos.experience || currentPos.salary)) {
        collectedPositions.push(currentPos);
      }
      currentPos = {
        position: val,
        role: "",
        experience: "",
        salary: "",
        qualifications: "",
        skills: [],
        description: ""
      };
    } else if (posFields.includes(field)) {
      if (!currentPos) {
        currentPos = {
          position: "",
          role: "",
          experience: "",
          salary: "",
          qualifications: "",
          skills: [],
          description: ""
        };
      }
      if (field === "skills") {
        currentPos.skills = val ? val.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
      } else if (field === "qualifications") {
        // Normalize degrees separated by slashes into clean comma separation (e.g. B.Arch / M.Arch -> B.Arch, M.Arch)
        currentPos.qualifications = val ? val.replace(/\s*\/\s*/g, ", ").trim() : "";
      } else {
        currentPos[field] = val;
      }
    } else {
      // Global studio or contact details
      kvObj[field] = val;
    }
  }

  if (currentPos && (currentPos.position || currentPos.experience || currentPos.salary || (currentPos.skills && currentPos.skills.length > 0))) {
    collectedPositions.push(currentPos);
  }

  // Ensure every position has a comprehensive description answering:
  // Which firm is hiring what position where, and what requirements/duties
  const globalFirm = kvObj.firm_name || "The studio";
  const globalLoc = [kvObj.city, kvObj.state].filter(Boolean).join(", ");
  const appEmail = kvObj.application_email || kvObj.email || "";
  const contactArr = [kvObj.phone, kvObj.whatsapp].filter(Boolean);
  const appPhone = contactArr.length > 0 ? contactArr.join(" / ") : "";
  const applyClause = appEmail ? ` Interested candidates can send their resume and portfolio to ${appEmail}.` : "";
  const contactClause = appPhone ? ` Contact / WhatsApp: ${appPhone}.` : "";

  for (const pos of collectedPositions) {
    if (!pos.description) {
      const posTitle = pos.position || "professional";
      const qualPart = pos.qualifications ? ` Candidates should have ${pos.qualifications}.` : "";
      const skillPart = pos.skills && pos.skills.length > 0 ? ` Skills required: ${pos.skills.join(", ")}.` : "";
      const rolePart = pos.role ? ` Core responsibilities: ${pos.role}.` : "";
      pos.description = `${globalFirm} is hiring a ${posTitle}${globalLoc ? ` in ${globalLoc}` : ""}.${qualPart}${skillPart}${rolePart}${applyClause}${contactClause}`;
    } else {
      const needEmail = appEmail && !pos.description.toLowerCase().includes(appEmail.toLowerCase());
      const needPhone = appPhone && !pos.description.includes(appPhone);
      if (needEmail) pos.description += applyClause;
      if (needPhone) pos.description += contactClause;
    }
  }

  if (collectedPositions.length > 0) {
    kvObj.positions = collectedPositions;
  }

  if (kvObj.city && kvObj.city.includes(",")) {
    const parts = kvObj.city.split(",").map((p: string) => p.trim());
    kvObj.city = parts[0];
    if (!kvObj.state && parts[1]) kvObj.state = parts[1];
  }

  if (kvObj.application_email && !kvObj.company_email) {
    kvObj.company_email = kvObj.application_email;
  }
  if (kvObj.company_email && !kvObj.application_email) {
    kvObj.application_email = kvObj.company_email;
  }

  if (kvObj.firm_name || (kvObj.positions && kvObj.positions.length > 0) || kvObj.city || kvObj.application_email || kvObj.company_email) {
    return kvObj;
  }

  return null;
}

const normEmp = (e: any) => {
  if (!e) return "";
  const low = String(e).toLowerCase().replace(/[^a-z]/g, '');
  if (low.includes('full')) return 'Full-time';
  if (low.includes('part')) return 'Part-time';
  if (low.includes('contract')) return 'Contract';
  if (low.includes('temp')) return 'Temporary';
  if (low.includes('free')) return 'Freelance';
  if (low.includes('intern')) return 'Internship';
  return "";
};

const normWork = (w: any) => {
  if (!w) return "";
  const low = String(w).toLowerCase().replace(/[^a-z]/g, '');
  if (low.includes('remot') || low.includes('wfh') || low.includes('home')) return 'Remote / Work from Home';
  if (low.includes('hyb')) return 'Hybrid';
  if (low.includes('site') || low.includes('office')) return 'On-site';
  return "";
};

const formatQualificationsArray = (val: any): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) {
    return Array.from(new Set(val.flatMap(item => String(item).split(/[,/]/).map(s => s.trim()).filter(Boolean))));
  }
  return Array.from(new Set(String(val).split(/[,/]/).map(s => s.trim()).filter(Boolean)));
};

const parseExperience = (rawExp: any): string[] => {
  if (!rawExp) return [];
  if (Array.isArray(rawExp)) {
    const valid = rawExp.map(x => String(x).trim()).filter(x => EXPERIENCE_OPTIONS.includes(x));
    if (valid.length === 1) return valid;
    rawExp = rawExp[0] || "";
  }

  const str = String(rawExp).trim();
  if (!str) return [];

  const exact = EXPERIENCE_OPTIONS.find(opt => opt.toLowerCase() === str.toLowerCase());
  if (exact) return [exact];

  const lower = str.toLowerCase();
  const matched = new Set<string>();

  const isFresher = lower.includes("fresher") || lower.includes("entry level") || lower.includes("no experience");
  
  const rangeMatch = lower.match(/(\d+)\s*(?:-|to)\s*(\d+)/);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1], 10);
    const max = parseInt(rangeMatch[2], 10);

    if (min === 0 && max === 1) {
      if (isFresher) matched.add("Fresher");
      matched.add("0-1 Years");
    } else if (min === 1 && max === 2) {
      matched.add("1-2 Years");
    } else if (min === 2 && max === 4) {
      matched.add("2-4 Years");
    } else if (min === 2 && max === 3) {
      matched.add("2-4 Years");
    } else if (min === 4 && max === 6) {
      matched.add("4-6 Years");
    } else if (min === 6 && max === 10) {
      matched.add("6-10 Years");
    } else {
      if (isFresher && min === 0) matched.add("Fresher");
      if (min <= 0 && max >= 1) matched.add("0-1 Years");
      if (min <= 1 && max >= 2) matched.add("1-2 Years");
      if (min <= 3 && max >= 2 && (min >= 2 || max >= 3)) matched.add("2-4 Years");
      if (min <= 5 && max >= 4 && (min >= 4 || max >= 5)) matched.add("4-6 Years");
      if (min <= 8 && max >= 6 && (min >= 6 || max >= 8)) matched.add("6-10 Years");
      if (max >= 10) matched.add("10+ Years");
    }
  } else {
    const singleMatch = lower.match(/(\d+)\s*(?:\+|\s*years?|\s*yrs?)/) || lower.match(/(?:minimum|min|at least)\s*(\d+)/);
    if (singleMatch) {
      const num = parseInt(singleMatch[1], 10);
      if (num === 0) {
        matched.add("Fresher");
      } else if (num === 1) {
        matched.add("1-2 Years");
      } else if (num >= 2 && num <= 3) {
        matched.add("2-4 Years");
      } else if (num >= 4 && num <= 5) {
        matched.add("4-6 Years");
      } else if (num >= 6 && num <= 9) {
        matched.add("6-10 Years");
      } else if (num >= 10) {
        matched.add("10+ Years");
      }
    } else if (isFresher) {
      matched.add("Fresher");
    }
  }

  if (matched.size === 0) {
    matched.add("Not disclosed");
  }

  return Array.from(matched);
};

export default function AddJobPage() {
const [jobId, setJobId] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = new URLSearchParams(window.location.search).get("id");
      if (id) setJobId(id);
    }
  }, []);
const [initialJobIds, setInitialJobIds] = useState<string[]>([]);
const [initialStatus, setInitialStatus] = useState<string | null>(null);
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
  const [allCompaniesList, setAllCompaniesList] = useState<any[]>([]);
  const [duplicateMatch, setDuplicateMatch] = useState<MatchResult | null>(null);
  const [showDuplicateGateModal, setShowDuplicateGateModal] = useState(false);
  const [pendingPublishStatus, setPendingPublishStatus] = useState<"draft" | "scheduled" | "published" | "save_company" | null>(null);
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

const normalizeOrganizationType = (raw: any): string => {
  if (!raw) return "Architecture Firm";
  const str = String(raw).toLowerCase().trim();
  if (str.includes("interior") && (str.includes("arch") || str.includes("both") || str.includes("&"))) return "Architecture & Interior Design";
  if (str.includes("interior")) return "Interior Design Studio";
  if (str.includes("landscape") || str.includes("urban") || str.includes("planning")) return "Landscape & Urban Design";
  if (str.includes("construct") || str.includes("develop") || str.includes("builder") || str.includes("contractor") || str.includes("real estate")) return "Construction & Development";
  if (str.includes("institution") || str.includes("university") || str.includes("college") || str.includes("academic") || str.includes("school")) return "Institution / Academic";
  return "Architecture Firm";
};

const organizationTypes = [
  "Architecture Firm",
  "Interior Design Studio",
  "Architecture & Interior Design",
  "Landscape & Urban Design",
  "Construction & Development",
  "Institution / Academic",
];

const [organizationType, setOrganizationType] = useState(
  "Architecture Firm"
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
const [promptCopied, setPromptCopied] = useState(false);
const [isLocalExtraction, setIsLocalExtraction] = useState(false);

const [customPrompt, setCustomPrompt] = useState<string>(AI_PROMPT_TEMPLATE);
const [isPromptLocked, setIsPromptLocked] = useState<boolean>(true);
const [showPromptModal, setShowPromptModal] = useState<boolean>(false);
const [promptCopiedInModal, setPromptCopiedInModal] = useState<boolean>(false);
const [currentUserRole, setCurrentUserRole] = useState<string>("");
const canEditPrompt = currentUserRole === "ceo" || currentUserRole === "superadmin";

useEffect(() => {
  const fetchUserRole = async () => {
    try {
      const stored = JSON.parse(localStorage.getItem("currentUser") || "null");
      if (!stored) return;
      const lookupField = stored.username ? "username" : "email";
      const lookupVal = stored.username || stored.email;
      if (!lookupVal) return;
      const { data: prof } = await supabase
        .from("profiles")
        .select("role")
        .eq(lookupField, lookupVal)
        .maybeSingle();
      const r = (prof?.role || stored.role || "").toLowerCase().replace(/[\s_]+/g, "");
      setCurrentUserRole(r);
    } catch (e) {
      console.error("Error fetching user role for prompt control:", e);
    }
  };
  fetchUserRole();
}, []);

useEffect(() => {
  if (currentUserRole && !canEditPrompt) {
    setIsPromptLocked(true);
  }
}, [currentUserRole, canEditPrompt]);
const [showExtractedConfirmModal, setShowExtractedConfirmModal] = useState<boolean>(false);
const [pendingExtractedData, setPendingExtractedData] = useState<any | null>(null);

useEffect(() => {
  if (typeof window !== "undefined") {
    const savedPrompt = localStorage.getItem("ti2a_smart_job_prompt");
    // Migrate to the latest prompt template (checks for signature "Contact / WhatsApp")
    if (savedPrompt && savedPrompt.includes("Contact / WhatsApp") && savedPrompt.trim()) {
      setCustomPrompt(savedPrompt);
    } else {
      setCustomPrompt(AI_PROMPT_TEMPLATE);
      localStorage.setItem("ti2a_smart_job_prompt", AI_PROMPT_TEMPLATE);
    }
    const savedLock = localStorage.getItem("ti2a_smart_job_prompt_locked");
    if (savedLock !== null) {
      setIsPromptLocked(savedLock === "true");
    } else {
      setIsPromptLocked(true);
    }
  }
}, []);

const [smartImage, setSmartImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

const [loadingAI, setLoadingAI] = useState<string | boolean>(false);
  const [showAiSettings, setShowAiSettings] = useState(false);
  const [dbKeys, setDbKeys] = useState<any[]>([]);
  const [selectedServer, setSelectedServer] = useState("auto");
  const [apiKeys, setApiKeys] = useState<string[]>(['', '', '', '', '']);
  const [showKeyPassword, setShowKeyPassword] = useState<boolean[]>([]);
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


  useEffect(() => {
    const fetchApiServers = async () => {
      const { data } = await supabase.from("api_keys").select("*").order("created_at", { ascending: true });
      if (data) {
        setDbKeys(data);
        const personal = data.filter((k: any) => k.type === "personal" && k.key_value && k.key_value.trim());
        if (personal.length > 0) {
          setSelectedServer(personal[0].id);
        } else {
          const shared = data.filter((k: any) => k.type === "shared");
          if (shared.length > 0) setSelectedServer(shared[0].id);
        }
      }
    };
    fetchApiServers();
  }, []);

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

  setOrganizationType(normalizeOrganizationType(data.organization_type));
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

const applyExtractedJobToState = (ai: any) => {
  setHasUnsavedChanges(true);

  const fName = ai.firm_name || ai.company || ai.firm || ai.company_name || "";
  if (fName) setFirmName(fName);

  if (ai.organization_type) setOrganizationType(normalizeOrganizationType(ai.organization_type));
  if (ai.city) setCity(ai.city);
  if (ai.state) setState(ai.state);
  if (ai.area) setArea(ai.area);

  if (ai.employmentType || ai.employment_type) {
    const emp = normEmp(ai.employmentType || ai.employment_type);
    if (emp) setEmploymentType(emp);
  }
  if (ai.workplaceType || ai.workplace_type) {
    const work = normWork(ai.workplaceType || ai.workplace_type);
    if (work) setWorkplaceType(work);
  }

  const globalFirm = fName || "The studio";
  const globalLoc = [ai.city, ai.state].filter(Boolean).join(", ");
  const appEmail = ai.applicationEmail || ai.application_email || ai.email || "";
  const contactArr = [ai.phone, ai.whatsapp].filter(Boolean);
  const appPhone = contactArr.length > 0 ? contactArr.join(" / ") : "";
  const applyClause = appEmail ? ` Interested candidates can send their resume and portfolio to ${appEmail}.` : "";
  const contactClause = appPhone ? ` Contact / WhatsApp: ${appPhone}.` : "";

  if (ai.positions && Array.isArray(ai.positions) && ai.positions.length > 0) {
    let hasDistinctRequirements = false;
    if (ai.positions.length > 1) {
      const firstQual = (ai.positions[0].qualifications || "").replace(/\s*\/\s*/g, ", ").trim();
      const firstSkills = JSON.stringify(ai.positions[0].skills || ai.positions[0].software || []);
      for (let i = 1; i < ai.positions.length; i++) {
        const itemQual = (ai.positions[i].qualifications || "").replace(/\s*\/\s*/g, ", ").trim();
        const itemSkills = JSON.stringify(ai.positions[i].skills || ai.positions[i].software || []);
        if (itemQual !== firstQual || itemSkills !== firstSkills) {
          hasDistinctRequirements = true;
          break;
        }
      }
    }
    if (hasDistinctRequirements) setSameRequirements(false);

    // Sync common requirements state
    const firstPos = ai.positions[0];
    const rawFirstQual = Array.isArray(firstPos.qualifications) 
      ? firstPos.qualifications.join(", ") 
      : (firstPos.qualifications || "");
    const cleanFirstQual = rawFirstQual.replace(/\s*\/\s*/g, ", ").trim();
    if (cleanFirstQual) {
      setQualifications(cleanFirstQual as any);
    }

    const firstSkills = Array.from(new Set([
      ...(Array.isArray(firstPos.skills) ? firstPos.skills : (firstPos.skills ? [firstPos.skills] : [])),
      ...(Array.isArray(firstPos.software) ? firstPos.software : (firstPos.software ? [firstPos.software] : []))
    ]));
    if (firstSkills.length > 0) {
      setSkills(firstSkills);
    }

    setPositions(ai.positions.map((p: any, index: number) => {
      const existingId = positions[index] ? positions[index].id : undefined;
      const posTitle = p.position || p.job_title || p.title || "";
      const rawQual = Array.isArray(p.qualifications) ? p.qualifications.join(", ") : (p.qualifications || "");
      const cleanQual = rawQual.replace(/\s*\/\s*/g, ", ").trim();
      const posSkills = Array.from(new Set([
        ...(Array.isArray(p.skills) ? p.skills : (p.skills ? [p.skills] : [])),
        ...(Array.isArray(p.software) ? p.software : (p.software ? [p.software] : []))
      ]));

      let finalDesc = p.description || p.job_description || (index === 0 ? (ai.description || ai.job_description) : "") || "";
      if (!finalDesc || finalDesc.length < 30) {
        const qualPart = cleanQual ? ` Candidates should hold ${cleanQual}.` : "";
        const skillPart = posSkills.length > 0 ? ` Skills required: ${posSkills.join(", ")}.` : "";
        const rolePart = p.role ? ` Core responsibilities: ${p.role}.` : "";
        finalDesc = `${globalFirm} is hiring a ${posTitle || "professional"}${globalLoc ? ` in ${globalLoc}` : ""}.${qualPart}${skillPart}${rolePart}${applyClause}${contactClause}`;
      } else {
        const needEmail = appEmail && !finalDesc.toLowerCase().includes(appEmail.toLowerCase());
        const needPhone = appPhone && !finalDesc.includes(appPhone);
        if (needEmail) finalDesc += applyClause;
        if (needPhone) finalDesc += contactClause;
      }

      return {
        ...(existingId ? { id: existingId } : {}),
        position: posTitle,
        role: p.role || "",
        experience: Array.isArray(p.experience) && p.experience.length > 0 && typeof p.experience[0] === 'string' && EXPERIENCE_OPTIONS.includes(p.experience[0]) 
          ? p.experience 
          : parseExperience(p.experience),
        salary: p.salary || "",
        description: finalDesc,
        qualifications: cleanQual,
        skills: posSkills,
        skill_input: "",
        completed: false
      };
    }));
  } else if (ai.position || ai.job_title || ai.title) {
    const posTitle = ai.position || ai.job_title || ai.title || "";
    const rawQual = Array.isArray(ai.qualifications) ? ai.qualifications.join(", ") : (ai.qualifications || "");
    const cleanQual = rawQual.replace(/\s*\/\s*/g, ", ").trim();
    const posSkills = Array.from(new Set([
      ...(Array.isArray(ai.skills) ? ai.skills : (ai.skills ? [ai.skills] : [])),
      ...(Array.isArray(ai.software) ? ai.software : (ai.software ? [ai.software] : []))
    ]));

    if (cleanQual) {
      setQualifications(cleanQual as any);
    }
    if (posSkills.length > 0) {
      setSkills(posSkills);
    }

    let finalDesc = ai.description || ai.job_description || "";
    if (!finalDesc || finalDesc.length < 30) {
      const qualPart = cleanQual ? ` Candidates should hold ${cleanQual}.` : "";
      const skillPart = posSkills.length > 0 ? ` Skills required: ${posSkills.join(", ")}.` : "";
      const rolePart = ai.role ? ` Core responsibilities: ${ai.role}.` : "";
      finalDesc = `${globalFirm} is hiring a ${posTitle || "professional"}${globalLoc ? ` in ${globalLoc}` : ""}.${qualPart}${skillPart}${rolePart}${applyClause}${contactClause}`;
    } else {
      const needEmail = appEmail && !finalDesc.toLowerCase().includes(appEmail.toLowerCase());
      const needPhone = appPhone && !finalDesc.includes(appPhone);
      if (needEmail) finalDesc += applyClause;
      if (needPhone) finalDesc += contactClause;
    }

    setPositions([{
      position: posTitle,
      role: ai.role || "",
      experience: Array.isArray(ai.experience) && ai.experience.length > 0 && typeof ai.experience[0] === 'string' && EXPERIENCE_OPTIONS.includes(ai.experience[0])
        ? ai.experience
        : parseExperience(ai.experience),
      salary: ai.salary || "",
      description: finalDesc,
      qualifications: cleanQual,
      skills: posSkills,
      skill_input: "",
      completed: false
    }]);
  }

  if (ai.deadline || ai.application_deadline || ai.last_date_to_apply) {
    setLastDateToApply(ai.deadline || ai.application_deadline || ai.last_date_to_apply || "");
  }

  if (appEmail) {
    setapplication_email(appEmail);
    if (!ai.apply_link && !ai.applyLink) {
      setApplicationType("email");
    }
  }

  const appLink = ai.apply_link || ai.applyLink || ai.link || "";
  if (appLink) {
    setapply_link(appLink);
    setApplicationType("apply");
  }
  
  if (ai.phone) setCompanyPhone(ai.phone);
  if (ai.whatsapp) setCompanyWhatsapp(ai.whatsapp);
  if (ai.website) setCompanyWebsite(ai.website);
  if (ai.company_address || ai.address) setCompanyAddress(ai.company_address || ai.address);
  if (ai.company_description) setCompanyDescription(ai.company_description);

  // Automatically fill email in company section as well
  const compEmail = ai.company_email || ai.companyEmail || ai.email || appEmail || "";
  if (compEmail) {
    setCompanyEmail(compEmail);
  }

  if (ai.facebook) setCompanyFacebook(ai.facebook);
  if (ai.instagram) setCompanyInstagram(ai.instagram);
  if (ai.linkedin) setCompanyLinkedin(ai.linkedin);
  if (ai.twitter) setCompanyTwitter(ai.twitter);
  if (ai.principal_architect || ai.principalArchitect) setPrincipalArchitect(ai.principal_architect || ai.principalArchitect);
  if (ai.employee_size || ai.employeeSize) setEmployeeSize(ai.employee_size || ai.employeeSize);
  if (ai.founded_year || ai.foundedYear) setFoundedYear(String(ai.founded_year || ai.foundedYear));

  // Auto-expand studio details accordion if any studio-specific details are extracted
  if (ai.phone || ai.whatsapp || ai.website || ai.company_address || ai.address || ai.principal_architect || ai.principalArchitect || ai.founded_year || ai.foundedYear || compEmail) {
    setShowCompanyDetails(true);
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
        setInitialStatus(job.status || null);
  
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
        setOrganizationType(normalizeOrganizationType(job.organization_type));
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
      .select("id, firm_name, slug, city, state, logo_url, website, email, phone, organization_type, description, principal_architect, address, neighborhood, facebook, instagram, linkedin, whatsapp, twitter, employee_size, founded_year")
      .neq("status", "trash")
      .order("firm_name");

    if (error) {
      console.log("Error loading companies:", error);
      return;
    }

    if (data) {
      setAllCompaniesList(data);
      setExistingFirms(data.map((company) => company.firm_name));
    }
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
  const safeFirm = firmName ? firmName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '';
  const safePosition = positions[0]?.position ? positions[0]?.position.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '';
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

  let finalUrl = "";
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "/job-images");

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const ikData = await res.json();
      if (ikData.url) finalUrl = ikData.url;
    }
  } catch (ikErr) {
    console.warn("ImageKit upload failed, falling back to Supabase storage:", ikErr);
  }

  if (!finalUrl) {
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

    finalUrl = publicUrl;
  }

  setImageUrl(finalUrl);
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

  const executeSaveCompany = async (overrideCompanyId?: any) => {
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

      const targetCompId = overrideCompanyId || selectedCompanyId;
      if (targetCompId) {
        const { error } = await supabase.from("companies").update(companyPayload).eq("id", targetCompId);
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
           let companySlug = firmName.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
           let insertRes = await supabase.from("companies").insert([
             { ...companyPayload, slug: companySlug, created_by: authorId, is_active: true }
           ]).select().single();

           // If slug collided with another company, append city or random suffix to make it unique
           if (insertRes.error && insertRes.error.code === "23505") {
             const safeSuffix = city ? city.toLowerCase().replace(/\s+/g, "-") : Date.now().toString().slice(-4);
             companySlug = `${companySlug}-${safeSuffix}`;
             insertRes = await supabase.from("companies").insert([
               { ...companyPayload, slug: companySlug, created_by: authorId, is_active: true }
             ]).select().single();
           }

           if (insertRes.error) throw insertRes.error;
           if (insertRes.data) setSelectedCompanyId(insertRes.data.id);
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

  const handleSaveCompany = async () => {
    if (!firmName || !firmName.trim()) {
      alert("Please enter a company name.");
      return;
    }

    // Pre-save duplicate check
    if (!selectedCompanyId) {
      const match = findMatchingCompany(firmName.trim(), allCompaniesList);
      if (match) {
        if (match.isExact) {
          setSelectedCompanyId(match.matchedCompany.id);
          return executeSaveCompany(match.matchedCompany.id);
        } else {
          setDuplicateMatch(match);
          setPendingPublishStatus("save_company");
          setShowDuplicateGateModal(true);
          return;
        }
      }
    }

    return executeSaveCompany();
  };

  const handleConfirmUseExistingStudio = async () => {
    if (!duplicateMatch) return;
    const existing = duplicateMatch.matchedCompany;

    setSelectedCompanyId(existing.id);
    setFirmName(existing.firm_name);
    setOrganizationType(normalizeOrganizationType(existing.organization_type));
    setArea(existing.neighborhood || "");
    setCity(existing.city || "");
    setState(existing.state || "");
    setCountry(existing.country || "India");
    setCompanyLogo(existing.logo_url || "");
    setCompanyAddress(existing.address || "");
    setCompanyDescription(existing.description || "");
    setCompanyWebsite(existing.website || "");
    setCompanyEmail(existing.email || "");
    setCompanyPhone(existing.phone || "");
    setCompanyFacebook(existing.facebook || "");
    setCompanyInstagram(existing.instagram || "");
    setCompanyLinkedin(existing.linkedin || "");
    setCompanyWhatsapp(existing.whatsapp || "");
    setCompanyTwitter(existing.twitter || "");
    setPrincipalArchitect(existing.principal_architect || "");
    setEmployeeSize(existing.employee_size || "");
    setFoundedYear(existing.founded_year?.toString() || "");
    setIsCompanyProfileDirty(false);

    const pending = pendingPublishStatus;
    setShowDuplicateGateModal(false);
    setDuplicateMatch(null);
    setPendingPublishStatus(null);

    if (pending === "save_company") {
      alert(`Linked to existing studio "${existing.firm_name}"!`);
    } else if (pending) {
      executePublishJob(pending, existing.id);
    }
  };

  const handleRejectDuplicate = () => {
    setShowDuplicateGateModal(false);
    setDuplicateMatch(null);
    setPendingPublishStatus(null);
    setActionLoading(null);
    setIsSavingCompany(false);
  };

  const handlePublishJob = async (
    status: "draft" | "scheduled" | "published" = "published"
  ) => {
    // PRE-PUBLISH DUPLICATE GUARD
    if (!selectedCompanyId && firmName && firmName.trim()) {
      const match = findMatchingCompany(firmName.trim(), allCompaniesList);
      if (match) {
        if (match.isExact) {
          setSelectedCompanyId(match.matchedCompany.id);
          return executePublishJob(status, match.matchedCompany.id);
        } else {
          setDuplicateMatch(match);
          setPendingPublishStatus(status);
          setShowDuplicateGateModal(true);
          setActionLoading(null);
          return;
        }
      }
    }

    return executePublishJob(status);
  };

  const executePublishJob = async (
    status: "draft" | "scheduled" | "published" = "published",
    overrideCompanyId?: any
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
      let currentCompanyId = overrideCompanyId || selectedCompanyId;

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
          let companySlug = firmName.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
          let insertRes = await supabase.from("companies").insert([
            { ...companyPayload, slug: companySlug, created_by: authorId, is_active: true }
          ]).select().single();

          if (insertRes.error && insertRes.error.code === "23505") {
            const safeSuffix = city ? city.toLowerCase().replace(/\s+/g, "-") : Date.now().toString().slice(-4);
            companySlug = `${companySlug}-${safeSuffix}`;
            insertRes = await supabase.from("companies").insert([
              { ...companyPayload, slug: companySlug, created_by: authorId, is_active: true }
            ]).select().single();
          }

          if (insertRes.data) {
            currentCompanyId = insertRes.data.id;
            setSelectedCompanyId(insertRes.data.id);
          } else if (insertRes.error) {
            console.error("Failed to auto-create company record:", insertRes.error);
          }
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

    const finalExpiryDate = postExpiryDate ? postExpiryDate : null;
    const adminPayload = {
      firm_name: firmName,
      company_id: currentCompanyId,
      employment_type: employmentType,
      workplace_type: workplaceType,
      area: area,
      city: city,
      state: state,
      organization_type: organizationType || "Architecture Firm",
      positions: positions,
      qualifications: formatQualificationsArray(qualifications),
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
      organization_type: organizationType || "Architecture Firm",
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
          ? formatQualificationsArray(qualifications)
          : formatQualificationsArray(pos.qualifications || qualifications),
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

    const wasAlreadyPublished = initialStatus === "published";

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
      if (status === "published") setInitialStatus("published");
      window.history.replaceState(null, "", `/admin/add-job?id=${jobData.id}`);

      // Only auto-publish to social media if this is a newly created job,
      // or if it was previously a draft/scheduled job being published for the first time.
      // Never re-publish to social media when an admin simply edits an already-published job!
      const shouldAutoPublish = status === "published" && autoPublishSocial && !wasAlreadyPublished;
      if (shouldAutoPublish) {
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

    <p className="text-black mt-2">
      Publish and manage job opportunities.
    </p>

  </div>

  <AdminQuickMenu />

</div>


          {/* FORM CONTAINER */}

            {/* BASIC DETAILS */}

            <div>

              <h2 className="text-lg font-bold mb-3 border-b border-gray-100 pb-2">
                Basic Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* ORGANIZATION TYPE */}

<div>

  <label className="block mb-1.5 text-sm font-medium">
    Organization Type
  </label>

  <select
    value={organizationType}
    onChange={(e) => setOrganizationType(e.target.value)}
    className="w-full border rounded-xl px-3 py-2.5 text-sm"
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

  <label className="block mb-1.5 text-sm font-medium">
    {organizationType} Name <span className="text-red-500 text-xl font-bold">*</span>
  </label>

  <Autocomplete
    value={firmName}
    onChange={(val) => {
      setFirmName(val);
      if (selectedCompanyId) {
          setSelectedCompanyId(null);
          setIsCompanyProfileDirty(false);
      }
    }}
    onSelect={async (val, record) => {
      setFirmName(val);
      setSelectedCompanyId(record.id);
      setOrganizationType(normalizeOrganizationType(record.organization_type));
      setArea(record.neighborhood || "");
      setCity(record.city || "");
      setState(record.state || "");
        setCountry(record.country || "India");
      setCompanyLogo(record.logo_url || "");
      setCompanyAddress(record.address || "");
        setCompanyDescription(record.description || "");
      setCompanyWebsite(record.website || "");
      setCompanyEmail(record.email || "");
      setCompanyPhone(record.phone || "");
      setCompanyFacebook(record.facebook || "");
      setCompanyInstagram(record.instagram || "");
      setCompanyLinkedin(record.linkedin || "");
        setCompanyWhatsapp(record.whatsapp || "");
        setCompanyTwitter(record.twitter || "");
      setPrincipalArchitect(record.principal_architect || "");
      setEmployeeSize(record.employee_size || "");
      setFoundedYear(record.founded_year?.toString() || "");
      
      // Delay reset so useEffects don't re-dirty it immediately
      setTimeout(() => setIsCompanyProfileDirty(false), 100);
    }}
    fetchSuggestions={async (q) => {
      const { data: cData } = await supabase.from("companies").select("*").ilike("firm_name", "%" + q + "%").limit(10);
      const { data: jData } = await supabase.from("jobs").select("firm_name, city, state, organization_type, area, application_email, image").ilike("firm_name", "%" + q + "%").limit(10);
      if (jData) {
        jData.forEach(j => {
          j.neighborhood = j.area;
          j.email = j.application_email;
          j.logo_url = j.image;
        });
      }
      const combined = [...(cData || []), ...(jData || [])];
      const unique = Array.from(new Map(combined.map(item => [item.firm_name, item])).values());
      return unique;
    }}
    extractValue={(item) => item.firm_name}
    renderItem={(item) => (
      <div>
        <div className="font-bold">{item.firm_name}</div>
        <div className="text-xs text-black">{item.city ? `${item.city}, ${item.state}` : item.organization_type}</div>
      </div>
    )}
    placeholder="Enter name"
    className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white text-black"
  />

</div>
</div>



                          {/* LOCATION */}

            <div>

              <h2 className="text-lg font-bold mb-3 border-b border-gray-100 pb-2">
                Location
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* NEIGHBORHOOD */}

                <div>
                  <label className="block mb-1.5 text-sm font-medium"> Neighborhood </label>
                  <Autocomplete
                    value={area}
                    onChange={(val) => setArea(val)}
                    fetchSuggestions={async (q) => {
                      let qC = supabase.from('companies').select('neighborhood').ilike('neighborhood', '%' + q + '%');
                      let qJ = supabase.from('jobs').select('neighborhood').ilike('neighborhood', '%' + q + '%');
                      if (city) { qC = qC.eq('city', city); qJ = qJ.eq('city', city); }
                      const [{data: d1}, {data: d2}] = await Promise.all([qC.limit(10), qJ.limit(10)]);
                      const combined = [...(d1 || []), ...(d2 || [])];
                      return Array.from(new Set(combined.map(d => d.neighborhood).filter(Boolean)));
                    }}
                    placeholder="Adyar"
                    className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white text-black"
                  />
                </div>

                {/* CITY */}

                <div>
                    <label className="block mb-1.5 text-sm font-medium"> City </label>
                    <input 
                      type="text" 
                      list="citiesList"
                      placeholder="e.g. Mumbai" 
                      value={city} 
                      onChange={(e) => setCity(e.target.value)} 
                      className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white text-black" 
                    />
                    <datalist id="citiesList">
                      <option value="Mumbai" />
                      <option value="Delhi" />
                      <option value="Bengaluru" />
                      <option value="Hyderabad" />
                      <option value="Ahmedabad" />
                      <option value="Chennai" />
                      <option value="Kolkata" />
                      <option value="Surat" />
                      <option value="Pune" />
                      <option value="Jaipur" />
                      <option value="Lucknow" />
                      <option value="Kanpur" />
                      <option value="Nagpur" />
                      <option value="Indore" />
                      <option value="Thane" />
                      <option value="Bhopal" />
                      <option value="Visakhapatnam" />
                      <option value="Patna" />
                      <option value="Vadodara" />
                      <option value="Ghaziabad" />
                      <option value="Ludhiana" />
                      <option value="Agra" />
                      <option value="Nashik" />
                      <option value="Faridabad" />
                      <option value="Meerut" />
                      <option value="Rajkot" />
                      <option value="Varanasi" />
                      <option value="Srinagar" />
                      <option value="Aurangabad" />
                      <option value="Dhanbad" />
                      <option value="Amritsar" />
                      <option value="Allahabad" />
                      <option value="Ranchi" />
                      <option value="Gwalior" />
                      <option value="Jabalpur" />
                      <option value="Coimbatore" />
                      <option value="Vijayawada" />
                      <option value="Jodhpur" />
                      <option value="Madurai" />
                      <option value="Raipur" />
                      <option value="Chandigarh" />
                      <option value="Guwahati" />
                    </datalist>
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium"> State </label>
                    <input 
                      type="text" 
                      list="statesList"
                      placeholder="e.g. Maharashtra" 
                      value={state} 
                      onChange={(e) => setState(e.target.value)} 
                      className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white text-black" 
                    />
                    <datalist id="statesList">
                      <option value="Andhra Pradesh" />
                      <option value="Arunachal Pradesh" />
                      <option value="Assam" />
                      <option value="Bihar" />
                      <option value="Chhattisgarh" />
                      <option value="Goa" />
                      <option value="Gujarat" />
                      <option value="Haryana" />
                      <option value="Himachal Pradesh" />
                      <option value="Jharkhand" />
                      <option value="Karnataka" />
                      <option value="Kerala" />
                      <option value="Madhya Pradesh" />
                      <option value="Maharashtra" />
                      <option value="Manipur" />
                      <option value="Meghalaya" />
                      <option value="Mizoram" />
                      <option value="Nagaland" />
                      <option value="Odisha" />
                      <option value="Punjab" />
                      <option value="Rajasthan" />
                      <option value="Sikkim" />
                      <option value="Tamil Nadu" />
                      <option value="Telangana" />
                      <option value="Tripura" />
                      <option value="Uttar Pradesh" />
                      <option value="Uttarakhand" />
                      <option value="West Bengal" />
                      <option value="Andaman and Nicobar Islands" />
                      <option value="Chandigarh" />
                      <option value="Dadra and Nagar Haveli and Daman and Diu" />
                      <option value="Delhi" />
                      <option value="Jammu and Kashmir" />
                      <option value="Ladakh" />
                      <option value="Lakshadweep" />
                      <option value="Puducherry" />
                    </datalist>
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium"> Country <span className="text-red-500 font-bold">*</span></label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. India" 
                      value={country} 
                      onChange={(e) => setCountry(e.target.value)} 
                      className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white text-black" 
                    />
                  </div>

              </div>

            </div>
            </div>

            <div>

              {/* POSITIONS & DESCRIPTIONS */}
              <div className="mt-4 mb-4">
                <div className="flex justify-between items-end mb-4">
                  <h2 className="text-xl font-bold">Position Details</h2>
                  <button type="button" onClick={addPosition} className="text-blue-600 font-bold hover:underline">+ Add Position</button>
                </div>
                
                <div className="space-y-4">
                  {positions.map((pos, index) => (
                    <div key={index} className="border border-gray-200 p-4 rounded-xl bg-white shadow-sm relative text-black">
                      {positions.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removePosition(index)} 
                          className="absolute top-4 right-4 text-red-500 text-sm font-bold hover:underline"
                        >
                          Remove
                        </button>
                      )}
                      
                      <div className="flex flex-col gap-6 w-full">
                        
       {/* ROW 1: Position, Job Role, Vacancies */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block mb-1.5 text-sm font-medium">Position <span className="text-red-500">*</span></label>
            <input type="text" list="positionsList" value={pos.position} onChange={(e) => updatePosition(index, "position", e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white text-black" placeholder="e.g. Junior Architect" />
            <datalist id="positionsList">
              {positionOptions.map((opt) => <option key={opt} value={opt} />)}
            </datalist>
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium">Job Role</label>
            <input type="text" value={pos.role || ""} onChange={(e) => updatePosition(index, "role", e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white text-black" placeholder="e.g. Site visits, managing coordination drawings" />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium">Number of Positions</label>
            <input type="text" value={pos.vacancies || ""} onChange={(e) => updatePosition(index, "vacancies", e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white text-black" placeholder="e.g. 2" />
          </div>
       </div>

       {/* ROW 2: Experience & Salary */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <AdminExperienceSlider 
             experience={Array.isArray(pos.experience) ? pos.experience : (pos.experience ? [pos.experience] : [])} 
             onChangeExp={(val) => updatePosition(index, "experience", val)}
             isInternship={employmentType === "Internship" || (pos.position && pos.position.toLowerCase().includes("intern"))}
          />
          <AdminSalarySlider 
             salary={pos.salary || ""} 
             onChangeSal={(val) => updatePosition(index, "salary", val)}
          />
       </div>

       {/* ROW 3: Description */}
       <div className="mb-4">
          <label className="block mb-1.5 text-sm font-medium">Job Description <span className="text-red-500">*</span></label>
          <textarea value={pos.description} onChange={(e) => updatePosition(index, "description", e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white text-black min-h-[110px] resize-y" placeholder="Write detailed job description..." />
       </div>
                          
                          {!sameRequirements && (
                          <div className="w-full mt-2 pt-4 border-t border-gray-100">
                             <h4 className="font-bold text-sm mb-3">Position Requirements</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                   <label className="block mb-1.5 text-sm font-medium"> Qualifications </label>
                                   <Autocomplete value={pos.qualifications || ""} onChange={(val) => updatePosition(index, "qualifications", val)} fetchSuggestions={async (q) => { const { data } = await supabase.from("jobs").select("qualifications").ilike("qualifications", "%" + q + "%").limit(20); return Array.from(new Set(data?.map(d => d.qualifications).filter(Boolean))) || []; }} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white text-black" placeholder="e.g. B.Arch" />
                                </div>
                                <div>
                                   <label className="block mb-1.5 text-sm font-medium"> Skills Required </label>
                                   <Autocomplete
  value={pos.skill_input || ""}
  onChange={(val) => {
    if (val.endsWith(",")) {
      const newSkill = val.slice(0, -1).trim();
      const currentSkills = pos.skills || [];
      if (newSkill && !currentSkills.includes(newSkill)) {
        updatePosition(index, "skills", [...currentSkills, newSkill]);
      }
      updatePosition(index, "skill_input", "");
    } else {
      updatePosition(index, "skill_input", val);
    }
  }}
  onSelect={(val) => {
    const newSkill = val.trim();
    const currentSkills = pos.skills || [];
    if (newSkill && !currentSkills.includes(newSkill)) {
      updatePosition(index, "skills", [...currentSkills, newSkill]);
    }
    updatePosition(index, "skill_input", "");
  }}
  fetchSuggestions={async (q) => {
    const { data } = await supabase.from("jobs").select("skills_required").limit(100);
    if (!data) return [];
    const all = new Set();
    data.forEach(job => {
      if (Array.isArray(job.skills_required)) {
        job.skills_required.forEach((s) => {
          if (s.toLowerCase().includes(q.toLowerCase())) all.add(s);
        });
      } else if (typeof job.skills_required === "string" && job.skills_required.toLowerCase().includes(q.toLowerCase())) {
        all.add(job.skills_required);
      }
    });
    return Array.from(all).slice(0, 10);
  }}
  placeholder="Type skill and press comma or select"
  className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white text-black"
/>
<div className="flex flex-wrap gap-2 mt-3">
  {(pos.skills || []).map((skill: string) => (
    <div key={skill} className="bg-black text-white px-3 py-1 text-sm rounded-full flex items-center gap-2">
      <span>{skill}</span>
      <button type="button" onClick={() => {
        updatePosition(index, "skills", (pos.skills || []).filter((s: string) => s !== skill));
      }} className="hover:text-red-400 transition">
        &times;
      </button>
    </div>
  ))}
</div>
                                </div>
                             </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              

              {/* REQUIREMENTS */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 mb-6 gap-4">
                <h2 className="text-xl font-bold">Requirements</h2>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-black bg-white px-4 py-2 rounded-xl border border-gray-200">
                  <input type="checkbox" checked={sameRequirements} onChange={(e) => setSameRequirements(e.target.checked)} className="w-4 h-4 accent-black" />
                  Same requirements for all positions
                </label>
              </div>

              {sameRequirements && (
<div className="border border-gray-200 p-4 rounded-xl bg-white shadow-sm mb-4">
{/* QUALIFICATION & SKILLS */} <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> <div> <label className="block mb-1.5 text-sm font-medium"> Qualifications </label><Autocomplete value={qualifications as string} onChange={(val) => setQualifications(val as any)} fetchSuggestions={async (q) => { const { data } = await supabase.from("jobs").select("qualifications").ilike("qualifications", "%" + q + "%").limit(20); return Array.from(new Set(data?.map(d => d.qualifications).filter(Boolean))) || []; }} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white text-black" placeholder="e.g. B.Arch" /></div> <div> <label className="block mb-1.5 text-sm font-medium"> Skills Required </label>

                <Autocomplete value={skillInput} onChange={(val) => {   if (val.endsWith(",")) {     const newSkill = val.slice(0, -1).trim();     if (newSkill && !skills.includes(newSkill)) { setSkills([...skills, newSkill]); }     setSkillInput("");   } else {     setSkillInput(val);   } }} onSelect={(val) => {   const newSkill = val.trim();   if (newSkill && !skills.includes(newSkill)) { setSkills([...skills, newSkill]); }   setSkillInput(""); }} fetchSuggestions={async (q) => {   const { data } = await supabase.from("jobs").select("skills_required").limit(100);   if (!data) return [];   const all = new Set();   data.forEach(job => {     if (Array.isArray(job.skills_required)) {       job.skills_required.forEach((s) => {         if (s.toLowerCase().includes(q.toLowerCase())) all.add(s);       });     } else if (typeof job.skills_required === "string" && job.skills_required.toLowerCase().includes(q.toLowerCase())) {       all.add(job.skills_required);     }   });   return Array.from(all).slice(0, 10) as string[]; }} placeholder="Type skill and press comma or select" className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white text-black" />

                <div className="flex flex-wrap gap-2 mt-3">

                  {skills.map((skill) => (

                    <div
                      key={skill}
                      className="bg-black text-white px-3 py-1 text-sm rounded-full flex items-center gap-2"
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
              </div>
            )}
            </div>

            {/* JOB & APPLICATION DETAILS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-6">
              
              {/* Left Column: Job Details */}
              <div className="lg:col-span-4">
                <h2 className="text-lg font-bold mb-3 border-b border-gray-100 pb-2">
                  Job Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                  <div>
                    <label className="block mb-1.5 text-sm font-medium">Employment Type <span className="text-red-500 text-xl font-bold">*</span></label>
                    <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm">
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
                    <label className="block mb-1.5 text-sm font-medium">Workplace Type</label>
                    <select value={workplaceType} onChange={(e) => setWorkplaceType(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm">
                      <option value="On-site">On-site</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Column: Application Details */}
              <div className="lg:col-span-8">
                <h2 className="text-lg font-bold mb-3 border-b border-gray-100 pb-2">
                  Application Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1.5 text-sm font-medium">Date Type</label>
                    <select value={dateType} onChange={(e) => setDateType(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm">
                      <option value="expiry">Expiry Date</option>
                      <option value="apply">Last Date To Apply</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium">{dateType === "apply" ? "Last Date To Apply" : "Expiry Date"}</label>
                    <input type="date" value={dateType === "apply" ? lastDateToApply : postExpiryDate} onChange={(e) => { if (dateType === "apply") { setLastDateToApply(e.target.value); } else { setPostExpiryDate(e.target.value); } }} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium">Source Link</label>
                    <input type="text" placeholder="https://..." value={source} onChange={(e) => setSource(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium">Button Type <span className="text-red-500 text-xl font-bold">*</span></label>
                    <select value={applicationType} onChange={(e) => setApplicationType(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm">
                      <option value="apply">Apply Now</option>
                      <option value="email">Email Now</option>
                    </select>
                  </div>
                  {applicationType === "apply" ? (
                    <div className="md:col-span-2">
                      <label className="block mb-1.5 text-sm font-medium">Apply Link <span className="text-red-500 text-xl font-bold">*</span></label>
                      <input type="text" placeholder="https://..." value={apply_link} onChange={(e) => setapply_link(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                    </div>
                  ) : (
                    <div className="md:col-span-2">
                      <label className="block mb-1.5 text-sm font-medium">Application Email <span className="text-red-500 text-xl font-bold">*</span></label>
                      <input type="email" placeholder="careers@firm.com" value={application_email} onChange={(e) => setapplication_email(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* MEDIA */}
            <div>
              <h2 className="text-lg font-bold mb-3 border-b border-gray-100 pb-2">
                Media
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block mb-3 text-sm font-medium">Upload Job Image <span className="text-red-500 text-xl font-bold">*</span></label>
                  <ImageUploader value={imageUrl} onChange={(url) => setImageUrl(url)} label="Upload Job Image" />
                </div>
              </div>
            </div>

            <div className="flex-1 border-t border-black-300"></div>

            {/* ================= ORGANIZATION INFORMATION ================= */}
              <div className="mt-6 mb-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <h2 className="text-xl font-bold">
                      Company Profile
                    </h2>
                    
                  </div>
              </div>

              {/* Logo & Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block mb-3 text-sm font-medium">{organizationType} Logo</label>
                    <ImageUploader value={companyLogo} onChange={(url) => setCompanyLogo(url)} label="Upload Logo" />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium">Principal Architect / Head</label>
                  <input type="text" placeholder="e.g. Jane Doe" value={principalArchitect} onChange={(e) => setPrincipalArchitect(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium">Employee Size</label>
                  <select value={employeeSize} onChange={(e) => setEmployeeSize(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm">
                    <option value="">Select Size</option>
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-200">51-200</option>
                    <option value="201-500">201-500</option>
                    <option value="500+">500+</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium">Founded Year</label>
                  <input type="number" placeholder="YYYY" min="1800" max={new Date().getFullYear()} value={foundedYear} onChange={(e) => setFoundedYear(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                </div>
              </div>

              {/* About & Contacts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                {/* Left: About Firm */}
                <div>
                  <h3 className="font-bold mb-3 text-sm text-black uppercase tracking-wider">About {organizationType}</h3>
                  <textarea rows={6} placeholder={`Write about the ${organizationType.toLowerCase()}...`} value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm resize-none h-[230px]" />
                </div>

                {/* Right: Contacts */}
                <div>
                  <h3 className="font-bold mb-3 text-sm text-black uppercase tracking-wider">Contact Details</h3>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block mb-1.5 text-sm font-medium">Website</label>
                      <input type="url" placeholder="https://" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                    </div>
                    <div>
                      <label className="block mb-1.5 text-sm font-medium">Email</label>
                      <input type="email" placeholder="contact@firm.com" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                    </div>
                    <div>
                      <label className="block mb-1.5 text-sm font-medium">Phone</label>
                      <input type="text" placeholder="+123..." value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="mb-6">
                <h3 className="font-bold mb-3 text-sm text-black uppercase tracking-wider">Social Media</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block mb-1.5 text-sm font-medium">X (Twitter)</label>
                    <input type="url" placeholder="URL" value={companyTwitter} onChange={(e) => setCompanyTwitter(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium">Facebook</label>
                    <input type="url" placeholder="URL" value={companyFacebook} onChange={(e) => setCompanyFacebook(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium">Instagram</label>
                    <input type="url" placeholder="URL" value={companyInstagram} onChange={(e) => setCompanyInstagram(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium">LinkedIn</label>
                    <input type="url" placeholder="URL" value={companyLinkedin} onChange={(e) => setCompanyLinkedin(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                  </div>
                </div>
              </div>

            
                <div className="flex justify-end mt-4 mb-8 border-b border-gray-100 pb-8">
                  
                </div>

              

{/* ACTION BUTTONS */}

<div className="w-full flex justify-center mt-6 mb-2">
  <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-700 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-100 transition select-none">
    <input 
      type="checkbox" 
      checked={autoPublishSocial} 
      onChange={(e) => setAutoPublishSocial(e.target.checked)}
      className="w-4 h-4 rounded text-black border-gray-300 focus:ring-black cursor-pointer"
    />
    <span className="font-medium">
      {initialStatus === "published"
        ? "Auto-publish to Social Media (Disabled for already-published jobs)" 
        : "Auto-publish to Social Media (Instagram Feed & Story, Facebook)"}
    </span>
  </label>
</div>

<div className="flex flex-wrap justify-center gap-3 mb-4">
  <button type="button" onClick={() => { if (hasUnsavedChanges) { if (!window.confirm("You have unsaved changes. Are you sure you want to leave without saving?")) return; } router.push("/admin"); }} className="px-6 py-3 text-base rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-semibold hover:bg-gray-100 transition">
    Go to Dashboard
  </button>
  <button type="button" onClick={() => { if (hasUnsavedChanges) { if (!window.confirm("You have unsaved changes. Are you sure you want to leave without saving?")) return; } router.push("/admin/jobs"); }} className="px-6 py-3 text-base rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-semibold hover:bg-gray-100 transition">
    Manage Jobs
  </button>
  <button type="button" disabled={actionLoading !== null || uploadingImage} onClick={handleSaveDraft} className="px-6 py-3 text-base rounded-xl border-2 border-black bg-white text-black font-semibold hover:bg-gray-50 transition"
  >
    Save Draft
  </button>

  <button type="button" disabled={actionLoading !== null || uploadingImage} onClick={() => setShowSchedule(true)} className="px-6 py-3 text-base rounded-xl border-2 border-black bg-white text-black font-semibold hover:bg-white transition"
>
  Schedule
</button>

  <button
    type="button"
    disabled={actionLoading !== null}
    onClick={() => handlePublishJob("published")}
    className={`px-6 py-3 text-base rounded-xl text-lg font-semibold transition ${
      uploadingImage
        ? "bg-gray-400 text-white cursor-not-allowed"
        : "bg-black text-white hover:bg-gray-800"
    }`}
  >
    {actionLoading === "published" ? "Publishing..." : (selectedCompanyId && isCompanyProfileDirty ? "Update & Save" : "Publish Job")}
  </button>
</div>
          
 

{/* ================= SCHEDULE MODAL ================= */}

{showSchedule && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-5 w-full max-w-md">

      <h2 className="text-lg font-bold mb-3 border-b border-gray-100 pb-2">
        Schedule Job
      </h2>

      <div className="space-y-5">

        <div>
          <label className="block mb-1.5 text-sm font-medium">
            Date
          </label>

          <input
            type="date"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            className="w-full border rounded-xl px-3 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="block mb-1.5 text-sm font-medium">
            Time
          </label>

          <input
            type="time"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
            className="w-full border rounded-xl px-3 py-2.5 text-sm"
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
            disabled={actionLoading !== null}
            onClick={handleSchedule}
            className="px-6 py-3 bg-black text-white rounded-xl"
          >
            {actionLoading === "scheduled" ? "Scheduling..." : "Schedule"}
          </button>

      </div>

    </div>
  </div>
)}
</section>

      <Footer />
      </main>

      {/* API Config Modal */}
      {showAiSettings && (
        <div className="fixed inset-0 bg-black/60 z-[9999999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative">
            <button type="button"
              onClick={() => setShowAiSettings(false)}
              className="absolute top-6 right-6 text-black hover:text-black transition"
            >
              ?
            </button>
            <ApiServerManager isOpen={showAiSettings} onClose={() => setShowAiSettings(false)} onKeysUpdated={(keys: any) => setDbKeys(keys)} />
</div></div>
      )}


      {/* ================= PROMPT MANAGEMENT MODAL ================= */}
      {showPromptModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[10000000] flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-2xl w-full p-6 sm:p-7 shadow-2xl relative flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-xl font-black text-black tracking-tight">AI Extraction Prompt</h3>
                  {isPromptLocked ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full border border-gray-200">
                      🔒 Locked (Protected)
                    </span>
                  ) : canEditPrompt ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-300">
                      ✏️ Unlocked (Editing Mode)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full border border-gray-200">
                      🔒 Locked (Protected)
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Copy and paste this prompt into ChatGPT or Gemini with your flyer image to extract clean data.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPromptModal(false)}
                className="text-gray-400 hover:text-black w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition"
              >
                ✕
              </button>
            </div>

            {/* Prompt Body */}
            <div className="my-4 flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-gray-600">
                  Prompt Content
                </label>
                {isPromptLocked ? (
                  canEditPrompt ? (
                    <span className="text-[11px] text-gray-400 italic">
                      Prompt is locked. Click &quot;Unlock / Edit&quot; below to make changes.
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-500 font-medium">
                      🔒 Protected template (Editing restricted to CEO &amp; Super Admin)
                    </span>
                  )
                ) : (
                  <span className="text-[11px] text-amber-600 font-semibold">
                    ⚠️ Edit mode active. Click &quot;Save &amp; Lock&quot; when done.
                  </span>
                )}
              </div>

              <textarea
                rows={13}
                value={customPrompt}
                readOnly={isPromptLocked || !canEditPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Write or paste your custom prompt template here..."
                className={`w-full p-4 rounded-2xl text-xs font-mono outline-none transition-all flex-1 resize-none leading-relaxed ${
                  isPromptLocked
                    ? "bg-gray-50 text-gray-800 border-2 border-gray-200 cursor-not-allowed select-text"
                    : "bg-white text-black border-2 border-black shadow-inner ring-1 ring-black"
                }`}
              />
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                {/* Copy Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                      navigator.clipboard.writeText(customPrompt);
                    }
                    setPromptCopiedInModal(true);
                    setTimeout(() => setPromptCopiedInModal(false), 3000);
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 ${
                    promptCopiedInModal
                      ? "bg-emerald-600 text-white"
                      : "bg-black text-white hover:bg-gray-800"
                  }`}
                  title="Copy prompt to clipboard"
                >
                  {promptCopiedInModal ? (
                    <>
                      <span>✓</span> Prompt Copied!
                    </>
                  ) : (
                    <>
                      <span>📋</span> Copy Prompt
                    </>
                  )}
                </button>

                {/* Reset to Default - Only visible and active when unlocked in edit mode */}
                {!isPromptLocked && canEditPrompt && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Reset this prompt back to the default architecture template?")) {
                        setCustomPrompt(AI_PROMPT_TEMPLATE);
                      }
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-gray-100 transition"
                  >
                    ↺ Reset Default
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Lock / Unlock & Save Button - Only for CEO and Super Admin */}
                {canEditPrompt ? (
                  isPromptLocked ? (
                    <button
                      type="button"
                      onClick={() => {
                        const ok = window.confirm("Are you sure you want to unlock and edit the AI prompt template?");
                        if (ok) {
                          setIsPromptLocked(false);
                          if (typeof window !== "undefined") {
                            localStorage.setItem("ti2a_smart_job_prompt_locked", "false");
                          }
                        }
                      }}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-black border border-gray-300 transition active:scale-95"
                    >
                      <span>🔓</span> Unlock / Edit Prompt
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsPromptLocked(true);
                        if (typeof window !== "undefined") {
                          localStorage.setItem("ti2a_smart_job_prompt", customPrompt);
                          localStorage.setItem("ti2a_smart_job_prompt_locked", "true");
                        }
                        alert("✓ AI prompt template saved and locked successfully!");
                      }}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition active:scale-95 shadow"
                    >
                      <span>💾</span> Save &amp; Lock Prompt
                    </button>
                  )
                ) : (
                  <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                    <span>🔒</span> Editing restricted to CEO &amp; Super Admin
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowPromptModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= EXTRACTED DETAILS CONFIRMATION MODAL ================= */}
      {showExtractedConfirmModal && pendingExtractedData && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[10000000] flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-xl w-full p-6 shadow-2xl relative flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-black tracking-tight">Review Extracted Job Details</h3>
                  {isLocalExtraction ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                      ⚡ Instant 0ms Parser
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                      🤖 Server AI
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Review the extracted details below. Click <strong>Confirm &amp; Auto-Fill</strong> to automatically fill all fields.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowExtractedConfirmModal(false)}
                className="text-gray-400 hover:text-black w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition"
              >
                ✕
              </button>
            </div>

            {/* Scrollable details list */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-xs">
              {/* Studio / Firm Info */}
              <div className="bg-gray-50 border border-gray-200/70 rounded-2xl p-4">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 mb-2.5">
                  Studio / Firm
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-bold block">Firm Name</span>
                    <span className="text-sm font-bold text-gray-900">
                      {pendingExtractedData.firm_name || pendingExtractedData.company || pendingExtractedData.firm || "Not specified"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-bold block">Location</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {[pendingExtractedData.city, pendingExtractedData.state].filter(Boolean).join(", ") || "Not specified"}
                    </span>
                  </div>
                  {pendingExtractedData.employment_type || pendingExtractedData.employmentType ? (
                    <div>
                      <span className="text-gray-400 text-[10px] uppercase font-bold block">Employment Type</span>
                      <span className="font-semibold text-gray-800">
                        {normEmp(pendingExtractedData.employment_type || pendingExtractedData.employmentType)}
                      </span>
                    </div>
                  ) : null}
                  {pendingExtractedData.workplace_type || pendingExtractedData.workplaceType ? (
                    <div>
                      <span className="text-gray-400 text-[10px] uppercase font-bold block">Workplace Type</span>
                      <span className="font-semibold text-gray-800">
                        {normWork(pendingExtractedData.workplace_type || pendingExtractedData.workplaceType)}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Positions Found */}
              <div className="bg-gray-50 border border-gray-200/70 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                    Positions ({(pendingExtractedData.positions && Array.isArray(pendingExtractedData.positions)) ? pendingExtractedData.positions.length : 1})
                  </h4>
                </div>
                
                <div className="space-y-3">
                  {((pendingExtractedData.positions && Array.isArray(pendingExtractedData.positions) && pendingExtractedData.positions.length > 0)
                    ? pendingExtractedData.positions
                    : [pendingExtractedData]
                  ).map((p: any, idx: number) => {
                    const title = p.position || p.job_title || p.title || "Position " + (idx + 1);
                    const exp = Array.isArray(p.experience) ? p.experience.join(", ") : (p.experience || "Not disclosed");
                    return (
                      <div key={idx} className="bg-white border rounded-xl p-3 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-gray-900">{title}</span>
                          <span className="text-[10px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                            {exp}
                          </span>
                        </div>
                        {p.role && (
                          <div className="text-gray-500 text-[11px] mt-1">Role: <span className="text-gray-800 font-medium">{p.role}</span></div>
                        )}
                        {p.salary && (
                          <div className="text-gray-500 text-[11px] mt-0.5">Salary: <span className="text-emerald-700 font-semibold">{p.salary}</span></div>
                        )}
                        {p.qualifications && (
                          <div className="text-gray-500 text-[11px] mt-0.5">Qualifications: <span className="text-gray-800">{Array.isArray(p.qualifications) ? p.qualifications.join(", ") : p.qualifications}</span></div>
                        )}
                        {p.description && (
                          <div className="text-gray-500 text-[11px] mt-1.5 bg-gray-50 p-2 rounded-lg border border-gray-100">
                            <span className="font-semibold text-gray-700 block mb-0.5">Summary:</span>
                            <span className="text-gray-600 italic leading-relaxed">{p.description}</span>
                          </div>
                        )}
                        {p.skills && Array.isArray(p.skills) && p.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {p.skills.map((s: string, sIdx: number) => (
                              <span key={sIdx} className="bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-medium">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Application & Contact */}
              <div className="bg-gray-50 border border-gray-200/70 rounded-2xl p-4">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 mb-2.5">
                  Application &amp; Contact Details
                </h4>
                <div className="space-y-1.5">
                  {(pendingExtractedData.application_email || pendingExtractedData.applicationEmail || pendingExtractedData.email) && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 font-bold w-20">Email:</span>
                      <span className="font-semibold text-gray-900">
                        {pendingExtractedData.application_email || pendingExtractedData.applicationEmail || pendingExtractedData.email}
                      </span>
                    </div>
                  )}
                  {(pendingExtractedData.apply_link || pendingExtractedData.applyLink || pendingExtractedData.link) && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 font-bold w-20">Apply Link:</span>
                      <span className="font-semibold text-blue-600 truncate">
                        {pendingExtractedData.apply_link || pendingExtractedData.applyLink || pendingExtractedData.link}
                      </span>
                    </div>
                  )}
                  {(pendingExtractedData.phone || pendingExtractedData.whatsapp) && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 font-bold w-20">Phone:</span>
                      <span className="font-semibold text-gray-900">
                        {pendingExtractedData.phone || pendingExtractedData.whatsapp}
                      </span>
                    </div>
                  )}
                  {(pendingExtractedData.website || pendingExtractedData.studio_website) && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 font-bold w-20">Website:</span>
                      <span className="font-semibold text-blue-600 truncate">
                        {pendingExtractedData.website || pendingExtractedData.studio_website}
                      </span>
                    </div>
                  )}
                  {(pendingExtractedData.company_address || pendingExtractedData.address) && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 font-bold w-20">Address:</span>
                      <span className="font-semibold text-gray-900 truncate">
                        {pendingExtractedData.company_address || pendingExtractedData.address}
                      </span>
                    </div>
                  )}
                  {(pendingExtractedData.principal_architect || pendingExtractedData.principalArchitect) && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 font-bold w-20">Principal:</span>
                      <span className="font-semibold text-gray-900">
                        {pendingExtractedData.principal_architect || pendingExtractedData.principalArchitect}
                      </span>
                    </div>
                  )}
                  {(pendingExtractedData.deadline || pendingExtractedData.application_deadline) && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 font-bold w-20">Deadline:</span>
                      <span className="font-semibold text-amber-700">
                        {pendingExtractedData.deadline || pendingExtractedData.application_deadline}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Confirmation Action Buttons */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowExtractedConfirmModal(false)}
                className="px-4 py-3 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition"
              >
                Back to Edit Text
              </button>
              <button
                type="button"
                onClick={() => {
                  applyExtractedJobToState(pendingExtractedData);
                  setShowExtractedConfirmModal(false);
                  setShowSmartUpload(false);
                  setLoadingAI(false);
                }}
                className="flex-1 max-w-[280px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
              >
                <span>✓</span> Confirm &amp; Auto-Fill All Fields
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SMART JOB POPUP (9:16 RATIO) ================= */}
      {showSmartUpload && (
        <div className="fixed inset-0 bg-black/70 overflow-y-auto z-[1000000] p-4 backdrop-blur-md flex items-center justify-center">
          <div className="w-full max-w-[500px] py-10 md:py-8 flex justify-center">
            {/* UPLOAD BOX (9:16 Ratio) */}
            <div className="bg-white rounded-[32px] w-full max-w-[500px] h-[85vh] max-h-[780px] shadow-2xl flex flex-col relative overflow-hidden border border-white/20">
              <button type="button"
                  onClick={() => { setShowSmartUpload(false); setLoadingAI(false); }}
                className="absolute right-5 top-5 bg-gray-100 hover:bg-gray-200 text-black w-8 h-8 rounded-full flex items-center justify-center z-20 font-bold transition"
              >✕</button>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between mt-2 mb-4 pr-10">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">Smart Job</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button" 
                      onClick={() => setShowPromptModal(true)} 
                      className="text-xs bg-black text-white hover:bg-gray-800 px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
                      title="AI Prompt Settings (View, Edit, Lock, Copy)"
                    >
                      <span>💡</span> Prompt
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowAiSettings(true)} 
                      className="text-xs bg-gray-100 px-3 py-1.5 rounded-lg font-bold text-black hover:bg-gray-200 transition-colors active:scale-95"
                    >
                      API Config
                    </button>
                  </div>
                </div>
                  <div className="flex items-center gap-2 mb-6 w-full bg-gray-50 border p-2 rounded-xl">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black whitespace-nowrap px-2">Active Server:</label>
                    <select 
                      className="bg-white text-xs border rounded-lg px-2 py-1.5 flex-1 font-semibold outline-none focus:border-black text-black"
                      value={selectedServer}
                      onChange={(e) => setSelectedServer(e.target.value)}
                    >
                      {dbKeys.filter((k: any) => k.type === "personal" && k.key_value && k.key_value.trim()).map((k: any, i: number) => <option key={k.id} value={k.id}>Personal Server {i + 1}</option>)}
                        {dbKeys.filter((k: any) => k.type === "shared").map((k: any, i: number) => <option key={k.id} value={k.id}>Shared Server {i + 1}</option>)}
                        <option value="auto">Auto-Failover</option>
                    </select>
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
                            className="hidden text-black bg-white" 
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
                    <div className="flex flex-col gap-2.5 h-full">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (navigator.clipboard && navigator.clipboard.writeText) {
                              navigator.clipboard.writeText(customPrompt);
                            }
                            setPromptCopied(true);
                            setTimeout(() => setPromptCopied(false), 3000);
                          }}
                          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 ${
                            promptCopied
                              ? "bg-emerald-600 text-white"
                              : "bg-black text-white hover:bg-gray-800"
                          }`}
                          title="Copy AI prompt template to paste into ChatGPT or Gemini with your flyer image"
                        >
                          {promptCopied ? (
                            <>
                              <span>✓</span> Prompt Copied!
                            </>
                          ) : (
                            <>
                              <span>📋</span> Copy Prompt
                            </>
                          )}
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowPromptModal(true)}
                            className="text-[11px] font-bold text-gray-600 hover:text-black underline underline-offset-2 transition"
                          >
                            {canEditPrompt ? (isPromptLocked ? "🔒 Prompt Locked" : "✏️ Edit Prompt") : "🔒 View Prompt"}
                          </button>
                          {smartText && (smartText.trim().startsWith("{") || smartText.includes(":") || /firm\s*name/i.test(smartText) || /position/i.test(smartText)) ? (
                            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                              ⚡ 0ms Instant Parser Active
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <textarea
                        rows={11}
                        value={smartText}
                        onChange={(e) => setSmartText(e.target.value)}
                        placeholder={`Paste ChatGPT / Gemini extracted "Heading: Answer" text here...\n\nExample:\nFirm Name: Studio ABC\nCity: Bangalore\nState: Karnataka\nWorkplace Type: On-site\nEmployment Type: Full-time\nPosition: Junior Architect\nExperience: 0-2 Years\nApplication Email: careers@studioabc.com\n\n💡 Pro Tip: Click 'Copy Prompt' above, paste into ChatGPT with your flyer image, then paste the result back here!`}
                        className="w-full border-2 border-gray-100 rounded-2xl p-4 text-xs font-mono outline-none focus:border-black transition-all flex-1 min-h-[260px] resize-none"
                      />
                    </div>
                  )}

                  {uploadMode === 'url' && (
                    <input type="url" value={smartUrl} onChange={(e)=>setSmartUrl(e.target.value)} placeholder="Paste link here..."
                      className="w-full border-2 border-gray-100 rounded-full px-6 py-4 text-sm outline-none focus:border-black transition-all"
                    />
                  )}
                </div>

                <button type="button"
                  disabled={!!loadingAI && loadingAI !== "done"}
    onClick={async () => {
    try {
      setLoadingAI("loading");

      const formData = new FormData();
      formData.append("mode", uploadMode);
      if (uploadMode === "image" && smartImage) {
          setLoadingAI("Compressing Image...");
          const compressedImage = await compressImage(smartImage);
          
          try {
            let smartUrl = "";
            try {
              const ikForm = new FormData();
              ikForm.append("file", compressedImage);
              ikForm.append("folder", "/job-images");
              const ikRes = await fetch("/api/upload", {
                method: "POST",
                body: ikForm,
              });
              if (ikRes.ok) {
                const ikData = await ikRes.json();
                if (ikData.url) smartUrl = ikData.url;
              }
            } catch (ikErr) {
              console.warn("ImageKit smart upload failed:", ikErr);
            }

            if (!smartUrl) {
              const extMatch = compressedImage.name.match(/\.[0-9a-z]+$/i);
              const ext = extMatch ? extMatch[0].toLowerCase() : '';
              const fileName = `smart-upload-${Date.now()}${ext}`;
              const { data, error } = await supabase.storage.from("job-images").upload(fileName, compressedImage);
              if (!error) {
                 const { data: { publicUrl } } = supabase.storage.from("job-images").getPublicUrl(fileName);
                 smartUrl = publicUrl;
              } else {
                 console.error("Smart image upload failed", error);
              }
            }

            if (smartUrl) {
              setImageUrl(smartUrl);
            }
          } catch (e) {
            console.error("Storage error:", e);
          }
          
          // Overwrite the variable so formData uses the compressed one
          formData.append("image", compressedImage);
          setLoadingAI("Extracting Smart Job...");
        }

      if (uploadMode === "text") {
        if (!smartText || !smartText.trim()) throw new Error("Please paste text or AI JSON to extract.");
        
        // 1. Instant Local Client-Side Parser (0ms, 0 external API calls)
        const localData = parseJobLocally(smartText);
        if (localData) {
          setIsLocalExtraction(true);
          setAiResult(localData);
          setPendingExtractedData(localData);
          setShowExtractedConfirmModal(true);
          setLoadingAI(false);
          return;
        }

        // 2. Unstructured plain text fallback -> send to server AI
        setIsLocalExtraction(false);
        formData.append("text", smartText);
      } else if (uploadMode === "image") {
          if (!smartImage) throw new Error("Please upload an image to extract.");
          // formData.append is already handled above with the compressed image
        } else if (uploadMode === "url") {
        if (!smartUrl) throw new Error("Please paste a URL to extract.");
        formData.append("url", smartUrl);
      } else {
        throw new Error("Mode not supported yet.");
      }

      
          const headers: any = {};
          let result = null;
          let lastError = null;
          const newStatuses = [...keyStatuses];

          const tryKey = async (key: string, index: number) => {
               const { data: { session } } = await supabase.auth.getSession();
               if (session?.access_token) {
                   headers["Authorization"] = `Bearer ${session.access_token}`;
               }
               headers["x-user-gemini-key"] = key;
             try {
                const res = await fetch("/api/extract-job", { headers, method: "POST", body: formData });
                let data;
                try { data = await res.json(); } catch(e) { throw new Error("Server error (Status " + res.status + "). The API took too long or failed to respond."); }
                
                if (!res.ok) {
                  if (data.error && data.error.toLowerCase().includes("quota")) {
                    if (index !== -1) { 
                      newStatuses[index] = "Quota Exceeded"; 
                      setKeyStatuses([...newStatuses]); 
                      throw new Error("Quota Exceeded on Personal Server " + (index+1));
                    } else {
                      throw new Error(data.error || "Quota Exceeded on Shared/Selected Server");
                    }
                  }
                  if (data.error && data.error.toLowerCase().includes("busy")) {
                    if (index !== -1) { newStatuses[index] = "Server Busy"; setKeyStatuses([...newStatuses]); }
                    throw new Error("Server Busy on Server " + (index+1));
                  }
                  throw new Error(data.error || "Failed to extract");
                }
                if (index !== -1) { newStatuses[index] = "Success"; setKeyStatuses([...newStatuses]); }
                return data;
             } catch(e) {
                throw e;
             }
          };

          const tryPublic = async () => {
             const cleanHeaders = { ...headers };
             delete cleanHeaders["x-user-gemini-key"];
             const res = await fetch("/api/extract-job", { headers: cleanHeaders, method: "POST", body: formData });
             let data;
             try { data = await res.json(); } catch(e) { throw new Error("Server error (Status " + res.status + "). The API took too long or failed to respond."); }
             if (!res.ok) throw new Error(data.error || "Failed to extract using Public Server");
             return data;
          };

          
          
          if (selectedServer === "auto") {
              const personalKeys = dbKeys.filter((k: any) => k.type === "personal" && k.key_value.trim());
              let success = false;
              for (let i = 0; i < personalKeys.length; i++) {
                 try {
                    result = await tryKey(personalKeys[i].key_value.trim(), i);
                    success = true;
                    break;
                 } catch (e: any) {
                    lastError = e.message;
                 }
              }
              
              if (!success) {
                 const sharedKeys = dbKeys.filter((k: any) => k.type === "shared");
                 for (let i = 0; i < sharedKeys.length; i++) {
                     try {
                         result = await tryKey(sharedKeys[i].id, -1);
                         success = true;
                         break;
                     } catch(e: any) {
                         lastError = e.message;
                     }
                 }
              }
          } else {
              const selectedObj = dbKeys.find((k: any) => k.id === selectedServer);
              if (selectedObj) {
                  try {
                      const valToSend = selectedObj.type === "personal" ? selectedObj.key_value : selectedObj.id;
                      result = await tryKey(valToSend, -1);
                  } catch(e: any) {
                      lastError = e.message;
                  }
              } else {
                  throw new Error("Selected server is invalid or not loaded.");
              }
          }

          if (!result) throw new Error(lastError || "Extraction failed. Please check the API Config or try another server.");
          const ai = typeof result.result === "string" ? JSON.parse(result.result) : (result.result || result);

          // Normalize qualifications and contact info for image & server extraction
          const globalAppEmail = ai.application_email || ai.applicationEmail || ai.email || ai.company_email || "";
          if (globalAppEmail && !ai.company_email) ai.company_email = globalAppEmail;
          if (globalAppEmail && !ai.application_email) ai.application_email = globalAppEmail;
          const globalContactArr = [ai.phone, ai.whatsapp].filter(Boolean);
          const globalAppPhone = globalContactArr.length > 0 ? globalContactArr.join(" / ") : "";
          const globalApplyClause = globalAppEmail ? ` Interested candidates can send their resume and portfolio to ${globalAppEmail}.` : "";
          const globalContactClause = globalAppPhone ? ` Contact / WhatsApp: ${globalAppPhone}.` : "";

          if (ai.positions && Array.isArray(ai.positions)) {
            ai.positions = ai.positions.map((p: any) => {
              const qStr = Array.isArray(p.qualifications) ? p.qualifications.join(", ") : (p.qualifications || "");
              const cleanQ = qStr.replace(/\s*\/\s*/g, ", ").trim();
              const mergedSkills = Array.from(new Set([
                ...(Array.isArray(p.skills) ? p.skills : (p.skills ? [p.skills] : [])),
                ...(Array.isArray(p.software) ? p.software : (p.software ? [p.software] : []))
              ]));
              let desc = p.description || "";
              if (!desc || desc.length < 30) {
                const firm = ai.firm_name || ai.company || "The studio";
                const loc = [ai.city, ai.state].filter(Boolean).join(", ");
                const qPart = cleanQ ? ` Candidates should hold ${cleanQ}.` : "";
                const sPart = mergedSkills.length > 0 ? ` Skills required: ${mergedSkills.join(", ")}.` : "";
                const rPart = p.role ? ` Core responsibilities: ${p.role}.` : "";
                desc = `${firm} is hiring a ${p.position || "professional"}${loc ? ` in ${loc}` : ""}.${qPart}${sPart}${rPart}${globalApplyClause}${globalContactClause}`;
              } else {
                if (globalAppEmail && !desc.toLowerCase().includes(globalAppEmail.toLowerCase())) desc += globalApplyClause;
                if (globalAppPhone && !desc.includes(globalAppPhone)) desc += globalContactClause;
              }
              return {
                ...p,
                qualifications: cleanQ,
                skills: mergedSkills,
                description: desc
              };
            });
          } else if (ai.qualifications) {
            const qStr = Array.isArray(ai.qualifications) ? ai.qualifications.join(", ") : String(ai.qualifications);
            ai.qualifications = qStr.replace(/\s*\/\s*/g, ", ").trim();
          }

          setIsLocalExtraction(false);
          setAiResult(result);
          setPendingExtractedData(ai);
          setShowExtractedConfirmModal(true);
          setLoadingAI(false);

    } catch (err: any) {
      console.error(err);
      const isBusy = err.message && (err.message.includes("busy") || err.message.includes("503") || err.message.includes("429"));
      if (isBusy && uploadMode === "text") {
        alert("Google AI servers are currently busy.\n\n💡 Pro Tip: Click 'Prompt' above, copy the prompt into ChatGPT or Gemini with your flyer image, and paste the JSON back here for instant 0ms extraction!");
      } else {
        alert(err.message || "Extraction Failed");
      }
      setLoadingAI(false);
    }
  }}
  className={`mt-6 w-full py-5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${(loadingAI && loadingAI !== 'done') ? 'bg-gray-100 text-black cursor-not-allowed opacity-80' : 'bg-black text-white hover:bg-gray-800 shadow-xl'}`}
>
  {(loadingAI && loadingAI !== 'done') ? (<><div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>{loadingAI === 'loading' ? 'Extracting...' : loadingAI}</>) : ('✨ Extract Details')}
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

      {/* PRE-PUBLISH DUPLICATE GATEKEEPER MODAL */}
      {showDuplicateGateModal && duplicateMatch && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-amber-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <AlertCircle size={28} />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">
              Studio Already Exists or Similar Practice Found
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-4 leading-relaxed">
              To avoid creating duplicate directory entries and splitting jobs between two profiles, publication is paused because a matching studio already exists:
            </p>

            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 mb-5 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between items-start">
                <span className="text-gray-500 font-medium">You entered:</span>
                <span className="font-bold text-gray-900 text-right">{firmName}</span>
              </div>
              <div className="border-t border-amber-200/60 pt-2 flex justify-between items-start">
                <span className="text-gray-500 font-medium">Existing Studio:</span>
                <div className="text-right">
                  <span className="font-extrabold text-black block">{duplicateMatch.matchedCompany.firm_name}</span>
                  <span className="text-xs text-gray-500 block">
                    {[duplicateMatch.matchedCompany.city, duplicateMatch.matchedCompany.state].filter(Boolean).join(", ") || "Location not set"}
                  </span>
                </div>
              </div>
              <div className="border-t border-amber-200/60 pt-2 flex justify-between items-center text-xs text-amber-800 font-semibold">
                <span>Match Reason:</span>
                <span className="bg-amber-200/70 px-2 py-0.5 rounded-md">{duplicateMatch.reason}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleConfirmUseExistingStudio}
                className="w-full py-3 px-4 bg-black hover:bg-gray-800 text-white font-bold rounded-xl text-sm transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <span>✓ Yes, Use Existing Studio</span>
              </button>
              <button
                type="button"
                onClick={handleRejectDuplicate}
                className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition cursor-pointer"
              >
                <span>✕ No, Change Studio Name / Fix Spelling</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}









