import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/utils/supabase/server";
import Prompt, { PromptInsert, PromptUpdate, PromptWithProfile } from "@/lib/models/prompt";

// Get all prompts
export async function GET() {
    try {
        const prompts: PromptWithProfile[] = await Prompt.findPublicWithProfiles();
        return NextResponse.json(prompts);
    } catch (error) {
        console.error("Error getting prompts:", error);
        return NextResponse.json(
            { error: "Error getting prompts" },
            { status: 500 }
        );
    }
}

// Create a new prompt
export async function POST(req: NextRequest) {
  try {
    console.log('POST /api/prompts called');
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Authenticated user:', { id: user.id, email: user.email });

    // Check if user has a profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    console.log('Profile check:', { profile, profileError });

    if (profileError && profileError.code === 'PGRST116') {
      // Profile doesn't exist, create one
      console.log('Creating profile for user:', user.id);
      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username: user.email?.split('@')[0] || 'user',
          full_name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null
        });

      if (createProfileError) {
        console.error('Error creating profile:', createProfileError);
        return NextResponse.json({ 
          error: 'Failed to create user profile' 
        }, { status: 500 });
      }
    }

    const data = await req.json();
    console.log('Request data:', data);
    const { title, description, content, tags, visibility, images, collaborators, collections } = data;

    // Basic validation
    if (!title?.trim() || !content?.trim()) {
      console.log('Validation failed:', { title: title?.trim(), content: content?.trim() });
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const promptData: PromptInsert = {
      title,
      description: description || null,
      content,
      tags: tags || [],
      visibility: visibility || 'private',
      user_id: user.id,
      images: images || null,
      collaborators: collaborators || null,
      collections: collections || null
    };

    console.log('Creating prompt with data:', promptData);

    console.log('Creating prompt with data:', promptData);

    const newPrompt = await Prompt.create(promptData);
    console.log('Prompt created successfully:', newPrompt);

    return NextResponse.json(newPrompt, { status: 201 });
  } catch (error) {
    console.error("Error creating prompt:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Error creating prompt" },
      { status: 500 }
    );
  }
}

// Update prompt data
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

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Verify user owns the prompt
    const existingPrompt = await Prompt.findById(id);
    
    if (!existingPrompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    if (existingPrompt.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Prepare update data
    const updateData: PromptUpdate = {};
    
    if (updates.title) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.content) updateData.content = updates.content;
    if (updates.tags) updateData.tags = updates.tags;
    if (updates.visibility !== undefined) updateData.visibility = updates.visibility;

    const updatedPrompt = await Prompt.update(id, updateData);

    return NextResponse.json(updatedPrompt);
  } catch (error) {
    console.error("Error updating prompt:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Error updating prompt" },
      { status: 500 }
    );
  }
}

// Soft delete a prompt by ID
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Verify user owns the prompt
    const existingPrompt = await Prompt.findById(id);
    
    if (!existingPrompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    if (existingPrompt.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Soft delete the prompt
    const deletedPrompt = await Prompt.softDelete(id);

    return NextResponse.json(deletedPrompt);
  } catch (error) {
    console.error("Error deleting prompt:", error);
    return NextResponse.json(
      { error: "Error deleting prompt" },
      { status: 500 }
    );
  }
}