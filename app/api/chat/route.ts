import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// GET: Fetch message history for a specific session ID (or all sessions for admin)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    const isAdminView = searchParams.get("admin") === "true";

    // 1. Try querying dedicated chat_messages table
    try {
      if (isAdminView) {
        // Return all chat messages grouped / ordered for admin inbox
        const { data, error } = await supabase
          .from("chat_messages")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200);

        if (!error && data) {
          return NextResponse.json({ messages: data });
        }
      } else if (sessionId) {
        const { data, error } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("session_id", sessionId)
          .order("created_at", { ascending: true });

        if (!error && data) {
          return NextResponse.json({ messages: data });
        }
      }
    } catch (e) {
      // Table might not exist yet; fall through to contact_inquiries fallback
    }

    // 2. Fallback to contact_inquiries if chat_messages table not yet created
    if (isAdminView) {
      const { data } = await supabase
        .from("contact_inquiries")
        .select("*")
        .ilike("subject", "%[Direct Chat]%")
        .order("created_at", { ascending: false })
        .limit(200);

      const converted = (data || []).map((inq: any) => {
        const sessionMatch = inq.subject.match(/\[Direct Chat\]\s*([^\s]+)/);
        const sessId = sessionMatch ? sessionMatch[1] : `legacy-${inq.id}`;
        return {
          id: inq.id,
          session_id: sessId,
          sender: "visitor",
          message: inq.message,
          sender_name: inq.name !== "Anonymous Visitor" ? inq.name : null,
          sender_contact: inq.phone || (inq.email !== "chat@trappedintoarchitecture.com" ? inq.email : null),
          created_at: inq.created_at
        };
      });

      return NextResponse.json({ messages: converted });
    }

    if (sessionId) {
      const { data } = await supabase
        .from("contact_inquiries")
        .select("*")
        .eq("subject", `[Direct Chat] ${sessionId}`)
        .order("created_at", { ascending: true });

      const converted = (data || []).map((inq: any) => ({
        id: inq.id,
        session_id: sessionId,
        sender: "visitor",
        message: inq.message,
        sender_name: inq.name !== "Anonymous Visitor" ? inq.name : null,
        sender_contact: inq.phone || (inq.email !== "chat@trappedintoarchitecture.com" ? inq.email : null),
        created_at: inq.created_at
      }));

      return NextResponse.json({ messages: converted });
    }

    return NextResponse.json({ messages: [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load chat" }, { status: 500 });
  }
}

// POST: Send a new message (Visitor or Admin)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      sessionId, 
      message, 
      sender = "visitor", 
      senderName = null, 
      senderContact = null 
    } = body;

    if (!sessionId || !message || !message.trim()) {
      return NextResponse.json({ error: "Session ID and message are required." }, { status: 400 });
    }

    const trimmedMsg = message.trim();
    const forwarded = req.headers.get("x-forwarded-for");
    const clientIp = forwarded ? forwarded.split(",")[0].trim() : (req.headers.get("x-real-ip") || "Unknown IP");

    let savedRecord = null;

    // 1. Try insert into chat_messages
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .insert([{
          session_id: sessionId,
          sender: sender === "admin" ? "admin" : "visitor",
          message: trimmedMsg,
          sender_name: senderName ? senderName.trim() : null,
          sender_contact: senderContact ? senderContact.trim() : null,
          client_ip: clientIp,
          is_read: sender === "admin"
        }])
        .select()
        .single();

      if (!error && data) {
        savedRecord = data;
      }
    } catch (e) {
      // Fallback
    }

    // 2. Fallback insert to contact_inquiries if chat_messages is unavailable
    if (!savedRecord) {
      try {
        const { data } = await supabase
          .from("contact_inquiries")
          .insert([{
            name: senderName ? senderName.trim() : "Anonymous Visitor",
            email: senderContact && senderContact.includes("@") ? senderContact.trim() : "chat@trappedintoarchitecture.com",
            phone: senderContact && !senderContact.includes("@") ? senderContact.trim() : null,
            subject: `[Direct Chat] ${sessionId}`,
            message: trimmedMsg,
            is_read: false
          }])
          .select()
          .single();

        savedRecord = {
          id: data?.id || `fallback-${Date.now()}`,
          session_id: sessionId,
          sender: "visitor",
          message: trimmedMsg,
          sender_name: senderName,
          sender_contact: senderContact,
          created_at: new Date().toISOString()
        };
      } catch (err) {
        console.warn("Fallback chat insert error:", err);
      }
    }

    // 3. Optional: Notify Admin via Resend if visitor message
    if (sender === "visitor" && resend) {
      try {
        const recipientEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "admin.ti2a@gmail.com";
        const fromEmail = process.env.RESEND_FROM_EMAIL || "Trapped Into Architecture <notifications@trappedintoarchitecture.com>";
        
        await resend.emails.send({
          from: fromEmail,
          to: recipientEmail,
          subject: `💬 [Ti2A Live Chat] New message from ${senderName || "Visitor"}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background: #ffffff;">
              <span style="background: #2563eb; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase;">Live Chat Message</span>
              <h2 style="color: #111827; margin: 12px 0 6px 0; font-size: 18px;">New Visitor Message on Ti2A</h2>
              <div style="background-color: #f9fafb; padding: 12px 16px; border-radius: 12px; margin: 14px 0; font-size: 13px; color: #374151;">
                <p style="margin: 4px 0;"><strong>Sender:</strong> ${senderName || "Anonymous Visitor"}</p>
                <p style="margin: 4px 0;"><strong>Contact:</strong> ${senderContact || "Not yet provided"}</p>
                <p style="margin: 4px 0;"><strong>IP:</strong> ${clientIp}</p>
                <p style="margin: 4px 0;"><strong>Session:</strong> ${sessionId}</p>
              </div>
              <div style="background: #f3f4f6; padding: 14px 16px; border-radius: 12px; font-size: 14px; line-height: 1.5; color: #111827;">
                ${trimmedMsg}
              </div>
              <div style="margin-top: 18px; text-align: center;">
                <a href="https://trappedintoarchitecture.com/admin/contact" style="display: inline-block; background: #000; color: #fff; text-decoration: none; font-size: 12px; font-weight: bold; padding: 10px 18px; rounded: 10px; border-radius: 8px;">
                  Open Admin Chat Inbox →
                </a>
              </div>
            </div>
          `
        }).catch(() => {});
      } catch (e) {}
    }

    return NextResponse.json({ success: true, message: savedRecord });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to send message" }, { status: 500 });
  }
}

// PATCH: Update visitor name / contact info across their session
export async function PATCH(req: Request) {
  try {
    const { sessionId, senderName, senderContact } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    const updates: any = {};
    if (senderName && senderName.trim()) updates.sender_name = senderName.trim();
    if (senderContact && senderContact.trim()) updates.sender_contact = senderContact.trim();

    if (Object.keys(updates).length > 0) {
      try {
        await supabase
          .from("chat_messages")
          .update(updates)
          .eq("session_id", sessionId);
      } catch (e) {}

      // Also update in contact_inquiries if any exists
      try {
        const inqUpdates: any = {};
        if (updates.sender_name) inqUpdates.name = updates.sender_name;
        if (updates.sender_contact) {
          if (updates.sender_contact.includes("@")) inqUpdates.email = updates.sender_contact;
          else inqUpdates.phone = updates.sender_contact;
        }
        await supabase
          .from("contact_inquiries")
          .update(inqUpdates)
          .eq("subject", `[Direct Chat] ${sessionId}`);
      } catch (e) {}
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update contact" }, { status: 500 });
  }
}
