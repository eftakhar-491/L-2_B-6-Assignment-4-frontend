"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, Star } from "lucide-react";

import { Navigation } from "@/app/components/Navigation";
import Footer from "@/app/components/Footer";
import { useApp } from "@/app/context/AppContext";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import type { MealCardData } from "@/app/lib/meals-api";
import { useToast } from "@/hooks/use-toast";

export function MealDetailsClient({ meal }: { meal: MealCardData }) {
  const router = useRouter();
  const { addToCart } = useApp();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    if (!isAuthenticated || user?.role !== "customer") {
      router.push("/login");
      return;
    }

    try {
      setIsAddingToCart(true);
      await addToCart({
        mealId: meal.id,
        quantity,
        image: meal.image,
      });
      router.push("/cart");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Unable to add item",
        description:
          error instanceof Error
            ? error.message
            : "Please try again in a moment.",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const statChips = [
    { label: "Prep", value: `${meal.preparationTime}m` },
    { label: "Calories", value: "chef's pick" },
    { label: "Orders", value: `${meal.reviews}+` },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Navigation />

      <main className="flex-1">
        <section className="border-b border-white/10 bg-slate-950/70 py-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-white/50">
                Chef drop
              </p>
              <h1 className="text-3xl font-semibold">{meal.name}</h1>
            </div>
            <Button
              variant="outline"
              className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"
              onClick={() => router.back()}
            >
              {"<-"} Back
            </Button>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
            <div className="group relative overflow-hidden rounded-[40px] border border-white/10 bg-slate-900 shadow-[0_35px_140px_rgba(6,182,212,0.25)]">
              <img
                src={meal.image || "/placeholder.svg"}
                alt={meal.name}
                className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-200/10 via-slate-950/40 to-slate-950" />
              <div className="relative flex h-full flex-col justify-between p-8">
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/70">
                    {meal.category}
                  </span>
                  <p className="text-sm text-white/70">From {meal.providerName}</p>
                  <p className="max-w-xl text-base text-white/80">
                    {meal.description}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {statChips.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm"
                    >
                      <p className="text-[11px] uppercase tracking-[0.4em] text-white/50">
                        {stat.label}
                      </p>
                      <p className="mt-2 text-xl font-semibold text-white">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6 rounded-[36px] border border-white/10 bg-white/5 p-6 shadow-[0_25px_100px_rgba(15,23,42,0.45)] backdrop-blur">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-amber-300" />
                  <p className="text-lg font-semibold">
                    {meal.rating}{" "}
                    <span className="text-sm text-white/60">
                      ({meal.reviews} reviews)
                    </span>
                  </p>
                </div>
                <p className="text-sm text-white/70">
                  Courier ETA synced at {meal.preparationTime} minutes.
                </p>
              </div>

              {meal.dietary && meal.dietary.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                    Dietary tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {meal.dietary.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.35em] text-white/80"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
                <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                  Nightly rate
                </p>
                <p className="mt-2 text-4xl font-semibold">
                  ${meal.price.toFixed(2)}
                </p>
                <p className="text-sm text-white/60">
                  Includes chef prep and courier handling.
                </p>

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-sm text-white/70">Quantity</span>
                  <div className="flex items-center rounded-full border border-white/15 bg-white/5">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="rounded-full p-3 hover:bg-white/10"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-6 text-lg font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="rounded-full p-3 hover:bg-white/10"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className="mt-6 w-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 hover:from-cyan-300"
                >
                  {isAddingToCart ? "Adding..." : "Add to cart"}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

