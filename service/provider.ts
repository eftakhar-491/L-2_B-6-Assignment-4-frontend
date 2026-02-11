import { apiRequest, unwrap } from "./http";

export interface ProviderProfileSummary {
  id: string;
  userId: string;
  name: string;
  isVerified: boolean;
}

export interface ProviderMealImage {
  id?: string;
  src: string;
  altText?: string | null;
  isPrimary?: boolean;
}

export interface ProviderMealCategory {
  id?: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface ProviderMealVariantOption {
  id?: string;
  title: string;
  priceDelta?: number | string;
  isDefault?: boolean;
}

export interface ProviderMealVariant {
  id?: string;
  name: string;
  isRequired?: boolean;
  options?: ProviderMealVariantOption[];
}

export interface ProviderMealDietaryTag {
  id?: string;
  dietaryPreference?: {
    id?: string;
    name?: string;
    slug?: string;
  } | null;
}

export interface ProviderMeal {
  id: string;
  providerProfileId: string;
  title: string;
  slug: string;
  description?: string | null;
  shortDesc?: string | null;
  price: number | string;
  currency: string;
  stock?: number | null;
  isActive: boolean;
  isFeatured: boolean;
  createdAt?: string;
  updatedAt?: string;
  images?: ProviderMealImage[];
  categories?: ProviderMealCategory[];
  variants?: ProviderMealVariant[];
  dietaryTags?: ProviderMealDietaryTag[];
}

export type ProviderOrderStatus =
  | "placed"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";

export interface ProviderOrderItemOption {
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

export interface ProviderOrderItem {
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
  options?: ProviderOrderItemOption[];
}

export interface ProviderOrder {
  id: string;
  userId: string;
  providerProfileId: string;
  deliveryAddressId: string;
  status: ProviderOrderStatus;
  totalAmount: number | string;
  currency: string;
  paymentMethod: string;
  placedAt: string;
  preparedAt?: string | null;
  readyAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  notes?: string | null;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  address?: {
    id: string;
    fullAddress: string;
    phone?: string | null;
    label?: string | null;
  } | null;
  items: ProviderOrderItem[];
}

export interface ProviderCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  status: "active" | "pending" | "rejected";
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface CreateMealVariantOptionPayload {
  title: string;
  priceDelta?: number | string;
  isDefault?: boolean;
}

export interface CreateMealVariantPayload {
  name: string;
  isRequired?: boolean;
  options?: CreateMealVariantOptionPayload[];
}

export interface CreateProviderMealPayload {
  title: string;
  slug?: string;
  description?: string;
  shortDesc?: string;
  price: number | string;
  currency?: string;
  stock?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  categoryIds?: string[];
  dietaryPreferences?: Array<{ name: string }>;
  images?: Array<{
    src: string;
    altText?: string;
    isPrimary?: boolean;
  }>;
  variants?: CreateMealVariantPayload[];
}

export interface UpdateProviderMealPayload {
  title?: string;
  slug?: string;
  description?: string;
  shortDesc?: string;
  price?: number | string;
  currency?: string;
  stock?: number | null;
  isActive?: boolean;
  isFeatured?: boolean;
  categoryIds?: string[];
  dietaryPreferences?: Array<{ name: string }>;
  images?: Array<{
    src: string;
    altText?: string;
    isPrimary?: boolean;
  }>;
  variants?: CreateMealVariantPayload[];
}

export interface UpdateProviderOrderStatusPayload {
  status: "preparing" | "ready" | "delivered";
}

export interface CreateProviderCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
}

export interface CreateProviderProfilePayload {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  website?: string;
  logoSrc?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const unwrapList = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (isRecord(payload) && Array.isArray(payload.data)) {
    return payload.data as T[];
  }
  if (isRecord(payload) && Array.isArray(payload.items)) {
    return payload.items as T[];
  }
  return [];
};

const parseMeta = (payload: unknown): PaginationMeta | undefined => {
  if (!isRecord(payload) || !isRecord(payload.meta)) return undefined;

  const page = Number(payload.meta.page);
  const limit = Number(payload.meta.limit);
  const total = Number(payload.meta.total);
  const totalPage = Number(payload.meta.totalPage);

  if (
    !Number.isFinite(page) ||
    !Number.isFinite(limit) ||
    !Number.isFinite(total) ||
    !Number.isFinite(totalPage)
  ) {
    return undefined;
  }

  return {
    page,
    limit,
    total,
    totalPage,
  };
};

const findProfileByVerification = async (
  userId: string,
  isVerified: boolean,
): Promise<ProviderProfileSummary | null> => {
  const search = new URLSearchParams({
    userId,
    isVerified: String(isVerified),
    limit: "1",
    page: "1",
    sort: "-createdAt",
  });

  const response = await apiRequest<unknown>(`/api/providers?${search}`, {
    method: "GET",
    skipAuth: true,
  });

  const profiles = unwrapList<ProviderProfileSummary>(response);
  return profiles[0] ?? null;
};

export async function findMyProviderProfile(
  userId: string,
): Promise<ProviderProfileSummary | null> {
  const verified = await findProfileByVerification(userId, true);
  if (verified) return verified;
  return findProfileByVerification(userId, false);
}

export async function createProviderProfile(
  payload: CreateProviderProfilePayload,
): Promise<ProviderProfileSummary> {
  const response = await apiRequest<unknown>("/api/provider/profile", {
    method: "POST",
    body: payload,
  });

  return unwrap(response as { data: ProviderProfileSummary } | ProviderProfileSummary);
}

const fetchProviderMealsByActiveState = async (
  providerProfileId: string,
  isActive: boolean,
): Promise<ProviderMeal[]> => {
  const search = new URLSearchParams({
    providerProfileId,
    isActive: String(isActive),
    limit: "200",
    page: "1",
    sort: "-createdAt",
  });

  const response = await apiRequest<unknown>(`/api/meals?${search}`, {
    method: "GET",
    skipAuth: true,
  });

  return unwrapList<ProviderMeal>(response);
};

export async function fetchProviderMeals(
  providerProfileId: string,
): Promise<ProviderMeal[]> {
  const [activeMeals, inactiveMeals] = await Promise.all([
    fetchProviderMealsByActiveState(providerProfileId, true),
    fetchProviderMealsByActiveState(providerProfileId, false),
  ]);

  const byId = new Map<string, ProviderMeal>();
  for (const meal of [...activeMeals, ...inactiveMeals]) {
    byId.set(meal.id, meal);
  }

  return Array.from(byId.values()).sort((a, b) => {
    const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
    const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
    return bTime - aTime;
  });
}

export async function createProviderMeal(
  payload: CreateProviderMealPayload,
): Promise<ProviderMeal> {
  const response = await apiRequest<unknown>("/api/provider/meals", {
    method: "POST",
    body: payload,
  });

  return unwrap(response as { data: ProviderMeal } | ProviderMeal);
}

export async function deleteProviderMeal(mealId: string): Promise<ProviderMeal> {
  const response = await apiRequest<unknown>(`/api/provider/meals/${mealId}`, {
    method: "DELETE",
  });

  return unwrap(response as { data: ProviderMeal } | ProviderMeal);
}

export async function updateProviderMeal(
  mealId: string,
  payload: UpdateProviderMealPayload,
): Promise<ProviderMeal> {
  const response = await apiRequest<unknown>(`/api/provider/meals/${mealId}`, {
    method: "PUT",
    body: payload,
  });

  return unwrap(response as { data: ProviderMeal } | ProviderMeal);
}

export async function fetchProviderMealById(mealId: string): Promise<ProviderMeal> {
  const response = await apiRequest<unknown>(`/api/meals/${mealId}`, {
    method: "GET",
    skipAuth: true,
  });

  return unwrap(response as { data: ProviderMeal } | ProviderMeal);
}

export async function fetchProviderOrders(params?: {
  page?: number;
  limit?: number;
  status?: ProviderOrderStatus;
}): Promise<{ data: ProviderOrder[]; meta?: PaginationMeta }> {
  const search = new URLSearchParams();
  if (params?.page) search.set("page", String(params.page));
  if (params?.limit) search.set("limit", String(params.limit));
  if (params?.status) search.set("status", params.status);

  const response = await apiRequest<unknown>(
    `/api/provider/orders${search.toString() ? `?${search}` : ""}`,
    {
      method: "GET",
    },
  );

  if (Array.isArray(response)) {
    return { data: response as ProviderOrder[] };
  }

  if (isRecord(response)) {
    const data = Array.isArray(response.data)
      ? (response.data as ProviderOrder[])
      : [];
    return {
      data,
      meta: parseMeta(response),
    };
  }

  return { data: [] };
}

export async function updateProviderOrderStatus(
  orderId: string,
  payload: UpdateProviderOrderStatusPayload,
): Promise<ProviderOrder> {
  const response = await apiRequest<unknown>(`/api/provider/orders/${orderId}`, {
    method: "PATCH",
    body: payload,
  });

  return unwrap(response as { data: ProviderOrder } | ProviderOrder);
}

export async function fetchProviderCategories(params?: {
  page?: number;
  limit?: number;
  status?: "active" | "pending" | "rejected";
}): Promise<{ data: ProviderCategory[]; meta?: PaginationMeta }> {
  const search = new URLSearchParams();
  if (params?.page) search.set("page", String(params.page));
  if (params?.limit) search.set("limit", String(params.limit));
  if (params?.status) search.set("status", params.status);

  const response = await apiRequest<unknown>(
    `/api/provider/categories${search.toString() ? `?${search}` : ""}`,
    {
      method: "GET",
    },
  );

  if (Array.isArray(response)) {
    return { data: response as ProviderCategory[] };
  }

  if (isRecord(response)) {
    const data = Array.isArray(response.data)
      ? (response.data as ProviderCategory[])
      : [];
    return {
      data,
      meta: parseMeta(response),
    };
  }

  return { data: [] };
}

export async function createProviderCategory(
  payload: CreateProviderCategoryPayload,
): Promise<ProviderCategory> {
  const response = await apiRequest<unknown>("/api/provider/categories", {
    method: "POST",
    body: payload,
  });

  return unwrap(response as { data: ProviderCategory } | ProviderCategory);
}
