export type OrderStatus =
  | "Waiting for payment"
  | "Paid and waiting for shipment"
  | "Shipped and in transit"
  | "Delivered"
  | "Cancelled";

export type ShippingStatus = "配送成功" | "配送失败" | "部分配送完成";

export type OrderType = "自营" | "商家";

export type DeliveryMode = "本地配送" | "物流配送";

export type Carrier =
  | "UPS"
  | "FedEx"
  | "USPS"
  | "S.F. Express"
  | "OnTrac"
  | "GSO(GLS US)"
  | "Better Trucks"
  | "DHL"
  | "Fedex Ground"
  | "GLS"
  | "Lasership"
  | "United Delivery Service"
  | "Amazon"
  | "Japan Post"
  | "Korea Post"
  | "Taiwan Post"
  | "UBI"
  | "YunExpress"
  | "Saia LTL Freight"
  | "Yanwen Express"
  | "China EMS"
  | "4PX"
  | "CEVA"
  | "SUNYOU"
  | "Hongkong Post"
  | "Purolator"
  | "SpeedX"
  | "SF International"
  | "Piggycars"
  | "Canada Post";

export type SpecialOrderType = "积分充值" | "礼品卡" | "会员";

export interface OrderDetail {
  Order_ID: string;
  Order_Status: OrderStatus;
  Shipping_Status: ShippingStatus;
  Order_Type: OrderType;
  Delivery_Mode: DeliveryMode;
  Cutoff_Time: string;
  Estimated_Delivery_Time: string | null;
  Actual_Delivery_Time: string | null;
  Carrier: Carrier | null;
  Tracking_Number: string | null;
  Proof_of_Delivery: string | null;
  Special_Order_Type: SpecialOrderType | null;
  Memo: string | null;
  Lastest_Updated_Time: string;
}

export const orderDetails: OrderDetail[] = [
  {
    Order_ID: "ORD-2001",
    Order_Status: "Waiting for payment",
    Shipping_Status: "配送失败",
    Order_Type: "自营",
    Delivery_Mode: "本地配送",
    Cutoff_Time: "2026-05-28T18:00:00-07:00",
    Estimated_Delivery_Time: "2026-05-29T14:00:00-07:00",
    Actual_Delivery_Time: null,
    Carrier: null,
    Tracking_Number: null,
    Proof_of_Delivery: null,
    Special_Order_Type: null,
    Memo: "用户尚未完成支付，系统自动保留库存至截单时间",
    Lastest_Updated_Time: "2026-05-28T09:15:00-07:00",
  },
  {
    Order_ID: "ORD-2002",
    Order_Status: "Paid and waiting for shipment",
    Shipping_Status: "配送失败",
    Order_Type: "自营",
    Delivery_Mode: "本地配送",
    Cutoff_Time: "2026-05-28T20:00:00-07:00",
    Estimated_Delivery_Time: "2026-05-29T16:00:00-07:00",
    Actual_Delivery_Time: null,
    Carrier: "OnTrac",
    Tracking_Number: null,
    Proof_of_Delivery: null,
    Special_Order_Type: null,
    Memo: "已支付，仓库拣货中",
    Lastest_Updated_Time: "2026-05-28T10:30:00-07:00",
  },
  {
    Order_ID: "ORD-2003",
    Order_Status: "Shipped and in transit",
    Shipping_Status: "部分配送完成",
    Order_Type: "商家",
    Delivery_Mode: "物流配送",
    Cutoff_Time: "2026-05-27T12:00:00-07:00",
    Estimated_Delivery_Time: "2026-05-30T18:00:00-07:00",
    Actual_Delivery_Time: null,
    Carrier: "FedEx",
    Tracking_Number: "794612345678",
    Proof_of_Delivery: null,
    Special_Order_Type: null,
    Memo: "多包裹订单，首包已发出，其余包裹待揽收",
    Lastest_Updated_Time: "2026-05-28T08:00:00-07:00",
  },
  {
    Order_ID: "ORD-2004",
    Order_Status: "Delivered",
    Shipping_Status: "配送成功",
    Order_Type: "自营",
    Delivery_Mode: "本地配送",
    Cutoff_Time: "2026-05-26T18:00:00-07:00",
    Estimated_Delivery_Time: "2026-05-27T14:00:00-07:00",
    Actual_Delivery_Time: "2026-05-27T13:42:00-07:00",
    Carrier: "OnTrac",
    Tracking_Number: "C1234567890123",
    Proof_of_Delivery: "https://picsum.photos/seed/ord2004-pod/640/480",
    Special_Order_Type: null,
    Memo: null,
    Lastest_Updated_Time: "2026-05-27T13:45:00-07:00",
  },
  {
    Order_ID: "ORD-2005",
    Order_Status: "Cancelled",
    Shipping_Status: "配送失败",
    Order_Type: "自营",
    Delivery_Mode: "本地配送",
    Cutoff_Time: "2026-05-25T18:00:00-07:00",
    Estimated_Delivery_Time: null,
    Actual_Delivery_Time: null,
    Carrier: null,
    Tracking_Number: null,
    Proof_of_Delivery: null,
    Special_Order_Type: null,
    Memo: "订单取消原因：用户主动取消，支付已原路退回",
    Lastest_Updated_Time: "2026-05-25T11:20:00-07:00",
  },
  {
    Order_ID: "ORD-2006",
    Order_Status: "Delivered",
    Shipping_Status: "配送成功",
    Order_Type: "商家",
    Delivery_Mode: "物流配送",
    Cutoff_Time: "2026-05-24T10:00:00-07:00",
    Estimated_Delivery_Time: "2026-05-26T20:00:00-07:00",
    Actual_Delivery_Time: "2026-05-26T19:10:00-07:00",
    Carrier: "UPS",
    Tracking_Number: "1Z999AA10123456784",
    Proof_of_Delivery: "https://picsum.photos/seed/ord2006-pod/640/480",
    Special_Order_Type: null,
    Memo: null,
    Lastest_Updated_Time: "2026-05-26T19:15:00-07:00",
  },
  {
    Order_ID: "ORD-2007",
    Order_Status: "Shipped and in transit",
    Shipping_Status: "配送失败",
    Order_Type: "自营",
    Delivery_Mode: "物流配送",
    Cutoff_Time: "2026-05-27T16:00:00-07:00",
    Estimated_Delivery_Time: "2026-05-29T12:00:00-07:00",
    Actual_Delivery_Time: null,
    Carrier: "USPS",
    Tracking_Number: "9400111899223456789012",
    Proof_of_Delivery: null,
    Special_Order_Type: null,
    Memo: "首次派送失败：收件人不在家，已安排次日重派",
    Lastest_Updated_Time: "2026-05-28T07:30:00-07:00",
  },
  {
    Order_ID: "ORD-2008",
    Order_Status: "Paid and waiting for shipment",
    Shipping_Status: "配送失败",
    Order_Type: "自营",
    Delivery_Mode: "物流配送",
    Cutoff_Time: "2026-05-28T14:00:00-07:00",
    Estimated_Delivery_Time: "2026-06-02T10:00:00-07:00",
    Actual_Delivery_Time: null,
    Carrier: "DHL",
    Tracking_Number: null,
    Proof_of_Delivery: null,
    Special_Order_Type: "礼品卡",
    Memo: "礼品卡订单，待虚拟卡密发放",
    Lastest_Updated_Time: "2026-05-28T06:00:00-07:00",
  },
  {
    Order_ID: "ORD-2009",
    Order_Status: "Delivered",
    Shipping_Status: "配送成功",
    Order_Type: "自营",
    Delivery_Mode: "本地配送",
    Cutoff_Time: "2026-05-23T18:00:00-07:00",
    Estimated_Delivery_Time: "2026-05-24T12:00:00-07:00",
    Actual_Delivery_Time: "2026-05-24T11:55:00-07:00",
    Carrier: "S.F. Express",
    Tracking_Number: "SF1234567890",
    Proof_of_Delivery: "https://picsum.photos/seed/ord2009-pod/640/480",
    Special_Order_Type: "会员",
    Memo: "会员续费订单，权益已同步至账户",
    Lastest_Updated_Time: "2026-05-24T12:00:00-07:00",
  },
  {
    Order_ID: "ORD-2010",
    Order_Status: "Cancelled",
    Shipping_Status: "配送失败",
    Order_Type: "商家",
    Delivery_Mode: "物流配送",
    Cutoff_Time: "2026-05-22T12:00:00-07:00",
    Estimated_Delivery_Time: null,
    Actual_Delivery_Time: null,
    Carrier: "Amazon",
    Tracking_Number: "TBA123456789012",
    Proof_of_Delivery: null,
    Special_Order_Type: null,
    Memo: "订单取消原因：商家缺货，客服已联系用户并全额退款",
    Lastest_Updated_Time: "2026-05-22T16:40:00-07:00",
  },
  {
    Order_ID: "ORD-2011",
    Order_Status: "Delivered",
    Shipping_Status: "部分配送完成",
    Order_Type: "商家",
    Delivery_Mode: "物流配送",
    Cutoff_Time: "2026-05-21T08:00:00-07:00",
    Estimated_Delivery_Time: "2026-05-25T18:00:00-07:00",
    Actual_Delivery_Time: "2026-05-25T17:30:00-07:00",
    Carrier: "YunExpress",
    Tracking_Number: "YT9876543210CN",
    Proof_of_Delivery: "https://picsum.photos/seed/ord2011-pod/640/480",
    Special_Order_Type: "积分充值",
    Memo: "积分已到账；部分生鲜商品因温控问题单独补发中",
    Lastest_Updated_Time: "2026-05-25T17:35:00-07:00",
  },
  {
    Order_ID: "ORD-2012",
    Order_Status: "Shipped and in transit",
    Shipping_Status: "配送成功",
    Order_Type: "自营",
    Delivery_Mode: "物流配送",
    Cutoff_Time: "2026-05-28T08:00:00-07:00",
    Estimated_Delivery_Time: "2026-06-01T15:00:00-07:00",
    Actual_Delivery_Time: null,
    Carrier: "Canada Post",
    Tracking_Number: "CA1234567890123456",
    Proof_of_Delivery: null,
    Special_Order_Type: null,
    Memo: "跨境订单，清关已完成，境内转运中",
    Lastest_Updated_Time: "2026-05-28T11:00:00-07:00",
  },
];

const orderDetailById = new Map(
  orderDetails.map((o) => [o.Order_ID.toUpperCase(), o]),
);

export function getOrderDetailById(orderId: string): OrderDetail | undefined {
  const key = orderId.trim().toUpperCase();
  return orderDetailById.get(key);
}

export function listOrderDetailIds(): string[] {
  return orderDetails.map((o) => o.Order_ID);
}
