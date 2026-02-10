import { NextRequest, NextResponse } from "next/server";
import { getPresignedR2Url } from "@/lib/r2";

const BUCKET = process.env.STORAGE_BUCKET || process.env.R2_BUCKET_NAME || "";

export async function GET(request: NextRequest) {
  const fileKey = request.nextUrl.searchParams.get("fileKey");
  if (!fileKey) {
    return NextResponse.json({ error: "缺少fileKey参数" }, { status: 400 });
  }

  if (!BUCKET) {
    return NextResponse.json(
      { error: "未配置 STORAGE_BUCKET 或 R2_BUCKET_NAME" },
      { status: 500 }
    );
  }

  try {
    const signedUrl = await getPresignedR2Url(BUCKET, fileKey);
    return NextResponse.json({ signedUrl });
  } catch (error) {
    console.error("预签名URL生成失败:", error);
    return NextResponse.json(
      { error: "生成预签名URL失败" },
      { status: 500 }
    );
  }
}
