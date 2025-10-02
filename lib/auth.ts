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

        if (!user || !user.passwordHash) {
          throw new Error('Invalid credentials')
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.passwordHash
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
          plan: user.subscription?.plan || 'starter'
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
        token.plan = (user as any).plan
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string
        (session.user as any).plan = token.plan as string
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}
