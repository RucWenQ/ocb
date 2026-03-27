# OCB 实验系统（前后端可部署版）

本项目已拆分为：
- 前端：React + Vite（`src/`）
- 后端：Node + Express（`server/index.mjs`）

前端所有数据提交统一走 `/api/*`，开发和生产路径一致。

## 1. 安装依赖

```bash
npm install
```

## 2. 本地开发

```bash
npm run dev
```

该命令会同时启动：
- 前端开发服务：`http://localhost:5173`
- 后端 API：`http://127.0.0.1:8787`

Vite 已配置代理，前端请求 `/api/*` 会自动转发到后端。

## 3. 生产部署

```bash
npm run build
npm run start
```

`start` 会启动后端服务，并在 `dist/` 存在时同时托管前端静态文件。

## 4. 数据存储位置

默认落盘目录：`data/`

- 手机号去重库：`data/registered-phones.json`
- 页面提交日志：`data/submissions.jsonl`
- 最终提交日志：`data/final-submissions.jsonl`

## 5. 环境变量

参考 `.env.example`：

- `PORT` / `BACKEND_PORT`：后端端口（默认 `8787`）
- `DATA_DIR`：后端数据目录（默认 `./data`）
- `CORS_ORIGIN`：跨域时允许的前端域名（可留空）
- `QWEN_*`：后端大模型调用配置（生产推荐）
- `VITE_QWEN_*`：兼容旧配置（后端会自动兜底读取）
- `VITE_PHONE_CHECK_ENDPOINT`：手机号查重接口（默认 `/api/participants/check-phone`）

## 6. 历史手机号导入

从旧的 `jsonl` 中提取 `demographics.phone` 并写入去重库：

```bash
npm run import:phones -- "d:\\Downloads\\S2W3exp.jsonl"
```

## 7. 当前后端接口

- `GET /api/health`
- `GET /api/participants/check-phone?phone=11位手机号`
- `POST /api/submit`
- `POST /api/final-submit`

`/api/submit` 在接收 `pageId=consent` 时会自动把手机号写入去重库。
