import { formatMoney, formatBs } from "../../cobranzas/CobranzasPage";

export const Row = ({
  icon,
  label,
  usd,
  rate,
}: {
  icon: React.ReactNode;
  label: string;
  usd: number;
  rate?: number | null;
}) => {
  const hasRate = typeof rate === "number" && rate > 0;

  return (
    <div className="flex items-center justify-between rounded-md border bg-muted/30 p-3">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold">${formatMoney(usd)}</p>
        {hasRate && (
          <p className="text-[11px] text-muted-foreground">Bs. {formatBs(usd * (rate as number))}</p>
        )}
      </div>
    </div>
  );
};