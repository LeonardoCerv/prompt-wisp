import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/utils/supabase/server";
import Prompt from "@/lib/models/prompt";

// Cleanup endpoint to permanently delete old soft-deleted prompts
export async function POST(req: NextRequest) {
  try {
    // Verify this is an authorized request (you might want to add API key validation)
    const supabase = await createClient();
    
    // You could add additional authorization here, such as:
    // - API key validation
    // - Admin user check
    // - Or just make this a cron job endpoint
    
    const deletedCount = await Prompt.cleanupOldDeletedPrompts();
    
    return NextResponse.json({ 
      success: true, 
      deletedCount,
      message: `Successfully cleaned up ${deletedCount} old deleted prompts`
    });
  } catch (error) {
    console.error("Error in cleanup:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Error cleaning up prompts" },
      { status: 500 }
    );
  }
}

// GET endpoint to check how many prompts would be cleaned up (dry run)
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Count prompts that would be deleted
    const { count, error } = await supabase
      .from('prompts')
      .select('*', { count: 'exact', head: true })
      .eq('deleted', true)
      .lt('updated_at', thirtyDaysAgo.toISOString());

    if (error) {
      throw new Error(`Error counting old deleted prompts: ${error.message}`);
    }

    return NextResponse.json({ 
      count: count || 0,
      cutoffDate: thirtyDaysAgo.toISOString(),
      message: `${count || 0} prompts are eligible for permanent deletion`
    });
  } catch (error) {
    console.error("Error checking cleanup:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Error checking cleanup" },
      { status: 500 }
    );
  }
}
