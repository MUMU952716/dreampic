"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import type { Session } from "next-auth";

export default function AuthSessionProvider({
  children,
  session,
}: {
  children: ReactNode;
  session?: Session | null;
}) {
  return (
    <SessionProvider session={session ?? undefined} basePath="/api/auth">
      {children}
    </SessionProvider>
  );
}
