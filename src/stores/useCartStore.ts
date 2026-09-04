import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartStore, CartItem } from '@/types/cart';

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem: CartItem) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(item => item.variantId === newItem.variantId);

        if (existingItem) {
          set({
            items: currentItems.map(item =>
              item.variantId === newItem.variantId
                ? { ...item, quantity: item.quantity + newItem.quantity }
                : item
            ),
          });
        } else {
          set({ items: [...currentItems, newItem] });
        }
      },
      removeItem: (variantId: string) => {
        set({ items: get().items.filter(item => item.variantId !== variantId) });
      },
      updateQuantity: (variantId: string, quantity: number) => {
        set({
          items: get().items.map(item =>
            item.variantId === variantId ? { ...item, quantity } : item
          ),
        });
      },
      clearCart: () => set({ items: [] }),

      get totalItems() {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      get totalPrice() {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
    }),
    {
      name: 'kicks-cart-storage',
    }
  )
);
