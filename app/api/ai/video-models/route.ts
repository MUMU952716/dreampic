import { NextResponse } from 'next/server';

const EVOLINK_VEO_MODELS = [
  {
    id: 'veo3.1-fast',
    name: 'Veo 3.1 Fast',
    description: 'Evolink Veo 3.1 Fast 文生视频 / 图生视频',
    maxDuration: 8,
    supportedResolutions: ['720p', '1080p', '4k'],
    supportedAspectRatios: ['16:9', '9:16', 'auto'],
    supportedAspectDuration: [8],
  },
];

export async function GET() {
  try {
    return NextResponse.json({
      code: 1000,
      message: 'success',
      data: EVOLINK_VEO_MODELS,
    });
  } catch (error) {
    console.error('[Video Models] 错误:', error);
    return NextResponse.json(
      { code: 500, message: '获取模型列表失败' },
      { status: 500 }
    );
  }
}
