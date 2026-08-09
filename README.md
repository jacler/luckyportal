# luckyportal

AI 项目门户 + 管理后台。已适配 Cloudflare（`wrangler deploy`）。

## Cloudflare Git 一键部署（修复报错用这套）

构建已成功时，若 Deploy 命令是 `npx wrangler deploy`，请确认仓库最新代码已包含 `worker.ts` + `[assets]` 配置。

### Workers（推荐，与 `npx wrangler deploy` 匹配）

1. Cloudflare → **Workers & Pages** → 连接 Git 仓库 `jacler/luckyportal`
2. 设置：
   - **Build command**: `npm run build`
   - **Deploy command**: `npx wrangler deploy`
3. 部署
4. （可选后台可写）Settings → Bindings：KV 变量名 `CONTENT`  
   Variables：`ADMIN_PASSWORD`、`TOKEN_SECRET` → 再部署一次

### 若你建的是 Pages 项目

把 **Deploy command 留空**（不要填 `wrangler deploy`），只保留：

- Build command: `npm run build`
- Build output directory: `dist`

Pages 会在 build 后自动上传 `dist`，并用 `functions/` 处理 API。

## 本地

```bash
npm install
npm run dev
```

预览 Cloudflare Worker：

```bash
npm run build
npx wrangler dev
```

## 脚本

| 命令 | 说明 |
|------|------|
| `npm run build` | 构建前端到 `dist/` |
| `npm run deploy` | build + `wrangler deploy` |
