"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/app/components/Navigation";
import Footer from "@/app/components/Footer";
import { useApp } from "@/app/context/AppContext";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  ShieldCheck,
  MapPin,
  Wallet,
  Truck,
  Clock,
  ArrowLeft,
} from "lucide-react";

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useApp();
  const { user, isAuthenticated } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || "");
  const [instructions, setInstructions] = useState("");

  if (!isAuthenticated || user?.role !== "customer") {
    return (
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
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

  if (cart.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Your cart is empty</h1>
            <Button asChild>
              <Link href="/meals">Continue Shopping</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      alert("Please enter delivery address");
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Clear cart and redirect to orders
      clearCart();
      router.push("/orders");
    } catch (error) {
      console.error("Order failed:", error);
      alert("Failed to place order");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Navigation />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="flex flex-col gap-4 rounded-[24px] border border-white/12 bg-gradient-to-br from-slate-950/85 via-slate-900/55 to-slate-950/85 px-6 py-5 shadow-[0_20px_90px_rgba(6,182,212,0.18)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">
                Secure checkout
              </p>
              <div className="flex items-center gap-3 text-2xl font-semibold text-white">
                <Wallet className="h-6 w-6 text-cyan-300" />
                <span>Confirm your order</span>
              </div>
              <p className="text-sm text-white/65">
                Encrypted payments, tracked delivery, and instant confirmations.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="gap-2 rounded-full border-white/20 bg-white/10 text-white hover:bg-white/15">
                <ShieldCheck className="h-4 w-4" /> Protected
              </Badge>
              <Badge className="gap-2 rounded-full border-white/20 bg-white/10 text-white hover:bg-white/15">
                <Truck className="h-4 w-4" /> 25-35 min ETA
              </Badge>
              <Badge className="gap-2 rounded-full border-white/20 bg-white/10 text-white hover:bg-white/15">
                <Clock className="h-4 w-4" /> One-page flow
              </Badge>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="rounded-[22px] border border-white/12 bg-gradient-to-br from-slate-950/85 via-slate-900/55 to-slate-950/85 p-6 text-white shadow-[0_18px_90px_rgba(6,182,212,0.16)] backdrop-blur">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-white/45">
                  <MapPin className="h-4 w-4 text-cyan-300" />
                  Delivery address
                </div>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white/80">
                      Full address
                    </label>
                    <Input
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="123 Main St, City, State ZIP"
                      required
                      className="bg-white/5 border-white/15 text-white placeholder:text-white/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white/80">
                      Delivery notes (optional)
                    </label>
                    <Input
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="Gate code, buzzer, leave at door, etc."
                      className="bg-white/5 border-white/15 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>
              </Card>

              <Card className="rounded-[22px] border border-white/12 bg-gradient-to-br from-slate-950/85 via-slate-900/55 to-slate-950/85 p-6 text-white shadow-[0_18px_90px_rgba(6,182,212,0.16)] backdrop-blur">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-white/45">
                  <Wallet className="h-4 w-4 text-cyan-300" />
                  Payment
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        defaultChecked
                        className="h-4 w-4"
                      />
                      <div>
                        <p className="font-semibold text-white">
                          Cash on delivery
                        </p>
                        <p className="text-sm text-white/60">
                          Pay when your order arrives
                        </p>
                      </div>
                    </div>
                    <Badge className="rounded-full border-white/20 bg-white/10 text-white">
                      Recommended
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/50">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        disabled
                        className="h-4 w-4"
                      />
                      <div>
                        <p className="font-semibold">Card (coming soon)</p>
                        <p className="text-sm">Save cards and pay instantly.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="rounded-[22px] border border-white/12 bg-gradient-to-br from-slate-950/85 via-slate-900/55 to-slate-950/85 p-6 text-white shadow-[0_18px_90px_rgba(6,182,212,0.16)] backdrop-blur">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-white/45">
                    <ArrowLeft className="h-4 w-4 text-cyan-300 rotate-180" />
                    Order items
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-white hover:bg-white/10"
                  >
                    <Link href="/cart">Edit cart</Link>
                  </Button>
                </div>
                <div className="mt-4 space-y-3 text-sm text-white/80">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <div className="space-y-0.5">
                        <p className="font-semibold text-white">{item.name}</p>
                        <p className="text-white/60">Qty {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-white">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="p-6 sticky top-24 rounded-[24px] border border-white/12 bg-gradient-to-br from-slate-950/90 via-slate-900/65 to-slate-950/90 text-white shadow-[0_18px_90px_rgba(6,182,212,0.2)] backdrop-blur">
                <h2 className="text-xl font-bold mb-2">Order summary</h2>
                <p className="text-sm text-white/65 mb-6">
                  Review totals before you confirm.
                </p>

                <div className="space-y-3 mb-6 text-sm text-white/80">
                  <div className="flex justify-between">
                    <span className="text-white/65">Subtotal</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/65">Delivery</span>
                    <span>{formatCurrency(2.99)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/65">Tax (10%)</span>
                    <span>{formatCurrency(cartTotal * 0.1)}</span>
                  </div>
                </div>

                <Separator className="my-4 border-white/10" />

                <div className="flex justify-between text-lg font-bold mb-1">
                  <span>Total</span>
                  <span>
                    {formatCurrency(cartTotal + 2.99 + cartTotal * 0.1)}
                  </span>
                </div>
                <p className="text-xs text-white/60 mb-6">
                  Delivery fees waived on orders $50+. You can still edit your
                  cart.
                </p>

                <Button
                  size="lg"
                  className="w-full mb-3 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950"
                  disabled={isProcessing}
                  onClick={handlePlaceOrder}
                >
                  {isProcessing ? "Processing..." : "Place order securely"}
                </Button>

                <Button
                  variant="outline"
                  className="w-full bg-transparent text-white border-white/30 hover:bg-white/10"
                  asChild
                  disabled={isProcessing}
                >
                  <Link href="/cart">Back to cart</Link>
                </Button>

                <div className="mt-6 space-y-3 text-sm text-white/70">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-cyan-300" />
                    <span>Protected checkout with easy refunds.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-cyan-300" />
                    <span>Delivery window: 25-35 minutes.</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
