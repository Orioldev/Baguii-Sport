import type { PaymentMethod } from "@/layer-presentation-ui/modules/admin/pages/compras/ComprasPage";

export interface Purchase {
  id?: string;
  name: string;
  paymentMethod: PaymentMethod;
  date: Date;
  description: string;
  totalUsd: number;
  rate: number;
}