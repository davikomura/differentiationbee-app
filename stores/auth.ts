// stores/auth.ts
import {
  bootstrapAuth,
  signIn as signInService,
  signOut as signOutService,
} from "@/services/authSession";
import { getCurrentUser } from "@/services/profile";
import type { CurrentUser } from "@/types/profile";
import { create } from "zustand";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthStore = {
  status: AuthStatus;
  isHydrated: boolean;
  user: CurrentUser | null;
  hydrate: () => Promise<void>;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<CurrentUser | null>;
};

let hydratePromise: Promise<void> | null = null;

export const useAuthStore = create<AuthStore>((set) => ({
  status: "loading",
  isHydrated: false,
  user: null,

  hydrate: async () => {
    if (hydratePromise) {
      await hydratePromise;
      return;
    }

    set((state) => ({
      status: state.isHydrated ? state.status : "loading",
    }));

    hydratePromise = (async () => {
      try {
        const tokens = await bootstrapAuth();

        if (!tokens?.access_token) {
          set({
            status: "unauthenticated",
            isHydrated: true,
            user: null,
          });
          return;
        }

        const user = await getCurrentUser();
        set({
          status: "authenticated",
          isHydrated: true,
          user,
        });
      } catch {
        await signOutService();
        set({
          status: "unauthenticated",
          isHydrated: true,
          user: null,
        });
      } finally {
        hydratePromise = null;
      }
    })();

    await hydratePromise;
  },

  signIn: async (username, password) => {
    set({ status: "loading" });
    await signInService(username, password);
    const user = await getCurrentUser();
    set({
      status: "authenticated",
      isHydrated: true,
      user,
    });
  },

  signOut: async () => {
    set({ status: "loading" });
    try {
      await signOutService();
    } finally {
      set({
        status: "unauthenticated",
        isHydrated: true,
        user: null,
      });
    }
  },

  refreshUser: async () => {
    const user = await getCurrentUser();
    set({
      status: "authenticated",
      isHydrated: true,
      user,
    });
    return user;
  },
}));
