import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create Supabase client for server-side operations
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function middleware(request: NextRequest) {
  // Get the current path
  const path = request.nextUrl.pathname;
  
  // Check if the path is an API route that should be protected
  const isApiRoute = path.startsWith('/api/')
  
  // Check if path is a protected client route
  const isProtectedClientRoute = path.startsWith('/home') || 
                                path.startsWith('/profile') ||
                                path.startsWith('/settings');

  // If it's not a protected route, continue
  if (!isApiRoute && !isProtectedClientRoute) {
    return NextResponse.next();
  }

  // Get the session from Supabase
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // For API routes, return unauthorized
    if (isApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // For protected client routes, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const user = session.user;
    
    // For API routes, attach user info to the request headers for later use
    if (isApiRoute) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', user.id);
      requestHeaders.set('x-user-email', user.email || '');
      
      // Continue with modified request
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
    
    // If all checks pass for client routes, allow the request
    return NextResponse.next();
    
  } catch (error) {
    // Handle verification errors
    console.error('Session verification error:', error);
    
    // For API routes, return unauthorized
    if (isApiRoute) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }
    
    // For protected client routes, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    // Match all API routes except auth endpoints
    '/api/:path*',
    // Exclude static files and favicon
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)'
  ]
}