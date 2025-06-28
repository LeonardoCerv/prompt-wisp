// API endpoint for GET/POST prompts
import { NextRequest, NextResponse } from 'next/server';
import Prompt from '@/lib/models/prompt';
import UsersPrompts, { UsersPromptsData } from '@/lib/models/usersPrompts';
import { createClient } from '@/lib/utils/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data:{ user}, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const prompt = await Prompt.create(data);

    const usersPromptsData: UsersPromptsData = {
        prompt_id: prompt.id,
        user_id: user.id,
        user_role: 'owner',
    };

    await UsersPrompts.create(usersPromptsData);

   return NextResponse.json(prompt);
  } catch (error) {
    console.error("Error creating prompt:", error);
    return NextResponse.json(
      { error: "Error creating prompt" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data:{ user}, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const prompt = await Prompt.softDelete(data.prompt_id);

   return NextResponse.json(prompt);
  } catch (error) {
    console.error("Error creating prompt:", error);
    return NextResponse.json(
      { error: "Error creating prompt" },
      { status: 500 }
    );
  }
}