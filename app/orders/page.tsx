'use client'

import { Navigation } from '@/app/components/Navigation'
import Footer from '@/app/components/Footer'
import { useAuth } from '@/app/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Clock, CheckCircle, Truck, MapPin } from 'lucide-react'

// Mock orders
const mockOrders = [
  {
    id: 'ORD001',
    date: '2024-01-25',
    total: 35.97,
    status: 'delivered' as const,
    items: [
      { name: 'Margherita Pizza', quantity: 1, price: 12.99 },
      { name: 'Pasta Carbonara', quantity: 1, price: 11.99 },
    ],
    provider: 'Pizza Palace',
  },
  {
    id: 'ORD002',
    date: '2024-01-24',
    total: 28.97,
    status: 'out_for_delivery' as const,
    items: [
      { name: 'Kung Pao Chicken', quantity: 2, price: 10.99 },
    ],
    provider: 'Dragon House',
  },
  {
    id: 'ORD003',
    date: '2024-01-23',
    total: 41.97,
    status: 'preparing' as const,
    items: [
      { name: 'Butter Chicken', quantity: 1, price: 13.99 },
      { name: 'Paneer Tikka', quantity: 1, price: 11.99 },
      { name: 'Biryani Rice', quantity: 1, price: 12.99 },
    ],
    provider: 'Spice Route',
  },
]

const statusConfig = {
  pending: { icon: Clock, label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { icon: CheckCircle, label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  preparing: { icon: Clock, label: 'Preparing', color: 'bg-orange-100 text-orange-800' },
  ready: { icon: CheckCircle, label: 'Ready', color: 'bg-green-100 text-green-800' },
  out_for_delivery: { icon: Truck, label: 'Out for Delivery', color: 'bg-purple-100 text-purple-800' },
  delivered: { icon: CheckCircle, label: 'Delivered', color: 'bg-green-100 text-green-800' },
  cancelled: { icon: Clock, label: 'Cancelled', color: 'bg-red-100 text-red-800' },
}

export default function OrdersPage() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated || user?.role !== 'customer') {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Please sign in</h1>
            <Button asChild>
              <Link href="/login">Sign In</Link>
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
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Your Orders</h1>
            <p className="text-muted-foreground">Track and manage all your orders</p>
          </div>

          {mockOrders.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">You haven't placed any orders yet</p>
              <Button asChild>
                <Link href="/meals">Start Ordering</Link>
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {mockOrders.map(order => {
                const config = statusConfig[order.status]
                const Icon = config.icon

                return (
                  <Card key={order.id} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Order ID: {order.id}</p>
                        <p className="font-semibold text-lg">{order.provider}</p>
                        <p className="text-sm text-muted-foreground">{new Date(order.date).toLocaleDateString()}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge className={config.color}>
                          <Icon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-4 space-y-2 text-sm">
                      {order.items.map((item, idx) => (
                        <p key={idx} className="text-muted-foreground">
                          {item.name} x {item.quantity}
                        </p>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-border">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                        <p className="text-2xl font-bold">${order.total.toFixed(2)}</p>
                      </div>

                      <Button variant="outline" asChild>
                        <Link href={`/orders/${order.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
