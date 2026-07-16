import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownCircle, ArrowUpCircle, TrendingUp } from "lucide-react";
import { Row } from "./Row";

export const TransactionsCard = ({
  ventas,
  compras,
  rate,
}: {
  ventas: number;
  compras: number;
  rate?: number | null;
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4 text-primary" />
          Transacciones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Row
          icon={<ArrowUpCircle className="h-4 w-4 text-emerald-500" />}
          label="Ventas"
          usd={ventas}
          rate={rate}
        />
        <Row
          icon={<ArrowDownCircle className="h-4 w-4 text-rose-500" />}
          label="Compras"
          usd={compras}
          rate={rate}
        />
      </CardContent>
    </Card>
  );
};