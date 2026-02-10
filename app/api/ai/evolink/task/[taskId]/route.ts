import { NextRequest, NextResponse } from 'next/server';
import { evolinkAxios } from '@/lib/axios-config';
import { log, logError } from '@/lib/logger';
import { auth } from '@/auth';
import { getR2Bucket, uploadFromUrl } from '@/lib/r2';

function extFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    const m = path.match(/\.(webp|png|jpe?g|gif)$/i);
    return m ? m[1].toLowerCase() : 'png';
  } catch {
    return 'png';
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { code: 401, message: '未登录' },
        { status: 401 }
      );
    }

    const { taskId } = await params;

    log('[Evolink Task] 查询任务状态:', {
      user: session.user.email,
      taskId
    });

    const response = await evolinkAxios.get(`/v1/tasks/${taskId}`);

    log('[Evolink Task] 任务状态响应:', response.data);

    const data = response.data;
    const bucket = getR2Bucket();

    if (
      bucket &&
      data?.status === 'completed' &&
      Array.isArray(data.results) &&
      data.results.length > 0
    ) {
      const datePrefix = new Date().toISOString().slice(0, 10);
      const r2Results: string[] = [];
      for (let i = 0; i < data.results.length; i++) {
        const url = data.results[i];
        if (typeof url !== 'string') {
          r2Results.push(url);
          continue;
        }
        const ext = extFromUrl(url);
        const key = `generations/images/${datePrefix}/${taskId}-${i}.${ext}`;
        const out = await uploadFromUrl(bucket, key, url);
        if (out.success) {
          r2Results.push(out.publicUrl);
          log('[Evolink Task] 已存 R2:', key);
        } else {
          logError('[Evolink Task] R2 上传失败，保留原 URL:', out.error);
          r2Results.push(url);
        }
      }
      data.results = r2Results;
    }

    return NextResponse.json({
      code: 1000,
      message: 'success',
      data
    });
  } catch (error: any) {
    logError('[Evolink Task] 查询失败:', error);
    const errorData = error.response?.data?.error || {};
    return NextResponse.json(
      {
        code: error.response?.status || 500,
        message: errorData.message || error.message || '查询失败',
        error: errorData
      },
      { status: error.response?.status || 500 }
    );
  }
}
