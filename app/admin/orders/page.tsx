'use client'

import { Navigation } from '@/app/components/Navigation'
import Footer from '@/app/components/Footer'
import { useAuth } from '@/app/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

const allOrders = [
  { id: 'ORD001', customer: 'John Doe', provider: 'Pizza Palace', items: 2, total: '$35.97', status: 'delivered', date: '2024-01-25' },
  { id: 'ORD002', customer: 'Jane Smith', provider: 'Dragon House', items: 1, total: '$28.97', status: 'out_for_delivery', date: '2024-01-24' },
  { id: 'ORD003', customer: 'Bob Johnson', provider: 'Spice Route', items: 3, total: '$41.97', status: 'preparing', date: '2024-01-23' },
  { id: 'ORD004', customer: 'Alice Brown', provider: 'Taco Fiesta', items: 2, total: '$18.98', status: 'confirmed', date: '2024-01-22' },
  { id: 'ORD005', customer: 'Charlie Davis', provider: 'Sushi Paradise', items: 4, total: '$48.96', status: 'pending', date: '2024-01-21' },
]

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  preparing: { label: 'Preparing', color: 'bg-orange-100 text-orange-800' },
  ready: { label: 'Ready', color: 'bg-green-100 text-green-800' },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
}

export default function AdminOrdersPage() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated || user?.role !== 'admin') {
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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navigation />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold mb-8">All Orders</h1>

          <Card className="p-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Order ID</th>
                  <th className="text-left py-3 px-4 font-semibold">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold">Provider</th>
                  <th className="text-left py-3 px-4 font-semibold">Items</th>
                  <th className="text-left py-3 px-4 font-semibold">Total</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {allOrders.map(order => {
                  const config = statusConfig[order.status as keyof typeof statusConfig]
                  return (
                    <tr key={order.id} className="border-b border-border hover:bg-secondary/20">
                      <td className="py-3 px-4 font-semibold">{order.id}</td>
                      <td className="py-3 px-4">{order.customer}</td>
                      <td className="py-3 px-4">{order.provider}</td>
                      <td className="py-3 px-4 text-muted-foreground">{order.items} items</td>
                      <td className="py-3 px-4 font-semibold">{order.total}</td>
                      <td className="py-3 px-4">
                        <Badge className={config.color}>{config.label}</Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{order.date}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
