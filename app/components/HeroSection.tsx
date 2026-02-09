"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  PlayCircle,
  ShieldCheck,
  Timer,
  Truck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { SuperDuperCard } from "./SuperDuperCard";

const featurePills = ["Lightning drop-offs", "Chef curated", "24/7 concierge"];

const stats = [
  { label: "Average delivery", value: "24 min" },
  { label: "Cities online", value: "38" },
  { label: "Nightly partners", value: "1200+" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/3 translate-y-1/3 rounded-full bg-emerald-400/20 blur-[160px]" />
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-20 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-5">
              <Badge className="rounded-full border border-white/20 bg-white/10 text-xs uppercase tracking-[0.45em] text-slate-200">
                After hours delivery
              </Badge>
              <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                Feed your crew with{" "}
                <span className="bg-gradient-to-r from-cyan-300 via-white to-emerald-300 bg-clip-text text-transparent">
                  hyperlocal
                </span>{" "}
                drops.
              </h1>
              <p className="text-lg text-slate-300 sm:text-xl">
                Menu surf 400+ ghost kitchens, track courier pulses in real
                time, and deliver chef-made plates faster than you can pick a
                song.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                size="lg"
                className="h-14 rounded-full px-8 text-base"
                asChild
              >
                <Link href="/meals" className="inline-flex items-center gap-2">
                  Browse drops <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 rounded-full border-white/20 bg-transparent px-8 text-base text-white hover:bg-white/10"
                asChild
              >
                <Link
                  href="/register?role=provider"
                  className="inline-flex items-center gap-2"
                >
                  <PlayCircle className="h-4 w-4" /> Watch the kitchen
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-3">
              {featurePills.map((pill) => (
                <span
                  key={pill}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-200"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                  {pill}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="relative flex flex-col items-end gap-6"
          >
            <SuperDuperCard />
            <div className="w-full max-w-xs rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200 shadow-2xl">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                Live ops
              </p>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-3xl font-semibold text-white">312</p>
                  <p className="text-xs text-slate-400">Drivers online</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs">
                  <ShieldCheck className="mb-1 h-4 w-4 text-emerald-300" />
                  SLA locked
                </div>
              </div>
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2">
                    <Timer className="h-4 w-4 text-cyan-300" /> Route time
                  </span>
                  18m avg
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2">
                    <Truck className="h-4 w-4 text-amber-300" /> Active batches
                  </span>
                  46 in flight
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid gap-4 border-t border-white/5 pt-6 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl border border-white/10 bg-white/5 p-5"
            >
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                {stat.label}
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
