"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigation } from "@/app/components/Navigation";
import Footer from "@/app/components/Footer";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import {
  fetchAdminOrders,
  type AdminOrder,
  type AdminOrderStatus,
} from "@/service/admin";

const statusFilters: Array<"all" | AdminOrderStatus> = [
  "all",
  "placed",
  "preparing",
  "ready",
  "delivered",
  "cancelled",
];

const statusBadgeClass: Record<AdminOrderStatus, string> = {
  placed: "bg-yellow-100 text-yellow-800",
  preparing: "bg-orange-100 text-orange-800",
  ready: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const formatStatus = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const formatMoney = (amount: unknown, currency: string) => {
  const parsed = Number(amount);
  const value = Number.isFinite(parsed) ? parsed : 0;

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(value);
  } catch {
    return `${currency || "USD"} ${value.toFixed(2)}`;
  }
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AdminOrdersPage() {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const hasAdminAccess =
    user?.role === "admin" || user?.role === "super_admin";

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | AdminOrderStatus>(
    "all",
  );

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchAdminOrders({
        page: 1,
        limit: 300,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setOrders(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load admin orders.",
      );
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (!isAuthenticated || !hasAdminAccess) return;
    void loadOrders();
  }, [isAuthenticated, hasAdminAccess, loadOrders]);

  const totals = useMemo(() => {
    const totalAmount = orders.reduce(
      (sum, order) => sum + (Number(order.totalAmount) || 0),
      0,
    );
    return {
      count: orders.length,
      amount: totalAmount,
    };
  }, [orders]);

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navigation />
        <main className="flex flex-1 items-center justify-center">
          <Card className="flex items-center gap-3 p-6">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading orders...
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
            <h1 className="text-3xl font-bold">Order Management</h1>
            <Button variant="outline" onClick={() => void loadOrders()}>
              Refresh
            </Button>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="p-5">
              <p className="text-sm text-muted-foreground">Loaded Orders</p>
              <p className="mt-2 text-2xl font-semibold">{totals.count}</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-muted-foreground">Loaded Revenue</p>
              <p className="mt-2 text-2xl font-semibold">
                {formatMoney(totals.amount, "USD")}
              </p>
            </Card>
          </div>

          <Card className="mb-6 p-6">
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  onClick={() => setStatusFilter(status)}
                >
                  {status === "all" ? "All" : formatStatus(status)}
                </Button>
              ))}
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
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No orders found.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Order</th>
                    <th className="text-left py-3 px-4 font-semibold">Customer</th>
                    <th className="text-left py-3 px-4 font-semibold">Provider</th>
                    <th className="text-left py-3 px-4 font-semibold">Items</th>
                    <th className="text-left py-3 px-4 font-semibold">Total</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Placed</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const itemCount = order.items.reduce(
                      (sum, item) => sum + item.quantity,
                      0,
                    );

                    return (
                      <tr
                        key={order.id}
                        className="border-b border-border hover:bg-secondary/20"
                      >
                        <td className="py-3 px-4 font-semibold">
                          {order.id.slice(0, 8)}
                        </td>
                        <td className="py-3 px-4">
                          {order.user?.name || order.user?.email || "Customer"}
                        </td>
                        <td className="py-3 px-4">
                          {order.providerProfile?.name || "Provider"}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {itemCount} items
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          {formatMoney(order.totalAmount, order.currency)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={statusBadgeClass[order.status]}>
                            {formatStatus(order.status)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {formatDate(order.placedAt)}
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
