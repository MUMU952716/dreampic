import { createSupabaseServerClient } from "@/lib/supabase";
import { cookies } from "next/headers";

export default async function ServerUserProfile() {
  const supabase = createSupabaseServerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

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
