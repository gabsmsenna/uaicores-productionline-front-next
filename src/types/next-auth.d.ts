import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresAt?: number;
    error?: string;
  }

  interface User {
    id: string;
    name: string;
    username: string;
    accessToken: string;
    refreshToken?: string;
    accessTokenExpiresAt: number;
    userRole: "OFFICER" | "DEV" | "ADMIN" | "USER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresAt?: number;
    user?: {
      id: string;
      name: string;
      username: string;
    };
    error?: string;
  }
}
