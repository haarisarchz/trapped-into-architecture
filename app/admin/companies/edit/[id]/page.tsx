"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import ImageUploader from "@/components/ImageUploader";
import {
  Sparkles,
  Award,
  ShieldCheck,
  MailCheck,
  PhoneCall,
  Check,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

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

function EditCompanyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const companyId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  // AI-Enriched tracking: key -> { original, suggested }
  const [aiFields, setAiFields] = useState<Record<string, { original: string; suggested: string }>>({});

  // Form State
  const [firmName, setFirmName] = useState("");
  const [organizationType, setOrganizationType] = useState("Architecture Firm");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [area, setArea] = useState("");
  const [country, setCountry] = useState("India");
  const [companyAddress, setCompanyAddress] = useState("");

  const [companyLogo, setCompanyLogo] = useState("");
  const [principalArchitect, setPrincipalArchitect] = useState("");
  const [employeeSize, setEmployeeSize] = useState("");
  const [foundedYear, setFoundedYear] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  
  const [companyFacebook, setCompanyFacebook] = useState("");
  const [companyInstagram, setCompanyInstagram] = useState("");
  const [companyLinkedin, setCompanyLinkedin] = useState("");
  const [companyTwitter, setCompanyTwitter] = useState("");
  const [companyWhatsapp, setCompanyWhatsapp] = useState("");

  // Badges & Tier State
  const [badgeTier, setBadgeTier] = useState("bronze");
  const [isClaimed, setIsClaimed] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  // Dynamic Score Calculation
  const calculateScore = () => {
    let score = 20; // Base creation
    if (companyLogo) score += 10;
    if (companyDescription && companyDescription.length > 30) score += 10;
    if (companyWebsite) score += 10;
    if (companyInstagram || companyLinkedin) score += 10;
    if (principalArchitect) score += 5;
    if (foundedYear || employeeSize) score += 5;
    if (isClaimed) score += 15;
    if (emailVerified) score += 10;
    if (phoneVerified) score += 5;
    return Math.min(score, 100);
  };

  const calculatedPercentage = calculateScore();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!user) {
      router.push("/");
      return;
    }
    
    if (companyId === "new" || companyId === "null") {
      const initialName = searchParams.get("name") || "";
      setFirmName(initialName);
      setCity(searchParams.get("city") || "");
      setState(searchParams.get("state") || "");
      setLoading(false);

      if (searchParams.get("ai") === "true" && initialName) {
        handleAutoEnrich(initialName);
      }
    } else if (companyId) {
      fetchCompany();
    }
  }, [companyId]);

  const fetchCompany = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", companyId)
        .single();

      if (error) throw error;
      if (data) {
        setFirmName(data.firm_name || "");
        setOrganizationType(normalizeOrganizationType(data.organization_type));
        setCity(data.city || "");
        setState(data.state || "");
        setCompanyAddress(data.address || "");
        setArea(data.neighborhood || "");
        setCountry(data.country || "India");

        setCompanyLogo(data.logo_url || "");
        setPrincipalArchitect(data.principal_architect || "");
        setEmployeeSize(data.employee_size?.toString() || "");
        setFoundedYear(data.founded_year?.toString() || "");
        setCompanyDescription(data.description || "");

        setCompanyWebsite(data.website || "");
        setCompanyEmail(data.email || "");
        setCompanyPhone(data.phone || "");

        setCompanyFacebook(data.facebook || "");
        setCompanyInstagram(data.instagram || "");
        setCompanyLinkedin(data.linkedin || "");
        setCompanyTwitter(data.twitter || "");
        setCompanyWhatsapp(data.whatsapp || "");

        if (data.badge_tier) setBadgeTier(data.badge_tier);
        if (data.is_claimed !== undefined) setIsClaimed(Boolean(data.is_claimed));
        if (data.email_verified !== undefined) setEmailVerified(Boolean(data.email_verified));
        if (data.phone_verified !== undefined) setPhoneVerified(Boolean(data.phone_verified));

        if (searchParams.get("ai") === "true") {
          handleAutoEnrich(data.firm_name, data.city, data.state, data.website);
        }
      }
    } catch (err: any) {
      console.error(err.message);
      alert("Error loading company details");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoEnrich = async (targetName = firmName, targetCity = city, targetState = state, targetWeb = companyWebsite) => {
    const nameToUse = targetName || firmName;
    if (!nameToUse) {
      alert("Please enter a company name before running AI enrichment.");
      return;
    }

    setAiLoading(true);
    setAiMessage(null);

    try {
      const res = await fetch("/api/companies/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firmName: nameToUse,
          city: targetCity || city,
          state: targetState || state,
          organizationType,
          website: targetWeb || companyWebsite,
        }),
      });

      const json = await res.json();
      if (json.success && json.suggestions) {
        const s = json.suggestions;
        const newAiFields: Record<string, { original: string; suggested: string }> = { ...aiFields };
        let filledCount = 0;

        // Description
        if (s.description && s.description !== companyDescription) {
          newAiFields.description = { original: companyDescription, suggested: s.description };
          setCompanyDescription(s.description);
          filledCount++;
        }

        // Principal Architect
        if (s.principal_architect && s.principal_architect !== principalArchitect) {
          newAiFields.principalArchitect = { original: principalArchitect, suggested: s.principal_architect };
          setPrincipalArchitect(s.principal_architect);
          filledCount++;
        }

        // Founded Year
        if (s.founded_year && s.founded_year.toString() !== foundedYear) {
          newAiFields.foundedYear = { original: foundedYear, suggested: s.founded_year.toString() };
          setFoundedYear(s.founded_year.toString());
          filledCount++;
        }

        // Employee Size
        if (s.employee_size && s.employee_size !== employeeSize) {
          newAiFields.employeeSize = { original: employeeSize, suggested: s.employee_size };
          setEmployeeSize(s.employee_size);
          filledCount++;
        }

        // Organization Type
        if (s.organization_type && s.organization_type !== organizationType) {
          newAiFields.organizationType = { original: organizationType, suggested: s.organization_type };
          setOrganizationType(s.organization_type);
          filledCount++;
        }

        // Website
        if (s.website && s.website !== companyWebsite) {
          newAiFields.website = { original: companyWebsite, suggested: s.website };
          setCompanyWebsite(s.website);
          filledCount++;
        }

        // Instagram
        if (s.instagram && s.instagram !== companyInstagram) {
          newAiFields.instagram = { original: companyInstagram, suggested: s.instagram };
          setCompanyInstagram(s.instagram);
          filledCount++;
        }

        // LinkedIn
        if (s.linkedin && s.linkedin !== companyLinkedin) {
          newAiFields.linkedin = { original: companyLinkedin, suggested: s.linkedin };
          setCompanyLinkedin(s.linkedin);
          filledCount++;
        }

        setAiFields(newAiFields);

        if (filledCount > 0) {
          setAiMessage(`✨ AI enriched ${filledCount} studio attributes! Look for the purple highlights below.`);
        } else {
          setAiMessage("AI verified your studio profile. All current attributes already match the latest details!");
        }
      } else {
        setAiMessage("Could not retrieve AI suggestions. You can manually enter details below.");
      }
    } catch (e: any) {
      console.error("AI error:", e);
      setAiMessage("AI suggestion error: " + (e.message || "Failed"));
    } finally {
      setAiLoading(false);
    }
  };

  // Revert a single AI field
  const handleRevertField = (fieldName: string, setter: (val: string) => void) => {
    if (aiFields[fieldName]) {
      setter(aiFields[fieldName].original);
      const copy = { ...aiFields };
      delete copy[fieldName];
      setAiFields(copy);
    }
  };

  // Revert all AI fields
  const handleRevertAll = () => {
    if (aiFields.description) setCompanyDescription(aiFields.description.original);
    if (aiFields.principalArchitect) setPrincipalArchitect(aiFields.principalArchitect.original);
    if (aiFields.foundedYear) setFoundedYear(aiFields.foundedYear.original);
    if (aiFields.employeeSize) setEmployeeSize(aiFields.employeeSize.original);
    if (aiFields.organizationType) setOrganizationType(aiFields.organizationType.original);
    if (aiFields.website) setCompanyWebsite(aiFields.website.original);
    if (aiFields.instagram) setCompanyInstagram(aiFields.instagram.original);
    if (aiFields.linkedin) setCompanyLinkedin(aiFields.linkedin.original);
    setAiFields({});
    setAiMessage("All AI suggestions reverted to their previous values.");
  };

  const handleSave = async () => {
    if (!firmName) {
      alert("Company Name is required.");
      return;
    }

    setSaving(true);
    try {
      const currentScore = calculateScore();
      
      // Auto-assign tier based on score if not manually overridden
      let autoTier = badgeTier;
      if (currentScore >= 95) autoTier = "diamond";
      else if (currentScore >= 85) autoTier = "platinum";
      else if (currentScore >= 70) autoTier = "gold";
      else if (currentScore >= 50) autoTier = "silver";
      else autoTier = "bronze";

      const baseCompanyPayload: any = {
        firm_name: firmName,
        city,
        state,
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
        founded_year: foundedYear ? parseInt(foundedYear) : null,
      };

      // Extended badges & levels fields
      const extendedPayload: any = {
        ...baseCompanyPayload,
        badge_tier: autoTier,
        completion_percentage: currentScore,
        is_claimed: isClaimed,
        email_verified: emailVerified,
        phone_verified: phoneVerified,
      };

      let authorId = (await supabase.auth.getUser()).data.user?.id;
      if (!authorId) {
        const user = JSON.parse(localStorage.getItem("currentUser") || "null");
        authorId = user ? user.id : null;
      }

      let error = null;

      if (companyId === "new" || companyId === "null") {
        const companySlug = firmName.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
        const origCb = searchParams.get("cb") || authorId;
        const origCa = searchParams.get("ca") || new Date().toISOString();
        
        let res = await supabase.from("companies").insert([
          {
            ...extendedPayload,
            slug: companySlug,
            created_by: origCb,
            created_at: origCa,
            updated_by: authorId,
            updated_at: new Date().toISOString(),
          },
        ]);

        if (res.error && res.error.message?.includes("badge_tier")) {
          res = await supabase.from("companies").insert([
            {
              ...baseCompanyPayload,
              slug: companySlug,
              created_by: origCb,
              created_at: origCa,
              updated_by: authorId,
              updated_at: new Date().toISOString(),
            },
          ]);
        }
        error = res.error;
      } else {
        let res = await supabase
          .from("companies")
          .update({
            ...extendedPayload,
            updated_by: authorId || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", companyId);

        if (res.error && res.error.message?.includes("badge_tier")) {
          res = await supabase
            .from("companies")
            .update({
              ...baseCompanyPayload,
              updated_by: authorId || null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", companyId);
        }
        error = res.error;
      }

      if (error) throw error;

      // Reset AI field tracking once saved
      setAiFields({});

      alert("Company details updated successfully!");
      router.push("/admin/companies");
    } catch (err: any) {
      console.error(err.message);
      alert("Failed to update company details: " + (err.message || JSON.stringify(err)));
    } finally {
      setSaving(false);
    }
  };

  // Helper styling for AI fields
  const getFieldClass = (fieldName: string, baseClass = "w-full border rounded-xl px-3 py-2.5 text-sm") => {
    if (aiFields[fieldName]) {
      return `${baseClass} border-purple-400 bg-purple-50/30 ring-2 ring-purple-100 transition-all`;
    }
    return `${baseClass} border-gray-200 transition-all`;
  };

  // Helper label badge for AI fields
  const renderAiBadge = (fieldName: string, revertFn?: () => void) => {
    if (!aiFields[fieldName]) return null;
    return (
      <span className="inline-flex items-center gap-1 ml-2">
        <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100 border border-purple-300 px-2 py-0.5 rounded-md shadow-2xs animate-pulse">
          ✨ AI Enriched
        </span>
        {revertFn && (
          <button
            type="button"
            onClick={revertFn}
            className="text-[10px] text-gray-400 hover:text-black underline cursor-pointer"
            title="Revert to previous value"
          >
            (Undo)
          </button>
        )}
      </span>
    );
  };

  const aiFieldsCount = Object.keys(aiFields).length;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F3F3F3]">
        <Navbar />
        <div className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 mt-20 flex justify-center items-center">
          <p>Loading company details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F3F3] text-black">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 mt-20 md:mt-24">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Edit Company: {firmName || "New Company"}</h1>
            <p className="text-xs text-gray-500 mt-1">
              Studio Level Score: <strong>{calculatedPercentage}%</strong> ({calculatedPercentage >= 95 ? "Diamond" : calculatedPercentage >= 85 ? "Platinum" : calculatedPercentage >= 70 ? "Gold" : calculatedPercentage >= 50 ? "Silver" : "Bronze"} Level Studio)
            </p>
          </div>

          <button
            onClick={() => handleAutoEnrich()}
            disabled={aiLoading}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 font-semibold px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50 text-sm"
          >
            <Sparkles size={16} />
            <span>{aiLoading ? "Researching Studio..." : "Auto-Fill with AI"}</span>
          </button>
        </div>

        {/* AI BANNER NOTIFICATION */}
        {aiMessage && (
          <div className="p-4 bg-purple-50 border border-purple-200 text-purple-900 rounded-2xl mb-6 text-sm flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-purple-600 shrink-0" />
              <span>{aiMessage}</span>
            </div>
            {aiFieldsCount > 0 && (
              <button
                type="button"
                onClick={handleRevertAll}
                className="text-xs text-purple-700 font-bold hover:underline flex items-center gap-1 cursor-pointer shrink-0"
              >
                <RotateCcw size={12} />
                <span>Revert All AI Changes</span>
              </button>
            )}
          </div>
        )}

        {/* AI ACTIVE ENRICHMENT CALLOUT */}
        {aiFieldsCount > 0 && (
          <div className="p-3 bg-gradient-to-r from-purple-100/80 to-indigo-100/80 border border-purple-300 text-purple-950 rounded-2xl mb-6 text-xs flex items-center justify-between">
            <span className="font-semibold">
              🟣 Currently highlighting <strong>{aiFieldsCount} AI-enriched attributes</strong> in purple. Color highlights will clear when you click &quot;Save Company&quot;.
            </span>
            <span className="text-[11px] text-purple-700 font-bold">Unsaved AI Draft</span>
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100">
          {/* SECTION: STUDIO LEVEL & TRUST BADGES */}
          <div className="mb-8 p-5 bg-gray-50 rounded-2xl border border-gray-200">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Award size={18} className="text-amber-600" />
              <span>Studio Level & Verification Badges</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-gray-700">Studio Level Tier</label>
                <select
                  value={badgeTier}
                  onChange={(e) => setBadgeTier(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm bg-white"
                >
                  <option value="bronze">🥉 Bronze Level Studio</option>
                  <option value="silver">🥈 Silver Level Studio</option>
                  <option value="gold">🥇 Gold Level Studio</option>
                  <option value="platinum">💎 Platinum Level Studio</option>
                  <option value="diamond">👑 Diamond Level Studio</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="chkClaimed"
                  checked={isClaimed}
                  onChange={(e) => setIsClaimed(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                />
                <label htmlFor="chkClaimed" className="text-sm font-medium text-gray-800 cursor-pointer flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-blue-600" />
                  <span>Claimed Studio</span>
                </label>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="chkEmailVerified"
                  checked={emailVerified}
                  onChange={(e) => setEmailVerified(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 cursor-pointer"
                />
                <label htmlFor="chkEmailVerified" className="text-sm font-medium text-gray-800 cursor-pointer flex items-center gap-1.5">
                  <MailCheck size={16} className="text-emerald-600" />
                  <span>Email Verified</span>
                </label>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="chkPhoneVerified"
                  checked={phoneVerified}
                  onChange={(e) => setPhoneVerified(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                />
                <label htmlFor="chkPhoneVerified" className="text-sm font-medium text-gray-800 cursor-pointer flex items-center gap-1.5">
                  <PhoneCall size={16} className="text-indigo-600" />
                  <span>Phone Verified</span>
                </label>
              </div>
            </div>
          </div>

          {/* Base Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block mb-1.5 text-sm font-medium">Company / Firm Name <span className="text-red-500">*</span></label>
              <input type="text" value={firmName} onChange={(e) => setFirmName(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium flex items-center">
                <span>Organization Type</span>
                {renderAiBadge("organizationType", () => handleRevertField("organizationType", setOrganizationType))}
              </label>
              <select
                value={organizationType}
                onChange={(e) => setOrganizationType(e.target.value)}
                className={getFieldClass("organizationType", "w-full border rounded-xl px-3 py-2.5 text-sm bg-white")}
              >
                <option value="Architecture Firm">Architecture Firm</option>
                <option value="Interior Design Studio">Interior Design Studio</option>
                <option value="Architecture & Interior Design">Architecture & Interior Design</option>
                <option value="Landscape & Urban Design">Landscape & Urban Design</option>
                <option value="Construction & Development">Construction & Development</option>
                <option value="Institution / Academic">Institution / Academic</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div>
              <label className="block mb-1.5 text-sm font-medium">Neighborhood</label>
              <input type="text" value={area} onChange={(e) => setArea(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium">City</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium">State</label>
              <input type="text" value={state} onChange={(e) => setState(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
            </div>
          </div>

          <div className="border-t border-gray-100 mb-8"></div>

          {/* Logo & Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div>
              <label className="block mb-3 text-sm font-medium">{organizationType} Logo</label>
              <ImageUploader value={companyLogo} onChange={(url) => setCompanyLogo(url)} label="Upload Logo" />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium flex items-center">
                <span>Principal Architect / Head</span>
                {renderAiBadge("principalArchitect", () => handleRevertField("principalArchitect", setPrincipalArchitect))}
              </label>
              <input
                type="text"
                value={principalArchitect}
                onChange={(e) => setPrincipalArchitect(e.target.value)}
                className={getFieldClass("principalArchitect")}
                placeholder="e.g. Ar. Haaris"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium flex items-center">
                <span>Employee Size</span>
                {renderAiBadge("employeeSize", () => handleRevertField("employeeSize", setEmployeeSize))}
              </label>
              <select
                value={employeeSize}
                onChange={(e) => setEmployeeSize(e.target.value)}
                className={getFieldClass("employeeSize", "w-full border rounded-xl px-3 py-2.5 text-sm bg-white")}
              >
                <option value="">Select Size</option>
                <option value="1-10">1-10</option>
                <option value="11-50">11-50</option>
                <option value="51-200">51-200</option>
                <option value="201-500">201-500</option>
                <option value="500+">500+</option>
              </select>
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium flex items-center">
                <span>Founded Year</span>
                {renderAiBadge("foundedYear", () => handleRevertField("foundedYear", setFoundedYear))}
              </label>
              <input
                type="number"
                min="1800"
                max={new Date().getFullYear()}
                value={foundedYear}
                onChange={(e) => setFoundedYear(e.target.value)}
                className={getFieldClass("foundedYear")}
                placeholder="2018"
              />
            </div>
          </div>

          {/* About & Contacts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider flex items-center">
                  <span>About {organizationType}</span>
                  {renderAiBadge("description", () => handleRevertField("description", setCompanyDescription))}
                </h3>
              </div>
              <textarea
                rows={6}
                value={companyDescription}
                onChange={(e) => setCompanyDescription(e.target.value)}
                className={getFieldClass("description", "w-full border rounded-xl px-3 py-2.5 text-sm resize-none h-[230px]")}
                placeholder="Describe practice design philosophy, typologies, and notable accomplishments..."
              />
            </div>
            <div>
              <h3 className="font-bold mb-3 text-sm text-gray-500 uppercase tracking-wider">Contact Details</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block mb-1.5 text-sm font-medium flex items-center">
                    <span>Website</span>
                    {renderAiBadge("website", () => handleRevertField("website", setCompanyWebsite))}
                  </label>
                  <input
                    type="url"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    className={getFieldClass("website")}
                    placeholder="https://studio.com"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className="w-full border rounded-xl px-3 py-2.5 text-sm"
                    placeholder="contact@studio.com"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium">Phone</label>
                  <input
                    type="text"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    className="w-full border rounded-xl px-3 py-2.5 text-sm"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="mb-8">
            <h3 className="font-bold mb-3 text-sm text-gray-500 uppercase tracking-wider">Social Media</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium">X (Twitter)</label>
                <input type="url" value={companyTwitter} onChange={(e) => setCompanyTwitter(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium">Facebook</label>
                <input type="url" value={companyFacebook} onChange={(e) => setCompanyFacebook(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium flex items-center">
                  <span>Instagram</span>
                  {renderAiBadge("instagram", () => handleRevertField("instagram", setCompanyInstagram))}
                </label>
                <input
                  type="url"
                  value={companyInstagram}
                  onChange={(e) => setCompanyInstagram(e.target.value)}
                  className={getFieldClass("instagram")}
                  placeholder="https://instagram.com/studio"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium flex items-center">
                  <span>LinkedIn</span>
                  {renderAiBadge("linkedin", () => handleRevertField("linkedin", setCompanyLinkedin))}
                </label>
                <input
                  type="url"
                  value={companyLinkedin}
                  onChange={(e) => setCompanyLinkedin(e.target.value)}
                  className={getFieldClass("linkedin")}
                  placeholder="https://linkedin.com/company/studio"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-100">
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 disabled:opacity-50 font-bold transition cursor-pointer shadow-sm"
            >
              {saving ? "Saving Changes..." : "Save Company"}
            </button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default function EditCompanyPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <EditCompanyContent />
    </Suspense>
  );
}
