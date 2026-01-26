'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/app/components/Navigation'
import Footer from '@/app/components/Footer'
import { useApp } from '@/app/context/AppContext'
import { useAuth } from '@/app/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, cartTotal, clearCart } = useApp()
  const { user, isAuthenticated } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '')

  if (!isAuthenticated || user?.role !== 'customer') {
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

  if (cart.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Your cart is empty</h1>
            <Button asChild>
              <Link href="/meals">Continue Shopping</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      alert('Please enter delivery address')
      return
    }

    setIsProcessing(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Clear cart and redirect to orders
      clearCart()
      router.push('/orders')
    } catch (error) {
      console.error('Order failed:', error)
      alert('Failed to place order')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navigation />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address */}
              <Card className="p-6">
                <h2 className="text-lg font-bold mb-4">Delivery Address</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Address</label>
                    <Input
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="123 Main St, City, State ZIP"
                      required
                    />
                  </div>
                </div>
              </Card>

              {/* Payment Method */}
              <Card className="p-6">
                <h2 className="text-lg font-bold mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <div className="p-4 border border-primary rounded-lg bg-primary/5">
                    <div className="flex items-center gap-3">
                      <input type="radio" name="payment" value="cod" defaultChecked className="h-4 w-4" />
                      <div>
                        <p className="font-semibold">Cash on Delivery</p>
                        <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Order Items */}
              <Card className="p-6">
                <h2 className="text-lg font-bold mb-4">Order Items</h2>
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} x {item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="p-6 sticky top-24">
                <h2 className="text-lg font-bold mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>$2.99</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span>${(cartTotal * 0.1).toFixed(2)}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between text-lg font-bold mb-6">
                  <span>Total</span>
                  <span>${(cartTotal + 2.99 + cartTotal * 0.1).toFixed(2)}</span>
                </div>

                <Button
                  size="lg"
                  className="w-full mb-3"
                  disabled={isProcessing}
                  onClick={handlePlaceOrder}
                >
                  {isProcessing ? 'Processing...' : 'Place Order'}
                </Button>

                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  asChild
                  disabled={isProcessing}
                >
                  <Link href="/cart">Back to Cart</Link>
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
