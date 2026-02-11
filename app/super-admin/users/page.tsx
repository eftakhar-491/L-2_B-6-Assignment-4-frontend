"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Search } from "lucide-react";
import { Navigation } from "@/app/components/Navigation";
import Footer from "@/app/components/Footer";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  fetchSuperAdminUsers,
  updateSuperAdminUserRole,
  updateSuperAdminUserStatus,
  type SuperAdminUser,
  type SuperAdminUserRole,
  type SuperAdminUserStatus,
} from "@/service/superAdmin";

type RoleFilter = "all" | SuperAdminUserRole;
type StatusFilter = "all" | SuperAdminUserStatus;

const roleFilters: RoleFilter[] = [
  "all",
  "customer",
  "provider",
  "admin",
  "super_admin",
];
const statusFilters: StatusFilter[] = [
  "all",
  "active",
  "pending",
  "blocked",
  "deleted",
];

const roleOptions: SuperAdminUserRole[] = [
  "customer",
  "provider",
  "admin",
  "super_admin",
];

const titleCase = (value: string) =>
  value
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function SuperAdminUsersPage() {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const { toast } = useToast();

  const [users, setUsers] = useState<SuperAdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchSuperAdminUsers({
        page: 1,
        limit: 500,
        searchTerm: searchTerm || undefined,
        role: roleFilter === "all" ? undefined : roleFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setUsers(response.data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load users.";
      setError(message);
      toast({
        title: "Unable to load users",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, roleFilter, statusFilter, toast]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "super_admin") return;
    void loadUsers();
  }, [isAuthenticated, user?.role, loadUsers]);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return users.filter((entry) => {
      if (!query) return true;
      return `${entry.name ?? ""} ${entry.email} ${entry.phone ?? ""}`
        .toLowerCase()
        .includes(query);
    });
  }, [users, searchTerm]);

  const handleRoleChange = async (
    targetUserId: string,
    nextRole: SuperAdminUserRole,
  ) => {
    setUpdatingId(targetUserId);
    try {
      const updated = await updateSuperAdminUserRole(targetUserId, nextRole);
      setUsers((prev) => prev.map((entry) => (entry.id === updated.id ? updated : entry)));
      toast({
        title: "Role updated",
        description: `${updated.email} is now ${titleCase(updated.role)}.`,
      });
    } catch (err) {
      toast({
        title: "Role update failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleBlocked = async (entry: SuperAdminUser) => {
    setUpdatingId(entry.id);
    const shouldActivate = entry.status === "blocked" || !entry.isActive;
    try {
      const updated = await updateSuperAdminUserStatus(entry.id, {
        status: shouldActivate ? "active" : "blocked",
        isActive: shouldActivate,
      });
      setUsers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      toast({
        title: "Status updated",
        description: `${updated.email} is now ${
          shouldActivate ? "active" : "blocked"
        }.`,
      });
    } catch (err) {
      toast({
        title: "Status update failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navigation />
        <main className="flex flex-1 items-center justify-center">
          <Card className="flex items-center gap-3 p-6">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading users...
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
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl font-bold">Super Admin User Management</h1>
            <Button variant="outline" onClick={() => void loadUsers()}>
              Refresh
            </Button>
          </div>

          <Card className="p-6 space-y-4">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {roleFilters.map((role) => (
                <Button
                  key={role}
                  variant={roleFilter === role ? "default" : "outline"}
                  onClick={() => setRoleFilter(role)}
                >
                  {role === "all" ? "All Roles" : titleCase(role)}
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {statusFilters.map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  onClick={() => setStatusFilter(status)}
                >
                  {status === "all" ? "All Statuses" : titleCase(status)}
                </Button>
              ))}
            </div>
          </Card>

          {error && (
            <Card className="border-red-300 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </Card>
          )}

          <Card className="p-6 overflow-x-auto">
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">No users found.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                    <th className="px-4 py-3 text-left font-semibold">Email</th>
                    <th className="px-4 py-3 text-left font-semibold">Role</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Joined</th>
                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((entry) => {
                    const isUpdating = updatingId === entry.id;
                    const isBlocked = entry.status === "blocked" || !entry.isActive;
                    return (
                      <tr
                        key={entry.id}
                        className="border-b border-border hover:bg-secondary/20"
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold">{entry.name || "Unnamed user"}</p>
                          <p className="text-xs text-muted-foreground">{entry.phone || "No phone"}</p>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{entry.email}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{titleCase(entry.role)}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={
                              entry.status === "active"
                                ? "bg-green-100 text-green-800"
                                : entry.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }
                          >
                            {titleCase(entry.status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(entry.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <select
                              value={entry.role}
                              onChange={(event) =>
                                void handleRoleChange(
                                  entry.id,
                                  event.target.value as SuperAdminUserRole,
                                )
                              }
                              disabled={isUpdating}
                              className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                            >
                              {roleOptions.map((role) => (
                                <option key={role} value={role}>
                                  {titleCase(role)}
                                </option>
                              ))}
                            </select>

                            <Button
                              size="sm"
                              variant={isBlocked ? "default" : "destructive"}
                              onClick={() => void handleToggleBlocked(entry)}
                              disabled={isUpdating}
                            >
                              {isUpdating ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Updating
                                </>
                              ) : isBlocked ? (
                                "Activate"
                              ) : (
                                "Block"
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
