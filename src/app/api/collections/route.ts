import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/utils/supabase/server'
import Collection, { CollectionUpdate } from '@/lib/models/collection'
import { CollectionPrompts } from '@/lib/models'
import UsersCollections from '@/lib/models/usersCollections'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json();
    const { title, description, tags, visibility, images, prompts } = body

    // Create collection data
    const collectionData = {
      title: title || '',
      description: description || '',
      tags: tags || [],
      visibility: visibility || 'private',
      images: images || null,
      deleted: false
    }

    const collection = await Collection.create(collectionData);
    console.log("Collection created:", collection);

    if (prompts && prompts.length > 0) {
      // Ensure prompts are in the correct format
      for (const prompt of prompts) {
        const collectionPromptData = {
          prompt_id: prompt,
          collection_id: collection.id,
        }
        await CollectionPrompts.create(collectionPromptData)
      }
    }

    const UsersCollectionsData = {
      user_id: user.id,
      collection_id: collection.id,
    }

    await UsersCollections.create(UsersCollectionsData);

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    console.error('Error in collections API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get collection id from query params
    const body = await request.json()
    await Collection.softDelete(body.collection_id);

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete collection error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { id, updates } = data;
    if (!id) {
      return NextResponse.json({ error: 'Missing collection_id' }, { status: 400 });
    }

    // Check ownership
    const role = await UsersCollections.getUserRole(id, user.id);
    if (role !== 'owner' && role !== 'collaborator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Prepare update data (only update provided fields)
    const updateData: CollectionUpdate = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.visibility !== undefined) updateData.visibility = updates.visibility;
    if (updates.images !== undefined) updateData.images = updates.images;

    // Update collection
    const updatedCollection = await Collection.update(id, updateData);

    // Handle prompts update
    if (Array.isArray(updates.prompts)) {
      // Get current prompt associations
      const current = await CollectionPrompts.getPrompts(id);
      const currentPromptIds = current.map((cp: string) => cp);

      // Prompts to add
      const toAdd = updates.prompts.filter((pid: string) => !currentPromptIds.includes(pid));
      // Prompts to remove
      const toRemove = currentPromptIds.filter((pid: string) => !updates.prompts.includes(pid));

      // Add new associations
      for (const prompt_id of toAdd) {
        await CollectionPrompts.create({ collection_id: id, prompt_id });
      }
      // Remove old associations
      for (const prompt_id of toRemove) {
        await CollectionPrompts.delete(prompt_id, id);
      }
    }

    return NextResponse.json(updatedCollection);
  } catch (error) {
    console.error('Error updating collection:', error);
    return NextResponse.json(
      { error: 'Error updating collection' },
      { status: 500 }
    );
  }
}