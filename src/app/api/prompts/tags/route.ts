import { NextResponse } from "next/server";
import Prompt from "@/lib/models/prompt";

// Get all unique tags from public prompts
export async function GET() {
  try {
    const tags = await Prompt.getAllTags();
    return NextResponse.json(tags);
  } catch (error) {
    console.error("Error getting tags:", error);
    return NextResponse.json(
      { error: "Error getting tags" },
      { status: 500 }
    );
  }
}
