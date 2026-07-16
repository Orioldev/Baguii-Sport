import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Product } from "@/logic-bussines-layer/domain/models/product.model";

// 1. Importamos las instancias de los casos de uso reales desde tu inyección de dependencias
import { 
  getProductsUseCase, 
  createProductUseCase, 
  updateProductUseCase, 
  deleteProductUseCase,
  productRepository, // 🟢 Nuevo: para la suscripción en tiempo real
} from "@/di/container";

export const PRODUCT_QUERY_KEY = ["admin", "productos"];

/**
 * Hook para listar todos los calzados del inventario en tiempo real
 */
export const useGetProducts = () => {
  const queryClient = useQueryClient();

  const query = useQuery<Product[]>({
    queryKey: PRODUCT_QUERY_KEY,
    queryFn: async () => {
      // Llamamos al caso de uso de consulta real
      return await getProductsUseCase.execute();
    },
    staleTime: 1000 * 60 * 5, // 5 minutos conservando los datos frescos en memoria cache
  });

  // 🟢 Suscripción en tiempo real (onSnapshot), mismo patrón que useSales.ts:
  // cualquier cambio de stock (venta, edición manual, etc.) actualiza la caché
  // de inmediato, sin depender del staleTime de 5 minutos.
  useEffect(() => {
    const unsubscribe = productRepository.subscribeAll((liveProducts) => {
      queryClient.setQueryData(PRODUCT_QUERY_KEY, liveProducts);
    });
    return () => unsubscribe();
  }, [queryClient]);

  return query;
};

/**
 * Hook unificado para las mutaciones de creación, edición y eliminación
 */
export const useProductMutations = () => {
  const queryClient = useQueryClient();

  // 1. Mutación para CREAR un calzado
  const createMutation = useMutation({
    mutationFn: async ({ input, imageFile }: { input: Omit<Product, "id" | "createdAt">; imageFile: File | null }) => {
      // Ejecutamos el caso de uso real de creación
      return await createProductUseCase.execute(input, imageFile);
    },
    onSuccess: () => {
      // Invalida la caché para refrescar la lista de productos automáticamente
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEY });
    },
  });

  // 2. Mutación para EDITAR (Actualizar) un calzado
  const updateMutation = useMutation({
    mutationFn: async ({ id, updatedFields, imageFile }: { id: string; updatedFields: Partial<Product>; imageFile: File | null }) => {
      // Ejecutamos el caso de uso real de actualización
      return await updateProductUseCase.execute(id, updatedFields, imageFile);
    },
    onSuccess: () => {
      // Refrescamos la lista de la UI automáticamente
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEY });
    },
  });

  // 3. Mutación para ELIMINAR un calzado
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Ejecutamos el caso de uso real de eliminación
      return await deleteProductUseCase.execute(id);
    },
    onSuccess: () => {
      // Refrescamos la lista de la UI automáticamente
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEY });
    },
  });

  return {
    createProduct: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateProduct: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteProduct: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    
    // Estados de error globales opcionales
    hasCreateError: createMutation.isError,
    hasUpdateError: updateMutation.isError,
  };
};