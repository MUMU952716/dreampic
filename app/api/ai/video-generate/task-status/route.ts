import { NextRequest, NextResponse } from 'next/server';
import { evolinkAxios } from '@/lib/axios-config';
import { log, logError } from '@/lib/logger';
import { auth } from '@/auth';
import { getR2Bucket, uploadFromUrl } from '@/lib/r2';

function extFromVideoUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    const m = path.match(/\.(mp4|webm|mov)$/i);
    return m ? m[1].toLowerCase() : 'mp4';
  } catch {
    return 'mp4';
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { code: 401, message: '未登录' },
        { status: 401 }
      );
    }

    const taskId = request.nextUrl.searchParams.get('taskId');
    if (!taskId) {
      return NextResponse.json(
        { code: 400, message: '缺少 taskId' },
        { status: 400 }
      );
    }

    log('[Video Task] 查询:', { user: session.user.email, taskId });

    const response = await evolinkAxios.get(`/v1/tasks/${taskId}`);
    const data = response.data;

    const status = data?.status;
    const progress = typeof data?.progress === 'number' ? data.progress : 0;
    const results = Array.isArray(data?.results) ? data.results : [];

    let videoUrl: string | undefined;
    if (status === 'completed' && results.length > 0 && typeof results[0] === 'string') {
      videoUrl = results[0];
      const bucket = getR2Bucket();
      if (bucket) {
        const datePrefix = new Date().toISOString().slice(0, 10);
        const ext = extFromVideoUrl(videoUrl);
        const key = `generations/videos/${datePrefix}/${taskId}.${ext}`;
        const out = await uploadFromUrl(bucket, key, videoUrl);
        if (out.success) {
          videoUrl = out.publicUrl;
          log('[Video Task] 已存 R2:', key);
        }
      }
    }

    const frontendStatus =
      status === 'completed' ? 'success' : status === 'failed' ? 'failed' : status === 'processing' || status === 'pending' ? status : 'pending';

    return NextResponse.json({
      code: 1000,
      message: 'success',
      data: {
        status: frontendStatus,
        videoUrl: frontendStatus === 'success' ? videoUrl : undefined,
        progress,
        error: status === 'failed' ? (data?.error?.message ?? '生成失败') : undefined,
      },
    });
  } catch (error: unknown) {
    logError('[Video Task] 查询失败:', error);
    const err = error as { response?: { status?: number; data?: { error?: { message?: string } } }; message?: string };
    const status = err.response?.status ?? 500;
    const message =
      err.response?.data?.error?.message ?? err.message ?? '查询失败';
    return NextResponse.json(
      { code: status, message, error: err.response?.data?.error },
      { status }
    );
  }
}
