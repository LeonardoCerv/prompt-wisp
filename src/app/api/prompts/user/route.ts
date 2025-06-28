import { NextResponse } from "next/server";
import { createClient } from "@/lib/utils/supabase/server";
import Prompt, { PromptData } from "@/lib/models/prompt";

// Get user's prompts (including private ones) with additional metadata
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's own prompts (including private and deleted ones)
    const userPrompts = await Prompt.findByUserId(user.id, true, true);
    
    // Get user data to check favorites and bought items
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('favorites, bought')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error("Error getting user data:", userError);
    }

    const favoriteIds = userData?.favorites || [];
    const boughtIds = userData?.bought || [];

    // Get saved/bought prompts (public prompts they've purchased)
    let savedPrompts: PromptData[] = [];
    if (boughtIds.length > 0) {
      savedPrompts = await Prompt.findPublicWithProfiles();
      savedPrompts = savedPrompts.filter(prompt => 
        boughtIds.includes(prompt.id) && prompt.user_id !== user.id
      );
    }

    // Get favorite prompts (that aren't owned by user)
    let favoritePrompts: PromptData[] = [];
    if (favoriteIds.length > 0) {
      favoritePrompts = await Prompt.findPublicWithProfiles();
      favoritePrompts = favoritePrompts.filter(prompt => 
        favoriteIds.includes(prompt.id) && 
        prompt.user_id !== user.id &&
        !boughtIds.includes(prompt.id) // Don't duplicate with saved prompts
      );
    }

    // Combine all prompts
    const allUserPrompts = [
      ...userPrompts,
      ...savedPrompts,
      ...favoritePrompts
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
