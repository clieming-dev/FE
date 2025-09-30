import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    backendJWT?: string;
    tokenExpiresAt?: number;
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    backendJWT?: string;
    userId?: string;
    expiresAt?: number;
  }
}

declare module "next-auth" {
  interface Account {
    backend_jwt?: string;
    user_id?: string;
  }
}
