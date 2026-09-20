"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from("site_settings").select("*").eq("id", "global").maybeSingle();
      if (data) setSettings(data);
      setLoading(false);
    }
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const { error } = await supabase.from("contact_messages").insert([{
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      message: formData.get("message")
    }]);

    setSubmitting(false);
    if (!error) {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } else {
      alert("Failed to send message. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-6xl mx-auto py-20 px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Have questions or need assistance? Fill out the form below or reach out to us directly through our official channels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
            {loading ? (
              <p className="text-gray-500">Loading contact information...</p>
            ) : (
              <div className="space-y-6">
                {settings?.email && (
                  <div className="flex items-center gap-4 text-lg">
                    <Mail className="w-6 h-6 text-black" />
                    <a href={`mailto:${settings.email}`} className="hover:underline">{settings.email}</a>
                  </div>
                )}
                {settings?.phone && (
                  <div className="flex items-center gap-4 text-lg">
                    <Phone className="w-6 h-6 text-black" />
                    <a href={`tel:${settings.phone}`} className="hover:underline">{settings.phone}</a>
                  </div>
                )}
                
                {/* Socials */}
                <div className="pt-6 mt-6 border-t border-gray-100">
                  <h3 className="font-semibold mb-4 text-gray-800">Connect with us</h3>
                  <div className="flex flex-col gap-3">
                    {settings?.whatsapp && <a href={settings.whatsapp} target="_blank" rel="noreferrer" className="text-green-600 font-medium hover:underline">WhatsApp Channel</a>}
                    {settings?.linkedin && <a href={settings.linkedin} target="_blank" rel="noreferrer" className="text-blue-600 font-medium hover:underline">LinkedIn</a>}
                    {settings?.instagram && <a href={settings.instagram} target="_blank" rel="noreferrer" className="text-pink-600 font-medium hover:underline">Instagram</a>}
                    {settings?.facebook && <a href={settings.facebook} target="_blank" rel="noreferrer" className="text-blue-700 font-medium hover:underline">Facebook</a>}
                    {settings?.x_twitter && <a href={settings.x_twitter} target="_blank" rel="noreferrer" className="text-black font-medium hover:underline">X (Twitter)</a>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200">
            {success ? (
              <div className="text-center py-10">
                <h3 className="text-2xl font-bold text-green-600 mb-2">Message Sent!</h3>
                <p className="text-gray-600">Thank you for reaching out. We will get back to you shortly.</p>
                <button onClick={() => setSuccess(false)} className="mt-6 font-medium hover:underline text-black">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Full Name *</label>
                  <input type="text" name="name" required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Email *</label>
                    <input type="email" name="email" required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Phone</label>
                    <input type="tel" name="phone" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Message *</label>
                  <textarea name="message" required rows={5} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"></textarea>
                </div>
                <button type="submit" disabled={submitting} className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 transition">
                  {submitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}