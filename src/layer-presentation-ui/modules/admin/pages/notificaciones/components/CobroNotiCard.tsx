import { CalendarClock, X } from "lucide-react";
import type { DebtNotification } from "../NotificacionesPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "../../cobranzas/CobranzasPage";




export const CobroNotifCard = ({
  notif,
  onDelete,
}: {
  notif: DebtNotification;
  onDelete: (id: string) => void;
}) => {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-background p-4 transition-colors hover:border-border">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300">
        <CalendarClock className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug text-foreground">
          Hoy es la fecha límite para cancelar la deuda de{" "}
          <span className="text-blue-600 dark:text-blue-400">{notif.client}</span>
        </p>
        <div className="mt-1">
          <Badge
            variant="outline"
            className="gap-1 border-red-200 bg-red-50 text-[11px] text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
          >
            <CalendarClock className="h-3 w-3" />
            {/* 🟢 Nuevo: monto pendiente, además del "vence hoy" */}
            Vence hoy · ${formatMoney(notif.remaining)}
          </Badge>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        onClick={() => onDelete(notif.id)}
        aria-label={`Eliminar notificación de deuda de ${notif.client}`}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}