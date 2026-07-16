import { clientRepository } from "@/di/container";
import type { Client } from "@/logic-bussines-layer/domain/models/client.model";

export const createClientUseCase = async (client: Omit<Client, "id">) => {
  return await clientRepository.createClient(client);
};

export const updateClientUseCase = async (id: string, fields: Partial<Omit<Client, "id">>) => {
  return await clientRepository.updateClient(id, fields);
};

export const deleteClientUseCase = async (id: string) => {
  return await clientRepository.deleteClient(id);
};

export const subscribeClientsUseCase = (onUpdate: (clients: Client[]) => void) => {
  return clientRepository.subscribeClients(onUpdate);
};