import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

let AsyncStorage: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require("@react-native-async-storage/async-storage");
  AsyncStorage = mod?.default ?? mod;
} catch {
  AsyncStorage = null;
}

export type CartItem = {
  foodId: string;
  qty: number;
};

type CartContextType = {
  items: CartItem[];
  totalItems: number;
  qtyOf: (foodId: string) => number;
  add: (foodId: string) => void;
  addItem: (foodId: string) => void;
  setQty: (foodId: string, qty: number) => void;
  removeItem: (foodId: string) => void;
  remove: (foodId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextType | null>(null);
const CART_STORAGE_KEY = "homefood:cart";

function isValidCartItem(item: any): item is CartItem {
  return (
    item &&
    typeof item.foodId === "string" &&
    typeof item.qty === "number" &&
    Number.isFinite(item.qty) &&
    item.qty > 0
  );
}

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!AsyncStorage?.getItem) {
          if (mounted) setHydrated(true);
          return;
        }
        const raw = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (!mounted || !raw) {
          if (mounted) setHydrated(true);
          return;
        }
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter(isValidCartItem);
          if (mounted) setItems(valid);
        }
      } catch {
        // ignore
      } finally {
        if (mounted) setHydrated(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    (async () => {
      try {
        if (!AsyncStorage?.setItem) return;
        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch {
        // ignore
      }
    })();
  }, [items, hydrated]);

  const qtyOf = useCallback(
    (foodId: string) => items.find((item) => item.foodId === foodId)?.qty ?? 0,
    [items],
  );

  const add = useCallback((foodId: string) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.foodId === foodId);
      if (existing) {
        return prev.map((item) =>
          item.foodId === foodId ? { ...item, qty: item.qty + 1 } : item,
        );
      }
      return [...prev, { foodId, qty: 1 }];
    });
  }, []);

  const addItem = add;

  const setQty = useCallback((foodId: string, qty: number) => {
    const nextQty = Number(qty);
    setItems((prev) => {
      if (!Number.isFinite(nextQty) || nextQty <= 0) {
        return prev.filter((item) => item.foodId !== foodId);
      }
      const existing = prev.find((item) => item.foodId === foodId);
      if (existing) {
        return prev.map((item) =>
          item.foodId === foodId ? { ...item, qty: Math.floor(nextQty) } : item,
        );
      }
      return [...prev, { foodId, qty: Math.floor(nextQty) }];
    });
  }, []);

  const remove = useCallback((foodId: string) => {
    setItems((prev) => prev.filter((item) => item.foodId !== foodId));
  }, []);

  const removeItem = remove;
  const clear = useCallback(() => setItems([]), []);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.qty, 0),
    [items],
  );

  const value = useMemo(
    () => ({ items, totalItems, qtyOf, add, addItem, setQty, removeItem, remove, clear }),
    [items, totalItems, qtyOf, add, addItem, setQty, removeItem, remove, clear],
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("use cart must be used inside cart provider");
  return context;
};
