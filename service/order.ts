import { apiRequest, unwrap } from "./http";

export type OrderStatus =
  | "placed"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";

export interface BackendOrderProvider {
  id: string;
  name: string;
  logoSrc?: string | null;
}

export interface BackendOrderAddress {
  id: string;
  label?: string | null;
  fullAddress: string;
  phone?: string | null;
}

export interface BackendOrderItemOption {
  id: string;
  priceDelta: number | string;
  variantOption?: {
    id: string;
    title: string;
    variant?: {
      id: string;
      name: string;
    } | null;
  } | null;
}

export interface BackendOrderItem {
  id: string;
  mealId: string;
  quantity: number;
  unitPrice: number | string;
  subtotal: number | string;
  meal?: {
    id: string;
    title: string;
    price: number | string;
  } | null;
  options?: BackendOrderItemOption[];
}

export interface BackendOrder {
  id: string;
  userId: string;
  providerProfileId: string;
  deliveryAddressId: string;
  status: OrderStatus;
  totalAmount: number | string;
  currency: string;
  paymentMethod: string;
  notes?: string | null;
  placedAt: string;
  preparedAt?: string | null;
  readyAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  providerProfile?: BackendOrderProvider | null;
  address?: BackendOrderAddress | null;
  items: BackendOrderItem[];
}

export interface OrderListMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface FetchOrdersResult {
  data: BackendOrder[];
  meta?: OrderListMeta;
}

export interface CreateOrderPayload {
  providerProfileId: string;
  deliveryAddressId: string;
  paymentMethod?: "cash_on_delivery";
  notes?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const parseMeta = (value: unknown): OrderListMeta | undefined => {
  if (!isRecord(value)) return undefined;

  const page = Number(value.page);
  const limit = Number(value.limit);
  const total = Number(value.total);
  const totalPage = Number(value.totalPage);

  if (
    !Number.isFinite(page) ||
    !Number.isFinite(limit) ||
    !Number.isFinite(total) ||
    !Number.isFinite(totalPage)
  ) {
    return undefined;
  }

  return { page, limit, total, totalPage };
};

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<BackendOrder> {
  const response = await apiRequest<unknown>("/api/orders", {
    method: "POST",
    body: payload,
  });

  return unwrap(response as { data: BackendOrder } | BackendOrder);
}

export async function fetchMyOrders(params?: {
  page?: number;
  limit?: number;
}): Promise<FetchOrdersResult> {
  const search = new URLSearchParams();
  if (params?.page) search.set("page", String(params.page));
  if (params?.limit) search.set("limit", String(params.limit));
  const query = search.toString();

  const response = await apiRequest<unknown>(
    `/api/orders${query ? `?${query}` : ""}`,
    {
      method: "GET",
    },
  );

  if (Array.isArray(response)) {
    return { data: response as BackendOrder[] };
  }

  if (isRecord(response)) {
    const list = Array.isArray(response.data)
      ? (response.data as BackendOrder[])
      : [];
    return {
      data: list,
      meta: parseMeta(response.meta),
    };
  }

  return { data: [] };
}

export async function fetchOrderById(orderId: string): Promise<BackendOrder> {
  const response = await apiRequest<unknown>(`/api/orders/${orderId}`, {
    method: "GET",
  });

  return unwrap(response as { data: BackendOrder } | BackendOrder);
}

export async function cancelOrder(orderId: string): Promise<BackendOrder> {
  const response = await apiRequest<unknown>(`/api/orders/cancel/${orderId}`, {
    method: "PATCH",
  });

  return unwrap(response as { data: BackendOrder } | BackendOrder);
}
