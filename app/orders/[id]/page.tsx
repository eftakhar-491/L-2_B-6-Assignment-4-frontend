"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  MapPin,
  Receipt,
  Truck,
  User,
  XCircle,
} from "lucide-react";

import { Navigation } from "@/app/components/Navigation";
import Footer from "@/app/components/Footer";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  cancelOrder,
  fetchOrderById,
  type BackendOrder,
  type OrderStatus,
} from "@/service/order";

const stageOrder: OrderStatus[] = ["placed", "preparing", "ready", "delivered"];

const statusConfig: Record<
  OrderStatus,
  { label: string; classes: string; icon: typeof Clock }
> = {
  placed: {
    label: "Placed",
    classes: "border border-amber-200/40 bg-amber-300/10 text-amber-100",
    icon: Clock,
  },
  preparing: {
    label: "Preparing",
    classes: "border border-orange-200/40 bg-orange-300/10 text-orange-100",
    icon: Clock,
  },
  ready: {
    label: "Ready",
    classes: "border border-cyan-200/40 bg-cyan-300/10 text-cyan-100",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    classes: "border border-lime-200/40 bg-lime-300/10 text-lime-100",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    classes: "border border-rose-200/40 bg-rose-300/10 text-rose-100",
    icon: XCircle,
  },
};

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatCurrency = (value: unknown) => `$${toNumber(value, 0).toFixed(2)}`;
const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
const formatTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Pending";

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const orderId = params?.id;

  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const [order, setOrder] = useState<BackendOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCanceling, setIsCanceling] = useState(false);

  const loadOrder = useCallback(async () => {
    if (!orderId) return;
    setIsLoading(true);
    try {
      const payload = await fetchOrderById(orderId);
      setOrder(payload);
    } catch (error) {
      setOrder(null);
      toast({
        variant: "destructive",
        title: "Unable to load order",
        description:
          error instanceof Error ? error.message : "Please try again shortly.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [orderId, toast]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "customer") return;
    void loadOrder();
  }, [isAuthenticated, loadOrder, user?.role]);

  const handleCancel = async () => {
    if (!order || order.status !== "placed") return;
    setIsCanceling(true);
    try {
      const cancelled = await cancelOrder(order.id);
      setOrder((previous) => ({ ...(previous as BackendOrder), ...cancelled }));
      toast({
        title: "Order cancelled",
        description: "Your order has been cancelled.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Cancellation failed",
        description:
          error instanceof Error ? error.message : "Please try again shortly.",
      });
    } finally {
      setIsCanceling(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-white/75">Loading order details...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <Card className="p-8 text-center bg-white/5 border-white/15 text-white">
            <h1 className="text-2xl font-bold">Order not found</h1>
            <Button asChild className="mt-4">
              <Link href="/orders">Back to orders</Link>
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const config = statusConfig[order.status];
  const Icon = config.icon;

  const currentStageIndex =
    order.status === "cancelled" ? -1 : stageOrder.indexOf(order.status);
  const progressPercent =
    currentStageIndex < 0
      ? 0
      : Math.max(0, Math.min(100, (currentStageIndex / (stageOrder.length - 1)) * 100));

  const subtotal = order.items.reduce(
    (sum, item) => sum + toNumber(item.subtotal, 0),
    0,
  );

  const timeline = [
    {
      key: "placed",
      status: "Order Placed",
      time: formatTime(order.placedAt),
      completed: true,
    },
    {
      key: "preparing",
      status: "Preparing",
      time: formatTime(order.preparedAt),
      completed: currentStageIndex >= 1,
    },
    {
      key: "ready",
      status: "Ready",
      time: formatTime(order.readyAt),
      completed: currentStageIndex >= 2,
    },
    {
      key: "delivered",
      status: "Delivered",
      time: formatTime(order.deliveredAt),
      completed: currentStageIndex >= 3,
    },
    ...(order.status === "cancelled"
      ? [
          {
            key: "cancelled",
            status: "Cancelled",
            time: formatTime(order.cancelledAt),
            completed: true,
          },
        ]
      : []),
  ];

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
                  Order - {order.id.slice(0, 8)}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  Provider - {order.providerProfile?.name ?? "Provider"}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  Placed - {formatDate(order.placedAt)}
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
                    {order.providerProfile?.name ?? "Provider"} to You
                  </h1>
                  <p className="mt-2 text-white/65">
                    {order.address?.fullAddress ?? "Address unavailable"}
                  </p>
                </div>
                <div className="grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { label: "Total", value: formatCurrency(order.totalAmount) },
                    { label: "Placed", value: formatDate(order.placedAt) },
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

              {order.status !== "cancelled" && (
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
                        className={index <= currentStageIndex ? "text-white/80" : undefined}
                      >
                        {stage.replaceAll("_", " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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
                    {timeline.map((item, idx) => (
                      <div key={item.key} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`h-4 w-4 rounded-full ${item.completed ? "bg-gradient-to-r from-cyan-300 to-emerald-300" : "bg-white/15"}`}
                          />
                          {idx < timeline.length - 1 && (
                            <div
                              className={`h-10 w-px ${item.completed ? "bg-gradient-to-b from-cyan-300 to-emerald-300" : "bg-white/10"}`}
                            />
                          )}
                        </div>
                        <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-white">{item.status}</p>
                            <span className="text-xs text-white/60">{item.time}</span>
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
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                      >
                        <div>
                          <p className="font-semibold text-white">
                            {item.meal?.title ?? "Meal"}
                          </p>
                          <p className="text-white/60">Qty {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-white">
                          {formatCurrency(item.subtotal)}
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
                          {order.address?.fullAddress ?? "Address unavailable"}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="rounded-[24px] border border-white/12 bg-white/5 p-5 text-white">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-cyan-300" />
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">
                          Provider
                        </p>
                        <p className="mt-1 text-white/80">
                          {order.providerProfile?.name ?? "Provider"}
                        </p>
                        <p className="text-white/50">
                          Payment: {order.paymentMethod.replaceAll("_", " ")}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
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
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Grand total</span>
                      <span>{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>

                  <Separator className="my-5 border-white/10" />

                  <div className="flex items-center justify-between text-lg font-semibold text-white">
                    <span>Status</span>
                    <span>{config.label}</span>
                  </div>

                  {order.status === "placed" ? (
                    <Button
                      variant="outline"
                      className="mt-6 w-full rounded-full border-rose-300/35 text-rose-100 hover:bg-rose-500/15"
                      disabled={isCanceling}
                      onClick={handleCancel}
                    >
                      {isCanceling ? "Cancelling..." : "Cancel order"}
                    </Button>
                  ) : (
                    <Button
                      className="mt-6 w-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950"
                      asChild
                    >
                      <Link href="/meals">Order again</Link>
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
