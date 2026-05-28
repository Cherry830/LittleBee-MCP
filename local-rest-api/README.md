# local-rest-api

本地 Mock 内部 REST API，默认端口 **3200**。

## 启动

```bash
cd local-rest-api
npm install
npm run dev
```

## 接口

| 方法 | 路径 | 鉴权 |
|------|------|------|
| GET | `/health` | 否 |
| GET | `/v1/users` | Bearer |
| GET | `/v1/users/:id` | Bearer |
| GET | `/v1/orders` | Bearer |
| GET | `/v1/orders/:id` | Bearer（`ORD-100x` 简要信息；`ORD-200x` 自动回退为详情） |
| GET | `/v1/GetOrderDetail?OrderID=ORD-2001` | Bearer（订单详情，推荐） |
| POST | `/v1/GetOrderDetail` body `{ "OrderID": "ORD-2001" }` | Bearer |
| POST | `/v1/orders` | Bearer |

### GetOrderDetail 订单详情

查询参数或 POST body 传入 `OrderID`，返回字段包括：`Order_ID`、`Order_Status`、`Shipping_Status`、`Order_Type`、`Delivery_Mode`、`Cutoff_Time`、`Estimated_Delivery_Time`、`Actual_Delivery_Time`、`Carrier`、`Tracking_Number`、`Proof_of_Delivery`、`Special_Order_Type`、`Memo`、`Lastest_Updated_Time`。

Mock 数据集订单号：`ORD-2001` … `ORD-2012`（见 `src/order-details.ts`）。

```bash
curl -H "Authorization: Bearer mock-api-token-dev" \
  "http://localhost:3200/v1/GetOrderDetail?OrderID=ORD-2004"
```

查询参数示例：`/v1/users?page=1&team=ops&q=alice`，`/v1/orders?status=pending`

## 鉴权

```bash
export API_TOKEN=mock-api-token-dev   # 默认值，见 .env

curl -H "Authorization: Bearer mock-api-token-dev" \
  http://localhost:3200/v1/users
```

## 与 MCP 联调

若使用 `internal-api-mcp-server`，在其 `.env` 中设置：

```env
INTERNAL_API_BASE_URL=http://localhost:3200
INTERNAL_API_TOKEN=mock-api-token-dev
```
