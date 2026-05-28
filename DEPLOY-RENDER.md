# Render 公网部署

**可以。** Render 适合当前「REST + MCP」双服务架构：自动 HTTPS、免管证书，免费档可跑演示环境。

## 架构

```
Cursor → https://internal-api-mcp.onrender.com/mcp
              ↓（RENDER_EXTERNAL_URL）
         https://local-rest-api.onrender.com  （Bearer API_TOKEN）
```

两个 **Web Service**（见根目录 `render.yaml`）。REST 虽为公网 URL，但需 `API_TOKEN`；MCP 需 `MCP_ACCESS_TOKEN`。

## 部署步骤

### 1. 代码推到 GitHub

将本仓库（`MCP` 目录）推到 GitHub。

### 2. 创建 Blueprint

1. 打开 [Render Dashboard](https://dashboard.render.com/)
2. **New +** → **Blueprint**
3. 连接仓库，Render 会读取根目录 `render.yaml`
4. 确认创建两个服务：`local-rest-api`、`internal-api-mcp`
5. 等待首次构建（约 3–8 分钟）

### 3. 查看地址与密钥

| 服务 | 用途 | 在 Dashboard 查看 |
|------|------|-------------------|
| `local-rest-api` | Mock REST | **URL**（如 `https://local-rest-api-xxxx.onrender.com`） |
| `local-rest-api` | | **Environment → API_TOKEN**（自动生成） |
| `internal-api-mcp` | MCP | **URL** |
| `internal-api-mcp` | | **Environment → MCP_ACCESS_TOKEN**（自动生成） |

`INTERNAL_API_BASE_URL` / `INTERNAL_API_TOKEN` 会由 Blueprint 自动从 REST 服务注入，无需手填。

### 4. 验证

```bash
# REST（将 URL 和 TOKEN 换成 Dashboard 里的值）
curl -s "https://local-rest-api-xxxx.onrender.com/health"
curl -s -H "Authorization: Bearer <API_TOKEN>" \
  "https://local-rest-api-xxxx.onrender.com/v1/GetOrderDetail?OrderID=ORD-2001"

# MCP
curl -s "https://internal-api-mcp-xxxx.onrender.com/health"
```

### 5. Cursor 配置

```json
{
  "mcpServers": {
    "internal-api": {
      "url": "https://internal-api-mcp-xxxx.onrender.com/mcp",
      "headers": {
        "Authorization": "Bearer <MCP_ACCESS_TOKEN>"
      }
    }
  }
}
```

将 `xxxx` 和 Token 换成 Dashboard 中的实际值，保存后 **Reload MCP**。

## 免费档注意

| 项 | 说明 |
|----|------|
| 冷启动 | 约 15 分钟无请求会休眠，首次连接需等待 ~30s–1min |
| 流量 | 有月度额度限制，演示够用 |
| 私有网络 | 免费档两个服务均为公网 URL；要 REST **仅内网** 可升级 **Private Service**（付费） |

## 升级：REST 不暴露公网（可选）

将 `render.yaml` 里 `local-rest-api` 的 `type: web` 改为 `type: pserv`，MCP 的 `INTERNAL_API_BASE_URL` 改为：

```yaml
- key: INTERNAL_API_BASE_URL
  fromService:
    type: pserv
    name: local-rest-api
    property: hostport
```

并设置 `https://` 前缀（`hostport` 为 `host:port` 内网地址）。需 Render 付费计划支持 Private Service。

## 更新发布

推送 Git 后 Render 自动重新部署；或在 Dashboard 对各服务点 **Manual Deploy → Deploy latest commit**。

## 与 VPS + Caddy 对比

| | Render | VPS + Docker |
|--|--------|----------------|
| HTTPS | 自动 | 需 Caddy + 域名 |
| 运维 | 低 | 自管服务器 |
| 成本 | 免费档可用 |  VPS 月费 |
| 冷启动 | 有 | 无 |

其他公网方式见 [DEPLOY-PUBLIC.md](./DEPLOY-PUBLIC.md)。
