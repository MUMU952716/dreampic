import { NextRequest, NextResponse } from 'next/server';
import { evolinkAxios } from '@/lib/axios-config';
import { log, logError } from '@/lib/logger';
import { auth } from '@/auth';
import { getR2Bucket, getR2PublicUrl, getPresignedR2Url, uploadToR2 } from '@/lib/r2';

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
    let usedR2 = false;
    if (status === 'completed' && results.length > 0 && typeof results[0] === 'string') {
      const rawVideoUrl = results[0];
      videoUrl = rawVideoUrl;
      const bucket = getR2Bucket();
      if (bucket) {
        const datePrefix = new Date().toISOString().slice(0, 10);
        const ext = extFromVideoUrl(rawVideoUrl);
        const key = `generations/videos/${datePrefix}/${taskId}.${ext}`;
        try {
          const videoRes = await evolinkAxios.get<ArrayBuffer>(rawVideoUrl, {
            responseType: 'arraybuffer',
            timeout: 300000,
          });
          const buffer = Buffer.from(videoRes.data);
          const contentType = (videoRes.headers['content-type'] as string) || 'video/mp4';
          const out = await uploadToR2(bucket, key, buffer, contentType);
          if (out.success) {
            const publicUrl = getR2PublicUrl(key);
            videoUrl = publicUrl || (await getPresignedR2Url(bucket, key, 86400 * 7));
            usedR2 = true;
            log('[Video Task] 已存 R2:', key);
          }
        } catch (r2Err) {
          logError('[Video Task] R2 拉取/上传失败，将用代理:', r2Err);
        }
      }
      if (!usedR2 && videoUrl) {
        videoUrl = `/api/ai/video-generate/proxy?taskId=${encodeURIComponent(taskId)}`;
        log('[Video Task] 使用代理 URL 避免黑屏');
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
