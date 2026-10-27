"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ImageUploader from "@/components/ImageUploader";
import { generateCompanySlug } from "@/utils/jobUrl";
import {
  Building2,
  MapPin,
  Globe,
  Mail,
  Phone,
  Compass,
  Users,
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  Search,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

const ORGANIZATION_TYPES = [
  "Architecture & Interior Design Firm",
  "Architecture Firm",
  "Interior Design Studio",
  "Landscape & Urban Design Firm",
  "Construction & Development",
  "Academic / Institution",
];

export default function RegisterPracticePage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [createdSlug, setCreatedSlug] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Form Fields
  const [firmName, setFirmName] = useState("");
  const [organizationType, setOrganizationType] = useState("Architecture Firm");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const [description, setDescription] = useState("");
  const [principalArchitect, setPrincipalArchitect] = useState("");
  const [foundedYear, setFoundedYear] = useState("");
  const [employeeSize, setEmployeeSize] = useState("");

  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("currentUser");
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        if (user.email && !email) {
          setEmail(user.email);
        }
      }
    } catch (e) {}
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firmName.trim()) {
      setErrorMsg("Practice / Firm Name is required.");
      return;
    }

    if (!city.trim() || !state.trim()) {
      setErrorMsg("City and State are required for practice location.");
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      const baseSlug = generateCompanySlug(firmName.trim());
      let finalSlug = baseSlug;

      // Check if slug already exists
      const { data: existing } = await supabase
        .from("companies")
        .select("id, slug")
        .eq("slug", baseSlug)
        .maybeSingle();

      if (existing) {
        finalSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
      }

      const authorId = currentUser?.id || null;

      const payload: any = {
        firm_name: firmName.trim(),
        slug: finalSlug,
        organization_type: organizationType,
        city: city.trim(),
        state: state.trim(),
        neighborhood: area.trim() || null,
        address: address.trim() || null,
        logo_url: logoUrl || null,
        company_description: description.trim() || null,
        description: description.trim() || null,
        principal_architect: principalArchitect.trim() || null,
        founded_year: foundedYear ? parseInt(foundedYear) : null,
        employee_size: employeeSize || null,
        website_link: website.trim() || null,
        website: website.trim() || null,
        contact_email: email.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        instagram: instagram.trim() || null,
        linkedin: linkedin.trim() || null,
        created_by: authorId,
        created_at: new Date().toISOString(),
        is_claimed: true,
        badge_tier: "bronze",
        completion_percentage: 40,
        status: "pending_verification",
      };

      let { data, error } = await supabase.from("companies").insert([payload]).select().single();

      // If extended columns cause schema mismatch, fallback to core columns
      if (error && (error.message?.includes("badge_tier") || error.message?.includes("status"))) {
        delete payload.badge_tier;
        delete payload.completion_percentage;
        delete payload.is_claimed;
        delete payload.status;
        const retry = await supabase.from("companies").insert([payload]).select().single();
        if (retry.error) throw retry.error;
        data = retry.data;
      } else if (error) {
        throw error;
      }

      setCreatedSlug(finalSlug);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("Error creating studio profile:", err);
      setErrorMsg(err.message || "Failed to submit studio profile. Please try again.");
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-black flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-10 md:py-16">
        {/* BACK LINK */}
        <Link
          href="/companies"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black mb-6 transition"
        >
          <ChevronLeft size={16} />
          <span>Back to Companies Directory</span>
        </Link>

        {submitted ? (
          /* SUBMISSION CONFIRMATION SCREEN */
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 max-w-2xl mx-auto text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
              Studio Profile Submitted for Verification!
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-8 max-w-lg mx-auto">
              Thank you! Your submission for <strong className="text-gray-900">{firmName}</strong> has been received by our platform review team. Once confirmed, your practice dossier will be officially indexed in the verified directory.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/companies/${createdSlug}`}
                className="w-full sm:w-auto px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Preview Studio Profile</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/companies"
                className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition flex items-center justify-center"
              >
                Browse Companies Directory
              </Link>
            </div>
          </div>
        ) : (
          /* MAIN FORM CONTENT */
          <div>
            {/* HERO TITLE */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
                <Building2 size={13} />
                <span>Studio Profile Setup</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                Register your Practice
              </h1>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl">
                Create a verified profile for your architecture firm or design studio on Trapped Into Architecture. Showcase your design philosophy, publish career openings, and connect with prospective clients.
              </p>
            </div>

            {errorMsg && (
              <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-200 mb-6 text-sm font-semibold">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* FORM FIELDS (LEFT 2 COLUMNS) */}
              <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">
                {/* SECTION 1: STUDIO IDENTITY */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-100 space-y-6">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <Compass size={18} className="text-gray-900" />
                    <h2 className="text-base font-extrabold text-gray-900">
                      Studio Identity & Typology
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Practice / Firm Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={firmName}
                        onChange={(e) => setFirmName(e.target.value)}
                        placeholder="e.g. Studio Sculpt, Mindspace Architects, Morphogenesis"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Organization Typology *
                      </label>
                      <select
                        value={organizationType}
                        onChange={(e) => setOrganizationType(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
                      >
                        {ORGANIZATION_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Studio Logo
                      </label>
                      <div className="flex items-center gap-4">
                        <ImageUploader
                          value={logoUrl}
                          onChange={setLogoUrl}
                          bucket="companies"
                          label="Upload Studio Logo"
                        />
                        {logoUrl && (
                          <div className="w-16 h-16 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center shrink-0">
                            <img src={logoUrl} alt="Logo preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: LOCATION & HEADQUARTERS */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-100 space-y-6">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <MapPin size={18} className="text-rose-500" />
                    <h2 className="text-base font-extrabold text-gray-900">
                      Location & Studio Headquarters
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Chennai, Bengaluru, Mumbai"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="e.g. Tamil Nadu, Karnataka, Maharashtra"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Neighborhood / Area
                      </label>
                      <input
                        type="text"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        placeholder="e.g. Besant Nagar, Indiranagar"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Studio Street Address
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. 42nd Design Avenue, Creative Quarter"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: PRACTICE STATEMENT & LEADERSHIP */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-100 space-y-6">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <Award size={18} className="text-amber-500" />
                    <h2 className="text-base font-extrabold text-gray-900">
                      Design Statement & Leadership
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Studio Statement & Design Philosophy
                      </label>
                      <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Articulate your practice's design ethos, typological focus (residential, institutional, commercial), and architectural vision..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                          Principal Architect / Founder
                        </label>
                        <input
                          type="text"
                          value={principalArchitect}
                          onChange={(e) => setPrincipalArchitect(e.target.value)}
                          placeholder="e.g. Ar. Haaris, Ar. Priya"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                          Established Year
                        </label>
                        <input
                          type="number"
                          value={foundedYear}
                          onChange={(e) => setFoundedYear(e.target.value)}
                          placeholder="e.g. 2018"
                          min={1850}
                          max={new Date().getFullYear()}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                          Studio Team Scale
                        </label>
                        <select
                          value={employeeSize}
                          onChange={(e) => setEmployeeSize(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
                        >
                          <option value="">Select Team Size</option>
                          <option value="1-5">1-5 Members (Boutique)</option>
                          <option value="6-15">6-15 Members (Emerging Studio)</option>
                          <option value="16-50">16-50 Members (Medium Practice)</option>
                          <option value="51-100">51-100 Members (Large Firm)</option>
                          <option value="100+">100+ Members (Enterprise)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 4: OFFICIAL CHANNELS & CONTACT */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-100 space-y-6">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <Globe size={18} className="text-blue-500" />
                    <h2 className="text-base font-extrabold text-gray-900">
                      Official Web & Inquiries Channels
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Official Website
                      </label>
                      <input
                        type="text"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="e.g. https://studiosculpt.in"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Official Work / Contact Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. careers@studiosculpt.in"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Studio Phone / WhatsApp Number
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Instagram Handle or URL
                      </label>
                      <input
                        type="text"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        placeholder="e.g. @studiosculpt or instagram.com/..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        LinkedIn Page URL
                      </label>
                      <input
                        type="text"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="e.g. https://linkedin.com/company/studio-sculpt"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                  <p className="text-xs text-gray-500">
                    Your studio profile will be reviewed by administrators before being officially verified on the public directory.
                  </p>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-black hover:bg-gray-800 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-xl transition cursor-pointer disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Submitting for Verification...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Studio Profile for Verification</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* RIGHT-SIDE STICKY DISCLAIMER CARD */}
              <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-8">
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shadow-2xs">
                    <Search size={20} />
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-gray-900 leading-snug">
                      Before creating a new studio, check if your company exists
                    </h3>
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                      Many architecture, planning, and interior design practices are already indexed in our directory. Please check first to avoid duplicate listings.
                    </p>
                  </div>

                  <Link
                    href="/companies"
                    target="_blank"
                    className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-white border border-amber-300 hover:border-amber-400 text-amber-900 rounded-xl text-xs font-bold transition shadow-2xs group"
                  >
                    <span>Check Companies Directory</span>
                    <ExternalLink size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <div className="pt-3 border-t border-amber-200/60 text-[11px] text-gray-600 flex items-start gap-2">
                    <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      If your practice is already listed, you can simply click <strong>&quot;Claim this Studio&quot;</strong> on its profile for instant management access!
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-3 text-xs text-gray-500">
                  <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[11px]">
                    Why Register Your Practice?
                  </h4>
                  <ul className="space-y-2 leading-relaxed">
                    <li className="flex items-center gap-2 text-gray-700">
                      <span className="text-emerald-500 font-bold">✓</span> Direct architecture job candidate applications
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <span className="text-emerald-500 font-bold">✓</span> Verified studio trust badges (Bronze–Diamond)
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <span className="text-emerald-500 font-bold">✓</span> Showcase built works & team directory
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
