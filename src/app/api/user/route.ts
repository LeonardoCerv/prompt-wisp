import { NextResponse } from "next/server";
import { createClient } from "@/lib/utils/supabase/server";
import { User, UserData } from "@/lib/models";

// Get user's info
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data:{ user}, error: authError } = await supabase.auth.getUser();
    console.log("Authenticated user:", user);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error getting user info:", error);
    return NextResponse.json(
      { error: "Error getting user info" },
      { status: 500 }
    );
  }
}
