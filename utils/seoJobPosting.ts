/**
 * Google for Jobs SEO & Structured Data (Schema.org JobPosting)
 * Compliant with Google Search Central specifications:
 * https://developers.google.com/search/docs/appearance/structured-data/job-posting
 */

import { generateCompanySlug } from "./jobUrl";

export interface GoogleJobLocation {
  "@type": "Place";
  address: {
    "@type": "PostalAddress";
    streetAddress?: string;
    addressLocality: string;
    addressRegion?: string;
    addressCountry: string;
  };
}

/**
 * Clean job title according to Google guidelines:
 * - Do NOT include location (Google appends location from jobLocation).
 * - Do NOT include promotional text, emojis, or job codes.
 */
export function cleanJobTitle(position: string): string {
  if (!position) return "Architect";
  let title = position
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .trim();

  // Strip trailing " in [City]" or " - [City]"
  title = title.replace(/\s+(?:in|at|-)\s+[A-Za-z\s]+$/i, '').trim();

  // Standardize common variations if needed, or preserve exact title if clean
  return title || position.trim();
}

/**
 * Map internal employment types to Google's standardized Schema.org enum:
 * FULL_TIME | PART_TIME | CONTRACTOR | TEMPORARY | INTERN | OTHER
 */
export function normalizeEmploymentType(employmentType?: string, position?: string): string {
  const typeStr = (employmentType || "").toLowerCase();
  const posStr = (position || "").toLowerCase();

  if (typeStr.includes("intern") || posStr.includes("intern")) {
    return "INTERN";
  }
  if (typeStr.includes("part")) {
    return "PART_TIME";
  }
  if (typeStr.includes("contract") || typeStr.includes("freelance")) {
    return "CONTRACTOR";
  }
  if (typeStr.includes("temp")) {
    return "TEMPORARY";
  }
  return "FULL_TIME";
}

/**
 * Parses numeric salary for Google's baseSalary schema.
 * Google strictly requires valid numeric values (number or minValue/maxValue range).
 * If the salary is unparseable (e.g. "Negotiable", "Not Disclosed"), returns undefined.
 */
export function parseGoogleSalary(salaryStr?: string): {
  currency: string;
  value: {
    minValue?: number;
    maxValue?: number;
    value?: number;
    unitText: "MONTH" | "YEAR";
  };
} | undefined {
  if (!salaryStr) return undefined;
  const s = String(salaryStr).trim().toLowerCase();

  if (
    s.includes("not disclosed") ||
    s.includes("not specified") ||
    s.includes("negotiable") ||
    s.includes("as per industry") ||
    s.includes("industry standard") ||
    s === "-" ||
    s === "null"
  ) {
    return undefined;
  }

  const isAnnual = s.includes("lpa") || s.includes("lakh") || s.includes("annum") || s.includes("per year") || s.includes("/yr");
  const unitText: "MONTH" | "YEAR" = isAnnual ? "YEAR" : "MONTH";

  // Clean numbers from string (e.g. "₹25,000 - ₹35,000" -> ["25000", "35000"])
  // Handle decimal LPA (e.g. "3.5 - 5 LPA" -> [3.5, 5])
  const matches = s.replace(/,/g, '').match(/\d+(?:\.\d+)?/g);
  if (!matches || matches.length === 0) return undefined;

  const multiplier = isAnnual && (s.includes("lpa") || s.includes("lakh")) ? 100000 : 1;
  const numbers = matches.map(n => Math.round(parseFloat(n) * multiplier)).filter(n => n > 0);

  if (numbers.length === 0) return undefined;

  if (numbers.length === 1) {
    return {
      currency: "INR",
      value: {
        value: numbers[0],
        unitText
      }
    };
  }

  const min = Math.min(...numbers);
  const max = Math.max(...numbers);

  return {
    currency: "INR",
    value: {
      minValue: min,
      maxValue: max,
      unitText
    }
  };
}

/**
 * Parses minimum required months of experience for OccupationalExperienceRequirements.
 */
export function parseMonthsOfExperience(rawExp: any): number | undefined {
  if (!rawExp) return undefined;
  const str = (Array.isArray(rawExp) ? rawExp.join(" ") : String(rawExp)).toLowerCase();

  if (str.includes("fresher") || str.includes("0 year") || str.includes("0-")) {
    return 0;
  }

  const match = str.match(/\d+/);
  if (match) {
    const years = parseInt(match[0], 10);
    if (!isNaN(years) && years >= 0 && years <= 30) {
      return years * 12;
    }
  }

  return undefined;
}

/**
 * Format job description into clean semantic HTML.
 * Google Search Central mandates that JobPosting descriptions MUST be formatted in valid HTML.
 */
export function formatHtmlDescription(
  job: any,
  cleanDescription?: string,
  company?: any
): string {
  const parts: string[] = [];

  const firmName = job.firm_name || "Architecture Firm";
  const position = cleanJobTitle(job.position || "Architect");
  const locStr = [job.area, job.city, job.state].filter(Boolean).join(", ") || "India";

  // Overview paragraph
  parts.push(`<p><strong>${firmName}</strong> is hiring for the position of <strong>${position}</strong> in <strong>${locStr}</strong>.</p>`);

  // Role and main description
  const mainDesc = (cleanDescription || job.job_description || "").trim();
  if (mainDesc) {
    // Convert double line breaks into paragraphs
    const paragraphs = mainDesc.split(/\n\n+/);
    paragraphs.forEach(p => {
      const trimmed = p.trim();
      if (!trimmed) return;

      // Check if paragraph contains bullet points
      if (trimmed.includes("\n- ") || trimmed.includes("\n* ") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const lines = trimmed.split("\n");
        const listItems: string[] = [];
        let headerText = "";

        lines.forEach(line => {
          const l = line.trim();
          if (l.startsWith("- ") || l.startsWith("* ")) {
            listItems.push(`<li>${escapeHtml(l.substring(2))}</li>`);
          } else if (l) {
            headerText += `<p>${escapeHtml(l)}</p>`;
          }
        });

        if (headerText) parts.push(headerText);
        if (listItems.length > 0) parts.push(`<ul>${listItems.join("")}</ul>`);
      } else {
        // Replace single line breaks with <br/>
        const htmlPara = trimmed
          .split("\n")
          .map(l => escapeHtml(l.trim()))
          .join("<br/>")
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        parts.push(`<p>${htmlPara}</p>`);
      }
    });
  }

  // Qualifications list
  const quals = Array.isArray(job.qualifications)
    ? job.qualifications.filter(Boolean)
    : (job.qualifications ? String(job.qualifications).split(",").map(q => q.trim()).filter(Boolean) : []);
  if (quals.length > 0) {
    parts.push(`<h3>Qualifications</h3><ul>${quals.map(q => `<li>${escapeHtml(q)}</li>`).join("")}</ul>`);
  }

  // Skills required list
  const skills = Array.isArray(job.skills_required)
    ? job.skills_required.filter(Boolean)
    : (job.skills_required ? String(job.skills_required).split(",").map(s => s.trim()).filter(Boolean) : []);
  if (skills.length > 0) {
    parts.push(`<h3>Skills Required</h3><ul>${skills.map(s => `<li>${escapeHtml(s)}</li>`).join("")}</ul>`);
  }

  // Experience
  if (job.experience) {
    const expText = Array.isArray(job.experience) ? job.experience.join(", ") : String(job.experience);
    if (expText.trim()) {
      parts.push(`<p><strong>Experience:</strong> ${escapeHtml(expText)}</p>`);
    }
  }

  // Employment Type & Workplace
  const metaDetails: string[] = [];
  if (job.employment_type) metaDetails.push(`<strong>Employment Type:</strong> ${escapeHtml(job.employment_type)}`);
  if (job.workplace_type) metaDetails.push(`<strong>Workplace Type:</strong> ${escapeHtml(job.workplace_type)}`);
  if (metaDetails.length > 0) {
    parts.push(`<p>${metaDetails.join(" | ")}</p>`);
  }

  // Application instructions
  parts.push(
    `<p><strong>How to Apply:</strong> Apply directly through <a href="https://trappedintoarchitecture.com">Trapped Into Architecture</a> to connect with the hiring studio.</p>`
  );

  return parts.join("\n");
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Generate full Google JobPosting Schema JSON-LD.
 */
export function generateJobPostingSchema(
  job: any,
  company?: any,
  cleanDescription?: string,
  canonicalUrl?: string
) {
  const positionTitle = cleanJobTitle(job.position || "Architect");
  const jobUrl = canonicalUrl || `https://trappedintoarchitecture.com/jobs/${job.id}`;
  const htmlDescription = formatHtmlDescription(job, cleanDescription, company);

  const postedDate = job.posted_date || job.created_at || new Date().toISOString();
  const postedDateIso = new Date(postedDate).toISOString();

  // Valid through: explicit post_expiry_date or 60 days from posting
  let validThroughIso: string;
  if (job.post_expiry_date) {
    validThroughIso = new Date(job.post_expiry_date).toISOString();
  } else {
    const d = new Date(postedDate);
    d.setDate(d.getDate() + 60);
    validThroughIso = d.toISOString();
  }

  const isRemote =
    job.workplace_type?.toLowerCase() === "remote" ||
    job.city?.toLowerCase() === "remote";

  const hiringOrg: any = {
    "@type": "Organization",
    "name": job.firm_name || "Architecture Firm",
    "sameAs": company?.website || company?.website_link || `https://trappedintoarchitecture.com/companies/${company?.slug || generateCompanySlug(job.firm_name)}`,
    "logo": company?.logo_url || job.image || "https://trappedintoarchitecture.com/default-logo.png"
  };

  const schema: any = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": positionTitle,
    "description": htmlDescription,
    "identifier": {
      "@type": "PropertyValue",
      "name": "Trapped Into Architecture",
      "value": String(job.id)
    },
    "datePosted": postedDateIso,
    "validThrough": validThroughIso,
    "employmentType": normalizeEmploymentType(job.employment_type, job.position),
    "hiringOrganization": hiringOrg,
    "directApply": true,
    "url": jobUrl
  };

  // Location configuration
  if (isRemote) {
    schema.jobLocationType = "TELECOMMUTE";
    schema.applicantLocationRequirements = {
      "@type": "Country",
      "name": "India"
    };
  } else {
    schema.jobLocation = {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        ...(job.area && job.area.trim() ? { "streetAddress": job.area.trim() } : {}),
        "addressLocality": job.city || "India",
        ...(job.state && job.state.trim() ? { "addressRegion": job.state.trim() } : {}),
        "addressCountry": "IN"
      }
    };
    schema.applicantLocationRequirements = {
      "@type": "Country",
      "name": "India"
    };
  }

  // Base Salary (strictly formatted or omitted if unparseable)
  const salaryObj = parseGoogleSalary(job.salary);
  if (salaryObj) {
    schema.baseSalary = {
      "@type": "MonetaryAmount",
      "currency": salaryObj.currency,
      "value": {
        "@type": "QuantitativeValue",
        ...(salaryObj.value.value !== undefined ? { "value": salaryObj.value.value } : {}),
        ...(salaryObj.value.minValue !== undefined ? { "minValue": salaryObj.value.minValue } : {}),
        ...(salaryObj.value.maxValue !== undefined ? { "maxValue": salaryObj.value.maxValue } : {}),
        "unitText": salaryObj.value.unitText
      }
    };
  }

  // Experience Requirements
  const expMonths = parseMonthsOfExperience(job.experience);
  if (expMonths !== undefined) {
    schema.experienceRequirements = {
      "@type": "OccupationalExperienceRequirements",
      "monthsOfExperience": expMonths
    };
  }

  // Skills
  const skills = Array.isArray(job.skills_required)
    ? job.skills_required.filter(Boolean)
    : (job.skills_required ? String(job.skills_required).split(",").map(s => s.trim()).filter(Boolean) : []);
  if (skills.length > 0) {
    schema.skills = skills.join(", ");
  }

  // Qualifications
  const quals = Array.isArray(job.qualifications)
    ? job.qualifications.filter(Boolean)
    : (job.qualifications ? String(job.qualifications).split(",").map(q => q.trim()).filter(Boolean) : []);
  if (quals.length > 0) {
    schema.qualifications = quals.join(", ");
  }

  return schema;
}

/**
 * Generate BreadcrumbList Schema JSON-LD for rich snippet navigation breadcrumbs in Google.
 */
export function generateJobBreadcrumbs(job: any, canonicalUrl: string) {
  const citySlug = (job.city || "").trim().toLowerCase().replace(/\s+/g, "-");
  const positionTitle = cleanJobTitle(job.position || "Architect");
  const firmName = job.firm_name || "Firm";

  const breadcrumbs: any = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://trappedintoarchitecture.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Architecture Jobs",
        "item": "https://trappedintoarchitecture.com/jobs"
      }
    ]
  };

  if (citySlug) {
    breadcrumbs.itemListElement.push({
      "@type": "ListItem",
      "position": 3,
      "name": `${job.city} Jobs`,
      "item": `https://trappedintoarchitecture.com/jobs/city/${encodeURIComponent(citySlug)}`
    });
    breadcrumbs.itemListElement.push({
      "@type": "ListItem",
      "position": 4,
      "name": `${positionTitle} at ${firmName}`,
      "item": canonicalUrl
    });
  } else {
    breadcrumbs.itemListElement.push({
      "@type": "ListItem",
      "position": 3,
      "name": `${positionTitle} at ${firmName}`,
      "item": canonicalUrl
    });
  }

  return breadcrumbs;
}
