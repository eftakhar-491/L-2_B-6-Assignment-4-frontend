'use client'

import { useState } from 'react'
import { Navigation } from '@/app/components/Navigation'
import Footer from '@/app/components/Footer'
import { useAuth } from '@/app/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const orders = [
  {
    id: 'ORD001',
    customer: 'John Doe',
    items: ['Margherita Pizza x2'],
    total: '$25.98',
    status: 'pending',
    time: '5 mins ago',
  },
  {
    id: 'ORD002',
    customer: 'Jane Smith',
    items: ['Pepperoni Pizza x1', 'Pasta Carbonara x1'],
    total: '$26.98',
    status: 'confirmed',
    time: '12 mins ago',
  },
  {
    id: 'ORD003',
    customer: 'Bob Johnson',
    items: ['Pasta Carbonara x1'],
    total: '$11.99',
    status: 'preparing',
    time: '18 mins ago',
  },
  {
    id: 'ORD004',
    customer: 'Alice Brown',
    items: ['Margherita Pizza x1', 'Fried Rice x1'],
    total: '$21.98',
    status: 'ready',
    time: '25 mins ago',
  },
]

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  preparing: { label: 'Preparing', color: 'bg-orange-100 text-orange-800' },
  ready: { label: 'Ready', color: 'bg-green-100 text-green-800' },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
}

export default function ProviderOrdersPage() {
  const { isAuthenticated, user } = useAuth()
  const [filterStatus, setFilterStatus] = useState<string | null>(null)

  if (!isAuthenticated || user?.role !== 'provider') {
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
    )
  }

  const filteredOrders = filterStatus
    ? orders.filter(o => o.status === filterStatus)
    : orders

  const handleStatusChange = (orderId: string, newStatus: string) => {
    alert(`Order ${orderId} status updated to ${newStatus}`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navigation />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Manage Orders</h1>

            <div className="flex gap-2 mb-6">
              <Button
                variant={filterStatus === null ? 'default' : 'outline'}
                onClick={() => setFilterStatus(null)}
              >
                All Orders
              </Button>
              {Object.entries(statusConfig).map(([status, config]) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  onClick={() => setFilterStatus(status)}
                >
                  {config.label}
                </Button>
              ))}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No orders found</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map(order => {
                const config = statusConfig[order.status as keyof typeof statusConfig]
                return (
                  <Card key={order.id} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Order ID</p>
                        <p className="font-bold">{order.id}</p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Customer</p>
                        <p className="font-semibold">{order.customer}</p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Items</p>
                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <p key={idx} className="text-sm">{item}</p>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="font-bold text-lg">{order.total}</p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Status</p>
                        <Select defaultValue={order.status} onValueChange={(val) => handleStatusChange(order.id, val)}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="preparing">Preparing</SelectItem>
                            <SelectItem value="ready">Ready</SelectItem>
                            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border">
                      <span>{order.time}</span>
                      <Badge className={config.color}>{config.label}</Badge>
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
