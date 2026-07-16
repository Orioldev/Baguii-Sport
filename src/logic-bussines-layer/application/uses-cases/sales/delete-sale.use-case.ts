import type { SaleRepository } from "@/logic-bussines-layer/domain/repositories/sale.repository";

export class DeleteSaleUseCase {
  constructor(private saleRepo: SaleRepository) {}

  async execute(id: string): Promise<void> {
    await this.saleRepo.deleteSale(id);
  }
}
