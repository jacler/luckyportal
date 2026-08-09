# luckyportal

AI 项目门户 + Cloudflare Workers（静态 `dist` + `/portal-api`）。

## Cloudflare 部署（按这个就不会再踩坑）

### 推荐：Workers + Git

1. [Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Worker** → **Connect to Git**
2. 选 `jacler/luckyportal`
3. 填写：
   - **Build command**: `npm run build`
   - **Deploy command**: `npx wrangler deploy`
4. **Worker 名称**必须是 `luckyportal`（与 `wrangler.toml` 的 `name` 一致）
5. Deploy

### 若之前建过失败的项目

- **Pages** 项目且 Deploy 填了 `wrangler deploy` → 请删掉，按上面用 **Worker + Connect to Git** 重建  
- 或 Pages 的 Deploy command **留空**，Output directory = `dist`（仅静态站）

### 后台保存（可选）

Settings → Bindings：KV 变量名 `CONTENT`  
Variables：`ADMIN_PASSWORD`、`TOKEN_SECRET` → 再部署

## 本地

```bash
npm install
npm run dev
npm run build
npx wrangler deploy --dry-run   # 验证配置
npm run deploy                  # 需 wrangler login
```
