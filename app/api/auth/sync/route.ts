import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * GET /api/auth/sync
 * 将 NextAuth session 同步为 AppContext 使用的格式（兼容原 aiHubToken 逻辑）
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ code: 0, message: "No session" }, { status: 200 });
    }

    const u = session.user as any;
    const user = {
      id: u.uuid || u.id || u.email,
      uuid: u.uuid || u.id || u.email,
      email: u.email || "",
      nickname: u.nickname || u.name || "User",
      name: u.name || u.nickname || u.email,
      avatar_url: u.avatar_url || u.image || "",
      avatar: u.avatar_url || u.image || "",
      credits: u.credits ?? 0,
      created_at: u.created_at || new Date().toISOString(),
      invited_by: u.invited_by ?? null,
    };

    return NextResponse.json({
      code: 1000,
      message: "success",
      data: {
        user,
        aiHubToken: `nextauth-${user.id}`,
        refreshToken: "",
        expire: 2592000,
        refreshExpire: 2592000,
      },
    });
  } catch (e) {
    console.error("[api/auth/sync]", e);
    return NextResponse.json({ code: 0, message: "Sync failed" }, { status: 200 });
  }
}
