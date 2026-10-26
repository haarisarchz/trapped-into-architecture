"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import ImageUploader from "@/components/ImageUploader";
import { Sparkles, Award, ShieldCheck, MailCheck, PhoneCall, Check, AlertCircle } from "lucide-react";

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
    if (!targetName) {
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
          firmName: targetName,
          city: targetCity,
          state: targetState,
          organizationType,
          website: targetWeb,
        }),
      });

      const json = await res.json();
      if (json.success && json.suggestions) {
        const s = json.suggestions;
        let filledCount = 0;

        if (!companyDescription && s.description) {
          setCompanyDescription(s.description);
          filledCount++;
        }
        if (!principalArchitect && s.principal_architect) {
          setPrincipalArchitect(s.principal_architect);
          filledCount++;
        }
        if (!foundedYear && s.founded_year) {
          setFoundedYear(s.founded_year.toString());
          filledCount++;
        }
        if (!employeeSize && s.employee_size) {
          setEmployeeSize(s.employee_size);
          filledCount++;
        }
        if (!companyWebsite && s.website) {
          setCompanyWebsite(s.website);
          filledCount++;
        }
        if (!companyInstagram && s.instagram) {
          setCompanyInstagram(s.instagram);
          filledCount++;
        }
        if (!companyLinkedin && s.linkedin) {
          setCompanyLinkedin(s.linkedin);
          filledCount++;
        }

        setAiMessage(`✨ AI enriched ${filledCount} studio attributes! Review the fields below and save.`);
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
        
        // Attempt insert with extended fields, fall back to base if columns not created yet
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
          // Fallback to base fields
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
        // Attempt update with extended fields, fall back to base if columns not created yet
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

      alert("Company details updated successfully!");
      router.push("/admin/companies");
    } catch (err: any) {
      console.error(err.message);
      alert("Failed to update company details: " + (err.message || JSON.stringify(err)));
    } finally {
      setSaving(false);
    }
  };

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

        {aiMessage && (
          <div className="p-4 bg-purple-50 border border-purple-200 text-purple-900 rounded-2xl mb-6 text-sm flex items-center gap-2">
            <Sparkles size={16} className="text-purple-600 shrink-0" />
            <span>{aiMessage}</span>
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
              <label className="block mb-1.5 text-sm font-medium">Organization Type</label>
              <select value={organizationType} onChange={(e) => setOrganizationType(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white">
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
              <label className="block mb-1.5 text-sm font-medium">Principal Architect / Head</label>
              <input type="text" value={principalArchitect} onChange={(e) => setPrincipalArchitect(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium">Employee Size</label>
              <select value={employeeSize} onChange={(e) => setEmployeeSize(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white">
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
              <input type="number" min="1800" max={new Date().getFullYear()} value={foundedYear} onChange={(e) => setFoundedYear(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
            </div>
          </div>

          {/* About & Contacts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-3 text-sm text-gray-500 uppercase tracking-wider">About {organizationType}</h3>
              <textarea rows={6} value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm resize-none h-[230px]" />
            </div>
            <div>
              <h3 className="font-bold mb-3 text-sm text-gray-500 uppercase tracking-wider">Contact Details</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block mb-1.5 text-sm font-medium">Website</label>
                  <input type="url" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium">Email</label>
                  <input type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium">Phone</label>
                  <input type="text" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
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
                <label className="block mb-1.5 text-sm font-medium">Instagram</label>
                <input type="url" value={companyInstagram} onChange={(e) => setCompanyInstagram(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium">LinkedIn</label>
                <input type="url" value={companyLinkedin} onChange={(e) => setCompanyLinkedin(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-100">
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 disabled:opacity-50 font-bold transition cursor-pointer"
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
