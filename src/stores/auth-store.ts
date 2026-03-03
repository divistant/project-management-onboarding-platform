import { create } from "zustand";
import type { User, UserRole } from "@/types/onboarding";
import { USERS } from "@/mocks/seed-data";

interface AuthState {
  currentUser: User;
  switchRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: USERS[0],
  switchRole: (role) => {
    const user = USERS.find((u) => u.role === role);
    if (user) set({ currentUser: user });
  },
}));
