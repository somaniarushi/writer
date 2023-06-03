// Disable all linting for this file because it's copied from the NextAuth docs

import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options

if (!process.env.GOOGLE_ID || !process.env.GOOGLE_SECRET) {
  throw new Error(
    "Missing environment variables for Google OAuth. Check your .env file."
  )
}

export const authOptions: NextAuthOptions = {
  // https://next-auth.js.org/configuration/providers/oauth

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    })
  ],
  secret: process.env.SECRET,
  callbacks: {
    async jwt({ token }) {
      token.userRole = "admin"
      return token
    },
  },
}

export default NextAuth(authOptions)
