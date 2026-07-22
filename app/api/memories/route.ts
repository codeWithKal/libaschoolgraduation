import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const dayFiles = [
  "gabi_day.json",
  "photoshot_day.json",
  "welcome_day.json",
  "entrance_vibe_day.json",
  "jersey_day.json",
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const day = searchParams.get("day");

    // Get the filename from the URL path (e.g., "entrance_vibe_day.json")
    const pathname = request.nextUrl.pathname;
    const lastSegment = pathname.split("/").pop() || "";

    // Case 1: day query param is provided and valid
    if (day) {
      if (dayFiles.includes(`${day}.json`)) {
        const filePath = path.join(dataDir, `${day}.json`);
        if (!fs.existsSync(filePath)) {
          return NextResponse.json({ error: "Day not found" }, { status: 404 });
        }
        const fileContents = fs.readFileSync(filePath, "utf8");
        const memories = JSON.parse(fileContents);
        return NextResponse.json(memories);
      } else {
        return NextResponse.json(
          { error: "Invalid day specified" },
          { status: 400 },
        );
      }
    }

    // Case 2: No query param, try to infer from the path
    if (lastSegment.endsWith(".json") && dayFiles.includes(lastSegment)) {
      const filePath = path.join(dataDir, lastSegment);
      if (fs.existsSync(filePath)) {
        const fileContents = fs.readFileSync(filePath, "utf8");
        const memories = JSON.parse(fileContents);
        return NextResponse.json(memories);
      } else {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }
    }

    // Case 3: Return all memories from all files
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
  } catch (error) {
    console.error("Error reading memories:", error);
    return NextResponse.json(
      { error: "Failed to read memories" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const newItem = await request.json();

    // Validate that day is provided
    if (!newItem.day) {
      return NextResponse.json({ error: "Day is required" }, { status: 400 });
    }

    // Convert day to filename format
    const dayFileName =
      newItem.day.toLowerCase().replace(/\s+/g, "_") + ".json";

    if (!dayFiles.includes(dayFileName)) {
      return NextResponse.json(
        {
          error:
            "Invalid day. Valid days: Gabi Day, Photoshoot Day, Welcome Day, Entrance Vibe Day, Jersey Day",
        },
        { status: 400 },
      );
    }

    const filePath = path.join(dataDir, dayFileName);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Day file not found" },
        { status: 404 },
      );
    }

    const fileContents = fs.readFileSync(filePath, "utf8");
    const memories = JSON.parse(fileContents);

    // Generate unique ID
    newItem.id = Date.now();
    memories.push(newItem);

    fs.writeFileSync(filePath, JSON.stringify(memories, null, 2));

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Error adding memory:", error);
    return NextResponse.json(
      { error: "Failed to add memory" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updatedItem = await request.json();

    // Validate that day is provided
    if (!updatedItem.day) {
      return NextResponse.json({ error: "Day is required" }, { status: 400 });
    }

    // Convert day to filename format
    const dayFileName =
      updatedItem.day.toLowerCase().replace(/\s+/g, "_") + ".json";

    if (!dayFiles.includes(dayFileName)) {
      return NextResponse.json({ error: "Invalid day" }, { status: 400 });
    }

    const filePath = path.join(dataDir, dayFileName);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Day file not found" },
        { status: 404 },
      );
    }

    const fileContents = fs.readFileSync(filePath, "utf8");
    let memories = JSON.parse(fileContents);

    // Find and update the item
    const itemIndex = memories.findIndex(
      (item: any) => item.id === updatedItem.id,
    );
    if (itemIndex === -1) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 });
    }

    memories[itemIndex] = updatedItem;
    fs.writeFileSync(filePath, JSON.stringify(memories, null, 2));

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating memory:", error);
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
        { error: "ID and day are required" },
        { status: 400 },
      );
    }

    // Convert day to filename format
    const fileName = day.toLowerCase().replace(/\s+/g, "_") + ".json";

    if (!dayFiles.includes(fileName)) {
      return NextResponse.json(
        {
          error:
            "Invalid day. Valid days: Gabi Day, Photoshoot Day, Welcome Day, Entrance Vibe Day, Jersey Day",
        },
        { status: 400 },
      );
    }

    const filePath = path.join(dataDir, fileName);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Day file not found" },
        { status: 404 },
      );
    }

    const fileContents = fs.readFileSync(filePath, "utf8");
    let memories = JSON.parse(fileContents);

    // Find and remove the item
    const initialLength = memories.length;
    memories = memories.filter((item: any) => item.id != id);

    if (memories.length === initialLength) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 });
    }

    fs.writeFileSync(filePath, JSON.stringify(memories, null, 2));

    return NextResponse.json({
      message: "Memory deleted successfully",
      id: id,
      day: day,
    });
  } catch (error) {
    console.error("Error deleting memory:", error);
    return NextResponse.json(
      { error: "Failed to delete memory" },
      { status: 500 },
    );
  }
}
