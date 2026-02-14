"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

import type { MealCardData } from "@/app/lib/meals-api";

import { SuperDuperCard } from "./SuperDuperCard";

interface FeaturedMealCardProps {
  meal: MealCardData;
  index: number;
}

function FeaturedMealCard({ meal, index }: FeaturedMealCardProps) {
  return (
    <motion.article
      key={meal.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.1 }}
      whileHover={{ y: 0, scale: 1.04 }}
      className="h-[320px] cursor-pointer"
    >
      <Link href={`/meals/${meal.id}`} className="block h-full">
        <div className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-white/10 text-slate-100 shadow-[0_20px_80px_rgba(0,0,0,0.35)] transition duration-300 hover:border-cyan-300/60">
          <img
            src={meal.image || "/placeholder.svg"}
            alt={meal.name}
            className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-500 group-hover:opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black/80" />
          <div className="relative flex flex-col h-full p-5">
            <div className="flex items-center justify-between text-sm text-white/80">
              <span className="text-lg font-semibold">${meal.price}</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/30 text-xs">
                <Star className="h-3.5 w-3.5 text-amber-200" />
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-end space-y-1 pt-10 text-left">
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                {meal.category || "Drop"}
              </p>
              <h3 className="text-lg font-semibold text-white">{meal.name}</h3>
              <p className="text-xs text-white/70 line-clamp-2">
                {meal.description}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-white/80">
                <span className="font-semibold">{meal.rating}</span>
                <span className="text-white/50">
                  {" "}
                  · {meal.preparationTime}m
                </span>
              </div>
              <button className="rounded-lg bg-orange-500 px-4 py-1 text-sm font-semibold tracking-wide text-white transition hover:bg-orange-400">
                Add
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export function FeaturedSection({ meals }: { meals: MealCardData[] }) {
  const featured = meals.slice(0, 6);

  return (
    <section className="relative overflow-hidden bg-slate-950 py-16 text-slate-100 md:py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/3 translate-y-1/3 rounded-full bg-emerald-400/20 blur-[160px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 text-3xl font-bold text-white md:text-4xl"
          >
            Featured Meals
          </motion.h2>
          <p className="mx-auto max-w-lg text-muted-foreground">
            Check out our most popular dishes right now
          </p>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((meal, index) => (
              <FeaturedMealCard key={meal.id} meal={meal} index={index} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-[40px] border border-white/10 bg-slate-950 p-6 text-slate-100 shadow-[0_25px_120px_rgba(6,182,212,0.25)]"
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-cyan-400/15 blur-[140px]" />
              <div className="absolute bottom-0 right-0 h-64 w-64 translate-x-1/3 translate-y-1/3 rounded-full bg-emerald-400/20 blur-[150px]" />
            </div>
            <div className="relative space-y-3 text-left">
              <p className="text-[11px] uppercase tracking-[0.45em] text-cyan-200">
                Chef drop
              </p>
              <h3 className="text-3xl font-semibold">
                After-hours tasting flight
              </h3>
              <p className="text-sm text-slate-300">
                Curated directly by our ghost kitchen collective. Tap in for
                neon plates, ultra-fast routes, and chef comms in one tap.
              </p>
            </div>
            <div className="relative mt-6">
              <SuperDuperCard />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link
            href="/meals"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors duration-300 hover:bg-primary/90"
          >
            View All Meals →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
