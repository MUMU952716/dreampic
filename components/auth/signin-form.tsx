"use client";

import { useState, useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FcGoogle } from "react-icons/fc";
import { cn } from "@/lib/utils";

const CANONICAL_HOST = "www.dreampic.site";
const CANONICAL_SIGNIN_ACTION = `https://${CANONICAL_HOST}/api/auth/signin/google`;

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
  const [csrfFailed, setCsrfFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [useCanonicalAction, setUseCanonicalAction] = useState(false);
  const isGoogleEnabled =
    isGoogleEnabledProp ?? process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true";

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hostname === "dreampic.site") {
      const to = `https://${CANONICAL_HOST}${window.location.pathname}${window.location.search || ""}`;
      window.location.replace(to);
      return;
    }
    const h = window.location.hostname;
    if (h === CANONICAL_HOST || h === "dreampic.site") {
      setUseCanonicalAction(true);
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    setCsrfFailed(false);
    fetch("/api/auth/csrf", {
      signal: controller.signal,
      cache: "no-store",
      credentials: "same-origin",
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        clearTimeout(timeout);
        setCsrfToken(data?.csrfToken ?? null);
      })
      .catch(() => {
        clearTimeout(timeout);
        setCsrfToken(null);
        setCsrfFailed(true);
      });
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [siteOrigin, retryCount]);

  // 只要当前是本站生产域名（www 或 无 www），一律用 www 的绝对地址提交，避免跳到无 www 被 Chrome 拦截
  const formAction =
    useCanonicalAction
      ? CANONICAL_SIGNIN_ACTION
      : siteOrigin
        ? `${siteOrigin.replace(/\/$/, "")}/api/auth/signin/google`
        : "/api/auth/signin/google";

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
              action={formAction}
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
          ) : csrfFailed ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">无法加载登录，请重试或刷新页面</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => setRetryCount((c) => c + 1)}
                >
                  重试
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => window.location.reload()}
                >
                  刷新页面
                </Button>
              </div>
            </div>
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
