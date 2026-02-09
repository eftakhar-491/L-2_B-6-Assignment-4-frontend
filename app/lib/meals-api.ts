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
  category: string;
  providerId: string;
  providerName: string;
  rating: number;
  reviews: number;
  dietary?: string[];
  preparationTime: number;
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
  const dietary =
    meal.dietaryTags
      ?.map((item) => item.dietaryPreference?.name)
      .filter((name): name is string => Boolean(name)) ?? [];

  return {
    id: meal.id,
    name: meal.title ?? "Untitled meal",
    description: meal.shortDesc ?? meal.description ?? "No description provided.",
    price: toNumber(meal.price, 0),
    image,
    category,
    providerId: meal.providerProfile?.id ?? "",
    providerName: meal.providerProfile?.name ?? "Unknown provider",
    rating: Number(rating.toFixed(1)),
    reviews: reviewCount,
    dietary: dietary.length ? dietary : undefined,
    preparationTime: 30,
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

export const fetchMeals = async (limit = 60): Promise<MealCardData[]> => {
  const payload = await fetchBackend<BackendEnvelope<BackendMeal[]>>(
    `/api/meals?limit=${limit}`,
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

