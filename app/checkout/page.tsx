"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  MapPin,
  ShieldCheck,
  Truck,
  Wallet,
} from "lucide-react";

import { Navigation } from "@/app/components/Navigation";
import Footer from "@/app/components/Footer";
import { useApp } from "@/app/context/AppContext";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { fetchUserAddresses, type UserAddress } from "@/service/user";
import { createOrder } from "@/service/order";

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { cart, cartTotal, isCartLoading, refreshCart } = useApp();
  const { user, isAuthenticated } = useAuth();

  const [isProcessing, setIsProcessing] = useState(false);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [instructions, setInstructions] = useState("");

  const providerIds = useMemo(
    () => Array.from(new Set(cart.map((item) => item.providerId).filter(Boolean))),
    [cart],
  );

  const hasMixedProviders = providerIds.length > 1;
  const providerProfileId = providerIds[0] ?? "";
  const baseItemsTotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.basePrice * item.quantity, 0),
    [cart],
  );
  const variantExtrasTotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.variantPriceTotal * item.quantity, 0),
    [cart],
  );
  const selectedAddress = addresses.find((address) => address.id === selectedAddressId);
  const deliveryAddress = selectedAddress?.fullAddress?.trim()
    ? selectedAddress.fullAddress
    : [selectedAddress?.line1, selectedAddress?.line2, selectedAddress?.city]
        .filter(Boolean)
        .join(", ");

  useEffect(() => {
    const loadAddresses = async () => {
      if (!isAuthenticated || user?.role !== "customer") return;
      setAddressesLoading(true);

      try {
        const list = await fetchUserAddresses();
        setAddresses(list);

        const defaultAddress = list.find((item) => item.isDefault) ?? list[0];
        setSelectedAddressId(defaultAddress?.id ?? "");
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Unable to load addresses",
          description:
            error instanceof Error ? error.message : "Please refresh and try again.",
        });
      } finally {
        setAddressesLoading(false);
      }
    };

    void loadAddresses();
  }, [isAuthenticated, toast, user?.role]);

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

  if (isCartLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-white/75">Loading checkout...</p>
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
    if (!selectedAddressId) {
      toast({
        variant: "destructive",
        title: "Select a delivery address",
        description: "Choose one of your saved addresses before placing the order.",
      });
      return;
    }

    if (!providerProfileId) {
      toast({
        variant: "destructive",
        title: "Provider missing",
        description: "Cart items must include a valid provider.",
      });
      return;
    }

    if (hasMixedProviders) {
      toast({
        variant: "destructive",
        title: "Mixed providers in cart",
        description: "Please keep items from a single provider in one order.",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const order = await createOrder({
        providerProfileId,
        deliveryAddressId: selectedAddressId,
        paymentMethod: "cash_on_delivery",
        notes: instructions.trim() || undefined,
      });

      await refreshCart();

      toast({
        title: "Order placed",
        description: "Your order has been created successfully.",
      });

      router.push(`/orders/${order.id}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to place order",
        description:
          error instanceof Error ? error.message : "Please try again shortly.",
      });
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
            <div className="lg:col-span-2 space-y-6">
              <Card className="rounded-[22px] border border-white/12 bg-gradient-to-br from-slate-950/85 via-slate-900/55 to-slate-950/85 p-6 text-white shadow-[0_18px_90px_rgba(6,182,212,0.16)] backdrop-blur">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-white/45">
                  <MapPin className="h-4 w-4 text-cyan-300" />
                  Delivery address
                </div>

                <div className="mt-4 space-y-4">
                  {addressesLoading ? (
                    <p className="text-sm text-white/70">Loading addresses...</p>
                  ) : addresses.length > 0 ? (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white/80">
                        Select saved address
                      </label>
                      <select
                        value={selectedAddressId}
                        onChange={(event) => setSelectedAddressId(event.target.value)}
                        className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/70"
                      >
                        {addresses.map((address) => (
                          <option
                            key={address.id}
                            value={address.id}
                            className="bg-slate-900"
                          >
                            {address.label || "Address"} -{" "}
                            {address.fullAddress || address.line1}
                          </option>
                        ))}
                      </select>
                      {deliveryAddress && (
                        <p className="text-sm text-white/65">{deliveryAddress}</p>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-amber-300/25 bg-amber-400/10 p-4 text-amber-100">
                      <p className="font-semibold">No saved address found.</p>
                      <p className="mt-1 text-sm">
                        Add one from your profile before placing this order.
                      </p>
                      <Button asChild className="mt-3" variant="outline">
                        <Link href="/profile#address-form">Add address</Link>
                      </Button>
                    </div>
                  )}

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
                        <p className="font-semibold text-white">Cash on delivery</p>
                        <p className="text-sm text-white/60">
                          Pay when your order arrives
                        </p>
                      </div>
                    </div>
                    <Badge className="rounded-full border-white/20 bg-white/10 text-white">
                      Recommended
                    </Badge>
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
                        <p className="text-xs text-white/55">
                          Base {formatCurrency(item.basePrice)}
                          {item.variantPriceTotal !== 0 && (
                            <>
                              {" "}
                              + variants {formatCurrency(item.variantPriceTotal)}
                            </>
                          )}
                        </p>
                        {item.selectedVariants.length > 0 && (
                          <div className="space-y-0.5">
                            {item.selectedVariants.map((variant) => (
                              <p
                                key={`${item.id}-${variant.optionId}`}
                                className="text-xs text-cyan-200/90"
                              >
                                {variant.variantName
                                  ? `${variant.variantName}: ${variant.optionTitle}`
                                  : variant.optionTitle}{" "}
                                ({formatCurrency(variant.priceDelta)})
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="font-semibold text-white">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                {hasMixedProviders && (
                  <div className="mt-4 rounded-2xl border border-rose-300/25 bg-rose-400/10 p-4 text-sm text-rose-100">
                    This cart has multiple providers. Keep one provider per order.
                  </div>
                )}
              </Card>
            </div>

            <div>
              <Card className="p-6 sticky top-24 rounded-[24px] border border-white/12 bg-gradient-to-br from-slate-950/90 via-slate-900/65 to-slate-950/90 text-white shadow-[0_18px_90px_rgba(6,182,212,0.2)] backdrop-blur">
                <h2 className="text-xl font-bold mb-2">Order summary</h2>
                <p className="text-sm text-white/65 mb-6">
                  Review totals before you confirm.
                </p>

                <div className="space-y-3 mb-6 text-sm text-white/80">
                  <div className="flex justify-between">
                    <span className="text-white/65">Base items</span>
                    <span>{formatCurrency(baseItemsTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/65">Variant extras</span>
                    <span>{formatCurrency(variantExtrasTotal)}</span>
                  </div>
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
                  <span>{formatCurrency(cartTotal + 2.99 + cartTotal * 0.1)}</span>
                </div>
                <p className="text-xs text-white/60 mb-6">
                  Delivery fees waived on orders $50+. You can still edit your
                  cart.
                </p>

                <Button
                  size="lg"
                  className="w-full mb-3 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950"
                  disabled={
                    isProcessing ||
                    isCartLoading ||
                    !selectedAddressId ||
                    hasMixedProviders
                  }
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
