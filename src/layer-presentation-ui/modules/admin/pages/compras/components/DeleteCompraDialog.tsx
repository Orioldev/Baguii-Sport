// src/.../compras/components/DeleteCompraDialog.tsx
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Purchase } from "../ComprasPage";

export const DeleteCompraDialog = ({ 
  purchase, 
  onConfirm 
}: { 
  purchase: Purchase | null; 
  onConfirm: () => void; 
}) => {
  if (!purchase) return null;

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="text-red-600 flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          ¿Eliminar registro de compra?
        </DialogTitle>
        <DialogDescription className="pt-2">
          Esta acción no se puede deshacer. Se eliminará de forma permanente el registro de la compra{" "}
          <strong className="text-foreground">"{purchase.name}"</strong> por un monto de{" "}
          <strong>${purchase.totalUsd.toFixed(2)} USD</strong>.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="mt-4 gap-2 sm:gap-0">
        <Button variant="outline" type="button" onClick={() => {}} className="sm:mr-auto">
          Cancelar
        </Button>
        <Button variant="destructive" onClick={onConfirm} className="gap-2 bg-red-600 hover:bg-red-700">
          <Trash2 className="h-4 w-4" />
          Eliminar permanentemente
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};