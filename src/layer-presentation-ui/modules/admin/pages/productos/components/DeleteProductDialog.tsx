import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Product } from "@/logic-bussines-layer/domain/models/product.model";

interface DeleteProductDialogProps {
  product: Product | null;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export const DeleteProductDialog = ({ product, onConfirm, onCancel, isDeleting = false }: DeleteProductDialogProps) => {
  if (!product) return null;

  return (
    <DialogContent className="sm:max-w-105">
      <DialogHeader>
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <DialogTitle className="text-center">¿Eliminar este calzado?</DialogTitle>
        <DialogDescription className="text-center pt-2">
          Esta acción eliminará de forma permanente el modelo{" "}
          <span className="font-semibold text-foreground">"{product.title}"</span> del inventario de Bagui Sports. No se puede deshacer.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter className="mt-4 gap-2 sm:gap-0">
        <Button variant="outline" onClick={onCancel} disabled={isDeleting} className="w-full sm:w-auto">
          Cancelar
        </Button>
        <Button variant="destructive" onClick={onConfirm} disabled={isDeleting} className="w-full sm:w-auto">
          {isDeleting ? "Eliminando..." : "Sí, eliminar producto"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};