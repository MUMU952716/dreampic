import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * 部署后在浏览器访问 /api/debug-auth-env 可确认 Vercel 运行时是否读到 Google 相关环境变量（不暴露具体值）。
 * 排查完请删除或禁用此路由。
 */
export async function GET() {
  const hasId = !!process.env.AUTH_GOOGLE_ID;
  const hasSecret = !!process.env.AUTH_GOOGLE_SECRET;
  const hasAuthUrl = !!process.env.AUTH_URL;
  return NextResponse.json({
    AUTH_GOOGLE_ID_set: hasId,
    AUTH_GOOGLE_SECRET_set: hasSecret,
    AUTH_URL_set: hasAuthUrl,
    googleProviderWouldBeRegistered: hasId && hasSecret,
  });
}
