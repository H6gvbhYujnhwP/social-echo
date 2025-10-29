import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get the user's session token for all protected routes
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })
  
  // Block access to dashboard/planner/train for cancelled or inactive subscriptions
  const protectedRoutes = ['/dashboard', '/planner', '/train'];
  if (protectedRoutes.includes(pathname) && token) {
    // Check subscription status from token
    const subscriptionStatus = token.subscriptionStatus as string | undefined;
    const currentPeriodEnd = token.currentPeriodEnd as string | undefined;
    
    // Allow access if subscription is active (even if cancelAtPeriodEnd is true)
    if (subscriptionStatus === 'active' || subscriptionStatus === 'trialing') {
      return NextResponse.next();
    }
    
    // Block access if subscription is canceled AND period has ended
    if (subscriptionStatus === 'canceled' || subscriptionStatus === 'cancelled') {
      const url = request.nextUrl.clone();
      url.pathname = '/account';
      url.searchParams.set('error', 'subscription_expired');
      return NextResponse.redirect(url);
    }
    
    // Block access if no subscription status
    if (!subscriptionStatus) {
      const url = request.nextUrl.clone();
      url.pathname = '/account';
      url.searchParams.set('error', 'subscription_required');
      return NextResponse.redirect(url);
    }
  }
  
  // Agency routing: redirect agency users from /dashboard to /agency
  if (pathname === '/dashboard' && token) {
    if (token.role === 'AGENCY_ADMIN' || token.role === 'AGENCY_STAFF') {
      // Check if they're impersonating (allow dashboard access during impersonation)
      const impersonating = request.cookies.get('impersonating')
      
      if (!impersonating) {
        const url = request.nextUrl.clone()
        url.pathname = '/agency'
        return NextResponse.redirect(url)
      }
    }
  }
  
  // Check if accessing admin routes (including hidden URL)
  if (pathname.startsWith('/admin') || pathname.startsWith('/admin73636')) {
    // Skip middleware for admin signin page
    if (pathname === '/admin/signin' || pathname === '/admin73636/signin') {
      return NextResponse.next()
    }
    
    // If not authenticated, redirect to admin signin
    if (!token) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/signin'
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
    
    // If authenticated but not MASTER_ADMIN, redirect to signin with error
    if (token.role !== 'MASTER_ADMIN') {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/signin'
      url.searchParams.set('error', 'access_denied')
      url.searchParams.set('message', 'Master Admin access required')
      return NextResponse.redirect(url)
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
    '/dashboard',
    '/planner',
    '/train',
    '/agency/:path*',
  ],
}
