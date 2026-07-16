import { Card, CardContent } from "@/components/ui/card";
import { formatMoney, formatBs, type DebtItemProps } from "../CobranzasPage";
import { CalendarIcon, DollarSign, Edit, Phone, Trash2, Hourglass, HandCoins } from "lucide-react";
import { formatDate } from "../../compras/ComprasPage";
import { Button } from "@/components/ui/button";

export const DeudaCard = ({ debt, rate, onEdit, onDelete, onAbonar }: DebtItemProps) => {
  const remaining = Math.max(debt.total - debt.paid, 0);
  const isPaid = remaining === 0;
  const hasRate = typeof rate === "number" && rate > 0;

  // 🟢 Equivalente en Bolívares, mostrado debajo de cada monto en dólares
  const renderBs = (usd: number) =>
    hasRate ? (
      <p className="text-[11px] leading-tight text-muted-foreground">
        Bs. {formatBs(usd * (rate as number))}
      </p>
    ) : null;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold leading-tight">{debt.clientName}</h3>
            <p className="text-sm text-muted-foreground">
              {debt.clientCompany || "—"}
            </p>
          </div>
          <span
            className={
              "rounded-full px-2 py-0.5 text-xs font-medium " +
              (isPaid
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400")
            }
          >
            {isPaid ? "Cancelado" : "Pendiente"}
          </span>
        </div>

        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
            <span>Registrado: {formatDate(debt.createdAt)}</span>
          </div>

          {/* 🟢 FIX: la clase condicional tenía "\${...}" (con backslash), lo que ESCAPABA
              la interpolación de la plantilla y el estilo ámbar nunca se aplicaba. */}
          {debt.dueDate && (
            <div className={`flex items-center gap-1.5 font-medium ${!isPaid ? "text-amber-600 dark:text-amber-400" : ""}`}>
              <Hourglass className="h-3.5 w-3.5 shrink-0" />
              <span>Límite: {formatDate(debt.dueDate)}</span>
            </div>
          )}

          {/* 🟢 Fecha del último abono */}
          {debt.lastPaymentAt && (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <HandCoins className="h-3.5 w-3.5 shrink-0" />
              <span>Último abono: {formatDate(debt.lastPaymentAt)}</span>
            </div>
          )}

          {debt.clientPhone && (
            <div className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span>{debt.clientPhone}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-lg border bg-muted/30 p-2.5 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="font-semibold text-sm">
              <DollarSign className="inline h-3 w-3 -mt-0.5" />
              {formatMoney(debt.total)}
            </p>
            {renderBs(debt.total)}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Abonado</p>
            <p className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">
              <DollarSign className="inline h-3 w-3 -mt-0.5" />
              {formatMoney(debt.paid)}
            </p>
            {renderBs(debt.paid)}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Debe</p>
            <p className="font-semibold text-sm text-destructive">
              <DollarSign className="inline h-3 w-3 -mt-0.5" />
              {formatMoney(remaining)}
            </p>
            {renderBs(remaining)}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t pt-3">
          {/* 🟢 Acción de abonar: solo tiene sentido si aún queda saldo pendiente */}
          {!isPaid && (
            <Button
              size="sm"
              className="w-full gap-1.5"
              onClick={() => onAbonar?.(debt)}
            >
              <HandCoins className="h-3.5 w-3.5" />
              Abonar
            </Button>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5"
              onClick={() => onEdit?.(debt)}
            >
              <Edit className="h-3.5 w-3.5" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5 text-destructive hover:bg-destructive hover:text-white"
              onClick={() => onDelete?.(debt)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Eliminar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};