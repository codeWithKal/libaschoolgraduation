import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "public", "data", "teachers.json");

export async function GET() {
  try {
    const data = await readFile(DATA_FILE, "utf-8");
    const teachers = JSON.parse(data);
    return NextResponse.json(teachers);
  } catch (error) {
    console.error("Error reading teachers:", error);
    return NextResponse.json(
      { message: "Failed to fetch teachers" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { teachers } = body;

    if (!Array.isArray(teachers)) {
      return NextResponse.json(
        { message: "Invalid data format. Expected an array of teachers." },
        { status: 400 },
      );
    }

    await writeFile(DATA_FILE, JSON.stringify(teachers, null, 2), "utf-8");

    return NextResponse.json({
      message: "Teachers updated successfully",
      count: teachers.length,
    });
  } catch (error) {
    console.error("Error updating teachers:", error);
    return NextResponse.json(
      { message: "Failed to update teachers" },
      { status: 500 },
    );
  }
}
