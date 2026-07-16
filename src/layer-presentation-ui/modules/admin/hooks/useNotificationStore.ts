// Ruta: src/layer-presentation-ui/modules/admin/hooks/useNotificationStore.ts
//
// 🟢 Cambio de rol respecto a la versión anterior: este store YA NO contiene la lista de
// notificaciones (esa ahora se deriva en vivo en useNotifications.ts). Solo recuerda qué
// notificaciones descartó el usuario, para que no reaparezcan en cada recálculo mientras
// la condición que las generó (stock bajo, deuda vencida hoy) siga activa.

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NotificationDismissState {
  dismissedIds: string[];
  dismiss: (id: string) => void;
  dismissMany: (ids: string[]) => void;
  // Libera cualquier id descartado cuya condición original ya no esté activa
  // (se repuso el stock, se pagó la deuda, cambió el día...), para que si la
  // misma condición vuelve a ocurrir más adelante, se notifique de nuevo.
  pruneDismissed: (activeIds: string[]) => void;
}

export const useNotificationDismissStore = create<NotificationDismissState>()(
  persist(
    (set) => ({
      dismissedIds: [],

      dismiss: (id) =>
        set((state) => ({
          dismissedIds: state.dismissedIds.includes(id)
            ? state.dismissedIds
            : [...state.dismissedIds, id],
        })),

      dismissMany: (ids) =>
        set((state) => ({
          dismissedIds: Array.from(new Set([...state.dismissedIds, ...ids])),
        })),

      pruneDismissed: (activeIds) =>
        set((state) => {
          const activeSet = new Set(activeIds);
          const pruned = state.dismissedIds.filter((id) => activeSet.has(id));
          // Evita un set-state innecesario si no cambió nada
          if (pruned.length === state.dismissedIds.length) return state;
          return { dismissedIds: pruned };
        }),
    }),
    { name: "notification-dismissed-ids" }
  )
);