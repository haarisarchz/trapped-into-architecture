// @ts-nocheck
"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import ImageUploader from "@/components/ImageUploader";
import { calculateProfileCompletion } from "@/utils/profileCompletion";
import { calculateCompanyLevel } from "@/utils/companyLevel";
import Link from "next/link";
import {
  Building2,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Plus,
  X,
  FileText,
  DollarSign,
  GraduationCap,
  Wrench,
  Clock,
  Send,
  ExternalLink,
} from "lucide-react";

const WORKPLACE_TYPES = ["On-site", "Hybrid", "Remote"];
const EMPLOYMENT_TYPES = ["Full-time", "Internship", "Contract", "Part-time"];
const POPULAR_POSITIONS = [
  "Junior Architect",
  "Architect",
  "Senior Architect",
  "3D Visualizer",
  "Interior Designer",
  "Landscape Architect",
  "Architectural Intern",
  "BIM Architect / Coordinator",
  "Project Architect",
  "Draftsman / CAD Technician",
];

const COMMON_SKILLS = [
  "AutoCAD",
  "SketchUp",
  "Revit",
  "Lumion",
  "Enscape",
  "Photoshop",
  "Rhino",
  "V-Ray",
  "InDesign",
  "3ds Max",
  "Grasshopper",
];

const COMMON_QUALIFICATIONS = [
  "B.Arch",
  "M.Arch",
  "Diploma in Civil Engineering",
  "Diploma in Architectural Assistantship",
  "B.Des",
  "B.E Civil",
];

const EXPERIENCE_PRESETS = [
  "Fresher",
  "0 - 1 Years",
  "1 - 3 Years",
  "3 - 5 Years",
  "5+ Years",
];

function PostJobContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCompanySlug = searchParams.get("company");

  // Auth & State
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [userCompletion, setUserCompletion] = useState<number>(100);

  // Form State
  const [position, setPosition] = useState("");
  const [role, setRole] = useState("");
  const [workplaceType, setWorkplaceType] = useState("On-site");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [experience, setExperience] = useState<string[]>(["1 - 3 Years"]);
  const [salary, setSalary] = useState("");
  const [qualifications, setQualifications] = useState("B.Arch");
  const [skills, setSkills] = useState<string[]>(["AutoCAD", "SketchUp"]);
  const [customSkill, setCustomSkill] = useState("");
  const [description, setDescription] = useState("");
  const [flyerUrl, setFlyerUrl] = useState("");
  const [applicationEmail, setApplicationEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [applyLink, setApplyLink] = useState("");

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submittedJob, setSubmittedJob] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    initUser();
  }, [initialCompanySlug]);

  const initUser = async () => {
    setLoading(true);
    try {
      const stored = localStorage.getItem("currentUser");
      if (!stored) {
        setLoading(false);
        return;
      }

      const parsed = JSON.parse(stored);
      setCurrentUser(parsed);

      // Fetch profile
      let prof: any = null;
      if (parsed.id) {
        const { data } = await supabase.from("profiles").select("*").eq("id", parsed.id).maybeSingle();
        prof = data;
      }
      if (!prof && (parsed.username || parsed.email)) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq(parsed.username ? "username" : "email", parsed.username || parsed.email)
          .maybeSingle();
        prof = data;
      }

      setUserProfile(prof);
      const roleStr = (prof?.role || parsed.role || "").toLowerCase().replace(/[\s_]+/g, "");
      const isPlatformAdmin = ["superadmin", "admin", "ceo", "jobadmin"].includes(roleStr);
      setIsAdmin(isPlatformAdmin);

      // Check Gold Member status
      if (prof) {
        const { data: edus } = await supabase.from("educations").select("*").eq("user_id", prof.id);
        const { data: exps } = await supabase.from("experiences").select("*").eq("user_id", prof.id);
        const res = calculateProfileCompletion(prof, edus || [], exps || []);
        setUserCompletion(res.percentage);
      }

      // Fetch companies owned or claimed by this user
      let query = supabase.from("companies").select("*");
      if (!isPlatformAdmin && prof?.id) {
        query = query.or(`created_by.eq.${prof.id},claimed_by.eq.${prof.id}`);
      }
      const { data: userComps } = await query.order("firm_name", { ascending: true });
      const compList = userComps || [];
      setCompanies(compList);

      // Auto select matching company from query param or first available
      if (initialCompanySlug) {
        const match = compList.find((c: any) => c.slug === initialCompanySlug);
        if (match) {
          setSelectedCompanyId(match.id);
          applyCompanyDefaults(match, prof);
        } else if (compList.length > 0) {
          setSelectedCompanyId(compList[0].id);
          applyCompanyDefaults(compList[0], prof);
        }
      } else if (compList.length > 0) {
        setSelectedCompanyId(compList[0].id);
        applyCompanyDefaults(compList[0], prof);
      }
    } catch (err) {
      console.error("Error initializing user for post-job:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyCompanyDefaults = (comp: any, prof: any) => {
    if (comp?.email) setApplicationEmail(comp.email);
    else if (prof?.email) setApplicationEmail(prof.email);

    if (comp?.phone) setPhone(comp.phone);
    else if (prof?.phone) setPhone(prof.phone);

    if (comp?.website) setApplyLink(comp.website);
  };

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

  const handleToggleSkill = (skillName: string) => {
    if (skills.includes(skillName)) {
      setSkills(skills.filter((s) => s !== skillName));
    } else {
      setSkills([...skills, skillName]);
    }
  };

  const handleAddCustomSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    const val = customSkill.trim();
    if (val && !skills.includes(val)) {
      setSkills([...skills, val]);
      setCustomSkill("");
    }
  };

  const handleToggleExperience = (expVal: string) => {
    if (experience.includes(expVal)) {
      if (experience.length > 1) {
        setExperience(experience.filter((x) => x !== expVal));
      }
    } else {
      setExperience([...experience, expVal]);
    }
  };

  const generateAutoDescription = () => {
    if (!selectedCompany || !position) return;
    const firm = selectedCompany.firm_name;
    const loc = selectedCompany.city ? ` in ${selectedCompany.city}` : "";
    const qual = qualifications ? ` Candidates should possess a ${qualifications}.` : "";
    const skl = skills.length > 0 ? ` Proficiency in ${skills.join(", ")} is required.` : "";
    const rol = role ? ` Primary responsibilities include: ${role}.` : "";
    const apply = applicationEmail ? ` Interested architects can email their resume and portfolio to ${applicationEmail}.` : "";
    const contact = phone ? ` For inquiries: ${phone}.` : "";

    const desc = `${firm} is currently looking for a skilled ${position}${loc}.${qual}${skl}${rol}${apply}${contact}`;
    setDescription(desc);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedCompany) {
      setErrorMessage("Please select or register a practice before posting.");
      return;
    }

    if (!isAdmin && selectedCompany) {
      const compLvl = calculateCompanyLevel(selectedCompany);
      if (compLvl.score < 66) {
        setErrorMessage(
          `Studio "${selectedCompany.firm_name}" is currently at ${compLvl.score}%. Gold Studio Tier (66%) is required to publish vacancies. Please update the studio profile.`
        );
        return;
      }
    }

    if (!position.trim()) {
      setErrorMessage("Please enter the job title / position.");
      return;
    }

    if (!applicationEmail.trim() && !phone.trim() && !applyLink.trim()) {
      setErrorMessage("Please provide at least one contact method (email, phone, or link).");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Build Narrative Description if left blank
      let finalDescription = description.trim();
      if (!finalDescription) {
        const firm = selectedCompany.firm_name;
        const loc = selectedCompany.city ? ` in ${selectedCompany.city}` : "";
        const qual = qualifications ? ` Qualifications: ${qualifications}.` : "";
        const skl = skills.length > 0 ? ` Required Skills: ${skills.join(", ")}.` : "";
        const rol = role ? ` Responsibilities: ${role}.` : "";
        finalDescription = `${firm} is hiring a ${position}${loc}.${qual}${skl}${rol}`;
      }

      const payload: any = {
        firm_name: selectedCompany.firm_name,
        company_id: selectedCompany.id,
        author_id: userProfile?.id || currentUser?.id,
        position: position.trim(),
        role: role.trim() || position.trim(),
        workplace_type: workplaceType,
        employment_type: employmentType,
        experience: experience,
        salary: salary.trim() || null,
        qualifications: qualifications.trim() || null,
        skills_required: skills,
        job_description: finalDescription,
        application_type: "email",
        application_email: applicationEmail.trim() || null,
        apply_link: applyLink.trim() || null,
        image: flyerUrl || null,
        city: selectedCompany.city || null,
        state: selectedCompany.state || null,
        area: selectedCompany.neighborhood || null,
        organization_type: selectedCompany.organization_type || "Architecture Firm",
        status: "pending_review",
        posted_date: new Date().toISOString(),
      };

      const { data, error } = await supabase.from("jobs").insert([payload]).select().single();
      if (error) throw error;

      // 2. Mark profile as recruiter if not already
      if (userProfile?.id) {
        try {
          await supabase
            .from("profiles")
            .update({ is_recruiter: true, user_track: "recruiter" })
            .eq("id", userProfile.id);
        } catch (e) {
          console.warn("Could not set is_recruiter on profile:", e);
        }
      }

      setSubmittedJob(data);
    } catch (err: any) {
      console.error("Error submitting job:", err);
      setErrorMessage(err.message || "Failed to submit job. Please check all fields.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
      </main>
    );
  }

  // SCREEN A: Visitor not logged in
  if (!currentUser) {
    return (
      <main className="min-h-screen bg-gray-50 text-black flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-3xl mx-auto px-6 py-16 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-black text-white flex items-center justify-center mb-6 shadow-md">
            <Building2 size={32} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full mb-3">
            For Architecture Studios &amp; Recruiters
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Post an Opening to India&apos;s Architecture Community
          </h1>
          <p className="text-gray-600 text-base md:text-lg mb-8 max-w-xl leading-relaxed">
            Welcome architects, junior designers, and interns to your team. Log in or register an account to publish verified job openings on Trapped Into Architecture.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <button
              onClick={() => {
                const navLoginBtn = document.querySelector('[data-auth-login]') as HTMLButtonElement;
                if (navLoginBtn) navLoginBtn.click();
                else window.location.href = "/";
              }}
              className="bg-black hover:bg-gray-800 text-white font-bold py-3.5 px-6 rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Log In to Continue</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => {
                const navRegBtn = document.querySelector('[data-auth-register]') as HTMLButtonElement;
                if (navRegBtn) navRegBtn.click();
                else window.location.href = "/";
              }}
              className="bg-white hover:bg-gray-100 text-gray-900 border border-gray-300 font-bold py-3.5 px-6 rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Create Free Account</span>
            </button>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // SCREEN B0: User logged in, but below Gold Member (66%)
  if (!isAdmin && userCompletion < 66) {
    return (
      <main className="min-h-screen bg-gray-50 text-black flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-2xl mx-auto px-6 py-16 text-center">
          <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-yellow-100 text-yellow-800 flex items-center justify-center mx-auto mb-4 border border-yellow-300">
              <ShieldCheck size={32} />
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-yellow-800 bg-yellow-100 px-3 py-1 rounded-full mb-3 inline-block">
              Gold Member (66%) Required
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
              Gold Member Status Required to Post Openings
            </h1>

            <p className="text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed max-w-lg mx-auto">
              Your profile is currently at <strong>{userCompletion}%</strong>. To maintain verified, high-trust architectural hiring, only members at <strong>Gold Tier (66%)</strong> or above can publish vacancies.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-left mb-6 text-xs text-gray-700 space-y-2">
              <p className="font-bold text-gray-900">How to reach 66% (takes 2 minutes):</p>
              <p>&bull; Upload Profile Avatar (+10%)</p>
              <p>&bull; Add Phone or WhatsApp Number (+10%)</p>
              <p>&bull; Add Education Degree (+15%)</p>
              <p>&bull; Add Work Experience (+10%)</p>
              <p>&bull; Add Professional Tagline or Bio (+5% &ndash; 10%)</p>
            </div>

            <Link
              href={`/profile/${userProfile?.username || ""}?tab=details`}
              className="w-full py-3.5 px-6 bg-black hover:bg-gray-800 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <span>Complete Profile (+{66 - userCompletion}% needed)</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // SCREEN B: User logged in, but has NOT claimed or created a company
  if (companies.length === 0 && !isAdmin) {
    return (
      <main className="min-h-screen bg-gray-50 text-black flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-4xl mx-auto px-6 py-12 md:py-16">
          <div className="bg-white rounded-3xl border border-gray-200 p-8 md:p-12 shadow-sm text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-5 border border-amber-200">
              <ShieldCheck size={32} />
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full mb-3 inline-block">
              Company Admin Permission Required
            </span>

            <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-4">
              To Post a Job, Select or Register Your Studio
            </h1>

            <p className="text-gray-600 text-sm md:text-base mb-8 max-w-2xl mx-auto leading-relaxed">
              To keep our platform 100% verified and protect candidates from fake vacancies, all architecture and design jobs must be posted by an authorized representative (Company Admin) of an architectural studio.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto text-left mb-8">
              {/* Option 1: Claim Existing */}
              <div className="p-6 rounded-2xl border border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-black transition flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                    <Building2 size={20} />
                  </div>
                  <h3 className="font-bold text-base text-gray-900 mb-1">
                    Is Your Studio Already Listed?
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed mb-4">
                    Search our directory of 100+ architecture firms in India and click &quot;Claim this Studio&quot; to become its admin.
                  </p>
                </div>
                <Link
                  href="/companies"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl text-center transition flex items-center justify-center gap-1.5"
                >
                  <span>Find &amp; Claim Studio</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              {/* Option 2: Register New Practice */}
              <div className="p-6 rounded-2xl border border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-black transition flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                    <Plus size={20} />
                  </div>
                  <h3 className="font-bold text-base text-gray-900 mb-1">
                    Register a New Studio
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed mb-4">
                    If your firm is not yet in our database, create your studio profile in 2 minutes and start posting vacancies immediately.
                  </p>
                </div>
                <Link
                  href="/companies/new"
                  className="bg-black hover:bg-gray-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl text-center transition flex items-center justify-center gap-1.5"
                >
                  <span>Register Practice Profile</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            <p className="text-xs text-gray-400">
              Once you claim or create a company, you will instantly receive the <strong>Recruiter</strong> badge on your profile.
            </p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // SCREEN C: Submission Success!
  if (submittedJob) {
    return (
      <main className="min-h-screen bg-gray-50 text-black flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-3xl mx-auto px-6 py-16">
          <div className="bg-white rounded-3xl border border-gray-200 p-8 md:p-12 shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={36} />
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full mb-3 inline-block">
              Job Successfully Submitted
            </span>

            <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-3">
              Your Opening is Under Review!
            </h1>

            <p className="text-gray-600 text-sm md:text-base mb-6 max-w-lg mx-auto leading-relaxed">
              Thank you for posting on <strong>Trapped Into Architecture</strong>. We received your listing for <strong>{submittedJob.position}</strong> at <strong>{submittedJob.firm_name}</strong>.
            </p>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 max-w-md mx-auto text-left text-xs text-gray-600 space-y-1.5 mb-8">
              <p><strong>Status:</strong> <span className="text-amber-600 font-bold">Pending Editorial Verification</span></p>
              <p><strong>Review Time:</strong> Usually approved within 1 to 3 hours.</p>
              <p><strong>Recruiter Badge:</strong> The Recruiter badge is now active on your candidate profile.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setSubmittedJob(null);
                  setPosition("");
                  setRole("");
                  setDescription("");
                  setFlyerUrl("");
                }}
                className="bg-black hover:bg-gray-800 text-white font-bold text-sm py-3 px-6 rounded-xl transition cursor-pointer"
              >
                Post Another Opening
              </button>
              {selectedCompany?.slug && (
                <Link
                  href={`/companies/${selectedCompany.slug}`}
                  className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 font-bold text-sm py-3 px-6 rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <span>View Studio Page</span>
                  <ExternalLink size={14} />
                </Link>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // SCREEN D: The Post Job Form
  return (
    <main className="min-h-screen bg-gray-50 text-black flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-4xl mx-auto px-6 py-10 w-full">
        {/* Header Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-0.5 rounded-full">
              Recruiter Portal
            </span>
            <span className="text-xs text-gray-500 font-medium">
              &bull; Submit Architecture Openings
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Post an Architectural Opening
          </h1>
          <p className="text-gray-600 text-sm md:text-base mt-1">
            Reach thousands of architects, interior designers, visualizers, and students across India.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. STUDIO SELECTION & VERIFIED CARD */}
          <section className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Building2 size={18} className="text-indigo-600" />
                <span>Hiring Practice / Studio</span>
              </h2>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <ShieldCheck size={12} />
                Verified Practice
              </span>
            </div>

            {companies.length > 1 ? (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Select Practice You are Hiring For
                </label>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => {
                    setSelectedCompanyId(e.target.value);
                    const comp = companies.find((c) => c.id === e.target.value);
                    if (comp) applyCompanyDefaults(comp, userProfile);
                  }}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm bg-white font-medium"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firm_name} {c.city ? `(${c.city})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {selectedCompany && (
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                  {selectedCompany.logo_url ? (
                    <img src={selectedCompany.logo_url} alt={selectedCompany.firm_name} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="text-gray-400 w-7 h-7" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-base text-gray-900 truncate">
                    {selectedCompany.firm_name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-0.5">
                    {selectedCompany.city && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {selectedCompany.city}, {selectedCompany.state || "India"}
                      </span>
                    )}
                    {selectedCompany.organization_type && (
                      <span className="bg-gray-200/60 text-gray-700 px-2 py-0.5 rounded-md text-[11px] font-medium">
                        {selectedCompany.organization_type}
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/companies/${selectedCompany.slug}`}
                  target="_blank"
                  className="text-xs text-gray-500 hover:text-black font-semibold flex items-center gap-1"
                >
                  <span>Preview</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            )}

            {selectedCompany && !isAdmin && (() => {
              const compLevel = calculateCompanyLevel(selectedCompany);
              if (compLevel.score < 66) {
                return (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                        Gold Studio (66%) Required
                      </span>
                      <span className="text-xs font-bold text-amber-900">
                        Studio Profile at {compLevel.score}%
                      </span>
                    </div>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      To protect candidate trust and prevent unverified listings, architecture studios must reach <strong>Gold Tier (66%)</strong> before publishing vacancies.
                    </p>
                    {compLevel.missingFields.length > 0 && (
                      <p className="text-xs text-amber-700">
                        <strong>Missing to reach 66%:</strong> {compLevel.missingFields.slice(0, 3).join(", ")}.
                      </p>
                    )}
                    <div className="pt-1">
                      <Link
                        href={`/companies/${selectedCompany.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-900 hover:bg-black text-white px-4 py-2 rounded-xl transition"
                      >
                        <span>Update Studio Profile (+{66 - compLevel.score}% needed)</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                );
              }
              return (
                <div className="flex items-center justify-between text-xs text-gray-500 px-1 pt-1">
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <CheckCircle2 size={13} />
                    {compLevel.label} ({compLevel.score}%) &bull; Eligible to post vacancies
                  </span>
                  <Link
                    href={`/companies/${selectedCompany.slug}`}
                    target="_blank"
                    className="hover:text-black font-medium inline-flex items-center gap-1"
                  >
                    <span>Edit Studio</span>
                    <ExternalLink size={11} />
                  </Link>
                </div>
              );
            })()}
          </section>

          {/* 2. POSITION & ROLE DETAILS */}
          <section className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-xs space-y-5">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 pb-3 border-b border-gray-100">
              <Briefcase size={18} className="text-indigo-600" />
              <span>Position &amp; Role</span>
            </h2>

            {/* Position Title */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">
                Job Title / Position <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g. Junior Architect, 3D Visualizer, Architecture Intern"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none font-medium"
                required
              />

              {/* Suggestions */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                <span className="text-xs text-gray-400 py-1">Popular:</span>
                {POPULAR_POSITIONS.slice(0, 5).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setPosition(pos)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded-lg transition"
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            {/* Workplace & Employment Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Workplace Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {WORKPLACE_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setWorkplaceType(type)}
                      className={`py-2.5 text-xs font-bold rounded-xl border transition ${
                        workplaceType === type
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Employment Type
                </label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white font-medium"
                >
                  {EMPLOYMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Functional Role */}
            <div className="pt-2">
              <label className="block text-sm font-bold text-gray-900 mb-1.5">
                Primary Functional Focus / Responsibilities
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Architectural Planning, Site Visits &amp; Coordination, Working Drawings"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-black outline-none font-medium"
              />
            </div>
          </section>

          {/* 3. EXPERIENCE, SALARY & QUALIFICATIONS */}
          <section className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-xs space-y-5">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 pb-3 border-b border-gray-100">
              <Clock size={18} className="text-indigo-600" />
              <span>Experience &amp; Compensation</span>
            </h2>

            {/* Experience Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Experience Level Required
              </label>
              <div className="flex flex-wrap gap-2">
                {EXPERIENCE_PRESETS.map((preset) => {
                  const isSelected = experience.includes(preset);
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleToggleExperience(preset)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                        isSelected
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {preset}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Salary Range */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">
                Salary / Stipend Range <span className="text-xs font-normal text-gray-400">(Optional)</span>
              </label>
              <input
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g. ₹25,000 - ₹35,000 / month, or ₹4,00,000 - ₹6,00,000 / year"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-black outline-none font-medium"
              />
            </div>

            {/* Qualifications */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">
                Required Qualifications
              </label>
              <input
                type="text"
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                placeholder="e.g. B.Arch, M.Arch, Diploma in Architecture"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-black outline-none font-medium"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {COMMON_QUALIFICATIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      if (!qualifications) setQualifications(q);
                      else if (!qualifications.includes(q)) setQualifications(`${qualifications}, ${q}`);
                    }}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded-lg transition"
                  >
                    + {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">
                Software &amp; Technical Skills
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {COMMON_SKILLS.map((skl) => {
                  const isSelected = skills.includes(skl);
                  return (
                    <button
                      key={skl}
                      type="button"
                      onClick={() => handleToggleSkill(skl)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {skl}
                    </button>
                  );
                })}
              </div>

              {/* Add custom skill */}
              <div className="flex gap-2 max-w-sm">
                <input
                  type="text"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={handleAddCustomSkill}
                  placeholder="Other skill (e.g. Twinmotion)"
                  className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSkill}
                  className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl text-xs font-bold text-gray-800"
                >
                  Add
                </button>
              </div>
            </div>
          </section>

          {/* 4. HIRING FLYER & DESCRIPTION */}
          <section className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-xs space-y-5">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 pb-3 border-b border-gray-100">
              <FileText size={18} className="text-indigo-600" />
              <span>Hiring Flyer &amp; Detailed Description</span>
            </h2>

            {/* Hiring Flyer / Poster */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">
                Upload Hiring Flyer / Vacancy Poster
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Upload your studio&apos;s hiring poster (JPEG, PNG). High-contrast flyers attract 3x more candidate views.
              </p>
              <ImageUploader value={flyerUrl} onChange={setFlyerUrl} folder="jobs" />
            </div>

            {/* Job Description Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-bold text-gray-900">
                  Full Job Description
                </label>
                <button
                  type="button"
                  onClick={generateAutoDescription}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <Sparkles size={12} />
                  <span>Generate from fields</span>
                </button>
              </div>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe project typologies, candidate responsibilities, culture, and key attributes your studio values..."
                className="w-full border border-gray-300 rounded-xl p-4 text-sm focus:border-black outline-none font-medium leading-relaxed"
              />
            </div>
          </section>

          {/* 5. CONTACT & APPLICATION INSTRUCTIONS */}
          <section className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-xs space-y-5">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 pb-3 border-b border-gray-100">
              <Mail size={18} className="text-indigo-600" />
              <span>Application Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">
                  Application Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={applicationEmail}
                  onChange={(e) => setApplicationEmail(e.target.value)}
                  placeholder="careers@studio.com"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-black outline-none font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">
                  Contact Phone / WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-black outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">
                Online Application Link / Google Form <span className="text-xs font-normal text-gray-400">(Optional)</span>
              </label>
              <input
                type="url"
                value={applyLink}
                onChange={(e) => setApplyLink(e.target.value)}
                placeholder="https://forms.gle/... or studio career page"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-black outline-none font-medium"
              />
            </div>
          </section>

          {/* SUBMIT BUTTON */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              By submitting, your listing will be sent to the Trapped Into Architecture verification queue.
            </p>

            {(() => {
              const compLvl = selectedCompany ? calculateCompanyLevel(selectedCompany) : null;
              const isCompGold = !selectedCompany || isAdmin || (compLvl && compLvl.score >= 66);

              return (
                <button
                  type="submit"
                  disabled={submitting || !isCompGold}
                  className={`w-full sm:w-auto font-bold text-sm px-8 py-4 rounded-2xl transition shadow-md flex items-center justify-center gap-2 ${
                    !isCompGold
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-black hover:bg-gray-800 text-white cursor-pointer disabled:opacity-50"
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting Opening...</span>
                    </>
                  ) : !isCompGold ? (
                    <>
                      <ShieldCheck size={16} />
                      <span>Studio Must Reach Gold (66%) to Post</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Submit Opening for Review</span>
                    </>
                  )}
                </button>
              );
            })()}
          </div>
        </form>
      </div>

      <Footer />
    </main>
  );
}

export default function PostJobPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
        </div>
      }
    >
      <PostJobContent />
    </Suspense>
  );
}
