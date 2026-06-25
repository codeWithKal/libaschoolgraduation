// app/api/gallery/route.ts
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import path from "path";

// Helper to compress images
async function compressImage(
  buffer: Buffer,
  filename: string,
): Promise<{ buffer: Buffer; ext: string; mime: string }> {
  const ext = path.extname(filename).toLowerCase();

  // For images, compress using sharp
  if ([".jpg", ".jpeg", ".png", ".webp", ".heic"].includes(ext)) {
    try {
      const compressed = await sharp(buffer)
        .resize(1920, 1080, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 80, progressive: true })
        .toBuffer();

      return {
        buffer: compressed,
        ext: ".jpg",
        mime: "image/jpeg",
      };
    } catch (error) {
      console.error("Compression failed, using original:", error);
      return { buffer, ext, mime: getMimeType(ext) };
    }
  }

  return { buffer, ext, mime: getMimeType(ext) };
}

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
  try {
    // No authentication required for uploads
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

    // Compress if image
    const isVideo = file.type.startsWith("video/");
    let finalBuffer = buffer;
    let finalExt = path.extname(file.name);
    let finalMime = file.type;

    if (!isVideo) {
      const result = await compressImage(buffer, file.name);
      finalBuffer = result.buffer;
      finalExt = result.ext;
      finalMime = result.mime;
    }

    // Generate unique filename
    const uniqueId = uuidv4();
    const fileName = `${uniqueId}${finalExt}`;
    const filePath = `gallery/${fileName}`;

    // Upload to Supabase Storage (your existing 'gallery' bucket)
    const { error: uploadError } = await supabase.storage
      .from("gallery")
      .upload(filePath, finalBuffer, {
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
        approved: false, // Requires admin approval
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database insert error:", dbError);
      // Try to delete the uploaded file if DB insert fails
      await supabase.storage.from("gallery").remove([filePath]);
      return NextResponse.json(
        { error: "Failed to save to database" },
        { status: 500 },
      );
    }

    const compressionInfo = {
      originalSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      compressedSize: isVideo
        ? "N/A"
        : `${(finalBuffer.length / (1024 * 1024)).toFixed(2)} MB`,
      savings: isVideo
        ? "N/A"
        : `${((1 - finalBuffer.length / file.size) * 100).toFixed(1)}%`,
      method: isVideo ? "No compression" : "Sharp JPEG 80%",
    };

    return NextResponse.json({
      success: true,
      message: "Memory uploaded successfully! Waiting for admin approval.",
      item: galleryItem,
      compressionInfo,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 },
    );
  }
}

// GET, PATCH, DELETE remain the same...
export async function GET(request: Request) {
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

// PATCH and DELETE still require authentication for admin functions
export async function PATCH(request: Request) {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, approved, caption, day } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (approved !== undefined) updateData.approved = approved;
    if (caption) updateData.caption = caption.trim();
    if (day) updateData.day = day;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("gallery")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Update error:", error);
      return NextResponse.json(
        { error: "Failed to update gallery item" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, item: data });
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Update failed" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const { data: item, error: fetchError } = await supabase
      .from("gallery")
      .select("url")
      .eq("id", parseInt(id))
      .single();

    if (fetchError) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const urlParts = item.url.split("/");
    const filePath = urlParts.slice(urlParts.indexOf("gallery") + 1).join("/");

    if (filePath) {
      const { error: storageError } = await supabase.storage
        .from("gallery")
        .remove([filePath]);

      if (storageError) {
        console.error("Storage delete error:", storageError);
      }
    }

    const { error: deleteError } = await supabase
      .from("gallery")
      .delete()
      .eq("id", parseInt(id));

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete gallery item" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Delete failed" },
      { status: 500 },
    );
  }
}
