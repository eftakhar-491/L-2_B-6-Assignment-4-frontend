"use client";

import { motion } from "framer-motion";
import { Clock3, Headset, ShieldCheck, Truck } from "lucide-react";

const ops = [
  {
    icon: Truck,
    title: "Hyperlocal routes",
    copy: "Dynamic batching keeps deliveries tight to your neighborhood for fresher plates.",
  },
  {
    icon: ShieldCheck,
    title: "Platform-grade safety",
    copy: "Verified providers, KYC-backed drivers, and dispute logging for every trip.",
  },
  {
    icon: Clock3,
    title: "Live SLAs",
    copy: "Realtime ETAs and reroutes so crews know exactly when drops land.",
  },
  {
    icon: Headset,
    title: "Concierge support",
    copy: "Human help on-call for orders, dietary swaps, or late-night escalations.",
  },
];

export function OperationsSection() {
  return (
    <section className="relative overflow-hidden bg-slate-900 py-16 text-slate-100 md:py-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-10 top-1/3 h-72 w-72 rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute bottom-0 right-0 h-80 w-80 translate-x-1/4 translate-y-1/4 rounded-full bg-emerald-400/10 blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-200">Ops backbone</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            The same energy as our hero
          </h2>
          <p className="mt-3 max-w-3xl mx-auto text-sm text-slate-300 md:text-base">
            A single-color, neon-leaning stack that keeps the platform running while matching the hero palette end to end.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {ops.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="group rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_90px_rgba(6,182,212,0.18)]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-cyan-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                    <p className="text-sm text-slate-300">{item.copy}</p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
