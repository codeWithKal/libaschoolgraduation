import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const galleryFilePath = path.join(process.cwd(), "data", "gallery.json");

const uploadDir = path.join(process.cwd(), "public", "images", "gallery");
const tempDir = path.join(process.cwd(), "temp");

// Ensure directories exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
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
async function compressImage(
  inputPath: string,
  outputPath: string,
): Promise<void> {
  try {
    const sharp = await import("sharp");
    await sharp
      .default(inputPath)
      .resize(1080, 1080, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 70, progressive: true })
      .toFile(outputPath);
  } catch (error) {
    console.error("Sharp compression failed, copying file:", error);
    fs.copyFileSync(inputPath, outputPath);
  }
}

//
// Helper: Compress Video with FFmpeg (Fixed for width/height issues)
//
async function compressVideo(
  inputPath: string,
  outputPath: string,
): Promise<void> {
  // Use a more robust FFmpeg command that handles odd dimensions
  const ffmpegCommand = `ffmpeg -i "${inputPath}" \
    -vf "scale='min(854,iw)':-2,format=yuv420p" \
    -c:v libx264 \
    -preset fast \
    -crf 28 \
    -maxrate 1M \
    -bufsize 2M \
    -c:a aac \
    -b:a 96k \
    -ac 2 \
    -movflags +faststart \
    "${outputPath}" 2>&1`;

  try {
    const { stderr } = await execAsync(ffmpegCommand);
    if (stderr.includes("Error")) {
      throw new Error(stderr);
    }
  } catch (error) {
    console.error("FFmpeg compression failed:", error);
    throw new Error("Video compression failed");
  }
}

//
// Helper: Get video info without compression (fallback)
//
async function getVideoInfo(
  inputPath: string,
): Promise<{ width: number; height: number; duration: number }> {
  const ffprobeCommand = `ffprobe -v quiet -print_format json -show_streams "${inputPath}"`;
  try {
    const { stdout } = await execAsync(ffprobeCommand);
    const data = JSON.parse(stdout);
    const videoStream = data.streams.find((s: any) => s.codec_type === "video");
    return {
      width: videoStream?.width || 0,
      height: videoStream?.height || 0,
      duration: parseFloat(videoStream?.duration || 0),
    };
  } catch (error) {
    console.error("Failed to get video info:", error);
    return { width: 0, height: 0, duration: 0 };
  }
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

    // Save uploaded file to temp directory
    const safeFileName = file.name
      .replace(/\s/g, "_")
      .replace(/[^\w\-\.]/g, "");
    const tempFileName = `${Date.now()}-${safeFileName}`;
    const tempFilePath = path.join(tempDir, tempFileName);

    const bytes = await file.arrayBuffer();
    fs.writeFileSync(tempFilePath, Buffer.from(bytes));

    let finalFileName: string;
    let finalFilePath: string;
    let fileType: string;
    let compressionMethod: string = "none";
    let compressionInfo: any = null;

    const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2);

    if (file.type.startsWith("image/")) {
      // Compress image
      finalFileName = `${Date.now()}-compressed.jpg`;
      finalFilePath = path.join(uploadDir, finalFileName);
      await compressImage(tempFilePath, finalFilePath);
      fileType = "image";
      compressionMethod = "image compression (Sharp)";

      const compressedStats = fs.statSync(finalFilePath);
      const compressedSizeMB = (compressedStats.size / (1024 * 1024)).toFixed(
        2,
      );
      const savings = ((1 - compressedStats.size / file.size) * 100).toFixed(1);

      compressionInfo = {
        originalSize: `${originalSizeMB}MB`,
        compressedSize: `${compressedSizeMB}MB`,
        savings: `${savings}%`,
        method: compressionMethod,
      };

      // Clean up temp file
      fs.unlinkSync(tempFilePath);
    } else if (file.type.startsWith("video/")) {
      // Try to compress video, fallback to original if fails
      const videoInfo = await getVideoInfo(tempFilePath);

      // If video is already small enough (< 10MB) or very short, don't compress
      if (file.size < 10 * 1024 * 1024 || videoInfo.duration < 5) {
        finalFileName = `${Date.now()}-original.mp4`;
        finalFilePath = path.join(uploadDir, finalFileName);
        fs.copyFileSync(tempFilePath, finalFilePath);
        fileType = "video";
        compressionMethod = "no compression (video already optimized)";

        compressionInfo = {
          originalSize: `${originalSizeMB}MB`,
          compressedSize: `${originalSizeMB}MB`,
          savings: "0%",
          method: compressionMethod,
        };
      } else {
        try {
          finalFileName = `${Date.now()}-compressed.mp4`;
          finalFilePath = path.join(uploadDir, finalFileName);
          await compressVideo(tempFilePath, finalFilePath);
          fileType = "video";
          compressionMethod = "video compression (FFmpeg)";

          const compressedStats = fs.statSync(finalFilePath);
          const compressedSizeMB = (
            compressedStats.size /
            (1024 * 1024)
          ).toFixed(2);
          const savings = (
            (1 - compressedStats.size / file.size) *
            100
          ).toFixed(1);

          compressionInfo = {
            originalSize: `${originalSizeMB}MB`,
            compressedSize: `${compressedSizeMB}MB`,
            savings: `${savings}%`,
            method: compressionMethod,
          };
        } catch (compressionError) {
          console.error(
            "Video compression failed, using original:",
            compressionError,
          );
          // Fallback to original video
          finalFileName = `${Date.now()}-original.mp4`;
          finalFilePath = path.join(uploadDir, finalFileName);
          fs.copyFileSync(tempFilePath, finalFilePath);
          fileType = "video";
          compressionMethod = "no compression (compression failed)";

          compressionInfo = {
            originalSize: `${originalSizeMB}MB`,
            compressedSize: `${originalSizeMB}MB`,
            savings: "0%",
            method: compressionMethod,
          };
        }
      }

      // Clean up temp file
      fs.unlinkSync(tempFilePath);
    } else {
      // Unsupported file type
      fs.unlinkSync(tempFilePath);
      return NextResponse.json(
        { error: "Unsupported file type. Please upload image or video." },
        { status: 400 },
      );
    }

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
          compressionInfo?.savings !== "0%"
            ? `Upload successful! ${compressionMethod} applied. Saved ${compressionInfo?.savings} space.`
            : `Upload successful! ${compressionMethod}.`,
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
