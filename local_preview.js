const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/edit/[id]/page.tsx', 'utf8');

const oldImageUpload = `    setUploadingImage(true);

    const safeFirm = firmName ? firmName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'company';`;

const newImageUpload = `    setUploadingImage(true);
    
    // Immediate local preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setCompanyLogo(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    const safeFirm = firmName ? firmName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'company';`;

content = content.replace(oldImageUpload, newImageUpload);

fs.writeFileSync('app/admin/companies/edit/[id]/page.tsx', content);
console.log("Added immediate local preview");