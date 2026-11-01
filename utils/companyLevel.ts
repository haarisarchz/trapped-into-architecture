export type StudioLevelTier = "bronze" | "silver" | "gold" | "platinum" | "diamond";

export interface CompanyLevelResult {
  score: number;
  tier: StudioLevelTier;
  label: string;
  icon: string;
  bg: string;
  text: string;
  border: string;
  isVip: boolean;
  isInstitution: boolean;
  missingFields: string[];
}

/**
 * Checks whether an entity represents a College, University, or Academic Institution.
 */
export function isInstitution(company: any): boolean {
  if (!company) return false;
  const orgType = (company.organization_type || "").toLowerCase();
  const name = (company.firm_name || "").toLowerCase();

  return (
    orgType.includes("institution") ||
    orgType.includes("academic") ||
    orgType.includes("university") ||
    orgType.includes("college") ||
    orgType.includes("school") ||
    name.includes("university") ||
    name.includes("college") ||
    name.includes("institute of") ||
    name.includes("institution") ||
    name.includes("academy")
  );
}

/**
 * Automatically calculates dynamic studio or institution level based on 10 equally balanced components (10% each = 100%).
 * 
 * Equal 10-point distribution:
 *  1. Firm Name & Typology: 10% (5% name + 5% typology)
 *  2. Studio Logo / Brand Mark: 10%
 *  3. Studio Overview / About Bio (>25 chars): 10%
 *  4. City & State Geographical Location: 10% (10% full, 5% partial)
 *  5. Direct Contact Coordinates: 10% (5% email + 5% phone/whatsapp)
 *  6. Official Website URL: 10%
 *  7. Social Outreach Channels: 10%
 *  8. Leadership & Scale (Founders/Team/Year): 10%
 *  9. Claimed Ownership: 10%
 * 10. Verified Authenticity: 10%
 *
 * Tiers:
 *  - 0% - 44%: Bronze Level Studio 🥉
 *  - 45% - 65%: Silver Level Studio 🥈
 *  - 66% - 80%: Gold Level Studio 🥇 (Gate to post job openings)
 *  - 81% - 90%: Platinum Level Studio 💎
 *  - 91% - 100%: Diamond Level Studio 👑
 * 
 * For Academic Institutions / Colleges / Universities:
 *  - Reaching 66%+ (or verified) -> "Verified Institution" 🏛️
 *  - Below 66% -> "Academic Institution" 🏛️
 */
export function calculateCompanyLevel(company: any): CompanyLevelResult {
  const institution = isInstitution(company);

  if (!company) {
    return {
      score: 0,
      tier: "bronze",
      label: institution ? "Academic Institution" : "Bronze Level Studio",
      icon: institution ? "🏛️" : "🥉",
      bg: institution ? "bg-slate-100" : "bg-amber-50",
      text: institution ? "text-slate-800" : "text-amber-800",
      border: institution ? "border-slate-300" : "border-amber-200",
      isVip: false,
      isInstitution: institution,
      missingFields: ["Studio information"],
    };
  }

  let score = 0;
  const missing: string[] = [];

  // 1. Identity & Typology (10% total)
  let identityScore = 0;
  if (company.firm_name && company.firm_name.trim().length > 1) {
    identityScore += 5;
  } else {
    missing.push("Firm / Entity Name");
  }
  if (company.organization_type && company.organization_type.trim().length > 1) {
    identityScore += 5;
  } else {
    missing.push("Practice Typology");
  }
  score += identityScore;

  // 2. Studio Logo / Brand Mark (10% total)
  if (company.logo_url && company.logo_url.trim().length > 5) {
    score += 10;
  } else {
    missing.push("Logo / Brand Mark");
  }

  // 3. Overview / About Bio (10% total)
  if (
    (company.description && company.description.trim().length > 25) ||
    (company.about_firm && company.about_firm.trim().length > 25)
  ) {
    score += 10;
  } else {
    missing.push("Overview / About Description");
  }

  // 4. Physical Location (10% total)
  if (company.city && company.state) {
    score += 10;
  } else if (company.city || company.state || company.neighborhood) {
    score += 5;
    missing.push("Complete City & State Location");
  } else {
    missing.push("City & State Location");
  }

  // 5. Direct Contact Coordinates (10% total)
  let contactScore = 0;
  if (
    (company.email && company.email.trim().length > 4) ||
    (company.contact_email && company.contact_email.trim().length > 4)
  ) {
    contactScore += 5;
  } else {
    missing.push("Official Contact Email");
  }
  if (
    (company.phone && company.phone.trim().length > 5) ||
    (company.whatsapp && company.whatsapp.trim().length > 5)
  ) {
    contactScore += 5;
  } else {
    missing.push("Phone or WhatsApp Number");
  }
  score += contactScore;

  // 6. Official Website URL (10% total)
  if (
    (company.website && company.website.trim().length > 4) ||
    (company.website_link && company.website_link.trim().length > 4)
  ) {
    score += 10;
  } else {
    missing.push("Official Website URL");
  }

  // 7. Social Media Outreach (10% total)
  if (
    company.instagram ||
    company.linkedin ||
    company.facebook ||
    company.twitter
  ) {
    score += 10;
  } else {
    missing.push("Social Profile (LinkedIn/Instagram)");
  }

  // 8. Scale & Leadership (10% total)
  if (company.principal_architect || company.founded_year || company.employee_size) {
    score += 10;
  } else {
    missing.push("Leadership / Team Size / Founded Year");
  }

  // 9. Claimed Ownership (10% total)
  if (company.is_claimed || company.claimed_by) {
    score += 10;
  } else {
    missing.push("Claimed Profile");
  }

  // 10. Verification Credibility (10% total)
  if (company.is_verified || company.email_verified || company.phone_verified) {
    score += 10;
  } else {
    missing.push("Verified Trust Status");
  }

  score = Math.min(100, Math.max(0, score));

  // Determine Tier
  let tier: StudioLevelTier = "bronze";
  if (score >= 91) {
    tier = "diamond";
  } else if (score >= 81) {
    tier = "platinum";
  } else if (score >= 66) {
    tier = "gold";
  } else if (score >= 45) {
    tier = "silver";
  }

  const isVip = Boolean(company.is_vip);

  // Standard Studio Tier Configs
  const studioConfigs: Record<
    StudioLevelTier,
    { label: string; icon: string; bg: string; text: string; border: string }
  > = {
    bronze: {
      label: "Bronze Level Studio",
      icon: "🥉",
      bg: "bg-amber-50",
      text: "text-amber-800",
      border: "border-amber-200",
    },
    silver: {
      label: "Silver Level Studio",
      icon: "🥈",
      bg: "bg-slate-100",
      text: "text-slate-800",
      border: "border-slate-300",
    },
    gold: {
      label: "Gold Level Studio",
      icon: "🥇",
      bg: "bg-yellow-50",
      text: "text-yellow-800",
      border: "border-yellow-300",
    },
    platinum: {
      label: "Platinum Level Studio",
      icon: "💎",
      bg: "bg-cyan-50",
      text: "text-cyan-800",
      border: "border-cyan-300",
    },
    diamond: {
      label: "Diamond Level Studio",
      icon: "👑",
      bg: "bg-purple-50",
      text: "text-purple-800",
      border: "border-purple-300",
    },
  };

  // For Colleges & Universities:
  // Reaching Gold (66%+) or verified -> "Verified Institution"
  // Otherwise -> "Academic Institution"
  if (institution) {
    const isVerifiedInstitution = score >= 66 || company.is_verified;
    return {
      score,
      tier,
      label: isVerifiedInstitution ? "Verified Institution" : "Academic Institution",
      icon: "🏛️",
      bg: isVerifiedInstitution ? "bg-indigo-50" : "bg-slate-100",
      text: isVerifiedInstitution ? "text-indigo-900" : "text-slate-800",
      border: isVerifiedInstitution ? "border-indigo-300" : "border-slate-300",
      isVip,
      isInstitution: true,
      missingFields: missing,
    };
  }

  return {
    score,
    tier,
    ...studioConfigs[tier],
    isVip,
    isInstitution: false,
    missingFields: missing,
  };
}
