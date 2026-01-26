'use client'

import React from "react"

import { useState } from 'react'
import { Navigation } from '@/app/components/Navigation'
import Footer from '@/app/components/Footer'
import { useAuth } from '@/app/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { Edit, Trash2, Plus } from 'lucide-react'

// Mock menu items
const mockMenuItems = [
  {
    id: '1',
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato, mozzarella, and fresh basil',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=100&h=100&fit=crop',
  },
  {
    id: '2',
    name: 'Pepperoni Pizza',
    description: 'Loaded with premium pepperoni and melted cheese',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07f4ee?w=100&h=100&fit=crop',
  },
]

export default function ProviderMenuPage() {
  const { isAuthenticated, user } = useAuth()
  const [menuItems, setMenuItems] = useState(mockMenuItems)
  const [showForm, setShowForm] = useState(false)

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

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setMenuItems(menuItems.filter(item => item.id !== id))
    }
  }

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Menu item added! This is a demo.')
    setShowForm(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navigation />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Manage Menu</h1>
            <Button onClick={() => setShowForm(!showForm)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>

          {/* Add Item Form */}
          {showForm && (
            <Card className="p-6 mb-8">
              <h2 className="text-lg font-bold mb-4">Add New Menu Item</h2>
              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Item Name</label>
                  <Input placeholder="e.g. Margherita Pizza" required />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea placeholder="Describe your item" rows={3} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Price</label>
                    <Input type="number" step="0.01" placeholder="0.00" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <Input placeholder="e.g. Italian" required />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1">Save Item</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Menu Items */}
          <div className="space-y-4">
            {menuItems.map(item => (
              <Card key={item.id} className="p-4 flex gap-4">
                <div className="w-20 h-20 bg-muted rounded-lg flex-shrink-0">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                  <p className="text-lg font-semibold text-primary">${item.price.toFixed(2)}</p>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-2"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
