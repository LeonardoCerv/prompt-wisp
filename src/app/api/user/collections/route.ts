import { NextRequest, NextResponse } from 'next/server';
import UsersCollections, { UsersCollectionsData } from '@/lib/models/usersCollections';
import { createClient } from '@/lib/utils/supabase/server';

// GET /api/user/collections
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const collections = await UsersCollections.getCollections(user.id);
    console.log('collections retrieved successfully:', collections);

    return NextResponse.json(collections, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error?.toString() }, { status: 500 });
}
}

// POST /api/user/collections
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        
        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            console.log('Auth error:', authError);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();
        console.log('Request data:', data);

        if (!data.collection_id) {
            return NextResponse.json({ error: 'Missing collection_id' }, { status: 400 });
        }

        const usersCollectionsData: UsersCollectionsData = {
            collection_id: data.collection_id,
            user_id: user.id,
        };

        if (data.user_role !== undefined) usersCollectionsData.user_role = data.user_role;
        if (data.favorite !== undefined) usersCollectionsData.favorite = data.favorite;

        const result = await UsersCollections.create(usersCollectionsData);
        console.log('User collection created successfully:', result);

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error?.toString() }, { status: 500 });
}
}

// DELETE /api/user/collections
export async function DELETE(req: NextRequest) {
   try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    console.log('Request data:', data);
    const { collection_id } = data;

    if ( !collection_id) {
      return NextResponse.json({ error: 'Missing collection_id' }, { status: 400 });
    }

    const result = await UsersCollections.delete(collection_id, user.id);
    console.log('Connection deleted successfully:', result);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error?.toString() }, { status: 500 });
}
}

// PUT /api/user/collections
export async function PUT(req: NextRequest) {
   try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    console.log('Request data:', data);
    const { collection_id, user_role } = data;

    if (!user_role || !collection_id) {
      return NextResponse.json({ error: 'Missing user_role or collection_id' }, { status: 400 });
    }

    const result = await UsersCollections.updateRole(collection_id, user.id, user_role);
    console.log('User role updated successfully:', result);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error?.toString() }, { status: 500 });
}
}