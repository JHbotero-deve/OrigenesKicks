import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartStore, CartItem } from "@/types/cart";

const normalizeItems = (items: unknown): CartItem[] => {
  if (!Array.isArray(items)) return [];

  const normalized = new Map<string, CartItem>();

  for (const raw of items) {
    if (!raw || typeof raw !== "object") continue;

    const item = raw as Partial<CartItem>;
    const variantId = typeof item.variantId === "string" ? item.variantId.trim() : "";
    const name = typeof item.name === "string" ? item.name.trim() : "";
    const size = typeof item.size === "string" ? item.size : "";
    const color = typeof item.color === "string" ? item.color : "";
    const price = Number(item.price);
    const quantity = Number(item.quantity);

    if (!variantId || !name || !Number.isFinite(price) || price < 0) continue;
    if (!Number.isInteger(quantity) || quantity <= 0) continue;

    const cleanItem: CartItem = {
      variantId,
      name,
      size,
      color,
      price,
      quantity,
      ...(typeof item.image === "string" && item.image ? { image: item.image } : {}),
    };

    const existing = normalized.get(variantId);
    if (existing) {
      existing.quantity += cleanItem.quantity;
    } else {
      normalized.set(variantId, cleanItem);
    }
  }

  return Array.from(normalized.values());
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem: CartItem) => {
        if (
          !newItem.variantId ||
          !Number.isFinite(newItem.price) ||
          newItem.price < 0 ||
          !Number.isInteger(newItem.quantity) ||
          newItem.quantity <= 0
        ) {
          return;
        }

        const currentItems = normalizeItems(get().items);
        const existingItem = currentItems.find((item) => item.variantId === newItem.variantId);

        if (existingItem) {
          set({
            items: currentItems.map((item) =>
              item.variantId === newItem.variantId
                ? { ...item, quantity: item.quantity + newItem.quantity }
                : item,
            ),
          });
        } else {
          set({ items: [...currentItems, newItem] });
        }
      },

      removeItem: (variantId: string) => {
        set({ items: normalizeItems(get().items).filter((item) => item.variantId !== variantId) });
      },

      updateQuantity: (variantId: string, quantity: number) => {
        const cleanQuantity = Math.floor(Number(quantity));
        if (!Number.isFinite(cleanQuantity) || cleanQuantity <= 0) {
          set({ items: normalizeItems(get().items).filter((item) => item.variantId !== variantId) });
          return;
        }

        set({
          items: normalizeItems(get().items).map((item) =>
            item.variantId === variantId ? { ...item, quantity: cleanQuantity } : item,
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () =>
        normalizeItems(get().items).reduce((total, item) => total + item.quantity, 0),

      getTotalPrice: () =>
        normalizeItems(get().items).reduce(
          (total, item) => total + Number(item.price) * item.quantity,
          0,
        ),
    }),
    {
      name: "kicks-cart-storage",
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as Partial<CartStore> | undefined;
        return {
          ...state,
          items: normalizeItems(state?.items),
        };
      },
      merge: (persistedState, currentState) => {
        const state = persistedState as Partial<CartStore> | undefined;
        return {
          ...currentState,
          ...state,
          items: normalizeItems(state?.items),
        };
      },
    },
  ),
);
