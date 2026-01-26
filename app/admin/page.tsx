"use client";

import { Navigation } from "@/app/components/Navigation";
import Footer from "@/app/components/Footer";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Users, ShoppingBag, TrendingUp, Settings } from "lucide-react";

const adminStats = [
  { icon: Users, label: "Total Users", value: "1,234", color: "text-blue-600" },
  {
    icon: ShoppingBag,
    label: "Total Orders",
    value: "5,678",
    color: "text-green-600",
  },
  {
    icon: TrendingUp,
    label: "Revenue",
    value: "$45,230",
    color: "text-purple-600",
  },
  { icon: Settings, label: "Categories", value: "8", color: "text-orange-600" },
];

const recentUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "customer",
    status: "active",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "provider",
    status: "active",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "customer",
    status: "suspended",
  },
];

export default function AdminPage() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground">
              Only admins can access this page
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {adminStats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <Card key={idx} className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Management Sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 hover:shadow-md transition-shadow">
              <Link href="/admin/users">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Manage Users
                </h3>
                <p className="text-sm text-muted-foreground">
                  View and manage all users
                </p>
              </Link>
            </Card>

            <Card className="p-6 hover:shadow-md transition-shadow">
              <Link href="/admin/orders">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  View Orders
                </h3>
                <p className="text-sm text-muted-foreground">
                  Monitor all platform orders
                </p>
              </Link>
            </Card>

            <Card className="p-6 hover:shadow-md transition-shadow">
              <Link href="/admin/categories">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Manage Categories
                </h3>
                <p className="text-sm text-muted-foreground">
                  Organize meal categories
                </p>
              </Link>
            </Card>
          </div>

          {/* Recent Users */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Recent Users</h2>
              <Button variant="outline" asChild>
                <Link href="/admin/users">View All</Link>
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 font-semibold">Role</th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-border hover:bg-secondary/20"
                    >
                      <td className="py-3 px-4 font-semibold">{user.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {user.email}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">
                          {user.role.charAt(0).toUpperCase() +
                            user.role.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={
                            user.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {user.status.charAt(0).toUpperCase() +
                            user.status.slice(1)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
