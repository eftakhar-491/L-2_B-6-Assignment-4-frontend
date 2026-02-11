import { apiRequest, unwrap } from "./http";

export interface BackendCartMeal {
  id: string;
  title: string;
  price: number | string;
  providerProfileId: string;
}

export interface BackendVariantOption {
  id: string;
  title: string;
  priceDelta: number | string;
  variant?: {
    id: string;
    name: string;
    mealId: string;
  } | null;
}

export interface BackendCartSelectedVariant {
  variantId: string | null;
  variantName: string | null;
  optionId: string;
  optionTitle: string;
  priceDelta: number | string;
}

export interface BackendCartItemPricing {
  currency?: string | null;
  basePrice: number | string;
  variantPriceTotal: number | string;
  unitPrice: number | string;
  lineTotal: number | string;
}

export interface BackendCartItem {
  id: string;
  mealId: string;
  variantOptionId?: string | null;
  quantity: number;
  meal: BackendCartMeal;
  variantOption?: BackendVariantOption | null;
  selectedVariants?: BackendCartSelectedVariant[];
  pricing?: BackendCartItemPricing;
}

export interface BackendCartSummary {
  currency?: string | null;
  baseTotal: number | string;
  variantTotal: number | string;
  subtotal: number | string;
  itemsCount: number;
}

export interface BackendCart {
  id: string | null;
  userId: string;
  items: BackendCartItem[];
  summary?: BackendCartSummary;
}

export interface AddCartItemPayload {
  mealId: string;
  variantOptionId?: string | null;
  variantOptionIds?: string[];
  quantity?: number;
}

export interface UpdateCartItemPayload {
  quantity: number;
}

export async function fetchCart(): Promise<BackendCart> {
  const response = await apiRequest<unknown>("/api/cart", { method: "GET" });
  return unwrap(response as { data: BackendCart } | BackendCart);
}

export async function addCartItem(
  payload: AddCartItemPayload,
): Promise<BackendCartItem> {
  const response = await apiRequest<unknown>("/api/cart/items", {
    method: "POST",
    body: payload,
  });

  return unwrap(response as { data: BackendCartItem } | BackendCartItem);
}

export async function updateCartItemById(
  itemId: string,
  payload: UpdateCartItemPayload,
): Promise<BackendCartItem> {
  const response = await apiRequest<unknown>(`/api/cart/items/${itemId}`, {
    method: "PATCH",
    body: payload,
  });

  return unwrap(response as { data: BackendCartItem } | BackendCartItem);
}

export async function removeCartItem(itemId: string): Promise<{ id: string }> {
  const response = await apiRequest<unknown>(`/api/cart/items/${itemId}`, {
    method: "DELETE",
  });

  return unwrap(response as { data: { id: string } } | { id: string });
}

export async function clearCartItems(): Promise<{ cleared: boolean }> {
  const response = await apiRequest<unknown>("/api/cart/clear", {
    method: "DELETE",
  });

  return unwrap(response as { data: { cleared: boolean } } | { cleared: boolean });
}
