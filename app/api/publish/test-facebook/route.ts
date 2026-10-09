import { NextResponse } from "next/server";

export async function GET() {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_ACCESS_TOKEN;
  
  if (!pageId || !token) {
    return NextResponse.json({ success: false, error: "Missing Environment Variables in Vercel" }, { status: 400 });
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v19.0/${pageId}?fields=name,id&access_token=${token}`);
    const data = await response.json();
    
    if (data.error) {
       return NextResponse.json({ success: false, error: data.error.message });
    }
    
    return NextResponse.json({ success: true, name: data.name, id: data.id });
  } catch(err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
