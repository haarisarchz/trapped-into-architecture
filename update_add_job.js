const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

// 1. Add isSavingCompany state and handleSaveCompany function
const insertPoint = content.indexOf('const handlePublishJob = async');
const newLogic = `
  const [isSavingCompany, setIsSavingCompany] = useState(false);

  const handleSaveCompany = async (e?: any) => {
    if (e) e.preventDefault();
    if (!firmName) {
      alert("Organization name is required to save company details.");
      return;
    }
    setIsSavingCompany(true);
    try {
      const activeUser = JSON.parse(localStorage.getItem("currentUser") || "null");
      
      const companyPayload = {
        firm_name: firmName.trim(),
        city: city || "",
        state: state || "",
        neighborhood: area || "",
        organization_type: organizationType || "Firm",
        logo_url: companyLogo || "",
        description: companyDescription || "",
        website: companyWebsite || "",
        email: companyEmail || "",
        phone: companyPhone || "",
        facebook: companyFacebook || "",
        instagram: companyInstagram || "",
        linkedin: companyLinkedin || "",
        whatsapp: companyWhatsapp || "",
        twitter: companyTwitter || "",
        principal_architect: principalArchitect || "",
        employee_size: employeeSize || "",
        founded_year: foundedYear ? parseInt(foundedYear) : null
      };

      if (selectedCompanyId) {
        const { error } = await supabase.from("companies").update(companyPayload).eq("id", selectedCompanyId);
        if (error) throw error;
        alert("Company details updated successfully!");
        setIsCompanyProfileDirty(false);
      } else {
        const { data: existingCompany } = await supabase.from("companies").select("id").ilike("firm_name", firmName.trim()).maybeSingle();
        if (existingCompany) {
           const { error } = await supabase.from("companies").update(companyPayload).eq("id", existingCompany.id);
           if (error) throw error;
           setSelectedCompanyId(existingCompany.id);
           alert("Company details updated successfully!");
           setIsCompanyProfileDirty(false);
        } else {
           const companySlug = firmName.toLowerCase().trim().replace(/\\s+/g, "-").replace(/[^\\w-]+/g, "");
           const { data: newComp, error } = await supabase.from("companies").insert([
             { ...companyPayload, slug: companySlug, created_by: activeUser?.id || null }
           ]).select().single();
           if (error) throw error;
           if (newComp) setSelectedCompanyId(newComp.id);
           alert("Company created and saved successfully!");
           setIsCompanyProfileDirty(false);
        }
      }
    } catch (err) {
      console.error("Error saving company:", err);
      alert("Failed to save company details.");
    } finally {
      setIsSavingCompany(false);
    }
  };

`;

content = content.substring(0, insertPoint) + newLogic + content.substring(insertPoint);

// 2. Add whatsapp and twitter to companyPayload in handlePublishJob
const payloadRegex = /const companyPayload = \{\s*firm_name: firmName,[\s\S]*?employee_size: employeeSize,\s*founded_year: foundedYear \? parseInt\(foundedYear\) : null\s*\};/;
const updatedPayload = `const companyPayload = {
          firm_name: firmName,
          city: city,
          state: state,
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
          employee_size: employeeSize,
          founded_year: foundedYear ? parseInt(foundedYear) : null
        };`;

content = content.replace(payloadRegex, updatedPayload);

// 3. Update the UI for Company Profile header to include the button
const headerRegex = /<h2 className="text-xl font-bold border-b border-gray-100 pb-2">\s*Company Profile\s*<\/h2>/;
const updatedHeader = `<div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <h2 className="text-xl font-bold">
                      Company Profile
                    </h2>
                    <button 
                      type="button"
                      onClick={handleSaveCompany} 
                      disabled={!firmName || isSavingCompany}
                      className="bg-black text-white text-sm px-4 py-1.5 rounded hover:bg-gray-800 disabled:opacity-50 transition"
                    >
                      {isSavingCompany ? "Saving..." : "Save Company Profile"}
                    </button>
                  </div>`;

content = content.replace(headerRegex, updatedHeader);

fs.writeFileSync('app/admin/add-job/page.tsx', content);
console.log("Updated add-job logic successfully");