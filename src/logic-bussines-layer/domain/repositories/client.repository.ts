import type { Client } from "../models/client.model";

export interface IClientRepository {
  createClient(client: Omit<Client, "id">): Promise<string>;
  getClients(): Promise<Client[]>;
  subscribeClients(onUpdate: (clients: Client[]) => void): () => void;
  updateClient(id: string, updatedFields: Partial<Omit<Client, "id">>): Promise<void>;
  deleteClient(id: string): Promise<void>;
}