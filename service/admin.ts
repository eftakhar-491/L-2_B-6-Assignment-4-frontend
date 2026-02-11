import { apiRequest, unwrap } from "./http";

export type AdminUserRole = "customer" | "provider" | "admin" | "super_admin";
export type AdminUserStatus = "active" | "blocked" | "pending" | "deleted";
export type AdminCategoryStatus = "active" | "pending" | "rejected";
export type AdminOrderStatus =
  | "placed"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";

export interface AdminPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface AdminUser {
  id: string;
  name?: string | null;
  email: string;
  phone?: string | null;
  role: AdminUserRole;
  status: AdminUserStatus;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  status: AdminCategoryStatus;
  createdByUserId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrderItemOption {
  id: string;
  priceDelta: number | string;
  variantOption?: {
    id: string;
    title: string;
  } | null;
}

export interface AdminOrderItem {
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
  options?: AdminOrderItemOption[];
}

export interface AdminOrder {
  id: string;
  userId: string;
  providerProfileId: string;
  deliveryAddressId: string;
  status: AdminOrderStatus;
  totalAmount: number | string;
  currency: string;
  paymentMethod: string;
  notes?: string | null;
  placedAt: string;
  preparedAt?: string | null;
  readyAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  providerProfile?: {
    id: string;
    name: string;
    logoSrc?: string | null;
  } | null;
  address?: {
    id: string;
    label?: string | null;
    fullAddress?: string | null;
    phone?: string | null;
  } | null;
  items: AdminOrderItem[];
}

export interface AdminProviderCategory {
  id: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface AdminProviderProfile {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
  logoSrc?: string | null;
  rating?: number | string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  categories?: AdminProviderCategory[];
}

export interface AdminListResponse<T> {
  data: T[];
  meta?: AdminPaginationMeta;
}

export interface FetchAdminUsersParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
}

export interface UpdateAdminUserStatusPayload {
  status?: AdminUserStatus;
  isActive?: boolean;
}

export interface FetchAdminOrdersParams {
  page?: number;
  limit?: number;
  status?: AdminOrderStatus;
  providerProfileId?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface FetchAdminCategoriesParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: AdminCategoryStatus;
}

export interface CreateAdminCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
}

export interface UpdateAdminCategoryPayload {
  name?: string;
  slug?: string;
  description?: string | null;
  status?: AdminCategoryStatus;
}

export interface FetchProvidersParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  categoryId?: string;
  isVerified?: boolean;
  sort?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const parseMeta = (value: unknown): AdminPaginationMeta | undefined => {
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

const parseList = <T>(payload: unknown): AdminListResponse<T> => {
  if (Array.isArray(payload)) {
    return { data: payload as T[] };
  }

  if (isRecord(payload)) {
    return {
      data: Array.isArray(payload.data) ? (payload.data as T[]) : [],
      meta: parseMeta(payload.meta),
    };
  }

  return { data: [] };
};

const toQuery = (
  params: Record<string, string | number | boolean | undefined>,
) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
    query.set(key, String(value));
  });
  return query.toString();
};

export async function fetchAdminUsers(
  params: FetchAdminUsersParams = {},
): Promise<AdminListResponse<AdminUser>> {
  const query = toQuery({
    page: params.page,
    limit: params.limit,
    searchTerm: params.searchTerm,
  });

  const response = await apiRequest<unknown>(
    `/api/admin/users${query ? `?${query}` : ""}`,
    { method: "GET" },
  );

  return parseList<AdminUser>(response);
}

export async function updateAdminUserStatus(
  userId: string,
  payload: UpdateAdminUserStatusPayload,
): Promise<AdminUser> {
  const response = await apiRequest<unknown>(`/api/admin/users/${userId}`, {
    method: "PATCH",
    body: payload,
  });

  return unwrap(response as { data: AdminUser } | AdminUser);
}

export async function fetchAdminOrders(
  params: FetchAdminOrdersParams = {},
): Promise<AdminListResponse<AdminOrder>> {
  const query = toQuery({
    page: params.page,
    limit: params.limit,
    status: params.status,
    providerProfileId: params.providerProfileId,
    userId: params.userId,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  });

  const response = await apiRequest<unknown>(
    `/api/admin/orders${query ? `?${query}` : ""}`,
    { method: "GET" },
  );

  return parseList<AdminOrder>(response);
}

export async function fetchAdminCategories(
  params: FetchAdminCategoriesParams = {},
): Promise<AdminListResponse<AdminCategory>> {
  const query = toQuery({
    page: params.page,
    limit: params.limit,
    searchTerm: params.searchTerm,
    status: params.status,
  });

  const response = await apiRequest<unknown>(
    `/api/admin/categories${query ? `?${query}` : ""}`,
    { method: "GET" },
  );

  return parseList<AdminCategory>(response);
}

export async function createAdminCategory(
  payload: CreateAdminCategoryPayload,
): Promise<AdminCategory> {
  const response = await apiRequest<unknown>("/api/admin/categories", {
    method: "POST",
    body: payload,
  });

  return unwrap(response as { data: AdminCategory } | AdminCategory);
}

export async function updateAdminCategory(
  categoryId: string,
  payload: UpdateAdminCategoryPayload,
): Promise<AdminCategory> {
  const response = await apiRequest<unknown>(
    `/api/admin/categories/${categoryId}`,
    {
      method: "PATCH",
      body: payload,
    },
  );

  return unwrap(response as { data: AdminCategory } | AdminCategory);
}

export async function deleteAdminCategory(
  categoryId: string,
): Promise<{ id: string }> {
  const response = await apiRequest<unknown>(
    `/api/admin/categories/${categoryId}`,
    {
      method: "DELETE",
    },
  );

  return unwrap(response as { data: { id: string } } | { id: string });
}

export async function fetchProviders(
  params: FetchProvidersParams = {},
): Promise<AdminListResponse<AdminProviderProfile>> {
  const query = toQuery({
    page: params.page,
    limit: params.limit,
    searchTerm: params.searchTerm,
    categoryId: params.categoryId,
    isVerified: params.isVerified,
    sort: params.sort,
  });

  const response = await apiRequest<unknown>(
    `/api/providers${query ? `?${query}` : ""}`,
    {
      method: "GET",
      skipAuth: true,
    },
  );

  return parseList<AdminProviderProfile>(response);
}

export async function verifyAdminProvider(
  providerId: string,
  isVerified: boolean,
): Promise<AdminProviderProfile> {
  const response = await apiRequest<unknown>(
    `/api/admin/providers/${providerId}/verify`,
    {
      method: "PATCH",
      body: { isVerified },
    },
  );

  return unwrap(response as { data: AdminProviderProfile } | AdminProviderProfile);
}
