import { NextRequest, NextResponse } from 'next/server';
import { User } from './src/context/AuthContext';

export function middleware(request: NextRequest) {
  // Get the current path
  const path = request.nextUrl.pathname;
  
  // Check if the path is an API route that should be protected
  const isApiRoute = path.startsWith('/api/') && 
                     !path.startsWith('/api/auth') && 
                     path !== '/api/auth/session';  // Allow session check API
  
  // Check if path is a protected client route (none for now since dashboard is integrated into home)
  const isProtectedClientRoute = false;

  // If it's not a protected route, continue
  if (!isApiRoute && !isProtectedClientRoute) {
    return NextResponse.next();
  }

  // Check for user session
  const userSession = request.cookies.get('user')?.value;
  
  if (!userSession) {
    // For API routes, return unauthorized
    if (isApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // For protected client routes, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Parse user data
    const user = JSON.parse(userSession) as User;
    
    // Validate user object structure
    if (!user.id || !user.username || !user.email) {
      throw new Error('Invalid user session');
    }
    
    // For API routes, attach user info to the request headers for later use
    if (isApiRoute) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', user.id.toString());
      requestHeaders.set('x-user-username', user.username);
      requestHeaders.set('x-user-email', user.email);
      
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
    // Handle parsing errors
    console.error('Session parsing error:', error);
    
    // Clear invalid session
    const response = isApiRoute 
      ? NextResponse.json({ error: 'Invalid session' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));
    
    response.cookies.delete('user');
    return response;
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