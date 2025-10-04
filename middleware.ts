import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if accessing admin routes (including hidden URL)
  if (pathname.startsWith('/admin') || pathname.startsWith('/admin73636')) {
    // Skip middleware for admin signin page
    if (pathname === '/admin/signin' || pathname === '/admin73636/signin') {
      return NextResponse.next()
    }
    
    // Get the user's session token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })
    
    // If not authenticated, redirect to admin signin
    if (!token) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/signin'
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
    
    // If authenticated but not MASTER_ADMIN, show 403
    if (token.role !== 'MASTER_ADMIN') {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Forbidden', 
          message: 'Master Admin access required' 
        }), 
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
    
    // User is MASTER_ADMIN, allow access
    return NextResponse.next()
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/admin73636/:path*',
  ],
}
