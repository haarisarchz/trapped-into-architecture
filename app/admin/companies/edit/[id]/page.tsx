"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import ImageUploader from "@/components/ImageUploader";

function EditCompanyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const companyId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  

  // Form State
  const [firmName, setFirmName] = useState("");
  const [organizationType, setOrganizationType] = useState("Firm");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [area, setArea] = useState("");
  const [country, setCountry] = useState("India");

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

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!user) {
      router.push("/");
      return;
    }
    
    if (companyId === "new" || companyId === "null") {
      setFirmName(searchParams.get("name") || "");
      setCity(searchParams.get("city") || "");
      setState(searchParams.get("state") || "");
      setLoading(false);
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
        setOrganizationType(data.organization_type || "Firm");
        setCity(data.city || "");
        setState(data.state || "");
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
      }
    } catch (err: any) {
      console.error(err.message);
      alert("Error loading company details");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!firmName) {
      alert("Company Name is required.");
      return;
    }

    setSaving(true);
    try {
      const companyPayload = {
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
        founded_year: foundedYear ? parseInt(foundedYear) : null
      };

      let error;
      
      if (companyId === "new" || companyId === "null") {
        let authorId = (await supabase.auth.getUser()).data.user?.id;
        if (!authorId) {
          const user = JSON.parse(localStorage.getItem("currentUser") || "null");
          authorId = user ? user.id : null;
        }
        
        const companySlug = firmName.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
        const { error: insertError } = await supabase.from("companies").insert([
          { ...companyPayload, slug: companySlug, created_by: authorId }
        ]);
        error = insertError;
      } else {
        
          let authorId = (await supabase.auth.getUser()).data.user?.id;
          const { error: updateError } = await supabase.from("companies").update({
             ...companyPayload,
             updated_by: authorId || null,
             updated_at: new Date().toISOString()
          }).eq("id", companyId);
        error = updateError;
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
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Edit Company: {firmName}</h1>
          <button 
            onClick={() => router.push("/admin/companies")}
            className="text-gray-600 hover:text-black hover:underline"
          >
            ← Back to Companies
          </button>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100">
          
          {/* Base Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block mb-1.5 text-sm font-medium">Company / Firm Name <span className="text-red-500">*</span></label>
              <input type="text" value={firmName} onChange={(e) => setFirmName(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium">Organization Type</label>
              <select value={organizationType} onChange={(e) => setOrganizationType(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white">
                <option value="Firm">Firm</option>
                <option value="Company">Company</option>
                <option value="Institution">Institution</option>
                <option value="NGO">NGO</option>
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
              disabled={saving || uploadingImage}
              className="bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 disabled:opacity-50 font-bold transition"
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