import type { SaleRepository } from "@/logic-bussines-layer/domain/repositories/sale.repository";
import type { Sale } from "@/logic-bussines-layer/domain/models/sale.model";

export class GetSalesUseCase {
  private saleRepo: SaleRepository;

  constructor(saleRepo: SaleRepository) {
    this.saleRepo = saleRepo;
  }

  async execute(): Promise<Sale[]> {
    return await this.saleRepo.getSales();
  }
}