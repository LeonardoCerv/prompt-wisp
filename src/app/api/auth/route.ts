import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // This is now just for logout - login is handled by /api/auth/login
  return NextResponse.json({ error: 'Use /api/auth/login for authentication' }, { status: 400 });
}

export async function DELETE(request: NextRequest) {
  // Create a response object
  const response = NextResponse.json({ success: true });
  
  // Clear the auth cookie using the response object
  response.cookies.delete('user');
  
  return response;
}