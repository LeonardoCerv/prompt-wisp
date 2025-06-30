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
    const { title, description, tags, visibility, images, content } = data;

    // Create prompt data
    const promptData = {
      title: title || '',
      description: description || null,
      tags: tags || [],
      visibility: visibility || 'private',
      images: images || null,
      content: content || '',
      deleted: false
    }

    console.log("Creating prompt with data:", promptData);
    const prompt = await Prompt.create(promptData);
    console.log("Prompt created:", prompt);

    const usersPromptsData: UsersPromptsData = {
        prompt_id: prompt.id,
        user_id: user.id,
        user_role: 'owner',
    };

    await UsersPrompts.create(usersPromptsData);
    console.log("UsersPrompts entry created:", usersPromptsData);

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
    await Prompt.softDelete(data.prompt_id);

   return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating prompt:", error);
    return NextResponse.json(
      { error: "Error creating prompt" },
      { status: 500 }
    );
  }
}