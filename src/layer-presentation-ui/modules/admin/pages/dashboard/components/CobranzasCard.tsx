import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, Wallet } from "lucide-react";
import { StatBox } from "./StatBox";

export const CobranzasCard = ({
  canceladas,
  pendientes,
}: {
  canceladas: number;
  pendientes: number;
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Wallet className="h-4 w-4 text-primary" />
          Cobranzas
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <StatBox
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          label="Canceladas"
          value={canceladas}
        />
        <StatBox
          icon={<Clock className="h-4 w-4 text-amber-500" />}
          label="Pendientes"
          value={pendientes}
        />
      </CardContent>
    </Card>
  );
};