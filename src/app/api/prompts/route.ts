// API endpoint for GET/POST prompts
import { NextRequest, NextResponse } from 'next/server';
import Prompt, { PromptInsert } from '@/lib/models/prompt';
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
    
    const ownership = await UsersPrompts.getUserRole(data.prompt_id, user.id);
    if (ownership !== 'owner') {
      await UsersPrompts.softDelete(user.id, data.prompt_id);
      return NextResponse.json(
        { message: "Prompt unsaved successfully" }
      );
    }

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

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { id, updates } = data;
    console.log("Updating prompt with ID:", id, "and updates:", updates);
    if (!id) {
      return NextResponse.json({ error: 'Missing prompt_id' }, { status: 400 });
    }

    // Check ownership
    const ownership = await UsersPrompts.getUserRole(id, user.id);
    if (ownership !== 'owner' && ownership !== 'collaborator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Prepare update data (only update provided fields)
    const updateData: PromptInsert = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.visibility !== undefined) updateData.visibility = updates.visibility;
    if (updates.images !== undefined) updateData.images = updates.images;
    if (updates.content !== undefined) updateData.content = updates.content;

    const updatedPrompt = await Prompt.update(id, updateData);
    return NextResponse.json(updatedPrompt);
  } catch (error) {
    console.error('Error updating prompt:', error);
    return NextResponse.json(
      { error: 'Error updating prompt' },
      { status: 500 }
    );
  }
}