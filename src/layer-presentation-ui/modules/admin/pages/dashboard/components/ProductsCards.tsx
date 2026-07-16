import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Boxes } from "lucide-react";
import { StatBox } from "./StatBox";

export const ProductsCard = ({
  total,
  stockMin,
}: {
  total: number;
  stockMin: number;
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Boxes className="h-4 w-4 text-primary" />
          Productos
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <StatBox
          icon={<Boxes className="h-4 w-4 text-blue-500" />}
          label="En inventario"
          value={total}
        />
        <StatBox
          icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
          label="Stock mínimo"
          value={stockMin}
        />
      </CardContent>
    </Card>
  );
};