import { Navigation } from "./components/Navigation";
import { HeroSection } from "./components/HeroSection";
import { CategoriesSection } from "./components/CategoriesSection";
import { FeaturedSection } from "./components/FeaturedSection";
import { ExperienceSection } from "./components/ExperienceSection";
import { ProvidersSection } from "./components/ProvidersSection";
import { OperationsSection } from "./components/OperationsSection";
import { CtaSection } from "./components/CtaSection";
import Footer from "@/app/components/Footer";
import { fetchMeals } from "@/app/lib/meals-api";
import { fetchProviders } from "@/app/lib/providers-api";

export default async function Home() {
  const [meals, providers] = await Promise.all([
    fetchMeals({ limit: 12, isActive: true, sort: "-createdAt" }),
    fetchProviders({ limit: 6, isVerified: true, sort: "-rating" }),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navigation />
      <main className="flex-1">
        <HeroSection />
        {/* <CategoriesSection /> */}
        <ProvidersSection providers={providers} />
        <FeaturedSection meals={meals} />
        <ExperienceSection />
        <OperationsSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
