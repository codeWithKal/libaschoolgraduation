import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "public", "data");
const dayFiles = ["gabi_day.json", "crazy_day.json", "trip_day.json"];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const day = searchParams.get("day");
    if (day && dayFiles.includes(`${day}.json`)) {
      const filePath = path.join(dataDir, `${day}.json`);
      const fileContents = fs.readFileSync(filePath, "utf8");
      const memories = JSON.parse(fileContents);
      return NextResponse.json(memories);
    } else {
      // Return all memories
      const allMemories: any[] = [];
      for (const file of dayFiles) {
        const filePath = path.join(dataDir, file);
        if (fs.existsSync(filePath)) {
          const fileContents = fs.readFileSync(filePath, "utf8");
          const memories = JSON.parse(fileContents);
          allMemories.push(...memories);
        }
      }
      return NextResponse.json(allMemories);
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read memories" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const newItem = await request.json();
    const day = newItem.day?.toLowerCase().replace(" ", "_") + ".json";
    if (!dayFiles.includes(day)) {
      return NextResponse.json({ error: "Invalid day" }, { status: 400 });
    }
    const filePath = path.join(dataDir, day);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const memories = JSON.parse(fileContents);
    newItem.id = Date.now();
    memories.push(newItem);
    fs.writeFileSync(filePath, JSON.stringify(memories, null, 2));
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add memory" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updatedItem = await request.json();
    const day = updatedItem.day?.toLowerCase().replace(" ", "_") + ".json";
    if (!dayFiles.includes(day)) {
      return NextResponse.json({ error: "Invalid day" }, { status: 400 });
    }
    const filePath = path.join(dataDir, day);
    const fileContents = fs.readFileSync(filePath, "utf8");
    let memories = JSON.parse(fileContents);
    memories = memories.map((item: any) =>
      item.id === updatedItem.id ? updatedItem : item,
    );
    fs.writeFileSync(filePath, JSON.stringify(memories, null, 2));
    return NextResponse.json(updatedItem);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update memory" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const day = searchParams.get("day");
    if (!id || !day) {
      return NextResponse.json(
        { error: "ID and day required" },
        { status: 400 },
      );
    }
    const fileName = day.toLowerCase().replace(" ", "_") + ".json";
    if (!dayFiles.includes(fileName)) {
      return NextResponse.json({ error: "Invalid day" }, { status: 400 });
    }
    const filePath = path.join(dataDir, fileName);
    const fileContents = fs.readFileSync(filePath, "utf8");
    let memories = JSON.parse(fileContents);
    memories = memories.filter((item: any) => item.id != id);
    fs.writeFileSync(filePath, JSON.stringify(memories, null, 2));
    return NextResponse.json({ message: "Memory deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete memory" },
      { status: 500 },
    );
  }
}
