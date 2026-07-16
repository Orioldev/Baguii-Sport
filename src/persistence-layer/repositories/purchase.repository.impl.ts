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
import type { IPurchaseRepository } from "@/logic-bussines-layer/domain/repositories/purchase.repository";
import type { Purchase } from "@/logic-bussines-layer/domain/models/purchase.model";

export class PurchaseRepositoryImpl implements IPurchaseRepository {
  private collectionRef = collection(db, "purchases");

  async createPurchase(purchase: Omit<Purchase, "id">): Promise<string> {
    const docRef = await addDoc(this.collectionRef, {
      ...purchase,
      date: Timestamp.fromDate(purchase.date), // Conversión para Firestore
    });
    return docRef.id;
  }

  async getPurchases(): Promise<Purchase[]> {
    const q = query(this.collectionRef, orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        paymentMethod: data.paymentMethod,
        date: (data.date as Timestamp).toDate(),
        description: data.description,
        totalUsd: data.totalUsd,
        rate: data.rate,
      } as Purchase;
    });
  }

  subscribePurchases(onUpdate: (purchases: Purchase[]) => void): () => void {
    const q = query(this.collectionRef, orderBy("date", "desc"));
    return onSnapshot(q, (snapshot) => {
      const purchases = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          paymentMethod: data.paymentMethod,
          date: (data.date as Timestamp).toDate(),
          description: data.description,
          totalUsd: data.totalUsd,
          rate: data.rate,
        } as Purchase;
      });
      onUpdate(purchases);
    });
  }

  async updatePurchase(id: string, updatedFields: Partial<Omit<Purchase, "id">>): Promise<void> {
    const docRef = doc(db, "purchases", id);
    const fieldsToUpdate = { ...updatedFields };
    
    if (fieldsToUpdate.date) {
      fieldsToUpdate.date = Timestamp.fromDate(fieldsToUpdate.date) as any;
    }

    await updateDoc(docRef, fieldsToUpdate);
  }

  async deletePurchase(id: string): Promise<void> {
    const docRef = doc(db, "purchases", id);
    await deleteDoc(docRef);
  }
}