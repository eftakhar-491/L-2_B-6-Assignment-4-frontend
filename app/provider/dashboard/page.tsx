'use client'

import { Navigation } from '@/app/components/Navigation'
import Footer from '@/app/components/Footer'
import { useAuth } from '@/app/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { TrendingUp, ShoppingBag, Clock, CheckCircle } from 'lucide-react'

// Mock data
const dashboardStats = [
  { icon: ShoppingBag, label: 'Total Orders', value: '324', color: 'text-blue-600' },
  { icon: CheckCircle, label: 'Completed', value: '312', color: 'text-green-600' },
  { icon: Clock, label: 'Pending', value: '12', color: 'text-orange-600' },
  { icon: TrendingUp, label: 'Revenue', value: '$8,450', color: 'text-purple-600' },
]

const recentOrders = [
  {
    id: 'ORD001',
    customer: 'John Doe',
    items: 'Margherita Pizza x2',
    total: '$25.98',
    status: 'delivered',
  },
  {
    id: 'ORD002',
    customer: 'Jane Smith',
    items: 'Pasta Carbonara x1',
    total: '$11.99',
    status: 'preparing',
  },
  {
    id: 'ORD003',
    customer: 'Bob Johnson',
    items: 'Pepperoni Pizza x1',
    total: '$14.99',
    status: 'ready',
  },
]

export default function ProviderDashboardPage() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated || user?.role !== 'provider') {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground">You must be a restaurant/provider to access this page</p>
            <Button asChild>
              <Link href="/register?role=provider">Become a Provider</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navigation />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome, {user?.name}!</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardStats.map((stat, idx) => {
              const Icon = stat.icon
              return (
                <Card key={idx} className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Recent Orders */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Recent Orders</h2>
              <Button variant="outline" asChild>
                <Link href="/provider/orders">View All</Link>
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Order ID</th>
                    <th className="text-left py-3 px-4 font-semibold">Customer</th>
                    <th className="text-left py-3 px-4 font-semibold">Items</th>
                    <th className="text-left py-3 px-4 font-semibold">Total</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id} className="border-b border-border hover:bg-secondary/20">
                      <td className="py-3 px-4 font-semibold">{order.id}</td>
                      <td className="py-3 px-4">{order.customer}</td>
                      <td className="py-3 px-4 text-muted-foreground">{order.items}</td>
                      <td className="py-3 px-4 font-semibold">{order.total}</td>
                      <td className="py-3 px-4">
                        <Badge className={
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                          'bg-orange-100 text-orange-800'
                        }>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
              <Link href="/provider/menu" className="block">
                <h3 className="font-bold mb-2">Manage Menu</h3>
                <p className="text-sm text-muted-foreground">Add, edit, or remove menu items</p>
              </Link>
            </Card>

            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
              <Link href="/provider/orders" className="block">
                <h3 className="font-bold mb-2">View All Orders</h3>
                <p className="text-sm text-muted-foreground">Manage incoming orders</p>
              </Link>
            </Card>

            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
              <Link href="/profile" className="block">
                <h3 className="font-bold mb-2">Restaurant Profile</h3>
                <p className="text-sm text-muted-foreground">Update your information</p>
              </Link>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
