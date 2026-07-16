import { formatMoney } from "../../cobranzas/CobranzasPage";
import type { TooltipProps } from "../DashboardPage";



export const  MoneyTooltip = ({ active, payload, label }: TooltipProps) => { 
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border bg-background p-2.5 text-xs shadow-md">
      <p className="mb-1.5 font-medium">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 py-0.5">
          <span
            className="inline-block h-2 w-2 rounded-sm"
            style={{ backgroundColor: p.color }}
          />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium">${formatMoney(p.value)}</span>
        </div>
      ))}
    </div>
  );
}