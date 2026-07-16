import { create } from 'zustand';
import type { User } from '@/logic-bussines-layer/domain/models/user.model';

interface AuthState {
  user: User | null;
  isInitializing: boolean; // <-- NUEVO: Para saber si Firebase está verificando la sesión
  setUser: (user: User | null) => void;
  setInitializing: (isInitializing: boolean) => void; // <-- NUEVA ACCIÓN
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isInitializing: true, // Arranca en verdadero esperando por la verificación
  setUser: (user) => set({ user, isInitializing: false }), // Al establecer usuario, termina la carga
  setInitializing: (isInitializing) => set({ isInitializing }),
  logout: () => set({ user: null, isInitializing: false }),
}));