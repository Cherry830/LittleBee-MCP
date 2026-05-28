export interface User {
  id: string;
  name: string;
  email: string;
  team: string;
  active: boolean;
}

export interface Order {
  id: string;
  userId: string;
  status: "pending" | "shipped" | "delivered" | "cancelled";
  amount: number;
  currency: string;
  createdAt: string;
}

export const users: User[] = [
  { id: "U001", name: "Alice Chen", email: "alice.chen@weee.com", team: "ops", active: true },
  { id: "U002", name: "Bob Wang", email: "bob.wang@weee.com", team: "supply", active: true },
  { id: "U003", name: "Carol Li", email: "carol.li@weee.com", team: "fulfillment", active: false },
];

export const orders: Order[] = [
  {
    id: "ORD-1001",
    userId: "U001",
    status: "shipped",
    amount: 128.5,
    currency: "USD",
    createdAt: "2026-05-20T10:00:00Z",
  },
  {
    id: "ORD-1002",
    userId: "U002",
    status: "pending",
    amount: 45,
    currency: "USD",
    createdAt: "2026-05-27T14:30:00Z",
  },
  {
    id: "ORD-1003",
    userId: "U001",
    status: "delivered",
    amount: 299.99,
    currency: "USD",
    createdAt: "2026-05-15T08:15:00Z",
  },
];
