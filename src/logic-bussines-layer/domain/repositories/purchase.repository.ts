import type { Purchase } from "../models/purchase.model";

export interface IPurchaseRepository {
  createPurchase(purchase: Omit<Purchase, "id">): Promise<string>;
  getPurchases(): Promise<Purchase[]>;
  subscribePurchases(onUpdate: (purchases: Purchase[]) => void): () => void;
  updatePurchase(id: string, updatedFields: Partial<Omit<Purchase, "id">>): Promise<void>;
  deletePurchase(id: string): Promise<void>;
}