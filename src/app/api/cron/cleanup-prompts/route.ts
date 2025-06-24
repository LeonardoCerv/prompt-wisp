import { NextRequest, NextResponse } from "next/server";
import Prompt from "@/lib/models/prompt";

// Cron job endpoint to automatically clean up old deleted prompts
// This can be called by Vercel Cron, GitHub Actions, or any external cron service
// Example: Set up a daily cron job to call POST /api/cron/cleanup-prompts

export async function POST(req: NextRequest) {
  try {
    // Optional: Add authorization for cron jobs
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // If you set a CRON_SECRET environment variable, validate it
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Running automated cleanup of old deleted prompts...');
    
    const deletedCount = await Prompt.cleanupOldDeletedPrompts();
    
    console.log(`Cleanup completed: ${deletedCount} prompts permanently deleted`);
    
    return NextResponse.json({ 
      success: true, 
      deletedCount,
      timestamp: new Date().toISOString(),
      message: `Automated cleanup completed: ${deletedCount} old deleted prompts permanently removed`
    });
  } catch (error) {
    console.error("Error in automated cleanup:", error);
    return NextResponse.json(
      { 
        error: (error as Error).message || "Error in automated cleanup",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    service: 'prompt-cleanup-cron',
    timestamp: new Date().toISOString()
  });
}
