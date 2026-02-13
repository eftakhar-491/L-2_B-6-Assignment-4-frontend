"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ShoppingCart,
  Menu,
  X,
  ChefHat,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

import { useAuth } from "@/app/context/AuthContext";
import { useApp } from "@/app/context/AppContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const baseLinks = [
  { label: "Meals", href: "/meals" },
  { label: "Providers", href: "/providers" },
];

const roleLinks = {
  customer: [
    { label: "Orders", href: "/orders" },
    { label: "Profile", href: "/profile" },
  ],
  provider: [
    { label: "Dashboard", href: "/provider/dashboard" },
    { label: "Menu", href: "/provider/menu" },
    { label: "Orders", href: "/provider/orders" },
  ],
  admin: [{ label: "Admin", href: "/admin" }],
  super_admin: [
    { label: "Super Admin", href: "/super-admin" },
    { label: "User Access", href: "/super-admin/users" },
    { label: "Admin", href: "/admin" },
  ],
} as const;

export function Navigation() {
  const { user, logout, isAuthenticated } = useAuth();
  const { cart } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const computedLinks = useMemo(() => {
    if (!isAuthenticated || !user?.role) return baseLinks;
    const roleSpecific = roleLinks[user.role as keyof typeof roleLinks];
    return roleSpecific ? [...baseLinks, ...roleSpecific] : baseLinks;
  }, [isAuthenticated, user?.role]);

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 text-slate-100 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.25),_transparent_65%)]" />
      <div className="mx-auto flex max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="group flex items-center gap-3 text-lg font-semibold tracking-tight"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300/30 to-emerald-300/30 text-cyan-100 transition group-hover:scale-105">
              <ChefHat className="h-5 w-5" />
            </span>
            <div>
              <p>FoodHub</p>
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-200">
                Night service
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-4 md:flex">
            {computedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-300 transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && user?.role === "customer" && (
              <Link
                href="/cart"
                className="relative inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 text-white transition hover:border-cyan-400/60 hover:bg-cyan-500/10"
                aria-label="Shopping cart"
              >
                {/* <ShoppingCart className="h-5 w-5" /> */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-4 h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                  />
                </svg>

                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-cyan-400 text-xs font-semibold text-slate-900">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-slate-100 hover:bg-white/10"
                  >
                    <Sparkles className="h-4 w-4 text-cyan-300" />
                    {user?.name ?? "Account"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="min-w-[10rem] bg-slate-900 text-slate-100"
                >
                  {computedLinks
                    .filter((link) => link.href.startsWith("/profile"))
                    .map((link) => (
                      <DropdownMenuItem key={link.href} asChild>
                        <Link href={link.href}>Profile</Link>
                      </DropdownMenuItem>
                    ))}
                  <DropdownMenuItem
                    className="cursor-pointer text-red-300 focus:text-red-400"
                    onClick={() =>
                      logout().catch((error) =>
                        console.error("Failed to sign out", error),
                      )
                    }
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Button variant="ghost" className="text-slate-300" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button
                  className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-900"
                  asChild
                >
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2"
                  >
                    Join <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}

            <button
              className="rounded-full border border-white/10 bg-white/5 p-2 text-white transition hover:border-cyan-400/60 hover:bg-cyan-500/10 md:hidden"
              onClick={toggleMobileMenu}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="mt-4 flex flex-col gap-3 rounded-3xl border border-white/10 bg-slate-900/80 p-5 text-sm shadow-2xl md:hidden">
            {computedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-2xl border border-transparent px-4 py-3 font-semibold text-slate-200 transition hover:border-cyan-400/50 hover:bg-white/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {!isAuthenticated && (
              <div className="grid gap-3 pt-2">
                <Button variant="outline" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2"
                  >
                    Create account <Sparkles className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}

            {isAuthenticated && user?.role === "customer" && (
              <Badge className="justify-between rounded-2xl bg-white/10 p-3 text-xs text-slate-200">
                Delivery streak active
                <Sparkles className="h-4 w-4 text-cyan-300" />
              </Badge>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
