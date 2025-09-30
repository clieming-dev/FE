import NextAuth from "next-auth";
import {
  providers,
  isProd,
  secureCookieOptions,
  signInCallback,
  jwtCallback,
} from "@/domain-shared/auth";

const handler = NextAuth({
  providers,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  useSecureCookies: isProd,
  cookies: {
    sessionToken: { name: "next-auth.session-token", options: secureCookieOptions },
    callbackUrl: { name: "next-auth.callback-url", options: secureCookieOptions },
    csrfToken: { name: "next-auth.csrf-token", options: secureCookieOptions },
  },
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    signIn: signInCallback,
    jwt: jwtCallback,
    redirect: async ({ url, baseUrl }) => {
      if (url === baseUrl || url === `${baseUrl}/` || url === `${baseUrl}/signin`) {
        return baseUrl;
      }

      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      if (url.startsWith(baseUrl)) {
        return url;
      }

      return baseUrl;
    },
    session: async ({ session, token }) => {
      session.accessToken = token.accessToken;
      session.backendJWT = token.backendJWT;
      session.tokenExpiresAt = token.expiresAt;
      if (token.userId) {
        session.user = {
          ...session.user,
          id: token.userId,
        };
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
