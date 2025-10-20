import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import * as bcrypt from 'bcrypt'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        totpCode: { label: '2FA Code', type: 'text', optional: true }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          include: {
            subscription: true,
            profile: true
          }
        })

        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isValidPassword) {
          throw new Error('Invalid credentials')
        }

        // Check 2FA if enabled
        if (user.twoFactorSecret) {
          if (!credentials.totpCode) {
            throw new Error('2FA code required')
          }

          const { authenticator } = await import('otplib')
          const isValid = authenticator.verify({
            token: credentials.totpCode,
            secret: user.twoFactorSecret
          })

          if (!isValid) {
            throw new Error('Invalid 2FA code')
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role || 'USER',
          plan: user.subscription?.plan || 'starter',
          subscriptionStatus: user.subscription?.status || null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/signin',
    signOut: '/signout',
    error: '/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.plan = (user as any).plan
        token.subscriptionStatus = (user as any).subscriptionStatus
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string
        (session.user as any).role = token.role as string
        (session.user as any).plan = token.plan as string
        (session.user as any).subscriptionStatus = token.subscriptionStatus as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Parse the URL to check for callbackUrl
      try {
        const urlObj = new URL(url, baseUrl)
        const callbackUrl = urlObj.searchParams.get('callbackUrl')
        
        // If there's a callbackUrl, use it
        if (callbackUrl) {
          // Ensure it's a relative URL for security
          if (callbackUrl.startsWith('/')) {
            return `${baseUrl}${callbackUrl}`
          }
        }
      } catch (e) {
        // URL parsing failed, continue with default logic
      }
      
      // If signing in from admin signin page, default to admin
      if (url.includes('/admin/signin') || url.includes('/admin73636/signin')) {
        return `${baseUrl}/admin`
      }
      
      // Allow redirects to the same base URL
      if (url.startsWith(baseUrl)) {
        return url
      }
      
      // Allow relative URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      
      // Default fallback
      return baseUrl
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}
