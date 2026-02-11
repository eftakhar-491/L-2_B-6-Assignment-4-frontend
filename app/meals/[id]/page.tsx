import Link from "next/link";

import { Navigation } from "@/app/components/Navigation";
import Footer from "@/app/components/Footer";
import { Button } from "@/components/ui/button";
import { fetchMealById } from "@/app/lib/meals-api";
import { MealDetailsClient } from "./MealDetailsClient";

export const dynamic = "force-dynamic";

export default async function MealDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const meal = await fetchMealById(id);

  if (!meal) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
        <Navigation />
        <main className="flex flex-1 items-center justify-center">
          <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-10 text-center shadow-[0_30px_120px_rgba(6,182,212,0.25)]">
            <p className="text-sm uppercase tracking-[0.4em] text-white/50">
              404
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Meal not found</h1>
            <p className="mt-3 text-white/70">
              The meal you were looking for is not available.
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

  return <MealDetailsClient meal={meal} />;
}
