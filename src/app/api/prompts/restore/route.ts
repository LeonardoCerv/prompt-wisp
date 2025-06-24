import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/utils/supabase/server";
import Prompt from "@/lib/models/prompt";

// Restore a soft-deleted prompt
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { promptId } = await req.json();

    if (!promptId) {
      return NextResponse.json({ error: "Prompt ID is required" }, { status: 400 });
    }

    // Verify user owns the prompt and it's deleted
    const { data: existingPrompt, error: findError } = await supabase
      .from('prompts')
      .select('id, user_id, deleted')
      .eq('id', promptId)
      .single();

    if (findError || !existingPrompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    if (existingPrompt.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!existingPrompt.deleted) {
      return NextResponse.json({ error: "Prompt is not deleted" }, { status: 400 });
    }

    // Restore the prompt
    const restoredPrompt = await Prompt.restore(promptId);

    return NextResponse.json(restoredPrompt);
  } catch (error) {
    console.error("Error restoring prompt:", error);
    return NextResponse.json(
      { error: "Error restoring prompt" },
      { status: 500 }
    );
  }
}
