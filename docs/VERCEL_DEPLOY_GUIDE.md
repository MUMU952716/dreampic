# Vercel 部署指南

按以下顺序操作即可把本项目部署到 Vercel，并绑定自定义域名。

---

## 一、部署前准备

1. **代码推到 GitHub**
   - 在项目根目录执行：`git add .` → `git commit -m "准备部署"` → `git push`
   - 确保仓库是 **public**，或你的 Vercel 账号有权限访问该私有仓库。

2. **准备生产环境变量**
   - 下面「环境变量」小节里，有一份**变量名列表**和**生产环境要改的值**。
   - 部署前在 Vercel 里把 `AUTH_URL`、`NEXT_PUBLIC_SITE_URL` 等改成你的**正式域名**，不要用 localhost。

---

## 二、Vercel 部署（按直播清单）

### 1. 创建 Vercel 项目

- 打开 [vercel.com](https://vercel.com)，登录。
- 点击 **Add New…** → **Project**（或 **Import Project**）。

### 2. 绑定 GitHub 仓库

- 在 **Import Git Repository** 里：
  - 选 **GitHub**，授权后选择你的仓库；或
  - 直接**输入仓库地址**（如 `https://github.com/你的用户名/ImagePrmoptTemplate`）。
- 选好仓库后点 **Import**。

### 3. 配置项目（重要）

- **Framework Preset**：选 **Next.js**（一般会自动识别）。
- **Root Directory**：保持默认（根目录）即可，除非你的 Next 在子目录。
- **Build Command**：默认 `next build` 或 `pnpm build` 即可（本项目用 pnpm）。
- **Output Directory**：Next 默认，不用改。

### 4. 复制环境变量

- 在 **Environment Variables** 区域，把本地的 `.env` 里的变量**一条条**填进去：
  - **Name**：变量名（如 `NEXTAUTH_SECRET`）。
  - **Value**：对应的值（从本地 `.env` 复制，**不要**把整份 `.env` 贴成一整段）。
- 生产环境**必须改**的变量：
  - `AUTH_URL` → 填你的**正式站点地址**，如 `https://你的域名.com`。
  - `NEXT_PUBLIC_SITE_URL` → 同上，如 `https://你的域名.com`。
  - 若暂时用 Vercel 默认域名，可先填 `https://你的项目.vercel.app`，后面绑自定义域名后再改一次。
- 环境选择：**Production / Preview / Development** 至少勾选 **Production**，其它按需。
- 变量列表见下方「环境变量清单」。

### 5. 开始部署

- 点击 **Deploy**。
- 等待构建和部署完成（几分钟）。

### 6. 若遇到编译错误

- 在 Vercel 的 **Deployments** 里点进失败的那次部署，查看 **Building** 日志。
- **复制完整报错信息**，发给 AI 或根据报错修改代码后重新 `git push`，Vercel 会自动重新部署。

---

## 三、环境变量清单（从 .env 复制到 Vercel）

在 Vercel 项目 **Settings → Environment Variables** 里添加下面这些**变量名**，值从本地 `.env` 复制；**生产环境**请按说明改值。

| 变量名 | 说明 | 生产环境注意 |
|--------|------|----------------|
| `NEXTAUTH_SECRET` | NextAuth 密钥 | 与本地一致即可 |
| `AUTH_SECRET` | 同左 | 与本地一致 |
| `AUTH_TRUST_HOST` | 信任 Vercel 主机 | 填 `true` |
| `AUTH_URL` | 认证回调根地址 | **改为** `https://你的域名.com` |
| `NEXT_PUBLIC_SITE_URL` | 站点公网地址 | **改为** `https://你的域名.com` |
| `DATABASE_URL` | Supabase 数据库连接串 | 与本地一致 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | 与本地一致 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名 Key | 与本地一致 |
| `AUTH_GOOGLE_ID` | Google OAuth 客户端 ID | 与本地一致 |
| `AUTH_GOOGLE_SECRET` | Google OAuth 密钥 | 与本地一致 |
| `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED` | 是否启用 Google 登录 | 填 `true` |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 Access Key | 与本地一致 |
| `R2_SECRET_ACCESS_KEY` | R2 Secret Key | 与本地一致 |
| `R2_BUCKET_NAME` | R2 桶名 | 与本地一致 |
| `R2_ENDPOINT` | R2 端点 URL | 与本地一致 |
| `EVOLINK_API_URL` | Evolink API 地址 | 与本地一致 |
| `EVOLINK_API_KEY` | Evolink API Key | 与本地一致 |

可选（不填也能跑）：

- `R2_PUBLIC_URL` 或 `STORAGE_DOMAIN`：R2 公网访问地址。
- `NEXT_PUBLIC_AI_HUB_API_URL`、`AI_HUB_APP_KEY`：仅在使用 AI Hub 视频接口时需要。

**注意**：不要将 `.env` 整段粘贴到 Vercel；每条变量单独添加，且不要在文档或截图里暴露密钥。

---

## 四、绑定自定义域名

1. 进入 Vercel 的**项目主页**（你的项目 → 顶部 **Settings** 或直接进项目）。
2. 左侧点 **Domains**（域名）。
3. 在 **Add** 输入框里输入你的域名（如 `www.你的域名.com` 或 `你的域名.com`），回车。
4. 按页面提示在域名服务商（如阿里云、Cloudflare、GoDaddy）处添加 **CNAME** 或 **A 记录**（Vercel 会给出具体记录值）。
5. 若使用根域名（如 `你的域名.com`），按 Vercel 提示配置即可（可能需 A 记录或 CNAME flattening）。
6. 生效后，回到 **Environment Variables**，把 `AUTH_URL` 和 `NEXT_PUBLIC_SITE_URL` 改为 `https://你的域名.com`（或你实际使用的域名），保存后可在 **Deployments** 里 **Redeploy** 一次，确保登录回调正确。

---

## 五、Google 登录在生产环境的设置

- 在 [Google Cloud Console](https://console.cloud.google.com/) 里，进入你的 OAuth 客户端：
  - **已授权的重定向 URI** 中增加：`https://你的域名.com/api/auth/callback/google`（以及 `https://你的项目.vercel.app/api/auth/callback/google` 若暂时用 Vercel 域名）。
- 否则生产环境点「用 Google 登录」会报错。

---

## 六、简要检查清单

- [ ] 代码已推送到 GitHub，Vercel 已导入该仓库。
- [ ] 所有必需环境变量已在 Vercel 中逐条添加，且 `AUTH_URL`、`NEXT_PUBLIC_SITE_URL` 为生产地址。
- [ ] 首次 Deploy 成功，无构建错误。
- [ ] 若使用自定义域名：已在 Domains 添加并解析成功，且已更新上述两个 URL 并 Redeploy。
- [ ] Google 登录：已配置生产环境的回调 URI。

完成以上步骤后，网站即可在 Vercel 上稳定运行；后续若有编译或运行错误，把报错贴给 AI 即可继续排查。
