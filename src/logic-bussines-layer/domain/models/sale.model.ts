import type { PaymentMethod } from "@/layer-presentation-ui/modules/admin/pages/compras/ComprasPage";

/* 
    Paso 1: Definir el Modelo y la Interfaz (Domain)
    Primero, creamos el archivo con la definición formal del modelo y el contrato que debe cumplir cualquier base de datos que use el sistema
*/

export interface SaleItem {
  size: string;
  price: number;
  qty: number;
}

export interface Sale {
  id?: string;
  productId: string;
  productTitle: string;
  productImage: string;
  paymentMethod: PaymentMethod;
  date: Date;
  items: SaleItem[];
  description: string;
  totalUsd: number;
  rate: number; // Tasa histórica congelada
}