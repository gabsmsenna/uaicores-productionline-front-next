/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        console.log("Credentials recebidas: ", credentials);

        if (!credentials?.username || !credentials?.password) {
          console.error("❌ Usuario ou senha vazios");
          return null;
        }

        const loginUrl =
          process.env.BACKEND_BASE_AUTH_LOGIN_PATH ||
          "http://localhost:8080/api/auth/login";

        console.log("🌐 Chamando backend:", loginUrl);

        const res = await fetch(loginUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: credentials.username,
            plainTextPasswd: credentials.password,
          }),
        });

        if (!res.ok) {
          console.error("Failed to authenticate:", res.text);
          return null;
        }

        const data = (await res.json()) as {
          accessToken?: string;
          expiresIn?: number; // em segundos
          refreshToken?: string;
        };
        console.log("Resposta do backend:", data);

        const now = Date.now();
        const accessTokenExpiresAt = now + (data.expiresIn ?? 0) * 1000;

        if (!data?.accessToken) {
          console.error("Backend não retornou accessToken");
          return null;
        }

        return {
          id: credentials.username,
          name: credentials.username,
          username: credentials.username,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken ?? null,
          accessTokenExpiresAt,
        } as any;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = {
          id: (user as any).id,
          name: (user as any).name,
          username: (user as any).username,
        };
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.accessTokenExpiresAt = (user as any).accessTokenExpiresAt;
      }

      const now = Date.now();
      const timeUntilExpiry = (token.accessTokenExpiresAt as number) - now;

      if (timeUntilExpiry < 5 * 60 * 1000) {
        console.log("⚠️ Access token expiring soon, refreshing...");
        return await refreshAccessToken(token);
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).user = token.user;
      (session as any).accessToken = token.accessToken;
      (session as any).refreshToken = token.refreshToken;
      (session as any).accessTokenExpiresAt = token.accessTokenExpiresAt;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

async function refreshAccessToken(token: any) {
  try {
    const refreshUrl =
      process.env.BACKEND_BASE_AUTH_REFRESH_PATH ||
      "http://localhost:8080/api/auth/refresh";
    console.log("🌐 Refreshing access token...");

    const res = await fetch(refreshUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refreshToken: token.refreshToken,
      }),
    });

    if (!res.ok) {
      console.error("Failed to refresh access token:", res.statusText);
      throw new Error("Failed to refresh access token");
    }

    const refreshedToken = await res.json();
    console.log("✅ Token refreshed:");

    const now = Date.now();
    const accessTokenExpiresAt = now + (refreshedToken.expiresIn ?? 0) * 1000;

    return {
      ...token,
      accessToken: refreshedToken.accessToken,
      accessTokenExpiresAt,
      refreshToken: refreshedToken.refreshToken ?? token.refreshToken,
    };
  } catch (error) {
    console.error("❌ Error refreshing access token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export { handlers, auth, signIn, signOut };
