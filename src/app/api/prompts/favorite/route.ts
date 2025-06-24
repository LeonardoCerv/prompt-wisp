import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/utils/supabase/server";

// Toggle favorite status for a prompt
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

    // Check if user has access to this prompt
    if (!prompt.is_public && prompt.user_id !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check if already favorited
    const { data: existingFavorite, error: checkError } = await supabase
      .from('user_favorite_prompts')
      .select('id')
      .eq('user_id', user.id)
      .eq('prompt_id', promptId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    let isFavorite = false;

    if (existingFavorite) {
      // Remove from favorites
      const { error: deleteError } = await supabase
        .from('user_favorite_prompts')
        .delete()
        .eq('user_id', user.id)
        .eq('prompt_id', promptId);

      if (deleteError) {
        throw deleteError;
      }
      isFavorite = false;
    } else {
      // Add to favorites
      const { error: insertError } = await supabase
        .from('user_favorite_prompts')
        .insert({
          user_id: user.id,
          prompt_id: promptId
        });

      if (insertError) {
        throw insertError;
      }
      isFavorite = true;
    }

    return NextResponse.json({ isFavorite });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return NextResponse.json(
      { error: "Error toggling favorite" },
      { status: 500 }
    );
  }
}
