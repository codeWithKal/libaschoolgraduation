// app/api/gallery/route.ts
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import path from "path";

// Helper to get MIME type
function getMimeType(ext: string): string {
  const mimeTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
  };
  return mimeTypes[ext] || "application/octet-stream";
}

export async function POST(request: Request) {
  // Check if Supabase is configured
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      {
        error:
          "Supabase is not configured. Please check environment variables.",
      },
      { status: 500 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const caption = formData.get("caption") as string;
    const studentId = formData.get("studentId") as string;
    const day = (formData.get("day") as string) || "Welcome Day";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!caption) {
      return NextResponse.json(
        { error: "Caption is required" },
        { status: 400 },
      );
    }

    // Validate file size (100MB)
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 100MB)" },
        { status: 400 },
      );
    }

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const isVideo = file.type.startsWith("video/");
    const finalExt = path.extname(file.name);
    const finalMime = file.type;

    // Generate unique filename
    const uniqueId = uuidv4();
    const fileName = `${uniqueId}${finalExt}`;
    const filePath = `gallery/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("gallery")
      .upload(filePath, buffer, {
        contentType: finalMime,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file to storage" },
        { status: 500 },
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("gallery")
      .getPublicUrl(filePath);

    const publicUrl = urlData?.publicUrl;

    // Save to database
    const { data: galleryItem, error: dbError } = await supabase
      .from("gallery")
      .insert({
        type: isVideo ? "video" : "image",
        url: publicUrl,
        caption: caption.trim(),
        student_id: parseInt(studentId) || 1,
        day: day,
        approved: false,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database insert error:", dbError);
      await supabase.storage.from("gallery").remove([filePath]);
      return NextResponse.json(
        { error: "Failed to save to database" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Memory uploaded successfully! Waiting for admin approval.",
      item: galleryItem,
      compressionInfo: {
        originalSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        compressedSize: "No compression (client-side)",
        savings: "0%",
        method: "No server compression",
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  // Check if Supabase is configured
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { data: [], count: 0, hasMore: false },
      { status: 200 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const approved = searchParams.get("approved") === "true";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabase
      .from("gallery")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (studentId) {
      query = query.eq("student_id", parseInt(studentId));
    }

    if (approved) {
      query = query.eq("approved", true);
    }

    const { data, error, count } = await query.range(
      offset,
      offset + limit - 1,
    );

    if (error) {
      console.error("Database query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch gallery items" },
        { status: 500 },
      );
    }

    const items = data.map((item) => ({
      id: item.id,
      type: item.type,
      url: item.url,
      caption: item.caption,
      studentId: item.student_id,
      day: item.day || "Welcome Day",
      approved: item.approved,
      created_at: item.created_at,
    }));

    return NextResponse.json({
      data: items,
      count: count,
      hasMore: data.length === limit,
    });
  } catch (error) {
    console.error("GET gallery error:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery" },
      { status: 500 },
    );
  }
}
