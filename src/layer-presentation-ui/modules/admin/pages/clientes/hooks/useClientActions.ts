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
      // Retornamos una promesa que se resuelve la primera vez que Firebase trae la data
      return new Promise<Client[]>((resolve) => {
        const unsubscribe = subscribeClientsUseCase((updatedClients) => {
          // Cada vez que Firestore emite un cambio en vivo, actualizamos la caché de TanStack Query activamente
          queryClient.setQueryData(CLIENTS_QUERY_KEY, updatedClients);
          resolve(updatedClients as Client[]);
        });
        
        // Retornamos la función de desuscripción para que se limpie si es necesario
        return unsubscribe;
      });
    },
    staleTime: Infinity, // Mantiene la data fresca porque Firebase se encarga de actualizarla en vivo
  });

  // Escuchar el desmontaje del componente para limpiar la conexión de Firestore si TanStack Query destruye la query
  useEffect(() => {
    return () => {
      // Opcional: Si necesitas forzar una desuscripción manual al desmontar
    };
  }, []);

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