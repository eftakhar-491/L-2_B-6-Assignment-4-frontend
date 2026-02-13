const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, "");

const API_BASE_URL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "http://localhost:5000",
);

export interface MealCardData {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId?: string;
  category: string;
  providerId: string;
  providerName: string;
  rating: number;
  reviews: number;
  dietary?: string[];
  preparationTime: number;
  variants?: Array<{
    id: string;
    name: string;
    isRequired: boolean;
    options: Array<{
      id: string;
      title: string;
      priceDelta: number;
      isDefault: boolean;
    }>;
  }>;
}

interface BackendMeal {
  id: string;
  title?: string;
  description?: string | null;
  shortDesc?: string | null;
  price?: number | string;
  providerProfile?: {
    id?: string;
    name?: string;
    rating?: number | string;
  } | null;
  images?: Array<{
    src?: string;
    isPrimary?: boolean;
  }> | null;
  categories?: Array<{
    categoryId?: string;
    category?: {
      name?: string;
    } | null;
  }> | null;
  dietaryTags?: Array<{
    dietaryPreference?: {
      name?: string;
    } | null;
  }> | null;
  reviews?: Array<{
    rating?: number;
  }> | null;
  variants?: Array<{
    id?: string;
    name?: string;
    isRequired?: boolean;
    options?: Array<{
      id?: string;
      title?: string;
      priceDelta?: number | string;
      isDefault?: boolean;
    }> | null;
  }> | null;
}

interface BackendEnvelope<T> {
  data?: T;
  result?: T;
}

const toNumber = (value: unknown, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const unwrapData = <T>(payload: BackendEnvelope<T> | T): T => {
  if (payload && typeof payload === "object") {
    const typed = payload as BackendEnvelope<T>;
    if (typed.data !== undefined) return typed.data;
    if (typed.result !== undefined) return typed.result;
  }
  return payload as T;
};

const mapMeal = (meal: BackendMeal): MealCardData => {
  const reviews = meal.reviews ?? [];
  const reviewCount = reviews.length;
  const reviewAverage =
    reviewCount > 0
      ? reviews.reduce((sum, item) => sum + toNumber(item.rating, 0), 0) /
        reviewCount
      : 0;

  const providerRating = toNumber(meal.providerProfile?.rating, 0);
  const rating = reviewAverage || providerRating;

  const image =
    meal.images?.find((item) => item.isPrimary)?.src ??
    meal.images?.[0]?.src ??
    "/placeholder.jpg";

  const category = meal.categories?.[0]?.category?.name ?? "Meal";
  const categoryId = meal.categories?.[0]?.categoryId;
  const dietary =
    meal.dietaryTags
      ?.map((item) => item.dietaryPreference?.name)
      .filter((name): name is string => Boolean(name)) ?? [];

  const variants =
    meal.variants?.map((variant) => ({
      id: variant.id ?? "",
      name: variant.name ?? "Option",
      isRequired: Boolean(variant.isRequired),
      options:
        variant.options?.map((option) => ({
          id: option.id ?? "",
          title: option.title ?? "Choice",
          priceDelta: toNumber(option.priceDelta, 0),
          isDefault: Boolean(option.isDefault),
        })) ?? [],
    })) ?? [];

  return {
    id: meal.id,
    name: meal.title ?? "Untitled meal",
    description: meal.shortDesc ?? meal.description ?? "No description provided.",
    price: toNumber(meal.price, 0),
    image,
    categoryId,
    category,
    providerId: meal.providerProfile?.id ?? "",
    providerName: meal.providerProfile?.name ?? "Unknown provider",
    rating: Number(rating.toFixed(1)),
    reviews: reviewCount,
    dietary: dietary.length ? dietary : undefined,
    preparationTime: 30,
    variants: variants.length ? variants : undefined,
  };
};

const fetchBackend = async <T>(path: string): Promise<T | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      cache: "no-store",
    });

    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

export interface FetchMealsOptions {
  page?: number;
  limit?: number;
  searchTerm?: string;
  categoryId?: string;
  dietary?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  sort?: string;
}

const buildMealsQuery = (options: FetchMealsOptions) => {
  const query = new URLSearchParams();

  if (options.page) query.set("page", String(options.page));
  if (options.limit) query.set("limit", String(options.limit));
  if (options.searchTerm) query.set("searchTerm", options.searchTerm);
  if (options.categoryId) query.set("categoryId", options.categoryId);
  if (options.dietary) query.set("dietary", options.dietary);
  if (options.minPrice !== undefined) query.set("minPrice", String(options.minPrice));
  if (options.maxPrice !== undefined) query.set("maxPrice", String(options.maxPrice));
  if (options.isFeatured !== undefined) {
    query.set("isFeatured", String(options.isFeatured));
  }
  if (options.isActive !== undefined) query.set("isActive", String(options.isActive));
  if (options.sort) query.set("sort", options.sort);

  const asString = query.toString();
  return asString ? `?${asString}` : "";
};

export const fetchMeals = async (
  options: FetchMealsOptions = {},
): Promise<MealCardData[]> => {
  const query = buildMealsQuery({
    limit: 60,
    ...options,
  });
  const payload = await fetchBackend<BackendEnvelope<BackendMeal[]>>(
    `/api/meals${query}`,
  );

  if (!payload) return [];

  const list = unwrapData(payload);
  if (!Array.isArray(list)) return [];

  return list.map(mapMeal);
};

export const fetchMealById = async (
  mealId: string,
): Promise<MealCardData | null> => {
  const payload = await fetchBackend<BackendEnvelope<BackendMeal>>(
    `/api/meals/${mealId}`,
  );

  if (!payload) return null;

  const meal = unwrapData(payload);
  if (!meal || typeof meal !== "object") return null;

  return mapMeal(meal as BackendMeal);
};
