import { create } from 'zustand';

interface ToastState {
  message: string | null;
  /** Bumped on every toast so the same message can animate in again. */
  id: number;
  show: (message: string) => void;
  hide: () => void;
}

/**
 * Tiny separate store for the little confirmation messages.
 * Kept out of the game store so it never ends up in the saved game.
 */
export const useToastStore = create<ToastState>((set, get) => ({
  message: null,
  id: 0,
  show: (message) => {
    const id = get().id + 1;
    set({ message, id });
    window.setTimeout(() => {
      // Only clear if no newer toast has appeared in the meantime.
      if (get().id === id) set({ message: null });
    }, 2600);
  },
  hide: () => set({ message: null }),
}));
