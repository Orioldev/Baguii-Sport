// Utilizaremos un documento único dentro de una colección llamada settings en Firestore 
// (por ejemplo, el documento global_params) para almacenar el valor de la tasa.
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../API/firebase.config';
import type { ConfigRepository } from '@/logic-bussines-layer/domain/repositories/config.repository';

export class ConfigRepositoryImpl implements ConfigRepository {
  private docRef = doc(db, 'settings', 'global_params');

  async getDollarRate(): Promise<number> {
    const docSnap = await getDoc(this.docRef);
    if (docSnap.exists()) {
      return docSnap.data().dollarRate || 500;
    }
    return 500; // Valor por defecto si no existe en la BD
  }

  async updateDollarRate(rate: number): Promise<void> {
    await setDoc(this.docRef, { dollarRate: rate, updatedAt: new Date() }, { merge: true });
  }

  subscribeToRate(onUpdate: (rate: number) => void): () => void {
    // Sincronización en tiempo real nativa de Firestore
    return onSnapshot(this.docRef, (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data().dollarRate || 500);
      } else {
        onUpdate(500);
      }
    });
  }
}