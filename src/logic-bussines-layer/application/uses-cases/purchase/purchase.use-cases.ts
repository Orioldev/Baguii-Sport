import { purchaseRepository } from "@/di/container";
import type { Purchase } from "@/logic-bussines-layer/domain/models/purchase.model";

export const createPurchaseUseCase = async (purchase: Omit<Purchase, "id">) => {
  return await purchaseRepository.createPurchase(purchase);
};

export const updatePurchaseUseCase = async (id: string, fields: Partial<Omit<Purchase, "id">>) => {
  return await purchaseRepository.updatePurchase(id, fields);
};

export const deletePurchaseUseCase = async (id: string) => {
  return await purchaseRepository.deletePurchase(id);
};

export const subscribePurchasesUseCase = (onUpdate: (purchases: Purchase[]) => void) => {
  return purchaseRepository.subscribePurchases(onUpdate);
};