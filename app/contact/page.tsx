"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { Phone, Mail, MapPin } from "lucide-react";
import { FacebookBrandIcon, LinkedInBrandIcon, TelegramBrandIcon, XBrandIcon, InstagramBrandIcon } from "@/components/icons/BrandIcons";

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
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Full Name / Studio Name <span className="text-red-500">*</span>
          </label>
          <input 
            required
            type="text" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-black outline-none" 
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
            className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-black outline-none" 
            placeholder="you@example.com"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Subject / Topic <span className="text-red-500">*</span>
          </label>
          <input 
            required
            type="text" 
            value={formData.subject || ""}
            onChange={(e) => setFormData({...formData, subject: e.target.value})}
            className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-black outline-none" 
            placeholder="How can we help or what is your suggestion?"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Phone (Optional)</label>
          <input 
            type="text" 
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-black outline-none" 
            placeholder="+91 98765 43210"
          />
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-semibold text-gray-700">
            Type your message or suggestion here <span className="text-red-500">*</span>
          </label>
          <span className="text-[11px] text-gray-400 font-mono">
            {formData.message.length}/1000
          </span>
        </div>
        <textarea 
          required
          rows={3}
          maxLength={1000}
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-black outline-none max-h-36 overflow-y-auto resize-none" 
          placeholder="Share your suggestion, vacancy query, or collaboration request..."
        />
        <div className="text-[10px] text-gray-400 -mt-0.5">
          Scroll bar appears automatically when longer text is entered (up to 1,000 characters).
        </div>
      </div>

      <button 
        type="submit" 
        disabled={status === 'submitting'}
        className="w-full bg-black text-white rounded-xl py-2.5 font-bold hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm cursor-pointer shadow-xs"
      >
        {status === 'submitting' ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>Sending your message...</span>
          </>
        ) : (
          'Send Message / Suggestion'
        )}
      </button>
      
      {status === 'success' && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-xl text-center text-xs font-medium animate-fadeIn">
          ✓ Thank you! Your message/suggestion has been sent. We will get back to you shortly.
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

export default function ContactPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return null;

  return (
    <main className="min-h-screen bg-gray-50 text-black flex flex-col justify-between">
      <div>
        <Navbar />
        
        <div className="max-w-6xl mx-auto py-10 md:py-14 px-6">
          <div className="text-center mb-8 md:mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2.5">Contact Us</h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
              Have questions about posting a vacancy, suggestions for the platform, or studio partnerships? We would love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 bg-white p-6 sm:p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
            
            {/* Contact Info */}
            <div className="flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold mb-4 text-gray-900">Get in Touch</h2>
                <div className="space-y-4">
                  
                  {/* Direct Contacts */}
                  {settings?.email && (
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                        <Mail className="text-gray-600 w-5 h-5" />
                      </div>
                      <div className="text-xs">
                        <div className="font-semibold text-gray-900">Email</div>
                        <a href={`mailto:${settings.email}`} className="text-gray-600 hover:text-black">{settings.email}</a>
                      </div>
                    </div>
                  )}
                  
                  {settings?.phone && (
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                        <Phone className="text-gray-600 w-5 h-5" />
                      </div>
                      <div className="text-xs">
                        <div className="font-semibold text-gray-900">Phone</div>
                        <a href={`tel:${settings.phone}`} className="text-gray-600 hover:text-black">{settings.phone}</a>
                      </div>
                    </div>
                  )}

                  {settings?.whatsapp && (
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 flex items-center justify-center shrink-0">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.372 0 0 5.373 0 12c0 2.122.553 4.12 1.528 5.864L0 24l6.302-1.654A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" fill="#25D366"/><path fillRule="evenodd" clipRule="evenodd" d="M17.472 14.304c-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.882-.788-1.477-1.761-1.65-2.059-.173-.298-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.173.198-.297.297-.495.099-.198.05-.371-.025-.52-.074-.149-.669-1.611-.916-2.206-.241-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.793.371-.272.298-1.04 1.016-1.04 2.478s1.065 2.875 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.71.307 1.264.49 1.695.627.712.227 1.36.195 1.871.118.572-.086 1.758-.718 2.006-1.412.248-.694.248-1.288.173-1.412-.074-.124-.272-.198-.57-.347z" fill="#FFF"/></svg>
                      </div>
                      <div className="text-xs">
                        <div className="font-semibold text-gray-900">WhatsApp</div>
                        <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-green-600">Message us</a>
                      </div>
                    </div>
                  )}
                  
                  {settings?.contact_address && (
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
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

              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-3">Official Channels</h3>
                <div className="flex gap-4 items-center">
                  {settings?.whatsapp_channel_url && (
                    <a href={ensureHttp(settings.whatsapp_channel_url)} target="_blank" rel="noreferrer" className="hover:opacity-80 transition hover:scale-110 transform" title="WhatsApp Channel">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.372 0 0 5.373 0 12c0 2.122.553 4.12 1.528 5.864L0 24l6.302-1.654A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" fill="#25D366"/><path fillRule="evenodd" clipRule="evenodd" d="M17.472 14.304c-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.882-.788-1.477-1.761-1.65-2.059-.173-.298-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.173.198-.297.297-.495.099-.198.05-.371-.025-.52-.074-.149-.669-1.611-.916-2.206-.241-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.793.371-.272.298-1.04 1.016-1.04 2.478s1.065 2.875 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.71.307 1.264.49 1.695.627.712.227 1.36.195 1.871.118.572-.086 1.758-.718 2.006-1.412.248-.694.248-1.288.173-1.412-.074-.124-.272-.198-.57-.347z" fill="#FFF"/></svg>
                    </a>
                  )}
                  {settings?.facebook && (
                    <a href={ensureHttp(settings.facebook)} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-blue-600 transition" title="Facebook">
                      <FacebookBrandIcon size={20} />
                    </a>
                  )}
                  {settings?.twitter && (
                    <a href={ensureHttp(settings.twitter)} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-black transition" title="X / Twitter">
                      <XBrandIcon size={20} />
                    </a>
                  )}
                  {settings?.instagram && (
                    <a href={ensureHttp(settings.instagram)} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-pink-600 transition" title="Instagram">
                      <InstagramBrandIcon size={20} />
                    </a>
                  )}
                  {settings?.linkedin && (
                    <a href={ensureHttp(settings.linkedin)} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-blue-500 transition" title="LinkedIn">
                      <LinkedInBrandIcon size={20} />
                    </a>
                  )}
                  {(settings?.website_url || settings?.telegram_channel_url) && (
                    <a 
                      href={ensureHttp(settings.website_url || settings.telegram_channel_url || "https://t.me/ArchitectJobsTi2A")} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-gray-500 hover:text-blue-500 transition hover:scale-110 transform" 
                      title="Telegram Channel (@ArchitectJobsTi2A)"
                    >
                      <TelegramBrandIcon size={20} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Compact Contact Form */}
            <div>
              <Suspense fallback={<div className="p-8 text-center text-xs text-gray-400">Loading form...</div>}>
                <ContactFormInner settings={settings} />
              </Suspense>
            </div>

          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
