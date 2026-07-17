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
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  // 1. Escuchar cambios en tiempo real desde Firestore
  useEffect(() => {
    setIsLoading(true);
    setError(null);
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
  }, [retryKey]);

  // Reintenta la conexión inicial (por ejemplo, tras un fallo de red)
  const retry = () => setRetryKey((k) => k + 1);

  // 2. Acción para Crear Compra
  const createPurchase = async (purchase: Omit<Purchase, "id">) => {
    setIsCreating(true);
    try {
      await createPurchaseUseCase(purchase);
    } catch (err) {
      console.error("Error creando compra:", err);
      throw new Error("No se pudo registrar la compra.");
    } finally {
      setIsCreating(false);
    }
  };

  // 3. Acción para Editar Compra
  const updatePurchase = async (id: string, updatedFields: Partial<Omit<Purchase, "id">>) => {
    setIsUpdating(true);
    try {
      await updatePurchaseUseCase(id, updatedFields);
    } catch (err) {
      console.error("Error actualizando compra:", err);
      throw new Error("No se pudo actualizar la compra.");
    } finally {
      setIsUpdating(false);
    }
  };

  // 4. Acción para Eliminar Compra
  const deletePurchase = async (id: string) => {
    setIsDeleting(true);
    try {
      await deletePurchaseUseCase(id);
    } catch (err) {
      console.error("Error eliminando compra:", err);
      throw new Error("No se pudo eliminar la compra.");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    purchases,
    isLoading,
    error,
    retry,
    createPurchase,
    updatePurchase,
    deletePurchase,
    isCreating,
    isUpdating,
    isDeleting,
  };
};