import { db } from "../API/firebase.config";
import { 
  collection, 
  addDoc, 
  getDocs, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  Timestamp 
} from "firebase/firestore";
import type { IClientRepository } from "@/logic-bussines-layer/domain/repositories/client.repository";
import type { Client } from "@/logic-bussines-layer/domain/models/client.model";

export class ClientRepositoryImpl implements IClientRepository {
  private collectionRef = collection(db, "clients");

  async createClient(client: Omit<Client, "id">): Promise<string> {
    const docRef = await addDoc(this.collectionRef, {
      ...client,
      createdAt: Timestamp.fromDate(client.createdAt),
    });
    return docRef.id;
  }

  async getClients(): Promise<Client[]> {
    const q = query(this.collectionRef, orderBy("name", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        phone: data.phone,
        createdAt: (data.createdAt as Timestamp).toDate(),
        company: data.company,
      } as Client;
    });
  }

  subscribeClients(onUpdate: (clients: Client[]) => void): () => void {
    const q = query(this.collectionRef, orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const clients = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          phone: data.phone,
          createdAt: (data.createdAt as Timestamp).toDate(),
          company: data.company,
        } as Client;
      });
      onUpdate(clients);
    });
  }

  async updateClient(id: string, updatedFields: Partial<Omit<Client, "id">>): Promise<void> {
    const docRef = doc(db, "clients", id);
    const fieldsToUpdate = { ...updatedFields };
    
    if (fieldsToUpdate.createdAt) {
      fieldsToUpdate.createdAt = Timestamp.fromDate(fieldsToUpdate.createdAt) as any;
    }

    await updateDoc(docRef, fieldsToUpdate);
  }

  async deleteClient(id: string): Promise<void> {
    const docRef = doc(db, "clients", id);
    await deleteDoc(docRef);
  }
}