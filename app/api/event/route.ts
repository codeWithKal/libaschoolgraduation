import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const eventFilePath = path.join(process.cwd(), "public", "data", "event.json");

export async function GET() {
  try {
    const fileContents = fs.readFileSync(eventFilePath, "utf8");
    const event = JSON.parse(fileContents);
    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read event" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updatedEvent = await request.json();
    fs.writeFileSync(eventFilePath, JSON.stringify(updatedEvent, null, 2));
    return NextResponse.json(updatedEvent);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 },
    );
  }
}
