import Link from "next/link";
import { BadgeCheck, Globe, MapPin, Phone, Star } from "lucide-react";

import { Navigation } from "@/app/components/Navigation";
import Footer from "@/app/components/Footer";
import { fetchProviderById } from "@/app/lib/providers-api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatCurrency = (value: unknown) => `$${toNumber(value, 0).toFixed(2)}`;

export default async function ProviderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const provider = await fetchProviderById(id);

  if (!provider) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
        <Navigation />
        <main className="flex flex-1 items-center justify-center px-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-10 text-center shadow-[0_30px_120px_rgba(6,182,212,0.25)]">
            <p className="text-sm uppercase tracking-[0.4em] text-white/50">404</p>
            <h1 className="mt-2 text-3xl font-semibold">Provider not found</h1>
            <p className="mt-3 text-white/70">
              This provider is unavailable or not yet verified.
            </p>
            <Button asChild className="mt-6 rounded-full px-6">
              <Link href="/meals">Browse meals</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const categories = (provider.categories ?? [])
    .map((entry) => entry.category?.name)
    .filter((name): name is string => Boolean(name));

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Navigation />

      <main className="flex-1">
        <section className="border-b border-white/10 bg-slate-950/70 py-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-[30px] border border-white/12 bg-gradient-to-br from-slate-950/90 via-slate-900/70 to-slate-950/90 p-6 shadow-[0_25px_120px_rgba(6,182,212,0.18)]">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-white/45">
                    Provider profile
                    {provider.isVerified && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/35 bg-emerald-300/10 px-2 py-0.5 text-[10px] text-emerald-200">
                        <BadgeCheck className="h-3 w-3" />
                        Verified
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl font-semibold text-white">{provider.name}</h1>
                  <p className="max-w-2xl text-white/70">
                    {provider.description || "This provider has not added a public description yet."}
                  </p>
                </div>

                <div className="space-y-2 text-sm text-white/75">
                  <p className="inline-flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-300" />
                    Rating {toNumber(provider.rating, 0).toFixed(1)}
                  </p>
                  {provider.address && (
                    <p className="inline-flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 text-cyan-300" />
                      {provider.address}
                    </p>
                  )}
                  {provider.phone && (
                    <p className="inline-flex items-center gap-2">
                      <Phone className="h-4 w-4 text-cyan-300" />
                      {provider.phone}
                    </p>
                  )}
                  {provider.website && (
                    <a
                      href={provider.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-cyan-200 underline-offset-4 hover:underline"
                    >
                      <Globe className="h-4 w-4" />
                      Visit website
                    </a>
                  )}
                </div>
              </div>

              {categories.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Badge
                      key={category}
                      className="rounded-full border border-white/20 bg-white/10 text-white"
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Menu</h2>
              <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Link href="/meals">View all meals</Link>
              </Button>
            </div>

            {provider.meals.length === 0 ? (
              <Card className="rounded-2xl border border-white/12 bg-white/5 p-8 text-center text-white/70">
                No active meals available from this provider right now.
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {provider.meals.map((meal) => {
                  const image =
                    meal.images?.find((img) => img?.isPrimary)?.src ||
                    meal.images?.[0]?.src ||
                    "/placeholder.svg";

                  return (
                    <Link key={meal.id} href={`/meals/${meal.id}`}>
                      <Card className="group relative flex h-[320px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/80 text-slate-100 shadow-[0_20px_80px_rgba(15,23,42,0.45)] transition duration-300 hover:border-cyan-300/60">
                        <img
                          src={image}
                          alt={meal.title}
                          className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-500 group-hover:opacity-85"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black/85" />

                        <div className="relative flex h-full flex-col p-5">
                          <div className="flex items-center justify-between text-sm text-white/85">
                            <span className="text-lg font-semibold">{formatCurrency(meal.price)}</span>
                          </div>

                          <div className="mt-auto space-y-2">
                            <h3 className="text-xl font-semibold text-white">{meal.title}</h3>
                            <p className="line-clamp-2 text-xs text-white/75">
                              {meal.shortDesc || meal.description || "No description provided."}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </Link>
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
