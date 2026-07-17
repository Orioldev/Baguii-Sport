import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Package, Calendar, Pencil, Trash2 } from "lucide-react";
import type { Product } from "@/logic-bussines-layer/domain/models/product.model";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";





export const ProductCard = ({ product, onEdit, onDelete }: {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}) => {
  const totalQty = product.sizes.reduce((acc, s) => acc + s.qty, 0);
  const lowStock = totalQty <= product.minStock;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md flex flex-col h-full">
      <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        {lowStock && (
          <Badge
            variant="destructive"
            className="absolute right-2 top-2 text-[10px]"
          >
            Stock bajo
          </Badge>
        )}
      </div>
      <CardContent className="space-y-3 p-4 flex flex-col flex-1">
        <div>
          <h3 className="line-clamp-1 font-semibold">{product.title}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {product.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Package className="h-3.5 w-3.5" />
            Stock mín: <span className="font-medium text-foreground">{product.minStock}</span>
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {product.createdAt.toLocaleDateString("es-VE")}
          </span>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-8 text-xs">Talla</TableHead>
                <TableHead className="h-8 text-xs">Precio</TableHead>
                <TableHead className="h-8 text-right text-xs">Cant.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {product.sizes?.length ? (
                product.sizes.map((s, i) => (
                  <TableRow key={`${s.size ?? i}-${i}`}>
                    <TableCell className="py-1.5 text-xs font-medium">{s.size}</TableCell>
                    <TableCell className="py-1.5 text-xs">${s.price ?? "-"}</TableCell>
                    <TableCell className="py-1.5 text-right text-xs">{s.qty ?? 0}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="py-1.5 text-center text-xs text-muted-foreground">
                    No hay tallas disponibles
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex gap-2 pt-1 mt-auto">
          <Button
            variant="default"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={() => onEdit(product)}
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex-1 gap-1.5 bg-red-600 hover:bg-red-700 text-white"
            onClick={() => onDelete(product)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}