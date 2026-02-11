"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigation } from "@/app/components/Navigation";
import Footer from "@/app/components/Footer";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Loader2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchAdminUsers,
  updateAdminUserStatus,
  type AdminUser,
  type AdminUserRole,
} from "@/service/admin";

type RoleFilter = "all" | AdminUserRole;

const roleFilters: RoleFilter[] = [
  "all",
  "customer",
  "provider",
  "admin",
  "super_admin",
];

const toTitle = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function AdminUsersPage() {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const hasAdminAccess =
    user?.role === "admin" || user?.role === "super_admin";
  const { toast } = useToast();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<RoleFilter>("all");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchAdminUsers({ page: 1, limit: 500 });
      setUsers(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load users.";
      setError(message);
      toast({
        title: "Unable to load users",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!isAuthenticated || !hasAdminAccess) return;
    void loadUsers();
  }, [isAuthenticated, hasAdminAccess, loadUsers]);

  const filteredUsers = useMemo(
    () =>
      users.filter((entry) => {
        const matchesRole = filterRole === "all" || entry.role === filterRole;
        const text = `${entry.name ?? ""} ${entry.email}`.toLowerCase();
        const matchesSearch = text.includes(searchTerm.trim().toLowerCase());
        return matchesRole && matchesSearch;
      }),
    [users, filterRole, searchTerm],
  );

  const handleToggleBlocked = async (entry: AdminUser) => {
    if (entry.id === user?.id) {
      toast({
        title: "Action not allowed",
        description: "You cannot change your own admin status here.",
        variant: "destructive",
      });
      return;
    }

    const shouldActivate = entry.status === "blocked" || !entry.isActive;
    setUpdatingUserId(entry.id);
    try {
      const updated = await updateAdminUserStatus(entry.id, {
        status: shouldActivate ? "active" : "blocked",
        isActive: shouldActivate,
      });

      setUsers((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );

      toast({
        title: "User updated",
        description: `${updated.email} is now ${
          shouldActivate ? "active" : "blocked"
        }.`,
      });
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingUserId(null);
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

  if (!isAuthenticated || !hasAdminAccess) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navigation />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h1 className="text-3xl font-bold">User Management</h1>
            <Button variant="outline" onClick={() => void loadUsers()}>
              Refresh
            </Button>
          </div>

          <Card className="p-6 mb-6">
            <div className="flex gap-4 flex-col md:flex-row">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                {roleFilters.map((role) => (
                  <Button
                    key={role}
                    variant={filterRole === role ? "default" : "outline"}
                    onClick={() => setFilterRole(role)}
                  >
                    {role === "all" ? "All" : toTitle(role)}
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          {error && (
            <Card className="mb-6 border-red-300 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </Card>
          )}

          <Card className="p-6 overflow-x-auto">
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">
                Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No users found.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 font-semibold">Role</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Active</th>
                    <th className="text-left py-3 px-4 font-semibold">Joined</th>
                    <th className="text-left py-3 px-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((entry) => {
                    const isUpdating = updatingUserId === entry.id;
                    const isBlocked =
                      entry.status === "blocked" || entry.isActive === false;

                    return (
                      <tr
                        key={entry.id}
                        className="border-b border-border hover:bg-secondary/20"
                      >
                        <td className="py-3 px-4 font-semibold">
                          {entry.name || "Unnamed user"}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {entry.email}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{toTitle(entry.role)}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              entry.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {toTitle(entry.status)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={entry.isActive ? "default" : "secondary"}
                          >
                            {entry.isActive ? "Yes" : "No"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {formatDate(entry.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            size="sm"
                            variant={isBlocked ? "default" : "destructive"}
                            onClick={() => void handleToggleBlocked(entry)}
                            disabled={isUpdating || entry.id === user.id}
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
