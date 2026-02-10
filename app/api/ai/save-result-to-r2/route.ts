import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getR2Bucket, uploadFromUrl } from '@/lib/r2';
import { log, logError } from '@/lib/logger';

function extFromUrl(url: string, type: string): string {
  try {
    const path = new URL(url).pathname;
    const m = path.match(/\.(webp|png|jpe?g|gif|mp4|webm|mov)$/i);
    if (m) return m[1].toLowerCase();
    return type === 'video' ? 'mp4' : 'png';
  } catch {
    return type === 'video' ? 'mp4' : 'png';
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { code: 401, message: '未登录' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const url = typeof body?.url === 'string' ? body.url.trim() : '';
    const type = body?.type === 'video' ? 'video' : 'image';

    if (!url) {
      return NextResponse.json(
        { code: 400, message: '缺少 url' },
        { status: 400 }
      );
    }

    const bucket = getR2Bucket();
    if (!bucket) {
      return NextResponse.json(
        { code: 500, message: '未配置 R2 (STORAGE_BUCKET / R2_BUCKET_NAME)' },
        { status: 500 }
      );
    }

    const datePrefix = new Date().toISOString().slice(0, 10);
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const ext = extFromUrl(url, type);
    const key = `generations/${type}s/${datePrefix}/${id}.${ext}`;

    const out = await uploadFromUrl(bucket, key, url);
    if (!out.success) {
      logError('[SaveResultToR2] 上传失败:', out.error);
      return NextResponse.json(
        { code: 500, message: out.error || '上传失败' },
        { status: 500 }
      );
    }

    log('[SaveResultToR2] 已存 R2:', key);
    return NextResponse.json({
      code: 1000,
      message: 'success',
      data: { url: out.publicUrl, key }
    });
  } catch (error: any) {
    logError('[SaveResultToR2] 错误:', error);
    return NextResponse.json(
      { code: 500, message: error?.message || '服务器错误' },
      { status: 500 }
    );
  }
}
