# Vercel 部署 + Google 登录配置清单

部署到 Vercel 并解析域名 **www.dreampic.site** 后，按下面步骤配置即可恢复登录。

---

## 一、Vercel 环境变量

在 **Vercel 项目 → Settings → Environment Variables** 中，为 **Production**（以及需要时 Preview）添加：

| 变量名 | 说明 | 填写值 |
|--------|------|--------|
| `AUTH_SECRET` | NextAuth 加密密钥 | 同 `.env` 中的 `AUTH_SECRET`，或 `openssl rand -base64 32` 生成 |
| `AUTH_URL` | 站点根地址（必填），不要带尾部 `/`；必须用 **www**：`https://www.dreampic.site`，若误填为 `https://dreampic.site` 会导致 `/api/auth/session` 重定向循环（ERR_TOO_MANY_REDIRECTS），代码中已做自动修正 | `https://www.dreampic.site` |
| `AUTH_GOOGLE_ID` | Google OAuth 客户端 ID | 同 `.env` 中的值 |
| `AUTH_GOOGLE_SECRET` | Google OAuth 客户端密钥 | 同 `.env` 中的值 |
| `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED` | 是否启用 Google 登录 | `true` |
| `NEXT_PUBLIC_AUTH_GOOGLE_ID` | 前端用，与上面 ID 一致 | 同 `AUTH_GOOGLE_ID` |
| `NEXT_PUBLIC_SITE_URL` | 前端用站点地址（可选） | `https://www.dreampic.site` |

改完环境变量后需 **Redeploy** 一次才会生效。若曾填过 `NEXTAUTH_URL`，也请改为 `https://www.dreampic.site`，否则会和 `AUTH_URL` 一样导致重定向循环；代码已对 `AUTH_URL` / `NEXTAUTH_URL` 做自动修正（无 www → 有 www），但**强烈建议在 Vercel 里直接改为 www 并 Redeploy**。

---

## 二、Google Cloud Console 重定向 URI

1. 打开 [Google Cloud Console](https://console.cloud.google.com/) → 选择你的项目。
2. 进入 **APIs & Services** → **Credentials** → 打开你用的 **OAuth 2.0 客户端 ID**（Web 应用）。
3. 在 **已授权的重定向 URI** 中新增：

```
https://www.dreampic.site/api/auth/callback/google
```

4. 保存。无需重新部署，保存后立即生效。

---

## 三、本地开发（可选）

本地 `.env` 保持：

- `AUTH_URL=http://localhost:3007`
- `AUTH_GOOGLE_ID`、`AUTH_GOOGLE_SECRET` 与 Vercel 一致

Google 控制台里 **已授权的重定向 URI** 需包含：

```
http://localhost:3007/api/auth/callback/google
```

---

## 四、检查是否生效

1. Vercel 环境变量保存后 → 在 Vercel 里点 **Redeploy**。
2. 用无痕窗口访问：`https://www.dreampic.site/en/auth/signin`，点击「Continue with Google」。
3. 若仍报错，到 Vercel → **Deployments** → 最新部署 → **Functions** / 运行日志里看具体错误信息。

---

## 五、点击登录后闪一下又回到登录页 / 控制台出现 fetchError、521

- **原因**：浏览器扩展（如 **Immersive Translate**）会代理或改写请求，当扩展的服务器返回 521 时，登录流程拿到的不是正常 API 响应，导致失败并回到登录页。
- **处理**：
  1. 用 **无痕/隐私模式**（扩展默认关闭）再试一次登录。
  2. 或暂时 **关闭 Immersive Translate** 等会代理页面的扩展后，再点「Continue with Google」。
- 建议始终用 **https://www.dreampic.site** 访问站点；若从 `dreampic.site`（无 www）访问，站点会自动跳转到带 www 的地址。

---

## 六、localhost 能登录但域名不能登录

1. **必须用带 www 的地址登录**  
   在浏览器里直接打开：`https://www.dreampic.site/en/auth/signin`，不要用 `dreampic.site`（无 www）。若从无 www 打开，应会自动跳到 www；若没有跳转，说明当前访问的仍是旧部署或中间件未生效。

2. **确认 Vercel 环境变量**  
   在 Vercel → Settings → Environment Variables 里必须有（且改完后要 **Redeploy**）：
   - `AUTH_URL` = `https://www.dreampic.site`
   - `NEXT_PUBLIC_SITE_URL` = `https://www.dreampic.site`
   - `AUTH_GOOGLE_ID`、`AUTH_GOOGLE_SECRET` 与本地一致

3. **若按钮一直是「Loading…」**  
   说明页面上拿不到 CSRF，请求 `/api/auth/csrf` 可能失败。在域名上打开 `https://www.dreampic.site/api/auth/csrf`，看是否返回 `{"csrfToken":"..."}`；若报错或 500，到 Vercel → Deployments → 最新部署 → Functions 看日志。

4. **若点完跳到 Google 再报 redirect_uri_mismatch**  
   说明 Google 控制台里「已授权的重定向 URI」还没有 `https://www.dreampic.site/api/auth/callback/google`，或刚保存尚未生效（可等几分钟再试）。
