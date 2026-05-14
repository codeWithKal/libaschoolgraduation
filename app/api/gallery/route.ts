import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const galleryFilePath = path.join(
  process.cwd(),
  "public",
  "data",
  "gallery.json",
);

const uploadDir = path.join(process.cwd(), "public", "images", "gallery");

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
// POST (UPLOAD + AUTO APPROVED: FALSE)
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

    // ensure folder exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, buffer);

    const fileType = file.type.startsWith("video") ? "video" : "image";

    const newItem = {
      id: Date.now(),
      type: fileType,
      url: `/images/gallery/${fileName}`,
      caption,
      studentId,
      approved: false, // ✅ IMPORTANT: default pending approval
    };

    const fileContents = fs.readFileSync(galleryFilePath, "utf8");
    const gallery = JSON.parse(fileContents);

    gallery.push(newItem);

    fs.writeFileSync(galleryFilePath, JSON.stringify(gallery, null, 2));

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
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
// DELETE
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

    gallery = gallery.filter((item: any) => item.id != id);

    fs.writeFileSync(galleryFilePath, JSON.stringify(gallery, null, 2));

    return NextResponse.json({ message: "Deleted successfully" });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete gallery item" },
      { status: 500 },
    );
  }
}
