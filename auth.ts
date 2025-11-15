import NextAuth, { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import bcryptjs from "bcryptjs"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          await connectDB()
          const user = await User.findOne({ email: credentials.email })

          if (!user) return null

          const isPasswordValid = await bcryptjs.compare(credentials.password as string, user.passwordHash)

          if (!isPasswordValid) return null

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

type AuthSession = {
  user: {
    id: string
    role?: string
    name?: string | null
    email?: string | null
  }
}

export async function auth(request: NextRequest): Promise<AuthSession | null> {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  if (!token || !token.id) {
    return null
  }

  return {
    user: {
      id: token.id as string,
      role: (token.role as string) ?? undefined,
      name: token.name,
      email: token.email,
    },
  }
}
