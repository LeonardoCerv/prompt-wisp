import { NextResponse } from "next/server";
import Prompt from "@/lib/models/prompt";
import { createClient } from "@/lib/utils/supabase/server";

// Get all unique tags from public prompts
export async function GET() {
  try {

    const supabase = await createClient();
        
    // Get authenticated user
    const { data:{ user}, error: authError } = await supabase.auth.getUser();
        
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const tags = await Prompt.getAllTags(user.id);

    return NextResponse.json(tags);
  } catch (error) {
    console.error("Error getting tags:", error);
    return NextResponse.json(
      { error: "Error getting tags" },
      { status: 500 }
    );
  }
}
