'use client'

import React from "react"

import { useState } from 'react'
import { Navigation } from '@/app/components/Navigation'
import Footer from '@/app/components/Footer'
import { useAuth } from '@/app/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Trash2, Edit, Plus } from 'lucide-react'
import { categories } from '@/app/lib/mockData'

export default function AdminCategoriesPage() {
  const { isAuthenticated, user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [cats, setCats] = useState(categories)

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

  const handleDelete = (id: string) => {
    if (confirm('Delete this category?')) {
      setCats(cats.filter(c => c.id !== id))
    }
  }

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Category added! (Demo)')
    setShowForm(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navigation />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Manage Categories</h1>
            <Button onClick={() => setShowForm(!showForm)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </div>

          {/* Add Form */}
          {showForm && (
            <Card className="p-6 mb-8">
              <h2 className="text-lg font-bold mb-4">Add New Category</h2>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category Name</label>
                  <Input placeholder="e.g. Italian" required />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Icon (Emoji)</label>
                  <Input placeholder="e.g. 🍝" required />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1">Add Category</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cats.map(cat => (
              <Card key={cat.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{cat.icon}</span>
                    <h3 className="font-bold text-lg">{cat.name}</h3>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button size="sm" variant="outline" className="gap-2 flex-1 bg-transparent">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-2"
                    onClick={() => handleDelete(cat.id)}
                  >
                    <Trash2 className="h-4 w-4" />
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
