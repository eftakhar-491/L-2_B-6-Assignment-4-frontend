"use client";

import { Navigation } from "@/app/components/Navigation";
import Footer from "@/app/components/Footer";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Clock,
  Phone,
  User,
  ArrowLeft,
  Truck,
  CheckCircle,
  Receipt,
} from "lucide-react";

// Mock order data
const mockOrder = {
  id: "ORD001",
  date: "2024-01-25",
  status: "delivered",
  provider: {
    name: "Pizza Palace",
    phone: "+1 (555) 0123",
    address: "456 Restaurant Ave, City",
    rating: 4.8,
  },
  items: [
    { id: 1, name: "Margherita Pizza", quantity: 1, price: 12.99 },
    { id: 2, name: "Pasta Carbonara", quantity: 1, price: 11.99 },
  ],
  deliveryAddress: "123 Main St, City, State ZIP",
  subtotal: 24.98,
  deliveryFee: 2.99,
  tax: 2.5,
  total: 30.47,
  estimatedDelivery: "2024-01-25 19:30",
  timeline: [
    { status: "Order Placed", time: "18:45", completed: true },
    { status: "Confirmed", time: "18:47", completed: true },
    { status: "Preparing", time: "18:50", completed: true },
    { status: "Ready", time: "19:10", completed: true },
    { status: "Out for Delivery", time: "19:15", completed: true },
    { status: "Delivered", time: "19:35", completed: true },
  ],
};

const statusConfig = {
  pending: {
    label: "Pending",
    classes: "border border-amber-200/40 bg-amber-300/10 text-amber-100",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    classes: "border border-cyan-200/40 bg-cyan-300/10 text-cyan-100",
    icon: CheckCircle,
  },
  preparing: {
    label: "Preparing",
    classes: "border border-orange-200/40 bg-orange-300/10 text-orange-100",
    icon: Clock,
  },
  ready: {
    label: "Ready",
    classes: "border border-emerald-200/40 bg-emerald-300/10 text-emerald-100",
    icon: CheckCircle,
  },
  out_for_delivery: {
    label: "Courier en route",
    classes: "border border-purple-200/40 bg-purple-300/10 text-purple-100",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    classes: "border border-lime-200/40 bg-lime-300/10 text-lime-100",
    icon: CheckCircle,
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

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

export default function OrderDetailsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || user?.role !== "customer") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Please sign in</h1>
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const statusKey = mockOrder.status as keyof typeof statusConfig;
  const config = statusConfig[statusKey];
  const Icon = config.icon;
  const currentStageIndex = stageOrder.indexOf(statusKey);
  const progressPercent = Math.max(
    0,
    Math.min(100, (currentStageIndex / (stageOrder.length - 1)) * 100),
  );

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Navigation />

      <main className="flex-1">
        <section className="border-b border-white/10 bg-slate-950/80 py-8 sm:py-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Badge
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.35em] ${config.classes}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {config.label}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.35em] text-white/50">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  Order · {mockOrder.id}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  Provider · {mockOrder.provider.name}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  Placed · {mockOrder.date}
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-[28px] border border-white/12 bg-gradient-to-br from-slate-950/85 via-slate-900/55 to-slate-950/85 p-6 shadow-[0_25px_120px_rgba(6,182,212,0.18)] backdrop-blur">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.45em] text-white/45">
                    Delivery overview
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold">
                    {mockOrder.provider.name} → You
                  </h1>
                  <p className="mt-2 text-white/65">
                    ETA {mockOrder.estimatedDelivery} •{" "}
                    {mockOrder.deliveryAddress}
                  </p>
                </div>
                <div className="grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { label: "Total", value: formatCurrency(mockOrder.total) },
                    { label: "Placed", value: mockOrder.date },
                    { label: "Courier status", value: config.label },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">
                        {item.label}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-white/45">
                  <span>Progress</span>
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
                      key={stage}
                      className={
                        index <= currentStageIndex ? "text-white/80" : undefined
                      }
                    >
                      {stage.replaceAll("_", " ")}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <Card className="rounded-[24px] border border-white/12 bg-gradient-to-br from-slate-950/85 via-slate-900/55 to-slate-950/85 p-6 shadow-[0_18px_90px_rgba(6,182,212,0.18)] backdrop-blur">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-white/45">
                    <Clock className="h-4 w-4 text-cyan-300" />
                    Live timeline
                  </div>
                  <div className="mt-5 space-y-5">
                    {mockOrder.timeline.map((item, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`h-4 w-4 rounded-full ${item.completed ? "bg-gradient-to-r from-cyan-300 to-emerald-300" : "bg-white/15"}`}
                          />
                          {idx < mockOrder.timeline.length - 1 && (
                            <div
                              className={`h-10 w-px ${item.completed ? "bg-gradient-to-b from-cyan-300 to-emerald-300" : "bg-white/10"}`}
                            />
                          )}
                        </div>
                        <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-white">
                              {item.status}
                            </p>
                            <span className="text-xs text-white/60">
                              {item.time}
                            </span>
                          </div>
                          <p className="text-sm text-white/65">
                            {item.completed ? "Completed" : "Pending"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="rounded-[24px] border border-white/12 bg-gradient-to-br from-slate-950/85 via-slate-900/55 to-slate-950/85 p-6 shadow-[0_18px_90px_rgba(6,182,212,0.18)] backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] uppercase tracking-[0.35em] text-white/45">
                      Items manifest
                    </div>
                    <Receipt className="h-4 w-4 text-cyan-300" />
                  </div>
                  <div className="mt-4 space-y-3 text-sm text-white/80">
                    {mockOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                      >
                        <div>
                          <p className="font-semibold text-white">
                            {item.name}
                          </p>
                          <p className="text-white/60">Qty {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-white">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="rounded-[24px] border border-white/12 bg-white/5 p-5 text-white">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-cyan-300" />
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">
                          Delivery address
                        </p>
                        <p className="mt-1 text-white/80">
                          {mockOrder.deliveryAddress}
                        </p>
                        <p className="text-white/50">
                          ETA {mockOrder.estimatedDelivery}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="rounded-[24px] border border-white/12 bg-white/5 p-5 text-white">
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-cyan-300" />
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">
                          Support
                        </p>
                        <p className="mt-1 text-white/80">
                          {mockOrder.provider.phone}
                        </p>
                        <p className="text-white/50">
                          Call restaurant for live updates
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                <Card className="rounded-[24px] border border-white/12 bg-white/5 p-5 text-white">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-cyan-300" />
                    <div className="space-y-1">
                      <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">
                        Provider
                      </p>
                      <p className="text-lg font-semibold text-white">
                        {mockOrder.provider.name}
                      </p>
                      <p className="text-white/60">
                        Rating {mockOrder.provider.rating} ★
                      </p>
                      <p className="text-white/50">
                        {mockOrder.provider.address}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <div>
                <Card className="sticky top-24 rounded-[24px] border border-white/12 bg-gradient-to-br from-slate-950/90 via-slate-900/65 to-slate-950/90 p-6 shadow-[0_18px_90px_rgba(6,182,212,0.2)] backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">
                        Invoice
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-white">
                        Summary
                      </h2>
                    </div>
                    <Icon className="h-5 w-5 text-cyan-300" />
                  </div>

                  <div className="mt-6 space-y-3 text-sm text-white/75">
                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span>{formatCurrency(mockOrder.subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Delivery</span>
                      <span>{formatCurrency(mockOrder.deliveryFee)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tax</span>
                      <span>{formatCurrency(mockOrder.tax)}</span>
                    </div>
                  </div>

                  <Separator className="my-5 border-white/10" />

                  <div className="flex items-center justify-between text-lg font-semibold text-white">
                    <span>Total</span>
                    <span>{formatCurrency(mockOrder.total)}</span>
                  </div>

                  {mockOrder.status === "delivered" ? (
                    <Button
                      className="mt-6 w-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950"
                      asChild
                    >
                      <Link href="/meals">Order again</Link>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="mt-6 w-full rounded-full border-white/30 text-white hover:bg-white/10"
                      asChild
                    >
                      <Link href="/orders">Back to orders</Link>
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="mt-3 w-full rounded-full border-white/20 text-white hover:bg-white/10"
                    onClick={() => router.push("/orders")}
                  >
                    View all orders
                  </Button>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
