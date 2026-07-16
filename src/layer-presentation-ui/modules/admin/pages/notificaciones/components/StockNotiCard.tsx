import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ShoppingBag, X } from "lucide-react";
import type { StockNotification } from "../NotificacionesPage";



export const StockNotifCard = ({
  notif,
  onDelete,
}: {
  notif: StockNotification;
  onDelete: (id: string) => void;
}) => {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-background p-4 transition-colors hover:border-border">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
        <ShoppingBag className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug text-foreground">
          El stock del calzado{" "}
          <span className="text-blue-600 dark:text-blue-400">{notif.product}</span>{" "}
          {/* 🟢 Nuevo: se muestra la talla específica que llegó al mínimo */}
          talla <span className="font-semibold">{notif.size}</span> llegó a su mínimo
        </p>
        <div className="mt-1">
          <Badge
            variant="outline"
            className="gap-1 border-amber-200 bg-amber-50 text-[11px] text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
          >
            <AlertTriangle className="h-3 w-3" />
            Actual: {notif.qty} {notif.qty === 1 ? "par" : "pares"} · Mínimo: {notif.minStock}
          </Badge>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        onClick={() => onDelete(notif.id)}
        aria-label={`Eliminar notificación de stock de ${notif.product} talla ${notif.size}`}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}