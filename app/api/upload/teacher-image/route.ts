import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "images", "teachers");

async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureUploadDir();

    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json(
        { message: "No image file provided" },
        { status: 400 },
      );
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(imageFile.type)) {
      return NextResponse.json(
        { message: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 },
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (imageFile.size > maxSize) {
      return NextResponse.json(
        { message: "File size too large. Maximum size is 5MB." },
        { status: 400 },
      );
    }

    const filename = imageFile.name || `teacher-${Date.now()}.jpg`;
    const sanitizedFilename = path
      .basename(filename)
      .replace(/[^a-zA-Z0-9._-]/g, "-");
    const filePath = path.join(UPLOAD_DIR, sanitizedFilename);

    // If file exists, replace it
    if (existsSync(filePath)) {
      await unlink(filePath);
    }

    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    const imagePath = `images/teachers/${sanitizedFilename}`;

    return NextResponse.json({
      message: "Image uploaded successfully",
      imagePath: imagePath,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { message: "Failed to upload image" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { imagePath } = body;

    if (!imagePath) {
      return NextResponse.json(
        { message: "No image path provided" },
        { status: 400 },
      );
    }

    const cleanPath = imagePath.replace(/^\//, "");
    const filename = path.basename(cleanPath);
    const filePath = path.join(UPLOAD_DIR, filename);

    if (existsSync(filePath)) {
      await unlink(filePath);
      return NextResponse.json({ message: "Image deleted successfully" });
    } else {
      return NextResponse.json({
        message: "Image not found, nothing to delete",
      });
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { message: "Failed to delete image" },
      { status: 500 },
    );
  }
}
