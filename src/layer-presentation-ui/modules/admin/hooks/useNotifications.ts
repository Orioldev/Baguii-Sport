// Ruta: src/layer-presentation-ui/modules/admin/pages/notificaciones/hooks/useNotifications.ts

import { useEffect, useMemo } from "react";
import { useGetProducts } from "../pages/productos/hooks/useProductMutations";
import { useDeudaMutations } from "../pages/cobranzas/hooks/useDeudasMutations";
import {
  buildStockNotifications,
  buildDebtNotifications,
} from "@/logic-bussines-layer/application/uses-cases/notificactions/build-notifications.use-case";
import { useNotificationDismissStore } from "./useNotificationStore";
import type { Notification } from "@/logic-bussines-layer/domain/models/notification.model";

export const useNotifications = () => {
  // Ambos ya son reactivos: productos vía onSnapshot (ver useGetProducts) y
  // deudas vía onSnapshot (ver useDeudaMutations) — cero polling manual aquí.
  const { data: products = [], isLoading: isLoadingProducts } = useGetProducts();
  const { debts, isLoading: isLoadingDebts } = useDeudaMutations();

  const dismissedIds = useNotificationDismissStore((s) => s.dismissedIds);
  const dismiss = useNotificationDismissStore((s) => s.dismiss);
  const dismissMany = useNotificationDismissStore((s) => s.dismissMany);
  const pruneDismissed = useNotificationDismissStore((s) => s.pruneDismissed);

  const allNotifications: Notification[] = useMemo(() => {
    return [...buildStockNotifications(products), ...buildDebtNotifications(debts)];
  }, [products, debts]);

  // Si una notificación descartada ya no está entre las activas (se resolvió), se libera
  // su id para que, si la misma condición vuelve a darse, se avise de nuevo.
  useEffect(() => {
    pruneDismissed(allNotifications.map((n) => n.id));
  }, [allNotifications, pruneDismissed]);

  const notifications = useMemo(
    () => allNotifications.filter((n) => !dismissedIds.includes(n.id)),
    [allNotifications, dismissedIds]
  );

  const removeNotification = (id: string) => dismiss(id);

  const clearNotificationsByType = (type: "stock" | "debt") => {
    const ids = notifications.filter((n) => n.type === type).map((n) => n.id);
    dismissMany(ids);
  };

  return {
    notifications,
    isLoading: isLoadingProducts || isLoadingDebts,
    removeNotification,
    clearNotificationsByType,
  };
};