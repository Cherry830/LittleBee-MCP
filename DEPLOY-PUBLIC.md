# 公网部署指南（VPS + Docker）

使用 **Render** 等 PaaS 见 **[DEPLOY-RENDER.md](./DEPLOY-RENDER.md)**（免服务器、自动 HTTPS）。

将 **MCP** 暴露到公网（HTTPS），**REST Mock API 不对外**（仅在 Docker 内网，由 MCP 调用）。

```
Internet → https://mcp.yourdomain.com/mcp (Caddy TLS)
              → mcp-server:3100
              → rest-api:3200（内网，不暴露）
```

## 前置条件

1. 一台有 **公网 IP** 的 Linux 服务器（Ubuntu 22+ 等）
2. 已安装 [Docker](https://docs.docker.com/engine/install/) 与 Docker Compose
3. 一个域名，子域名 **A 记录** 指向服务器 IP（例如 `mcp.example.com`）
4. 安全组 / 防火墙放行：**80、443**（不要对公网开放 3100、3200）

## 1. 上传代码

```bash
# 在服务器上
git clone <你的仓库> myproject && cd myproject
# 或 scp/rsync 本仓库目录
```

## 2. 配置密钥与域名

```bash
cp .env.public.example .env.public
chmod +x scripts/generate-secrets.sh
./scripts/generate-secrets.sh   # 生成随机 token，写入 .env.public
```

编辑 `.env.public`：

```env
MCP_DOMAIN=mcp.yourdomain.com
API_TOKEN=<生成的>
MCP_ACCESS_TOKEN=<生成的>
```

## 3. 启动

```bash
docker compose -f docker-compose.public.yml --env-file .env.public up -d --build
docker compose -f docker-compose.public.yml ps
```

Caddy 会自动向 Let's Encrypt 申请证书（需域名已生效，首次约 1–2 分钟）。

## 4. 验证

```bash
curl -s "https://mcp.yourdomain.com/health"
# 应返回 internal-api-mcp-server 的 JSON
```

REST API **不应**从公网访问（未映射端口）。若需临时在服务器本机测：

```bash
docker exec local-rest-api wget -qO- http://127.0.0.1:3200/health
```

## 5. Cursor 配置

```json
{
  "mcpServers": {
    "internal-api": {
      "url": "https://mcp.yourdomain.com/mcp",
      "headers": {
        "Authorization": "Bearer <MCP_ACCESS_TOKEN>"
      }
    }
  }
}
```

保存后重载 MCP。

## 安全提醒

| 项 | 说明 |
|----|------|
| Mock 数据 | `local-rest-api` 含模拟订单数据，**勿用于生产真实业务** |
| Token | 必须使用强随机 `API_TOKEN` / `MCP_ACCESS_TOKEN` |
| 端口 | 公网只开 80/443，勿将 3200/3100 映射到 `0.0.0.0` |
| 访问范围 | 知道 URL + Token 的人均可调用，必要时加 IP 白名单（见下） |

### 可选：Caddy IP 白名单

在 `deploy/caddy/Caddyfile` 的站点块内增加（改成你的办公/家庭 IP）：

```caddy
@mcp_allowed remote_ip 1.2.3.4/32
handle @mcp_allowed {
    reverse_proxy mcp-server:3100
}
respond "Forbidden" 403
```

改完后：`docker compose -f docker-compose.public.yml restart caddy`

## 无域名 / 临时公网（开发用）

可用 [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/) 或 [ngrok](https://ngrok.com/) 将本机 `:3100` 暴露为 HTTPS，**不推荐长期生产**。

```bash
ngrok http 3100
# Cursor url 填 ngrok 给的 https://xxx.ngrok-free.app/mcp
```

## 常用运维命令

```bash
# 查看日志
docker compose -f docker-compose.public.yml logs -f mcp-server
docker compose -f docker-compose.public.yml logs -f caddy

# 更新发布
git pull
docker compose -f docker-compose.public.yml --env-file .env.public up -d --build

# 停止
docker compose -f docker-compose.public.yml down
```

## 故障排查

| 现象 | 处理 |
|------|------|
| 证书申请失败 | 确认域名 DNS 已指向本机；80 端口未被占用 |
| Cursor 连不上 | 检查 `url` 是否含 `/mcp`；Bearer 是否与 `MCP_ACCESS_TOKEN` 一致 |
| MCP 502 | `docker compose logs mcp-server`，确认 rest-api 健康 |
| 工具调 API 401 | `API_TOKEN` 在 compose 中 rest-api 与 mcp-server 须相同 |
