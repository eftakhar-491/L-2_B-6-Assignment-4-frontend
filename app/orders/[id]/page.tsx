'use client'

import { Navigation } from '@/app/components/Navigation'
import Footer from '@/app/components/Footer'
import { useAuth } from '@/app/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MapPin, Clock, Phone, User } from 'lucide-react'

// Mock order data
const mockOrder = {
  id: 'ORD001',
  date: '2024-01-25',
  status: 'delivered',
  provider: {
    name: 'Pizza Palace',
    phone: '+1 (555) 0123',
    address: '456 Restaurant Ave, City',
    rating: 4.8,
  },
  items: [
    { id: 1, name: 'Margherita Pizza', quantity: 1, price: 12.99 },
    { id: 2, name: 'Pasta Carbonara', quantity: 1, price: 11.99 },
  ],
  deliveryAddress: '123 Main St, City, State ZIP',
  subtotal: 24.98,
  deliveryFee: 2.99,
  tax: 2.50,
  total: 30.47,
  estimatedDelivery: '2024-01-25 19:30',
  timeline: [
    { status: 'Order Placed', time: '18:45', completed: true },
    { status: 'Confirmed', time: '18:47', completed: true },
    { status: 'Preparing', time: '18:50', completed: true },
    { status: 'Ready', time: '19:10', completed: true },
    { status: 'Out for Delivery', time: '19:15', completed: true },
    { status: 'Delivered', time: '19:35', completed: true },
  ],
}

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  preparing: { label: 'Preparing', color: 'bg-orange-100 text-orange-800' },
  ready: { label: 'Ready', color: 'bg-green-100 text-green-800' },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
}

export default function OrderDetailsPage() {
  const router = useRouter()
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

  const config = statusConfig[mockOrder.status as keyof typeof statusConfig]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navigation />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
          <Button variant="outline" className="mb-6 bg-transparent" onClick={() => router.back()}>
            ← Back
          </Button>

          <div className="grid gap-6 mb-8">
            {/* Header */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <h1 className="text-3xl font-bold">{mockOrder.id}</h1>
                </div>
                <Badge className={config.color}>{config.label}</Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Order Date</p>
                  <p className="font-semibold">{mockOrder.date}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Restaurant</p>
                  <p className="font-semibold">{mockOrder.provider.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Estimated Delivery</p>
                  <p className="font-semibold">{mockOrder.estimatedDelivery}</p>
                </div>
              </div>
            </Card>

            {/* Timeline */}
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-6">Order Timeline</h2>
              <div className="space-y-4">
                {mockOrder.timeline.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`h-4 w-4 rounded-full ${item.completed ? 'bg-primary' : 'bg-muted'}`} />
                      {idx < mockOrder.timeline.length - 1 && (
                        <div className={`h-8 w-1 ${item.completed ? 'bg-primary' : 'bg-muted'}`} />
                      )}
                    </div>
                    <div className="pt-1">
                      <p className="font-semibold">{item.status}</p>
                      <p className="text-sm text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Order Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Items */}
              <Card className="p-6">
                <h2 className="text-lg font-bold mb-4">Order Items</h2>
                <div className="space-y-3">
                  {mockOrder.items.map(item => (
                    <div key={item.id} className="flex justify-between pb-3 border-b border-border last:border-0">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Delivery Address */}
              <Card className="p-6">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold mb-1">Delivery Address</h3>
                    <p className="text-muted-foreground">{mockOrder.deliveryAddress}</p>
                  </div>
                </div>
              </Card>

              {/* Restaurant Info */}
              <Card className="p-6">
                <h2 className="text-lg font-bold mb-4">Restaurant Information</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">{mockOrder.provider.name}</p>
                      <p className="text-sm text-muted-foreground">Rating: {mockOrder.provider.rating} ⭐</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Contact</p>
                      <p className="font-semibold">{mockOrder.provider.phone}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Restaurant Address</p>
                      <p className="font-semibold text-sm">{mockOrder.provider.address}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Summary */}
            <div>
              <Card className="p-6 sticky top-24">
                <h2 className="text-lg font-bold mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${mockOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>${mockOrder.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${mockOrder.tax.toFixed(2)}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between text-lg font-bold mb-6">
                  <span>Total</span>
                  <span>${mockOrder.total.toFixed(2)}</span>
                </div>

                {mockOrder.status === 'delivered' && (
                  <Button className="w-full mb-3" asChild>
                    <Link href="/meals">Order Again</Link>
                  </Button>
                )}

                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/orders">Back to Orders</Link>
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
