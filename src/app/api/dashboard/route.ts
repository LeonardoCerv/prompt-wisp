import { NextResponse } from "next/server";
import { createClient } from "@/lib/utils/supabase/server";
import Prompt from "@/lib/models/prompt";

// Get dashboard statistics for the authenticated user
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's prompts count
    const userPromptsCount = await Prompt.getCountByUser(user.id);
    
    // Get user's prompts for additional stats
    const userPrompts = await Prompt.findByUserId(user.id, true, true);
    
    // Get user data for favorites, bought, etc.
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('favorites, bought, created_at')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error("Error getting user data:", userError);
    }

    const favoriteIds = userData?.favorites || [];
    const boughtIds = userData?.bought || [];
    
    // Calculate essential statistics only
    const stats = {
      // Basic counts
      totalPrompts: userPromptsCount,
      favoritesCount: favoriteIds.length,
      savedCount: boughtIds.length,
      
      // Prompt visibility breakdown
      publicPrompts: userPrompts.filter(p => p.visibility === 'public' && !p.deleted).length,
      privatePrompts: userPrompts.filter(p => p.visibility === 'private' && !p.deleted).length,
      
      // Recent activity - only last 3 prompts
      recentPrompts: userPrompts
        .filter(p => !p.deleted)
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 3)
        .map(p => ({
          id: p.id,
          title: p.title,
          updated_at: p.updated_at,
          visibility: p.visibility,
          tags: p.tags.slice(0, 2) // Only first 2 tags
        })),
      
      // Top tags - only top 5
      topTags: Object.entries(
        userPrompts
          .filter(p => !p.deleted)
          .flatMap(p => p.tags)
          .reduce((acc: Record<string, number>, tag) => {
            acc[tag] = (acc[tag] || 0) + 1;
            return acc;
          }, {})
      )
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([tag, count]) => ({ tag, count }))
    };

    // Get minimal global platform stats
    const globalStats = {
      totalPublicPrompts: await Prompt.getPublicCount()
    };

    return NextResponse.json({
      userStats: stats,
      globalStats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    return NextResponse.json(
      { error: "Error getting dashboard stats" },
      { status: 500 }
    );
  }
}
