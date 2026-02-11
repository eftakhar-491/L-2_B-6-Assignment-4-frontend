'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { TrendingUp, ShoppingBag, Clock, CheckCircle, Loader2 } from 'lucide-react'

import { Navigation } from '@/app/components/Navigation'
import Footer from '@/app/components/Footer'
import { useAuth } from '@/app/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  createProviderProfile,
  fetchProviderCategories,
  fetchProviderMeals,
  fetchProviderOrders,
  findMyProviderProfile,
  type ProviderOrder,
} from '@/service/provider'

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const formatCurrency = (value: number) => `$${value.toFixed(2)}`

const formatRelativeDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown time'

  const minutes = Math.max(1, Math.floor((Date.now() - date.getTime()) / 60000))
  if (minutes < 60) return `${minutes} min ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`

  const days = Math.floor(hours / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

const statusBadgeClass: Record<ProviderOrder['status'], string> = {
  placed: 'bg-amber-300/15 text-amber-100 border border-amber-300/30',
  preparing: 'bg-orange-300/15 text-orange-100 border border-orange-300/30',
  ready: 'bg-cyan-300/15 text-cyan-100 border border-cyan-300/30',
  delivered: 'bg-emerald-300/15 text-emerald-100 border border-emerald-300/30',
  cancelled: 'bg-rose-300/15 text-rose-100 border border-rose-300/30',
}

export default function ProviderDashboardPage() {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orders, setOrders] = useState<ProviderOrder[]>([])
  const [mealsCount, setMealsCount] = useState(0)
  const [activeCategoryCount, setActiveCategoryCount] = useState(0)
  const [pendingCategoryCount, setPendingCategoryCount] = useState(0)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'provider' || !user?.id) return

    let mounted = true
    const bootstrap = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const profile = await findMyProviderProfile(user.id)
        const fallbackName =
          user.name?.trim() || user.email?.split('@')[0]?.trim() || 'Provider'
        const ensuredProfile = profile ?? (await createProviderProfile({ name: fallbackName }))

        const [meals, providerOrders, activeCategories, pendingCategories] =
          await Promise.all([
            fetchProviderMeals(ensuredProfile.id),
            fetchProviderOrders({ page: 1, limit: 100 }),
            fetchProviderCategories({ page: 1, limit: 100, status: 'active' }),
            fetchProviderCategories({ page: 1, limit: 100, status: 'pending' }),
          ])

        if (!mounted) return

        setMealsCount(meals.length)
        setOrders(providerOrders.data)
        setActiveCategoryCount(activeCategories.data.length)
        setPendingCategoryCount(pendingCategories.data.length)
      } catch (err) {
        if (!mounted) return
        const message = err instanceof Error ? err.message : 'Failed to load provider dashboard.'
        setError(message)
        toast({
          title: 'Dashboard unavailable',
          description: message,
          variant: 'destructive',
        })
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    void bootstrap()

    return () => {
      mounted = false
    }
  }, [isAuthenticated, user?.role, user?.id, user?.name, user?.email, toast])

  const dashboardStats = useMemo(() => {
    const completedOrders = orders.filter((order) => order.status === 'delivered').length
    const liveOrders = orders.filter((order) =>
      ['placed', 'preparing', 'ready'].includes(order.status),
    ).length
    const revenue = orders
      .filter((order) => order.status === 'delivered')
      .reduce((sum, order) => sum + toNumber(order.totalAmount, 0), 0)

    return [
      {
        icon: ShoppingBag,
        label: 'Total Orders',
        value: String(orders.length),
        color: 'text-cyan-300',
      },
      {
        icon: CheckCircle,
        label: 'Completed',
        value: String(completedOrders),
        color: 'text-emerald-300',
      },
      {
        icon: Clock,
        label: 'Live Orders',
        value: String(liveOrders),
        color: 'text-amber-300',
      },
      {
        icon: TrendingUp,
        label: 'Revenue',
        value: formatCurrency(revenue),
        color: 'text-violet-300',
      },
    ]
  }, [orders])

  const recentOrders = useMemo(() => orders.slice(0, 6), [orders])

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
        <Navigation />
        <main className="flex flex-1 items-center justify-center px-4">
          <Card className="flex items-center gap-3 border-white/10 bg-white/5 p-6 text-slate-200">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading provider dashboard...
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
            <p className="text-muted-foreground">You must be a provider to access this page.</p>
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
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Navigation />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.4em] text-white/45">Provider workspace</p>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-white/65">Welcome, {user?.name || 'Provider'}.</p>
          </div>

          {error && (
            <Card className="border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200">
              {error}
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardStats.map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.label} className="p-6 border-white/10 bg-white/5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-white/60 mb-2">{stat.label}</p>
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </Card>
              )
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border-white/10 bg-white/5">
              <p className="text-sm text-white/60">Menu Items</p>
              <p className="mt-2 text-2xl font-semibold text-white">{mealsCount}</p>
            </Card>
            <Card className="p-6 border-white/10 bg-white/5">
              <p className="text-sm text-white/60">Active Categories</p>
              <p className="mt-2 text-2xl font-semibold text-white">{activeCategoryCount}</p>
            </Card>
            <Card className="p-6 border-white/10 bg-white/5">
              <p className="text-sm text-white/60">Pending Category Requests</p>
              <p className="mt-2 text-2xl font-semibold text-white">{pendingCategoryCount}</p>
            </Card>
          </div>

          <Card className="p-6 border-white/10 bg-white/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Recent Orders</h2>
              <Button variant="outline" asChild className="border-white/20 text-white hover:bg-white/10">
                <Link href="/provider/orders">View All</Link>
              </Button>
            </div>

            {recentOrders.length === 0 ? (
              <p className="text-sm text-white/65">No orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-white/10 text-white/70">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold">Order</th>
                      <th className="text-left py-3 px-4 font-semibold">Customer</th>
                      <th className="text-left py-3 px-4 font-semibold">Total</th>
                      <th className="text-left py-3 px-4 font-semibold">Placed</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-white/10 hover:bg-white/5">
                        <td className="py-3 px-4 font-semibold text-white">{order.id.slice(0, 8)}</td>
                        <td className="py-3 px-4 text-white/80">{order.user?.name || 'Customer'}</td>
                        <td className="py-3 px-4 text-white">{formatCurrency(toNumber(order.totalAmount, 0))}</td>
                        <td className="py-3 px-4 text-white/70">{formatRelativeDate(order.placedAt)}</td>
                        <td className="py-3 px-4">
                          <Badge className={statusBadgeClass[order.status]}>
                            {order.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
              <Link href="/provider/menu" className="block">
                <h3 className="font-bold mb-2 text-white">Manage Menu</h3>
                <p className="text-sm text-white/65">Create and edit meals with variants.</p>
              </Link>
            </Card>

            <Card className="p-6 border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
              <Link href="/provider/orders" className="block">
                <h3 className="font-bold mb-2 text-white">Manage Orders</h3>
                <p className="text-sm text-white/65">Update order status and prep queue.</p>
              </Link>
            </Card>

            <Card className="p-6 border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
              <Link href="/provider/menu#category-management" className="block">
                <h3 className="font-bold mb-2 text-white">Category Requests</h3>
                <p className="text-sm text-white/65">Request new categories and track approval.</p>
              </Link>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
