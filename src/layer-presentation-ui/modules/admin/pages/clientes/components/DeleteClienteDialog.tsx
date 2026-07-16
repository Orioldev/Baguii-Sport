import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import type { Client } from "../ClientesPage";

interface DeleteClienteDialogProps {
  client: Client | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteClienteDialog = ({ client, onConfirm, onCancel }: DeleteClienteDialogProps) => {
  if (!client) return null;

  return (
    <DialogContent className="sm:max-w-106.25">
      <DialogHeader>
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <DialogTitle className="text-center">¿Eliminar cliente?</DialogTitle>
        <DialogDescription className="text-center">
          Estás a punto de eliminar a <span className="font-semibold text-foreground">"{client.name}"</span>. 
          Esta acción no se puede deshacer y removerá sus datos del registro.
        </DialogDescription>
      </DialogHeader>
      
      <DialogFooter className="mt-2 gap-2 sm:grid sm:grid-cols-2 sm:gap-0">
        <Button
          variant="outline"
          type="button"
          onClick={onCancel}
          className="w-full"
        >
          Cancelar
        </Button>
        <Button
          variant="destructive"
          type="button"
          onClick={onConfirm}
          className="w-full bg-red-600 hover:bg-red-700 text-white"
        >
          Sí, eliminar
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};