# 环境变量配置指南（初学者）

本文档手把手教你填好项目根目录下的 `.env` 文件，让图片生成、视频生成和 R2 存储正常工作。

---

## 第一步：找到 .env 文件

- 路径：项目根目录下的 **`.env`**（和 `package.json` 同一层）。
- 用任意文本编辑器打开即可（不要用 Word，用 VS Code、记事本等）。

---

## 第二步：按需填写各项

下面按「必须」和「可选」分开说明。**只填你打算用的功能**即可。

---

### 一、图片生成（Evolink）— 想用「文生图」就必填

| 变量名 | 是否必填 | 说明 |
|--------|----------|------|
| `EVOLINK_API_URL` | 必填 | 已写好默认值 `https://api.evolink.ai`，一般不用改。 |
| `EVOLINK_API_KEY` | 必填 | 你的 Evolink API 密钥（Token）。 |

**如何获取 EVOLINK_API_KEY：**

1. 打开 [Evolink 官网](https://www.evolink.ai/) 并登录。
2. 进入「控制台」或「API 密钥」相关页面。
3. 创建或复制一个 API Key（通常以 `sk-` 开头）。
4. 在 `.env` 里找到 `EVOLINK_API_KEY=`，在等号后面粘贴这个 Key，不要加空格和引号。

**示例：**

```env
EVOLINK_API_KEY=sk-xxxxxxxxxxxxxxxx
```

填好后保存 `.env`，重启一次本地开发服务（`pnpm dev`），再试一次「文生图」。

---

### 二、R2 存储（图片/视频存到 Cloudflare R2）

你已经在用 R2，下面四项通常已经填好：

- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_ENDPOINT`

**可选：公网直链（STORAGE_DOMAIN / R2_PUBLIC_URL）**

- 不填：生成的图片/视频会通过「临时链接」访问（预签名 URL），功能正常，链接有时效。
- 填了：可以用固定域名直接访问文件，更适合生产环境。

**如何配置 R2 公网访问：**

1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/) → R2 → 你的 Bucket。
2. 在「设置」里找到「公共访问」或「自定义域名」：
   - 若使用 R2 提供的 `*.r2.dev` 域名：开启公共访问后，会得到一个类似 `https://pub-xxx.r2.dev` 的地址。
   - 若使用自己的域名：绑定自定义域名后，得到类似 `https://cdn.yourdomain.com`。
3. 在 `.env` 里**只选其一**填写（二选一即可）：

```env
# 用 R2 的 r2.dev 域名时（把 xxx 换成你控制台里显示的）
R2_PUBLIC_URL=https://pub-xxxxxxxxxxxx.r2.dev

# 或用自定义域名
STORAGE_DOMAIN=https://cdn.yourdomain.com
```

保存后重启 `pnpm dev`。

---

### 三、视频生成（AI Hub）— 想用「视频生成」再填

| 变量名 | 是否必填 | 说明 |
|--------|----------|------|
| `NEXT_PUBLIC_AI_HUB_API_URL` | 视频功能必填 | 视频生成接口的「基础地址」（例如 `https://api.xxx.com`）。 |
| `AI_HUB_APP_KEY` | 视频功能必填 | 调用该接口用的 App Key / Token。 |

**如何获取：**

- 这两个值由**提供视频生成服务的后端/平台**给出（可能是你们公司的后端，或第三方 AI 视频 API 文档）。
- 文档里通常会写：
  - Base URL → 填到 `NEXT_PUBLIC_AI_HUB_API_URL`
  - API Key / Token → 填到 `AI_HUB_APP_KEY`

**示例：**

```env
NEXT_PUBLIC_AI_HUB_API_URL=https://your-video-api.com
AI_HUB_APP_KEY=your_app_key_here
```

如果暂时没有视频接口，可以留空，只使用图片生成和 R2 存储即可。

---

## 第三步：保存并重启

1. 编辑完 `.env` 后**保存文件**。
2. 若项目正在运行，需要**重启一次**开发服务：
   - 在终端按 `Ctrl+C` 停止。
   - 再执行：`pnpm dev`。
3. 环境变量只在启动时读取，不重启不会生效。

---

## 第四步：自检清单

- [ ] **图片生成**：已填 `EVOLINK_API_KEY`，并重启过 `pnpm dev`。
- [ ] **R2 存储**：`R2_ACCESS_KEY_ID`、`R2_SECRET_ACCESS_KEY`、`R2_BUCKET_NAME`、`R2_ENDPOINT` 已填；需要公网直链时填了 `R2_PUBLIC_URL` 或 `STORAGE_DOMAIN`。
- [ ] **视频生成**（可选）：若使用视频功能，已填 `NEXT_PUBLIC_AI_HUB_API_URL` 和 `AI_HUB_APP_KEY` 并重启。

---

## 常见问题

**Q：.env 里的内容会被提交到 Git 吗？**  
A：通常 `.env` 已在 `.gitignore` 里，不会提交。不要把 `.env` 从忽略列表移除，也不要上传到公开仓库。

**Q：填错了会怎样？**  
A：最多是接口报错（如 401、500）。把错的改回正确值，保存后重启 `pnpm dev` 即可。

**Q：EVOLINK_API_KEY 没有怎么办？**  
A：需要先注册 Evolink 账号，在控制台里创建 API Key。没有 Key 时「文生图」会报错。

**Q：视频生成的两个变量没有怎么办？**  
A：可以留空。视频生成页可能无法正常调接口，但图片生成和 R2 存储不受影响。

---

按上面步骤做完后，你就完成了「把需要的 token 放到 .env」的配置。若某一步报错，把报错信息或截图发出来，可以继续排查。
