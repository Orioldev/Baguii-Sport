// Ruta: src/layer-presentation-ui/modules/admin/pages/cobranzas/hooks/useDeudaMutations.ts

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { DebtRepositoryImpl } from "@/persistence-layer/repositories/debt.repository.impl";

import type { Debt } from "@/logic-bussines-layer/domain/models/debt.model";
import { abonarDeudaUseCase, createDeudaUseCase, deleteDeudaUseCase, subscribeDeudasUseCase, updateDeudaUseCase } from "@/logic-bussines-layer/application/uses-cases/debts/debt.use-case";

// Instanciado una sola vez a nivel de módulo (mismo patrón que useDollarRate.ts)
const debtRepository = new DebtRepositoryImpl();
const createExecute = createDeudaUseCase(debtRepository);
const updateExecute = updateDeudaUseCase(debtRepository);
const deleteExecute = deleteDeudaUseCase(debtRepository);
const abonarExecute = abonarDeudaUseCase(debtRepository);
const subscribeExecute = subscribeDeudasUseCase(debtRepository);

export const useDeudaMutations = () => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Suscripción en tiempo real: cualquier create/update/delete en Firestore
  // (venga de esta pestaña o de otra) actualiza `debts` automáticamente.
  useEffect(() => {
    const unsubscribe = subscribeExecute((liveDebts) => {
      setDebts(liveDebts);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const createMutation = useMutation({
    mutationFn: (debt: Omit<Debt, "id">) => createExecute(debt),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, fields }: { id: string; fields: Partial<Omit<Debt, "id">> }) =>
      updateExecute(id, fields),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteExecute(id),
  });

  const abonarMutation = useMutation({
    mutationFn: ({ debt, amount }: { debt: Debt; amount: number }) => abonarExecute(debt, amount),
  });

  return {
    debts,
    isLoading,
    createDeuda: createMutation.mutateAsync,
    updateDeuda: updateMutation.mutateAsync,
    deleteDeuda: deleteMutation.mutateAsync,
    abonarDeuda: abonarMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isAbonando: abonarMutation.isPending,
  };
};