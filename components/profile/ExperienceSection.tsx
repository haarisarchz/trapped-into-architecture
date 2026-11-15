"use client";

import React, { useState, useEffect, useRef } from "react";
import { Briefcase, Plus, Pencil, Trash2, Calendar, MapPin, Building2, Clock, Search, Check, ShieldCheck, Sparkles, ExternalLink, X, FileText, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ExperienceEntry, calculateTotalExperience, BadgeTier } from "@/utils/profileCompletion";
import { ORGANIZATION_TYPES } from "@/utils/institutionsData";
import UploadSuccessDialog from "./UploadSuccessDialog";

interface ExperienceSectionProps {
  userId: string;
  isOwner: boolean;
  experiences: ExperienceEntry[];
  onExperiencesChange: (newExp: ExperienceEntry[]) => void;
  onUploadStateChange?: (isUploading: boolean) => void;
  badgeTier?: BadgeTier;
}

interface OrgSuggestion {
  id: string;
  name: string;
  type: string;
  city?: string;
  state?: string;
  website?: string;
  source: "company" | "institution";
  university?: string;
}

export default function ExperienceSection({
  userId,
  isOwner,
  experiences,
  onExperiencesChange,
  onUploadStateChange,
  badgeTier = "bronze",
}: ExperienceSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [firmName, setFirmName] = useState("");
  const [organizationType, setOrganizationType] = useState(ORGANIZATION_TYPES[0]);
  const [position, setPosition] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("India");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);
  const [certificateName, setCertificateName] = useState<string | null>(null);
  const [certificateSize, setCertificateSize] = useState<number | null>(null);
  const [uploadingCert, setUploadingCert] = useState(false);
  const [certProgress, setCertProgress] = useState(0);

  // Combined certificate storage calculations: 4 MB standard, +5 MB for Platinum (9 MB total)
  const isPlatinumOrAbove = badgeTier === "platinum" || badgeTier === "diamond";
  const maxCombinedCertBytes = isPlatinumOrAbove ? 9 * 1024 * 1024 : 4 * 1024 * 1024;
  const maxCombinedCertMb = isPlatinumOrAbove ? 9 : 4;

  const totalCertificatesUsedBytes = experiences.reduce(
    (sum, exp) => sum + (exp.certificate_size || 0),
    0
  );

  const otherCertificatesBytes = experiences
    .filter((exp) => exp.id !== editingId)
    .reduce((sum, exp) => sum + (exp.certificate_size || 0), 0);

  // Success dialog state
  const [successDialog, setSuccessDialog] = useState<{
    isOpen: boolean;
    fileName: string;
    fileSizeFormatted: string;
  }>({
    isOpen: false,
    fileName: "",
    fileSizeFormatted: "",
  });

  // Track upload state & warn before unloading
  useEffect(() => {
    if (onUploadStateChange) {
      onUploadStateChange(uploadingCert);
    }
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (uploadingCert) {
        e.preventDefault();
        e.returnValue = "A file is currently uploading. If you leave now, the upload will be cancelled.";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [uploadingCert, onUploadStateChange]);

  // Autocomplete State
  const [orgSuggestions, setOrgSuggestions] = useState<OrgSuggestion[]>([]);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [searchingOrg, setSearchingOrg] = useState(false);
  const searchTimeoutRef = useRef<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // New Organization Submission Modal State
  const [showNewOrgModal, setShowNewOrgModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgType, setNewOrgType] = useState("Architecture Firm");
  const [newOrgCity, setNewOrgCity] = useState("");
  const [newOrgState, setNewOrgState] = useState("");
  const [newOrgWebsite, setNewOrgWebsite] = useState("");
  const [submittingNewOrg, setSubmittingNewOrg] = useState(false);
  const [pendingOrgSuccess, setPendingOrgSuccess] = useState(false);

  const totalExp = calculateTotalExperience(experiences);

  // Close dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowOrgDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search Organizations
  const handleFirmNameChange = (val: string) => {
    setFirmName(val);
    setSelectedOrgId(null);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const trimmed = val.trim();
    if (trimmed.length < 2) {
      setOrgSuggestions([]);
      setShowOrgDropdown(false);
      return;
    }

    setSearchingOrg(true);
    setShowOrgDropdown(true);

    const clean = trimmed;
    const noDots = clean.replace(/\./g, "").trim();
    const withDots = clean.replace(/[^a-zA-Z]/g, "").split("").join(".") + ".";

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const [compRes, instRes] = await Promise.all([
          supabase
            .from("companies")
            .select("id, firm_name, organization_type, city, state, website")
            .or(`firm_name.ilike.%${clean}%,firm_name.ilike.%${noDots}%`)
            .limit(6),
          supabase
            .from("institutions")
            .select("id, coa_code, institution_name, affiliated_university, locality, city, state")
            .or(`institution_name.ilike.%${clean}%,affiliated_university.ilike.%${clean}%,locality.ilike.%${clean}%,coa_code.ilike.%${clean}%,institution_name.ilike.%${noDots}%,affiliated_university.ilike.%${noDots}%,affiliated_university.ilike.%${withDots}%`)
            .limit(6),
        ]);

        const suggestions: OrgSuggestion[] = [];

        if (compRes.data) {
          compRes.data.forEach((c: any) => {
            suggestions.push({
              id: c.id,
              name: c.firm_name,
              type: c.organization_type || "Architecture Firm",
              city: c.city,
              state: c.state,
              website: c.website,
              source: "company",
            });
          });
        }

        if (instRes.data) {
          instRes.data.forEach((i: any) => {
            suggestions.push({
              id: i.id,
              name: i.institution_name,
              university: i.affiliated_university,
              type: "Academic / College Institution",
              city: i.city,
              state: i.state,
              source: "institution",
            });
          });
        }

        setOrgSuggestions(suggestions);
      } catch (err) {
        console.error("Error searching organizations:", err);
      } finally {
        setSearchingOrg(false);
      }
    }, 250);
  };

  const handleSelectOrg = (org: OrgSuggestion) => {
    setFirmName(org.name);
    setSelectedOrgId(org.id);
    if (org.city) setCity(org.city);
    if (org.type && ORGANIZATION_TYPES.includes(org.type)) {
      setOrganizationType(org.type);
    } else if (org.source === "institution") {
      const match = ORGANIZATION_TYPES.find(t => /institution|academic|education/i.test(t));
      if (match) setOrganizationType(match);
    }
    setShowOrgDropdown(false);
  };

  const openNewOrgModal = () => {
    setShowOrgDropdown(false);
    setNewOrgName(firmName.trim());
    setNewOrgCity(city.trim());
    setNewOrgType(organizationType);
    setShowNewOrgModal(true);
  };

  const handleCreateNewOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    setSubmittingNewOrg(true);
    try {
      const slug = `${newOrgName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now().toString().slice(-4)}`;

      // Insert unverified, inactive company record for platform review
      const { data, error } = await supabase
        .from("companies")
        .insert({
          firm_name: newOrgName.trim(),
          slug: slug,
          organization_type: newOrgType,
          city: newOrgCity.trim() || null,
          state: newOrgState.trim() || null,
          country: "India",
          website: newOrgWebsite.trim() || null,
          status: "pending_verification",
          is_active: false,
          is_verified: false,
          created_by: userId || null,
        })
        .select()
        .single();

      if (error) {
        console.warn("Notice inserting pending company:", error.message);
      }

      setFirmName(newOrgName.trim());
      if (newOrgCity.trim()) setCity(newOrgCity.trim());
      if (newOrgType) setOrganizationType(newOrgType);
      if (data?.id) setSelectedOrgId(data.id);

      setPendingOrgSuccess(true);
      setTimeout(() => {
        setPendingOrgSuccess(false);
        setShowNewOrgModal(false);
      }, 1500);
    } catch (err: any) {
      console.error("Error submitting new organization:", err);
      // Still set the name for the user
      setFirmName(newOrgName.trim());
      setShowNewOrgModal(false);
    } finally {
      setSubmittingNewOrg(false);
    }
  };

  const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check PDF only
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      alert("Only PDF files are accepted for Experience Certificate. Please select a valid PDF file.");
      e.target.value = "";
      return;
    }

    // Check combined certificate storage limit across all experiences
    const totalAfterUpload = otherCertificatesBytes + file.size;

    if (totalAfterUpload > maxCombinedCertBytes) {
      const remainingBytes = Math.max(0, maxCombinedCertBytes - otherCertificatesBytes);
      const remainingMb = (remainingBytes / (1024 * 1024)).toFixed(2);
      const usedMb = (otherCertificatesBytes / (1024 * 1024)).toFixed(2);
      const fileMb = (file.size / (1024 * 1024)).toFixed(2);
      const limitLabel = isPlatinumOrAbove ? "9 MB (Platinum Tier: 4MB + 5MB bonus)" : "4 MB";

      alert(
        `Combined Experience Certificates storage limit exceeded!\n\n` +
        `• Total Allowed Storage: ${limitLabel}\n` +
        `• Currently Used across other certificates: ${usedMb} MB\n` +
        `• Remaining Space: ${remainingMb} MB\n` +
        `• Selected File: ${fileMb} MB\n\n` +
        (isPlatinumOrAbove
          ? `Please compress your PDF to ${remainingMb} MB or less.`
          : `Please compress your PDF to ${remainingMb} MB or less, or reach Platinum Tier (85% profile completion) to unlock +5 MB extra certificate storage (9 MB total)!`)
      );
      e.target.value = "";
      return;
    }

    setUploadingCert(true);
    setCertProgress(5);

    try {
      // Upload using XMLHttpRequest for real progress
      const uploadWithProgress = (fileToUpload: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          const formData = new FormData();
          formData.append("file", fileToUpload);
          formData.append("folder", "/experience-certificates");

          xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable) {
              const pct = Math.min(95, Math.round((ev.loaded / ev.total) * 100));
              setCertProgress(pct);
            }
          };

          xhr.onload = async () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const res = JSON.parse(xhr.responseText);
                if (res.url) {
                  setCertProgress(100);
                  resolve(res.url);
                  return;
                }
              } catch (err) {}
            }

            // Fallback to Supabase Storage
            try {
              const ext = fileToUpload.name.split(".").pop() || "pdf";
              const fn = `cert-${userId}-${Date.now()}.${ext}`;
              const { error: upErr } = await supabase.storage
                .from("applicant-docs")
                .upload(fn, fileToUpload, { upsert: true });

              if (upErr) throw upErr;

              const { data: pubData } = supabase.storage
                .from("applicant-docs")
                .getPublicUrl(fn);

              setCertProgress(100);
              resolve(pubData.publicUrl);
            } catch (fallbackErr: any) {
              reject(new Error(xhr.responseText || fallbackErr.message || "Failed to upload certificate"));
            }
          };

          xhr.onerror = async () => {
            try {
              const ext = fileToUpload.name.split(".").pop() || "pdf";
              const fn = `cert-${userId}-${Date.now()}.${ext}`;
              const { error: upErr } = await supabase.storage
                .from("applicant-docs")
                .upload(fn, fileToUpload, { upsert: true });

              if (upErr) throw upErr;

              const { data: pubData } = supabase.storage
                .from("applicant-docs")
                .getPublicUrl(fn);

              setCertProgress(100);
              resolve(pubData.publicUrl);
            } catch (fallbackErr: any) {
              reject(fallbackErr);
            }
          };

          xhr.open("POST", "/api/upload");
          xhr.send(formData);
        });
      };

      const uploadedUrl = await uploadWithProgress(file);

      setCertificateUrl(uploadedUrl);
      setCertificateName(file.name);
      setCertificateSize(file.size);

      // Show Upload Success Dialog
      setSuccessDialog({
        isOpen: true,
        fileName: file.name,
        fileSizeFormatted: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      });
    } catch (err: any) {
      console.error("Certificate upload error:", err);
      alert(err.message || "Failed to upload certificate");
    } finally {
      setUploadingCert(false);
      setCertProgress(0);
      e.target.value = "";
    }
  };

  const handleRemoveCertificate = () => {
    setCertificateUrl(null);
    setCertificateName(null);
    setCertificateSize(null);
  };

  const resetForm = () => {
    setFirmName("");
    setOrganizationType(ORGANIZATION_TYPES[0]);
    setPosition("");
    setRoleDescription("");
    setCity("");
    setCountry("India");
    setStartDate("");
    setEndDate("");
    setIsCurrent(false);
    setSelectedOrgId(null);
    setCertificateUrl(null);
    setCertificateName(null);
    setCertificateSize(null);
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (entry: ExperienceEntry) => {
    setEditingId(entry.id || null);
    setFirmName(entry.firm_name || "");
    setOrganizationType(entry.organization_type || ORGANIZATION_TYPES[0]);
    setPosition(entry.position || "");
    setRoleDescription(entry.role_description || "");
    setCity(entry.city || "");
    setCountry(entry.country || "India");
    setStartDate(entry.start_date || "");
    setEndDate(entry.end_date || "");
    setIsCurrent(Boolean(entry.is_current));
    setSelectedOrgId((entry as any).company_id || null);
    setCertificateUrl(entry.certificate_url || null);
    setCertificateName(entry.certificate_name || null);
    setCertificateSize(entry.certificate_size || null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload: any = {
        user_id: userId,
        firm_name: firmName.trim(),
        organization_type: organizationType,
        position: position.trim(),
        role_description: roleDescription.trim() || null,
        city: city.trim() || null,
        country: country.trim() || "India",
        start_date: startDate,
        end_date: isCurrent ? null : endDate || null,
        is_current: isCurrent,
        certificate_url: certificateUrl,
        certificate_name: certificateName,
        certificate_size: certificateSize,
      };

      if (selectedOrgId) {
        payload.company_id = selectedOrgId;
      }

      if (editingId) {
        // Update with resilient fallback if company_id column not yet present
        let errUpdate = (await supabase.from("profile_experiences").update(payload).eq("id", editingId)).error;
        if (errUpdate && errUpdate.message?.includes("company_id")) {
          delete payload.company_id;
          errUpdate = (await supabase.from("profile_experiences").update(payload).eq("id", editingId)).error;
        }
        if (errUpdate) throw errUpdate;

        const updated = experiences.map((item) =>
          item.id === editingId ? { ...item, ...payload } : item
        );
        onExperiencesChange(updated);
      } else {
        // Insert with resilient fallback
        let insertRes = await supabase.from("profile_experiences").insert(payload).select().single();
        if (insertRes.error && insertRes.error.message?.includes("company_id")) {
          delete payload.company_id;
          insertRes = await supabase.from("profile_experiences").insert(payload).select().single();
        }
        if (insertRes.error) throw insertRes.error;

        onExperiencesChange([...experiences, insertRes.data || { ...payload, id: `temp-${Date.now()}` }]);
      }

      setModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error("Error saving experience:", err);
      alert(err.message || "Failed to save work experience.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this experience entry?")) return;

    try {
      const { error } = await supabase
        .from("profile_experiences")
        .delete()
        .eq("id", id);

      if (error) throw error;

      onExperiencesChange(experiences.filter((e) => e.id !== id));
    } catch (err: any) {
      console.error("Error deleting experience:", err);
      alert("Failed to delete experience.");
    }
  };

  // Sort experiences reverse chronologically
  const sortedExperiences = [...experiences].sort((a, b) => {
    const timeA = a.is_current ? Infinity : new Date(a.end_date || a.start_date).getTime();
    const timeB = b.is_current ? Infinity : new Date(b.end_date || b.start_date).getTime();
    return timeB - timeA;
  });

  return (
    <div className="border rounded-3xl p-6 md:p-8 bg-gray-50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Work Experience</h2>
          <p className="text-sm text-gray-500 mt-1">
            Firms, academic institutions, design roles, and project leadership
          </p>
        </div>

        {isOwner && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-semibold transition text-sm shadow-sm self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Add Experience</span>
          </button>
        )}
      </div>

      {/* Auto-computed Total Experience Bar */}
      <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-emerald-700 tracking-wider">
              Cumulative Experience
            </p>
            <p className="text-base font-extrabold text-emerald-950">
              {totalExp.years > 0 || totalExp.months > 0 || totalExp.days > 0
                ? `${totalExp.years} Years, ${totalExp.months} Months, ${totalExp.days} Days`
                : "Fresher / No work history added"}
            </p>
          </div>
        </div>
      </div>

      {/* Cumulative Experience Certificates Storage Bar */}
      {isOwner && (
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <FileText size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-gray-900">
                  Combined Experience Certificates Storage
                </p>
                {isPlatinumOrAbove ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                    💎 Platinum Perk: 9 MB (4MB + 5MB bonus)
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                    Combined Limit: 4 MB
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Total across all companies:{" "}
                <span className="font-bold text-gray-800">
                  {(totalCertificatesUsedBytes / (1024 * 1024)).toFixed(2)} MB
                </span>{" "}
                of <span className="font-bold text-gray-800">{maxCombinedCertMb} MB</span> used
                {!isPlatinumOrAbove && (
                  <span className="text-amber-700 ml-1 font-medium">
                    (Reach Platinum tier to unlock +5 MB bonus)
                  </span>
                )}
              </p>
            </div>
          </div>
          {/* Progress Mini Bar */}
          <div className="w-full sm:w-36">
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  totalCertificatesUsedBytes > maxCombinedCertBytes * 0.9
                    ? "bg-red-500"
                    : totalCertificatesUsedBytes > maxCombinedCertBytes * 0.7
                    ? "bg-amber-500"
                    : "bg-blue-600"
                }`}
                style={{
                  width: `${Math.min(100, (totalCertificatesUsedBytes / maxCombinedCertBytes) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Experience List */}
      {sortedExperiences.length === 0 ? (
        <div className="bg-white border border-gray-200/80 rounded-2xl p-10 text-center">
          <Briefcase size={40} className="mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-bold text-gray-800">No Work Experience Added</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            Add your architectural practice, internships, academic teaching, or firm engagements to showcase your industry tenure.
          </p>
          {isOwner && (
            <button
              onClick={openAddModal}
              className="mt-5 bg-black hover:bg-gray-800 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition"
            >
              Add First Experience
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedExperiences.map((exp) => (
            <div
              key={exp.id || Math.random()}
              className="bg-white rounded-2xl p-5 md:p-6 border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 text-black">
                  <Building2 size={22} />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900">{exp.position}</h3>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                      {exp.organization_type || "Firm"}
                    </span>
                  </div>

                  <p className="text-base font-semibold text-gray-800 mt-0.5">
                    {exp.firm_name}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-gray-500 font-medium">
                    {(exp.city || exp.country) && (
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-gray-400" />
                        {[exp.city, exp.country].filter(Boolean).join(", ")}
                      </span>
                    )}

                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-gray-400" />
                      {exp.start_date ? new Date(exp.start_date).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : ""} –{" "}
                      {exp.is_current ? (
                        <span className="text-emerald-600 font-semibold">Present (Currently Working)</span>
                      ) : exp.end_date ? (
                        new Date(exp.end_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                      ) : (
                        "Present"
                      )}
                    </span>
                  </div>

                  {exp.role_description && (
                    <p className="mt-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100 whitespace-pre-wrap leading-relaxed">
                      {exp.role_description}
                    </p>
                  )}

                  {/* Certificate Link if attached */}
                  {exp.certificate_url && (
                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold">
                      <FileText size={13} />
                      <a
                        href={exp.certificate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline flex items-center gap-1"
                      >
                        <span>{exp.certificate_name || "Experience Certificate"}</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {isOwner && (
                <div className="flex items-center gap-2 self-end md:self-start">
                  <button
                    onClick={() => openEditModal(exp)}
                    className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition"
                    title="Edit Experience"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete Experience"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODAL: ADD / EDIT EXPERIENCE */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl border border-gray-100 my-8">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {editingId ? "Edit Work Experience" : "Add Work Experience"}
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              Detail your role, firm or institutional background, and timeline.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Firm Name with Autocomplete */}
              <div className="relative" ref={dropdownRef}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold uppercase text-gray-500 block">
                    Firm / Institution Name <span className="text-red-500">*</span>
                  </label>
                  {selectedOrgId && (
                    <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Check size={11} /> Linked to Directory
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={firmName}
                    onChange={(e) => handleFirmNameChange(e.target.value)}
                    onFocus={() => {
                      if (orgSuggestions.length > 0) setShowOrgDropdown(true);
                    }}
                    placeholder="Type firm or college name (e.g. Sanjay Puri Architects, Morphogenesis, SPA)..."
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  {searchingOrg && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Autocomplete Dropdown */}
                {showOrgDropdown && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-gray-100 max-h-64 overflow-y-auto">
                    {orgSuggestions.length > 0 ? (
                      <div>
                        <div className="px-3 py-1.5 bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Matching Organizations in TI2A
                        </div>
                        {orgSuggestions.map((org) => (
                          <button
                            key={org.id}
                            type="button"
                            onClick={() => handleSelectOrg(org)}
                            className="w-full text-left px-4 py-2.5 hover:bg-amber-50/60 transition flex items-center justify-between gap-3 group"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-gray-900 group-hover:text-black truncate">
                                {org.name}
                              </p>
                              {org.university && (
                                <p className="text-xs text-amber-800 font-medium truncate mt-0.5">
                                  Affiliated: {org.university}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                                <span className="font-medium text-gray-700">{org.type}</span>
                                {org.city && <span>&bull; {org.city}{org.state ? `, ${org.state}` : ""}</span>}
                              </p>
                            </div>
                            <span className="text-xs text-gray-400 group-hover:text-black font-semibold shrink-0">
                              Select &rarr;
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      !searchingOrg && firmName.trim().length >= 2 && (
                        <div className="p-3 text-center text-xs text-gray-500">
                          No matching organization found for &quot;{firmName}&quot;
                        </div>
                      )
                    )}

                    {/* Can't find organization trigger */}
                    <div className="p-2.5 bg-gray-50 text-center border-t border-gray-100">
                      <button
                        type="button"
                        onClick={openNewOrgModal}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center justify-center gap-1.5 mx-auto"
                      >
                        <Plus size={13} />
                        <span>Can&apos;t find your organization? Submit a new organization</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Organization Type */}
              <div>
                <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                  Organization Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={organizationType}
                  onChange={(e) => setOrganizationType(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white"
                >
                  {ORGANIZATION_TYPES.map((org) => (
                    <option key={org} value={org}>{org}</option>
                  ))}
                </select>
              </div>

              {/* Position */}
              <div>
                <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                  Position / Designation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. Senior Project Architect / Assistant Professor / Architectural Intern"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white"
                />
              </div>

              {/* Location: City & Country */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bengaluru / Ahmedabad"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. India"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white"
                  />
                </div>
              </div>

              {/* Timeline: Start Date & End Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                    End Date
                  </label>
                  <input
                    type="date"
                    disabled={isCurrent}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white disabled:bg-gray-100"
                  />
                </div>
              </div>

              {/* Currently Working Here */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isCurrent}
                  onChange={(e) => setIsCurrent(e.target.checked)}
                  className="w-4 h-4 text-black rounded"
                />
                <span className="text-sm font-medium text-gray-700">Currently working in this role</span>
              </label>

              {/* Role & Project Responsibilities */}
              <div>
                <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                  Responsibilities & Projects Handled
                </label>
                <textarea
                  rows={3}
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  placeholder="Outline key project typologies, BIM coordination, client presentations, construction drawings, or academic courses taught..."
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm bg-white"
                />
              </div>

              {/* Experience Certificate Attachment (Combined 4 MB, or 9 MB for Platinum) */}
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/70">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-blue-600" />
                    <span className="text-xs font-bold text-gray-800">Experience Certificate</span>
                    {isPlatinumOrAbove && (
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100 border border-purple-200 px-1.5 py-0.5 rounded">
                        💎 +5MB Platinum Perk
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-500 font-semibold">
                    {otherCertificatesBytes > 0
                      ? `${(otherCertificatesBytes / (1024 * 1024)).toFixed(2)} MB of ${maxCombinedCertMb} MB combined used`
                      : `Max ${maxCombinedCertMb} MB combined limit (PDF only)`}
                  </span>
                </div>

                {certificateUrl ? (
                  <div className="bg-white p-2.5 rounded-lg border border-gray-200 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700 truncate max-w-[200px]">
                      {certificateName || "Certificate.pdf"}
                    </span>
                    <div className="flex items-center gap-1">
                      <a
                        href={certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline p-1"
                      >
                        Preview
                      </a>
                      <button
                        type="button"
                        onClick={handleRemoveCertificate}
                        disabled={uploadingCert}
                        className="text-xs text-red-500 hover:text-red-700 p-1 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className={`flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold py-2 px-3 rounded-lg border border-gray-300 cursor-pointer transition ${uploadingCert ? "opacity-60 pointer-events-none" : ""}`}>
                    <Upload size={13} />
                    <span>
                      {uploadingCert
                        ? `Uploading (${certProgress}%)...`
                        : `Attach Experience Certificate (PDF - ${maxCombinedCertMb}MB Combined Limit)`}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleCertificateUpload}
                      disabled={uploadingCert}
                      className="hidden"
                    />
                  </label>
                )}

                {/* Platinum perk encouragement if not yet platinum */}
                {!isPlatinumOrAbove && (
                  <p className="text-[10px] text-amber-700 mt-2 font-medium">
                    Tip: Platinum members unlock +5 MB extra certificate storage (9 MB total across all firms).
                  </p>
                )}

                {/* PROGRESS BAR NEAR CERTIFICATE SECTION */}
                {uploadingCert && (
                  <div className="mt-2 bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <div className="flex items-center justify-between text-xs font-bold text-blue-900 mb-1.5">
                      <span>Uploading Certificate...</span>
                      <span>{certProgress}%</span>
                    </div>
                    <div className="w-full bg-blue-200/70 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-150"
                        style={{ width: `${certProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={uploadingCert}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-black transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingCert}
                  className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Saving..." : uploadingCert ? "Uploading..." : editingId ? "Update Experience" : "Add Experience"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL: SUBMIT NEW ORGANIZATION (ADMIN REVIEW) */}
      {showNewOrgModal && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-gray-100 my-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  🏢
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Submit Organization for Review
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewOrgModal(false)}
                className="text-gray-400 hover:text-black p-1"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              Can&apos;t find your firm or institution? Enter the details below. Our team will verify and catalog it, and you can immediately proceed with saving your work experience.
            </p>

            {pendingOrgSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center animate-in zoom-in-95 duration-200">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2 font-bold">
                  ✓
                </div>
                <h4 className="font-bold text-gray-900 text-sm">Organization Submitted!</h4>
                <p className="text-xs text-gray-600 mt-1">
                  &quot;{newOrgName}&quot; is now attached to your experience.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateNewOrg} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-600 mb-1 block">
                    Organization / Firm Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    placeholder="Official Studio or Institution Name"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-gray-600 mb-1 block">
                    Organization Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newOrgType}
                    onChange={(e) => setNewOrgType(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {ORGANIZATION_TYPES.map((org) => (
                      <option key={org} value={org}>{org}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-600 mb-1 block">
                      City
                    </label>
                    <input
                      type="text"
                      value={newOrgCity}
                      onChange={(e) => setNewOrgCity(e.target.value)}
                      placeholder="e.g. Chennai, Mumbai"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-600 mb-1 block">
                      State
                    </label>
                    <input
                      type="text"
                      value={newOrgState}
                      onChange={(e) => setNewOrgState(e.target.value)}
                      placeholder="e.g. Tamil Nadu"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-gray-600 mb-1 block">
                    Website or Social Link <span className="text-gray-400 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="url"
                    value={newOrgWebsite}
                    onChange={(e) => setNewOrgWebsite(e.target.value)}
                    placeholder="https://companywebsite.com"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowNewOrgModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-black transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingNewOrg}
                    className="bg-black hover:bg-gray-800 text-white px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    {submittingNewOrg ? "Submitting..." : "Submit Organization & Select"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* UPLOAD SUCCESS DIALOG MODAL */}
      <UploadSuccessDialog
        isOpen={successDialog.isOpen}
        onClose={() => setSuccessDialog({ ...successDialog, isOpen: false })}
        fileName={successDialog.fileName}
        fileType="Experience Certificate"
        fileSizeFormatted={successDialog.fileSizeFormatted}
      />
    </div>
  );
}
