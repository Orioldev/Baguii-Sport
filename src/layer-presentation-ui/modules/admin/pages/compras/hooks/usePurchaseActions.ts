import { useEffect, useState } from "react";
import { 
  subscribePurchasesUseCase, 
  createPurchaseUseCase, 
  updatePurchaseUseCase, 
  deletePurchaseUseCase 
} from "@/logic-bussines-layer/application/uses-cases/purchase/purchase.use-cases";
import type { Purchase } from "../ComprasPage";


export const usePurchaseActions = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Escuchar cambios en tiempo real desde Firestore
  useEffect(() => {
    setIsLoading(true);
    try {
      const unsubscribe = subscribePurchasesUseCase((updatedPurchases) => {
        // Mapeamos los datos del dominio a lo que espera la UI si es necesario
        setPurchases(updatedPurchases as Purchase[]);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      setError("Error al conectar con el servidor de compras.");
      setIsLoading(false);
    }
  }, []);

  // 2. Acción para Crear Compra
  const createPurchase = async (purchase: Omit<Purchase, "id">) => {
    try {
      await createPurchaseUseCase(purchase);
    } catch (err) {
      console.error("Error creando compra:", err);
      throw new Error("No se pudo registrar la compra.");
    }
  };

  // 3. Acción para Editar Compra
  const updatePurchase = async (id: string, updatedFields: Partial<Omit<Purchase, "id">>) => {
    try {
      await updatePurchaseUseCase(id, updatedFields);
    } catch (err) {
      console.error("Error actualizando compra:", err);
      throw new Error("No se pudo actualizar la compra.");
    }
  };

  // 4. Acción para Eliminar Compra
  const deletePurchase = async (id: string) => {
    try {
      await deletePurchaseUseCase(id);
    } catch (err) {
      console.error("Error eliminando compra:", err);
      throw new Error("No se pudo eliminar la compra.");
    }
  };

  return {
    purchases,
    isLoading,
    error,
    createPurchase,
    updatePurchase,
    deletePurchase,
  };
};