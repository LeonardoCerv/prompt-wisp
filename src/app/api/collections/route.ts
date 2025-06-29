import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/utils/supabase/server'
import Collection, { CollectionUpdate } from '@/lib/models/collection'
import Prompt from '@/lib/models/prompt'
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

    // Validate required fields
    if (!title || title.trim() === '') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Create collection data
    const collectionData = {
      title: title.trim(),
      description: description || null,
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
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get collection data from request body
    const body = await request.json()
    console.log('Update collection data:', body)
    const { id, updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Collection ID is required' }, { status: 400 })
    }

    const role = await UsersCollections.getUserRole(id, user.id);
    if (role !== 'owner' && role !== 'collaborator') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Prepare update data
    const updateData: CollectionUpdate = {};

    if (updates.title) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.images) updateData.images = updates.images;
    if (updates.tags) updateData.tags = updates.tags;
    if (updates.visibility !== undefined) updateData.visibility = updates.visibility;

    const updatedCollection = await Collection.update(id, updateData);
    console.log('Collection updated successfully:', updatedCollection);

    return NextResponse.json(updatedCollection)
  } catch (error) {
    console.error('Update collection error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}