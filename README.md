# luckyportal

Cloudflare **Workers** 托管（适配「部署命令必填」的界面）。

## 正确创建方式（重要）

不要用 **Pages** 项目。请新建 **Worker**：

1. [Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Worker** → **Import a repository / Connect to Git**
2. 选 `jacler/luckyportal`
3. 填写：

| 项 | 值 |
|----|----|
| Root directory | **留空** |
| Build command | `npm run build` |
| **Deploy command** | `npx wrangler deploy` |
| Worker name | `luckyportal` |

4. 若已有失败的 **Pages** 项目 `luckyportal`，先删掉或改名，再按上面建 Worker（同名会冲突/走错类型）。

## 可选

Bindings：KV → `CONTENT`  
Vars：`ADMIN_PASSWORD`、`TOKEN_SECRET`

## 本地

```bash
npm install
npm run build
npx wrangler deploy --dry-run
```
