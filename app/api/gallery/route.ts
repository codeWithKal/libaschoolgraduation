import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const galleryFilePath = path.join(process.cwd(), "data", "gallery.json");

const uploadDir = path.join(process.cwd(), "public", "images", "gallery");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

//
// GET
//
export async function GET() {
  try {
    const fileContents = fs.readFileSync(galleryFilePath, "utf8");
    const gallery = JSON.parse(fileContents);
    return NextResponse.json(gallery);
  } catch {
    return NextResponse.json(
      { error: "Failed to read gallery" },
      { status: 500 },
    );
  }
}

//
// Helper: Compress Image (Maximum)
//
// Helper: Ensure a safe filename and write the uploaded file directly
function getSafeFileName(filename: string) {
  return filename.replace(/\s/g, "_").replace(/[^\w\-\.]/g, "");
}
//
// POST (UPLOAD + COMPRESSION)
//
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get("file") as File;
    const caption = formData.get("caption") as string;
    const studentId = Number(formData.get("studentId"));

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file size (max 200MB for videos)
    const maxSize = 200 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `File too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum size is 200MB.`,
        },
        { status: 400 },
      );
    }

    const safeFileName = getSafeFileName(file.name);
    const finalFileName = `${Date.now()}-${safeFileName}`;
    const finalFilePath = path.join(uploadDir, finalFileName);

    const bytes = await file.arrayBuffer();
    fs.writeFileSync(finalFilePath, Buffer.from(bytes));

    let fileType: string;
    let compressionInfo: any = null;

    if (file.type.startsWith("image/")) {
      fileType = "image";
    } else if (file.type.startsWith("video/")) {
      fileType = "video";
    } else {
      fs.unlinkSync(finalFilePath);
      return NextResponse.json(
        { error: "Unsupported file type. Please upload image or video." },
        { status: 400 },
      );
    }

    const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    compressionInfo = {
      originalSize: `${originalSizeMB}MB`,
      compressedSize: `${originalSizeMB}MB`,
      savings: "0%",
      method: "none",
    };

    // Create gallery item
    const newItem = {
      id: Date.now(),
      type: fileType,
      url: `/images/gallery/${finalFileName}`,
      caption,
      studentId,
      approved: false,
      compressionInfo,
    };

    // Update gallery.json
    let gallery = [];
    if (fs.existsSync(galleryFilePath)) {
      const fileContents = fs.readFileSync(galleryFilePath, "utf8");
      gallery = JSON.parse(fileContents);
    }

    gallery.push(newItem);
    fs.writeFileSync(galleryFilePath, JSON.stringify(gallery, null, 2));

    return NextResponse.json(
      {
        ...newItem,
        message:
          "Upload successful! Your file was saved and is pending approval.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload gallery item" },
      { status: 500 },
    );
  }
}

//
// PUT (approve / update system ready)
//
export async function PUT(request: NextRequest) {
  try {
    const updatedItem = await request.json();

    const fileContents = fs.readFileSync(galleryFilePath, "utf8");
    let gallery = JSON.parse(fileContents);

    gallery = gallery.map((item: any) =>
      item.id === updatedItem.id ? updatedItem : item,
    );

    fs.writeFileSync(galleryFilePath, JSON.stringify(gallery, null, 2));

    return NextResponse.json(updatedItem);
  } catch {
    return NextResponse.json(
      { error: "Failed to update gallery item" },
      { status: 500 },
    );
  }
}

//
// DELETE (with file deletion)
//
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const fileContents = fs.readFileSync(galleryFilePath, "utf8");
    let gallery = JSON.parse(fileContents);

    const itemToDelete = gallery.find((item: any) => item.id == id);

    if (!itemToDelete) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Delete the actual file
    let fileDeleted = false;
    if (itemToDelete.url) {
      try {
        const fileName = path.basename(itemToDelete.url);
        const filePath = path.join(uploadDir, fileName);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          fileDeleted = true;
          console.log(`✅ Deleted file: ${filePath}`);
        }
      } catch (fileError) {
        console.error(`❌ Failed to delete file: ${fileError}`);
      }
    }

    gallery = gallery.filter((item: any) => item.id != id);
    fs.writeFileSync(galleryFilePath, JSON.stringify(gallery, null, 2));

    return NextResponse.json({
      success: true,
      message: "Deleted successfully",
      fileDeleted: fileDeleted,
    });
  } catch (error) {
    console.error("Error deleting gallery item:", error);
    return NextResponse.json(
      { error: "Failed to delete gallery item" },
      { status: 500 },
    );
  }
}
