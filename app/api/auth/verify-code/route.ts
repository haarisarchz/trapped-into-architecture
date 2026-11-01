import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { email, code, userId } = await req.json();

    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanCode = (code || "").trim();

    if (!cleanCode) {
      return NextResponse.json(
        { success: false, error: "Please enter your 6-digit verification code." },
        { status: 400 }
      );
    }

    if (!cleanEmail && !userId) {
      return NextResponse.json(
        { success: false, error: "Email or user ID is required for verification." },
        { status: 400 }
      );
    }

    // 1. Fetch user profile
    let query = supabase.from("profiles").select("id, email, full_name, username, verification_token, verification_token_expires, email_verified, verified");
    if (userId) {
      query = query.eq("id", userId);
    } else {
      query = query.eq("email", cleanEmail);
    }

    const { data: profile, error: fetchErr } = await query.maybeSingle();

    if (fetchErr || !profile) {
      return NextResponse.json(
        { success: false, error: "User profile not found. Please try again or register." },
        { status: 404 }
      );
    }

    // 2. Already verified check
    if (profile.email_verified) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: "Your email is already verified! You are good to go.",
      });
    }

    // 3. Verify token exists
    if (!profile.verification_token) {
      return NextResponse.json(
        { success: false, error: "No pending verification code found. Please request a new code." },
        { status: 400 }
      );
    }

    // 4. Check token expiration
    if (profile.verification_token_expires) {
      const expiresAt = new Date(profile.verification_token_expires).getTime();
      if (Date.now() > expiresAt) {
        return NextResponse.json(
          { success: false, error: "Verification code has expired. Please request a fresh code." },
          { status: 400 }
        );
      }
    }

    // 5. Compare code
    if (profile.verification_token.trim() !== cleanCode) {
      return NextResponse.json(
        { success: false, error: "Incorrect verification code. Please check and try again." },
        { status: 400 }
      );
    }

    // 6. Update profile: mark verified
    const { error: updateErr } = await supabase
      .from("profiles")
      .update({
        email_verified: true,
        verified: true,
        verification_token: null,
        verification_token_expires: null,
      })
      .eq("id", profile.id);

    if (updateErr) {
      console.error("Profile update error during verification:", updateErr);
      return NextResponse.json(
        { success: false, error: "Failed to update profile verification status." },
        { status: 500 }
      );
    }

    // 7. Log notification for CEO audit feed
    try {
      await supabase.from("contact_inquiries").insert([
        {
          name: profile.full_name || profile.username || "Registered User",
          email: profile.email || cleanEmail,
          subject: "COMPANY_JOB_EMAIL_SENT",
          message: `User verified email successfully: ${profile.email || cleanEmail} (${profile.username || "user"})`,
          is_read: false,
        },
      ]);
    } catch (e) {
      // non-blocking
    }

    return NextResponse.json({
      success: true,
      message: "Email verified successfully! Your Verified Badge (+5% profile score) has been activated.",
      verified: true,
    });
  } catch (err: any) {
    console.error("Verification API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "An unexpected error occurred during verification." },
      { status: 500 }
    );
  }
}
