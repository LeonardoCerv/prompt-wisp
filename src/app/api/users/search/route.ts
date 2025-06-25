import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ users: [] })
    }

    // Search users by name, username, or email
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, username, email, profile_picture')
      .or(`name.ilike.%${query}%,username.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10)

    if (error) {
      console.error('Users search error:', error)
      return NextResponse.json(
        { error: 'Failed to search users' },
        { status: 500 }
      )
    }

    // Filter out sensitive data and format response
    const formattedUsers = (users || []).map(user => ({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      profile_picture: user.profile_picture,
      display: `${user.name} (@${user.username})`
    }))

    return NextResponse.json({ users: formattedUsers })

  } catch (error) {
    console.error('Users search API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
