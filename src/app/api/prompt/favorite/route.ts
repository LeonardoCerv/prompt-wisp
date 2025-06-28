import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/utils/supabase/server";
import Prompt from "@/lib/models/prompt";

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
    const prompt = await Prompt.findById(promptId);

    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    // Check if user has access to this prompt
    if (prompt.visibility !== 'public' && prompt.user_id !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get current user favorites
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('favorites')
      .eq('id', user.id)
      .single();

    if (userError) {
      throw userError;
    }

    const currentFavorites = userData?.favorites || [];
    const isCurrentlyFavorite = currentFavorites.includes(promptId);
    
    let newFavorites: string[];
    let isFavorite: boolean;

    if (isCurrentlyFavorite) {
      // Remove from favorites
      newFavorites = currentFavorites.filter((id: string) => id !== promptId);
      isFavorite = false;
    } else {
      // Add to favorites
      newFavorites = [...currentFavorites, promptId];
      isFavorite = true;
    }

    // Update user favorites
    const { error: updateError } = await supabase
      .from('users')
      .update({ favorites: newFavorites })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
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
