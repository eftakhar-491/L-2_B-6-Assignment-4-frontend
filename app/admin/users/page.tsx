'use client'

import { useState } from 'react'
import { Navigation } from '@/app/components/Navigation'
import Footer from '@/app/components/Footer'
import { useAuth } from '@/app/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Search } from 'lucide-react'

const allUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'customer', status: 'active', joined: '2024-01-15' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'provider', status: 'active', joined: '2024-01-10' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'customer', status: 'suspended', joined: '2024-01-08' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'provider', status: 'active', joined: '2024-01-05' },
  { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', role: 'customer', status: 'active', joined: '2024-01-01' },
]

export default function AdminUsersPage() {
  const { isAuthenticated, user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string | null>(null)

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

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = !filterRole || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const handleToggleStatus = (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    alert(`User status changed to ${newStatus}`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navigation />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold mb-8">User Management</h1>

          {/* Search & Filter */}
          <Card className="p-6 mb-6">
            <div className="flex gap-4 flex-col md:flex-row">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant={filterRole === null ? 'default' : 'outline'}
                  onClick={() => setFilterRole(null)}
                >
                  All
                </Button>
                <Button
                  variant={filterRole === 'customer' ? 'default' : 'outline'}
                  onClick={() => setFilterRole('customer')}
                >
                  Customers
                </Button>
                <Button
                  variant={filterRole === 'provider' ? 'default' : 'outline'}
                  onClick={() => setFilterRole('provider')}
                >
                  Providers
                </Button>
              </div>
            </div>
          </Card>

          {/* Users Table */}
          <Card className="p-6 overflow-x-auto">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 font-semibold">Role</th>
                    <th className="text-left py-3 px-4 font-semibold">Joined</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(usr => (
                    <tr key={usr.id} className="border-b border-border hover:bg-secondary/20">
                      <td className="py-3 px-4 font-semibold">{usr.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{usr.email}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">
                          {usr.role.charAt(0).toUpperCase() + usr.role.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{usr.joined}</td>
                      <td className="py-3 px-4">
                        <Badge className={
                          usr.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }>
                          {usr.status.charAt(0).toUpperCase() + usr.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          variant={usr.status === 'active' ? 'destructive' : 'default'}
                          onClick={() => handleToggleStatus(usr.id, usr.status)}
                        >
                          {usr.status === 'active' ? 'Suspend' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
