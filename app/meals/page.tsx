import Link from "next/link";
import { Search, Star } from "lucide-react";

import { Navigation } from "@/app/components/Navigation";
import Footer from "@/app/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchMeals } from "@/app/lib/meals-api";

type RawSearchParams = Record<string, string | string[] | undefined>;

const toSingleValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const parsePrice = (value?: string) => {
  if (!value?.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

const toDietarySlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const buildMealsHref = (params: {
  searchTerm?: string;
  categoryId?: string;
  dietary?: string;
  minPrice?: string;
  maxPrice?: string;
}) => {
  const query = new URLSearchParams();

  if (params.searchTerm?.trim()) query.set("searchTerm", params.searchTerm.trim());
  if (params.categoryId?.trim()) query.set("categoryId", params.categoryId.trim());
  if (params.dietary?.trim()) query.set("dietary", params.dietary.trim());
  if (params.minPrice?.trim()) query.set("minPrice", params.minPrice.trim());
  if (params.maxPrice?.trim()) query.set("maxPrice", params.maxPrice.trim());

  const asString = query.toString();
  return asString ? `/meals?${asString}` : "/meals";
};

export default async function BrowseMealsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const resolvedSearch = await searchParams;

  const searchTerm = toSingleValue(resolvedSearch.searchTerm) ?? "";
  const selectedCategoryId = toSingleValue(resolvedSearch.categoryId) ?? "";
  const dietaryParam = toSingleValue(resolvedSearch.dietary) ?? "";
  const selectedDietarySlug = toDietarySlug(dietaryParam);
  const minPriceInput = toSingleValue(resolvedSearch.minPrice) ?? "";
  const maxPriceInput = toSingleValue(resolvedSearch.maxPrice) ?? "";
  const minPrice = parsePrice(minPriceInput);
  const maxPrice = parsePrice(maxPriceInput);

  const [meals, allMeals] = await Promise.all([
    fetchMeals({
      limit: 60,
      searchTerm: searchTerm || undefined,
      categoryId: selectedCategoryId || undefined,
      dietary: selectedDietarySlug || undefined,
      minPrice,
      maxPrice,
      isActive: true,
      sort: "-createdAt",
    }),
    fetchMeals({
      limit: 250,
      isActive: true,
      sort: "title",
    }),
  ]);

  const categoryMap = new Map<string, string>();
  const dietaryMap = new Map<string, string>();

  allMeals.forEach((meal) => {
    if (meal.categoryId && meal.category) {
      categoryMap.set(meal.categoryId, meal.category);
    }

    (meal.dietary ?? []).forEach((tag) => {
      const slug = toDietarySlug(tag);
      if (slug && !dietaryMap.has(slug)) {
        dietaryMap.set(slug, tag);
      }
    });
  });

  const categories = Array.from(categoryMap.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const dietaryOptions = Array.from(dietaryMap.entries())
    .map(([slug, name]) => ({ slug, name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Navigation />

      <main className="flex-1">
        <section className="border-b border-white/10 bg-slate-950/60 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-white/50">
                  Night menu
                </p>
                <h1 className="text-3xl font-bold">Browse Meals</h1>
              </div>

              <form action="/meals" method="GET" className="relative w-full max-w-md">
                {selectedCategoryId && (
                  <input type="hidden" name="categoryId" value={selectedCategoryId} />
                )}
                {selectedDietarySlug && (
                  <input type="hidden" name="dietary" value={selectedDietarySlug} />
                )}
                {minPriceInput && (
                  <input type="hidden" name="minPrice" value={minPriceInput} />
                )}
                {maxPriceInput && (
                  <input type="hidden" name="maxPrice" value={maxPriceInput} />
                )}

                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  name="searchTerm"
                  defaultValue={searchTerm}
                  placeholder="Search dishes, chefs, tags"
                  className="border-white/10 bg-white/5 pl-9 pr-4 text-sm text-white placeholder:text-white/40"
                />
              </form>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                asChild
                variant={!selectedCategoryId ? "default" : "outline"}
                className="whitespace-nowrap"
              >
                <Link
                  href={buildMealsHref({
                    searchTerm,
                    dietary: selectedDietarySlug,
                    minPrice: minPriceInput,
                    maxPrice: maxPriceInput,
                  })}
                >
                  All
                </Link>
              </Button>
              {categories.map((category) => (
                <Button
                  asChild
                  key={category.id}
                  variant={selectedCategoryId === category.id ? "default" : "outline"}
                  className="whitespace-nowrap"
                >
                  <Link
                    href={buildMealsHref({
                      searchTerm,
                      categoryId: category.id,
                      dietary: selectedDietarySlug,
                      minPrice: minPriceInput,
                      maxPrice: maxPriceInput,
                    })}
                  >
                    {category.name}
                  </Link>
                </Button>
              ))}
            </div>

            <form
              action="/meals"
              method="GET"
              className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-2 xl:grid-cols-[1fr_1.1fr_auto_auto]"
            >
              {searchTerm && (
                <input type="hidden" name="searchTerm" value={searchTerm} />
              )}
              {selectedCategoryId && (
                <input type="hidden" name="categoryId" value={selectedCategoryId} />
              )}

              <div>
                <label
                  htmlFor="dietary"
                  className="block text-[11px] uppercase tracking-[0.25em] text-white/55"
                >
                  Dietary
                </label>
                <select
                  id="dietary"
                  name="dietary"
                  defaultValue={selectedDietarySlug}
                  className="mt-2 w-full rounded-md border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/70"
                >
                  <option value="">All preferences</option>
                  {dietaryOptions.map((option) => (
                    <option key={option.slug} value={option.slug}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="minPrice"
                    className="block text-[11px] uppercase tracking-[0.25em] text-white/55"
                  >
                    Min price
                  </label>
                  <Input
                    id="minPrice"
                    name="minPrice"
                    type="number"
                    min={0}
                    step="0.01"
                    defaultValue={minPriceInput}
                    placeholder="0"
                    className="mt-2 border-white/15 bg-slate-900 text-white placeholder:text-white/40"
                  />
                </div>
                <div>
                  <label
                    htmlFor="maxPrice"
                    className="block text-[11px] uppercase tracking-[0.25em] text-white/55"
                  >
                    Max price
                  </label>
                  <Input
                    id="maxPrice"
                    name="maxPrice"
                    type="number"
                    min={0}
                    step="0.01"
                    defaultValue={maxPriceInput}
                    placeholder="100"
                    className="mt-2 border-white/15 bg-slate-900 text-white placeholder:text-white/40"
                  />
                </div>
              </div>

              <Button type="submit" className="h-full min-h-10">
                Apply filters
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-full min-h-10 border-white/20 text-white hover:bg-white/10"
              >
                <Link href={buildMealsHref({ searchTerm, categoryId: selectedCategoryId })}>
                  Reset
                </Link>
              </Button>
            </form>
          </div>
        </section>

        <section className="bg-slate-950 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {meals.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-lg text-muted-foreground">No meals found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {meals.map((meal) => (
                  <Link key={meal.id} href={`/meals/${meal.id}`}>
                    <Card className="group relative flex h-[320px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/80 text-slate-100 shadow-[0_20px_80px_rgba(15,23,42,0.45)] transition duration-300 hover:border-cyan-300/60">
                      <img
                        src={meal.image || "/placeholder.svg"}
                        alt={meal.name}
                        className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-500 group-hover:opacity-85"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black/85" />

                      <div className="relative flex h-full flex-col p-5">
                        <div className="flex items-center justify-between text-sm text-white/85">
                          <span className="text-lg font-semibold">${meal.price}</span>
                          <div className="flex items-center gap-1 text-xs uppercase tracking-[0.3em] text-white/60">
                            {meal.category || "Drop"}
                          </div>
                        </div>

                        <div className="mt-auto space-y-2">
                          <p className="text-xs text-white/60">From {meal.providerName}</p>
                          <h3 className="text-xl font-semibold text-white">{meal.name}</h3>
                          <p className="line-clamp-2 text-xs text-white/75">
                            {meal.description}
                          </p>
                        </div>

                        <div className="mt-5 flex items-center justify-between text-sm text-white/80">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-amber-300" />
                            <span className="font-semibold">{meal.rating}</span>
                            <span className="text-white/60">({meal.reviews})</span>
                          </div>
                          <span className="text-white/60">{meal.preparationTime}m</span>
                        </div>

                        {meal.dietary && meal.dietary.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {meal.dietary.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.35em] text-white/75"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
