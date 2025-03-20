import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
// import CredentialsProvider from 'next-auth/providers/credentials' // For email-based login (password not implemented)
import { prisma } from '@/lib/prisma';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

// Removed the export keyword here ( export const authOptions)
const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      if (!profile?.email) {
        throw new Error('No profile');
      }

      await prisma.user.upsert({
        where: { email: profile.email },
        create: { email: profile.email, name: profile.name ?? 'USER', points: 0 },
        update: { name: profile.name },
      });

      return true;
    },

    async session({ session }) {
      if (!session.user?.email) return session;

      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { badges: true },
      });

      if (user) {
        session.user.points = user.points;
      }

      return session;
    },
  },
};

const handler = NextAuth(authOptions);

// Export handler only
export { handler as GET, handler as POST };



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
