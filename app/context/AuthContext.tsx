'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type UserRole = 'customer' | 'provider' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  phone?: string
  address?: string
  createdAt: Date
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string, role: UserRole, phone: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const storedUser = localStorage.getItem('foodhub_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.log('[v0] Error parsing stored user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulate API call - In real app, this would be a server action
      await new Promise(resolve => setTimeout(resolve, 500))

      // Mock user data - check against demo credentials
      const mockUsers: { [key: string]: User } = {
        'customer@demo.com': {
          id: '1',
          email: 'customer@demo.com',
          name: 'John Customer',
          role: 'customer',
          phone: '+1 555-0101',
          address: '123 Main St, City',
          createdAt: new Date(),
        },
        'provider@demo.com': {
          id: '2',
          email: 'provider@demo.com',
          name: 'Pizza Palace',
          role: 'provider',
          phone: '+1 555-0102',
          createdAt: new Date(),
        },
        'admin@demo.com': {
          id: '3',
          email: 'admin@demo.com',
          name: 'Admin User',
          role: 'admin',
          createdAt: new Date(),
        },
      }

      const foundUser = mockUsers[email]
      if (!foundUser || password !== 'demo123') {
        throw new Error('Invalid credentials')
      }

      setUser(foundUser)
      localStorage.setItem('foodhub_user', JSON.stringify(foundUser))
    } catch (error) {
      console.error('[v0] Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    phone: string
  ) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name,
        role,
        phone,
        createdAt: new Date(),
      }

      setUser(newUser)
      localStorage.setItem('foodhub_user', JSON.stringify(newUser))
    } catch (error) {
      console.error('[v0] Register error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('foodhub_user')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
