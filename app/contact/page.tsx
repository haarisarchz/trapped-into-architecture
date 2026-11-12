"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { Phone, Mail, MapPin, MessageCircle, ExternalLink } from "lucide-react";
import { 
  FacebookBrandIcon, 
  LinkedInBrandIcon, 
  TelegramBrandIcon, 
  XBrandIcon, 
  InstagramBrandIcon, 
  WhatsAppBrandIcon 
} from "@/components/icons/BrandIcons";
import { 
  parseChannels, 
  DEFAULT_WHATSAPP_CHANNELS, 
  DEFAULT_TELEGRAM_CHANNELS, 
  SocialChannel 
} from "@/lib/channels";

const ensureHttp = (url?: string) => {
  if (!url) return "";
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return "https://" + trimmed;
};

const SERVICE_SUBJECT_MAP: Record<string, string> = {
  "feature-job": "Feature a Job Vacancy",
  "feature-company": "Feature Our Studio / Practice",
  "register-practice": "Register New Practice / Claim Studio",
  "software-tutor": "Hire a Software Tutor",
  "freelance-architect": "Hire a Freelance Architect",
  "portfolio-review": "Portfolio & Resume Review",
  "suggestion": "Community Suggestion",
};

function ContactFormInner({ settings }: { settings: any }) {
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!searchParams) return;
    const sParam = searchParams.get("service") || "";
    const subjectParam = searchParams.get("subject") || "";
    const messageParam = searchParams.get("message") || searchParams.get("suggestion") || "";
    const nameParam = searchParams.get("name") || "";

    const resolvedSubject = subjectParam || SERVICE_SUBJECT_MAP[sParam] || "";

    setFormData((prev) => ({
      ...prev,
      name: nameParam || prev.name,
      subject: resolvedSubject || prev.subject,
      message: messageParam ? messageParam.slice(0, 1000) : prev.message,
    }));
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");
    
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send message. Please try again.");
      }
      setStatus("success");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err: any) {
      console.error("Submission error:", err);
      setStatus("error");
      setErrorMessage(err.message || "Failed to send message. Please try again or reach out directly.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Full Name / Studio Name <span className="text-red-500">*</span>
          </label>
          <input 
            required
            type="text" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-black outline-none bg-white" 
            placeholder="e.g. Ar. Ananya or Studio Forma"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input 
            required
            type="email" 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-black outline-none bg-white" 
            placeholder="you@example.com"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Subject / Topic <span className="text-red-500">*</span>
          </label>
          <input 
            required
            type="text" 
            value={formData.subject || ""}
            onChange={(e) => setFormData({...formData, subject: e.target.value})}
            className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-black outline-none bg-white" 
            placeholder="How can we help?"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Phone (Optional)</label>
          <input 
            type="text" 
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-black outline-none bg-white" 
            placeholder="+91 98765 43210"
          />
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-semibold text-gray-700">
            Type your message here <span className="text-red-500">*</span>
          </label>
          <span className="text-[11px] text-gray-400 font-mono">
            {formData.message.length}/1000
          </span>
        </div>
        <textarea 
          required
          rows={4}
          maxLength={1000}
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-black outline-none max-h-40 overflow-y-auto resize-none bg-white" 
          placeholder="Share your vacancy query, collaboration request, or question..."
        />
        <div className="text-[10px] text-gray-400 mt-0.5">
          Scroll bar appears automatically when longer text is entered (up to 1,000 characters).
        </div>
      </div>

      <button 
        type="submit" 
        disabled={status === 'submitting'}
        className="w-full rounded-xl py-2.5 font-bold transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm cursor-pointer shadow-xs bg-black hover:bg-gray-800 text-white"
      >
        {status === 'submitting' ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>Sending inquiry...</span>
          </>
        ) : (
          "Send Inquiry →"
        )}
      </button>
      
      {status === 'success' && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-xl text-center text-xs font-medium animate-fadeIn">
          ✓ Thank you! Your message has been sent. We will get back to you shortly.
        </div>
      )}

      {status === 'error' && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center text-xs font-medium animate-fadeIn">
          ✕ {errorMessage || "Something went wrong. Please try again or reach out to us directly."}
        </div>
      )}
    </form>
  );
}

function ContactContent() {
  const searchParams = useSearchParams();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePlatform, setActivePlatform] = useState<"whatsapp" | "telegram" | "instagram" | "facebook" | "linkedin" | "x">("whatsapp");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase.from("site_settings").select("*").eq("id", "global").maybeSingle();
        if (data) setSettings(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (!searchParams) return;
    const platParam = searchParams.get("platform")?.toLowerCase();
    if (platParam && ["whatsapp", "telegram", "instagram", "facebook", "linkedin", "x"].includes(platParam)) {
      setActivePlatform(platParam as any);
      setTimeout(() => {
        document.getElementById("connect")?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } else if (searchParams.get("tab") === "connect" || searchParams.has("connect")) {
      setTimeout(() => {
        document.getElementById("connect")?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-xs text-gray-400">
        Loading...
      </div>
    );
  }

  const whatsappChannels: SocialChannel[] = parseChannels(settings?.whatsapp_channel_url, DEFAULT_WHATSAPP_CHANNELS);
  const telegramChannels: SocialChannel[] = parseChannels(settings?.website_url, DEFAULT_TELEGRAM_CHANNELS);

  return (
    <div className="max-w-6xl mx-auto py-10 md:py-14 px-6 space-y-12">
      
      {/* 1. CONTACT US SECTION */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Contact Us
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
            Have questions about posting a vacancy, suggestions for the platform, or studio partnerships? We would love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 bg-white p-6 sm:p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
          {/* Left Column: Direct Contacts */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-5 text-gray-900">Get in Touch</h2>
              <div className="space-y-4">
                
                {settings?.email && (
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                      <Mail className="text-gray-600 w-5 h-5" />
                    </div>
                    <div className="text-xs">
                      <div className="font-semibold text-gray-900">Email</div>
                      <a href={`mailto:${settings.email}`} className="text-gray-600 hover:text-black font-medium">{settings.email}</a>
                    </div>
                  </div>
                )}
                
                {settings?.phone && (
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                      <Phone className="text-gray-600 w-5 h-5" />
                    </div>
                    <div className="text-xs">
                      <div className="font-semibold text-gray-900">Phone</div>
                      <a href={`tel:${settings.phone}`} className="text-gray-600 hover:text-black font-medium">{settings.phone}</a>
                    </div>
                  </div>
                )}

                {settings?.whatsapp && (
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center shrink-0">
                      <MessageCircle className="text-emerald-600 w-5 h-5" />
                    </div>
                    <div className="text-xs">
                      <div className="font-semibold text-emerald-800">WhatsApp</div>
                      <a 
                        href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-gray-600 hover:text-emerald-600 font-medium"
                      >
                        Message us
                      </a>
                    </div>
                  </div>
                )}
                
                {settings?.contact_address && (
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="text-gray-600 w-5 h-5" />
                    </div>
                    <div className="text-xs">
                      <div className="font-semibold text-gray-900">Address</div>
                      <div className="text-gray-600 whitespace-pre-wrap">{settings.contact_address}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 text-xs text-gray-500">
              Want to join our broadcast channels? Scroll below to explore our{" "}
              <a href="#connect" className="text-emerald-700 font-bold hover:underline">
                Follow &amp; Connect
              </a>{" "}
              directory.
            </div>
          </div>

          {/* Right Column: Clean Form */}
          <div>
            <ContactFormInner settings={settings} />
          </div>
        </div>
      </div>

      {/* 2. FOLLOW & CONNECT SECTION (ON THE SAME PAGE BELOW) */}
      <div id="connect" className="pt-6 space-y-6 scroll-mt-20">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Follow &amp; Connect
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
            Subscribe to our instant vacancy alert channels, portfolio discussions, and daily architectural design news.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          {/* Platform Pills */}
          <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-4">
            <button
              onClick={() => setActivePlatform("whatsapp")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                activePlatform === "whatsapp"
                  ? "bg-black text-white shadow-xs"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <WhatsAppBrandIcon size={16} /> WhatsApp Channels
            </button>

            <button
              onClick={() => setActivePlatform("telegram")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                activePlatform === "telegram"
                  ? "bg-black text-white shadow-xs"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <TelegramBrandIcon size={16} /> Telegram
            </button>

            <button
              onClick={() => setActivePlatform("instagram")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                activePlatform === "instagram"
                  ? "bg-black text-white shadow-xs"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <InstagramBrandIcon size={16} /> Instagram
            </button>

            <button
              onClick={() => setActivePlatform("facebook")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                activePlatform === "facebook"
                  ? "bg-black text-white shadow-xs"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FacebookBrandIcon size={16} /> Facebook Page
            </button>

            <button
              onClick={() => setActivePlatform("linkedin")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                activePlatform === "linkedin"
                  ? "bg-black text-white shadow-xs"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <LinkedInBrandIcon size={16} /> LinkedIn
            </button>

            <button
              onClick={() => setActivePlatform("x")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                activePlatform === "x"
                  ? "bg-black text-white shadow-xs"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <XBrandIcon size={16} /> X (Twitter)
            </button>
          </div>

          {/* 1. WHATSAPP CHANNELS VIEW */}
          {activePlatform === "whatsapp" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {whatsappChannels.map((ch, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-2xl p-4 hover:border-emerald-200 transition bg-white flex items-center justify-between shadow-2xs"
                  >
                    <p className="text-sm font-bold text-gray-900">{ch.name}</p>
                    <a
                      href={ensureHttp(ch.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5"
                    >
                      <span>Join</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. TELEGRAM CHANNELS VIEW */}
          {activePlatform === "telegram" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {telegramChannels.map((ch, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-2xl p-4 hover:border-blue-200 transition bg-white flex items-center justify-between shadow-2xs"
                  >
                    <p className="text-sm font-bold text-gray-900">{ch.name}</p>
                    <a
                      href={ensureHttp(ch.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#229ED9] hover:bg-[#1d8bc0] text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5"
                    >
                      <span>Open</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. INSTAGRAM VIEW */}
          {activePlatform === "instagram" && (
            <div className="border border-gray-200 rounded-2xl p-8 flex flex-col items-center text-center space-y-3.5 bg-gray-50/50">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
                <InstagramBrandIcon size={28} />
              </div>
              <h3 className="font-extrabold text-gray-900 text-lg">@trappedintoarchitecture</h3>
              <p className="text-xs text-gray-600 max-w-md leading-relaxed">
                Daily visual job highlights, architecture memes, studio tours, portfolio reviews, and architecture community reels.
              </p>
              <a
                href={ensureHttp(settings?.instagram || "https://www.instagram.com/trappedintoarchitecture/")}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-rose-500 to-purple-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs hover:opacity-90 transition flex items-center gap-2"
              >
                <span>Follow on Instagram</span>
                <ExternalLink size={14} />
              </a>
            </div>
          )}

          {/* 4. FACEBOOK VIEW */}
          {activePlatform === "facebook" && (
            <div className="border border-gray-200 rounded-2xl p-8 flex flex-col items-center text-center space-y-3.5 bg-gray-50/50">
              <div className="w-14 h-14 rounded-full bg-[#1877F2] flex items-center justify-center text-white shadow-sm">
                <FacebookBrandIcon size={28} />
              </div>
              <h3 className="font-extrabold text-gray-900 text-lg">Trapped Into Architecture Page</h3>
              <p className="text-xs text-gray-600 max-w-md leading-relaxed">
                Automated daily job posts with studio links, firm details, and recruitment updates.
              </p>
              <a
                href={ensureHttp(settings?.facebook || "https://www.facebook.com/trappedintoarchitecture")}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1877F2] hover:bg-blue-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2"
              >
                <span>Visit Facebook Page</span>
                <ExternalLink size={14} />
              </a>
            </div>
          )}

          {/* 5. LINKEDIN VIEW */}
          {activePlatform === "linkedin" && (
            <div className="border border-gray-200 rounded-2xl p-8 flex flex-col items-center text-center space-y-3.5 bg-gray-50/50">
              <div className="w-14 h-14 rounded-full bg-[#0A66C2] flex items-center justify-center text-white shadow-sm">
                <LinkedInBrandIcon size={28} />
              </div>
              <h3 className="font-extrabold text-gray-900 text-lg">Trapped Into Architecture on LinkedIn</h3>
              <p className="text-xs text-gray-600 max-w-md leading-relaxed">
                Professional network updates, architecture firm spotlights, and industry hiring insights.
              </p>
              <a
                href={ensureHttp(settings?.linkedin || "https://www.linkedin.com/company/trappedintoarchitecture")}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#0A66C2] hover:bg-blue-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2"
              >
                <span>Connect on LinkedIn</span>
                <ExternalLink size={14} />
              </a>
            </div>
          )}

          {/* 6. X (TWITTER) VIEW */}
          {activePlatform === "x" && (
            <div className="border border-gray-200 rounded-2xl p-8 flex flex-col items-center text-center space-y-3.5 bg-gray-50/50">
              <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center text-white shadow-sm">
                <XBrandIcon size={24} />
              </div>
              <h3 className="font-extrabold text-gray-900 text-lg">@trappedin2archz</h3>
              <p className="text-xs text-gray-600 max-w-md leading-relaxed">
                Quick real-time alerts, architecture discussions, and immediate vacancy drop tweets.
              </p>
              <a
                href={ensureHttp(settings?.twitter || "https://x.com/trappedin2archz")}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black hover:bg-gray-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2"
              >
                <span>Follow on X</span>
                <ExternalLink size={14} />
              </a>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-black flex flex-col justify-between">
      <div>
        <Navbar />
        <Suspense fallback={<div className="p-12 text-center text-xs text-gray-400">Loading Contact page...</div>}>
          <ContactContent />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}
