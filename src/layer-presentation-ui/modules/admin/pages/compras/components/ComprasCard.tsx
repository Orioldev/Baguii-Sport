import { Card, CardContent } from "@/components/ui/card";
import { formatDate, paymentMethodLabel, type Purchase } from "../ComprasPage";
import { CalendarIcon, CreditCard, Edit, StickyNote, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";



export const ComprasCard = ({
  purchase,
  onEdit,
  onDelete,
}: {
  purchase: Purchase;
  onEdit: (p: Purchase) => void;
  onDelete: (p: Purchase) => void;
}) => {
  const totalBs = purchase.totalUsd * purchase.rate;

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold">{purchase.name}</h3>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarIcon className="h-3.5 w-3.5" />
              {formatDate(purchase.date)}
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0 gap-1">
            <CreditCard className="h-3 w-3" />
            {paymentMethodLabel(purchase.paymentMethod)}
          </Badge>
        </div>

        {purchase.description && (
          <div className="flex items-start gap-2 rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
            <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p className="line-clamp-3">{purchase.description}</p>
          </div>
        )}

        <div className="mt-auto rounded-md border bg-muted/30 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold">
              ${purchase.totalUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>En Bs</span>
            <span>
              {totalBs.toLocaleString("es-VE", { minimumFractionDigits: 2 })} Bs
            </span>
          </div>
        </div>

        <div className="flex gap-2 border-t pt-3">
          <Button variant="default" size="sm" className="flex-1 gap-1.5" onClick={() => onEdit(purchase)}>
            <Edit className="h-3.5 w-3.5" />
            Editar
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex-1 gap-1.5 bg-red-600 hover:bg-red-700 text-white"
            onClick={() => onDelete(purchase)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
