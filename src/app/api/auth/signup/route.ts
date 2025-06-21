import { NextRequest, NextResponse } from 'next/server';
import LocalUser from '@/lib/models/local-user';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();
    
    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Username, email, and password are required' }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Basic username validation
    if (username.length < 3) {
      return NextResponse.json({ error: 'Username must be at least 3 characters long' }, { status: 400 });
    }

    // Basic password validation
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    try {
      // Create new user
      const user = await LocalUser.create(username, email, password);
      
      // Prepare user data without password hash
      const userInfo = user;
      
      // Create a response object
      const response = NextResponse.json({ user: userInfo });
      
      // Set the cookie in the response object
      const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
      const expiryDate = new Date(Date.now() + oneWeekInMs);
      
      response.cookies.set({
        name: 'user',
        value: JSON.stringify(userInfo),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        expires: expiryDate,
        path: '/',
        sameSite: 'lax',
      });
      
      return response;
      
    } catch (createError) {
      // Handle user creation errors (duplicate email/username)
      if (createError instanceof Error) {
        return NextResponse.json({ error: createError.message }, { status: 409 });
      }
      throw createError;
    }
    
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
