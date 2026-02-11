import { Navigation } from "./components/Navigation";
import { HeroSection } from "./components/HeroSection";
import { CategoriesSection } from "./components/CategoriesSection";
import { FeaturedSection } from "./components/FeaturedSection";
import Footer from "@/app/components/Footer";
import { fetchMeals } from "@/app/lib/meals-api";

export default async function Home() {
  const meals = await fetchMeals({ limit: 12, isActive: true, sort: "-createdAt" });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navigation />
      <main className="flex-1">
        <HeroSection />
        <CategoriesSection />
        <FeaturedSection meals={meals} />
      </main>
      <Footer />
    </div>
  );
}
