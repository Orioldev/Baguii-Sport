import type { SaleRepository } from "@/logic-bussines-layer/domain/repositories/sale.repository";

export class DeleteSaleUseCase {
  private saleRepo: SaleRepository;

  constructor(saleRepo: SaleRepository) {
    this.saleRepo = saleRepo;
  }

  async execute(id: string): Promise<void> {
    await this.saleRepo.deleteSale(id);
  }
}