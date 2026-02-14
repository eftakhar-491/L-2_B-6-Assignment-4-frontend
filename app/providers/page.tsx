"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Star, Store } from "lucide-react";

import { Navigation } from "@/app/components/Navigation";
import Footer from "@/app/components/Footer";
import { fetchProviders } from "@/app/lib/providers-api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const buildProvidersHref = (searchTerm?: string) => {
  const query = new URLSearchParams();
  if (searchTerm?.trim()) {
    query.set("searchTerm", searchTerm.trim());
  }
  const asString = query.toString();
  return asString ? `/providers?${asString}` : "/providers";
};

function ProvidersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("searchTerm") ?? "";

  const [providers, setProviders] = useState<
    Awaited<ReturnType<typeof fetchProviders>>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchTerm);

  const pushSearch = useCallback(
    (value?: string) => {
      router.replace(buildProvidersHref(value), { scroll: false });
    },
    [router],
  );

  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    let active = true;

    void (async () => {
      setIsLoading(true);
      const list = await fetchProviders({
        limit: 100,
        sort: "-createdAt",
        searchTerm: searchTerm || undefined,
        isVerified: true,
      });

      if (active) {
        setProviders(list);
        setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [searchTerm]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Navigation />

      <main className="flex-1">
        <section className="border-b border-white/10 bg-slate-950/60 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-white/50">
                  Food partners
                </p>
                <h1 className="text-3xl font-bold">Browse Providers</h1>
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  pushSearch(searchInput);
                }}
                className="relative w-full max-w-md"
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search provider name or location"
                  className="border-white/10 bg-white/5 pl-9 pr-4 text-sm text-white placeholder:text-white/40"
                />
              </form>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <Card className="rounded-2xl border border-white/12 bg-white/5 p-10 text-center text-white/70">
                Loading providers...
              </Card>
            ) : providers.length === 0 ? (
              <Card className="rounded-2xl border border-white/12 bg-white/5 p-10 text-center text-white/70">
                No providers found for your search.
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {providers.map((provider) => {
                  const categories = (provider.categories ?? [])
                    .map((entry) => entry.category?.name)
                    .filter((name): name is string => Boolean(name));

                  return (
                    <Card
                      key={provider.id}
                      className="rounded-[28px] border border-white/12 bg-gradient-to-br from-slate-950/85 via-slate-900/55 to-slate-950/85 p-6 text-white shadow-[0_20px_90px_rgba(6,182,212,0.18)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/45">
                            <Store className="h-3.5 w-3.5 text-cyan-300" />
                            Provider
                          </div>
                          <h2 className="text-2xl font-semibold">{provider.name}</h2>
                        </div>
                        <div className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/85">
                          <Star className="h-3.5 w-3.5 text-amber-300" />
                          {toNumber(provider.rating, 0).toFixed(1)}
                        </div>
                      </div>

                      <p className="mt-3 min-h-12 text-sm text-white/70">
                        {provider.description || "No description provided."}
                      </p>

                      {categories.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {categories.slice(0, 4).map((category) => (
                            <span
                              key={`${provider.id}-${category}`}
                              className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-white/80"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      )}

                      {provider.address && (
                        <p className="mt-4 text-xs text-white/55">{provider.address}</p>
                      )}

                      <Button asChild className="mt-6 w-full rounded-full">
                        <Link href={`/providers/${provider.id}`}>View menu</Link>
                      </Button>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function ProvidersPageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <p className="text-sm text-white/70">Loading providers...</p>
    </div>
  );
}

export default function ProvidersPage() {
  return (
    <Suspense fallback={<ProvidersPageFallback />}>
      <ProvidersPageContent />
    </Suspense>
  );
}
