"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, MapPin, Receipt, Store } from "lucide-react";

const steps = [
  {
    icon: Store,
    title: "Browse providers",
    description:
      "Explore verified kitchens, compare menus, and choose meals that match your taste.",
  },
  {
    icon: Receipt,
    title: "Place secure orders",
    description:
      "Checkout with delivery notes and cash-on-delivery support in a single flow.",
  },
  {
    icon: MapPin,
    title: "Track live status",
    description:
      "Follow every order from placed to delivered with real-time status updates.",
  },
];

export function ExperienceSection() {
  return (
    <section className="border-y border-white/10 bg-slate-950 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-200">
              How FoodHub Works
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">
              Fast ordering for customers, providers, and admins
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
              Designed for smooth meal discovery, reliable order fulfillment,
              and platform-level oversight.
            </p>
          </div>
          <Link
            href="/meals"
            className="inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-400/10 px-5 py-2.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
          >
            Start ordering <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.article
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-cyan-200">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-slate-300">
                  {step.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
