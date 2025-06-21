import { NextRequest, NextResponse } from 'next/server';
import LocalUser from '@/lib/models/local-user';

export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json();
    
    if (!identifier || !password) {
      return NextResponse.json({ error: 'Username/email and password are required' }, { status: 400 });
    }

    // Try to authenticate user by email or username
    let user = await LocalUser.verifyPasswordByEmail(identifier, password);
    
    if (!user) {
      user = await LocalUser.verifyPasswordByUsername(identifier, password);
    }
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

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
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
