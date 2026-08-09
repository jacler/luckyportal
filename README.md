# luckyportal

AI 项目门户（Coastal Signal）+ 管理后台。已适配 **Cloudflare Pages** 一键托管：连接本仓库即可上线。

## Cloudflare Pages（推荐）

1. 打开 [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. 选择仓库 **`jacler/luckyportal`**
3. 构建设置：
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`（默认）
4. **Save and Deploy**
5. （可选，后台可写）部署完成后：
   - **Settings → Bindings → KV Namespace**：添加绑定，变量名必须是 `CONTENT`（新建一个 KV 即可）
   - **Settings → Environment variables**：
     - `ADMIN_PASSWORD` = 你的后台密码
     - `TOKEN_SECRET` = 任意长随机串
   - 重新 **Retry deployment**
6. 访问：
   - 门户：`https://<你的项目>.pages.dev/`
   - 后台：`https://<你的项目>.pages.dev/admin`

未绑定 KV 时，前台仍会显示默认项目内容；后台登录可用，但保存会提示先绑定 `CONTENT`。

本地用 Wrangler 预览（可选）：

```bash
npm install
npm run build
npx wrangler pages dev dist
```

## 本地开发（VPS / Express 版 API）

```bash
npm install
npm run dev
```

另开 API：

```bash
cd server
npm install
ADMIN_PASSWORD=LuckyAdmin2026 npm start
```

## 脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 本地前端 |
| `npm run build` | 产出 `dist/`（Pages 构建命令） |
| `npm run pages:deploy` | 本地构建并部署到 Cloudflare Pages |

## 目录

- `src/` 门户与 `/admin` 前台
- `functions/portal-api/` Cloudflare Pages Functions（`/portal-api/*`）
- `server/` 可选的 Node/Express API（自建服务器用）
