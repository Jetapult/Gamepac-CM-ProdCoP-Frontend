import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  isAuthenticated: false,
  signinWithGithub: async () => {},
  signinWithMagicLink: async () => {},

  signOut: async () => {
    set({ user: null, isAuthenticated: false });
  }
}));

export default useAuthStore;
