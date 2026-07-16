import { formatMoney } from "../../cobranzas/CobranzasPage";
import type { MonthRow, TooltipProps, WeekRow } from "../DashboardPage";


export const MoneyUnitsTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border bg-background p-2.5 text-xs shadow-md">
      <p className="mb-1.5 font-medium">{label}</p>
      {payload.map((p) => {
        const row = p.payload as WeekRow | MonthRow;
        const units = p.dataKey === "ventas" ? row.unidadesV : row.unidadesC;
        return (
          <div key={p.dataKey} className="flex items-center gap-2 py-0.5">
            <span
              className="inline-block h-2 w-2 rounded-sm"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-muted-foreground">{p.name}:</span>
            <span className="font-medium">${formatMoney(p.value)}</span>
            <span className="text-muted-foreground">·</span>
            <span className="font-medium">{units} u.</span>
          </div>
        );
      })}
    </div>
  );
}