import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Get the user cookie
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user');
    
    if (!userCookie?.value) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    try {
      // Parse the user data from the cookie
      const user = JSON.parse(userCookie.value);
      
      // Validate that the user object has the expected structure
      if (!user.id || !user.username || !user.email) {
        console.error('Invalid user cookie structure:', user);
        
        // If the cookie is malformed, clear it
        const response = NextResponse.json({ user: null }, { status: 200 });
        response.cookies.delete('user');
        
        return response;
      }
      
      // Return the user data
      return NextResponse.json({ user });
    } catch (parseError) {
      console.error('Error parsing user cookie:', parseError);
      
      // If the cookie is malformed, clear it
      const response = NextResponse.json({ user: null }, { status: 200 });
      response.cookies.delete('user');
      
      return response;
    }
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
