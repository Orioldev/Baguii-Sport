// Ruta: src/logic-bussines-layer/domain/repositories/product.repository.ts

import type { Product } from "../models/product.model";

export interface IProductRepository {
  getAll(): Promise<Product[]>;
  create(product: Omit<Product, 'id' | 'createdAt'>, imageFile: File | null): Promise<Product>;
  update(id: string, product: Partial<Product>, imageFile: File | null): Promise<void>;
  delete(id: string): Promise<void>;
  subscribeAll(onUpdate: (products: Product[]) => void): () => void;
}