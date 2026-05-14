import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "public", "data", "students.json");

function readStudents() {
  const data = fs.readFileSync(filePath, "utf8");
  return JSON.parse(data);
}

function writeStudents(data: any) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

//
// GET
//
export async function GET() {
  try {
    const students = readStudents();
    return NextResponse.json(students);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to load students" },
      { status: 500 },
    );
  }
}

//
// POST
//
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const students = readStudents();

    const newStudent = {
      id: Date.now().toString(),
      ...body,
      messages: [],
    };

    students.push(newStudent);

    writeStudents(students);

    return NextResponse.json(newStudent);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 },
    );
  }
}

//
// PUT (EDIT)
//
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const students = readStudents();

    const updatedStudents = students.map((student: any) =>
      student.id === body.id
        ? {
            ...student,
            ...body,
          }
        : student,
    );

    writeStudents(updatedStudents);

    return NextResponse.json({
      success: true,
      data: updatedStudents,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 },
    );
  }
}

//
// DELETE
//
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing student id" },
        { status: 400 },
      );
    }

    const students = readStudents();

    const filteredStudents = students.filter(
      (student: any) => String(student.id) !== String(id),
    );

    writeStudents(filteredStudents);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE ERROR:", error);

    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 },
    );
  }
}
