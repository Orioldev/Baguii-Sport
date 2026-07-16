import { db } from "../API/firebase.config";
import { collection, doc, runTransaction, getDocs, query, orderBy, onSnapshot, deleteDoc } from "firebase/firestore";
import type { SaleRepository } from "@/logic-bussines-layer/domain/repositories/sale.repository";
import type { Sale } from "@/logic-bussines-layer/domain/models/sale.model";
import type { SizeRow } from "@/logic-bussines-layer/domain/models/product.model";

/* 
    Paso 3: La Implementación con Firebase utilizando Transacciones (Persistence)
 Para asegurar que el inventario por talla jamás sufra condiciones de carrera (Race Conditions)
 si dos vendedores procesan calzados idénticos al mismo tiempo, emplearemos runTransaction de Firestore.
*/

export class SaleRepositoryImpl implements SaleRepository {
  
  async createSale(saleData: Omit<Sale, "id">): Promise<string> {
    const saleColRef = doc(collection(db, "sales"));
    const productDocRef = doc(db, "products", saleData.productId);

    // Transacción atómica para sincronizar el stock real
    await runTransaction(db, async (transaction) => {
      const productSnap = await transaction.get(productDocRef);
      
      if (!productSnap.exists()) {
        throw new Error("El calzado seleccionado no existe en el inventario.");
      }

      const productData = productSnap.data();
      const currentSizes: SizeRow[] = productData.sizes || [];

      // 🟢 CORRECCIÓN: Cambiamos .stock por .qty para que coincida con tu interfaz SizeRow
      const updatedSizes = currentSizes.map((sizeConfig) => {
        const itemSold = saleData.items.find((item) => item.size === sizeConfig.size);
        
        if (itemSold) {
          if (sizeConfig.qty < itemSold.qty) {
            throw new Error(`Stock insuficiente para la Talla ${sizeConfig.size}. Disponibles: ${sizeConfig.qty}, Solicitados: ${itemSold.qty}`);
          }
          return {
            ...sizeConfig,
            qty: sizeConfig.qty - itemSold.qty, // Descontamos usando .qty
          };
        }
        return sizeConfig;
      });

      // Guardamos la venta
      transaction.set(saleColRef, {
        ...saleData,
        date: saleData.date,
        createdAt: new Date(),
      });

      // Actualizamos el producto
      transaction.update(productDocRef, { sizes: updatedSizes });
    });

    return saleColRef.id;
  }

  async getSales(): Promise<Sale[]> {
    const q = query(collection(db, "sales"), orderBy("date", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate() ? data.date.toDate() : new Date(data.date),
      } as Sale;
    });
  }

  subscribeSales(onUpdate: (sales: Sale[]) => void): () => void {
    const q = query(collection(db, "sales"), orderBy("date", "desc"));
    
    return onSnapshot(q, (snap) => {
      const sales = snap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate() ? data.date.toDate() : new Date(data.date),
        } as Sale;
      });
      onUpdate(sales);
    });
  }

  // 🟢 ACTUALIZACIÓN TRANSACCIONAL IMPECABLE
  async updateSale(id: string, updatedSaleData: Omit<Sale, "id">): Promise<void> {
    const saleDocRef = doc(db, "sales", id);
    const productDocRef = doc(db, "products", updatedSaleData.productId);

    await runTransaction(db, async (transaction) => {
      // 1. Obtener los datos de la venta original para ver qué se había cobrado antes
      const saleSnap = await transaction.get(saleDocRef);
      if (!saleSnap.exists()) {
        throw new Error("La venta que intenta editar ya no existe en el sistema.");
      }
      const oldSaleData = saleSnap.data() as Sale;

      // 2. Obtener el producto real directo desde Firestore en este milisegundo
      const productSnap = await transaction.get(productDocRef);
      if (!productSnap.exists()) {
        throw new Error("El calzado asociado a esta venta fue eliminado del inventario.");
      }
      const productData = productSnap.data();
      const currentSizes: SizeRow[] = productData.sizes || [];

      // 3. Recalcular el stock evaluando la diferencia neta por cada talla
      const updatedSizes = currentSizes.map((sizeConfig) => {
        // Cuánto se vendió originalmente en esa talla
        const oldItem = oldSaleData.items.find((item) => item.size === sizeConfig.size);
        // Cuánto se quiere vender ahora en la edición
        const newItem = updatedSaleData.items.find((item) => item.size === sizeConfig.size);

        const oldQty = oldItem ? oldItem.qty : 0;
        const newQty = newItem ? newItem.qty : 0;

        if (oldQty !== newQty) {
          const diff = newQty - oldQty; // Si es positivo, pide más pares. Si es negativo, los devuelve.

          // ⚠️ CANDADO FIRESTORE: ¿El estante actual soporta el cambio solicitado?
          if (sizeConfig.qty < diff) {
            throw new Error(
              `Stock insuficiente en el servidor para la Talla ${sizeConfig.size}. Disponibles: ${sizeConfig.qty}, Solicitados adicionales: ${diff}`
            );
          }

          return {
            ...sizeConfig,
            qty: sizeConfig.qty - diff, // Ajustamos el stock restando la diferencia neta
          };
        }

        return sizeConfig; // Si la cantidad no cambió en esta talla, se conserva igual
      });

      // 4. Si pasa los filtros, actualizamos la venta con los metadatos y nuevos items
      transaction.update(saleDocRef, {
        ...updatedSaleData,
        updatedAt: new Date(),
      });

      // 5. Impactamos de manera atómica el inventario del calzado
      transaction.update(productDocRef, { sizes: updatedSizes });
    });
  }

  // REFACTORIZACIÓN SEGURA: Borra la venta directamente sin tocar el stock del producto
  async deleteSale(id: string): Promise<void> {
    try {
      const saleDocRef = doc(db, "sales", id);
      await deleteDoc(saleDocRef);
    } catch (error: any) {
      throw new Error(`Error al eliminar la venta en Firebase: ${error.message}`);
    }
  }
}