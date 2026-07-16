
import type { Debt } from "../models/debt.model";

export interface DebtRepository {
  createDebt(debt: Omit<Debt, "id">): Promise<string>;
  getDebts(): Promise<Debt[]>;
  subscribeDebts(onUpdate: (debts: Debt[]) => void): () => void;
  updateDebt(id: string, updatedFields: Partial<Omit<Debt, "id">>): Promise<void>;
  deleteDebt(id: string): Promise<void>;
}