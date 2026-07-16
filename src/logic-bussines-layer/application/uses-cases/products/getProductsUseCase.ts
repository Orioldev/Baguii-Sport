import type { IProductRepository } from "@/logic-bussines-layer/domain/repositories/product.repository";
import type { Product } from "@/logic-bussines-layer/domain/models/product.model";

export class GetProductsUseCase {
  // 1. Declarar la propiedad de forma explícita
  private productRepo: IProductRepository;

  // 2. Inicializarla de forma tradicional
  constructor(productRepo: IProductRepository) {
    this.productRepo = productRepo;
  }

  async execute(): Promise<Product[]> {
    return await this.productRepo.getAll();
  }
}