import { NextRequest, NextResponse } from 'next/server';
import UsersPrompts, { UsersPromptsData } from '@/lib/models/usersPrompts';
import { createClient } from '@/lib/utils/supabase/server';

// GET /api/user/prompts
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log("Unauthorized access attempt to /api/user/prompts");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log("Fetching prompts for user:", user.id);
    const prompts = await UsersPrompts.getPrompts(user.id);
    console.log("Fetched prompts:", prompts);

    return NextResponse.json(prompts, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error?.toString() }, { status: 500 });
}
}

// POST /api/user/prompts
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        
        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();

        if (!data.prompt_id) {
            return NextResponse.json({ error: 'Missing prompt_id' }, { status: 400 });
        }

        // Check if user already has this prompt
        const existingPrompt = (await UsersPrompts.getPrompts(user.id)).includes(data.prompt_id);
        if (existingPrompt) {
            return NextResponse.json({ error: 'Prompt already exists for this user' }, { status: 400 });
        }

        const usersPromptsData: UsersPromptsData = {
            prompt_id: data.prompt_id,
            user_id: user.id,
        };

        if (data.user_role !== undefined) usersPromptsData.user_role = data.user_role;
        if (data.favorite !== undefined) usersPromptsData.favorite = data.favorite;


        const result = await UsersPrompts.create(usersPromptsData);

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error?.toString() }, { status: 500 });
}
}

// DELETE /api/user/prompts
export async function DELETE(req: NextRequest) {
   try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { prompt_id } = data;

    if ( !prompt_id) {
      return NextResponse.json({ error: 'Missing prompt_id' }, { status: 400 });
    }

    const result = await UsersPrompts.hardDelete(prompt_id);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error?.toString() }, { status: 500 });
}
}

// PUT /api/user/prompts
export async function PUT(req: NextRequest) {
   try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { prompt_id, user_role } = data;

    if (!user_role || !prompt_id) {
      return NextResponse.json({ error: 'Missing user_role or prompt_id' }, { status: 400 });
    }

    const result = await UsersPrompts.updateRole(prompt_id, user.id, user_role);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error?.toString() }, { status: 500 });
}
}