"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type CartEntry = {
  productId: string;
  quantity: number;
};

type CartContextValue = {
  items: CartEntry[];
  itemsCount: number;
  addItem: (productId: string, quantity?: number) => void;
  setItemQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "handcrafted-haven-cart";

const CartContext = createContext<CartContextValue | null>(null);

function normalizeCartEntries(entries: CartEntry[]) {
  return entries
    .filter((entry) => entry.productId.trim().length > 0 && entry.quantity > 0)
    .map((entry) => ({
      productId: entry.productId,
      quantity: Math.floor(entry.quantity),
    }));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        setLoaded(true);
        return;
      }

      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        setLoaded(true);
        return;
      }

      const parsedItems = parsed
        .filter((item): item is CartEntry => {
          if (typeof item !== "object" || item === null) {
            return false;
          }

          const candidate = item as Record<string, unknown>;
          return (
            typeof candidate.productId === "string" &&
            typeof candidate.quantity === "number"
          );
        })
        .map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }));

      setItems(normalizeCartEntries(parsedItems));
    } catch {
      setItems([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  const addItem = useCallback((productId: string, quantity = 1) => {
    setItems((current) => {
      const normalizedQuantity = Math.max(1, Math.floor(quantity));
      const existing = current.find((entry) => entry.productId === productId);

      if (!existing) {
        return [...current, { productId, quantity: normalizedQuantity }];
      }

      return current.map((entry) =>
        entry.productId === productId
          ? { ...entry, quantity: entry.quantity + normalizedQuantity }
          : entry
      );
    });
  }, []);

  const setItemQuantity = useCallback((productId: string, quantity: number) => {
    setItems((current) => {
      const normalizedQuantity = Math.floor(quantity);

      if (normalizedQuantity <= 0) {
        return current.filter((entry) => entry.productId !== productId);
      }

      const hasItem = current.some((entry) => entry.productId === productId);
      if (!hasItem) {
        return [...current, { productId, quantity: normalizedQuantity }];
      }

      return current.map((entry) =>
        entry.productId === productId
          ? { ...entry, quantity: normalizedQuantity }
          : entry
      );
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((current) => current.filter((entry) => entry.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemsCount = useMemo(
    () => items.reduce((sum, entry) => sum + entry.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      itemsCount,
      addItem,
      setItemQuantity,
      removeItem,
      clearCart,
    }),
    [items, itemsCount, addItem, setItemQuantity, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
