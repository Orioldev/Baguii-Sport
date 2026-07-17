import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";
import type { Sale } from "@/logic-bussines-layer/domain/models/sale.model";

interface DeleteVentaDialogProps {
  sale: Sale | null;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export const DeleteVentaDialog = ({
  sale,
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteVentaDialogProps) => {
  if (!sale) return null;

  // Calculamos el total de pares para mostrarlo en el resumen del modal
  const totalPares = sale.items.reduce((acc, item) => acc + item.qty, 0);

  return (
    <DialogContent className="sm:max-w-106.25">
      <DialogHeader className="flex flex-col items-center justify-center text-center pt-4">
        {/* Icono de advertencia llamativo */}
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 mb-2">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <DialogTitle className="text-xl font-semibold">
          ¿Eliminar esta venta?
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground mt-1">
          Esta acción es irreversible y afectará el historial de reportes.
        </DialogDescription>
      </DialogHeader>

      {/* Recuadro de resumen de la venta seleccionada */}
      <div className="rounded-lg bg-muted/50 border p-3 my-2 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground font-medium">Calzado:</span>
          <span className="font-semibold text-right max-w-50 truncate">
            {sale.productTitle}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground font-medium">Cantidad:</span>
          <span className="font-semibold">
            {totalPares} {totalPares === 1 ? "par" : "pares"}
          </span>
        </div>
        <div className="flex justify-between border-t pt-2 mt-1">
          <span className="text-muted-foreground font-medium">Monto Total:</span>
          <span className="font-bold text-red-600 dark:text-red-400">
            ${sale.totalUsd.toFixed(2)}
          </span>
        </div>
      </div>

      <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isDeleting}
          className="w-full sm:w-auto"
        >
          Cancelar
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={onConfirm}
          disabled={isDeleting}
          className="w-full sm:w-auto gap-2 bg-red-600 hover:bg-red-700 text-white"
        >
          <Trash2 className="h-4 w-4" />
          {isDeleting ? "Eliminando..." : "Confirmar Eliminación"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};