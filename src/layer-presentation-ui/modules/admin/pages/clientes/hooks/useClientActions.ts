import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  subscribeClientsUseCase, 
  createClientUseCase, 
  updateClientUseCase, 
  deleteClientUseCase 
} from "@/logic-bussines-layer/application/uses-cases/clients/client.use-cases";
import type { Client } from "../ClientesPage";

// Clave única para la caché de clientes
const CLIENTS_QUERY_KEY = ["clients"];

export const useClientActions = () => {
  const queryClient = useQueryClient();

  // 1. QUERY: Obtener y mantener la caché de clientes en tiempo real
  const { data: clients = [], isLoading, error } = useQuery<Client[]>({
    queryKey: CLIENTS_QUERY_KEY,
    queryFn: () => {
      // Tomamos únicamente el primer snapshot para resolver la carga inicial
      // y cerramos esa suscripción de inmediato; el useEffect de abajo es quien
      // mantiene la suscripción en tiempo real durante todo el ciclo de vida del hook.
      return new Promise<Client[]>((resolve) => {
        const unsubscribe = subscribeClientsUseCase((initialClients) => {
          resolve(initialClients as Client[]);
          unsubscribe();
        });
      });
    },
    staleTime: Infinity, // Mantiene la data fresca porque Firebase se encarga de actualizarla en vivo
  });

  // Suscripción en tiempo real persistente (mismo patrón que useProductMutations/useSales):
  // se crea al montar y se limpia correctamente al desmontar, evitando listeners acumulados.
  useEffect(() => {
    const unsubscribe = subscribeClientsUseCase((updatedClients) => {
      queryClient.setQueryData(CLIENTS_QUERY_KEY, updatedClients);
    });
    return () => unsubscribe();
  }, [queryClient]);

  // 2. MUTATION: Crear Cliente
  const createClientMutation = useMutation({
    mutationFn: (newClient: Omit<Client, "id">) => createClientUseCase(newClient),
    onSuccess: () => {
      // Invalidamos la caché para asegurar consistencia perfecta
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
    },
    onError: (err) => {
      console.error("Error en la mutación de creación:", err);
    }
  });

  // 3. MUTATION: Editar Cliente
  const updateClientMutation = useMutation({
    mutationFn: ({ id, fields }: { id: string; fields: Partial<Omit<Client, "id">> }) => 
      updateClientUseCase(id, fields),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
    },
    onError: (err) => {
      console.error("Error en la mutación de actualización:", err);
    }
  });

  // 4. MUTATION: Eliminar Cliente
  const deleteClientMutation = useMutation({
    mutationFn: (id: string) => deleteClientUseCase(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
    },
    onError: (err) => {
      console.error("Error en la mutación de eliminación:", err);
    }
  });

  // Abstraemos la ejecución de las mutaciones para mantener la interfaz del hook simple en la UI
  const createClient = async (client: Omit<Client, "id">) => {
    await createClientMutation.mutateAsync(client);
  };

  const updateClient = async (id: string, updatedFields: Partial<Omit<Client, "id">>) => {
    await updateClientMutation.mutateAsync({ id, fields: updatedFields });
  };

  const deleteClient = async (id: string) => {
    await deleteClientMutation.mutateAsync(id);
  };

  return {
    clients,
    isLoading,
    error: error ? "Error al cargar los clientes" : null,
    createClient,
    updateClient,
    deleteClient,
    // Exponemos estados de carga individuales por si necesitas deshabilitar botones en la UI durante el guardado
    isCreating: createClientMutation.isPending,
    isUpdating: updateClientMutation.isPending,
    isDeleting: deleteClientMutation.isPending,
  };
};