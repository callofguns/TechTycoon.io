import { create } from 'zustand';

interface ProductDetailState {
  /** Which product's detail sheet is open right now, if any. */
  productId: string | null;
  open: (id: string) => void;
  close: () => void;
}

/**
 * Tiny separate store for the product detail sheet, same idea as toastStore —
 * kept out of the game store so it never ends up in the saved game, and so
 * both the Home and Market screens can open the same sheet.
 */
export const useProductDetailStore = create<ProductDetailState>((set) => ({
  productId: null,
  open: (id) => set({ productId: id }),
  close: () => set({ productId: null }),
}));
