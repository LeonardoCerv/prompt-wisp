import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Create a response object
  const response = NextResponse.json({ success: true });
  
  // Clear the auth cookie
  response.cookies.delete('user');
  
  return response;
}
