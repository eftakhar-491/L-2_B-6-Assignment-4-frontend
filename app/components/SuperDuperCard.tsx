"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChefHat, Flame, Timer, Utensils } from "lucide-react";

interface SuperDuperCardProps {
  title?: string;
  chef?: string;
  eta?: string;
  calories?: number;
  progress?: number;
  tags?: string[];
}

const defaultTags = ["Spicy", "Signature", "Midnight"];

export function SuperDuperCard({
  title = "Neon Miso Bento",
  chef = "Chef Lumen",
  eta = "14 min",
  calories = 640,
  progress = 68,
  tags = defaultTags,
}: SuperDuperCardProps) {
  return (
    <div className="group relative w-full max-w-sm overflow-hidden rounded-[32px] border border-white/15 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-900/40 p-6 text-slate-100 shadow-[0_20px_120px_rgba(6,182,212,0.35)]">
      <div className="pointer-events-none absolute inset-y-4 -left-10 h-32 w-32 rounded-full bg-cyan-500/20 blur-3xl transition group-hover:translate-x-6" />
      <div className="pointer-events-none absolute -right-14 top-10 h-32 w-32 rounded-full bg-emerald-400/20 blur-3xl" />

      <div className="relative flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <Badge className="rounded-full bg-white/10 text-xs uppercase tracking-[0.4em] text-slate-200">
            Chef drop
          </Badge>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
            <ChefHat className="h-3.5 w-3.5 text-cyan-200" />
            {chef}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-semibold text-white">{title}</h3>
          <p className="text-sm text-slate-300">
            Glazed salmon, yuzu pickles, cosmic ginger foam, black sesame
            crumble.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-slate-200">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-3 py-1">
            <Timer className="h-4 w-4 text-cyan-300" />
            {eta} ETA
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-3 py-1">
            <Flame className="h-4 w-4 text-amber-300" />
            {calories} kcal
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-3 py-1">
            <Utensils className="h-4 w-4 text-pink-300" />
            Ghost Kitchen 04
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.35em] text-slate-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="relative mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
          <span>Prep pulse</span>
          <span>{progress}% synced</span>
        </div>
        <Progress value={progress} className="mt-3 h-2 bg-slate-800" />
      </div>
    </div>
  );
}
