'use client';

import { createSupabaseClient } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createSupabaseClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    // 监听用户状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  if (!user) {
    return <div>请先登录</div>;
  }

  return (
    <div>
      <h3>欢迎，{user.email}</h3>
      <p>用户ID: {user.id}</p>
    </div>
  );
}
