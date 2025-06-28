import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/utils/supabase/server";

// Toggle save status for a prompt
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

    // Check if prompt exists and is accessible
    const { data: prompt, error: promptError } = await supabase
      .from('prompts')
      .select('id, user_id, is_public, is_deleted')
      .eq('id', promptId)
      .eq('is_deleted', false)
      .single();

    if (promptError || !prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    // Users can't save their own prompts
    if (prompt.user_id === user.id) {
      return NextResponse.json({ error: "Cannot save your own prompt" }, { status: 400 });
    }

    // Check if prompt is public
    if (!prompt.is_public) {
      return NextResponse.json({ error: "Cannot save private prompt" }, { status: 403 });
    }

    // Check if already saved
    const { data: existingSave, error: checkError } = await supabase
      .from('user_saved_prompts')
      .select('id')
      .eq('user_id', user.id)
      .eq('prompt_id', promptId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    let isSaved = false;

    if (existingSave) {
      // Remove from saved
      const { error: deleteError } = await supabase
        .from('user_saved_prompts')
        .delete()
        .eq('user_id', user.id)
        .eq('prompt_id', promptId);

      if (deleteError) {
        throw deleteError;
      }
      isSaved = false;
    } else {
      // Add to saved
      const { error: insertError } = await supabase
        .from('user_saved_prompts')
        .insert({
          user_id: user.id,
          prompt_id: promptId
        });

      if (insertError) {
        throw insertError;
      }
      isSaved = true;
    }

    return NextResponse.json({ isSaved });
  } catch (error) {
    console.error("Error toggling save:", error);
    return NextResponse.json(
      { error: "Error toggling save" },
      { status: 500 }
    );
  }
}
