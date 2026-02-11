'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigation } from '@/app/components/Navigation'
import Footer from '@/app/components/Footer'
import { useAuth } from '@/app/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  createProviderProfile,
  fetchProviderOrders,
  findMyProviderProfile,
  updateProviderOrderStatus,
  type ProviderOrder,
  type ProviderOrderStatus,
} from '@/service/provider'

const toNumber = (value: unknown, fallback = 0) => {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

const formatCurrency = (value: unknown) => `$${toNumber(value, 0).toFixed(2)}`

const formatPlacedAt = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Unknown'

  return parsed.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const statusConfig: Record<
  ProviderOrderStatus,
  { label: string; className: string }
> = {
  placed: {
    label: 'Placed',
    className: 'bg-amber-300/15 text-amber-100 border border-amber-300/30',
  },
  preparing: {
    label: 'Preparing',
    className: 'bg-orange-300/15 text-orange-100 border border-orange-300/30',
  },
  ready: {
    label: 'Ready',
    className: 'bg-cyan-300/15 text-cyan-100 border border-cyan-300/30',
  },
  delivered: {
    label: 'Delivered',
    className: 'bg-emerald-300/15 text-emerald-100 border border-emerald-300/30',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-rose-300/15 text-rose-100 border border-rose-300/30',
  },
}

const nextStatusMap: Record<ProviderOrderStatus, 'preparing' | 'ready' | 'delivered' | null> = {
  placed: 'preparing',
  preparing: 'ready',
  ready: 'delivered',
  delivered: null,
  cancelled: null,
}

const availableStatuses: Array<'all' | ProviderOrderStatus> = [
  'all',
  'placed',
  'preparing',
  'ready',
  'delivered',
  'cancelled',
]

export default function ProviderOrdersPage() {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth()
  const { toast } = useToast()

  const [orders, setOrders] = useState<ProviderOrder[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | ProviderOrderStatus>('all')
  const [error, setError] = useState<string | null>(null)

  const loadOrders = useCallback(
    async (status: 'all' | ProviderOrderStatus = 'all') => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetchProviderOrders({
          page: 1,
          limit: 100,
          ...(status !== 'all' ? { status } : {}),
        })
        setOrders(response.data)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unable to load provider orders.'
        setError(message)
        setOrders([])
        toast({
          title: 'Orders unavailable',
          description: message,
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'provider' || !user?.id) return

    let mounted = true
    const bootstrapAndLoad = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const profile = await findMyProviderProfile(user.id)
        if (!profile) {
          const fallbackName =
            user.name?.trim() || user.email?.split('@')[0]?.trim() || 'Provider'
          await createProviderProfile({ name: fallbackName })
        }

        if (!mounted) return
        await loadOrders('all')
      } catch (err) {
        if (!mounted) return
        const message =
          err instanceof Error ? err.message : 'Unable to initialize provider orders.'
        setError(message)
        setOrders([])
        setIsLoading(false)
      }
    }

    void bootstrapAndLoad()

    return () => {
      mounted = false
    }
  }, [isAuthenticated, user?.role, user?.id, user?.name, user?.email, loadOrders])

  const handleStatusFilter = async (status: 'all' | ProviderOrderStatus) => {
    setFilterStatus(status)
    await loadOrders(status)
  }

  const handleStatusAdvance = async (order: ProviderOrder) => {
    const nextStatus = nextStatusMap[order.status]
    if (!nextStatus) return

    setUpdatingOrderId(order.id)
    try {
      await updateProviderOrderStatus(order.id, { status: nextStatus })
      await loadOrders(filterStatus)
      toast({
        title: 'Order status updated',
        description: `Order moved to ${statusConfig[nextStatus].label}.`,
      })
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const orderStats = useMemo(
    () => ({
      total: orders.length,
      placed: orders.filter((order) => order.status === 'placed').length,
      preparing: orders.filter((order) => order.status === 'preparing').length,
      ready: orders.filter((order) => order.status === 'ready').length,
      delivered: orders.filter((order) => order.status === 'delivered').length,
    }),
    [orders],
  )

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
        <Navigation />
        <main className="flex flex-1 items-center justify-center px-4">
          <Card className="flex items-center gap-3 border-white/10 bg-white/5 p-6 text-slate-200">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading provider orders...
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

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

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Navigation />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.4em] text-white/45">Provider queue</p>
            <h1 className="text-3xl font-bold">Manage Orders</h1>
            <p className="text-white/65">Track incoming requests and update fulfillment stages.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card className="p-4 border-white/10 bg-white/5">
              <p className="text-xs text-white/60">Total</p>
              <p className="text-xl font-semibold text-white">{orderStats.total}</p>
            </Card>
            <Card className="p-4 border-white/10 bg-white/5">
              <p className="text-xs text-white/60">Placed</p>
              <p className="text-xl font-semibold text-white">{orderStats.placed}</p>
            </Card>
            <Card className="p-4 border-white/10 bg-white/5">
              <p className="text-xs text-white/60">Preparing</p>
              <p className="text-xl font-semibold text-white">{orderStats.preparing}</p>
            </Card>
            <Card className="p-4 border-white/10 bg-white/5">
              <p className="text-xs text-white/60">Ready</p>
              <p className="text-xl font-semibold text-white">{orderStats.ready}</p>
            </Card>
            <Card className="p-4 border-white/10 bg-white/5">
              <p className="text-xs text-white/60">Delivered</p>
              <p className="text-xl font-semibold text-white">{orderStats.delivered}</p>
            </Card>
          </div>

          <div className="flex flex-wrap gap-2">
            {availableStatuses.map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                className={
                  filterStatus === status
                    ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                    : 'border-white/20 bg-transparent text-white hover:bg-white/10'
                }
                onClick={() => void handleStatusFilter(status)}
              >
                {status === 'all' ? 'All Orders' : statusConfig[status].label}
              </Button>
            ))}
          </div>

          {error && (
            <Card className="border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200">
              {error}
            </Card>
          )}

          {isLoading ? (
            <Card className="p-8 border-white/10 bg-white/5 text-center text-white/75">
              Loading orders...
            </Card>
          ) : orders.length === 0 ? (
            <Card className="p-8 border-white/10 bg-white/5 text-center text-white/75">
              No orders found for this status.
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const nextStatus = nextStatusMap[order.status]
                const isUpdating = updatingOrderId === order.id

                return (
                  <Card key={order.id} className="p-6 border-white/10 bg-white/5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                      <div>
                        <p className="text-xs text-white/55">Order</p>
                        <p className="font-semibold text-white">{order.id.slice(0, 8)}</p>
                      </div>

                      <div>
                        <p className="text-xs text-white/55">Customer</p>
                        <p className="text-white">{order.user?.name || order.user?.email || 'Customer'}</p>
                      </div>

                      <div>
                        <p className="text-xs text-white/55">Placed</p>
                        <p className="text-white">{formatPlacedAt(order.placedAt)}</p>
                      </div>

                      <div>
                        <p className="text-xs text-white/55">Total</p>
                        <p className="text-white font-semibold">{formatCurrency(order.totalAmount)}</p>
                      </div>

                      <div className="flex md:justify-end">
                        <Badge className={statusConfig[order.status].className}>
                          {statusConfig[order.status].label}
                        </Badge>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3 space-y-2">
                      <p className="text-xs uppercase tracking-[0.3em] text-white/45">Items</p>
                      {order.items.map((item) => (
                        <div key={item.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-medium text-white">{item.meal?.title || 'Meal'}</p>
                            <p className="text-sm text-white/70">Qty {item.quantity}</p>
                          </div>
                          {item.options && item.options.length > 0 && (
                            <div className="mt-2 space-y-1 text-xs text-cyan-200/90">
                              {item.options.map((option) => (
                                <p key={option.id}>
                                  {option.variantOption?.variant?.name
                                    ? `${option.variantOption.variant.name}: `
                                    : ''}
                                  {option.variantOption?.title || 'Option'} ({formatCurrency(option.priceDelta)})
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-white/60">
                        Delivery: {order.address?.fullAddress || 'No address provided'}
                      </p>

                      {nextStatus ? (
                        <Button
                          className="bg-cyan-500 text-white hover:bg-cyan-600"
                          onClick={() => void handleStatusAdvance(order)}
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            `Mark as ${statusConfig[nextStatus].label}`
                          )}
                        </Button>
                      ) : (
                        <span className="text-xs uppercase tracking-[0.3em] text-white/45">Delivery successful</span>
                      )}
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
