// Ruta: src/persistence-layer/repositories/debt.repository.impl.ts
//
// ⚠️ Ajusta el import de `db` al nombre real exportado por tu firebase.config.ts
// (por ejemplo: `export const db = getFirestore(app);`)

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../API/firebase.config";
import type { DebtRepository } from "../../logic-bussines-layer/domain/repositories/debt.repository";
import type { Debt } from "../../logic-bussines-layer/domain/models/debt.model";
import { mapDebtToFirestore, mapFirestoreDocToDebt } from "../mappers/debt.mappers";

const COLLECTION_NAME = "deudas";

export class DebtRepositoryImpl implements DebtRepository {
  private collectionRef = collection(db, COLLECTION_NAME);

  async createDebt(debt: Omit<Debt, "id">): Promise<string> {
    const docRef = await addDoc(this.collectionRef, mapDebtToFirestore(debt));
    return docRef.id;
  }

  async getDebts(): Promise<Debt[]> {
    const snapshot = await getDocs(this.collectionRef);
    return snapshot.docs.map(mapFirestoreDocToDebt);
  }

  subscribeDebts(onUpdate: (debts: Debt[]) => void): () => void {
    const unsubscribe = onSnapshot(this.collectionRef, (snapshot) => {
      onUpdate(snapshot.docs.map(mapFirestoreDocToDebt));
    });
    return unsubscribe;
  }

  async updateDebt(id: string, updatedFields: Partial<Omit<Debt, "id">>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, mapDebtToFirestore(updatedFields));
  }

  async deleteDebt(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }
}