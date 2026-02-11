"use client";

import { useState, useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FcGoogle } from "react-icons/fc";
import { cn } from "@/lib/utils";

const CANONICAL_HOST = "www.dreampic.site";

export default function SignInForm({
  callbackUrl,
  isGoogleEnabled: isGoogleEnabledProp,
  error,
  siteOrigin,
}: {
  callbackUrl?: string;
  isGoogleEnabled?: boolean;
  error?: string;
  siteOrigin?: string;
}) {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const isGoogleEnabled =
    isGoogleEnabledProp ?? process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true";

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hostname === "dreampic.site") {
      const to = `https://${CANONICAL_HOST}${window.location.pathname}${window.location.search || ""}`;
      window.location.replace(to);
      return;
    }
    fetch("/api/auth/csrf")
      .then((r) => r.json())
      .then((data) => setCsrfToken(data?.csrfToken ?? null))
      .catch(() => setCsrfToken(null));
  }, []);

  const callback = callbackUrl || "/";

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        {isGoogleEnabled && (
          csrfToken ? (
            <form
              method="POST"
              action="/api/auth/signin/google"
              target="_self"
              className="block"
            >
              <input type="hidden" name="csrfToken" value={csrfToken} />
              <input type="hidden" name="callbackUrl" value={callback} />
              <button
                type="submit"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}
              >
                <FcGoogle className="mr-2 h-5 w-5" />
                Continue with Google
              </button>
            </form>
          ) : (
            <Button variant="outline" className="w-full" size="lg" disabled>
              <FcGoogle className="mr-2 h-5 w-5" />
              Loading…
            </Button>
          )
        )}
        
        {!isGoogleEnabled && (
          <p className="text-center text-sm text-muted-foreground">
            Google sign-in is currently disabled
          </p>
        )}
      </CardContent>
    </Card>
  );
}
