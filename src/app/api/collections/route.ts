import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/utils/supabase/server'
import Collection from '@/lib/models/collection'

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
    console.log('Prompt created successfully:', newCollection);

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
