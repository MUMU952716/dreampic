import NextAuth, { Account, Profile, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { getUuid } from "@/lib/hash";
import { getIsoTimestr } from "@/lib/time";
import { getClientIp } from "@/lib/ip";

const GOOGLE_ENABLED = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true";
const GOOGLE_ONE_TAP_ENABLED = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ONE_TAP_ENABLED === "true";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // Google One Tap Provider
    ...(GOOGLE_ONE_TAP_ENABLED
      ? [
          Credentials({
            id: "google-one-tap",
            name: "Google One Tap",
            credentials: {
              credential: { label: "Credential", type: "text" },
            },
            async authorize(credentials) {
              const token = credentials.credential as string;

              if (!token) {
                console.error("[Google One Tap] No credential provided");
                return null;
              }

              try {
                console.log("[Google One Tap] Verifying token...");
                // Verify the Google ID token
                const response = await fetch(
                  `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`
                );

                if (!response.ok) {
                  console.error("[Google One Tap] Failed to verify token, status:", response.status);
                  return null;
                }

                const payload = await response.json();
                console.log("[Google One Tap] Token verified for user:", payload.email);

                if (!payload || !payload.email) {
                  console.error("[Google One Tap] Invalid token payload");
                  return null;
                }

                // Return user object (will be processed in jwt callback)
                return {
                  id: payload.sub,
                  email: payload.email,
                  name: payload.name,
                  image: payload.picture,
                  emailVerified: payload.email_verified,
                } as User;
              } catch (error) {
                console.error("[Google One Tap] Error verifying token:", error);
                return null;
              }
            },
          }),
        ]
      : []),

    // Standard Google OAuth Provider
    ...(GOOGLE_ENABLED && process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            authorization: {
              params: {
                prompt: "consent",
                access_type: "offline",
                response_type: "code",
              },
            },
          }),
        ]
      : []),
  ],

  callbacks: {
    async redirect({ url, baseUrl }) {
      const base = (process.env.AUTH_URL || baseUrl).replace(/\/$/, "");
      if (url.startsWith("/")) return `${base}${url}`;
      try {
        const u = new URL(url);
        const sameOrigin = u.origin === new URL(baseUrl).origin || u.origin === new URL(base + "/").origin;
        if (sameOrigin) return url;
      } catch {
        // ignore
      }
      return base;
    },
    async jwt({
      token,
      user,
      account,
    }: {
      token: JWT;
      user?: User;
      account?: Account | null;
      profile?: Profile;
    }) {
      if (account && user?.email) {
        try {
          let signin_ip = "127.0.0.1";
          try {
            signin_ip = await getClientIp();
          } catch {
            // ignore IP failure, keep default
          }
          const now = getIsoTimestr();
          token.user = {
            uuid: getUuid(),
            email: user.email,
            nickname: user.name || user.email.split("@")[0] || "User",
            avatar_url: user.image || "",
            signin_provider: account.provider,
            created_at: now,
            name: user.name ?? undefined,
            image: user.image ?? undefined,
          };
        } catch (error) {
          console.error("[NextAuth JWT] Error in jwt callback:", error);
          token.user = {
            uuid: getUuid(),
            email: user.email,
            nickname: user.name || user.email?.split("@")[0] || "User",
            avatar_url: user.image || "",
            signin_provider: account?.provider ?? "google",
            created_at: getIsoTimestr(),
            name: user.name ?? undefined,
            image: user.image ?? undefined,
          };
        }
      }
      return token;
    },

    async session({ session, token }: { session: any; token: JWT }) {
      // Add user info from token to session
      if (token.user) {
        session.user = {
          ...token.user,
          // 确保 image 字段存在，用于显示头像
          image: (token.user as any).avatar_url || (token.user as any).image,
          name: (token.user as any).nickname || (token.user as any).name || 'User',
        };
        console.log("[NextAuth Session] User loaded:", session.user.email);
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },

  session: {
    strategy: "jwt",
  },

  cookies: (() => {
    const domain = process.env.AUTH_COOKIE_DOMAIN;
    if (!domain) return undefined;
    return {
      sessionToken: {
        options: {
          domain,
        },
      },
    };
  })(),

  secret: process.env.AUTH_SECRET,
  trustHost: true,
});
