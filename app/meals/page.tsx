"use client";

import { useState } from "react";
import { Navigation } from "@/app/components/Navigation";
import  Footer  from "@/app/components/Footer";
import { meals, categories } from "@/app/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Star, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function BrowseMealsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredMeals = meals.filter((meal) => {
    const matchesSearch =
      meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meal.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || meal.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navigation />

      <main className="flex-1">
        {/* Search Section */}
        <section className="bg-secondary/20 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-6">Browse Meals</h1>

            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search meals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Categories Filter */}
        <section className="py-6 border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                className="whitespace-nowrap"
              >
                All
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={
                    selectedCategory === cat.name ? "default" : "outline"
                  }
                  onClick={() => setSelectedCategory(cat.name)}
                  className="whitespace-nowrap"
                >
                  {cat.icon} {cat.name}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Meals Grid */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {filteredMeals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No meals found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMeals.map((meal) => (
                  <Link key={meal.id} href={`/meals/${meal.id}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col group cursor-pointer">
                      <div className="relative overflow-hidden h-48 bg-muted">
                        <img
                          src={meal.image || "/placeholder.svg"}
                          alt={meal.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                          ${meal.price}
                        </div>
                      </div>

                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                          {meal.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3 flex-1">
                          {meal.description}
                        </p>
                        <p className="text-xs text-muted-foreground mb-3">
                          From {meal.providerName}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-primary text-primary" />
                            <span className="font-semibold text-sm">
                              {meal.rating}
                            </span>
                            <span className="text-muted-foreground text-sm">
                              ({meal.reviews})
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {meal.preparationTime}m
                          </span>
                        </div>

                        {meal.dietary && (
                          <div className="mt-3 flex gap-2 flex-wrap">
                            {meal.dietary.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs bg-secondary text-foreground px-2 py-1 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
