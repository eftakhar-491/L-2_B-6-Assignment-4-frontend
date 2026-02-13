"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, BadgeCheck, MapPin, Star } from "lucide-react";

import type { ProviderSummary } from "@/app/lib/providers-api";

interface ProvidersSectionProps {
  providers: ProviderSummary[];
}

export function ProvidersSection({ providers }: ProvidersSectionProps) {
  const visibleProviders = providers.slice(0, 6);
  const hasProviders = visibleProviders.length > 0;

  return (
    <section className="relative overflow-hidden bg-slate-950 py-16 text-slate-100 md:py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[170px]" />
        <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] translate-x-1/3 translate-y-1/4 rounded-full bg-emerald-400/15 blur-[180px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-200">
              Provider spotlight
            </p>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Verified kitchens serving tonight
            </h2>
            <p className="max-w-2xl text-sm text-slate-300 md:text-base">
              Meet the crews trusted for late-night drops, on-time routes, and
              responsive support. Tap into menus built for speed and flavor.
            </p>
          </div>
          <Link
            href="/providers"
            className="inline-flex items-center gap-2 rounded-full border border-cyan-300/50 bg-white/5 px-5 py-2.5 text-sm font-semibold text-cyan-50 transition hover:bg-white/10"
          >
            Explore providers <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {hasProviders ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleProviders.map((provider, index) => {
              const categories = (provider.categories ?? [])
                .map((entry) => entry.category?.name)
                .filter(Boolean)
                .slice(0, 3) as string[];

              return (
                <motion.article
                  key={provider.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.35 }}
                  whileHover={{ y: -4 }}
                  className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_25px_120px_rgba(6,182,212,0.18)]"
                >
                  <div className="absolute inset-px rounded-[26px] bg-gradient-to-b from-white/5 via-white/0 to-white/5" />
                  <div className="relative flex h-full flex-col gap-4 p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm uppercase tracking-[0.3em] text-white/50">
                          {provider.isVerified ? "Verified" : "Pending"}
                        </p>
                        <h3 className="text-xl font-semibold text-white">
                          {provider.name || "Provider"}
                        </h3>
                        <p className="text-sm text-slate-300 line-clamp-2">
                          {provider.description || "Fresh plates, fast routes, and late-night coverage for your crew."}
                        </p>
                      </div>
                      {provider.isVerified && (
                        <div className="inline-flex items-center gap-1 rounded-full border border-emerald-300/40 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-100">
                          <BadgeCheck className="h-4 w-4" /> Safe
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-200">
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                        <Star className="h-4 w-4 text-amber-300" />
                        {provider.rating ?? "New"}
                      </span>
                      {provider.address && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/80">
                          <MapPin className="h-4 w-4 text-cyan-300" />
                          {provider.address}
                        </span>
                      )}
                    </div>

                    {categories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                          <span
                            key={category}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 text-sm text-white/80">
                      <span>View menu + drops</span>
                      <ArrowUpRight className="h-4 w-4 text-cyan-200 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-slate-200">
            Providers are syncing. Check back in a bit.
          </div>
        )}
      </div>
    </section>
  );
}
