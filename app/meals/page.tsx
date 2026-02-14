import MealsPageClient, { type MealsQueryState } from "./MealsPageClient";

type RawSearchParams = Record<string, string | string[] | undefined>;

const toSingleValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function BrowseMealsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const resolvedSearch = await searchParams;

  const initialQuery: MealsQueryState = {
    searchTerm: toSingleValue(resolvedSearch.searchTerm) ?? "",
    categoryId: toSingleValue(resolvedSearch.categoryId) ?? "",
    dietary: toSingleValue(resolvedSearch.dietary) ?? "",
    minPrice: toSingleValue(resolvedSearch.minPrice) ?? "",
    maxPrice: toSingleValue(resolvedSearch.maxPrice) ?? "",
  };

  return <MealsPageClient initialQuery={initialQuery} />;
}
