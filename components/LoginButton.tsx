'use client';

import { createSupabaseClient } from '@/lib/supabase';

export default function LoginButton() {
  const supabase = createSupabaseClient();

  const handleGoogleLogin = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`, // 登录成功后的回调地址
        },
      });
    } catch (error) {
      console.error('Google登录失败:', error);
      alert('登录失败，请稍后重试');
    }
  };

  return (
    <button onClick={handleGoogleLogin} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
      用Google登录
    </button>
  );
}
