"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  ShieldCheck,
} from "lucide-react";

import { Navigation } from "@/app/components/Navigation";
import Footer from "@/app/components/Footer";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  AddressCreatePayload,
  UserAddress,
  UserProfile,
  createUserAddress,
  fetchUserAddresses,
  fetchUserProfile,
  updateUserProfile,
} from "@/service/user";

interface ProfileFormState {
  name: string;
  email: string;
  phone: string;
  bio: string;
}

const emptyProfile: ProfileFormState = {
  name: "",
  email: "",
  phone: "",
  bio: "",
};

const emptyAddressForm: AddressCreatePayload = {
  label: "Home",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  instructions: "",
  isDefault: false,
};

export default function ProfilePage() {
  const { isAuthenticated, user, refetchSession } = useAuth();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    ...emptyProfile,
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
  });
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [addressForm, setAddressForm] = useState<AddressCreatePayload>({
    ...emptyAddressForm,
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [creatingAddress, setCreatingAddress] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const initials = useMemo(() => {
    const source = profileForm.name || profileData?.name || user?.name || "You";
    return (
      source
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((chunk) => chunk[0]?.toUpperCase())
        .join("") || "YOU"
    );
  }, [profileForm.name, profileData?.name, user?.name]);

  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const profile = await fetchUserProfile();
      setProfileData(profile);
      setProfileForm({
        name: profile.name ?? user?.name ?? "",
        email: profile.email ?? user?.email ?? "",
        phone: profile.phone ?? user?.phone ?? "",
        bio: profile.bio ?? "",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Unable to load profile",
        description:
          error instanceof Error ? error.message : "Please try again soon.",
      });
    } finally {
      setProfileLoading(false);
    }
  }, [toast, user?.email, user?.name, user?.phone]);

  const loadAddresses = useCallback(async () => {
    setAddressesLoading(true);
    try {
      const list = await fetchUserAddresses();
      setAddresses(list);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Unable to load addresses",
        description:
          error instanceof Error ? error.message : "Please try again soon.",
      });
    } finally {
      setAddressesLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadProfile();
    loadAddresses();
  }, [isAuthenticated, loadProfile, loadAddresses]);

  if (!isAuthenticated || user?.role !== "customer") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navigation />
        <main className="flex flex-1 items-center justify-center px-4">
          <Card className="max-w-md space-y-6 p-8 text-center">
            <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
            <div>
              <h1 className="text-2xl font-semibold">Sign in required</h1>
              <p className="mt-2 text-muted-foreground">
                Access personalized settings, saved addresses, and loyalty perks
                by signing into your customer account.
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/login">Sign in</Link>
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const handleProfileSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!isEditingProfile) {
      setIsEditingProfile(true);
      return;
    }

    setSavingProfile(true);
    try {
      const updated = await updateUserProfile(profileForm);
      setProfileData(updated);
      setProfileForm({
        name: updated.name ?? profileForm.name,
        email: updated.email ?? profileForm.email,
        phone: updated.phone ?? profileForm.phone,
        bio: updated.bio ?? profileForm.bio,
      });
      setIsEditingProfile(false);
      toast({
        title: "Profile updated",
        description: "Your preferences are now synced across devices.",
      });
      await refetchSession();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Unable to save profile",
        description:
          error instanceof Error ? error.message : "Please try again later.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelProfile = () => {
    if (!profileData) return;
    setProfileForm({
      name: profileData.name ?? "",
      email: profileData.email ?? "",
      phone: profileData.phone ?? "",
      bio: profileData.bio ?? "",
    });
    setIsEditingProfile(false);
  };

  const handleAddressSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setCreatingAddress(true);
    try {
      await createUserAddress(addressForm);
      setAddressForm({ ...emptyAddressForm });
      toast({
        title: "Address saved",
        description: "New delivery spot added to your vault.",
      });
      await loadAddresses();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Unable to add address",
        description:
          error instanceof Error ? error.message : "Please try again later.",
      });
    } finally {
      setCreatingAddress(false);
    }
  };

  const stats = {
    orders: profileData?.stats?.totalOrders ?? 0,
    favorites: profileData?.stats?.favoriteVendors ?? 0,
    loyalty: profileData?.stats?.loyaltyPoints ?? 0,
  };

  const membershipTier = profileData?.membershipTier ?? "Explorer";

  const heroLoading = profileLoading && !profileData;

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.35),_transparent_70%)]" />
      </div>
      <Navigation />
      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-10">
        <section className="mx-auto max-w-6xl">
          <Card className="relative overflow-hidden border border-white/10 bg-white/5 p-8 backdrop-blur">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-emerald-500/10" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 items-center gap-4">
                {heroLoading ? (
                  <Skeleton className="h-20 w-20 rounded-full" />
                ) : (
                  <Avatar className="h-20 w-20 border-2 border-white/30">
                    <AvatarImage src={profileData?.avatarUrl ?? undefined} />
                    <AvatarFallback className="bg-slate-800 text-xl font-semibold text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div>
                  {heroLoading ? (
                    <Skeleton className="mb-2 h-8 w-40" />
                  ) : (
                    <h1 className="text-3xl font-semibold text-white">
                      {profileForm.name || "Your Name"}
                    </h1>
                  )}
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-300">
                    <span className="inline-flex items-center gap-2">
                      <Mail className="h-4 w-4 text-cyan-300" />
                      {profileForm.email || "Email not set"}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Phone className="h-4 w-4 text-cyan-300" />
                      {profileForm.phone || "Phone not set"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-start gap-3 rounded-2xl border border-white/10 bg-slate-900/60 px-5 py-4 text-sm">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                  Membership tier
                </p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-cyan-500/20 text-cyan-100">
                    {membershipTier}
                  </Badge>
                  <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                </div>
                <p className="text-slate-300">
                  Unlock faster delivery and exclusive meals as you keep
                  ordering.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: "Total orders",
                  value: stats.orders,
                },
                {
                  label: "Favorite vendors",
                  value: stats.favorites,
                },
                {
                  label: "Loyalty points",
                  value: stats.loyalty,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-slate-900/60 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    {item.label}
                  </p>
                  {heroLoading ? (
                    <Skeleton className="mt-3 h-8 w-16" />
                  ) : (
                    <p className="mt-3 text-3xl font-semibold text-white">
                      {item.value}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Card
              id="address-form"
              className="space-y-6 border border-white/10 bg-white/5 p-8 backdrop-blur"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Account information
                  </p>
                  <h2 className="text-2xl font-semibold text-white">
                    Keep your details current
                  </h2>
                  <p className="text-sm text-slate-300">
                    Changes sync instantly to order receipts and delivery crews.
                  </p>
                </div>
                <Badge className="w-fit bg-emerald-500/20 text-emerald-100">
                  Secure & encrypted
                </Badge>
              </div>
              <form className="space-y-5" onSubmit={handleProfileSubmit}>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Full name
                    </label>
                    <Input
                      value={profileForm.name}
                      onChange={(event) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }))
                      }
                      placeholder="Jane Foodie"
                      disabled={savingProfile || !isEditingProfile}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={profileForm.email}
                      onChange={(event) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          email: event.target.value,
                        }))
                      }
                      placeholder="you@example.com"
                      disabled={savingProfile || !isEditingProfile}
                    />
                  </div>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Phone
                    </label>
                    <Input
                      value={profileForm.phone}
                      onChange={(event) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          phone: event.target.value,
                        }))
                      }
                      placeholder="+1 (555) 123-4567"
                      disabled={savingProfile || !isEditingProfile}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Bio / delivery instructions
                    </label>
                    <Textarea
                      value={profileForm.bio}
                      onChange={(event) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          bio: event.target.value,
                        }))
                      }
                      rows={3}
                      placeholder="Share dietary notes, favorite kitchens, or concierge preferences."
                      disabled={savingProfile || !isEditingProfile}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 border-t border-white/5 pt-5">
                  {isEditingProfile ? (
                    <>
                      <Button
                        type="submit"
                        className="min-w-[160px]"
                        disabled={savingProfile}
                      >
                        {savingProfile ? (
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" /> Saving
                          </span>
                        ) : (
                          "Save profile"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelProfile}
                        disabled={savingProfile}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="submit"
                      className="min-w-[160px]"
                      variant="default"
                    >
                      Edit profile
                    </Button>
                  )}
                </div>
              </form>
            </Card>

            <Card className="space-y-6 border border-white/10 bg-white/5 p-8 backdrop-blur">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-10 w-10 text-cyan-300" />
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                    Address vault
                  </p>
                  <h2 className="text-xl font-semibold text-white">
                    Quick-drop delivery spots
                  </h2>
                </div>
              </div>
              <form className="space-y-4" onSubmit={handleAddressSubmit}>
                <Input
                  placeholder="Label (Home, Office, Studio...)"
                  value={addressForm.label}
                  onChange={(event) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      label: event.target.value,
                    }))
                  }
                  required
                  disabled={creatingAddress}
                />
                <Input
                  placeholder="Street address"
                  value={addressForm.line1}
                  onChange={(event) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      line1: event.target.value,
                    }))
                  }
                  required
                  disabled={creatingAddress}
                />
                <Input
                  placeholder="Apt, suite, floor (optional)"
                  value={addressForm.line2}
                  onChange={(event) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      line2: event.target.value,
                    }))
                  }
                  disabled={creatingAddress}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    placeholder="City"
                    value={addressForm.city}
                    onChange={(event) =>
                      setAddressForm((prev) => ({
                        ...prev,
                        city: event.target.value,
                      }))
                    }
                    required
                    disabled={creatingAddress}
                  />
                  <Input
                    placeholder="State / Region"
                    value={addressForm.state}
                    onChange={(event) =>
                      setAddressForm((prev) => ({
                        ...prev,
                        state: event.target.value,
                      }))
                    }
                    required
                    disabled={creatingAddress}
                  />
                </div>
                <Input
                  placeholder="Postal code"
                  value={addressForm.postalCode}
                  onChange={(event) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      postalCode: event.target.value,
                    }))
                  }
                  required
                  disabled={creatingAddress}
                />
                <Textarea
                  placeholder="Courier instructions (optional)"
                  value={addressForm.instructions}
                  onChange={(event) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      instructions: event.target.value,
                    }))
                  }
                  rows={3}
                  disabled={creatingAddress}
                />
                <label className="flex items-center gap-3 text-sm text-slate-200">
                  <Checkbox
                    checked={addressForm.isDefault}
                    onCheckedChange={(checked) =>
                      setAddressForm((prev) => ({
                        ...prev,
                        isDefault: Boolean(checked),
                      }))
                    }
                    disabled={creatingAddress}
                  />
                  Make this my default drop-off location
                </label>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={creatingAddress}
                >
                  {creatingAddress ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Plus className="h-4 w-4" /> Save address
                    </span>
                  )}
                </Button>
              </form>
              <p className="text-xs text-slate-400">
                Need corporate or multi-seat ordering? Our account team can
                help.
                <Link href="/contact" className="ml-1 underline">
                  Contact support
                </Link>
              </p>
            </Card>
          </div>

          <Card className="mt-6 space-y-6 border border-white/10 bg-white/5 p-8 backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Saved addresses
                </p>
                <h2 className="text-2xl font-semibold text-white">
                  Manage every drop point
                </h2>
                <p className="text-sm text-slate-300">
                  Optimize for lightning deliveries by keeping each location
                  complete.
                </p>
              </div>
              <Badge variant="outline" className="text-cyan-200">
                {addresses.length} stored
              </Badge>
            </div>
            {addressesLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-36 rounded-2xl" />
                ))}
              </div>
            ) : addresses.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {addresses.map((address, index) => (
                  <div
                    key={address.id ?? `${address.label}-${index}`}
                    className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-5"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-cyan-300" />
                        <p className="text-lg font-semibold text-white">
                          {address.label}
                        </p>
                        {address.isDefault && (
                          <Badge className="bg-emerald-500/20 text-emerald-100">
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-300">
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ""}
                      </p>
                      <p className="text-sm text-slate-400">
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                      {address.instructions && (
                        <p className="text-xs text-slate-500">
                          Notes: {address.instructions}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 text-xs text-slate-400">
                      Last updated moments ago
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/20 bg-slate-900/40 p-8 text-center">
                <MapPin className="h-10 w-10 text-cyan-300" />
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    No addresses saved yet
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Add your first location to unlock lightning-fast reorders
                    and scheduled drops.
                  </p>
                </div>
                <Button asChild variant="outline">
                  <Link href="#address-form">Add an address above</Link>
                </Button>
              </div>
            )}
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
