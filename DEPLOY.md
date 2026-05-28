# 发布指南（本机 / 内网）

公网 HTTPS 部署见 **[DEPLOY-PUBLIC.md](./DEPLOY-PUBLIC.md)**。

## 架构

```
Cursor → host:3100/mcp (MCP) → rest-api:3200 (容器内网)
```

对外暴露两个端口：**3200**（REST）、**3100**（MCP）。

## 一键发布（本机 Node，无需 Docker）

```bash
cd /path/to/MCP
chmod +x scripts/deploy-local.sh scripts/stop-local.sh
./scripts/deploy-local.sh
```

停止：`./scripts/stop-local.sh`

## Docker 发布（服务器推荐）

需已安装 Docker：

```bash
cd /path/to/MCP
cp .env.deploy.example .env.deploy
docker compose --env-file .env.deploy up -d --build
```

## 验证

```bash
curl http://localhost:3200/health
curl -H "Authorization: Bearer mock-api-token-dev" \
  "http://localhost:3200/v1/GetOrderDetail?OrderID=ORD-2001"
curl http://localhost:3100/health
```

## Cursor 连接已发布 MCP

```json
{
  "mcpServers": {
    "internal-api": {
      "url": "http://<服务器IP或域名>:3100/mcp",
      "headers": {
        "Authorization": "Bearer mcp-dev-token"
      }
    }
  }
}
```

生产环境请修改 `.env.deploy` 中的 `API_TOKEN` 与 `MCP_ACCESS_TOKEN`。

## 常用命令

```bash
docker compose --env-file .env.deploy ps
docker compose --env-file .env.deploy logs -f
docker compose --env-file .env.deploy down
```

## 不用 Docker 时（本机 Node）

```bash
# 终端 1
cd local-rest-api && npm run build && npm start

# 终端 2
cd internal-api-mcp-server && npm run build && npm start
```

`internal-api-mcp-server/.env` 中 `INTERNAL_API_BASE_URL=http://localhost:3200`。
