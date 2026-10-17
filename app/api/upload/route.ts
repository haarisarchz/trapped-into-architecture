import { NextRequest, NextResponse } from "next/server";
import { imagekit } from "@/lib/imagekit";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "/building-photos";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let cleanFileName = file.name || `photo-${Date.now()}.jpg`;
    // Clean any invalid characters
    cleanFileName = cleanFileName.replace(/[^a-zA-Z0-9._-]/g, "_");

    const result = await imagekit.upload({
      file: buffer,
      fileName: cleanFileName,
      folder: folder,
      useUniqueFileName: true,
    });

    return NextResponse.json({
      success: true,
      url: result.url,
      fileId: result.fileId,
      name: result.name,
      thumbnailUrl: result.thumbnailUrl,
    });
  } catch (error: any) {
    console.error("ImageKit upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload image to ImageKit" },
      { status: 500 }
    );
  }
}
