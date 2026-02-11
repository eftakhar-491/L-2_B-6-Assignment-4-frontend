"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useAuth } from "./AuthContext";
import {
  addCartItem,
  clearCartItems,
  fetchCart,
  removeCartItem,
  updateCartItemById,
  type BackendCartItem,
} from "@/service/cart";

export interface CartItem {
  id: string;
  mealId: string;
  name: string;
  price: number;
  basePrice: number;
  variantPriceTotal: number;
  unitPrice: number;
  quantity: number;
  providerId: string;
  image: string;
  currency?: string | null;
  variantOptionId?: string | null;
  variantLabel?: string;
  selectedVariants: Array<{
    variantId: string | null;
    variantName: string | null;
    optionId: string;
    optionTitle: string;
    priceDelta: number;
  }>;
}

export interface AddToCartPayload {
  mealId?: string;
  id?: string;
  quantity?: number;
  variantOptionId?: string | null;
  variantOptionIds?: string[];
  image?: string;
}

export interface AppContextType {
  cart: CartItem[];
  addToCart: (payload: AddToCartPayload) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateCartItem: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  cartTotal: number;
  isCartLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const toNumber = (value: unknown, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const mealImageByIdRef = useRef<Record<string, string>>({});

  const canUseCartApi = Boolean(
    isAuthenticated && (user?.role === "customer" || user?.role === "provider"),
  );

  const mapBackendCartItem = useCallback((item: BackendCartItem): CartItem => {
    const basePrice = toNumber(item.pricing?.basePrice, toNumber(item.meal?.price, 0));
    const optionDelta = toNumber(
      item.pricing?.variantPriceTotal,
      toNumber(item.variantOption?.priceDelta, 0),
    );
    const unitPrice = toNumber(item.pricing?.unitPrice, basePrice + optionDelta);

    const selectedVariants =
      item.selectedVariants && item.selectedVariants.length > 0
        ? item.selectedVariants.map((variant) => ({
            variantId: variant.variantId ?? null,
            variantName: variant.variantName ?? null,
            optionId: variant.optionId,
            optionTitle: variant.optionTitle,
            priceDelta: toNumber(variant.priceDelta, 0),
          }))
        : item.variantOption
          ? [
              {
                variantId: item.variantOption.variant?.id ?? null,
                variantName: item.variantOption.variant?.name?.trim() ?? null,
                optionId: item.variantOption.id,
                optionTitle: item.variantOption.title?.trim() || "Choice",
                priceDelta: toNumber(item.variantOption.priceDelta, 0),
              },
            ]
          : [];

    const variantLabel = selectedVariants
      .map((variant) =>
        variant.variantName
          ? `${variant.variantName}: ${variant.optionTitle}`
          : variant.optionTitle,
      )
      .join(", ");

    return {
      id: item.id,
      mealId: item.mealId,
      name: item.meal?.title ?? "Meal",
      price: unitPrice,
      basePrice,
      variantPriceTotal: optionDelta,
      unitPrice,
      quantity: item.quantity,
      providerId: item.meal?.providerProfileId ?? "",
      image: mealImageByIdRef.current[item.mealId] ?? "/placeholder.svg",
      currency: item.pricing?.currency ?? null,
      variantOptionId: item.variantOptionId ?? null,
      variantLabel: variantLabel || undefined,
      selectedVariants,
    };
  }, []);

  const refreshCart = useCallback(async () => {
    if (!canUseCartApi) {
      setCart([]);
      return;
    }

    setIsCartLoading(true);
    try {
      const backendCart = await fetchCart();
      const mappedItems = (backendCart.items ?? []).map(mapBackendCartItem);
      setCart(mappedItems);
    } catch (error) {
      console.error("Failed to load cart", error);
      setCart([]);
    } finally {
      setIsCartLoading(false);
    }
  }, [canUseCartApi, mapBackendCartItem]);

  useEffect(() => {
    if (isAuthLoading) return;
    void refreshCart();
  }, [isAuthLoading, refreshCart]);

  const ensureCanMutateCart = useCallback(() => {
    if (!canUseCartApi) {
      throw new Error("You must be signed in to use cart features.");
    }
  }, [canUseCartApi]);

  const addToCart = useCallback(
    async (payload: AddToCartPayload) => {
      ensureCanMutateCart();

      const mealId = payload.mealId ?? payload.id;
      if (!mealId) {
        throw new Error("Meal ID is required.");
      }

      if (payload.image) {
        mealImageByIdRef.current[mealId] = payload.image;
      }

      await addCartItem({
        mealId,
        quantity: payload.quantity ?? 1,
        variantOptionId: payload.variantOptionId ?? null,
        variantOptionIds: payload.variantOptionIds,
      });

      await refreshCart();
    },
    [ensureCanMutateCart, refreshCart],
  );

  const removeFromCart = useCallback(
    async (id: string) => {
      ensureCanMutateCart();
      await removeCartItem(id);
      await refreshCart();
    },
    [ensureCanMutateCart, refreshCart],
  );

  const updateCartItem = useCallback(
    async (id: string, quantity: number) => {
      ensureCanMutateCart();

      if (quantity <= 0) {
        await removeCartItem(id);
      } else {
        await updateCartItemById(id, { quantity });
      }

      await refreshCart();
    },
    [ensureCanMutateCart, refreshCart],
  );

  const clearCart = useCallback(async () => {
    ensureCanMutateCart();
    await clearCartItems();
    await refreshCart();
  }, [ensureCanMutateCart, refreshCart]);

  const cartTotal = useMemo(
    () => cart.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
    [cart],
  );

  return (
    <AppContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        refreshCart,
        cartTotal,
        isCartLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
