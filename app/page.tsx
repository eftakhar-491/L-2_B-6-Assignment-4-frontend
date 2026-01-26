"use client";

import { Navigation } from "./components/Navigation";
import { HeroSection } from "./components/HeroSection";
import { CategoriesSection } from "./components/CategoriesSection";
import { FeaturedSection } from "./components/FeaturedSection";
import Footer from "@/app/components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navigation />
      <main className="flex-1">
        <HeroSection />
        <CategoriesSection />
        <FeaturedSection />
      </main>
      <Footer />
    </div>
  );
}
