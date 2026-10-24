// @ts-nocheck
"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Bookmark,
  BookmarkCheck,
  User as UserIcon,
  Building2,
  Settings as SettingsIcon,
  LogOut,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { generateJobUrl } from "@/utils/jobUrl";

import ProfileHero from "@/components/profile/ProfileHero";
import CompletionMeter from "@/components/profile/CompletionMeter";
import PersonalInfoTab from "@/components/profile/PersonalInfoTab";
import EducationSection from "@/components/profile/EducationSection";
import ExperienceSection from "@/components/profile/ExperienceSection";
import ProfileSettingsTab from "@/components/profile/ProfileSettingsTab";
import {
  calculateProfileCompletion,
  calculateTotalExperience,
  EducationEntry,
  ExperienceEntry,
} from "@/utils/profileCompletion";

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const username = params.username;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"details" | "saved" | "companies" | "settings">("details");

  // Related Sub-data
  const [educations, setEducations] = useState<EducationEntry[]>([]);
  const [experiences, setExperiences] = useState<ExperienceEntry[]>([]);
  const [savedJobsData, setSavedJobsData] = useState<any[]>([]);
  const [favoriteCompanies, setFavoriteCompanies] = useState<any[]>([]);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", username)
          .single();

        if (error || !profile) {
          router.push("/");
          return;
        }

        const formattedUser = {
          id: profile.id,
          username: profile.username,
          fullName: profile.full_name || "",
          displayName: profile.display_name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          whatsapp_number: profile.whatsapp_number || "",
          whatsapp_same_as_phone: profile.whatsapp_same_as_phone ?? false,
          linkedin_url: profile.linkedin_url || "",
          instagram_url: profile.instagram_url || "",
          portfolio_url: profile.portfolio_url || "",
          twitter_url: profile.twitter_url || "",
          hide_phone: profile.hide_phone ?? false,
          hide_whatsapp: profile.hide_whatsapp ?? false,
          hide_email: profile.hide_email ?? false,
          hide_dob: profile.hide_dob ?? false,
          role: profile.role || "user",
          bio: profile.bio || "",
          dob: profile.dob || "",
          profession: profile.profession || "",
          education: profile.education || "",
          tagline: profile.tagline || "",
          gender: profile.gender || "",
          avatar_url: profile.avatar_url || "",
          profileImage: profile.avatar_url || "",
          coa_number: profile.coa_number || "",
          coa_registration_date: profile.coa_registration_date || "",
          coa_is_active: profile.coa_is_active ?? true,
          highest_qualification: profile.highest_qualification || "",
          user_track: profile.user_track || "job_seeker",
          badge_tier: profile.badge_tier || "bronze",
          is_vip: profile.is_vip || false,
          likes_count: profile.likes_count || 0,
        };

        setUser(formattedUser);

        // Check ownership
        const storedUser =
          typeof window !== "undefined"
            ? localStorage.getItem("currentUser")
            : null;
        if (storedUser) {
          const current = JSON.parse(storedUser);
          if (
            current.id === profile.id ||
            current.username === profile.username ||
            current.email === profile.email
          ) {
            setIsOwner(true);
          }
        } else {
          const { data: authData } = await supabase.auth.getUser();
          if (authData?.user?.id === profile.id || authData?.user?.email === profile.email) {
            setIsOwner(true);
          }
        }

        // Fetch Educations
        const { data: eduData } = await supabase
          .from("profile_educations")
          .select("*")
          .eq("user_id", profile.id)
          .order("order_index", { ascending: true });
        if (eduData) {
          setEducations(eduData);
        }

        // Fetch Experiences
        const { data: expData } = await supabase
          .from("profile_experiences")
          .select("*")
          .eq("user_id", profile.id)
          .order("start_date", { ascending: false });
        if (expData) {
          setExperiences(expData);
        }

        // Fetch Saved Jobs
        const { data: savedEntries } = await supabase
          .from("saved_jobs")
          .select("job_id")
          .eq("user_id", profile.id);

        if (savedEntries && savedEntries.length > 0) {
          const ids = savedEntries.map((e) => e.job_id);
          fetchSavedJobs(ids);
        }

        // Fetch Favorite Companies
        const { data: favEntries } = await supabase
          .from("favorite_companies")
          .select("company_slug")
          .eq("user_id", profile.id);

        if (favEntries && favEntries.length > 0) {
          const slugs = favEntries.map((f) => f.company_slug);
          const { data: comps } = await supabase
            .from("companies")
            .select("slug, firm_name, logo_url, city")
            .in("slug", slugs);
          if (comps) setFavoriteCompanies(comps);
        }
      } catch (err) {
        console.error("Error loading full profile:", err);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      loadProfile();
    }
  }, [username, router]);

  const fetchSavedJobs = async (ids: string[]) => {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .in("id", ids);

    if (!error && data) {
      setSavedJobsData(
        data.map((job) => ({
          ...job,
          isSaved: true,
        }))
      );
    }
  };

  const handleAvatarUpdate = async (newUrl: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: newUrl })
        .eq("id", user.id);

      if (error) throw error;

      const updated = {
        ...user,
        avatar_url: newUrl,
        profileImage: newUrl,
      };
      setUser(updated);

      const stored = localStorage.getItem("currentUser");
      if (stored) {
        const curr = JSON.parse(stored);
        localStorage.setItem(
          "currentUser",
          JSON.stringify({ ...curr, avatar_url: newUrl, profileImage: newUrl })
        );
      }
      alert("Profile picture updated!");
    } catch (e: any) {
      console.error("Error saving avatar:", e);
      alert(e.message || "Failed to save profile picture");
    }
  };

  const handleUserUpdate = (updated: any) => {
    setUser(updated);
  };

  const toggleSavedJob = async (jobId: string) => {
    const storedUser =
      typeof window !== "undefined"
        ? localStorage.getItem("currentUser")
        : null;
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    if (!currentUser) return;

    const job = savedJobsData.find((j) => j.id === jobId);
    if (!job) return;

    if (job.isSaved) {
      await supabase
        .from("saved_jobs")
        .delete()
        .eq("user_id", user.id)
        .eq("job_id", jobId);

      setSavedJobsData(savedJobsData.filter((j) => j.id !== jobId));
    } else {
      await supabase
        .from("saved_jobs")
        .insert({ user_id: user.id, job_id: jobId });

      setSavedJobsData(
        savedJobsData.map((j) => (j.id === jobId ? { ...j, isSaved: true } : j))
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    supabase.auth.signOut().then(() => {
      router.push("/");
    });
  };

  const completion = useMemo(() => {
    return calculateProfileCompletion(user, educations, experiences);
  }, [user, educations, experiences]);

  const totalExp = useMemo(() => {
    return calculateTotalExperience(experiences);
  }, [experiences]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20 text-gray-500 text-sm font-semibold">
          Loading profile details...
        </div>
        <Footer />
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gray-100 text-black flex flex-col">
      <Navbar />

      <section className="flex-1 py-10 px-4 md:px-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* PROFILE HERO HEADER */}
          <ProfileHero
            user={user}
            isOwner={isOwner}
            totalExpFormatted={totalExp.formatted}
            badgeTier={completion.badgeTier}
            isVip={completion.isVip}
            onAvatarUpdate={handleAvatarUpdate}
          />

          {/* PROFILE COMPLETION METER (Visible to Profile Owner) */}
          {isOwner && <CompletionMeter completion={completion} />}

          {/* FOUR MAIN TABS: Profile Details, Saved Jobs, Favourite Companies, Settings */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex gap-2 flex-wrap">
            {/* TAB 1: Profile Details */}
            <button
              onClick={() => setActiveTab("details")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition text-sm cursor-pointer ${
                activeTab === "details"
                  ? "bg-black text-white shadow-sm"
                  : "text-gray-600 hover:text-black hover:bg-gray-100"
              }`}
            >
              <UserIcon size={16} />
              <span>Profile Details</span>
            </button>

            {/* TAB 2: Saved Jobs */}
            <button
              onClick={() => setActiveTab("saved")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition text-sm cursor-pointer ${
                activeTab === "saved"
                  ? "bg-black text-white shadow-sm"
                  : "text-gray-600 hover:text-black hover:bg-gray-100"
              }`}
            >
              <Bookmark size={16} />
              <span>Saved Jobs</span>
              {savedJobsData.length > 0 && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    activeTab === "saved"
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {savedJobsData.length}
                </span>
              )}
            </button>

            {/* TAB 3: Favourite Companies */}
            <button
              onClick={() => setActiveTab("companies")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition text-sm cursor-pointer ${
                activeTab === "companies"
                  ? "bg-black text-white shadow-sm"
                  : "text-gray-600 hover:text-black hover:bg-gray-100"
              }`}
            >
              <Building2 size={16} />
              <span>Favourite Companies</span>
              {favoriteCompanies.length > 0 && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    activeTab === "companies"
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {favoriteCompanies.length}
                </span>
              )}
            </button>

            {/* TAB 4: Settings & Privacy (Visible to Profile Owner) */}
            {isOwner && (
              <button
                onClick={() => setActiveTab("settings")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition text-sm cursor-pointer ${
                  activeTab === "settings"
                    ? "bg-black text-white shadow-sm"
                    : "text-gray-600 hover:text-black hover:bg-gray-100"
                }`}
              >
                <SettingsIcon size={16} />
                <span>Settings</span>
              </button>
            )}
          </div>

          {/* TAB 1 CONTENT: PROFILE DETAILS */}
          {activeTab === "details" && (
            <div className="space-y-6">
              <PersonalInfoTab
                user={user}
                isOwner={isOwner}
                onUserUpdate={handleUserUpdate}
              />

              <ExperienceSection
                userId={user.id}
                isOwner={isOwner}
                experiences={experiences}
                onExperiencesChange={setExperiences}
              />

              <EducationSection
                userId={user.id}
                isOwner={isOwner}
                educations={educations}
                onEducationsChange={setEducations}
              />
            </div>
          )}

          {/* TAB 2 CONTENT: SAVED JOBS */}
          {activeTab === "saved" && (
            <div className="border rounded-3xl p-6 md:p-8 bg-gray-50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Saved Jobs</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Jobs and internship positions bookmarked for easy application
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-white border border-gray-200 rounded-full text-gray-700">
                  {savedJobsData.length} Saved
                </span>
              </div>

              {savedJobsData.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center border border-gray-200">
                  <Bookmark size={36} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500 font-medium text-sm">No saved jobs yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedJobsData.map((job) => {
                    const isExpired =
                      job.post_expiry_date &&
                      new Date(job.post_expiry_date) < new Date();

                    return (
                      <div
                        key={job.id}
                        onClick={() => router.push(generateJobUrl(job))}
                        className="bg-white rounded-2xl shadow-sm hover:shadow-md transition border border-gray-200 p-4 flex items-center gap-4 cursor-pointer"
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center border border-gray-100">
                          {job.image ? (
                            <img
                              src={job.image}
                              alt={job.position}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-gray-400">No Image</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 leading-tight">
                            <span className="font-bold">{job.firm_name}</span>
                            <span className="text-gray-600"> is hiring </span>
                            <span className="font-semibold text-black">{job.position}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {job.city}{job.state ? `, ${job.state}` : ""}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSavedJob(job.id);
                            }}
                            className={`p-2 rounded-xl transition ${
                              job.isSaved
                                ? "bg-black text-white"
                                : "bg-gray-100 text-gray-500 hover:text-black cursor-pointer"
                            }`}
                          >
                            {job.isSaved ? (
                              <BookmarkCheck size={16} />
                            ) : (
                              <Bookmark size={16} />
                            )}
                          </button>

                          {isExpired ? (
                            <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                              Expired
                            </span>
                          ) : (
                            <span className="bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3 CONTENT: FAVOURITE COMPANIES */}
          {activeTab === "companies" && (
            <div className="border rounded-3xl p-6 md:p-8 bg-gray-50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Favourite Companies</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Architecture firms and studios you follow
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-white border border-gray-200 rounded-full text-gray-700">
                  {favoriteCompanies.length} Following
                </span>
              </div>

              {favoriteCompanies.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center border border-gray-200">
                  <Building2 size={36} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500 font-medium text-sm">No favourite companies yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favoriteCompanies.map((comp) => (
                    <Link
                      key={comp.slug}
                      href={`/companies/${comp.slug}`}
                      className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition flex items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                        {comp.logo_url ? (
                          <img
                            src={comp.logo_url}
                            alt={comp.firm_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xl">🏢</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">
                          {comp.firm_name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {comp.city || "Location not specified"}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4 CONTENT: SETTINGS & PRIVACY (Only for Profile Owner) */}
          {activeTab === "settings" && isOwner && (
            <ProfileSettingsTab
              user={user}
              onUserUpdate={handleUserUpdate}
            />
          )}

          {/* LOGOUT BUTTON (Only for Profile Owner) */}
          {isOwner && (
            <div className="pt-4 flex justify-end">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-6 py-3 rounded-2xl font-semibold transition text-sm shadow-sm cursor-pointer"
              >
                <LogOut size={16} />
                <span>Logout from Account</span>
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
