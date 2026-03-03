"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      needsHousePlacement: false,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null, needsHousePlacement: false }),
      setNeedsHousePlacement: (value) => set({ needsHousePlacement: value }),
      setMainHouse: (mainHouse) =>
        set((state) => ({
          user: state.user ? { ...state.user, mainHouse } : state.user,
        })),
    }),
    {
      name: "mini-clans-user",
    }
  )
);

export default useUserStore;

