const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, "");

const API_BASE_URL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "http://localhost:5000",
);

interface BackendEnvelope<T> {
  data?: T;
  result?: T;
}

export interface ProviderSummary {
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
  categories?: Array<{
    id?: string;
    category?: {
      id?: string;
      name?: string;
      slug?: string;
    } | null;
  }>;
}

export interface ProviderMenuMeal {
  id: string;
  title: string;
  shortDesc?: string | null;
  description?: string | null;
  price: number | string;
  currency?: string;
  images?: Array<{
    id?: string;
    src?: string;
    altText?: string | null;
    isPrimary?: boolean;
  }>;
  categories?: Array<{
    id?: string;
    category?: {
      id?: string;
      name?: string;
    } | null;
  }>;
}

export interface ProviderWithMenu {
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
  categories?: Array<{
    id?: string;
    category?: {
      id?: string;
      name?: string;
      slug?: string;
    } | null;
  }>;
  meals: ProviderMenuMeal[];
}

const unwrapData = <T>(payload: BackendEnvelope<T> | T): T => {
  if (payload && typeof payload === "object") {
    const typed = payload as BackendEnvelope<T>;
    if (typed.data !== undefined) return typed.data;
    if (typed.result !== undefined) return typed.result;
  }
  return payload as T;
};

export const fetchProviderById = async (
  providerId: string,
): Promise<ProviderWithMenu | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/providers/${providerId}`, {
      cache: "no-store",
    });

    if (!response.ok) return null;
    const payload = (await response.json()) as
      | BackendEnvelope<ProviderWithMenu>
      | ProviderWithMenu;

    const provider = unwrapData(payload);
    if (!provider || typeof provider !== "object") return null;

    return provider;
  } catch {
    return null;
  }
};

export interface FetchProvidersOptions {
  page?: number;
  limit?: number;
  searchTerm?: string;
  categoryId?: string;
  isVerified?: boolean;
  sort?: string;
}

export const fetchProviders = async (
  options: FetchProvidersOptions = {},
): Promise<ProviderSummary[]> => {
  const query = new URLSearchParams();

  if (options.page) query.set("page", String(options.page));
  if (options.limit) query.set("limit", String(options.limit));
  if (options.searchTerm) query.set("searchTerm", options.searchTerm);
  if (options.categoryId) query.set("categoryId", options.categoryId);
  if (options.isVerified !== undefined) {
    query.set("isVerified", String(options.isVerified));
  }
  if (options.sort) query.set("sort", options.sort);

  const queryString = query.toString();
  const endpoint = `/api/providers${queryString ? `?${queryString}` : ""}`;

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      cache: "no-store",
    });

    if (!response.ok) return [];

    const payload = (await response.json()) as
      | BackendEnvelope<ProviderSummary[]>
      | ProviderSummary[];

    const list = unwrapData(payload);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};
