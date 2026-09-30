const fs = require('fs');
let content = fs.readFileSync('app/admin/companies/edit/[id]/page.tsx', 'utf8');

content = content.replace(/address: companyAddress,\s*/g, '');

content = content.replace(
  'select("firm_name, city, state, organization_type, neighborhood, description, website, email, phone, logo_url")',
  'select("firm_name, city, state, organization_type, area, application_email, image")'
);

content = content.replace(
`        if (data) {
          if (data.organization_type) setOrganizationType(data.organization_type);
          if (data.city) setCity(data.city);
          if (data.state) setState(data.state);
          if (data.neighborhood) setArea(data.neighborhood);
          if (data.description) setCompanyDescription(data.description);
          if (data.website) setCompanyWebsite(data.website);
          if (data.email) setCompanyEmail(data.email);
          if (data.phone) setCompanyPhone(data.phone);
          if (data.logo_url) setCompanyLogo(data.logo_url);
        }`,
`        if (data) {
          if (data.organization_type) setOrganizationType(data.organization_type);
          if (data.city) setCity(data.city);
          if (data.state) setState(data.state);
          if (data.area) setArea(data.area);
          if (data.application_email) setCompanyEmail(data.application_email);
          if (data.image) setCompanyLogo(data.image);
        }`
);

fs.writeFileSync('app/admin/companies/edit/[id]/page.tsx', content);