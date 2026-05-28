# MCP + Mock REST API

本目录为**独立 Git 仓库**，用于 Render / 本地部署，不包含整个 MyProject。

| 项目 | 端口 | 说明 |
|------|------|------|
| [local-rest-api](./local-rest-api) | **3200** | Mock 内部 REST API |
| [internal-api-mcp-server](./internal-api-mcp-server) | **3100** | MCP 网关 |

## 本地开发

```bash
# 终端 1
cd local-rest-api && npm run dev

# 终端 2
cd internal-api-mcp-server && npm run dev
```

或：`./scripts/deploy-local.sh`

## 部署

- **Render**：见 [DEPLOY-RENDER.md](./DEPLOY-RENDER.md)（根目录 `render.yaml`）
- **VPS Docker**：见 [DEPLOY-PUBLIC.md](./DEPLOY-PUBLIC.md)

## Cursor

```json
{
  "mcpServers": {
    "internal-api": {
      "url": "http://localhost:3100/mcp",
      "headers": { "Authorization": "Bearer mcp-dev-token" }
    }
  }
}
```

生产环境 URL / Token 见 Render Dashboard。
