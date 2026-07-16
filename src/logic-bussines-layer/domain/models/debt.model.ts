

export interface Debt {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientCompany: string;
  createdAt: Date;
  dueDate: Date;
  total: number;
  paid: number;
  lastPaymentAt: Date | null;
}