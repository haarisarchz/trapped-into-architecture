const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const useEffects = `
  // --- AUTOSAVE & TAB CLOSE PROTECTION ---
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!jobId && (firmName || positions[0]?.position)) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [firmName, positions, jobId]);

  useEffect(() => {
    if (jobId) return;
    const timer = setTimeout(() => {
      if (!firmName && !positions[0]?.position) return;
      const draftData = {
        firmName, organizationType, employmentType, workplaceType,
        area, city, state, skills, qualifications, applicationType,
        apply_link, application_email, source, imageUrl, dateType,
        lastDateToApply, postExpiryDate, positions, sameRequirements,
        companyLogo, companyAddress, companyDescription, companyWebsite,
        companyEmail, companyPhone, companyFacebook, companyInstagram,
        companyLinkedin, companyTwitter, companyWhatsapp, principalArchitect,
        employeeSize, foundedYear
      };
      localStorage.setItem("job_autosave", JSON.stringify(draftData));
    }, 2000);
    return () => clearTimeout(timer);
  }, [firmName, organizationType, employmentType, workplaceType, area, city, state, skills, qualifications, applicationType, apply_link, application_email, source, imageUrl, dateType, lastDateToApply, postExpiryDate, positions, sameRequirements, companyLogo, companyAddress, companyDescription, companyWebsite, companyEmail, companyPhone, companyFacebook, companyInstagram, companyLinkedin, companyTwitter, companyWhatsapp, principalArchitect, employeeSize, foundedYear, jobId]);

  useEffect(() => {
    if (jobId) return;
    const saved = localStorage.getItem("job_autosave");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.firmName || data.positions?.[0]?.position) {
          if (window.confirm("We found an unsaved job application on this device. Would you like to restore it?")) {
            if (data.firmName) setFirmName(data.firmName);
            if (data.organizationType) setOrganizationType(data.organizationType);
            if (data.employmentType) setEmploymentType(data.employmentType);
            if (data.workplaceType) setWorkplaceType(data.workplaceType);
            if (data.area) setArea(data.area);
            if (data.city) setCity(data.city);
            if (data.state) setState(data.state);
            if (data.skills) setSkills(data.skills);
            if (data.qualifications) setQualifications(data.qualifications);
            if (data.applicationType) setApplicationType(data.applicationType);
            if (data.apply_link) setapply_link(data.apply_link);
            if (data.application_email) setapplication_email(data.application_email);
            if (data.source) setSource(data.source);
            if (data.imageUrl) setImageUrl(data.imageUrl);
            if (data.dateType) setDateType(data.dateType);
            if (data.lastDateToApply) setLastDateToApply(data.lastDateToApply);
            if (data.postExpiryDate) setPostExpiryDate(data.postExpiryDate);
            if (data.positions) setPositions(data.positions);
            if (data.sameRequirements !== undefined) setSameRequirements(data.sameRequirements);
            if (data.companyLogo) setCompanyLogo(data.companyLogo);
            if (data.companyAddress) setCompanyAddress(data.companyAddress);
            if (data.companyDescription) setCompanyDescription(data.companyDescription);
            if (data.companyWebsite) setCompanyWebsite(data.companyWebsite);
            if (data.companyEmail) setCompanyEmail(data.companyEmail);
            if (data.companyPhone) setCompanyPhone(data.companyPhone);
            if (data.companyFacebook) setCompanyFacebook(data.companyFacebook);
            if (data.companyInstagram) setCompanyInstagram(data.companyInstagram);
            if (data.companyLinkedin) setCompanyLinkedin(data.companyLinkedin);
            if (data.companyTwitter) setCompanyTwitter(data.companyTwitter);
            if (data.companyWhatsapp) setCompanyWhatsapp(data.companyWhatsapp);
            if (data.principalArchitect) setPrincipalArchitect(data.principalArchitect);
            if (data.employeeSize) setEmployeeSize(data.employeeSize);
            if (data.foundedYear) setFoundedYear(data.foundedYear);
          } else {
            localStorage.removeItem("job_autosave");
          }
        }
      } catch (e) {
        console.error("Failed to restore autosave", e);
      }
    }
  }, [jobId]);
  // ---------------------------------------
`;

file = file.replace(
  '  useEffect(() => {\n    if (selectedCompanyId) {',
  useEffects + '\n  useEffect(() => {\n    if (selectedCompanyId) {'
);

file = file.replace(
  '      if (status !== "draft") {\n        router.push("/admin/jobs");\n      }',
  '      localStorage.removeItem("job_autosave");\n      if (status !== "draft") {\n        router.push("/admin/jobs");\n      }'
);

fs.writeFileSync('app/admin/add-job/page.tsx', file);
console.log('Patched');
