# luckyportal

Jacler 的 AI 项目门户：Coastal Signal 风格落地页 + 管理后台。

## 本地开发

```bash
npm install
npm run dev
```

管理 API（可选）：

```bash
cd server
npm install
ADMIN_PASSWORD=LuckyAdmin2026 npm start
```

前端默认请求 `/portal-api`；本地可设 `VITE_API_BASE=http://127.0.0.1:8787`。

## 构建

```bash
npm run build
```

## 线上

- 门户：https://soulmemory.lyxl.online/
- 后台：https://soulmemory.lyxl.online/admin
