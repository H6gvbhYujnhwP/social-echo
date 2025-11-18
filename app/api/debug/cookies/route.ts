import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  const cookies = request.cookies.getAll()
  const impersonatingCookie = request.cookies.get('impersonating')
  
  return NextResponse.json({
    session: session?.user,
    allCookies: cookies.map(c => ({ name: c.name, value: c.value?.substring(0, 50) + '...' })),
    impersonatingCookie: impersonatingCookie ? {
      name: impersonatingCookie.name,
      value: impersonatingCookie.value?.substring(0, 100) + '...',
      hasValue: !!impersonatingCookie.value
    } : null
  })
}
