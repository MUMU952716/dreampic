import { NextRequest, NextResponse } from "next/server";
import { uploadToR2 } from "@/lib/r2";

const BUCKET = process.env.STORAGE_BUCKET || process.env.R2_BUCKET_NAME || "";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "未上传文件" }, { status: 400 });
    }

    if (!BUCKET) {
      return NextResponse.json(
        { error: "未配置 STORAGE_BUCKET 或 R2_BUCKET_NAME" },
        { status: 500 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileKey = `${Date.now()}-${file.name}`;

    const result = await uploadToR2(BUCKET, fileKey, buffer, file.type);

    if (result.success) {
      return NextResponse.json({
        message: "文件上传成功",
        fileKey,
      });
    }
    return NextResponse.json(
      { error: result.error || "上传失败" },
      { status: 500 }
    );
  } catch (error) {
    console.error("API处理错误:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
