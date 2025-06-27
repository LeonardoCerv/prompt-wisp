import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/utils/supabase/server'
import Collection, { CollectionUpdate } from '@/lib/models/collection'
import Prompt, { PromptData } from '@/lib/models/prompt'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, tags, visibility, images, collaborators, prompts } = body

    console.log('Received collection data:', body)

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
      collaborators: collaborators || null,
      user_id: user.id,
      prompts: prompts || [],
      deleted: false
    }

    const newCollection = await Collection.create(collectionData);
    console.log('Collection created successfully:', newCollection);

    if (prompts && prompts.length > 0) {
      // Ensure prompts are in the correct format
      for (const prompt of prompts) {
        await Prompt.updateCollection(prompt, newCollection.id)
        console.log(`Updated prompt ${prompt} with new collection ${newCollection.id}`)
      }
    }

    return NextResponse.json(newCollection, { status: 201 });
  } catch (error) {
    console.error('Error in collections API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get URL search params
    const { searchParams } = new URL(request.url)
    const includeDeleted = searchParams.get('includeDeleted') === 'true'

    // Build query - get collections user owns or collaborates on
    let query = supabase
      .from('collections')
      .select('*')
      .or(`user_id.eq.${user.id},collaborators.cs.{${user.id}}`) // User's own collections or collections they collaborate on

    // Filter out deleted collections unless explicitly requested
    if (!includeDeleted) {
      query = query.eq('deleted', false)
    }

    // Order by creation date (newest first)
    query = query.order('created_at', { ascending: false })

    const { data: collections, error } = await query

    if (error) {
      console.error('Collections fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch collections' },
        { status: 500 }
      )
    }

    return NextResponse.json({ collections: collections || [] })

  } catch (error) {
    console.error('Collections API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
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
    const {id} = body
    if (!id) {
      return NextResponse.json({ error: 'Collection ID is required' }, { status:400 })
    }

    // Verify user owns the collection
    const existingCollection = await Collection.findById(id);
    
    if (!existingCollection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    if (existingCollection.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Soft delete: set deleted = true
    const { error: deleteError } = await supabase
      .from('collections')
      .update({ deleted: true })
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 })
    }

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

    // Find existing collection
    const existingCollection = await Collection.findById(id)
    if (!existingCollection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }

    // Only owner can update
    if (existingCollection.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Prepare update data
    
    // Prepare update data
    const updateData: CollectionUpdate = {};

    if (updates.title) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.images) updateData.images = updates.images;
    if (updates.collaborators) updateData.collaborators = updates.collaborators;
    if (updates.prompts) updateData.prompts = updates.prompts;
    if (updates.prompt) updateData.prompts = [...(existingCollection.prompts || []), updates.prompt];
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