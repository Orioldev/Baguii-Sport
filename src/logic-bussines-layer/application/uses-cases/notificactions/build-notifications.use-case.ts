
// A propósito, estos casos de uso NO reciben un repositorio: las notificaciones no se
// persisten en ninguna colección propia, son una vista derivada de Productos y Deudas que
// ya existen. Son funciones puras (mismos inputs -> mismo output), fáciles de testear.

import type { Product } from "../../../domain/models/product.model";
import type { Debt } from "../../../domain/models/debt.model";
import type { StockNotification, DebtNotification } from "../../../domain/models/notification.model";

const isSameCalendarDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// Regla de negocio: se notifica por cada TALLA cuyo stock llegó o quedó por debajo
// del mínimo configurado en el producto (el stock se gestiona por talla, no global).
export const buildStockNotifications = (products: Product[]): StockNotification[] => {
  const notifications: StockNotification[] = [];

  for (const product of products) {
    for (const row of product.sizes) {
      if (row.qty <= product.minStock) {
        notifications.push({
          id: `stock-${product.id}-${row.size}`,
          type: "stock",
          productId: product.id,
          product: product.title,
          size: row.size,
          qty: row.qty,
          minStock: product.minStock,
        });
      }
    }
  }

  return notifications;
};

// Regla de negocio: se notifica una deuda cuando hoy es exactamente su fecha límite
// Y todavía tiene saldo pendiente (si ya la cancelaron, no tiene sentido recordarla).
export const buildDebtNotifications = (debts: Debt[]): DebtNotification[] => {
  const today = new Date();

  return debts
    .filter((debt) => debt.total - debt.paid > 0)
    .filter((debt) => isSameCalendarDay(debt.dueDate, today))
    .map((debt) => ({
      id: `debt-${debt.id}`,
      type: "debt" as const,
      debtId: debt.id,
      client: debt.clientName,
      remaining: Math.max(debt.total - debt.paid, 0),
      dueDate: debt.dueDate,
    }));
};