import express, { type Request, type Response, type NextFunction } from "express";
import { orders, users, type Order } from "./data.js";
import {
  getOrderDetailById,
  listOrderDetailIds,
  orderDetails,
  type OrderDetail,
} from "./order-details.js";

const PORT = Number.parseInt(process.env.PORT ?? "3200", 10);
const API_TOKEN = process.env.API_TOKEN ?? "mock-api-token-dev";

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token || token !== API_TOKEN) {
    res.status(401).json({
      error: "Unauthorized",
      hint: `Use Authorization: Bearer ${API_TOKEN}`,
    });
    return;
  }

  next();
}

function parsePage(query: Request["query"]) {
  const page = Math.max(1, Number.parseInt(String(query.page ?? "1"), 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(String(query.limit ?? "20"), 10) || 20));
  return { page, limit, offset: (page - 1) * limit };
}

/** 将详情记录转为列表项，便于 /v1/orders 与 /v1/orders/:id 统一查询 */
function detailToSummary(d: OrderDetail): Order {
  const statusMap: Record<OrderDetail["Order_Status"], Order["status"]> = {
    "Waiting for payment": "pending",
    "Paid and waiting for shipment": "pending",
    "Shipped and in transit": "shipped",
    Delivered: "delivered",
    Cancelled: "cancelled",
  };
  return {
    id: d.Order_ID,
    userId: "MOCK-DETAIL",
    status: statusMap[d.Order_Status] ?? "pending",
    amount: 0,
    currency: "USD",
    createdAt: d.Lastest_Updated_Time,
  };
}

function allOrdersForList(): Order[] {
  const simpleIds = new Set(orders.map((o) => o.id.toUpperCase()));
  const fromDetails = orderDetails
    .filter((d) => !simpleIds.has(d.Order_ID.toUpperCase()))
    .map(detailToSummary);
  return [...orders, ...fromDetails];
}

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "local-rest-api", version: "1.0.0" });
});

app.use("/v1", requireAuth);

app.get("/v1/users", (req, res) => {
  const { page, limit, offset } = parsePage(req.query);
  const team = req.query.team ? String(req.query.team) : undefined;
  const q = req.query.q ? String(req.query.q).toLowerCase() : undefined;

  let list = [...users];
  if (team) list = list.filter((u) => u.team === team);
  if (q) {
    list = list.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q),
    );
  }

  const items = list.slice(offset, offset + limit);
  res.json({
    total: list.length,
    page,
    limit,
    items,
    has_more: offset + items.length < list.length,
  });
});

app.get("/v1/users/:id", (req, res) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) {
    res.status(404).json({ error: "User not found", id: req.params.id });
    return;
  }
  res.json(user);
});

app.get("/v1/orders", (req, res) => {
  const { page, limit, offset } = parsePage(req.query);
  const status = req.query.status ? String(req.query.status) : undefined;
  const userId = req.query.userId ? String(req.query.userId) : undefined;

  let list = allOrdersForList();
  if (status) list = list.filter((o) => o.status === status);
  if (userId) list = list.filter((o) => o.userId === userId);
  const orderId = req.query.id ? String(req.query.id).trim() : undefined;
  if (orderId) {
    const key = orderId.toUpperCase();
    list = list.filter((o) => o.id.toUpperCase() === key);
  }

  const items = list.slice(offset, offset + limit);
  res.json({
    total: list.length,
    page,
    limit,
    items,
    has_more: offset + items.length < list.length,
  });
});

app.get("/v1/orders/:id", (req, res) => {
  const orderId = req.params.id.trim();
  const order = orders.find((o) => o.id.toUpperCase() === orderId.toUpperCase());
  if (order) {
    res.json(order);
    return;
  }

  const detail = getOrderDetailById(orderId);
  if (detail) {
    res.json(detail);
    return;
  }

  res.status(404).json({
    error: "Order not found",
    id: orderId,
    hint: "ORD-2001–ORD-2012 请用 GET /v1/GetOrderDetail?OrderID=... 或本接口（已支持详情回退）",
    available_detail_ids: listOrderDetailIds(),
  });
});

app.get("/v1/GetOrderDetail", (req, res) => {
  const orderId = req.query.OrderID ? String(req.query.OrderID) : undefined;
  if (!orderId) {
    res.status(400).json({ error: "Missing required query parameter", OrderID: "string" });
    return;
  }

  const detail = getOrderDetailById(orderId);
  if (!detail) {
    res.status(404).json({ error: "Order not found", Order_ID: orderId });
    return;
  }

  res.json(detail);
});

app.post("/v1/GetOrderDetail", (req, res) => {
  const body = req.body as { OrderID?: string };
  const orderId = body.OrderID;
  if (!orderId) {
    res.status(400).json({ error: "Missing required field", OrderID: "string" });
    return;
  }

  const detail = getOrderDetailById(orderId);
  if (!detail) {
    res.status(404).json({ error: "Order not found", Order_ID: orderId });
    return;
  }

  res.json(detail);
});

app.post("/v1/orders", (req, res) => {
  const body = req.body as Partial<Order>;
  if (!body.userId || body.amount === undefined) {
    res.status(400).json({ error: "Invalid body", required: ["userId", "amount"] });
    return;
  }

  const order: Order = {
    id: `ORD-${1000 + orders.length + 1}`,
    userId: body.userId,
    status: body.status ?? "pending",
    amount: Number(body.amount),
    currency: body.currency ?? "USD",
    createdAt: new Date().toISOString(),
  };

  orders.push(order);
  res.status(201).json(order);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`local-rest-api → http://localhost:${PORT}`);
  console.log(`  GET  /health          (no auth)`);
  console.log(`  GET  /v1/users        Bearer ${API_TOKEN}`);
  console.log(`  GET  /v1/orders`);
  console.log(`  GET  /v1/GetOrderDetail?OrderID=...`);
  console.log(`  POST /v1/GetOrderDetail`);
  console.log(`  POST /v1/orders`);
  console.log(`  (${orderDetails.length} order detail records in dataset)`);
});
