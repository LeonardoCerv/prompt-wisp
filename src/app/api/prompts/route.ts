import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/utils/supabase/server";
import Prompt, { PromptInsert, PromptUpdate, PromptWithProfile } from "@/lib/models/prompt";

// Get all prompts with user profile information
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
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { title, description, content, tags, is_public } = data;

    // Basic validation
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Generate unique slug
    const generatedSlug = Prompt.generateSlug(title);

    const promptData: PromptInsert = {
      title,
      slug: generatedSlug,
      description: description || null,
      content,
      tags: tags || [],
      is_public: is_public || false,
      user_id: user.id
    };

    const newPrompt = await Prompt.create(promptData);

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
    if (updates.is_public !== undefined) updateData.is_public = updates.is_public;

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