"use client";

import { Navigation } from "@/app/components/Navigation";
import Footer from "@/app/components/Footer";
import { useApp } from "@/app/context/AppContext";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  Truck,
  ShieldCheck,
  Clock,
} from "lucide-react";

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateCartItem, cartTotal } = useApp();
  const { isAuthenticated, user } = useAuth();

  const itemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const deliveryFee = cartTotal >= 50 ? 0 : 2.99;
  const tax = cartTotal * 0.1;
  const grandTotal = cartTotal + deliveryFee + tax;

  // Redirect if not authenticated or not a customer
  if (!isAuthenticated || user?.role !== "customer") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Please sign in</h1>
            <p className="text-muted-foreground">
              You need to be logged in as a customer to view your cart.
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
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Navigation />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="flex flex-col gap-4 rounded-[24px] border border-white/12 bg-gradient-to-br from-slate-950/85 via-slate-900/55 to-slate-950/85 px-6 py-5 shadow-[0_20px_90px_rgba(14,165,233,0.18)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">
                Cart overview
              </p>
              <div className="flex items-center gap-3 text-2xl font-semibold text-white">
                <ShoppingCart className="h-6 w-6 text-cyan-300" />
                <span>
                  {itemsCount} item{itemsCount === 1 ? "" : "s"} ready to
                  confirm
                </span>
              </div>
              <p className="text-sm text-white/65">
                Seamless checkout with live pricing, secure payments, and quick
                delivery windows.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="gap-2 rounded-full border-white/20 bg-white/10 text-white hover:bg-white/15">
                <ShieldCheck className="h-4 w-4" /> Encrypted payments
              </Badge>
              <Badge className="gap-2 rounded-full border-white/20 bg-white/10 text-white hover:bg-white/15">
                <Truck className="h-4 w-4" /> Free delivery $50+
              </Badge>
              <Badge className="gap-2 rounded-full border-white/20 bg-white/10 text-white hover:bg-white/15">
                <Clock className="h-4 w-4" /> Under 1 min
              </Badge>
            </div>
          </div>

          {cart.length === 0 ? (
            <Card className="p-10 text-center space-y-6 rounded-[24px] border border-white/12 bg-white/5 text-white shadow-[0_18px_90px_rgba(14,165,233,0.18)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                <ShoppingCart className="h-7 w-7 text-white/70" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold">Your cart is empty</h1>
                <p className="text-white/65">
                  Add meals you love and we will stage them for a fast checkout
                  experience.
                </p>
              </div>
              <div className="flex justify-center gap-3">
                <Button
                  asChild
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <Link href="/meals">Browse menu</Link>
                </Button>
                <Button
                  asChild
                  className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950"
                >
                  <Link href="/featured">See featured picks</Link>
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item) => {
                  const itemTotal = item.price * item.quantity;
                  const disableDecrease = item.quantity <= 1;

                  return (
                    <Card
                      key={item.id}
                      className="p-4 sm:p-5 flex gap-4 rounded-[20px] border border-white/12 bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-slate-950/80 text-white shadow-[0_18px_90px_rgba(14,165,233,0.16)]"
                    >
                      <div className="w-24 h-24 rounded-[18px] border border-white/10 bg-white/5 flex-shrink-0 overflow-hidden">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between gap-3">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg leading-snug text-white">
                            {item.name}
                          </h3>
                          <p className="text-sm text-white/65">
                            {formatCurrency(item.price)} per portion
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center rounded-full border border-white/15 bg-white/5">
                            <button
                              onClick={() =>
                                !disableDecrease &&
                                updateCartItem(
                                  item.id,
                                  Math.max(1, item.quantity - 1),
                                )
                              }
                              disabled={disableDecrease}
                              className="p-2 hover:bg-white/10 transition-colors rounded-l-full disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="px-4 text-base font-semibold min-w-[2.5rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateCartItem(item.id, item.quantity + 1)
                              }
                              className="p-2 hover:bg-white/10 transition-colors rounded-r-full"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <Badge
                              variant="outline"
                              className="hidden sm:inline-flex border-white/30 text-white"
                            >
                              In stock
                            </Badge>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                              aria-label={`Remove ${item.name}`}
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col justify-between items-end text-right">
                        <span className="text-sm text-white/60">
                          Line total
                        </span>
                        <span className="font-bold text-lg tracking-tight text-white">
                          {formatCurrency(itemTotal)}
                        </span>
                      </div>
                    </Card>
                  );
                })}

                <Card className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-dashed border-white/20 bg-white/5 text-white">
                  <div className="flex items-center gap-2 text-sm text-white/75">
                    <ShieldCheck className="h-4 w-4 text-cyan-300" />
                    <span>Encrypted checkout. Need help? We are here.</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-white hover:bg-white/10"
                  >
                    <Link href="/meals">Add more items</Link>
                  </Button>
                </Card>
              </div>

              {/* Summary */}
              <div>
                <Card className="p-6 sticky top-24 rounded-[24px] border border-white/12 bg-gradient-to-br from-slate-950/90 via-slate-900/65 to-slate-950/90 text-white shadow-[0_18px_90px_rgba(14,165,233,0.2)] backdrop-blur">
                  <h2 className="text-xl font-bold mb-2">Order summary</h2>
                  <p className="text-sm text-white/65 mb-6">
                    Review totals before you confirm.
                  </p>

                  <div className="space-y-3 mb-6 text-sm text-white/80">
                    <div className="flex justify-between">
                      <span className="text-white/65">
                        Subtotal ({itemsCount} item{itemsCount === 1 ? "" : "s"}
                        )
                      </span>
                      <span>{formatCurrency(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/65">Delivery</span>
                      <span>
                        {deliveryFee === 0
                          ? "Free"
                          : formatCurrency(deliveryFee)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/65">Tax (10%)</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                  </div>

                  <Separator className="my-4 border-white/10" />

                  <div className="flex justify-between text-lg font-bold mb-1">
                    <span>Total</span>
                    <span>{formatCurrency(grandTotal)}</span>
                  </div>
                  <p className="text-xs text-white/60 mb-6">
                    Delivery waived on $50+ orders. Adjust quantities anytime.
                  </p>

                  <Button
                    size="lg"
                    className="w-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950"
                    onClick={() => router.push("/checkout")}
                  >
                    Proceed to checkout
                  </Button>

                  <div className="mt-6 space-y-3 text-sm text-white/70">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-cyan-300" />
                      <span>Delivery window: 25-35 minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-cyan-300" />
                      <span>Protected checkout with easy refunds.</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
