"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { Phone, Mail, MessageCircle, MapPin, Globe, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

export default function ContactPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [status, setStatus] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    
    setTimeout(() => {
      setStatus("success");
      setFormData({ name: "", email: "", phone: "", message: "" });
    }, 1000);
  };

  if (loading) return null;

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto py-16 px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions about posting a job, finding a role, or partnering with us? Reach out and our team will get back to you shortly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
          
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Get in Touch</h2>
            <div className="space-y-6">
              
              {/* Direct Contacts */}
              {settings?.email && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                    <Mail className="text-gray-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Email</div>
                    <a href={`mailto:${settings.email}`} className="text-gray-600 hover:text-black">{settings.email}</a>
                  </div>
                </div>
              )}
              
              {settings?.phone && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                    <Phone className="text-gray-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Phone</div>
                    <a href={`tel:${settings.phone}`} className="text-gray-600 hover:text-black">{settings.phone}</a>
                  </div>
                </div>
              )}

              {settings?.whatsapp && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                    <MessageCircle className="text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Direct WhatsApp</div>
                    <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-green-600">Message Us</a>
                  </div>
                </div>
              )}
              
              {settings?.contact_address && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="text-gray-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Address</div>
                    <div className="text-gray-600 whitespace-pre-wrap">{settings.contact_address}</div>
                  </div>
                </div>
              )}
              
              {settings?.website_url && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                    <Globe className="text-gray-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Website</div>
                    <a href={settings.website_url} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-black">{settings.website_url.replace(/^https?:\/\//, '')}</a>
                  </div>
                </div>
              )}
            </div>

            <h3 className="font-bold text-gray-900 mt-10 mb-4">Official Channels</h3>
            <div className="flex gap-4 items-center">
              {settings?.whatsapp_channel_url && (
                <a href={settings.whatsapp_channel_url} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-green-500 transition" title="WhatsApp Channel">
                  <MessageCircle size={24} />
                </a>
              )}
              {settings?.facebook && (
                <a href={settings.facebook} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-blue-600 transition" title="Facebook">
                  <Facebook size={24} />
                </a>
              )}
              {settings?.twitter && (
                <a href={settings.twitter} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-black transition" title="X / Twitter">
                  <Twitter size={24} />
                </a>
              )}
              {settings?.instagram && (
                <a href={settings.instagram} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-pink-600 transition" title="Instagram">
                  <Instagram size={24} />
                </a>
              )}
              {settings?.linkedin && (
                <a href={settings.linkedin} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-blue-500 transition" title="LinkedIn">
                  <Linkedin size={24} />
                </a>
              )}
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-black outline-none" 
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-black outline-none" 
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-black outline-none" 
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-black outline-none" 
                  placeholder="How can we help you?"
                />
              </div>

              {status === "success" && (
                <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm font-medium">
                  Thanks! Your message has been sent successfully.
                </div>
              )}

              <button 
                type="submit" 
                disabled={status === "submitting"}
                className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition disabled:opacity-50"
              >
                {status === "submitting" ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

        </div>
      </div>
      
      <Footer />
    </main>
  );
}