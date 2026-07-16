// A) El Store Global de Configuración : Creamos un store de Zustand para centralizar la tasa del dólar de modo que sea accesible 
// globalmente de forma reactiva por cualquier componente.

import { create } from 'zustand';

interface ConfigState {
  rate: number;
  setRate: (rate: number) => void;
}

export const useConfigStore = create<ConfigState>((set) => ({
  rate: 500, // Estado inicial
  setRate: (rate) => set({ rate }),
}));