import { NextResponse } from "next/server";
import { createClient } from "@/lib/utils/supabase/server";
import Prompt from "@/lib/models/prompt";

// Get user's prompts (including private ones) with additional metadata
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Get user's prompts (including private ones)
    const userPrompts = await Prompt.findByUserId(user.id, true);
    
    // Get user's saved prompts (public prompts they've saved)
    const { data: savedPrompts, error: savedError } = await supabase
      .from('user_saved_prompts')
      .select(`
        prompt_id,
        prompts!inner (
          *,
          profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        )
      `)
      .eq('user_id', user.id);

    if (savedError) {
      console.error("Error getting saved prompts:", savedError);
    }

    // Get user's favorite prompts
    const { data: favoritePrompts, error: favError } = await supabase
      .from('user_favorite_prompts')
      .select(`
        prompt_id,
        prompts!inner (
          *,
          profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        )
      `)
      .eq('user_id', user.id);

    if (favError) {
      console.error("Error getting favorite prompts:", favError);
    }

    // Combine and transform data
    const savedPromptIds = new Set(savedPrompts?.map(sp => sp.prompt_id) || []);
    const favoritePromptIds = new Set(favoritePrompts?.map(fp => fp.prompt_id) || []);
    
    // Transform user's own prompts
    const transformedUserPrompts = userPrompts.map(prompt => ({
      ...prompt,
      isFavorite: favoritePromptIds.has(prompt.id),
      isSaved: false, // User can't save their own prompts
      isOwner: true,
    }));

    // Transform saved prompts
    const transformedSavedPrompts = (savedPrompts?.map(sp => {
      const prompt = Array.isArray(sp.prompts) ? sp.prompts[0] : sp.prompts;
      return {
        ...prompt,
        isFavorite: favoritePromptIds.has(prompt.id),
        isSaved: true,
        isOwner: false,
      };
    }) || []);

    // Transform favorite prompts (that aren't already included)
    const transformedFavoritePrompts = (favoritePrompts?.map(fp => {
      const prompt = Array.isArray(fp.prompts) ? fp.prompts[0] : fp.prompts;
      return {
        ...prompt,
        isFavorite: true,
        isSaved: savedPromptIds.has(prompt.id),
        isOwner: prompt.user_id === user.id,
      };
    }).filter(prompt => 
      !transformedUserPrompts.some(up => up.id === prompt.id) &&
      !transformedSavedPrompts.some(sp => sp.id === prompt.id)
    ) || []);

    // Combine all prompts
    const allUserPrompts = [
      ...transformedUserPrompts,
      ...transformedSavedPrompts,
      ...transformedFavoritePrompts
    ];

    return NextResponse.json(allUserPrompts);
  } catch (error) {
    console.error("Error getting user prompts:", error);
    return NextResponse.json(
      { error: "Error getting user prompts" },
      { status: 500 }
    );
  }
}
