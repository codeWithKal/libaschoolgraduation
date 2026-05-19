import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "students.json");

export async function GET() {
  try {
    const data = await readFile(DATA_FILE, "utf-8");
    const students = JSON.parse(data);
    return NextResponse.json(students);
  } catch (error) {
    console.error("Error reading students:", error);
    return NextResponse.json(
      { message: "Failed to fetch students" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { students } = body;

    if (!Array.isArray(students)) {
      return NextResponse.json(
        { message: "Invalid data format. Expected an array of students." },
        { status: 400 },
      );
    }

    await writeFile(DATA_FILE, JSON.stringify(students, null, 2), "utf-8");

    return NextResponse.json({
      message: "Students updated successfully",
      count: students.length,
    });
  } catch (error) {
    console.error("Error updating students:", error);
    return NextResponse.json(
      { message: "Failed to update students" },
      { status: 500 },
    );
  }
}
