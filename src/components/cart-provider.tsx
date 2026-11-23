"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { CART_EVENT, readCart, writeCart, type CartItem } from "@/lib/cart";

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export default function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const syncCart = () => setItems(readCart());

    syncCart();

    window.addEventListener(CART_EVENT, syncCart);
    window.addEventListener("storage", syncCart);

    return () => {
      window.removeEventListener(CART_EVENT, syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  const saveItems = useCallback((nextItems: CartItem[]) => {
    setItems(nextItems);
    writeCart(nextItems);
  }, []);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity: number) => {
      const existing = items.find((entry) => entry.id === item.id);

      const nextItems = existing
        ? items.map((entry) =>
            entry.id === item.id
              ? {
                  ...entry,
                  quantity: Math.min(10, entry.quantity + quantity),
                }
              : entry,
          )
        : [...items, { ...item, quantity: Math.min(10, quantity) }];

      saveItems(nextItems);
    },
    [items, saveItems],
  );

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      const nextItems = items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, Math.min(10, quantity)) }
          : item,
      );

      saveItems(nextItems);
    },
    [items, saveItems],
  );

  const removeItem = useCallback(
    (id: string) => {
      saveItems(items.filter((item) => item.id !== id));
    },
    [items, saveItems],
  );

  const value = useMemo(
    () => ({ items, addItem, updateQuantity, removeItem }),
    [items, addItem, updateQuantity, removeItem],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider.");
  }

  return context;
}
