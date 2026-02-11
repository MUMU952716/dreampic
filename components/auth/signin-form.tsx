"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FcGoogle } from "react-icons/fc";
import { cn } from "@/lib/utils";

export default function SignInForm({
  callbackUrl,
  isGoogleEnabled: isGoogleEnabledProp,
  error,
  loadError,
  siteOrigin,
}: {
  callbackUrl?: string;
  isGoogleEnabled?: boolean;
  error?: string;
  loadError?: boolean;
  siteOrigin?: string;
}) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const t = useTranslations("sign_modal");
  const isGoogleEnabled =
    isGoogleEnabledProp ?? process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true";
  const callback = callbackUrl || "/";

  const handleGoogleSignIn = () => {
    setIsRedirecting(true);
    signIn("google", { callbackUrl: callback });
  };

  const handleRetry = () => {
    router.refresh();
  };

  const handleRefreshPage = () => {
    if (typeof window !== "undefined") window.location.reload();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t("sign_in_title")}</CardTitle>
        <CardDescription>{t("sign_in_description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loadError && (
          <>
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {t("load_error")}
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleRetry} className="flex-1">
                {t("retry")}
              </Button>
              <Button type="button" variant="default" onClick={handleRefreshPage} className="flex-1">
                {t("refresh_page")}
              </Button>
            </div>
          </>
        )}
        {!loadError && error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        {!loadError && isGoogleEnabled && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className={cn("w-full", isRedirecting && "pointer-events-none opacity-70")}
            onClick={handleGoogleSignIn}
            disabled={isRedirecting}
          >
            <FcGoogle className="mr-2 h-5 w-5" />
            {isRedirecting ? "Redirecting…" : "Continue with Google"}
          </Button>
        )}
        {!loadError && !isGoogleEnabled && (
          <p className="text-center text-sm text-muted-foreground">
            Google sign-in is currently disabled
          </p>
        )}
      </CardContent>
    </Card>
  );
}
