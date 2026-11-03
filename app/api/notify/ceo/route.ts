import { NextResponse } from "next/server";
import { notifyCeo, CeoNotificationType } from "@/lib/notifyCeo";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const type = body.type as CeoNotificationType;
    const data = body.data || {};

    if (!type) {
      return NextResponse.json({ error: "Notification type is required." }, { status: 400 });
    }

    const result = await notifyCeo({ type, data });
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("API /api/notify/ceo error:", err);
    return NextResponse.json({ error: err.message || "Failed to dispatch CEO notification" }, { status: 500 });
  }
}
