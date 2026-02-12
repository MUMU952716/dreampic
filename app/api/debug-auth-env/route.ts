import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * 部署后访问 https://www.dreampic.site/api/debug-auth-env 可确认 Vercel 是否读到认证相关环境变量（不暴露具体密钥）。
 * 排查完请删除或禁用此路由。
 */
export async function GET() {
  const id = process.env.AUTH_GOOGLE_ID ?? "";
  const secret = process.env.AUTH_GOOGLE_SECRET ?? "";
  const authUrl = (process.env.AUTH_URL ?? "").replace(/\/$/, "");
  const hasId = id.length > 0;
  const hasSecret = secret.length > 0;
  const hasAuthUrl = authUrl.length > 0;
  return NextResponse.json({
    AUTH_GOOGLE_ID: { set: hasId, length: id.length, endsWith: id.endsWith(".apps.googleusercontent.com") ? "ok" : "unexpected" },
    AUTH_GOOGLE_SECRET: { set: hasSecret, length: secret.length, startsWith: secret.startsWith("GOCSPX-") ? "ok" : "unexpected" },
    AUTH_URL: authUrl || "(empty)",
    AUTH_SECRET_set: !!(process.env.AUTH_SECRET ?? "").trim(),
    NEXTAUTH_SECRET_set: !!(process.env.NEXTAUTH_SECRET ?? "").trim(),
    googleProviderWouldBeRegistered: hasId && hasSecret,
  });
}
