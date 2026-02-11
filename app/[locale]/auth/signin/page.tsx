import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SignInForm from "@/components/auth/signin-form";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: "服务器认证配置有误，请检查 AUTH_GOOGLE_ID、AUTH_GOOGLE_SECRET 与 AUTH_URL",
  Callback: "Google 回调失败，请确认 Google 控制台「已授权的重定向 URI」与站点 AUTH_URL 一致",
  Default: "登录失败，请重试",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;

  if (session) {
    redirect(params.callbackUrl || "/");
  }

  const isGoogleEnabled = !!(
    process.env.AUTH_GOOGLE_ID &&
    process.env.AUTH_GOOGLE_SECRET
  );

  const errorMessage = params.error ? (ERROR_MESSAGES[params.error] ?? ERROR_MESSAGES.Default) : undefined;
  const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || process.env.AUTH_URL || "";

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignInForm
        callbackUrl={params.callbackUrl}
        isGoogleEnabled={isGoogleEnabled}
        error={errorMessage}
        siteOrigin={siteOrigin}
      />
    </div>
  );
}
