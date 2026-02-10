-- 创建generations表，存储AI生成的prompt和结果
CREATE TABLE generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- 自动生成唯一ID
  prompt TEXT NOT NULL, -- AI生成的提示词
  result TEXT NOT NULL, -- AI返回的结果
  user_id UUID REFERENCES auth.users(id) NOT NULL, -- 关联Supabase Auth用户ID
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now() -- 记录创建时间
);

-- 启用行级安全（RLS），确保数据访问权限控制
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- 策略1：允许用户查看自己的生成记录
CREATE POLICY "Users can view their own generations" ON generations
  FOR SELECT USING (auth.uid() = user_id);

-- 策略2：允许用户插入自己的生成记录
CREATE POLICY "Users can insert their own generations" ON generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 策略3：允许用户更新自己的生成记录
CREATE POLICY "Users can update their own generations" ON generations
  FOR UPDATE USING (auth.uid() = user_id);

-- 策略4：允许用户删除自己的生成记录
CREATE POLICY "Users can delete their own generations" ON generations
  FOR DELETE USING (auth.uid() = user_id);
