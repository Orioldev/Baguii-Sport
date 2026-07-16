
export interface StockNotification {
  id: string;
  type: "stock";
  productId: string;
  product: string;
  // 🟢 Nuevo: la talla específica que llegó al mínimo (el stock se gestiona por talla,
  // no por producto completo — ver product.model.ts / SizeRow).
  size: string;
  qty: number;
  minStock: number;
}

export interface DebtNotification {
  id: string;
  type: "debt";
  debtId: string;
  client: string;
  // 🟢 Nuevo: útil para mostrar cuánto hay que cobrar hoy, no solo el nombre del cliente.
  remaining: number;
  dueDate: Date;
}

export type Notification = StockNotification | DebtNotification;