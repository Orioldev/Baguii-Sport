// src/di/container.ts
import { ProductRepositoryImpl } from "@/persistence-layer/repositories/product.repository.impl";
import { SaleRepositoryImpl } from "@/persistence-layer/repositories/sale.repository.impl";
import { PurchaseRepositoryImpl } from "../persistence-layer/repositories/purchase.repository.impl";
import { createSaleUseCase } from "@/logic-bussines-layer/application/uses-cases/sales/create-sale.use-case";
import { ClientRepositoryImpl } from "../persistence-layer/repositories/client.repository.impl";
import { DebtRepositoryImpl } from "@/persistence-layer/repositories/debt.repository.impl";

// Importación de todos los Casos de Uso
import { GetProductsUseCase } from "@/logic-bussines-layer/application/uses-cases/products/getProductsUseCase";
import { CreateProductUseCase } from "@/logic-bussines-layer/application/uses-cases/create-product.use-case";
import { UpdateProductUseCase } from "@/logic-bussines-layer/application/uses-cases/products/updateProductUseCase";
import { DeleteProductUseCase } from "@/logic-bussines-layer/application/uses-cases/products/deleteProductUseCase"; 
import type { Sale } from "@/logic-bussines-layer/domain/models/sale.model";

// Instancia única del repositorio de infraestructura
// 🟢 Único cambio real de este archivo: se exporta para poder suscribirse a onSnapshot
// desde useGetProducts.ts (mismo patrón que ya usan debtRepository/purchaseRepository).
export const productRepository = new ProductRepositoryImpl();

// Inyección del repositorio en cada caso de uso
export const getProductsUseCase = new GetProductsUseCase(productRepository);
export const createProductUseCase = new CreateProductUseCase(productRepository);
export const updateProductUseCase = new UpdateProductUseCase(productRepository);
export const deleteProductUseCase = new DeleteProductUseCase(productRepository);


const saleRepository = new SaleRepositoryImpl();

// compras
export const purchaseRepository = new PurchaseRepositoryImpl();

// clientes
export const clientRepository = new ClientRepositoryImpl();

// cobranzas
export const debtRepository = new DebtRepositoryImpl();


export const container = {
  // Productos conectados usando el caso de uso instanciado arriba
  getProducts: () => getProductsUseCase.execute(), // o .run() según como se llame el método interno de tu clase GetProductsUseCase
  
  // Ventas
  getSales: () => saleRepository.getSales(),
  subscribeSales: (onUpdate: any) => saleRepository.subscribeSales(onUpdate),
  createSale: createSaleUseCase(saleRepository),
  // AGREGAR ESTA LÍNEA CLAVE: Exponemos la edición aislada
  // 🟢 Por esto (Sin el Partial, para que coincida exactamente con el Repositorio):
  updateSale: (id: string, updatedSaleData: Omit<Sale, "id">) => saleRepository.updateSale(id, updatedSaleData),
  // AGREGAR ESTA LÍNEA CLAVE: Exponemos el método de borrado aislado
  deleteSale: (id: string) => saleRepository.deleteSale(id),
};