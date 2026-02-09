"use client";

import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { useApp } from "@/app/context/AppContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShoppingCart, Menu } from "lucide-react";
import { useState } from "react";

export function Navigation() {
  const { user, logout, isAuthenticated } = useAuth();
  const { cart } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg text-primary"
          >
            <span className="text-2xl">🍽️</span>
            FoodHub
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/meals"
              className="text-sm hover:text-primary transition-colors"
            >
              Browse Meals
            </Link>

            {isAuthenticated && user?.role === "customer" && (
              <>
                <Link
                  href="/orders"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Orders
                </Link>
                <Link
                  href="/profile"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Profile
                </Link>
              </>
            )}

            {isAuthenticated && user?.role === "provider" && (
              <>
                <Link
                  href="/provider/dashboard"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/provider/menu"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Menu
                </Link>
              </>
            )}

            {isAuthenticated && user?.role === "admin" && (
              <>
                <Link
                  href="/admin"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Admin
                </Link>
              </>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            {isAuthenticated && user?.role === "customer" && (
              <Link href="/cart" className="relative">
                <ShoppingCart className="h-6 w-6 hover:text-primary transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    {user?.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {user?.role === "customer" && (
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => {
                      logout().catch((error) => {
                        console.error("Failed to sign out", error);
                      });
                    }}
                    className="cursor-pointer"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="sm" asChild className="hidden sm:flex">
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              href="/meals"
              className="block px-4 py-2 hover:bg-secondary rounded-md"
            >
              Browse Meals
            </Link>
            {isAuthenticated && user?.role === "customer" && (
              <>
                <Link
                  href="/orders"
                  className="block px-4 py-2 hover:bg-secondary rounded-md"
                >
                  Orders
                </Link>
                <Link
                  href="/profile"
                  className="block px-4 py-2 hover:bg-secondary rounded-md"
                >
                  Profile
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
