import type { IProductRepository } from "@/logic-bussines-layer/domain/repositories/product.repository";

export class DeleteProductUseCase {
  private productRepo: IProductRepository;

  constructor(productRepo: IProductRepository) {
    this.productRepo = productRepo;
  }

  async execute(id: string): Promise<void> {
    if (!id) {
      throw new Error("Se requiere un ID de producto válido.");
    }
    return await this.productRepo.delete(id);
  }
}