"use client";

import { Navigation } from "@/app/components/Navigation";
import Footer from "@/app/components/Footer";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Clock, CheckCircle, Truck, MapPin } from "lucide-react";

// Mock orders
const mockOrders = [
  {
    id: "ORD001",
    date: "2024-01-25",
    total: 35.97,
    status: "delivered" as const,
    items: [
      { name: "Margherita Pizza", quantity: 1, price: 12.99 },
      { name: "Pasta Carbonara", quantity: 1, price: 11.99 },
    ],
    provider: "Pizza Palace",
  },
  {
    id: "ORD002",
    date: "2024-01-24",
    total: 28.97,
    status: "out_for_delivery" as const,
    items: [{ name: "Kung Pao Chicken", quantity: 2, price: 10.99 }],
    provider: "Dragon House",
  },
  {
    id: "ORD003",
    date: "2024-01-23",
    total: 41.97,
    status: "preparing" as const,
    items: [
      { name: "Butter Chicken", quantity: 1, price: 13.99 },
      { name: "Paneer Tikka", quantity: 1, price: 11.99 },
      { name: "Biryani Rice", quantity: 1, price: 12.99 },
    ],
    provider: "Spice Route",
  },
];

const statusConfig = {
  pending: {
    icon: Clock,
    label: "Pending",
    classes: "border border-amber-200/40 bg-amber-300/10 text-amber-100",
  },
  confirmed: {
    icon: CheckCircle,
    label: "Confirmed",
    classes: "border border-cyan-200/40 bg-cyan-300/10 text-cyan-100",
  },
  preparing: {
    icon: Clock,
    label: "Preparing",
    classes: "border border-orange-200/40 bg-orange-300/10 text-orange-100",
  },
  ready: {
    icon: CheckCircle,
    label: "Ready",
    classes: "border border-emerald-200/40 bg-emerald-300/10 text-emerald-100",
  },
  out_for_delivery: {
    icon: Truck,
    label: "Courier en route",
    classes: "border border-purple-200/40 bg-purple-300/10 text-purple-100",
  },
  delivered: {
    icon: CheckCircle,
    label: "Handed off",
    classes: "border border-lime-200/40 bg-lime-300/10 text-lime-100",
  },
  cancelled: {
    icon: Clock,
    label: "Cancelled",
    classes: "border border-rose-200/40 bg-rose-300/10 text-rose-100",
  },
};

const stageOrder = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

const formatDate = (date: string) => dateFormatter.format(new Date(date));
const formatCurrency = (value: number) => currencyFormatter.format(value);

export default function OrdersPage() {
  const { isAuthenticated, user } = useAuth();
  const activeOrders = mockOrders.filter(
    (order) => order.status !== "delivered",
  );
  const deliveredOrders = mockOrders.filter(
    (order) => order.status === "delivered",
  );
  const totalSpend = mockOrders.reduce((sum, order) => sum + order.total, 0);

  const renderOrderCard = (
    order: (typeof mockOrders)[number],
    isArchived = false,
  ) => {
    const config = statusConfig[order.status];
    const Icon = config.icon;
    const currentStageIndex = stageOrder.indexOf(order.status);
    const progressPercent = Math.max(
      0,
      Math.min(100, (currentStageIndex / (stageOrder.length - 1)) * 100),
    );

    return (
      <Card
        key={order.id}
        className="flex h-full flex-col rounded-[28px] border border-white/12 bg-gradient-to-br from-slate-950/85 via-slate-900/55 to-slate-950/85 p-6 shadow-[0_25px_120px_rgba(6,182,212,0.18)] backdrop-blur"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.4em] text-white/45">
              Order · {order.id}
            </p>
            <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
              <MapPin className="h-4 w-4 text-cyan-300" />
              {order.provider}
            </div>
            <p className="text-sm text-white/60">
              Placed {formatDate(order.date)}
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <Badge
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.35em] ${config.classes}`}
            >
              <Icon className="h-3.5 w-3.5" />
              {config.label}
            </Badge>
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">
              {isArchived ? "Completed handoff" : "Live sync"}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-white/45">
              <span>Courier status</span>
              <span className="text-white/80">{config.label}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-emerald-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.3em] text-white/35">
              {stageOrder.map((stage, index) => (
                <span
                  key={`${order.id}-${stage}`}
                  className={
                    index <= currentStageIndex ? "text-white/80" : undefined
                  }
                >
                  {stage.replaceAll("_", " ")}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">
                Items manifest
              </p>
              <div className="space-y-2 text-sm text-white/80">
                {order.items.map((item, idx) => (
                  <div
                    key={`${order.id}-${idx}`}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2"
                  >
                    <span>{item.name}</span>
                    <span className="text-white/60">× {item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/12 bg-white/5 p-4">
              <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">
                Invoice
              </p>
              <div className="mt-3 space-y-2 text-sm text-white/70">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.total * 0.86)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Logistics</span>
                  <span>{formatCurrency(order.total * 0.08)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Service</span>
                  <span>{formatCurrency(order.total * 0.06)}</span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs uppercase tracking-[0.35em] text-white/45">
                  Total
                </p>
                <p className="text-3xl font-semibold text-white">
                  {formatCurrency(order.total)}
                </p>
                <p className="text-xs text-white/60">
                  Auto-calculated • tax inclusive
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-5 text-sm text-white/70 lg:flex-row lg:items-center lg:justify-between">
          <p>
            Need help with this drop? Reference {order.id} for instant routing
            to the correct chef pod.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              asChild
              className="rounded-full border-white/30 text-white hover:bg-white/10"
            >
              <Link href={`/orders/${order.id}`}>View timeline</Link>
            </Button>
            <Button className="rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950">
              Download receipt
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  if (!isAuthenticated || user?.role !== "customer") {
    return (
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
        <Navigation />
        <main className="flex flex-1 items-center justify-center px-4">
          <div className="rounded-[36px] border border-white/15 bg-white/5 px-10 py-12 text-center shadow-[0_30px_140px_rgba(6,182,212,0.25)] backdrop-blur">
            <p className="text-xs uppercase tracking-[0.45em] text-white/50">
              Orders vault
            </p>
            <h1 className="mt-4 text-3xl font-semibold">
              Sign in to track your drops
            </h1>
            <p className="mt-3 text-white/65">
              Sync your courier timeline, delivery ETA, and chef chat in one
              glass board.
            </p>
            <Button
              asChild
              className="mt-8 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950"
            >
              <Link href="/login">Open orders</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Navigation />

      <main className="flex-1">
        <section className="border-b border-white/10 bg-slate-950/80 py-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:px-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-white/50">
                Courier timeline
              </p>
              <h1 className="mt-3 text-4xl font-semibold">
                Orders Control Room
              </h1>
              <p className="mt-4 max-w-xl text-white/70">
                Track chef prep, courier routes, and delivered drops inside a
                single glass dashboard.
              </p>
            </div>
            <div className="grid w-full gap-3 sm:grid-cols-3 lg:w-auto">
              {[
                { label: "Active orders", value: activeOrders.length || "—" },
                { label: "Delivered", value: deliveredOrders.length || "—" },
                { label: "Total spend", value: `$${totalSpend.toFixed(2)}` },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm"
                >
                  <p className="text-[11px] uppercase tracking-[0.4em] text-white/50">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            {mockOrders.length === 0 ? (
              <Card className="rounded-[36px] border-white/15 bg-white/5 p-10 text-center text-white/80 shadow-[0_25px_110px_rgba(6,182,212,0.2)]">
                <p>
                  You haven't placed any orders yet. Once the first drop goes
                  live, it will sync here.
                </p>
                <Button
                  asChild
                  className="mt-6 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950"
                >
                  <Link href="/meals">Browse menu</Link>
                </Button>
              </Card>
            ) : (
              <div className="space-y-10">
                {activeOrders.length > 0 && (
                  <div className="space-y-5">
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-white/45">
                        Live drops
                      </p>
                      <h2 className="text-2xl font-semibold">Active orders</h2>
                    </div>
                    <div className="grid gap-6 lg:grid-cols-2">
                      {activeOrders.map((order) => renderOrderCard(order))}
                    </div>
                  </div>
                )}

                {deliveredOrders.length > 0 && (
                  <div className="space-y-5">
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-white/45">
                        Logbook
                      </p>
                      <h2 className="text-2xl font-semibold">
                        Delivered orders
                      </h2>
                    </div>
                    <div className="grid gap-6 lg:grid-cols-2">
                      {deliveredOrders.map((order) =>
                        renderOrderCard(order, true),
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
