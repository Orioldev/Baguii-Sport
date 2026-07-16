// Ruta: src/logic-bussines-layer/application/uses-cases/deudas/create-deuda.use-case.ts

import type { DebtRepository } from "../../../domain/repositories/debt.repository";
import type { Debt } from "../../../domain/models/debt.model";

export const createDeudaUseCase =
  (repository: DebtRepository) =>
  (debt: Omit<Debt, "id">): Promise<string> => {
    // Regla de negocio: el abono inicial nunca puede exceder el total de la deuda.
    if (debt.paid > debt.total) {
      throw new Error("El abono inicial no puede ser mayor al total de la deuda.");
    }
    if (debt.total <= 0) {
      throw new Error("El total de la deuda debe ser mayor a cero.");
    }

    return repository.createDebt(debt);
  };

export const getDeudasUseCase =
  (repository: DebtRepository) =>
  (): Promise<Debt[]> => {
    return repository.getDebts();
  };

export const subscribeDeudasUseCase =
  (repository: DebtRepository) =>
  (onUpdate: (debts: Debt[]) => void): (() => void) => {
    return repository.subscribeDebts(onUpdate);
  };


export const updateDeudaUseCase =
  (repository: DebtRepository) =>
  (id: string, fields: Partial<Omit<Debt, "id">>): Promise<void> => {
    // Regla de negocio: si se editan total y abonado a la vez, el abonado no puede superar el total.
    if (
      fields.total !== undefined &&
      fields.paid !== undefined &&
      fields.paid > fields.total
    ) {
      throw new Error("El monto abonado no puede ser mayor al total de la deuda.");
    }

    return repository.updateDebt(id, fields);
  };


export const abonarDeudaUseCase =
  (repository: DebtRepository) =>
  (debt: Debt, amount: number): Promise<void> => {
    const remaining = Math.max(debt.total - debt.paid, 0);

    // Reglas de negocio del abono: nunca cero/negativo, nunca mayor al saldo pendiente.
    if (amount <= 0) {
      throw new Error("El monto abonado debe ser mayor a cero.");
    }
    if (amount > remaining) {
      throw new Error("El abono no puede ser mayor al saldo pendiente.");
    }

    // El abono se suma a "paid" (equivale a descontarlo de la deuda) y se congela
    // la fecha exacta en que se realizó, tal como se congela la tasa en una venta.
    return repository.updateDebt(debt.id, {
      paid: debt.paid + amount,
      lastPaymentAt: new Date(),
    });
  };


export const deleteDeudaUseCase =
  (repository: DebtRepository) =>
  (id: string): Promise<void> => {
    return repository.deleteDebt(id);
  };