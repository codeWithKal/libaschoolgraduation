import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "public", "data", "guestbook.json");

// 🔹 Ensure file exists
function ensureFile() {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, "[]", "utf-8");
  }
}

// 🔹 GET all messages
export async function GET() {
  try {
    ensureFile();

    const fileData = fs.readFileSync(filePath, "utf-8");
    const messages = JSON.parse(fileData || "[]");

    return NextResponse.json(messages);
  } catch (err) {
    console.error("GET error:", err);
    return NextResponse.json([]);
  }
}

// 🔹 POST new message
export async function POST(req: NextRequest) {
  try {
    ensureFile();

    const body = await req.json();

    const fileData = fs.readFileSync(filePath, "utf-8");
    const messages = JSON.parse(fileData || "[]");

    const newMessage = {
      id: Date.now().toString(),
      author_name: body.author_name,
      message: body.message,
      emoji_reaction: body.emoji_reaction,
      approved: false, // Add approval field
      created_at: new Date().toISOString(),
    };

    const updated = [newMessage, ...messages];

    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf-8");

    return NextResponse.json(newMessage);
  } catch (err) {
    console.error("POST error:", err);

    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 },
    );
  }
}

// 🔹 PUT update message (for approval)
export async function PUT(req: NextRequest) {
  try {
    ensureFile();

    const body = await req.json();

    const fileData = fs.readFileSync(filePath, "utf-8");
    let messages = JSON.parse(fileData || "[]");

    messages = messages.map((msg: any) =>
      msg.id === body.id ? { ...msg, ...body } : msg,
    );

    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2), "utf-8");

    return NextResponse.json({ message: "Updated" });
  } catch (err) {
    console.error("PUT error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// 🔹 DELETE message
export async function DELETE(req: NextRequest) {
  try {
    ensureFile();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const fileData = fs.readFileSync(filePath, "utf-8");
    let messages = JSON.parse(fileData || "[]");

    messages = messages.filter((msg: any) => msg.id !== id);

    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2), "utf-8");

    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    console.error("DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
