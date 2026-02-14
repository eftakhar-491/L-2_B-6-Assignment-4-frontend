"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-16 text-slate-100 md:py-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/3 translate-y-1/3 rounded-full bg-emerald-400/20 blur-[160px]" />
      </div>
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-6 rounded-[32px] border border-white/10 bg-white/5 p-10 shadow-[0_25px_120px_rgba(6,182,212,0.2)]"
        >
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-200">
            Ready when you are
          </p>
          <h2 className="text-3xl font-bold sm:text-4xl">
            Keep the hero energy all the way down
          </h2>
          <p className="text-base text-slate-200 sm:text-lg">
            Spin up late-night orders, onboard as a provider, or keep scrolling—everything stays in the same neon groove.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Button
              size="lg"
              asChild
              className="h-12 rounded-full px-7 text-base shadow-[0_10px_40px_rgba(6,182,212,0.3)]"
            >
              <Link href="/meals">Order now</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-12 rounded-full border-white/30 bg-transparent px-7 text-base text-white hover:bg-white/10"
            >
              <Link href="/register?role=provider">Become a provider</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
