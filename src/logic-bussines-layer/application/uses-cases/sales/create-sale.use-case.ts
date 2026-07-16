import type { SaleRepository } from "@/logic-bussines-layer/domain/repositories/sale.repository";
import type { Sale } from "@/logic-bussines-layer/domain/models/sale.model";

/* 
    Paso 2: El Caso de Uso con la Regla de Negocio (Application)
    Al registrar una venta, no solo queremos añadir el documento en sales. 
    Necesitamos ejecutar una transacción atómica que busque el calzado (productId), 
    verifique que haya stock disponible en cada una de las tallas (size) solicitadas, 
    reste la cantidad (qty) y guarde la venta. Si no hay suficiente stock en alguna fila,
    la operación debe cancelarse inmediatamente (abort).
*/

export const createSaleUseCase = (saleRepository: SaleRepository) => {
  return async (saleData: Omit<Sale, "id">): Promise<string> => {
    // Validaciones básicas de negocio previas a la persistencia
    if (saleData.items.length === 0) {
      throw new Error("Una venta debe incluir al menos un calzado.");
    }

    const hasInvalidQty = saleData.items.some((item) => item.qty <= 0);
    if (hasInvalidQty) {
      throw new Error("La cantidad de pares vendidos debe ser mayor a 0.");
    }

    // Delegamos la ejecución transaccional al repositorio correspondiente
    return await saleRepository.createSale(saleData);
  };
};