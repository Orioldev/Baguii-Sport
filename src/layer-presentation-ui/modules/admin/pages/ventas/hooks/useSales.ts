import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { container } from "@/di/container";
import type { Sale } from "@/logic-bussines-layer/domain/models/sale.model";
import { useEffect } from "react";

// 🟢 IMPORTACIÓN CLAVE: Traemos la llave oficial que usa tu módulo de productos
import { PRODUCT_QUERY_KEY } from "../../productos/hooks/useProductMutations"; // Ajusta la ruta relativa según corresponda en tu árbol

export const useSales = () => {
  const queryClient = useQueryClient();

  // 1. Query para leer todas las ventas de Firebase
  const { data: sales = [], isLoading, error, refetch } = useQuery({
    queryKey: ["sales"],
    queryFn: () => container.getSales(),
  });

  // 2. Escuchar cambios en tiempo real vía onSnapshot de Firebase para Ventas
  useEffect(() => {
    const unsubscribe = container.subscribeSales((updatedSales: Sale[]) => {
      queryClient.setQueryData(["sales"], updatedSales);
    });
    return () => unsubscribe();
  }, [queryClient]);

  // 3. Mutación para crear la venta usando tu caso de uso transaccional
  const createSaleMutation = useMutation({
    mutationFn: (newSale: Omit<Sale, "id">) => container.createSale(newSale),
    onSuccess: () => {
      // 🟢 CORRECCIÓN: Invalidamos usando las llaves exactas
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      
      // Esto fulmina el staleTime de 5 minutos y obliga a la vista de productos 
      // a pedirle a Firebase el stock actualizado de inmediato
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEY });
    },
  });

  // 5. Mutación para ACTUALIZAR (Modificada para sincronizar el Inventario)
  const updateSaleMutation = useMutation({
    mutationFn: ({ id, updatedFields }: { id: string; updatedFields: Omit<Sale, "id"> }) => 
      container.updateSale(id, updatedFields),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEY });
    },
  });

  // 🟢 NUEVO: 4. Mutación para eliminar la venta de manera aislada
  const deleteSaleMutation = useMutation({
    mutationFn: (id: string) => container.deleteSale(id),
    onSuccess: () => {
      // Solo invalidamos la caché de ventas; los productos quedan intactos y seguros
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });

  return {
    sales,
    isLoading,
    error,
    refetch,
    createSale: createSaleMutation.mutateAsync,
    isCreating: createSaleMutation.isPending,

    // Exportamos la lógica de eliminación para la UI
    deleteSale: deleteSaleMutation.mutateAsync,
    isDeleting: deleteSaleMutation.isPending,

    // Exportamos las utilidades de edición para la UI
    updateSale: updateSaleMutation.mutateAsync,
    isUpdating: updateSaleMutation.isPending,
  };
};