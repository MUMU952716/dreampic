import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  Configuration:
    "服务器认证配置有误。请在 Vercel 环境变量中确认 AUTH_SECRET、AUTH_URL（https://www.dreampic.site）、AUTH_GOOGLE_ID、AUTH_GOOGLE_SECRET 已正确填写并重新部署。",
  Callback:
    "Google 回调失败。请在 Google 控制台「已授权的重定向 URI」中添加 https://www.dreampic.site/api/auth/callback/google，并确认与 AUTH_URL 一致。",
  OAuthCallback: "Google 回调处理失败，请检查 Vercel 日志中 /api/auth/callback/google 的报错。",
  OAuthAccountNotLinked: "该邮箱已用其他方式注册，请用原方式登录。",
  Default: "登录过程中出错，请重试。",
};

export default async function AuthErrorPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; error_description?: string }>;
}) {
  const [{ locale }, urlParams] = await Promise.all([params, searchParams]);
  const code = urlParams.error || "Default";
  const message = ERROR_MESSAGES[code] ?? ERROR_MESSAGES.Default;
  const description = urlParams.error_description;

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign-in error / 登录错误</CardTitle>
          <CardDescription>Authentication could not be completed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground break-all">Error code: {code}</p>
          {description && (
            <p className="text-xs text-muted-foreground break-all">Detail: {description}</p>
          )}
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {message}
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href={`/${locale}/auth/signin`}>Back to sign in / 返回登录</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
