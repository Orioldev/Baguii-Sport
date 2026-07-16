import type { IProductRepository } from "@/logic-bussines-layer/domain/repositories/product.repository";
import type { Product } from "@/logic-bussines-layer/domain/models/product.model";

export class UpdateProductUseCase {
  private productRepo: IProductRepository;

  constructor(productRepo: IProductRepository) {
    this.productRepo = productRepo;
  }

  async execute(id: string, updatedFields: Partial<Product>, imageFile: File | null): Promise<void> {
    if (updatedFields.minStock !== undefined && updatedFields.minStock < 0) {
      throw new Error("El stock mínimo no puede ser un número negativo.");
    }
    return await this.productRepo.update(id, updatedFields, imageFile);
  }
}