import { AlertTriangle } from "lucide-react";
import type { Debt } from "../CobranzasPage";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const DeleteDeudaDialog = ({
  debt,
  onConfirm,
  onCancel,
  isDeleting = false,
}: {
  debt: Debt | null;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}) => {
  if (!debt) return null;

  const remaining = Math.max(debt.total - debt.paid, 0);
  const isPending = remaining > 0;

  return (
    <DialogContent className="sm:max-w-106.25">
      <DialogHeader>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-3">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <DialogTitle className="text-center text-lg">¿Eliminar registro de deuda?</DialogTitle>
        <DialogDescription className="text-center pt-2">
          Esta acción no se puede deshacer. Se eliminará el historial de cobro de{" "}
          <strong className="text-foreground">{debt.clientName}</strong>.
        </DialogDescription>
      </DialogHeader>

      {/* 🟢 Alerta condicional si la deuda NO ha sido cancelada */}
      {isPending && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400 flex flex-col gap-1 my-2">
          <span className="font-semibold flex items-center gap-1.5">
            ⚠️ ¡Atención! Deuda activa
          </span>
          <span>
            Este cliente todavía presenta un saldo pendiente de <strong>${remaining.toFixed(2)}</strong>. El registro no ha sido cancelado.
          </span>
        </div>
      )}

      <DialogFooter className="mt-4 gap-2 sm:gap-0">
        <Button variant="outline" onClick={onCancel} disabled={isDeleting} className="w-full sm:w-auto">
          Cancelar
        </Button>
        <Button variant="destructive" onClick={onConfirm} disabled={isDeleting} className="w-full sm:w-auto">
          {isDeleting ? "Eliminando..." : "Eliminar definitivamente"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};