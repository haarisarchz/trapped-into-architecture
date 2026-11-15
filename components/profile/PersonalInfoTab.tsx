"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageSquare,
  Globe,
  EyeOff,
  MessageCircle,
  X,
  ExternalLink,
  Copy,
  Check,
  Info,
  Clock,
  RotateCcw,
  HelpCircle,
} from "lucide-react";
import { LinkedInBrandIcon, InstagramBrandIcon } from "@/components/icons/BrandIcons";
import MultiChipSelector, { ChipOption } from "./MultiChipSelector";

interface PersonalInfoTabProps {
  user: any;
  isOwner: boolean;
  onUserUpdate: (updated: any) => void;
  isUploadingDoc?: boolean;
}

function FieldInfoTooltip({ text, title }: { text: string; title?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center ml-1.5 align-middle select-none">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(!open);
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="text-gray-400 hover:text-black transition cursor-pointer p-0.5 rounded-full hover:bg-gray-200/70 inline-flex items-center justify-center"
        aria-label="Info"
      >
        <HelpCircle size={13} />
      </button>

      {open && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-[11px] font-normal normal-case rounded-xl shadow-xl z-50 pointer-events-none leading-relaxed animate-in fade-in zoom-in-95 duration-150">
          {title && <span className="font-bold text-amber-300 block mb-1 text-xs">{title}</span>}
          <span>{text}</span>
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
        </span>
      )}
    </span>
  );
}

export const PROFILE_TRACK_OPTIONS: ChipOption[] = [
  { value: "job_seeker", label: "🎯 Job Seeker / Candidate", desc: "Applying for architecture & design jobs" },
  { value: "internship_seeker", label: "📐 Internship Seeker", desc: "Seeking semester practical training & internships" },
  { value: "student", label: "🎓 Architecture Student (Studies & Thesis)", desc: "Exploring syllabus, thesis & college papers" },
  { value: "exam_aspirant", label: "📝 Exam Aspirant (GATE / NATA / UPSC / CPWD)", desc: "Practicing exam question papers & test prep" },
  { value: "quiz_player", label: "🧠 Quiz Competitor / Trivia Player", desc: "Playing architecture quizzes & climbing leaderboards" },
  { value: "firm_owner", label: "🏢 Firm Owner / Practice Principal", desc: "Managing firm profile, projects & company presence" },
  { value: "recruiter", label: "👔 Recruiter / Talent Scout", desc: "Posting jobs & scouting architecture candidates" },
  { value: "freelancer", label: "💼 Freelancer / Design Consultant", desc: "Open to freelance 3D, BIM, drafting & project gigs" },
  { value: "collaborator", label: "🤝 Design Collaborator / Joint Ventures", desc: "Seeking project associations with other firms" },
  { value: "academician", label: "🏛️ Academician / Researcher / Educator", desc: "Faculty networking, research papers & pedagogy" },
  { value: "institution_rep", label: "🏫 College / Institution Representative", desc: "Managing college profile, admissions & faculty" },
  { value: "juror_mentor", label: "🌟 Design Juror / Thesis Mentor / Speaker", desc: "Available for design juries, guest lectures & reviews" },
  { value: "writer", label: "📰 Architectural Writer / Critic / Journalist", desc: "Publishing design stories, news & firm features" },
  { value: "explorer", label: "☕ Casual Explorer / Architecture Reader", desc: "Browsing news feeds, trending projects & articles" },
];

export const PROFESSION_OPTIONS: ChipOption[] = [
  { value: "Assistant Professor", label: "Assistant Professor", desc: "Teaching & research faculty in architecture college" },
  { value: "Associate Professor", label: "Associate Professor", desc: "Senior academic teaching & studio mentor" },
  { value: "Professor", label: "Professor", desc: "Senior professorship / design chair" },
  { value: "Dean / Director / HOD", label: "Dean / Director / HOD", desc: "Head of architecture department or school" },
  { value: "Visiting Faculty", label: "Visiting Faculty / Juror", desc: "Visiting design instructor / external juror" },
  { value: "Principal Architect", label: "Principal Architect / Partner", desc: "Founder, partner or head of architecture firm" },
  { value: "Practising Architect", label: "Practising Architect", desc: "Licensed architect actively executing projects" },
  { value: "Project Architect", label: "Project Architect / Senior Architect", desc: "Leading project delivery, client & site coordination" },
  { value: "Junior Architect", label: "Junior Architect", desc: "Entry-level architect, drafting & design development" },
  { value: "Landscape Architect", label: "Landscape Architect", desc: "Specialist in outdoor public & private landscapes" },
  { value: "Urban Designer / Planner", label: "Urban Designer / Urban Planner", desc: "City planning, masterplanning & urban spaces" },
  { value: "Interior Architect / Designer", label: "Interior Architect / Designer", desc: "Interior spaces, spatial styling & detail design" },
  { value: "BIM Coordinator / Architect", label: "BIM Coordinator / Computational Designer", desc: "Revit, BIM management & computational modeling" },
  { value: "Architectural Visualizer", label: "Architectural Visualizer / 3D Artist", desc: "3D rendering, animation & CGI visualization" },
  { value: "Conservation Architect", label: "Conservation / Heritage Architect", desc: "Historic preservation & architectural restoration" },
  { value: "Architecture Student", label: "Architecture Student", desc: "Enrolled in B.Arch / M.Arch / Diploma degree" },
  { value: "Research Scholar", label: "Research Scholar / PhD Candidate", desc: "Doctoral researcher in architectural studies" },
  { value: "Freelance Architect", label: "Freelance Architect / Consultant", desc: "Independent design consultant" },
];

const GENDER_OPTIONS = [
  "Male",
  "Female",
  "Non-Binary",
  "Prefer not to say",
];

const QUALIFICATION_LEVELS = [
  "PhD / Doctorate",
  "Postgraduate (Masters / M.Arch)",
  "Undergraduate (Bachelors / B.Arch)",
  "Diploma",
  "High School / Secondary",
];

export default function PersonalInfoTab({
  user,
  isOwner,
  onUserUpdate,
  isUploadingDoc = false,
}: PersonalInfoTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...user });
  const [saving, setSaving] = useState(false);
  const [hasDraftAvailable, setHasDraftAvailable] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);

  // Helper to parse comma-separated or JSON string to chip array
  const parseToChips = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val.filter(Boolean);
    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch (e) {}
      return val.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [];
  };

  const [selectedTracks, setSelectedTracks] = useState<string[]>(() =>
    parseToChips(user?.user_track || "job_seeker")
  );
  const [selectedProfessions, setSelectedProfessions] = useState<string[]>(() =>
    parseToChips(user?.profession || "")
  );

  // Sync state when user prop updates
  React.useEffect(() => {
    setSelectedTracks(parseToChips(user?.user_track || "job_seeker"));
    setSelectedProfessions(parseToChips(user?.profession || ""));
    setFormData({ ...user });
  }, [user]);

  // Check for saved local draft on mount
  React.useEffect(() => {
    if (!user?.id) return;
    try {
      const rawDraft = localStorage.getItem(`ti2a_profile_draft_${user.id}`);
      if (rawDraft) {
        const parsed = JSON.parse(rawDraft);
        if (parsed && parsed.data) {
          const isDifferent = Object.keys(parsed.data).some(
            (k) => parsed.data[k] !== user[k] && parsed.data[k] !== undefined
          );
          if (isDifferent) {
            setHasDraftAvailable(true);
            if (parsed.timestamp) {
              setDraftSavedAt(
                new Date(parsed.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              );
            }
          }
        }
      }
    } catch (e) {}
  }, [user]);

  // Auto-save draft when editing
  React.useEffect(() => {
    if (isEditing && user?.id) {
      try {
        localStorage.setItem(
          `ti2a_profile_draft_${user.id}`,
          JSON.stringify({
            data: {
              ...formData,
              user_track: selectedTracks.join(", "),
              profession: selectedProfessions.join(", "),
            },
            timestamp: Date.now(),
          })
        );
      } catch (e) {}
    }
  }, [formData, selectedTracks, selectedProfessions, isEditing, user?.id]);

  const handleResumeDraft = () => {
    try {
      const rawDraft = localStorage.getItem(`ti2a_profile_draft_${user.id}`);
      if (rawDraft) {
        const parsed = JSON.parse(rawDraft);
        if (parsed && parsed.data) {
          setFormData(parsed.data);
          if (parsed.data.user_track) setSelectedTracks(parseToChips(parsed.data.user_track));
          if (parsed.data.profession) setSelectedProfessions(parseToChips(parsed.data.profession));
          setIsEditing(true);
          setHasDraftAvailable(false);
        }
      }
    } catch (e) {}
  };

  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem(`ti2a_profile_draft_${user.id}`);
      setSelectedTracks(parseToChips(user?.user_track || "job_seeker"));
      setSelectedProfessions(parseToChips(user?.profession || ""));
      setHasDraftAvailable(false);
    } catch (e) {}
  };

  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [phoneCode, setPhoneCode] = useState("");
  const [inputPhoneCode, setInputPhoneCode] = useState("");
  const [waMessageSent, setWaMessageSent] = useState(false);
  const [phoneVerifyError, setPhoneVerifyError] = useState("");
  const [phoneVerifySuccess, setPhoneVerifySuccess] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const handleVerifyEmail = async () => {
    if (!user.email) {
      alert("Please enter and save your email address first.");
      return;
    }
    setVerifyingEmail(true);
    try {
      const res = await fetch("/api/auth/send-verification-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          fullName: user.full_name || user.username,
          userId: user.id,
          isExistingUser: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send verification code.");
      }

      const enteredCode = window.prompt(
        `✉️ Verification code sent to ${user.email}!\n\nPlease enter the 6-digit verification code below to verify your email and unlock +5% profile completion score:`
      );

      if (!enteredCode || !enteredCode.trim()) {
        setVerifyingEmail(false);
        return;
      }

      const verifyRes = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          userId: user.id,
          code: enteredCode.trim(),
        }),
      });
      const verifyData = await verifyRes.json();
      if (verifyRes.ok && verifyData.success) {
        alert("🎉 Congratulations! Your email has been verified and your profile score increased by +5%.");
        const updatedUser = { ...user, email_verified: true, verified: true };
        setFormData((prev: any) => ({ ...prev, email_verified: true, verified: true }));
        if (typeof onUserUpdate === "function") {
          onUserUpdate(updatedUser);
        } else {
          window.location.reload();
        }
      } else {
        alert(verifyData.error || "Incorrect or expired verification code. Please try again.");
      }
    } catch (e: any) {
      alert(e.message || "Failed to process verification. Please try again.");
    } finally {
      setVerifyingEmail(false);
    }
  };

    const handleStartPhoneVerification = () => {
    const targetPhone = (formData.phone || user.phone || "").trim();
    if (!targetPhone) {
      alert("Please enter and save your contact phone/WhatsApp number in your profile first.");
      return;
    }
    // Generate secure 6-digit code
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setPhoneCode(randomCode);
    setInputPhoneCode("");
    setWaMessageSent(false);
    setPhoneVerifyError("");
    setPhoneVerifySuccess(false);
    setCodeCopied(false);
    setPhoneModalOpen(true);
  };

  const handleCopyCode = () => {
    if (phoneCode) {
      navigator.clipboard.writeText(phoneCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const handleConfirmPhoneVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneVerifyError("");

    if (!inputPhoneCode.trim()) {
      setPhoneVerifyError("Please enter the 6-digit verification code.");
      return;
    }

    if (inputPhoneCode.trim() !== phoneCode) {
      setPhoneVerifyError("Verification code does not match. Please enter the exact 6-digit code shown above.");
      return;
    }

    const targetPhone = (formData.phone || user.phone || "").trim();
    setVerifyingPhone(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          phone_verified: true,
          is_phone_verified: true,
          phone: targetPhone,
          whatsapp_number: formData.whatsapp_same_as_phone ? targetPhone : (formData.whatsapp_number || targetPhone),
        })
        .eq("id", user.id);

      if (error) throw error;

      setPhoneVerifySuccess(true);

      // Dispatch CEO notification for phone verification
      fetch("/api/notify/ceo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "USER_PHONE_VERIFIED",
          data: {
            userId: user.id,
            fullName: user.full_name || user.username || "Architect",
            username: user.username,
            email: user.email || "",
            phone: targetPhone,
          },
        }),
      }).catch((e) => console.warn("Failed to notify CEO of phone verification:", e));

      const updatedUser = {
        ...user,
        phone_verified: true,
        is_phone_verified: true,
        phone: targetPhone,
      };

      setFormData((prev: any) => ({
        ...prev,
        phone_verified: true,
        is_phone_verified: true,
        phone: targetPhone,
      }));

      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }

      setTimeout(() => {
        setPhoneModalOpen(false);
        setPhoneVerifySuccess(false);
      }, 2000);
    } catch (err: any) {
      setPhoneVerifyError(err.message || "Failed to verify phone. Please try again.");
    } finally {
      setVerifyingPhone(false);
    }
  };

  const handlePhoneChange = (val: string) => {
    const updated: any = { ...formData, phone: val };
    if (formData.whatsapp_same_as_phone) {
      updated.whatsapp_number = val;
    }
    setFormData(updated);
  };

  const handleSameAsPhoneToggle = (checked: boolean) => {
    setFormData({
      ...formData,
      whatsapp_same_as_phone: checked,
      whatsapp_number: checked ? (formData.phone || "") : (formData.whatsapp_number || ""),
    });
  };

  const handleSave = async () => {
    if (isUploadingDoc) {
      alert("A document is currently uploading. Please wait for the upload to complete before saving your profile.");
      return;
    }

    if (!formData.fullName || formData.fullName.trim() === "") {
      alert("Full Name is a required field.");
      return;
    }

    if (selectedProfessions.length === 0) {
      alert("Please select or enter at least one Profession. It is required.");
      return;
    }

    if (selectedTracks.length === 0) {
      alert("Please select at least one Profile Track.");
      return;
    }

    const userTrackString = selectedTracks.join(", ");
    const professionString = selectedProfessions.join(", ");

    setSaving(true);
    try {
      const payload: any = {
        full_name: formData.fullName,
        display_name: formData.displayName,
        username: formData.username,
        email: formData.email,
        phone: formData.phone || null,
        whatsapp_number: formData.whatsapp_same_as_phone ? (formData.phone || null) : (formData.whatsapp_number || null),
        whatsapp_same_as_phone: Boolean(formData.whatsapp_same_as_phone),
        linkedin_url: formData.linkedin_url || null,
        instagram_url: formData.instagram_url || null,
        portfolio_url: formData.portfolio_url || null,
        twitter_url: formData.twitter_url || null,
        dob: formData.dob || null,
        profession: professionString,
        education: formData.education || null,
        bio: formData.bio || null,
        tagline: formData.tagline || null,
        gender: formData.gender || null,
        highest_qualification: formData.highest_qualification || null,
        user_track: userTrackString || "job_seeker",
        coa_number: formData.coa_number || null,
        coa_valid_until: formData.coa_valid_until || null,
        coa_is_active: Boolean(formData.coa_is_active),
      };

      let dbPayload = { ...payload };
      let { error } = await supabase
        .from("profiles")
        .update(dbPayload)
        .eq("id", user.id);

      if (error && error.message?.includes("coa_valid_until")) {
        delete dbPayload.coa_valid_until;
        const retry = await supabase.from("profiles").update(dbPayload).eq("id", user.id);
        error = retry.error;
      }

      if (error) {
        alert(error.message);
        return;
      }

      const updatedUser = {
        ...user,
        ...formData,
        ...payload,
      };

      const stored = localStorage.getItem("currentUser");
      if (stored) {
        const current = JSON.parse(stored);
        if (current.id === user.id || current.username === user.username) {
          localStorage.setItem("currentUser", JSON.stringify({ ...current, ...updatedUser }));
        }
      }

      // Clear draft on successful save
      if (user?.id) {
        try {
          localStorage.removeItem(`ti2a_profile_draft_${user.id}`);
          setHasDraftAvailable(false);
        } catch (e) {}
      }

      onUserUpdate(updatedUser);
      setIsEditing(false);
      alert("Personal & contact details saved successfully!");
    } catch (err: any) {
      console.error("Save error:", err);
      alert(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border rounded-3xl p-6 md:p-8 bg-gray-50">
      {/* UNSAVED DRAFT ALERT BANNER */}
      {hasDraftAvailable && isOwner && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Clock size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900">Unsaved Profile Draft Available</p>
              <p className="text-[11px] text-amber-700">
                You have unsaved profile changes from your previous session {draftSavedAt ? `(${draftSavedAt})` : ""}.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleResumeDraft}
              className="text-xs font-bold px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw size={12} />
              <span>Resume Draft</span>
            </button>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="text-xs font-semibold px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-xl transition cursor-pointer"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Personal & Credentials</h2>
          <p className="text-sm text-gray-500 mt-1">
            Identity, Council of Architecture registration, contact info, and portfolio
          </p>
        </div>

        {isOwner && (
          <button
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setFormData({ ...user });
                setIsEditing(true);
              }
            }}
            disabled={saving || isUploadingDoc}
            className={`bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl font-semibold transition text-sm cursor-pointer shadow-sm ${
              isUploadingDoc ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {saving
              ? "Saving..."
              : isUploadingDoc
              ? "Uploading File... Please Wait"
              : isEditing
              ? "Save Changes"
              : "Edit Details"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FULL NAME */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
            Full Name <span className="text-red-500">*</span>
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.fullName || ""}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
              placeholder="Your official full name"
            />
          ) : (
            <p className="text-base font-semibold text-gray-900 bg-white p-3.5 rounded-xl border border-gray-100">
              {user.fullName || "Not provided"}
            </p>
          )}
        </div>

        {/* DISPLAY NAME */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center">
            <span>Display Name</span>
            <FieldInfoTooltip
              title="Display Name"
              text="Your public short name displayed across jobs, discussions, and your public profile (e.g. Ar. Haaris)."
            />
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.displayName || ""}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
              placeholder="Short public name"
            />
          ) : (
            <p className="text-base font-semibold text-gray-900 bg-white p-3.5 rounded-xl border border-gray-100">
              {user.displayName || user.fullName || "Not added"}
            </p>
          )}
        </div>

        {/* TAGLINE / HEADLINE */}
        <div className="md:col-span-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center">
            <span>Professional Tagline / Headline (LinkedIn Style)</span>
            <FieldInfoTooltip
              title="Professional Tagline"
              text="A one-line professional headline highlighting your primary expertise or dual roles (e.g. Principal Architect at Studio X | Associate Professor at College Y)."
            />
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.tagline || ""}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
              placeholder="e.g. Senior Project Architect | Sustainable Design Specialist | LEED AP"
            />
          ) : (
            <p className="text-base font-medium text-gray-800 bg-white p-3.5 rounded-xl border border-gray-100">
              {user.tagline || "No headline added yet"}
            </p>
          )}
        </div>

        {/* USER TRACK */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center">
            <span>Profile Track</span>
            <FieldInfoTooltip
              title="Profile Track (Platform Intent)"
              text="Your goals on TI2A (select up to 3): Tells firms and the community what you are here to do (e.g. actively seeking jobs, playing quizzes, preparing for exams, hiring for a firm, or casually reading)."
            />
          </label>
          {isEditing ? (
            <MultiChipSelector
              selected={selectedTracks}
              onChange={setSelectedTracks}
              maxItems={3}
              options={PROFILE_TRACK_OPTIONS}
              fieldLabel="Profile Tracks"
              placeholder="Search or select intent (e.g. Quiz Player, Exam Aspirant)..."
              allowCustom={false}
            />
          ) : (
            <div className="flex flex-wrap gap-2 p-2 bg-white rounded-xl border border-gray-100 min-h-[48px] items-center">
              {selectedTracks.length > 0 ? (
                selectedTracks.map((tr) => {
                  const opt = PROFILE_TRACK_OPTIONS.find(
                    (o) => o.value.toLowerCase() === tr.toLowerCase()
                  );
                  return (
                    <span
                      key={tr}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-900 rounded-lg text-xs font-bold border border-gray-200"
                    >
                      {opt ? opt.label : tr}
                    </span>
                  );
                })
              ) : (
                <span className="text-gray-400 text-sm italic">Not specified</span>
              )}
            </div>
          )}
        </div>

        {/* PROFESSION */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center">
            <span>Profession</span>
            <span className="text-red-500 ml-0.5">*</span>
            <FieldInfoTooltip
              title="Profession (Industry Identity)"
              text="Your clear-cut vocational title in the architecture community (select up to 2, e.g. Assistant Professor, Principal Architect, Architect, Student)."
            />
          </label>
          {isEditing ? (
            <MultiChipSelector
              selected={selectedProfessions}
              onChange={setSelectedProfessions}
              maxItems={2}
              options={PROFESSION_OPTIONS}
              fieldLabel="Professions"
              placeholder="Search or type profession (e.g. Assistant Professor)..."
              allowCustom={true}
            />
          ) : (
            <div className="flex flex-wrap gap-2 p-2 bg-white rounded-xl border border-gray-100 min-h-[48px] items-center">
              {selectedProfessions.length > 0 ? (
                selectedProfessions.map((prof) => (
                  <span
                    key={prof}
                    className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-900 rounded-lg text-xs font-bold border border-gray-200"
                  >
                    {prof}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-sm italic">Not specified</span>
              )}
            </div>
          )}
        </div>

        {/* HIGHEST QUALIFICATION */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center">
            <span>Highest Qualification</span>
            <FieldInfoTooltip
              title="Highest Qualification"
              text="Your highest completed academic degree level in architecture, planning, or allied design disciplines."
            />
          </label>
          {isEditing ? (
            <select
              value={formData.highest_qualification || ""}
              onChange={(e) => setFormData({ ...formData, highest_qualification: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
            >
              <option value="">Select Highest Level</option>
              {QUALIFICATION_LEVELS.map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          ) : (
            <p className="text-base font-semibold text-gray-900 bg-white p-3.5 rounded-xl border border-gray-100">
              {user.highest_qualification || "Not specified"}
            </p>
          )}
        </div>

        {/* GENDER */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
            Gender
          </label>
          {isEditing ? (
            <select
              value={formData.gender || ""}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
            >
              <option value="">Select Gender</option>
              {GENDER_OPTIONS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          ) : (
            <p className="text-base font-semibold text-gray-900 bg-white p-3.5 rounded-xl border border-gray-100">
              {user.gender || "Not added"}
            </p>
          )}
        </div>

        {/* DATE OF BIRTH */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Date of Birth
            </label>
            {user.hide_dob && (
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold border border-amber-200">
                <EyeOff size={11} /> Secret
              </span>
            )}
          </div>
          {isEditing ? (
            <input
              type="date"
              value={formData.dob || ""}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
            />
          ) : (!isOwner && user.hide_dob) ? (
            <p className="text-sm font-medium text-gray-400 bg-white p-3.5 rounded-xl border border-gray-100 italic">
              Hidden by user
            </p>
          ) : (
            <p className="text-base font-semibold text-gray-900 bg-white p-3.5 rounded-xl border border-gray-100">
              {user.dob || "Not added"}
            </p>
          )}
          <p className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1">
            <Info size={12} className="text-gray-400 shrink-0" />
            <span>Privacy: You can manage the visibility of this information in Settings.</span>
          </p>
        </div>

        {/* EMAIL */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Email Address
            </label>
            {user.hide_email && (
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold border border-amber-200">
                <EyeOff size={11} /> Secret
              </span>
            )}
          </div>
          {isEditing ? (
            <input
              type="email"
              value={formData.email || ""}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
            />
          ) : (!isOwner && user.hide_email) ? (
            <p className="text-sm font-medium text-gray-400 bg-white p-3.5 rounded-xl border border-gray-100 italic">
              Hidden by user
            </p>
          ) : (
            <p className="text-base font-semibold text-gray-900 bg-white p-3.5 rounded-xl border border-gray-100">
              {user.email || "Not added"}
            </p>
          )}
          <p className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1">
            <Info size={12} className="text-gray-400 shrink-0" />
            <span>Privacy: You can manage the visibility of this information in Settings.</span>
          </p>
          <div className="flex items-center justify-between mt-2 px-1">
            {user.email_verified || user.is_email_verified ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md font-semibold border border-emerald-200">
                <CheckCircle2 size={11} /> Email Verified (+5% earned)
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold border border-amber-200">
                  <AlertCircle size={11} /> Unverified (Verify for +5%)
                </span>
                {isOwner && user.email && (
                  <button
                    type="button"
                    onClick={handleVerifyEmail}
                    disabled={verifyingEmail}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer disabled:opacity-50"
                  >
                    {verifyingEmail ? "Sending..." : "Verify Email"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* PHONE NUMBER */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Phone Number
            </label>
            {user.hide_phone && (
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold border border-amber-200">
                <EyeOff size={11} /> Secret
              </span>
            )}
          </div>
          {isEditing ? (
            <input
              type="text"
              value={formData.phone || ""}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
            />
          ) : (!isOwner && user.hide_phone) ? (
            <p className="text-sm font-medium text-gray-400 bg-white p-3.5 rounded-xl border border-gray-100 italic">
              Hidden by user
            </p>
          ) : (
            <p className="text-base font-semibold text-gray-900 bg-white p-3.5 rounded-xl border border-gray-100">
              {user.phone || "Not added"}
            </p>
          )}
          <p className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1">
            <Info size={12} className="text-gray-400 shrink-0" />
            <span>Privacy: You can manage the visibility of this information in Settings.</span>
          </p>
          <div className="flex items-center justify-between mt-2 px-1">
            {user.phone_verified || user.is_phone_verified ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md font-semibold border border-emerald-200">
                <CheckCircle2 size={11} /> Phone Verified (+5% earned)
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold border border-amber-200">
                  <AlertCircle size={11} /> Unverified (Verify for +5%)
                </span>
                {isOwner && user.phone && (
                  <button
                    type="button"
                    onClick={handleStartPhoneVerification}
                    disabled={verifyingPhone}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer disabled:opacity-50"
                  >
                    {verifyingPhone ? "Verifying..." : "Verify Phone (+5%)"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* WHATSAPP NUMBER & "SAME AS PHONE NUMBER" */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
              WhatsApp Number
            </label>
            {user.hide_whatsapp && (
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold border border-amber-200">
                <EyeOff size={11} /> Secret
              </span>
            )}
          </div>
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                disabled={formData.whatsapp_same_as_phone}
                value={formData.whatsapp_same_as_phone ? (formData.phone || "") : (formData.whatsapp_number || "")}
                onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm disabled:bg-gray-100"
              />
              <label className="flex items-center gap-2 cursor-pointer pt-0.5">
                <input
                  type="checkbox"
                  checked={Boolean(formData.whatsapp_same_as_phone)}
                  onChange={(e) => handleSameAsPhoneToggle(e.target.checked)}
                  className="w-4 h-4 text-black rounded"
                />
                <span className="text-xs font-semibold text-gray-700">Same as phone number</span>
              </label>
            </div>
          ) : (!isOwner && user.hide_whatsapp) ? (
            <p className="text-sm font-medium text-gray-400 bg-white p-3.5 rounded-xl border border-gray-100 italic">
              Hidden by user
            </p>
          ) : (
            <p className="text-base font-semibold text-gray-900 bg-white p-3.5 rounded-xl border border-gray-100">
              {user.whatsapp_same_as_phone
                ? `${user.phone || "Not added"} (Same as phone)`
                : user.whatsapp_number || "Not added"}
            </p>
          )}
          <p className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1">
            <Info size={12} className="text-gray-400 shrink-0" />
            <span>Privacy: You can manage the visibility of this information in Settings.</span>
          </p>
        </div>

        {/* SOCIAL & PORTFOLIO LINKS SECTION */}
        <div className="md:col-span-2 bg-white border border-gray-200/80 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="text-gray-700" size={18} />
            <h3 className="font-bold text-gray-900 text-sm md:text-base">
              Social Media Accounts & Portfolio Links
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {/* LinkedIn */}
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1.5">
                <LinkedInBrandIcon size={14} />
                <span>LinkedIn Profile URL</span>
              </label>
              {isEditing ? (
                <input
                  type="url"
                  value={formData.linkedin_url || ""}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs bg-white"
                />
              ) : user.linkedin_url ? (
                <a
                  href={user.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 font-semibold hover:underline block truncate bg-gray-50 p-2.5 rounded-xl border border-gray-100"
                >
                  {user.linkedin_url}
                </a>
              ) : (
                <p className="text-xs text-gray-400 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  Not added
                </p>
              )}
            </div>

            {/* Instagram */}
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1.5">
                <InstagramBrandIcon size={14} />
                <span>Instagram Profile URL</span>
              </label>
              {isEditing ? (
                <input
                  type="url"
                  value={formData.instagram_url || ""}
                  onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                  placeholder="https://instagram.com/username"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs bg-white"
                />
              ) : user.instagram_url ? (
                <a
                  href={user.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-pink-600 font-semibold hover:underline block truncate bg-gray-50 p-2.5 rounded-xl border border-gray-100"
                >
                  {user.instagram_url}
                </a>
              ) : (
                <p className="text-xs text-gray-400 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  Not added
                </p>
              )}
            </div>

            {/* Portfolio / Website */}
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1.5">
                <Globe size={14} className="text-emerald-600" />
                <span>Portfolio / Behance / Website</span>
              </label>
              {isEditing ? (
                <input
                  type="url"
                  value={formData.portfolio_url || ""}
                  onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                  placeholder="https://behance.net/... or personal site"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs bg-white"
                />
              ) : user.portfolio_url ? (
                <a
                  href={user.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-600 font-semibold hover:underline block truncate bg-gray-50 p-2.5 rounded-xl border border-gray-100"
                >
                  {user.portfolio_url}
                </a>
              ) : (
                <p className="text-xs text-gray-400 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  Not added
                </p>
              )}
            </div>
          </div>
        </div>

        {/* COA SECTION (Council of Architecture) */}
        <div className="md:col-span-2 bg-blue-50/60 border border-blue-200/80 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="text-blue-600" size={20} />
            <h3 className="font-bold text-gray-900 text-base">
              Council of Architecture (COA) Registration
            </h3>
            <span className="text-[11px] font-bold text-blue-800 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded-full ml-auto">
              +15% High Trust
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center">
                  <span>COA Number</span>
                  <FieldInfoTooltip
                    title="Council of Architecture (COA)"
                    text="Your CA/YYYY/XXXXX registration number issued by COA India. Validates your official registration as an architect."
                  />
                </label>
                {user.hide_coa && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-semibold border border-amber-200">
                    <EyeOff size={11} /> Secret
                  </span>
                )}
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.coa_number || ""}
                  onChange={(e) => setFormData({ ...formData, coa_number: e.target.value })}
                  placeholder="CA/YYYY/XXXXX"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 bg-white text-sm"
                />
              ) : (!isOwner && user.hide_coa) ? (
                <p className="text-sm font-semibold text-gray-900 bg-white p-2.5 rounded-xl border border-blue-100 italic">
                  {user.coa_number ? "COA Verified (Number Hidden)" : "Not registered / Not added"}
                </p>
              ) : (
                <p className="text-sm font-semibold text-gray-900 bg-white p-2.5 rounded-xl border border-blue-100">
                  {user.coa_number || "Not registered / Not added"}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5 block">
                Validity Until / Expiry Date <span className="text-gray-400 font-normal lowercase">(optional)</span>
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.coa_valid_until || ""}
                  onChange={(e) => setFormData({ ...formData, coa_valid_until: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 bg-white text-sm"
                />
              ) : (
                <p className="text-sm font-semibold text-gray-900 bg-white p-2.5 rounded-xl border border-blue-100">
                  {user.coa_valid_until || "Not added"}
                </p>
              )}
            </div>
          </div>
          <p className="text-[11px] text-gray-500 mt-3 flex items-center gap-1">
            <Info size={12} className="text-gray-400 shrink-0" />
            <span>Privacy: You can manage the visibility of this information in Settings.</span>
          </p>
        </div>

        {/* BIO / ABOUT */}
        <div className="md:col-span-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
            About Me / Professional Bio
          </label>
          {isEditing ? (
            <textarea
              rows={4}
              value={formData.bio || ""}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full border border-gray-300 rounded-xl p-4 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
              placeholder="Tell other architects, institutions, and recruiters about your design philosophy, areas of practice, and accomplishments..."
            />
          ) : (
            <p className="text-sm text-gray-700 bg-white p-4 rounded-xl border border-gray-100 leading-relaxed whitespace-pre-wrap">
              {user.bio || "No bio added yet."}
            </p>
          )}
        </div>
      </div>

      {/* PHONE / WHATSAPP VERIFICATION MODAL */}
      {phoneModalOpen && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 relative">
            <button
              type="button"
              onClick={() => setPhoneModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black p-1 rounded-full cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                <MessageCircle size={22} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900">
                  Verify Phone Number
                </h3>
                <p className="text-xs text-gray-500">
                  Unlock +5% Profile Score &amp; Verified Badge
                </p>
              </div>
            </div>

            {/* TARGET PHONE */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Target Number
                </span>
                <span className="text-sm font-extrabold text-gray-900 font-mono">
                  {formData.phone || user.phone}
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                +5% Score
              </span>
            </div>

            {/* STEP 1: SEND ON WHATSAPP */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">
                  Step 1: Your 6-Digit Verification PIN
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  {codeCopied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  <span>{codeCopied ? "Copied!" : "Copy PIN"}</span>
                </button>
              </div>

              <div className="bg-gray-100 border border-gray-200 rounded-2xl p-3 text-center">
                <span className="text-2xl font-black tracking-widest text-gray-900 font-mono select-all">
                  {phoneCode}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  const targetMsg = `Hi Ti2A! Please verify my phone number for my profile (@${user.username || user.full_name || "candidate"}). My verification code is: ${phoneCode}`;
                  window.open(
                    `https://wa.me/918608609661?text=${encodeURIComponent(targetMsg)}`,
                    "_blank"
                  );
                  setWaMessageSent(true);
                }}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <MessageCircle size={15} />
                <span>Open WhatsApp &amp; Send to Ti2A Helpline (+91 8608609661)</span>
              </button>
              <p className="text-[10px] text-gray-400 text-center">
                Official Ti2A Helpline: +91 8608609661 • 100% Free
              </p>
            </div>

            {/* STEP 2: CONFIRM PIN */}
            <form onSubmit={handleConfirmPhoneVerification} className="space-y-3 pt-1 border-t border-gray-100">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Step 2: Enter PIN to Confirm
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={inputPhoneCode}
                  onChange={(e) => setInputPhoneCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit PIN"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-center text-lg font-black tracking-widest font-mono bg-white outline-none focus:border-black"
                />
              </div>

              {phoneVerifyError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-1.5 font-medium">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{phoneVerifyError}</span>
                </div>
              )}

              {phoneVerifySuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-1.5 font-bold">
                  <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
                  <span>🎉 Phone verified successfully! +5% profile completion score added.</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPhoneModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 hover:text-black font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifyingPhone || phoneVerifySuccess}
                  className="flex-1 py-2.5 bg-black hover:bg-gray-800 text-white font-extrabold text-xs rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {verifyingPhone ? "Verifying..." : "Confirm & Claim +5%"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
