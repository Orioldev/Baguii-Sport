import { Card, CardContent } from "@/components/ui/card";
import type { PaymentMethod, Sale } from "../VentasPage";
import { CreditCard, CalendarIcon, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { paymentMethodOptions } from "../../../mock/products.mock.data";
import { Button } from "@/components/ui/button";

export const VentasCard = ({
  sale,
  onEdit,
  onDelete,
}: {
  sale: Sale;
  onEdit: (sale: Sale) => void;
  onDelete: (sale: Sale) => void;
}) => {
  const paymentMethodLabel = (m: PaymentMethod) => 
    paymentMethodOptions.find((o) => o.value === m)?.label ?? m;

  const totalUnits = sale.items.reduce((acc, i) => acc + i.qty, 0);
  
  // 🟢 CORRECCIÓN: Usa el rate guardado de forma fija en la venta
  const totalBs = sale.totalUsd * sale.rate;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md flex flex-col h-full">
      <CardContent className="flex flex-col gap-3 p-4 h-full">
        <div className="flex items-start gap-3">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-muted/30">
            {sale.productImage ? (
              <img
                src={sale.productImage}
                alt={sale.productTitle}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                <CreditCard className="h-6 w-6" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="truncate text-sm font-semibold text-foreground">
              {sale.productTitle}
            </h4>
            <div className="mt-1 flex flex-wrap gap-1.5 items-center text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                {sale.date.toLocaleDateString("es-VE")}
              </span>
              <span>•</span>
              <Badge variant="secondary" className="px-1 py-0 text-[10px] capitalize">
                {paymentMethodLabel(sale.paymentMethod)}
              </Badge>
            </div>
          </div>
        </div>

        {sale.description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {sale.description}
          </p>
        )}

        {/* TABLA DE TALLAS */}
        <div className="rounded-md border overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="py-1.5 px-2.5 text-left font-medium text-muted-foreground">Talla</th>
                <th className="py-1.5 px-2.5 text-center font-medium text-muted-foreground">Cant.</th>
                <th className="py-1.5 px-2.5 text-right font-medium text-muted-foreground">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item, i) => (
                <tr
                  key={i}
                  className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="py-1.5 px-2.5 font-medium text-foreground">
                    T{item.size}
                  </td>
                  <td className="py-1.5 px-2.5 text-center text-muted-foreground">
                    {item.qty}
                  </td>
                  <td className="py-1.5 px-2.5 text-right font-medium text-foreground">
                    ${(item.price * item.qty).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-auto flex flex-col gap-2">
          <div className="flex items-end justify-between rounded-md bg-muted/40 p-2.5">
            <span className="text-xs text-muted-foreground">
              {totalUnits} {totalUnits === 1 ? "par" : "pares"}
            </span>
            <div className="text-right">
              <div className="text-sm font-semibold">
                ${sale.totalUsd.toFixed(2)}
              </div>
              <div className="text-[11px] text-muted-foreground">
                Bs {totalBs.toLocaleString("es-VE", { maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              className="flex-1 gap-1.5"
              onClick={() => onEdit(sale)}
            >
              <Edit className="h-3.5 w-3.5" />
              Editar
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex-1 gap-1.5 bg-red-600 text-white hover:bg-red-700"
              onClick={() => onDelete(sale)}
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