// Temporary debug version of middleware to understand what's happening

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  console.log('[middleware] pathname:', pathname)
  
  // Get the token (user session)
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  })
  
  console.log('[middleware] token role:', token?.role)
  
  // Agency routing: redirect agency users from /dashboard to /agency
  if (pathname === '/dashboard' && token) {
    if (token.role === 'AGENCY_ADMIN' || token.role === 'AGENCY_STAFF') {
      // Check if they're impersonating (allow dashboard access during impersonation)
      const impersonatingCookie = request.cookies.get('impersonating')
      console.log('[middleware] impersonatingCookie:', {
        exists: !!impersonatingCookie,
        hasValue: !!impersonatingCookie?.value,
        valueLength: impersonatingCookie?.value?.length
      })
      
      const isImpersonating = impersonatingCookie && impersonatingCookie.value
      console.log('[middleware] isImpersonating:', isImpersonating)
      
      if (!isImpersonating) {
        console.log('[middleware] Redirecting to /agency')
        const url = request.nextUrl.clone()
        url.pathname = '/agency'
        return NextResponse.redirect(url)
      } else {
        console.log('[middleware] Allowing dashboard access (impersonating)')
      }
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/agency/:path*'
  ]
}
