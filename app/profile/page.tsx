'use client'

import { useState } from 'react'
import { Navigation } from '@/app/components/Navigation'
import Footer from '@/app/components/Footer'
import { useAuth } from '@/app/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'

export default function ProfilePage() {
  const { isAuthenticated, user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  })

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

  const handleSave = () => {
    // In a real app, this would save to backend
    setIsEditing(false)
    alert('Profile updated successfully!')
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navigation />

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold mb-8">My Profile</h1>

          <Card className="p-8">
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h2 className="text-lg font-bold mb-4">Account Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    {isEditing ? (
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    ) : (
                      <p className="text-foreground">{formData.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    ) : (
                      <p className="text-foreground">{formData.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    {isEditing ? (
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    ) : (
                      <p className="text-foreground">{formData.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Default Delivery Address</label>
                    {isEditing ? (
                      <Textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Enter your delivery address"
                        rows={3}
                      />
                    ) : (
                      <p className="text-foreground whitespace-pre-wrap">{formData.address || 'Not set'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-border">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} className="flex-1">
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} className="flex-1">
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Account Type */}
          <Card className="p-6 mt-6">
            <h2 className="text-lg font-bold mb-3">Account Type</h2>
            <p className="text-muted-foreground mb-4">
              You are signed in as a <span className="font-semibold text-primary">Customer</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Want to be a food provider? <Link href="/register?role=provider" className="text-primary font-semibold hover:underline">Create a provider account</Link>
            </p>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
