import { Timestamp, type DocumentData, type QueryDocumentSnapshot } from "firebase/firestore";
import type { Debt } from "../../logic-bussines-layer/domain/models/debt.model";

// Convierte un documento crudo de Firestore al modelo de dominio Debt
export const mapFirestoreDocToDebt = (
  doc: QueryDocumentSnapshot<DocumentData>
): Debt => {
  const data = doc.data();

  return {
    id: doc.id,
    clientId: data.clientId,
    clientName: data.clientName,
    clientPhone: data.clientPhone,
    clientCompany: data.clientCompany,
    createdAt: (data.createdAt as Timestamp).toDate(),
    dueDate: (data.dueDate as Timestamp).toDate(),
    total: data.total,
    paid: data.paid,
    lastPaymentAt: data.lastPaymentAt ? (data.lastPaymentAt as Timestamp).toDate() : null,
  };
};

// Convierte el modelo de dominio (o parte de él) a un objeto plano listo para Firestore
export const mapDebtToFirestore = (
  debt: Partial<Omit<Debt, "id">>
): DocumentData => {
  const payload: DocumentData = { ...debt };

  if (debt.createdAt) payload.createdAt = Timestamp.fromDate(debt.createdAt);
  if (debt.dueDate) payload.dueDate = Timestamp.fromDate(debt.dueDate);
  if (debt.lastPaymentAt !== undefined) {
    payload.lastPaymentAt = debt.lastPaymentAt ? Timestamp.fromDate(debt.lastPaymentAt) : null;
  }

  return payload;
};