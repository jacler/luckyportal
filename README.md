# luckyportal

AI 项目门户。目标托管：**Cloudflare Pages**（不是 Workers `wrangler deploy`）。

## 你现在的报错原因

日志里这句是关键：

> run `wrangler deploy` on a **Pages** project → 应使用 `wrangler pages deploy`

所以 Deploy 命令不能填 `npx wrangler deploy`。

## Dashboard 正确设置（Pages）

1. Workers & Pages → 你的 **Pages** 项目 → **Settings** → **Builds**
2. 改成：

| 项 | 值 |
|----|----|
| Build command | `npm run build` |
| Build output directory | `dist` |
| **Deploy command** | **清空留空** |

3. 若界面强制要填 Deploy command，填：

```text
npx wrangler pages deploy dist
```

4. Save → **Retry deployment**

## 可选：后台可写

Settings → Functions → Bindings：KV，变量名 `CONTENT`  
Environment variables：`ADMIN_PASSWORD`、`TOKEN_SECRET`

## 本地

```bash
npm install
npm run dev
npm run build
```
