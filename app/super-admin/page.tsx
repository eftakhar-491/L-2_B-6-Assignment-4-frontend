"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/app/components/Navigation";
import Footer from "@/app/components/Footer";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Shield, Users } from "lucide-react";
import { fetchSuperAdminOverview, type SuperAdminOverview } from "@/service/superAdmin";

const initialOverview: SuperAdminOverview = {
  users: {
    total: 0,
    byRole: {
      customer: 0,
      provider: 0,
      admin: 0,
      super_admin: 0,
    },
    byStatus: {
      active: 0,
      pending: 0,
      blocked: 0,
      deleted: 0,
    },
  },
  providers: {
    total: 0,
    verified: 0,
    unverified: 0,
  },
};

export default function SuperAdminDashboardPage() {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const [overview, setOverview] = useState<SuperAdminOverview>(initialOverview);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "super_admin") return;

    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchSuperAdminOverview();
        if (!mounted) return;
        setOverview(data);
      } catch (err) {
        if (!mounted) return;
        setError(
          err instanceof Error ? err.message : "Failed to load super admin overview.",
        );
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, user?.role]);

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navigation />
        <main className="flex flex-1 items-center justify-center">
          <Card className="flex items-center gap-3 p-6">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading super admin dashboard...
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "super_admin") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground">
              Only super admins can access this page.
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
    <div className="flex min-h-screen flex-col bg-background">
      <Navigation />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                System control
              </p>
              <h1 className="mt-2 text-3xl font-bold">Super Admin Dashboard</h1>
            </div>
            <Button asChild>
              <Link href="/super-admin/users">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Link>
            </Button>
          </div>

          {error && (
            <Card className="border-red-300 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </Card>
          )}

          {isLoading ? (
            <Card className="p-8 text-center text-muted-foreground">
              Loading overview...
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card className="p-6">
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="mt-2 text-3xl font-semibold">{overview.users.total}</p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm text-muted-foreground">Total Providers</p>
                  <p className="mt-2 text-3xl font-semibold">{overview.providers.total}</p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm text-muted-foreground">Verified Providers</p>
                  <p className="mt-2 text-3xl font-semibold">{overview.providers.verified}</p>
                </Card>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold">Users By Role</h2>
                  <div className="mt-4 space-y-2 text-sm">
                    <p>Customers: {overview.users.byRole.customer}</p>
                    <p>Providers: {overview.users.byRole.provider}</p>
                    <p>Admins: {overview.users.byRole.admin}</p>
                    <p>Super Admins: {overview.users.byRole.super_admin}</p>
                  </div>
                </Card>
                <Card className="p-6">
                  <h2 className="text-lg font-semibold">Users By Status</h2>
                  <div className="mt-4 space-y-2 text-sm">
                    <p>Active: {overview.users.byStatus.active}</p>
                    <p>Pending: {overview.users.byStatus.pending}</p>
                    <p>Blocked: {overview.users.byStatus.blocked}</p>
                    <p>Deleted: {overview.users.byStatus.deleted}</p>
                  </div>
                </Card>
              </div>

              <Card className="p-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <Shield className="h-5 w-5" />
                  Super Admin Scope
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  You can manage roles, user lifecycle states, and system-level access.
                </p>
              </Card>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
