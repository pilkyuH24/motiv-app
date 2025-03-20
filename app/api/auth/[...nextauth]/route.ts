import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
// import CredentialsProvider from 'next-auth/providers/credentials' // For email-based login (password not implemented)

import { prisma } from "@/lib/prisma";

// Google OAuth client ID and secret from environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!

export const authOptions: NextAuthOptions = {
    session: {
        strategy: 'jwt' // Using JWT for session management
    },
    providers: [
        GoogleProvider({
            clientId: GOOGLE_CLIENT_ID, // Google OAuth client ID
            clientSecret: GOOGLE_CLIENT_SECRET // Google OAuth client secret
        })
    ],
    callbacks: {
        // Handles user sign-in: Creates or updates the user record in the database
        async signIn({ account, profile }) {
            if (!profile?.email) {
                throw new Error('No profile') // Error if the profile does not contain an email
            }

            // Using Prisma to upsert the user into the database (create if not exists, update if exists)
            await prisma.user.upsert({
                where: { email: profile.email },
                create: { email: profile.email, name: profile.name ?? "USER", points: 0 }, // Default to 'USER' name if profile has no name
                update: { name: profile.name }
            })

            return true
        },

        // 🚀 Includes additional information in the session
        async session({ session, token }) {
            if (!session.user?.email) return session; // If no user email, return session as is

            // Fetch user data from Prisma, including badges
            const user = await prisma.user.findUnique({
                where: { email: session.user.email },
                include: { badges: true }  // Include badges data
            });

            if (user) {
                session.user.points = user.points; // Add user points to the session
                // session.user.badges = user.badges.map(badge => badge.name); // Optionally add badge names to the session
            }

            return session; // Return updated session
        }
    }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }


// ===========================================================================
// Custom email login (commented out example)
// ===========================================================================
// export const authOptions: NextAuthOptions = {
//     session: {
//         strategy: 'jwt' // JWT strategy for sessions
//     },
//     providers: [
//         CredentialsProvider({
//             name: 'Sign in',
//             credentials: {
//                 email: {
//                     label: 'Email',
//                     type: 'email',
//                     placeholder: 'hello@example.com'
//                 }
//             },
//             async authorize(credentials) {
//                 if (!credentials?.email)
//                     return null // Return null if no email is provided
//                 
//                 const user = await prisma.user.findUnique({
//                     where: {
//                         email: credentials.email // Check user by email
//                     }
//                 })
//                 if(!user){
//                     return  null // Return null if no user is found
//                 }
//                 return {
//                     id: user.id + '', // Ensure the ID is a string
//                     email: user.email,
//                     name: user.name
//                 }
//             }
//         })
//     ],
//     callbacks: {
//         session: ({session, token}) => {
//             console.log('Session Callback', {session, token}) // Logs session and token for debugging
//             return session // Return the session object
//         },
//         jwt: ({ token, user}) => {
//             console.log('JWT Callback', {token, user}) // Logs the JWT and user for debugging
//             return token // Return the token
//         }
//     }
// }

// const handler = NextAuth(authOptions)
// export { handler as GET, handler as POST }
