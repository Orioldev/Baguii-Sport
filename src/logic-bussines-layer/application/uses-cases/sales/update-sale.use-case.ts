import type { SaleRepository } from "@/logic-bussines-layer/domain/repositories/sale.repository";
import type { Sale } from "@/logic-bussines-layer/domain/models/sale.model";

export class UpdateSaleUseCase {
  constructor(private saleRepo: SaleRepository) {}

  async execute(id: string, saleData: Partial<Omit<Sale, "id">>): Promise<void> {
    await this.saleRepo.updateSale(id, saleData);
  }
}
