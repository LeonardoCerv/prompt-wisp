import { NextResponse } from "next/server";
import { createClient } from "@/lib/utils/supabase/server";
import { User, UserData } from "@/lib/models";

// Get user's info
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data:{ user}, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('Authenticated user:', { id: user.id, email: user.email });

    const userData: UserData = await User.findById(user.id);
    console.log('User data:', userData);

    return NextResponse.json(userData);
  } catch (error) {
    console.error("Error getting user info:", error);
    return NextResponse.json(
      { error: "Error getting user info" },
      { status: 500 }
    );
  }
}
