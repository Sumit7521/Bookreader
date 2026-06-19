import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtectedRoute = nextUrl.pathname.startsWith('/dashboard') || 
                               nextUrl.pathname.startsWith('/library') ||
                               nextUrl.pathname.startsWith('/reader') ||
                               nextUrl.pathname.startsWith('/write') ||
                               nextUrl.pathname.startsWith('/settings');

      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        if (nextUrl.pathname === '/login') {
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
