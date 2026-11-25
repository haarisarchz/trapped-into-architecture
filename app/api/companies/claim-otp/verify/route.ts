import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { requestId, code, companyId, userId, designation } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Verification code required." }, { status: 400 });
    }

    // 1. Fetch claim request
    let query = supabase.from("company_claim_requests").select("*");
    if (requestId) {
      query = query.eq("id", requestId);
    } else if (companyId) {
      query = query.eq("company_id", companyId).order("created_at", { ascending: false }).limit(1);
    }
    const { data: claimReq, error: reqErr } = await query.maybeSingle();

    if (reqErr || !claimReq) {
      return NextResponse.json({ error: "Verification session not found or expired. Please request a new code." }, { status: 404 });
    }

    // 2. Parse OTP from verification_notes
    let storedOtp = "";
    let expiresAt = "";
    try {
      const parsed = JSON.parse(claimReq.verification_notes || "{}");
      storedOtp = parsed.otp || "";
      expiresAt = parsed.expires_at || "";
    } catch (e) {
      // fallback
      storedOtp = claimReq.verification_notes;
    }

    if (!storedOtp || storedOtp !== code.trim()) {
      return NextResponse.json({ error: "Invalid verification code. Please check your official company inbox and try again." }, { status: 400 });
    }

    if (expiresAt && new Date(expiresAt) < new Date()) {
      return NextResponse.json({ error: "Verification code has expired. Please request a new one." }, { status: 400 });
    }

    const resolvedCompanyId = claimReq.company_id || companyId;
    const resolvedUserId = userId || claimReq.user_id;

    // 3. Update company record: set claimed_by and is_claimed = true
    if (resolvedCompanyId) {
      await supabase.from("companies").update({
        is_claimed: true,
        claimed_by: resolvedUserId,
        claimed_at: new Date().toISOString(),
        email_verified: true,
      }).eq("id", resolvedCompanyId);
    }

    // 4. Update claim request status to approved
    await supabase.from("company_claim_requests").update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
    }).eq("id", claimReq.id);

    // 5. Update user profile role to company_admin if currently standard user
    if (resolvedUserId) {
      const { data: prof } = await supabase.from("profiles").select("role").eq("id", resolvedUserId).maybeSingle();
      const currentRole = (prof?.role || "").toLowerCase();
      if (!["superadmin", "admin", "ceo", "jobadmin"].includes(currentRole)) {
        await supabase.from("profiles").update({
          role: "company_admin",
          claimed_company_id: resolvedCompanyId,
        }).eq("id", resolvedUserId);
      }

      // 6. Link user experience to company with verified status
      try {
        const { data: existingExp } = await supabase
          .from("profile_experiences")
          .select("id")
          .eq("user_id", resolvedUserId)
          .eq("company_id", resolvedCompanyId)
          .maybeSingle();

        if (existingExp) {
          await supabase.from("profile_experiences").update({
            position: designation || "Principal / Studio Leader",
            is_current: true,
          }).eq("id", existingExp.id);
        } else {
          await supabase.from("profile_experiences").insert([
            {
              user_id: resolvedUserId,
              company_id: resolvedCompanyId,
              firm_name: claimReq.company_name,
              position: designation || "Principal / Studio Leader",
              is_current: true,
              country: "India",
            }
          ]);
        }
      } catch (e) {
        // non-fatal
      }
    }

    // 7. Notify CEO / Platform of verified ownership claim
    try {
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "https://www.trappedintoarchitecture.com"}/api/notify/ceo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "STUDIO_CLAIMED_VERIFIED",
          data: {
            companyId: resolvedCompanyId,
            companyName: claimReq.company_name,
            userId: resolvedUserId,
            email: claimReq.work_email,
            verifiedAt: new Date().toISOString(),
          }
        })
      }).catch(() => {});
    } catch(e) {}

    return NextResponse.json({
      success: true,
      message: `Congratulations! Studio profile for "${claimReq.company_name}" has been verified and linked to your account.`,
      companyId: resolvedCompanyId,
      companySlug: claimReq.company_slug,
    });
  } catch (err: any) {
    console.error("Error verifying claim OTP:", err);
    return NextResponse.json({ error: err.message || "Failed to complete verification." }, { status: 500 });
  }
}
