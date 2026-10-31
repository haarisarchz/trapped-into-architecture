"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Check, 
  Zap, 
  Star, 
  Radio, 
  MessageCircle, 
  Mail, 
  Filter, 
  MapPin, 
  Briefcase, 
  Clock, 
  X, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck
} from "lucide-react";

export default function SubscriptionsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState({ title: "", type: "", rate: "" });
  const [role, setRole] = useState("Architect");
  const [experience, setExperience] = useState("2 Years");
  const [location, setLocation] = useState("Tamil Nadu");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "instant">("daily");
  const [billingCycle, setBillingCycle] = useState<"weekly" | "monthly">("monthly");
  const [isSuccess, setIsSuccess] = useState(false);

  const openPlanModal = (title: string, type: string, rate: string, defaultFreq: "daily" | "instant" = "daily") => {
    setSelectedPlan({ title, type, rate });
    setFrequency(defaultFreq);
    setIsSuccess(false);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      setModalOpen(false);
      setIsSuccess(false);
    }, 2800);
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-indigo-50 selection:text-indigo-900">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200/80 pt-12 pb-14 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-full shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Premium Notification &amp; Promotion Plans</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Job Alerts &amp; Post Upgrades
          </h1>

          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Receive tailored job matches delivered directly to your WhatsApp &amp; Email, or feature your job postings to get seen by top active applicants.
          </p>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <div className="flex-grow max-w-6xl mx-auto px-6 py-12 w-full space-y-16">

        {/* ============================================== */}
        {/* SECTION 1: WHATSAPP & EMAIL JOB ALERTS */}
        {/* ============================================== */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-200/80 pb-4 gap-2">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <MessageCircle size={18} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">WhatsApp &amp; Email Job Alerts</h2>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">Delivered straight to your WhatsApp and inbox based on your custom filter criteria.</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium border border-slate-200 self-start sm:self-auto">
              Standard Searching is Free
            </span>
          </div>

          {/* Filter Preview Strip */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-medium flex-wrap">
              <span className="text-slate-400">Filter example:</span>
              <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-800 px-2.5 py-1 rounded-md text-xs font-semibold">
                <Briefcase size={13} className="text-slate-500" />
                Role: Architect
              </span>
              <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-800 px-2.5 py-1 rounded-md text-xs font-semibold">
                <Clock size={13} className="text-slate-500" />
                Exp: 2 Years
              </span>
              <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-800 px-2.5 py-1 rounded-md text-xs font-semibold">
                <MapPin size={13} className="text-slate-500" />
                Location: Tamil Nadu
              </span>
            </div>
            <span 
              onClick={() => openPlanModal("Custom WhatsApp Job Alert", "Seeker Alerts", "Choose Pass")}
              className="text-xs text-indigo-600 font-semibold cursor-pointer hover:underline"
            >
              Select your own filters when subscribing →
            </span>
          </div>

          {/* TWO CARDS FOR JOB SEEKERS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* CARD 1: DAILY SUMMARY ALERT */}
            <div className="bg-white rounded-2xl border border-slate-200 p-7 flex flex-col justify-between hover:border-slate-300 transition hover:shadow-xs">
              <div className="space-y-5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-md">Evening Digest</span>
                    <h3 className="text-xl font-bold text-slate-900 mt-2">Daily Summary Alert</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 font-bold">
                    📋
                  </div>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed">
                  A single consolidated message every evening with newly posted openings matching your custom filters.
                </p>

                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 text-xs text-slate-700 space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pass Options</div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Weekly Pass (7 Days)</span>
                    <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">₹49</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Monthly Pass (30 Days)</span>
                    <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">₹99</span>
                  </div>
                </div>

                <ul className="space-y-3 text-sm text-slate-600 pt-1">
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>1 Consolidated message</strong> daily at 7:00 PM</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Custom filter setup:</strong> Role, Experience &amp; Location</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>Direct 1-tap apply link inside WhatsApp</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>Delivered to both WhatsApp &amp; Email</span>
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => openPlanModal("Daily Summary Alert", "Seeker Alerts", "₹49 (Weekly) / ₹99 (Monthly)", "daily")}
                className="mt-8 w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition text-center text-sm shadow-xs cursor-pointer"
              >
                Subscribe to Daily Digest
              </button>
            </div>

            {/* CARD 2: INSTANT REAL-TIME ALERT */}
            <div className="bg-white rounded-2xl border-2 border-indigo-600 p-7 flex flex-col justify-between shadow-sm relative">
              <div className="absolute -top-3 right-6">
                <span className="bg-indigo-600 text-white text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                  Instant Speed
                </span>
              </div>

              <div className="space-y-5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-md">Real-Time Delivery</span>
                    <h3 className="text-xl font-bold text-slate-900 mt-2">Instant Job Alert</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <Zap size={20} />
                  </div>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed">
                  Immediate alert on WhatsApp the exact minute a matching job is published. Be among the first to apply.
                </p>

                <div className="bg-indigo-50/60 rounded-xl p-3.5 border border-indigo-100 text-xs text-slate-700 space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Pass Options</div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Weekly Pass (7 Days)</span>
                    <span className="font-bold text-indigo-950 bg-white px-2 py-0.5 rounded border border-indigo-200">₹79</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Monthly Pass (30 Days)</span>
                    <span className="font-bold text-indigo-950 bg-white px-2 py-0.5 rounded border border-indigo-200">₹149</span>
                  </div>
                </div>

                <ul className="space-y-3 text-sm text-slate-600 pt-1">
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Instant notification:</strong> Dispatched the moment job is approved</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Up to 3 Custom Filters</strong> (Multiple roles or cities)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>Early bird advantage before general public applications</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>Instant WhatsApp notification + Priority email</span>
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => openPlanModal("Instant Job Alert", "Seeker Alerts", "₹79 (Weekly) / ₹149 (Monthly)", "instant")}
                className="mt-8 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition text-center text-sm shadow-xs cursor-pointer"
              >
                Subscribe to Instant Alerts
              </button>
            </div>

          </div>
        </section>

        {/* ============================================== */}
        {/* SECTION 2: EMPLOYER BOOST AND VISIBILITY */}
        {/* ============================================== */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-200/80 pb-4 gap-2">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                  <Sparkles size={18} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Employer Boost and Visibility</h2>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">Upgrade your job post to gain top placement and direct distribution to matching candidates.</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium border border-slate-200 self-start sm:self-auto">
              Standard Job Posting is Free
            </span>
          </div>

          {/* TWO CARDS FOR EMPLOYERS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* CARD 3: FEATURED JOB POST */}
            <div className="bg-white rounded-2xl border border-slate-200 p-7 flex flex-col justify-between hover:border-slate-300 transition hover:shadow-xs">
              <div className="space-y-5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-md">Top Placement</span>
                    <h3 className="text-xl font-bold text-slate-900 mt-2">Featured Job Post</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                    <Star size={20} />
                  </div>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed">
                  Pin your job to the top of search results and category pages for 30 days to attract more qualified applications.
                </p>

                <ul className="space-y-3 text-sm text-slate-600 pt-1">
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Pinned to top</strong> of search results above standard posts</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>Distinct <strong>"Featured" highlight badge</strong> and border</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>Automatically featured in <strong>Daily WhatsApp Digests</strong></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>Valid for 30 continuous days of listing</span>
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => openPlanModal("Featured Job Post", "Employer Upgrades", "30-Day Boost")}
                className="mt-8 w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition text-center text-sm shadow-xs cursor-pointer"
              >
                Upgrade a Job to Featured
              </button>
            </div>

            {/* CARD 4: COMPANY SPOTLIGHT & CANDIDATE BLAST */}
            <div className="bg-white rounded-2xl border-2 border-amber-500/80 p-7 flex flex-col justify-between shadow-sm relative">
              <div className="absolute -top-3 right-6">
                <span className="bg-amber-600 text-white text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                  Maximum Reach
                </span>
              </div>

              <div className="space-y-5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-md">Direct Candidate Broadcast</span>
                    <h3 className="text-xl font-bold text-slate-900 mt-2">Company Spotlight &amp; Blast</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                    <Radio size={20} />
                  </div>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed">
                  Prime homepage banner visibility plus a dedicated WhatsApp broadcast directly to matching registered candidates.
                </p>

                <ul className="space-y-3 text-sm text-slate-600 pt-1">
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Homepage &amp; category banner</strong> placement with logo</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Dedicated WhatsApp broadcast</strong> to 100% of matching seekers</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>Verified <strong>"Featured Employer"</strong> trust badge</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>45 Days listing duration with priority applicant access</span>
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => openPlanModal("Company Spotlight & Blast", "Employer Upgrades", "45-Day Enterprise Spotlight")}
                className="mt-8 w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl transition text-center text-sm shadow-xs cursor-pointer"
              >
                Get Company Spotlight
              </button>
            </div>

          </div>
        </section>

        {/* TRUST STRIP */}
        <div className="border-t border-slate-200/80 pt-8 text-center text-xs text-slate-500 space-y-2">
          <div className="flex items-center justify-center gap-3 font-medium text-slate-600 flex-wrap">
            <span className="flex items-center gap-1"><ShieldCheck size={15} className="text-emerald-600" /> Instant Activation via UPI</span>
            <span>•</span>
            <span className="flex items-center gap-1"><MessageCircle size={15} className="text-emerald-600" /> Direct WhatsApp Delivery</span>
            <span>•</span>
            <span>Pause or Edit Filters Anytime</span>
          </div>
          <p>Have questions or need custom studio hiring campaigns? Reach out to support directly.</p>
        </div>

      </div>

      {/* INTERACTIVE CHECKOUT & CONFIGURATION MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">{selectedPlan.type}</span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">{selectedPlan.title}</h3>
                <p className="text-xs text-slate-500">{selectedPlan.rate}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Target Job Title / Category</label>
                  <input 
                    type="text" 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                    required
                    placeholder="e.g. Architect, Interior Designer, 3D Visualizer" 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 text-slate-800 text-xs outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Experience</label>
                    <select 
                      value={experience} 
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-xs bg-white"
                    >
                      <option>Fresher / 0 - 1 Years</option>
                      <option>2 Years</option>
                      <option>3 - 5 Years</option>
                      <option>5+ Years</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Location</label>
                    <input 
                      type="text" 
                      value={location} 
                      onChange={(e) => setLocation(e.target.value)}
                      required
                      placeholder="e.g. Tamil Nadu, Mumbai" 
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-xs outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">WhatsApp Number (For Direct Delivery)</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-2.5 border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-xs font-medium rounded-l-lg">+91</span>
                    <input 
                      type="tel" 
                      value={whatsapp} 
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="9876543210" 
                      required 
                      className="w-full px-3 py-2 border border-slate-200 rounded-r-lg text-slate-800 text-xs outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Email Address (Optional backup)</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-xs outline-hidden"
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Proceed to Instant Pay via UPI</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </form>

              {isSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium text-center flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Success! A welcome test notification has been dispatched to your WhatsApp.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
