// lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

export const authOptions: NextAuthOptions = {
    session: {
      strategy: 'jwt',
    },
    providers: [
      GoogleProvider({
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
      }),
    ],
    pages: {
      signIn: "/signin",
    },
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
  