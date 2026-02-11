"use client";

import { useEffect, useMemo, useState } from "react";
import { Navigation } from "@/app/components/Navigation";
import Footer from "@/app/components/Footer";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Loader2, Settings, ShoppingBag, Store, Users } from "lucide-react";
import {
  fetchAdminCategories,
  fetchAdminOrders,
  fetchAdminUsers,
  fetchProviders,
  type AdminUser,
} from "@/service/admin";

const formatStatus = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const formatDate = (value?: string) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function AdminPage() {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const hasAdminAccess =
    user?.role === "admin" || user?.role === "super_admin";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([]);
  const [counts, setCounts] = useState({
    users: 0,
    orders: 0,
    categories: 0,
    providers: 0,
    verifiedProviders: 0,
  });

  useEffect(() => {
    if (!isAuthenticated || !hasAdminAccess) return;

    let mounted = true;
    const loadDashboard = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [usersRes, ordersRes, categoriesRes, verifiedRes, unverifiedRes] =
          await Promise.all([
            fetchAdminUsers({ page: 1, limit: 200 }),
            fetchAdminOrders({ page: 1, limit: 200 }),
            fetchAdminCategories({ page: 1, limit: 200 }),
            fetchProviders({ page: 1, limit: 200, isVerified: true }),
            fetchProviders({ page: 1, limit: 200, isVerified: false }),
          ]);

        if (!mounted) return;

        const providerMap = new Map<string, boolean>();
        verifiedRes.data.forEach((provider) => {
          providerMap.set(provider.id, true);
        });
        unverifiedRes.data.forEach((provider) => {
          providerMap.set(provider.id, false);
        });

        setCounts({
          users: usersRes.meta?.total ?? usersRes.data.length,
          orders: ordersRes.meta?.total ?? ordersRes.data.length,
          categories: categoriesRes.meta?.total ?? categoriesRes.data.length,
          providers: providerMap.size,
          verifiedProviders: verifiedRes.meta?.total ?? verifiedRes.data.length,
        });
        setRecentUsers(usersRes.data.slice(0, 6));
      } catch (err) {
        if (!mounted) return;
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load admin dashboard data.",
        );
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void loadDashboard();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, hasAdminAccess]);

  const adminStats = useMemo(
    () => [
      {
        icon: Users,
        label: "Total Users",
        value: String(counts.users),
        color: "text-blue-600",
      },
      {
        icon: ShoppingBag,
        label: "Total Orders",
        value: String(counts.orders),
        color: "text-green-600",
      },
      {
        icon: Settings,
        label: "Categories",
        value: String(counts.categories),
        color: "text-orange-600",
      },
      {
        icon: Store,
        label: "Providers",
        value: `${counts.verifiedProviders}/${counts.providers}`,
        color: "text-purple-600",
      },
    ],
    [counts],
  );

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navigation />
        <main className="flex flex-1 items-center justify-center">
          <Card className="flex items-center gap-3 p-6">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading admin dashboard...
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
            <p className="text-muted-foreground">
              Only admins can access this page
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {adminStats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <Card key={idx} className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Management Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 hover:shadow-md transition-shadow">
              <Link href="/admin/users">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Manage Users
                </h3>
                <p className="text-sm text-muted-foreground">
                  View and manage all users
                </p>
              </Link>
            </Card>

            <Card className="p-6 hover:shadow-md transition-shadow">
              <Link href="/admin/orders">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  View Orders
                </h3>
                <p className="text-sm text-muted-foreground">
                  Monitor all platform orders
                </p>
              </Link>
            </Card>

            <Card className="p-6 hover:shadow-md transition-shadow">
              <Link href="/admin/categories">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Manage Categories
                </h3>
                <p className="text-sm text-muted-foreground">
                  Organize meal categories
                </p>
              </Link>
            </Card>

            <Card className="p-6 hover:shadow-md transition-shadow">
              <Link href="/admin/providers">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Manage Providers
                </h3>
                <p className="text-sm text-muted-foreground">
                  Verify and oversee provider profiles
                </p>
              </Link>
            </Card>
          </div>

          {/* Recent Users */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Recent Users</h2>
              <Button variant="outline" asChild>
                <Link href="/admin/users">View All</Link>
              </Button>
            </div>

            {isLoading && (
              <div className="py-6 text-sm text-muted-foreground">
                Loading dashboard data...
              </div>
            )}
            {error && (
              <div className="py-4 text-sm text-red-600">{error}</div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 font-semibold">Role</th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((recentUser) => (
                    <tr
                      key={recentUser.id}
                      className="border-b border-border hover:bg-secondary/20"
                    >
                      <td className="py-3 px-4 font-semibold">
                        {recentUser.name || "Unnamed user"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {recentUser.email}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">
                          {formatStatus(recentUser.role)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={
                            recentUser.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {formatStatus(recentUser.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {formatDate(recentUser.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!isLoading && !error && recentUsers.length === 0 && (
              <p className="pt-4 text-sm text-muted-foreground">
                No users available.
              </p>
            )}
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
