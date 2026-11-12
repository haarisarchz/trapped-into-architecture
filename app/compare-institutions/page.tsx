"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import {
  useInstitutionCompare,
  ComparedCollege,
} from "@/lib/hooks/useInstitutionCompare";
import institutionsCoordinates from "@/lib/data/institutionsCoordinates.json";
import {
  calculateHaversineDistanceKm,
  estimateRoadDistanceKm,
  estimateTravelTime,
  getDirectionsUrl,
  geocodeLocation,
} from "@/lib/utils/distanceCalculator";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Share2,
  Bookmark,
  MapPin,
  Building2,
  Calendar,
  Award,
  ExternalLink,
  X,
  Plus,
  Navigation,
  Home,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Table as TableIcon,
  Map as MapIcon,
  Sparkles,
  Check,
  Search,
  ChevronRight,
  TrendingUp,
  Info,
} from "lucide-react";

const CompareMapView = dynamic(
  () => import("@/components/institutions/CompareMapView"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[550px] rounded-3xl bg-gray-100 animate-pulse flex flex-col items-center justify-center text-gray-400 gap-2 border border-gray-200">
        <div className="w-8 h-8 rounded-full border-2 border-black border-t-transparent animate-spin" />
        <span className="text-xs font-semibold text-gray-500">Loading Map View...</span>
      </div>
    ),
  }
);

const coordsMap = institutionsCoordinates as unknown as Record<
  string,
  [number, number]
>;

function CompareInstitutionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    comparedColleges,
    removeCollege,
    addCollege,
    clearAll,
    maxLimit,
  } = useInstitutionCompare();

  // Active view: "table" | "map"
  const [activeTab, setActiveTab] = useState<"table" | "map">("table");

  // Detailed institutions fetched from Supabase
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Home Location state (Voluntary, stored in sessionStorage)
  const [homeInput, setHomeInput] = useState("");
  const [homeLocation, setHomeLocation] = useState<{
    name: string;
    lat: number;
    lng: number;
  } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [showHomeModal, setShowHomeModal] = useState(false);

  // Share link feedback
  const [copiedLink, setCopiedLink] = useState(false);

  // Shortlist save state
  const [savingShortlist, setSavingShortlist] = useState(false);
  const [shortlistSaved, setShortlistSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Quick Add Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addSearchQuery, setAddSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchingAdd, setSearchingAdd] = useState(false);

  // Load home location from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("ti2a_home_location");
      if (stored) {
        setHomeLocation(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  // Determine which IDs to load: URL ?ids= takes precedence, then local storage
  const effectiveIds = useMemo(() => {
    const queryIds = searchParams.get("ids");
    if (queryIds) {
      return queryIds
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, maxLimit);
    }
    return comparedColleges.map((c) => c.id).slice(0, maxLimit);
  }, [searchParams, comparedColleges, maxLimit]);

  // Fetch full details for effective institutions
  useEffect(() => {
    async function loadInstitutions() {
      if (effectiveIds.length === 0) {
        setInstitutions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [instRes, recRes, rankRes] = await Promise.all([
          supabase.from("institutions").select("*").in("id", effectiveIds),
          supabase
            .from("institution_annual_records")
            .select("*")
            .in("institution_id", effectiveIds)
            .order("academic_year", { ascending: false }),
          supabase
            .from("institution_rankings")
            .select("*")
            .in("institution_id", effectiveIds)
            .order("ranking_year", { ascending: false }),
        ]);

        if (instRes.data) {
          const annualMap: Record<string, any[]> = {};
          recRes.data?.forEach((r) => {
            if (!annualMap[r.institution_id]) annualMap[r.institution_id] = [];
            annualMap[r.institution_id].push(r);
          });

          const rankMap: Record<string, any[]> = {};
          rankRes.data?.forEach((rk) => {
            if (!rankMap[rk.institution_id]) rankMap[rk.institution_id] = [];
            rankMap[rk.institution_id].push(rk);
          });

          const hydrated = instRes.data.map((inst) => {
            const records = annualMap[inst.id] || [];
            const rankings = rankMap[inst.id] || [];

            // Sort annual records
            const sortedRecords = [...records].sort((a, b) => {
              const yrA = a.academic_year || "";
              const yrB = b.academic_year || "";
              const yrDiff = yrB.localeCompare(yrA);
              if (yrDiff !== 0) return yrDiff;
              const isUgA = (a.course_name || "").includes("B.Arch");
              const isUgB = (b.course_name || "").includes("B.Arch");
              if (isUgA && !isUgB) return -1;
              if (!isUgA && isUgB) return 1;
              return 0;
            });

            const latestRecord = sortedRecords[0] || null;

            // Multi-year analysis
            const validFuture = sortedRecords.filter(
              (r) =>
                r.academic_year &&
                r.academic_year >= "2027-2028" &&
                r.approved_intake > 0 &&
                !/closure|discontinued|withdrawn/i.test(r.approval_status || "")
            );
            let multiYearInfo = null;
            if (validFuture.length > 0) {
              const years = Array.from(new Set(validFuture.map((r) => r.academic_year))).sort();
              const maxYear = years[years.length - 1];
              const ug = validFuture.find((r) => (r.course_name || "").includes("B.Arch")) || validFuture[0];
              multiYearInfo = {
                maxYear,
                approvedIntake: ug.approved_intake,
                courseName: ug.course_name || "B.Arch",
              };
            }

            return {
              ...inst,
              annual_records: sortedRecords,
              latest_record: latestRecord,
              rankings,
              best_rank: rankings[0] || null,
              multi_year_info: multiYearInfo,
            };
          });

          // Sort in the order of effectiveIds
          hydrated.sort((a, b) => effectiveIds.indexOf(a.id) - effectiveIds.indexOf(b.id));
          setInstitutions(hydrated);

          // If query param brought in new institutions, sync them into comparedColleges
          if (searchParams.get("ids")) {
            hydrated.forEach((h) => addCollege(h));
          }
        }
      } catch (err) {
        console.error("Error loading compared institutions:", err);
      } finally {
        setLoading(false);
      }
    }

    loadInstitutions();
  }, [effectiveIds, searchParams, addCollege]);

  // Calculate distance map for all compared colleges
  const distancesMap = useMemo(() => {
    if (!homeLocation) return {};
    const map: Record<string, { straightKm: number; roadKm: number; time: string }> = {};

    institutions.forEach((inst) => {
      const coa = inst.coa_code || "";
      const coords = coordsMap[coa] || coordsMap[inst.id];
      if (coords) {
        const straight = calculateHaversineDistanceKm(
          homeLocation.lat,
          homeLocation.lng,
          coords[0],
          coords[1]
        );
        const road = estimateRoadDistanceKm(straight);
        const time = estimateTravelTime(road);
        map[inst.id] = { straightKm: straight, roadKm: road, time };
      }
    });

    return map;
  }, [institutions, homeLocation]);

  // Handle Home Location Submission
  const handleSetHome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeInput.trim()) return;

    setIsGeocoding(true);
    const geo = await geocodeLocation(homeInput.trim());
    setIsGeocoding(false);

    if (geo) {
      setHomeLocation(geo);
      sessionStorage.setItem("ti2a_home_location", JSON.stringify(geo));
      setShowHomeModal(false);
      setHomeInput("");
    } else {
      alert("Could not locate this city or PIN code. Please verify the spelling (e.g. 'Bhopal', 'Pune', '600001').");
    }
  };

  // Handle Device Geolocation
  const handleUseDeviceLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsGeocoding(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const result = { name: "Current Location", lat, lng };
        setHomeLocation(result);
        sessionStorage.setItem("ti2a_home_location", JSON.stringify(result));
        setIsGeocoding(false);
        setShowHomeModal(false);
      },
      (err) => {
        setIsGeocoding(false);
        alert("Unable to retrieve your location: " + err.message);
      },
      { timeout: 10000 }
    );
  };

  const handleClearHome = () => {
    setHomeLocation(null);
    sessionStorage.removeItem("ti2a_home_location");
  };

  // Copy or Share Link
  const handleShareLink = async () => {
    if (institutions.length === 0) return;
    const ids = institutions.map((i) => i.id).join(",");
    const url = `${window.location.origin}/compare-institutions?ids=${ids}`;
    const collegeNames = institutions.map((i) => i.coa_code || i.institution_name).join(", ");
    const shareTitle = "Compare Architecture Institutions - Trapped Into Architecture";
    const shareText = `Check out this architecture college comparison on TI2A: ${collegeNames}`;

    // On mobile devices with native share sheet (WhatsApp, Telegram, etc.)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: url,
        });
        return;
      } catch (err: any) {
        // User cancelled or share dismissed, fallback to copy
        if (err.name === "AbortError") return;
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      prompt("Copy this link to share your comparison:", url);
    }
  };

  // Trigger registration modal
  const handleOpenRegister = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("openAuth", { detail: "register" }));
    }
  };

  // Save to Supabase Shortlist
  const handleSaveShortlist = async () => {
    const userStr = localStorage.getItem("currentUser");
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user || !user.id) {
      // Trigger registration prompt
      handleOpenRegister();
      return;
    }

    setSavingShortlist(true);
    setSaveError(null);
    try {
      // 1. Create or get user's default shortlist
      const shortlistTitle = `Architecture Shortlist (${new Date().toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      })})`;

      const { data: slData, error: slErr } = await supabase
        .from("user_shortlists")
        .insert({
          user_id: user.id,
          shortlist_name: shortlistTitle,
        })
        .select()
        .single();

      if (slErr) throw slErr;

      // 2. Insert institutions
      if (slData?.id && institutions.length > 0) {
        const rows = institutions.map((inst, index) => ({
          shortlist_id: slData.id,
          institution_id: inst.id,
          display_order: index,
        }));

        const { error: itemErr } = await supabase
          .from("shortlist_institutions")
          .insert(rows);

        if (itemErr) throw itemErr;
      }

      setShortlistSaved(true);
      setTimeout(() => setShortlistSaved(false), 3000);
    } catch (err: any) {
      console.error("Save shortlist error:", err);
      setSaveError(err.message || "Failed to save shortlist");
    } finally {
      setSavingShortlist(false);
    }
  };

  // Quick Add Search
  const handleSearchColleges = async (val: string) => {
    setAddSearchQuery(val);
    if (!val.trim() || val.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchingAdd(true);
    try {
      const clean = val.trim();
      const { data } = await supabase
        .from("institutions")
        .select("id, coa_code, institution_name, city, state, slug")
        .or(`institution_name.ilike.%${clean}%,coa_code.ilike.%${clean}%,city.ilike.%${clean}%,state.ilike.%${clean}%`)
        .limit(8);

      setSearchResults(data || []);
    } catch (e) {
      console.error("Search colleges error:", e);
    } finally {
      setSearchingAdd(false);
    }
  };

  const handleAddSearchResult = (inst: any) => {
    addCollege(inst);
    setIsAddModalOpen(false);
    setAddSearchQuery("");
    setSearchResults([]);
  };

  const pinColors = ["#000000", "#d97706", "#2563eb", "#059669"];

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <Navbar />

      <main className="flex-1 pb-24">
        {/* TOP COMMAND BAR */}
        <section className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Left: Back & Title */}
            <div className="flex items-center gap-3">
              <Link
                href="/institutions"
                className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-xl transition"
                title="Back to Directory"
              >
                <ArrowLeft size={18} />
              </Link>
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 flex items-center gap-2">
                  <span>Compare Architecture Institutions</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-black text-white">
                    {institutions.length} / {maxLimit}
                  </span>
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Side-by-side official Council of Architecture (COA) data, approved seats, and distance calculation.
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
              {/* Table / Map View Toggle */}
              <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => setActiveTab("table")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeTab === "table"
                      ? "bg-white text-black shadow-2xs"
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  <TableIcon size={14} />
                  <span>Table View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("map")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeTab === "map"
                      ? "bg-white text-black shadow-2xs"
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  <MapIcon size={14} />
                  <span>Map View</span>
                </button>
              </div>

              {/* Set Home Location Button */}
              <button
                type="button"
                onClick={() => setShowHomeModal(true)}
                className={`text-xs font-bold px-3 py-2 rounded-xl border transition flex items-center gap-1.5 ${
                  homeLocation
                    ? "bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100"
                    : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
                }`}
              >
                <Home size={13} className={homeLocation ? "text-blue-600" : "text-gray-500"} />
                <span className="truncate max-w-[120px]">
                  {homeLocation ? homeLocation.name : "Set Home (Distance)"}
                </span>
              </button>

              {/* Share Link */}
              <button
                type="button"
                onClick={handleShareLink}
                disabled={institutions.length === 0}
                className="text-xs font-bold px-3 py-2 rounded-xl bg-white border border-gray-200 hover:border-black text-gray-800 transition flex items-center gap-1.5 shadow-2xs active:scale-95"
                title="Copy shareable link"
              >
                {copiedLink ? (
                  <>
                    <Check size={14} className="text-emerald-600" />
                    <span className="text-emerald-700 font-extrabold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 size={13} />
                    <span>Share</span>
                  </>
                )}
              </button>

              {/* Save Shortlist */}
              <button
                type="button"
                onClick={handleSaveShortlist}
                disabled={institutions.length === 0 || savingShortlist}
                className="text-xs font-bold px-3.5 py-2 rounded-xl bg-black text-white hover:bg-gray-800 transition flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                {shortlistSaved ? (
                  <>
                    <Check size={14} className="text-emerald-400" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Bookmark size={13} />
                    <span>Save Shortlist</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* MAIN BODY */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Gentle Student Registration Banner */}
          <div className="mb-6 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 text-amber-700">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-amber-950">
                  Keep your college comparison & shortlist saved!
                </h3>
                <p className="text-xs text-amber-800/90 mt-0.5">
                  Create a free student account to save your shortlisted colleges, reopen comparisons across any device, and track future COA updates.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={handleOpenRegister}
                className="text-xs font-extrabold px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-xl transition shadow-xs"
              >
                Create Free Account
              </button>
            </div>
          </div>

          {/* EMPTY STATE */}
          {institutions.length === 0 && !loading && (
            <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-xl mx-auto my-12 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto mb-4 text-gray-400">
                <TableIcon size={28} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">No Institutions in Comparison</h2>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                You haven&apos;t added any colleges to compare yet. Browse the architecture directory and click &quot;Compare&quot; on up to 4 institutions to see them side-by-side.
              </p>
              <Link
                href="/institutions"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-black text-white hover:bg-gray-800 text-xs font-extrabold rounded-xl transition shadow-sm"
              >
                <Search size={14} />
                <span>Explore Institution Directory</span>
              </Link>
            </div>
          )}

          {/* LOADING STATE */}
          {loading && (
            <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-xs flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-black border-t-transparent animate-spin" />
              <p className="text-xs font-semibold text-gray-600">
                Loading official institution records, historical intake, and map coordinates...
              </p>
            </div>
          )}

          {/* ACTIVE CONTENT: TABLE OR MAP */}
          {!loading && institutions.length > 0 && (
            <>
              {activeTab === "map" ? (
                /* MAP VIEW */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-extrabold text-gray-900">
                        Geographic Comparison Map
                      </h2>
                      <p className="text-xs text-gray-500">
                        Campuses plotted with verified coordinates. {homeLocation ? "Distance lines show route from home." : "Set your home location above to see direct travel distance."}
                      </p>
                    </div>
                  </div>

                  <CompareMapView
                    institutions={institutions}
                    homeLocation={homeLocation}
                    distances={distancesMap}
                    onRemoveInstitution={removeCollege}
                  />
                </div>
              ) : (
                /* TABLE VIEW */
                <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50/80">
                          {/* Attribute Header */}
                          <th className="p-4 sm:p-5 w-48 sm:w-64 min-w-[180px] text-xs font-black uppercase tracking-wider text-gray-400 sticky left-0 bg-gray-50 z-20 border-r border-gray-200/80">
                            Attribute / College
                          </th>

                          {/* Institutions Columns */}
                          {institutions.map((inst, index) => {
                            const color = pinColors[index % pinColors.length];
                            return (
                              <th
                                key={inst.id}
                                className="p-4 sm:p-5 min-w-[260px] sm:min-w-[300px] max-w-[340px] align-top border-r last:border-r-0 border-gray-200"
                              >
                                <div className="space-y-2">
                                  {/* Number & Remove */}
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5">
                                      <span
                                        className="text-[11px] font-black font-mono px-2 py-0.5 rounded text-white"
                                        style={{ backgroundColor: color }}
                                      >
                                        #{index + 1} {inst.coa_code || "COA"}
                                      </span>
                                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                                        {inst.state}
                                      </span>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => removeCollege(inst.id)}
                                      className="text-gray-400 hover:text-red-600 p-1 rounded-lg hover:bg-gray-100 transition"
                                      title="Remove from comparison"
                                    >
                                      <X size={15} />
                                    </button>
                                  </div>

                                  {/* College Name */}
                                  <h3 className="font-extrabold text-sm sm:text-base text-gray-900 leading-snug line-clamp-2">
                                    <Link
                                      href={`/institutions/${inst.slug}`}
                                      className="hover:text-blue-600 transition"
                                      target="_blank"
                                    >
                                      {inst.institution_name}
                                    </Link>
                                  </h3>

                                  {/* View Profile Action */}
                                  <Link
                                    href={`/institutions/${inst.slug}`}
                                    target="_blank"
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
                                  >
                                    <span>Open Full Profile</span>
                                    <ExternalLink size={10} />
                                  </Link>
                                </div>
                              </th>
                            );
                          })}

                          {/* Slot for Adding More if < maxLimit */}
                          {institutions.length < maxLimit && (
                            <th className="p-4 sm:p-5 min-w-[200px] align-middle text-center bg-gray-50/40 border-dashed border-r border-gray-200">
                              <button
                                type="button"
                                onClick={() => setIsAddModalOpen(true)}
                                className="w-full py-8 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-black rounded-2xl text-gray-500 hover:text-black transition bg-white/50 hover:bg-white"
                              >
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                  <Plus size={20} />
                                </div>
                                <span className="text-xs font-bold">
                                  Add Another College ({maxLimit - institutions.length} left)
                                </span>
                              </button>
                            </th>
                          )}
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                        {/* 1. REGULATORY STATUS */}
                        <tr>
                          <td className="p-4 sm:p-5 font-bold text-gray-500 bg-gray-50/50 sticky left-0 z-10 border-r border-gray-200/80">
                            Council of Architecture Status
                          </td>
                          {institutions.map((inst) => {
                            const isClosed =
                              (inst.institution_type && /closed|closure|discontinued/i.test(inst.institution_type)) ||
                              (inst.latest_record && /closed|closure|discontinued/i.test(inst.latest_record.approval_status || "")) ||
                              (inst.latest_record && inst.latest_record.approved_intake <= 0);
                            const multi = inst.multi_year_info;
                            return (
                              <td key={inst.id} className="p-4 sm:p-5 border-r last:border-r-0 border-gray-100">
                                {isClosed ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                                    <AlertCircle size={13} />
                                    Closed Institution
                                  </span>
                                ) : multi ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                                    <ShieldCheck size={14} className="text-emerald-600" />
                                    Sanctioned thru {multi.maxYear}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                                    <CheckCircle2 size={13} />
                                    {inst.latest_record?.approval_status || "Approved"}
                                  </span>
                                )}
                              </td>
                            );
                          })}
                          {institutions.length < maxLimit && <td className="bg-gray-50/20" />}
                        </tr>

                        {/* 2. CAMPUS LOCATION */}
                        <tr>
                          <td className="p-4 sm:p-5 font-bold text-gray-500 bg-gray-50/50 sticky left-0 z-10 border-r border-gray-200/80">
                            Campus Location
                          </td>
                          {institutions.map((inst) => (
                            <td key={inst.id} className="p-4 sm:p-5 border-r last:border-r-0 border-gray-100">
                              <div className="flex items-start gap-1.5 text-gray-800">
                                <MapPin size={15} className="text-gray-400 shrink-0 mt-0.5" />
                                <div>
                                  <div className="font-bold text-gray-900">
                                    {[inst.city || inst.district, inst.state].filter(Boolean).join(", ")}
                                  </div>
                                  {inst.locality && (
                                    <div className="text-xs text-gray-500 mt-0.5">{inst.locality}</div>
                                  )}
                                  {inst.address && (
                                    <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                                      {inst.address}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                          ))}
                          {institutions.length < maxLimit && <td className="bg-gray-50/20" />}
                        </tr>

                        {/* 3. HOME DISTANCE & TRANSIT */}
                        <tr className="bg-blue-50/30">
                          <td className="p-4 sm:p-5 font-bold text-blue-900 bg-blue-50/60 sticky left-0 z-10 border-r border-blue-100">
                            <div className="flex items-center gap-1.5">
                              <Navigation size={14} className="text-blue-600" />
                              <span>Distance from Home</span>
                            </div>
                            <div className="text-[10px] text-gray-400 font-normal mt-0.5">
                              Straight aerial vs road travel
                            </div>
                          </td>
                          {institutions.map((inst) => {
                            const d = distancesMap[inst.id];
                            const coa = inst.coa_code || "";
                            const coords = coordsMap[coa] || coordsMap[inst.id];
                            return (
                              <td key={inst.id} className="p-4 sm:p-5 border-r last:border-r-0 border-blue-100">
                                {d && coords ? (
                                  <div className="space-y-1.5">
                                    <div className="text-sm font-extrabold text-blue-950 flex items-baseline gap-1">
                                      <span>~{d.roadKm} km</span>
                                      <span className="text-[11px] font-normal text-gray-500">
                                        by road ({d.straightKm} km direct)
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      ⏱️ Est. Travel: <strong>{d.time}</strong>
                                    </div>
                                    <div className="pt-1">
                                      <a
                                        href={getDirectionsUrl(
                                          coords[0],
                                          coords[1],
                                          homeLocation?.lat,
                                          homeLocation?.lng
                                        )}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline"
                                      >
                                        <span>Transit & Rail Route on Google Maps</span>
                                        <ExternalLink size={10} />
                                      </a>
                                    </div>
                                  </div>
                                ) : coords ? (
                                  <button
                                    type="button"
                                    onClick={() => setShowHomeModal(true)}
                                    className="text-xs font-semibold text-blue-600 hover:underline"
                                  >
                                    + Set home to calculate distance
                                  </button>
                                ) : (
                                  <span className="text-gray-400 text-xs">Coordinates pending verification</span>
                                )}
                              </td>
                            );
                          })}
                          {institutions.length < maxLimit && <td className="bg-blue-50/10" />}
                        </tr>

                        {/* 4. LATEST APPROVED INTAKE */}
                        <tr>
                          <td className="p-4 sm:p-5 font-bold text-gray-500 bg-gray-50/50 sticky left-0 z-10 border-r border-gray-200/80">
                            Approved Intake (Seats)
                          </td>
                          {institutions.map((inst) => {
                            const latest = inst.latest_record;
                            const multi = inst.multi_year_info;
                            return (
                              <td key={inst.id} className="p-4 sm:p-5 border-r last:border-r-0 border-gray-100">
                                {multi ? (
                                  <div>
                                    <div className="text-xl font-black text-gray-950">
                                      {multi.approvedIntake}{" "}
                                      <span className="text-xs font-normal text-gray-500">seats</span>
                                    </div>
                                    <div className="text-xs text-emerald-800 font-semibold mt-0.5">
                                      Advance Approved thru {multi.maxYear}
                                    </div>
                                    <div className="text-[11px] text-gray-400 font-mono">
                                      Course: {multi.courseName}
                                    </div>
                                  </div>
                                ) : latest && latest.approved_intake > 0 ? (
                                  <div>
                                    <div className="text-xl font-black text-gray-950">
                                      {latest.approved_intake}{" "}
                                      <span className="text-xs font-normal text-gray-500">seats</span>
                                    </div>
                                    <div className="text-xs text-gray-600 font-semibold mt-0.5">
                                      Academic Session: {latest.academic_year}
                                    </div>
                                    <div className="text-[11px] text-gray-400 font-mono">
                                      Course: {latest.course_name || "B.Arch"}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-xs text-red-600 font-semibold">0 approved seats</span>
                                )}
                              </td>
                            );
                          })}
                          {institutions.length < maxLimit && <td className="bg-gray-50/20" />}
                        </tr>

                        {/* 5. AFFILIATED UNIVERSITY */}
                        <tr>
                          <td className="p-4 sm:p-5 font-bold text-gray-500 bg-gray-50/50 sticky left-0 z-10 border-r border-gray-200/80">
                            Affiliated University
                          </td>
                          {institutions.map((inst) => (
                            <td key={inst.id} className="p-4 sm:p-5 border-r last:border-r-0 border-gray-100 text-gray-800">
                              <div className="flex items-start gap-1.5">
                                <Building2 size={15} className="text-gray-400 shrink-0 mt-0.5" />
                                <span className="font-semibold">
                                  {inst.affiliated_university || "Autonomous / Deemed / University Pending"}
                                </span>
                              </div>
                            </td>
                          ))}
                          {institutions.length < maxLimit && <td className="bg-gray-50/20" />}
                        </tr>

                        {/* 6. ESTABLISHMENT YEAR */}
                        <tr>
                          <td className="p-4 sm:p-5 font-bold text-gray-500 bg-gray-50/50 sticky left-0 z-10 border-r border-gray-200/80">
                            Architecture Course Started
                          </td>
                          {institutions.map((inst) => (
                            <td key={inst.id} className="p-4 sm:p-5 border-r last:border-r-0 border-gray-100 text-gray-800">
                              <div className="flex items-center gap-1.5">
                                <Calendar size={14} className="text-gray-400 shrink-0" />
                                <span className="font-bold">
                                  {inst.establishment_year ? inst.establishment_year : "Record not verified"}
                                </span>
                              </div>
                            </td>
                          ))}
                          {institutions.length < maxLimit && <td className="bg-gray-50/20" />}
                        </tr>

                        {/* 7. NIRF ARCHITECTURE RANKING */}
                        <tr>
                          <td className="p-4 sm:p-5 font-bold text-gray-500 bg-gray-50/50 sticky left-0 z-10 border-r border-gray-200/80">
                            NIRF Ranking
                          </td>
                          {institutions.map((inst) => {
                            const rk = inst.best_rank;
                            return (
                              <td key={inst.id} className="p-4 sm:p-5 border-r last:border-r-0 border-gray-100">
                                {rk ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-900 border border-amber-200">
                                    <Award size={13} className="text-amber-600" />
                                    Rank #{rk.rank_number} ({rk.ranking_year})
                                  </span>
                                ) : (
                                  <span className="text-gray-400 text-xs">Unranked / Not in Top Band</span>
                                )}
                              </td>
                            );
                          })}
                          {institutions.length < maxLimit && <td className="bg-gray-50/20" />}
                        </tr>

                        {/* 8. HISTORICAL INTAKE TREND */}
                        <tr>
                          <td className="p-4 sm:p-5 font-bold text-gray-500 bg-gray-50/50 sticky left-0 z-10 border-r border-gray-200/80 align-top">
                            <div>Historical Year-Wise Intake</div>
                            <div className="text-[10px] text-gray-400 font-normal mt-0.5">
                              COA Gazette Sanctions
                            </div>
                          </td>
                          {institutions.map((inst) => {
                            const records = (inst.annual_records || []).slice(0, 5);
                            return (
                              <td key={inst.id} className="p-4 sm:p-5 border-r last:border-r-0 border-gray-100 align-top">
                                {records.length > 0 ? (
                                  <div className="space-y-1.5">
                                    {records.map((r: any, idx: number) => (
                                      <div
                                        key={idx}
                                        className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-gray-50 border border-gray-100"
                                      >
                                        <span className="font-mono text-gray-600">{r.academic_year}</span>
                                        <span className="font-bold text-gray-900">
                                          {r.approved_intake} seats{" "}
                                          <span className="text-[10px] font-normal text-gray-500">
                                            ({r.course_name || "B.Arch"})
                                          </span>
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400">Historical records pending synchronization</span>
                                )}
                              </td>
                            );
                          })}
                          {institutions.length < maxLimit && <td className="bg-gray-50/20" />}
                        </tr>

                        {/* 9. OFFICIAL WEBSITE */}
                        <tr>
                          <td className="p-4 sm:p-5 font-bold text-gray-500 bg-gray-50/50 sticky left-0 z-10 border-r border-gray-200/80">
                            Official College Website
                          </td>
                          {institutions.map((inst) => (
                            <td key={inst.id} className="p-4 sm:p-5 border-r last:border-r-0 border-gray-100">
                              {inst.website ? (
                                <a
                                  href={inst.website.startsWith("http") ? inst.website : `https://${inst.website}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
                                >
                                  <span>{inst.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</span>
                                  <ExternalLink size={12} />
                                </a>
                              ) : (
                                <span className="text-xs text-gray-400">Not available</span>
                              )}
                            </td>
                          ))}
                          {institutions.length < maxLimit && <td className="bg-gray-50/20" />}
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Footnote */}
                  <div className="px-6 py-4 bg-gray-50/90 border-t border-gray-200 text-xs text-gray-500 flex items-start gap-2 leading-relaxed">
                    <Info size={14} className="text-gray-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Regulatory Data Disclaimer:</strong> All seat counts, course approvals, and accreditation statuses are compiled from published Council of Architecture (COA) gazettes and official university notifications. Approved intake represents the sanctioned maximum regulatory capacity, not actual enrolled student counts.
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* MODAL: SET HOME LOCATION */}
      {showHomeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Home size={16} />
                </div>
                <h3 className="font-extrabold text-base text-gray-900">
                  Set Your Home Location
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHomeModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              Enter your hometown or PIN code to calculate aerial distance and estimated road travel times to every compared college. Location is kept private and temporary.
            </p>

            <form onSubmit={handleSetHome} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-gray-500 block mb-1">
                  City Name or 6-digit PIN Code
                </label>
                <input
                  type="text"
                  required
                  value={homeInput}
                  onChange={(e) => setHomeInput(e.target.value)}
                  placeholder="e.g. Bhopal, Jaipur, Coimbatore, 560001"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isGeocoding}
                  className="flex-1 bg-black text-white hover:bg-gray-800 py-2.5 rounded-xl font-bold text-xs transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isGeocoding ? "Calculating..." : "Save Home Location"}
                </button>

                <button
                  type="button"
                  onClick={handleUseDeviceLocation}
                  disabled={isGeocoding}
                  className="px-3 py-2.5 border border-gray-300 hover:border-black rounded-xl font-bold text-xs text-gray-700 hover:text-black transition flex items-center gap-1"
                  title="Use GPS Coordinates"
                >
                  <Navigation size={13} />
                  <span>GPS</span>
                </button>
              </div>

              {homeLocation && (
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-600 truncate">Current: <strong>{homeLocation.name}</strong></span>
                  <button
                    type="button"
                    onClick={handleClearHome}
                    className="text-red-600 hover:underline font-semibold"
                  >
                    Clear Location
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* MODAL: QUICK ADD COLLEGE TO COMPARISON */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h3 className="font-extrabold text-base text-gray-900">
                Add Another Institution to Compare
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative mb-4 shrink-0">
              <input
                type="text"
                autoFocus
                value={addSearchQuery}
                onChange={(e) => handleSearchColleges(e.target.value)}
                placeholder="Type college name, COA code (e.g. SPA, CEPT, DL01)..."
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black pr-10"
              />
              {searchingAdd && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto space-y-2 divide-y divide-gray-100">
              {searchResults.length > 0 ? (
                searchResults.map((col) => {
                  const already = institutions.some((i) => i.id === col.id);
                  return (
                    <div
                      key={col.id}
                      className="pt-2 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {col.coa_code && (
                            <span className="font-mono font-bold px-1.5 py-0.2 rounded bg-black text-white text-[10px]">
                              {col.coa_code}
                            </span>
                          )}
                          <span className="text-[10px] text-gray-500 font-semibold">{col.state}</span>
                        </div>
                        <p className="font-bold text-gray-900 truncate">{col.institution_name}</p>
                        <p className="text-gray-500 text-[11px]">{col.city}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddSearchResult(col)}
                        disabled={already}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs shrink-0 transition ${
                          already
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-black text-white hover:bg-gray-800"
                        }`}
                      >
                        {already ? "Added" : "+ Add"}
                      </button>
                    </div>
                  );
                })
              ) : addSearchQuery.trim().length >= 2 && !searchingAdd ? (
                <div className="py-8 text-center text-xs text-gray-500">
                  No institutions found matching &quot;{addSearchQuery}&quot;
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-gray-400">
                  Search by college name, city, state, or COA code to add.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function CompareInstitutionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-black border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-gray-600">Loading comparison system...</p>
        </div>
      }
    >
      <CompareInstitutionsContent />
    </Suspense>
  );
}
