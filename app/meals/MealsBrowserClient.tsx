"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Star } from "lucide-react";

import { Navigation } from "@/app/components/Navigation";
import Footer from "@/app/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { MealCardData } from "@/app/lib/meals-api";

interface MealsBrowserClientProps {
  meals: MealCardData[];
}

export function MealsBrowserClient({ meals }: MealsBrowserClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(meals.map((meal) => meal.category).filter(Boolean)),
      ).sort((a, b) => a.localeCompare(b)),
    [meals],
  );

  const filteredMeals = useMemo(
    () =>
      meals.filter((meal) => {
        const matchesSearch =
          meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          meal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          meal.providerName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
          !selectedCategory || meal.category === selectedCategory;

        return matchesSearch && matchesCategory;
      }),
    [meals, searchTerm, selectedCategory],
  );

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
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  placeholder="Search dishes, chefs, tags"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-white/10 bg-white/5 pl-9 pr-4 text-sm text-white placeholder:text-white/40"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                className="whitespace-nowrap"
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {filteredMeals.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-lg text-muted-foreground">No meals found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredMeals.map((meal) => (
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
                          <span className="text-lg font-semibold">
                            ${meal.price}
                          </span>
                          <div className="flex items-center gap-1 text-xs uppercase tracking-[0.3em] text-white/60">
                            {meal.category || "Drop"}
                          </div>
                        </div>

                        <div className="mt-auto space-y-2">
                          <p className="text-xs text-white/60">
                            From {meal.providerName}
                          </p>
                          <h3 className="text-xl font-semibold text-white">
                            {meal.name}
                          </h3>
                          <p className="line-clamp-2 text-xs text-white/75">
                            {meal.description}
                          </p>
                        </div>

                        <div className="mt-5 flex items-center justify-between text-sm text-white/80">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-amber-300" />
                            <span className="font-semibold">{meal.rating}</span>
                            <span className="text-white/60">
                              ({meal.reviews})
                            </span>
                          </div>
                          <span className="text-white/60">
                            {meal.preparationTime}m
                          </span>
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

