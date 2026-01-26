"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/app/components/Navigation";
import  Footer  from "@/app/components/Footer";
import { meals } from "@/app/lib/mockData";
import { useApp } from "@/app/context/AppContext";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, Plus, Minus } from "lucide-react";

export default function MealDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { addToCart } = useApp();
  const { isAuthenticated, user } = useAuth();
  const [quantity, setQuantity] = useState(1);

  const meal = meals.find((m) => m.id === id);

  if (!meal) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Meal not found</h1>
            <Button onClick={() => router.push("/meals")}>Back to meals</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!isAuthenticated || user?.role !== "customer") {
      router.push("/login");
      return;
    }

    addToCart({
      id: meal.id,
      name: meal.name,
      price: meal.price,
      quantity,
      providerId: meal.providerId,
      image: meal.image,
    });
    router.push("/cart");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navigation />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
          <Button
            variant="outline"
            className="mb-6 bg-transparent"
            onClick={() => router.back()}
          >
            ← Back
          </Button>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Image */}
            <div className="flex items-center justify-center bg-muted rounded-lg h-96">
              <img
                src={meal.image || "/placeholder.svg"}
                alt={meal.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>

            {/* Details */}
            <div className="flex flex-col gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-muted-foreground">
                    {meal.category}
                  </span>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">
                    From {meal.providerName}
                  </span>
                </div>
                <h1 className="text-4xl font-bold mb-4">{meal.name}</h1>
                <p className="text-muted-foreground text-lg">
                  {meal.description}
                </p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <span className="text-lg font-semibold">{meal.rating}</span>
                  <span className="text-muted-foreground">
                    ({meal.reviews} reviews)
                  </span>
                </div>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  {meal.preparationTime}m prep time
                </span>
              </div>

              {/* Dietary */}
              {meal.dietary && (
                <div className="flex gap-2 flex-wrap">
                  {meal.dietary.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-secondary text-foreground px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Price */}
              <div className="border-t border-border pt-6">
                <div className="text-3xl font-bold mb-6">
                  ${meal.price.toFixed(2)}
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-sm font-medium">Quantity:</span>
                  <div className="flex items-center border border-border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-secondary transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:bg-secondary transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Add to Cart */}
                <Button size="lg" onClick={handleAddToCart} className="w-full">
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
