"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Search, Trash2 } from "lucide-react";
import { Navigation } from "@/app/components/Navigation";
import Footer from "@/app/components/Footer";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  deleteSuperAdminMeal,
  fetchSuperAdminMeals,
  type SuperAdminMeal,
} from "@/service/superAdmin";

type ProviderFilter = "all" | "verified" | "unverified";
type ActiveFilter = "all" | "active" | "inactive";

const toNumber = (value: number | string) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function SuperAdminMealsPage() {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const { toast } = useToast();

  const [meals, setMeals] = useState<SuperAdminMeal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [providerFilter, setProviderFilter] = useState<ProviderFilter>("all");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [deletingMealId, setDeletingMealId] = useState<string | null>(null);

  const loadMeals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchSuperAdminMeals({
        page: 1,
        limit: 500,
      });
      setMeals(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load meals.";
      setError(message);
      toast({
        title: "Unable to load meals",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "super_admin") return;
    void loadMeals();
  }, [isAuthenticated, user?.role, loadMeals]);

  const filteredMeals = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return meals.filter((meal) => {
      const providerVerified = Boolean(meal.providerProfile?.isVerified);
      const matchesProvider =
        providerFilter === "all" ||
        (providerFilter === "verified" ? providerVerified : !providerVerified);
      const matchesActive =
        activeFilter === "all" ||
        (activeFilter === "active" ? meal.isActive : !meal.isActive);
      const matchesSearch =
        !query ||
        `${meal.title} ${meal.providerProfile?.name ?? ""}`
          .toLowerCase()
          .includes(query);
      return matchesProvider && matchesActive && matchesSearch;
    });
  }, [meals, searchTerm, providerFilter, activeFilter]);

  const handleDeleteMeal = async (meal: SuperAdminMeal) => {
    setDeletingMealId(meal.id);
    try {
      await deleteSuperAdminMeal(meal.id);
      setMeals((prev) => prev.filter((item) => item.id !== meal.id));
      toast({
        title: "Meal deleted",
        description: `${meal.title} has been deleted.`,
      });
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingMealId(null);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navigation />
        <main className="flex flex-1 items-center justify-center">
          <Card className="flex items-center gap-3 p-6">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading meals...
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "super_admin") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground">
              Only super admins can access this page.
            </p>
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navigation />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl font-bold">Super Admin Meal Management</h1>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline">
                <Link href="/super-admin/users">Manage Users</Link>
              </Button>
              <Button variant="outline" onClick={() => void loadMeals()}>
                Refresh
              </Button>
            </div>
          </div>

          <Card className="p-6 space-y-4">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Search meals or providers..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={providerFilter === "all" ? "default" : "outline"}
                onClick={() => setProviderFilter("all")}
              >
                All Providers
              </Button>
              <Button
                variant={providerFilter === "verified" ? "default" : "outline"}
                onClick={() => setProviderFilter("verified")}
              >
                Verified Providers
              </Button>
              <Button
                variant={providerFilter === "unverified" ? "default" : "outline"}
                onClick={() => setProviderFilter("unverified")}
              >
                Unverified Providers
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeFilter === "all" ? "default" : "outline"}
                onClick={() => setActiveFilter("all")}
              >
                All Meals
              </Button>
              <Button
                variant={activeFilter === "active" ? "default" : "outline"}
                onClick={() => setActiveFilter("active")}
              >
                Active
              </Button>
              <Button
                variant={activeFilter === "inactive" ? "default" : "outline"}
                onClick={() => setActiveFilter("inactive")}
              >
                Inactive
              </Button>
            </div>
          </Card>

          {error && (
            <Card className="border-red-300 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </Card>
          )}

          <Card className="p-6 overflow-x-auto">
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading meals...</div>
            ) : filteredMeals.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">No meals found.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Meal</th>
                    <th className="px-4 py-3 text-left font-semibold">Provider</th>
                    <th className="px-4 py-3 text-left font-semibold">Price</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Created</th>
                    <th className="px-4 py-3 text-left font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMeals.map((meal) => {
                    const isDeleting = deletingMealId === meal.id;
                    return (
                      <tr
                        key={meal.id}
                        className="border-b border-border hover:bg-secondary/20"
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold">{meal.title}</p>
                          <p className="text-xs text-muted-foreground">{meal.shortDesc ?? "No description"}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{meal.providerProfile?.name ?? "Unknown provider"}</p>
                          <Badge
                            className={
                              meal.providerProfile?.isVerified
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {meal.providerProfile?.isVerified ? "Verified" : "Unverified"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {meal.currency} {toNumber(meal.price).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={meal.isActive ? "default" : "secondary"}>
                            {meal.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(meal.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => void handleDeleteMeal(meal)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting
                              </>
                            ) : (
                              <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
