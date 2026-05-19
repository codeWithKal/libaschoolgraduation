import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const allowedFiles = new Set([
  "students.json",
  "teachers.json",
  "gabi_day.json",
  "crazy_day.json",
  "welcome_day.json",
  "gallery.json",
  "guestbook.json",
  "event.json",
]);

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug?: string[] }> },
) {
  const { slug = [] } = await context.params;
  if (slug.length === 0) {
    return NextResponse.json(
      { error: "Data file not specified" },
      { status: 400 },
    );
  }

  const fileName = slug.join("/");
  if (fileName.includes("..") || !allowedFiles.has(fileName)) {
    return NextResponse.json({ error: "Invalid data file" }, { status: 400 });
  }

  const filePath = path.join(dataDir, fileName);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read data file" },
      { status: 500 },
    );
  }
}
