import { Readable } from 'stream';
import { NextRequest, NextResponse } from 'next/server';
import { evolinkAxios } from '@/lib/axios-config';
import { log, logError } from '@/lib/logger';
import { auth } from '@/auth';

/**
 * 视频代理：用 Evolink 鉴权拉取视频并流式返回，避免前端直连外链导致 CORS/鉴权 黑屏。
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse(null, { status: 401 });
    }

    const taskId = request.nextUrl.searchParams.get('taskId');
    if (!taskId) {
      return new NextResponse(null, { status: 400 });
    }

    const taskRes = await evolinkAxios.get(`/v1/tasks/${taskId}`);
    const data = taskRes.data;
    const results = Array.isArray(data?.results) ? data.results : [];
    const videoUrl = results.length > 0 && typeof results[0] === 'string' ? results[0] : null;

    if (!videoUrl) {
      log('[Video Proxy] 无视频结果 taskId:', taskId);
      return new NextResponse(null, { status: 404 });
    }

    const range = request.headers.get('range');
    const headers: Record<string, string> = range ? { Range: range } : {};

    try {
      const videoRes = await evolinkAxios.get(videoUrl, {
        responseType: 'stream',
        timeout: 300000,
        headers,
        validateStatus: (s) => s >= 200 && s < 400,
      });

      const status = videoRes.status;
      if (status >= 400) {
        logError('[Video Proxy] Evolink 拉取失败:', status, videoUrl);
        return new NextResponse(null, { status });
      }

      const contentType = (videoRes.headers['content-type'] as string) || 'video/mp4';
      const resHeaders: Record<string, string> = {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      };
      const contentLength = videoRes.headers['content-length'];
      if (contentLength) resHeaders['Content-Length'] = String(contentLength);
      const acceptRanges = videoRes.headers['accept-ranges'];
      if (acceptRanges) resHeaders['Accept-Ranges'] = String(acceptRanges);
      if (status === 206 && videoRes.headers['content-range']) {
        resHeaders['Content-Range'] = String(videoRes.headers['content-range']);
      }

      const webStream = Readable.toWeb(videoRes.data as NodeJS.ReadableStream);
      return new NextResponse(webStream as unknown as ReadableStream, {
        status,
        headers: resHeaders,
      });
    } catch (axiosErr) {
      logError('[Video Proxy] axios 流式拉取失败，尝试 fetch:', axiosErr);
    }

    const apiKey = process.env.EVOLINK_API_KEY;
    const fetchHeaders: Record<string, string> = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
    if (range) fetchHeaders['Range'] = range;
    const videoRes = await fetch(videoUrl, { headers: fetchHeaders });
    if (!videoRes.ok) {
      logError('[Video Proxy] fetch 拉取失败:', videoRes.status, videoUrl);
      return new NextResponse(null, { status: videoRes.status });
    }
    const contentType = videoRes.headers.get('content-type') || 'video/mp4';
    const resHeaders: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
    };
    const contentLength = videoRes.headers.get('content-length');
    if (contentLength) resHeaders['Content-Length'] = contentLength;
    const acceptRanges = videoRes.headers.get('accept-ranges');
    if (acceptRanges) resHeaders['Accept-Ranges'] = acceptRanges;
    if (videoRes.status === 206) {
      const cr = videoRes.headers.get('content-range');
      if (cr) resHeaders['Content-Range'] = cr;
    }
    return new NextResponse(videoRes.body ?? null, {
      status: videoRes.status,
      headers: resHeaders,
    });
  } catch (error) {
    logError('[Video Proxy] 异常:', error);
    return new NextResponse(null, { status: 500 });
  }
}
