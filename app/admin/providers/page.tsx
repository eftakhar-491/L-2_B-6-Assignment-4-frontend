"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigation } from "@/app/components/Navigation";
import Footer from "@/app/components/Footer";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import {
  fetchProviders,
  verifyAdminProvider,
  type AdminProviderProfile,
} from "@/service/admin";
import { deleteSuperAdminProvider } from "@/service/superAdmin";

type VerificationFilter = "all" | "verified" | "unverified";

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function AdminProvidersPage() {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const hasAdminAccess =
    user?.role === "admin" || user?.role === "super_admin";
  const isSuperAdmin = user?.role === "super_admin";
  const { toast } = useToast();

  const [providers, setProviders] = useState<AdminProviderProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<VerificationFilter>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadProviders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [verified, unverified] = await Promise.all([
        fetchProviders({
          page: 1,
          limit: 500,
          isVerified: true,
          sort: "-createdAt",
        }),
        fetchProviders({
          page: 1,
          limit: 500,
          isVerified: false,
          sort: "-createdAt",
        }),
      ]);

      const map = new Map<string, AdminProviderProfile>();
      verified.data.forEach((item) => map.set(item.id, item));
      unverified.data.forEach((item) => map.set(item.id, item));

      const merged = Array.from(map.values()).sort((a, b) => {
        const aTime = Date.parse(a.createdAt);
        const bTime = Date.parse(b.createdAt);
        return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
      });

      setProviders(merged);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load providers.";
      setError(message);
      setProviders([]);
      toast({
        title: "Unable to load providers",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!isAuthenticated || !hasAdminAccess) return;
    void loadProviders();
  }, [isAuthenticated, hasAdminAccess, loadProviders]);

  const filteredProviders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return providers.filter((provider) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "verified" ? provider.isVerified : !provider.isVerified);
      const matchesSearch =
        !query ||
        `${provider.name} ${provider.address ?? ""} ${provider.website ?? ""}`
          .toLowerCase()
          .includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [providers, filter, searchTerm]);

  const counts = useMemo(() => {
    const verified = providers.filter((item) => item.isVerified).length;
    return {
      total: providers.length,
      verified,
      unverified: providers.length - verified,
    };
  }, [providers]);

  const handleToggleVerification = async (provider: AdminProviderProfile) => {
    setUpdatingId(provider.id);
    try {
      const updated = await verifyAdminProvider(provider.id, !provider.isVerified);
      setProviders((prev) =>
        prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)),
      );
      toast({
        title: "Provider updated",
        description: `${updated.name} is now ${
          updated.isVerified ? "verified" : "unverified"
        }.`,
      });
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteProvider = async (provider: AdminProviderProfile) => {
    setDeletingId(provider.id);
    try {
      const deleted = await deleteSuperAdminProvider(provider.id);
      setProviders((prev) => prev.filter((item) => item.id !== deleted.id));
      toast({
        title: "Provider deleted",
        description: `${provider.name} and ${deleted.disabledMeals} meal(s) were disabled.`,
      });
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navigation />
        <main className="flex flex-1 items-center justify-center">
          <Card className="flex items-center gap-3 p-6">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading providers...
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !hasAdminAccess) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Access Denied</h1>
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl font-bold">Provider Management</h1>
            <Button variant="outline" onClick={() => void loadProviders()}>
              Refresh
            </Button>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="p-5">
              <p className="text-sm text-muted-foreground">Total Providers</p>
              <p className="mt-2 text-2xl font-semibold">{counts.total}</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-muted-foreground">Verified</p>
              <p className="mt-2 text-2xl font-semibold">{counts.verified}</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-muted-foreground">Unverified</p>
              <p className="mt-2 text-2xl font-semibold">{counts.unverified}</p>
            </Card>
          </div>

          <Card className="mb-6 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-10"
                  placeholder="Search providers..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  onClick={() => setFilter("all")}
                >
                  All
                </Button>
                <Button
                  variant={filter === "verified" ? "default" : "outline"}
                  onClick={() => setFilter("verified")}
                >
                  Verified
                </Button>
                <Button
                  variant={filter === "unverified" ? "default" : "outline"}
                  onClick={() => setFilter("unverified")}
                >
                  Unverified
                </Button>
              </div>
            </div>
          </Card>

          {error && (
            <Card className="mb-6 border-red-300 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </Card>
          )}

          <Card className="p-6 overflow-x-auto">
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">
                Loading providers...
              </div>
            ) : filteredProviders.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No providers found.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                    <th className="px-4 py-3 text-left font-semibold">Contact</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Joined</th>
                    <th className="px-4 py-3 text-left font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProviders.map((provider) => {
                    const isUpdating = updatingId === provider.id;
                    const isDeleting = deletingId === provider.id;
                    const isBusy = isUpdating || isDeleting;
                    return (
                      <tr
                        key={provider.id}
                        className="border-b border-border hover:bg-secondary/20"
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold">{provider.name}</div>
                          {provider.address && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {provider.address}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          <p>{provider.phone || "No phone"}</p>
                          <p>{provider.website || "No website"}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={
                              provider.isVerified
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {provider.isVerified ? "Verified" : "Unverified"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(provider.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              size="sm"
                              variant={provider.isVerified ? "outline" : "default"}
                              onClick={() => void handleToggleVerification(provider)}
                              disabled={isBusy}
                            >
                              {isUpdating ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Updating
                                </>
                              ) : provider.isVerified ? (
                                "Unverify"
                              ) : (
                                "Verify"
                              )}
                            </Button>
                            {isSuperAdmin && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => void handleDeleteProvider(provider)}
                                disabled={isBusy}
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
                            )}
                          </div>
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
