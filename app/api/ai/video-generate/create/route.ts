import { NextRequest, NextResponse } from 'next/server';
import { evolinkAxios } from '@/lib/axios-config';
import { log, logError } from '@/lib/logger';
import { auth } from '@/auth';

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
    const {
      prompt,
      model = 'veo3.1-fast',
      duration,
      resolution = '720p',
      aspectRatio = '16:9',
      imageUrl,
      generateAudio,
    } = body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { code: 400, message: '缺少 prompt' },
        { status: 400 }
      );
    }

    const durationNum = parseInt(String(duration), 10) || 4;
    const requestBody: Record<string, unknown> = {
      model: model === 'veo3.1-fast' ? 'veo3.1-fast' : 'veo3.1-fast',
      prompt: prompt.trim(),
      aspect_ratio: aspectRatio === '9:16' ? '9:16' : aspectRatio === '16:9' ? '16:9' : 'auto',
      quality: resolution === '4k' ? '4k' : resolution === '1080p' ? '1080p' : '720p',
      enhance_prompt: true,
      duration: durationNum,
      generate_audio: Boolean(generateAudio),
    };

    if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim()) {
      requestBody.image_urls = [imageUrl.trim()];
      requestBody.generation_type = 'FIRST&LAST';
    } else {
      requestBody.generation_type = 'TEXT';
    }

    log('[Video Create] 请求:', {
      user: session.user.email,
      model: requestBody.model,
      hasImage: !!requestBody.image_urls,
    });

    const response = await evolinkAxios.post('/v1/videos/generations', requestBody);

    log('[Video Create] 响应:', response.data);

    const taskId = response.data?.id;
    if (!taskId) {
      return NextResponse.json(
        { code: 500, message: '未返回任务 ID' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      code: 1000,
      message: 'success',
      data: { taskId },
    });
  } catch (error: unknown) {
    logError('[Video Create] 错误:', error);
    const err = error as { response?: { status?: number; data?: { error?: { message?: string } } }; message?: string };
    const status = err.response?.status ?? 500;
    const message =
      err.response?.data?.error?.message ?? err.message ?? '创建视频任务失败';
    return NextResponse.json(
      { code: status, message, error: err.response?.data?.error },
      { status }
    );
  }
}
