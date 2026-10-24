export type BadgeTier = "bronze" | "silver" | "gold" | "platinum" | "diamond";

export interface ProfileCompletionResult {
  percentage: number;
  badgeTier: BadgeTier;
  missingFields: { label: string; points: number }[];
  isVip: boolean;
}

export interface EducationEntry {
  id?: string;
  level: "high_school" | "diploma" | "ug" | "pg" | "phd";
  degree_name?: string;
  university_name?: string;
  college_name?: string;
  school_board?: string;
  school_name?: string;
  city?: string;
  country?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  score_or_percentage?: string;
}

export interface ExperienceEntry {
  id?: string;
  firm_name: string;
  organization_type?: string;
  position: string;
  role_description?: string;
  city?: string;
  country?: string;
  start_date: string;
  end_date?: string;
  is_current?: boolean;
}

/**
 * Calculates dynamic profile completion percentage (0-100%) and badge tier.
 * Newly registered users collect Full Name & Username (5%), Email (5%), and Profession (10%),
 * guaranteeing 20% on registration and Bronze Member status.
 */
export function calculateProfileCompletion(
  user: any,
  educations: EducationEntry[] = [],
  experiences: ExperienceEntry[] = []
): ProfileCompletionResult {
  let score = 0;
  const missing: { label: string; points: number }[] = [];

  // 1. Basic Identity (40 points total)
  // 1.1 Full Name & Username (5%) - Collected at registration
  if (user?.fullName && user?.username) {
    score += 5;
  } else {
    missing.push({ label: "Full Name & Username", points: 5 });
  }

  // 1.2 Email (5%) - Collected at registration
  if (user?.email) {
    score += 5;
  } else {
    missing.push({ label: "Email Address", points: 5 });
  }

  // 1.3 Profile Picture (10%)
  if (user?.profileImage || user?.avatar_url) {
    score += 10;
  } else {
    missing.push({ label: "Profile Picture / Avatar", points: 10 });
  }

  // 1.4 Tagline / Headline (5%)
  if (user?.tagline && user.tagline.trim().length > 3) {
    score += 5;
  } else {
    missing.push({ label: "Professional Tagline (headline)", points: 5 });
  }

  // 1.5 Bio / About (10%)
  if (user?.bio && user.bio.trim().length > 10) {
    score += 10;
  } else {
    missing.push({ label: "About Me / Professional Bio", points: 10 });
  }

  // 1.6 Date of Birth & Gender (5%)
  if (user?.dob && user?.gender) {
    score += 5;
  } else {
    missing.push({ label: "Date of Birth & Gender", points: 5 });
  }

  // 2. Professional & Council Credentials (20 points total)
  // 2.1 Profession (10%) - Required & selected at registration
  if (user?.profession) {
    score += 10;
  } else {
    missing.push({ label: "Profession Selection", points: 10 });
  }

  // 2.2 COA Registration (or Highest Qualification for students) (10%)
  const isStudent =
    user?.profession?.toLowerCase().includes("student") || false;
  if (user?.coa_number || (isStudent && user?.highest_qualification)) {
    score += 10;
  } else {
    missing.push({
      label: isStudent ? "Highest Qualification" : "COA Registration Details",
      points: 10,
    });
  }

  // 3. Education Details (20 points total)
  if (educations.length > 0) {
    score += 15;
    const hasDetailedInstitutions = educations.some(
      (e) =>
        (e.university_name && e.college_name) ||
        (e.school_board && e.school_name)
    );
    if (hasDetailedInstitutions) {
      score += 5;
    } else {
      missing.push({
        label: "Separate University/College or Board/School details",
        points: 5,
      });
    }
  } else {
    missing.push({ label: "Add at least one Education degree", points: 15 });
    missing.push({
      label: "Detailed College & University specification",
      points: 5,
    });
  }

  // 4. Experience Details (20 points total)
  if (experiences.length > 0) {
    score += 15;
    const hasDetailedOrg = experiences.some(
      (e) => e.organization_type && e.role_description
    );
    if (hasDetailedOrg) {
      score += 5;
    } else {
      missing.push({
        label: "Organization type & role description in experience",
        points: 5,
      });
    }
  } else {
    missing.push({ label: "Add at least one Work Experience", points: 15 });
    missing.push({
      label: "Organization type & role details",
      points: 5,
    });
  }

  // Ensure 0-100 clamp
  const percentage = Math.min(100, Math.max(0, score));

  // Determine Badge Tier strictly across the 5 member levels:
  // Bronze: 20-49, Silver: 50-69, Gold: 70-84, Platinum: 85-94, Diamond: 95-100
  let badgeTier: BadgeTier = "bronze";
  if (percentage >= 95) {
    badgeTier = "diamond";
  } else if (percentage >= 85) {
    badgeTier = "platinum";
  } else if (percentage >= 70) {
    badgeTier = "gold";
  } else if (percentage >= 50) {
    badgeTier = "silver";
  }

  // VIP is an honorary distinction on Diamond for favorites / notable architects / fans
  const isVip = Boolean(user?.is_vip);

  return {
    percentage,
    badgeTier,
    missingFields: missing,
    isVip,
  };
}

/**
 * Calculates total experience in years, months, and days across all work entries,
 * merging overlapping date ranges.
 */
export function calculateTotalExperience(experiences: ExperienceEntry[]): {
  years: number;
  months: number;
  days: number;
  formatted: string;
} {
  if (!experiences || experiences.length === 0) {
    return { years: 0, months: 0, days: 0, formatted: "Fresher / No experience added" };
  }

  const intervals: { start: number; end: number }[] = [];
  const now = new Date().getTime();

  experiences.forEach((exp) => {
    if (!exp.start_date) return;
    const start = new Date(exp.start_date).getTime();
    if (isNaN(start)) return;
    const end = exp.is_current || !exp.end_date ? now : new Date(exp.end_date).getTime();
    if (end >= start) {
      intervals.push({ start, end });
    }
  });

  if (intervals.length === 0) {
    return { years: 0, months: 0, days: 0, formatted: "Fresher / No experience added" };
  }

  intervals.sort((a, b) => a.start - b.start);

  const merged: { start: number; end: number }[] = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const prev = merged[merged.length - 1];
    const curr = intervals[i];
    if (curr.start <= prev.end) {
      prev.end = Math.max(prev.end, curr.end);
    } else {
      merged.push(curr);
    }
  }

  let totalMs = 0;
  merged.forEach((int) => {
    totalMs += int.end - int.start;
  });

  const totalDays = Math.floor(totalMs / (1000 * 60 * 60 * 24));
  const years = Math.floor(totalDays / 365);
  const remainingDaysAfterYears = totalDays % 365;
  const months = Math.floor(remainingDaysAfterYears / 30);
  const days = remainingDaysAfterYears % 30;

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "yr" : "yrs"}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? "mo" : "mos"}`);
  if (days > 0 && years === 0) parts.push(`${days} ${days === 1 ? "day" : "days"}`);

  return {
    years,
    months,
    days,
    formatted: parts.length > 0 ? parts.join(" ") : "Less than a month",
  };
}

/**
 * Returns badge styling, icons, and titles.
 */
export function getBadgeDetails(tier: BadgeTier, isVip = false) {
  const configs: Record<
    BadgeTier,
    { title: string; color: string; bg: string; border: string; icon: string }
  > = {
    bronze: {
      title: "Bronze Member",
      color: "text-amber-800",
      bg: "bg-amber-100",
      border: "border-amber-300",
      icon: "🥉",
    },
    silver: {
      title: "Silver Member",
      color: "text-slate-700",
      bg: "bg-slate-100",
      border: "border-slate-300",
      icon: "🥈",
    },
    gold: {
      title: "Gold Member",
      color: "text-yellow-800",
      bg: "bg-yellow-100",
      border: "border-yellow-400",
      icon: "🥇",
    },
    platinum: {
      title: "Platinum Member",
      color: "text-cyan-800",
      bg: "bg-cyan-100",
      border: "border-cyan-300",
      icon: "💎",
    },
    diamond: {
      title: isVip ? "Diamond Member (VIP)" : "Diamond Member",
      color: "text-purple-800",
      bg: "bg-purple-100",
      border: isVip ? "border-amber-400" : "border-purple-300",
      icon: isVip ? "⭐" : "👑",
    },
  };

  const badge = configs[tier] || configs.bronze;
  return {
    ...badge,
    isVip,
    vipTitle: isVip ? "VIP Diamond Member" : undefined,
  };
}
