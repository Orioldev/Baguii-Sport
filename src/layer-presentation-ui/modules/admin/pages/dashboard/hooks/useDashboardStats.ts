
import { useMemo } from "react";
import { useGetProducts } from "../../productos/hooks/useProductMutations";
import { useSales } from "../../ventas/hooks/useSales";
import { usePurchaseActions } from "../../compras/hooks/usePurchaseActions";
import { useDeudaMutations } from "../../cobranzas/hooks/useDeudasMutations";
import { useDollarRate } from "@/layer-presentation-ui/hooks/useDollarRate";

// ---------- Tipos que consumen los gráficos y sus tooltips ----------
export type WeekRow = { label: string; ventas: number; compras: number; unidadesV: number; unidadesC: number };
export type MonthRow = { label: string; ventas: number; compras: number; unidadesV: number; unidadesC: number };
export type YearRow = { label: string; ventas: number; compras: number };

export type TooltipProps = {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
    payload: WeekRow | MonthRow | YearRow;
  }>;
  label?: string;
};

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// Devuelve el lunes de la semana que contiene la fecha dada
const startOfWeek = (d: Date) => {
  const date = startOfDay(d);
  const day = date.getDay(); // 0 = Domingo, 1 = Lunes...
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
};

// Forma común para poder reutilizar el mismo bucketing con ventas y compras
interface DatedAmount {
  date: Date;
  totalUsd: number;
  qty: number;
}

const buildWeekData = (sales: DatedAmount[], purchases: DatedAmount[]): WeekRow[] => {
  const monday = startOfWeek(new Date());

  return DIAS_SEMANA.map((label, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    const isSameDay = (d: Date) => startOfDay(d).getTime() === day.getTime();

    const ventasDelDia = sales.filter((s) => isSameDay(s.date));
    const comprasDelDia = purchases.filter((p) => isSameDay(p.date));

    return {
      label,
      ventas: ventasDelDia.reduce((sum, s) => sum + s.totalUsd, 0),
      compras: comprasDelDia.reduce((sum, p) => sum + p.totalUsd, 0),
      unidadesV: ventasDelDia.reduce((sum, s) => sum + s.qty, 0),
      // 🟢 Purchase no tiene items/qty (ver purchase.model.ts), así que "unidades" de compra
      // se interpreta como cantidad de compras registradas ese día, no pares de calzado.
      unidadesC: comprasDelDia.length,
    };
  });
};

const buildMonthData = (sales: DatedAmount[], purchases: DatedAmount[]): MonthRow[] => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalWeeks = Math.ceil(daysInMonth / 7);

  return Array.from({ length: totalWeeks }, (_, i) => {
    const startDay = i * 7 + 1;
    const endDay = Math.min(startDay + 6, daysInMonth);

    const inRange = (d: Date) =>
      d.getFullYear() === year && d.getMonth() === month && d.getDate() >= startDay && d.getDate() <= endDay;

    const ventasSemana = sales.filter((s) => inRange(s.date));
    const comprasSemana = purchases.filter((p) => inRange(p.date));

    return {
      label: `Sem ${i + 1}`,
      ventas: ventasSemana.reduce((sum, s) => sum + s.totalUsd, 0),
      compras: comprasSemana.reduce((sum, p) => sum + p.totalUsd, 0),
      unidadesV: ventasSemana.reduce((sum, s) => sum + s.qty, 0),
      unidadesC: comprasSemana.length,
    };
  });
};

const buildYearData = (sales: DatedAmount[], purchases: DatedAmount[]): YearRow[] => {
  const year = new Date().getFullYear();

  return MESES.map((label, month) => {
    const inMonth = (d: Date) => d.getFullYear() === year && d.getMonth() === month;
    return {
      label,
      ventas: sales.filter((s) => inMonth(s.date)).reduce((sum, s) => sum + s.totalUsd, 0),
      compras: purchases.filter((p) => inMonth(p.date)).reduce((sum, p) => sum + p.totalUsd, 0),
    };
  });
};

export const useDashboardStats = () => {
  const { data: products = [], isLoading: isLoadingProducts } = useGetProducts();
  const { sales, isLoading: isLoadingSales } = useSales();
  const { purchases, isLoading: isLoadingPurchases } = usePurchaseActions();
  const { debts, isLoading: isLoadingDebts } = useDeudaMutations();
  const { rate } = useDollarRate();

  const isLoading = isLoadingProducts || isLoadingSales || isLoadingPurchases || isLoadingDebts;

  // Normalizamos ventas/compras a una forma común para reutilizar el bucketing por fecha
  const salesForCharts: DatedAmount[] = useMemo(
    () =>
      sales.map((s) => ({
        date: s.date,
        totalUsd: s.totalUsd,
        qty: s.items.reduce((sum, item) => sum + item.qty, 0),
      })),
    [sales]
  );

  const purchasesForCharts: DatedAmount[] = useMemo(
    () => purchases.map((p) => ({ date: p.date, totalUsd: p.totalUsd, qty: 1 })),
    [purchases]
  );

  const totals = useMemo(() => {
    const ventas = sales.reduce((sum, s) => sum + s.totalUsd, 0);
    const compras = purchases.reduce((sum, p) => sum + p.totalUsd, 0);

    const deudasCanceladas = debts.filter((d) => d.total - d.paid <= 0).length;
    const deudasPendientes = debts.filter((d) => d.total - d.paid > 0).length;

    // 🟢 Asunción: "total de productos en inventario" = suma de unidades (qty) de todas las tallas.
    // Si prefieres que sea la cantidad de modelos/productos distintos, cambia a `products.length`.
    const productosTotal = products.reduce(
      (sum, p) => sum + p.sizes.reduce((s, row) => s + row.qty, 0),
      0
    );

    const productosStockMin = products.filter((p) => {
      const stockActual = p.sizes.reduce((s, row) => s + row.qty, 0);
      return stockActual <= p.minStock;
    }).length;

    return { ventas, compras, deudasCanceladas, deudasPendientes, productosTotal, productosStockMin };
  }, [sales, purchases, debts, products]);

  const weekData = useMemo(
    () => buildWeekData(salesForCharts, purchasesForCharts),
    [salesForCharts, purchasesForCharts]
  );
  const monthData = useMemo(
    () => buildMonthData(salesForCharts, purchasesForCharts),
    [salesForCharts, purchasesForCharts]
  );
  const yearData = useMemo(
    () => buildYearData(salesForCharts, purchasesForCharts),
    [salesForCharts, purchasesForCharts]
  );

  return { isLoading, totals, weekData, monthData, yearData, rate };
};