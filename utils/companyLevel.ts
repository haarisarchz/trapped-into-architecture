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
  missingFields: string[];
}

/**
 * Automatically calculates dynamic studio level based on profile completeness (0-100%).
 * No manual dropdown needed. As firm details (logo, bio, contact, location, socials)
 * are filled, the studio automatically ranks up:
 *  - 0% - 39%: Bronze Level Studio 🥉
 *  - 40% - 64%: Silver Level Studio 🥈
 *  - 65% - 84%: Gold Level Studio 🥇
 *  - 85% - 94%: Platinum Level Studio 💎
 *  - 95% - 100%: Diamond Level Studio 👑 (eligible for VIP Badge ⭐)
 */
export function calculateCompanyLevel(company: any): CompanyLevelResult {
  if (!company) {
    return {
      score: 0,
      tier: "bronze",
      label: "Bronze Level Studio",
      icon: "🥉",
      bg: "bg-amber-50",
      text: "text-amber-800",
      border: "border-amber-200",
      isVip: false,
      missingFields: ["Studio information"],
    };
  }

  let score = 0;
  const missing: string[] = [];

  // 1. Basic Identity (40% total)
  // 1.1 Firm Name (10%)
  if (company.firm_name && company.firm_name.trim().length > 1) {
    score += 10;
  } else {
    missing.push("Firm Name");
  }

  // 1.2 Studio Logo (15%)
  if (company.logo_url && company.logo_url.trim().length > 5) {
    score += 15;
  } else {
    missing.push("Studio Logo");
  }

  // 1.3 Overview / Description (15%)
  if (
    (company.description && company.description.trim().length > 25) ||
    (company.about_firm && company.about_firm.trim().length > 25)
  ) {
    score += 15;
  } else {
    missing.push("Studio Overview / About Description");
  }

  // 2. Location & Address (15% total)
  if (company.city && company.state) {
    score += 15;
  } else if (company.city || company.state || company.neighborhood) {
    score += 8;
    missing.push("Complete City & State");
  } else {
    missing.push("City & State Location");
  }

  // 3. Contact & Connectivity (25% total)
  // 3.1 Official Email (10%)
  if (
    (company.email && company.email.trim().length > 4) ||
    (company.contact_email && company.contact_email.trim().length > 4)
  ) {
    score += 10;
  } else {
    missing.push("Official Contact Email");
  }

  // 3.2 Phone / WhatsApp (10%)
  if (
    (company.phone && company.phone.trim().length > 5) ||
    (company.whatsapp && company.whatsapp.trim().length > 5)
  ) {
    score += 10;
  } else {
    missing.push("Phone or WhatsApp Number");
  }

  // 3.3 Website (5%)
  if (
    (company.website && company.website.trim().length > 4) ||
    (company.website_link && company.website_link.trim().length > 4)
  ) {
    score += 5;
  } else {
    missing.push("Official Website Link");
  }

  // 4. Practice Typology & Scale (15% total)
  // 4.1 Organization Type (5%)
  if (company.organization_type && company.organization_type.trim().length > 1) {
    score += 5;
  } else {
    missing.push("Practice Typology");
  }

  // 4.2 Founded Year or Employee Size (5%)
  if (company.founded_year || company.employee_size) {
    score += 5;
  } else {
    missing.push("Founded Year or Team Size");
  }

  // 4.3 Social Channels (5%)
  if (
    company.instagram ||
    company.linkedin ||
    company.facebook ||
    company.twitter
  ) {
    score += 5;
  } else {
    missing.push("Social Profile (LinkedIn/Instagram)");
  }

  // 5. Verification Bonus (5%)
  if (company.is_verified || company.email_verified || company.phone_verified) {
    score += 5;
  }

  score = Math.min(100, Math.max(0, score));

  // Determine Tier
  let tier: StudioLevelTier = "bronze";
  if (score >= 95) {
    tier = "diamond";
  } else if (score >= 80) {
    tier = "platinum";
  } else if (score >= 60) {
    tier = "gold";
  } else if (score >= 40) {
    tier = "silver";
  }

  const isVip = Boolean(company.is_vip);

  const configs: Record<
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
      label: isVip ? "VIP Diamond Studio" : "Diamond Level Studio",
      icon: isVip ? "⭐" : "👑",
      bg: isVip ? "bg-amber-100" : "bg-purple-50",
      text: isVip ? "text-amber-900" : "text-purple-800",
      border: isVip ? "border-amber-400" : "border-purple-300",
    },
  };

  return {
    score,
    tier,
    ...configs[tier],
    isVip,
    missingFields: missing,
  };
}
