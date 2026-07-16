import type { Sale } from "../models/sale.model";

export interface SaleRepository {
  createSale(sale: Omit<Sale, "id">): Promise<string>;
  getSales(): Promise<Sale[]>;
  subscribeSales(onUpdate: (sales: Sale[]) => void): () => void;
  deleteSale(id: string): Promise<void>;
  updateSale(id: string, updatedFields: Partial<Omit<Sale, "id">>): Promise<void>;
}