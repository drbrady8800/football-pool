import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

export const config = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    })
  ]
};

export const { handlers, signIn, signOut, auth } = NextAuth(config);
