import type { IProductRepository } from "@/logic-bussines-layer/domain/repositories/product.repository";
import type { Product } from "@/logic-bussines-layer/domain/models/product.model";

export class CreateProductUseCase {
  private productRepo: IProductRepository;

  constructor(productRepo: IProductRepository) {
    this.productRepo = productRepo;
  }

  async execute(product: Omit<Product, "id" | "createdAt">, imageFile: File | null): Promise<Product> {
    return await this.productRepo.create(product, imageFile);
  }
}