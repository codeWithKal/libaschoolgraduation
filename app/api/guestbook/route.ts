// app/api/guestbook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const approvedParam = searchParams.get("approved");

  // Handle "all" case
  const approved =
    approvedParam === "all" ? undefined : approvedParam !== "false";

  const offset = (page - 1) * limit;

  // Validate pagination params
  if (page < 1 || limit < 1 || limit > 100) {
    return NextResponse.json(
      { error: "Invalid pagination parameters" },
      { status: 400 },
    );
  }

  try {
    // Build the query for count and data
    let query = supabase.from("guestbook").select("*", { count: "exact" });

    // Apply filter if not "all"
    if (approved !== undefined) {
      query = query.eq("approved", approved);
    }

    // Get total count and data in one query when possible
    const {
      data: allData,
      count,
      error: queryError,
    } = await query.order("created_at", { ascending: false });

    if (queryError) {
      console.error("Supabase query error:", queryError);
      return NextResponse.json({ error: queryError.message }, { status: 500 });
    }

    const totalCount = count || 0;
    const data = allData || [];

    // Paginate the results manually
    const paginatedData = data.slice(offset, offset + limit);
    const hasMore = offset + limit < totalCount;

    // Format the response
    const formattedData = paginatedData.map((item) => ({
      id: item.id,
      author_name: item.author_name,
      message: item.message,
      emoji_reaction: item.emoji_reaction,
      created_at: item.created_at,
      approved: item.approved,
    }));

    // Cache headers for better performance
    const headers = new Headers();
    headers.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=120",
    );

    return NextResponse.json(
      {
        data: formattedData,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasMore,
        },
      },
      { headers },
    );
  } catch (err) {
    console.error("GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.author_name?.trim() || !body.message?.trim()) {
      return NextResponse.json(
        { error: "Name and message are required" },
        { status: 400 },
      );
    }

    const authorName = body.author_name.trim().slice(0, 100);
    const message = body.message.trim().slice(0, 1000);
    const emojiReaction = body.emoji_reaction?.slice(0, 10) || null;

    const { data, error } = await supabase
      .from("guestbook")
      .insert({
        author_name: authorName,
        message: message,
        emoji_reaction: emojiReaction,
        approved: false,
      })
      .select("id, author_name, message, emoji_reaction, created_at")
      .single();

    if (error) {
      console.error("Supabase POST error:", error);
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("POST error:", err);
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const updateData: any = {};
    if (body.approved !== undefined) updateData.approved = body.approved;
    if (body.author_name)
      updateData.author_name = body.author_name.trim().slice(0, 100);
    if (body.message) updateData.message = body.message.trim().slice(0, 1000);
    if (body.emoji_reaction !== undefined) {
      updateData.emoji_reaction = body.emoji_reaction.slice(0, 10);
    }
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("guestbook")
      .update(updateData)
      .eq("id", body.id)
      .select("id, author_name, message, emoji_reaction, created_at, approved")
      .single();

    if (error) {
      console.error("Supabase PUT error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("PUT error:", err);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const { error } = await supabase.from("guestbook").delete().eq("id", id);

    if (error) {
      console.error("Supabase DELETE error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("DELETE error:", err);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 },
    );
  }
}
