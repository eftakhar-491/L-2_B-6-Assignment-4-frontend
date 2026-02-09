"use client";

import React, { createContext, useContext, useMemo, useCallback } from "react";

import { authClient } from "@/app/lib/auth-client";

export type UserRole = "customer" | "provider" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  status?: "active" | "blocked" | "pending" | "deleted";
  emailVerified?: boolean;
  image?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  isSubscribed?: boolean;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    phone: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  refetchSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isPending, isRefetching, refetch } = authClient.useSession();

  const login = useCallback(
    async (email: string, password: string) => {
      const { error } = await authClient.signIn.email({ email, password });
      if (error) {
        throw new Error(
          error.message ?? "Unable to sign in. Please try again.",
        );
      }
      await refetch();
    },
    [refetch],
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      name: string,
      role: UserRole,
      phone: string,
    ) => {
      const { error } = await authClient.signUp.email({
        email,
        password,
        name,
        role,
        phone,
      } as unknown as Parameters<typeof authClient.signUp.email>[0]);

      if (error) {
        throw new Error(
          error.message ?? "Unable to create account. Please try again.",
        );
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    const { error } = await authClient.signOut();
    if (error) {
      throw new Error(error.message ?? "Unable to sign out. Please try again.");
    }
    await refetch();
  }, [refetch]);

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user: (data?.user as User | undefined) ?? null,
      isLoading: isPending || isRefetching,
      login,
      register,
      logout,
      isAuthenticated: Boolean(data?.session),
      refetchSession: refetch,
    }),
    [data, isPending, isRefetching, login, register, logout, refetch],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
