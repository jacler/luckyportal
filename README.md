# luckyportal

AI 项目门户（React + Vite）+ Cloudflare Workers API。

## Cloudflare 一键部署（务必按这个）

### 1. 创建 / 连接方式

用 **Workers**（不是旧版 Pages 自定义 Deploy）：

1. [Workers & Pages](https://dash.cloudflare.com/) → **Create** → **Worker** → **Connect to Git**
2. 选仓库 `jacler/luckyportal`
3. 设置：
   - **Build command**: `npm run build`
   - **Deploy command**: `npx wrangler deploy`
4. **Worker 名称必须是 `luckyportal`**（和 `wrangler.toml` 里 `name` 一致，否则必失败）

### 2. 若你之前建错了项目

- 若项目类型是 **Pages**，且 Deploy 填了 `wrangler deploy` → 会反复失败。  
  请 **删掉该 Pages 项目**，按上面重新用 **Workers + Connect to Git** 建一次。
- 或把 Pages 的 **Deploy command 清空**，Output directory 填 `dist`（仅静态，后台 API 需改用本仓库最新 Workers 方案）。

### 3. 后台可写（可选）

Settings → Bindings：KV，变量名 **`CONTENT`**  
Variables：`ADMIN_PASSWORD`、`TOKEN_SECRET` → 再部署。

## 本地

```bash
npm install
npm run dev
npm run deploy   # 需已登录 wrangler
```
