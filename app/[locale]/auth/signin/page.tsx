import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import SignInForm from "@/components/auth/signin-form";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: "服务器认证配置有误，请检查 AUTH_GOOGLE_ID、AUTH_GOOGLE_SECRET 与 AUTH_URL",
  Callback: "Google 回调失败，请确认 Google 控制台「已授权的重定向 URI」与站点 AUTH_URL 一致",
  Default: "登录失败，请重试",
};

export default async function SignInPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const hostname = host.split(":")[0].toLowerCase();
  if (hostname === "dreampic.site") {
    const { locale } = await params;
    const sp = await searchParams;
    const q = new URLSearchParams();
    if (sp.callbackUrl) q.set("callbackUrl", sp.callbackUrl);
    if (sp.error) q.set("error", sp.error);
    const qs = q.toString();
    redirect(`https://www.dreampic.site/${locale}/auth/signin${qs ? `?${qs}` : ""}`);
  }

  let session = null;
  try {
    session = await auth();
  } catch (e) {
    console.error("[SignInPage] auth() failed:", e);
    const paramsResolved = await searchParams;
    return (
      <div className="flex min-h-screen items-center justify-center">
        <SignInForm
          callbackUrl={paramsResolved.callbackUrl}
          isGoogleEnabled={!!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET)}
          loadError
          siteOrigin={process.env.NEXT_PUBLIC_SITE_URL || process.env.AUTH_URL || ""}
        />
      </div>
    );
  }

  const paramsResolved = await searchParams;

  if (session) {
    redirect(paramsResolved.callbackUrl || "/");
  }

  const isGoogleEnabled = !!(
    process.env.AUTH_GOOGLE_ID &&
    process.env.AUTH_GOOGLE_SECRET
  );

  const errorMessage = paramsResolved.error ? (ERROR_MESSAGES[paramsResolved.error] ?? ERROR_MESSAGES.Default) : undefined;
  const rawOrigin = process.env.NEXT_PUBLIC_SITE_URL || process.env.AUTH_URL || "";
  const siteOrigin =
    rawOrigin.replace(/\/$/, "") === "https://dreampic.site"
      ? "https://www.dreampic.site"
      : rawOrigin;

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignInForm
        callbackUrl={paramsResolved.callbackUrl}
        isGoogleEnabled={isGoogleEnabled}
        error={errorMessage}
        siteOrigin={siteOrigin}
      />
    </div>
  );
}
