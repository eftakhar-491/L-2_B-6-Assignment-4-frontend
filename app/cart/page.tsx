'use client'

import { Navigation } from '@/app/components/Navigation'
import Footer from '@/app/components/Footer'
import { useApp } from '@/app/context/AppContext'
import { useAuth } from '@/app/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, Minus } from 'lucide-react'

export default function CartPage() {
  const router = useRouter()
  const { cart, removeFromCart, updateCartItem, cartTotal } = useApp()
  const { isAuthenticated, user } = useAuth()

  // Redirect if not authenticated or not a customer
  if (!isAuthenticated || user?.role !== 'customer') {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Please sign in</h1>
            <p className="text-muted-foreground">You need to be logged in as a customer to view your cart.</p>
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

          {cart.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">Your cart is empty</p>
              <Button asChild>
                <Link href="/meals">Continue Shopping</Link>
              </Button>
            </Card>
          ) : (
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cart.map(item => (
                  <Card key={item.id} className="p-4 flex gap-4">
                    <div className="w-24 h-24 bg-muted rounded-lg flex-shrink-0">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-border rounded-lg">
                          <button
                            onClick={() => updateCartItem(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-secondary transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-3 font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateCartItem(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-secondary transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between items-end">
                      <span className="font-bold text-lg">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Summary */}
              <div>
                <Card className="p-6 sticky top-24">
                  <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                  
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
                      <span className="text-muted-foreground">Tax</span>
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
                    className="w-full"
                    onClick={() => router.push('/checkout')}
                  >
                    Proceed to Checkout
                  </Button>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
