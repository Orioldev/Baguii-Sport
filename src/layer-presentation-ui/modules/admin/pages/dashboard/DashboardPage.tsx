import { useEffect, useState } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { TransactionsCard } from "./components/TransaccionsCard";
import { CobranzasCard } from "./components/CobranzasCard";
import { ProductsCard } from "./components/ProductsCards";
import { ChartCard } from "./components/ChartCard";
import { MoneyUnitsTooltip } from "./components/MoneyUnitsTooltip";
import { MoneyTooltip } from "./components/MoneyTooltip";
import { useDashboardStats } from "./hooks/useDashboardStats";

// 🟢 Los tipos de fila/tooltip ahora viven en el hook (porque es quien los produce),
// y se re-exportan aquí para que MoneyTooltip.tsx y MoneyUnitsTooltip.tsx sigan
// funcionando sin cambios (siguen importándolos desde "../DashboardPage").
export type { WeekRow, MonthRow, YearRow, TooltipProps } from "./hooks/useDashboardStats";

const formatCompact = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`;

// ---------- Page ----------
function DashboardPage() {
  // Evita mismatch de hidratación con los charts
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // 🟢 Datos reales y en vivo: ventas, compras y deudas por onSnapshot; productos por
  // useQuery (se refresca al vender o cada 5 min, ver nota en useDashboardStats.ts)
  const { isLoading, totals, weekData, monthData, yearData, rate } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Cargando métricas del negocio...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Resumen general del negocio.
          </p>
        </header>

        {/* SUMMARY CARDS */}
        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <TransactionsCard ventas={totals.ventas} compras={totals.compras} rate={rate} />
          <CobranzasCard canceladas={totals.deudasCanceladas} pendientes={totals.deudasPendientes} />
          <ProductsCard total={totals.productosTotal} stockMin={totals.productosStockMin} />
        </section>

        {/* CHARTS */}
        <section className="grid gap-4 lg:grid-cols-2">
          <ChartCard
            title="Ventas vs Compras (Semanal)"
            subtitle="Lunes a domingo"
          >
            {mounted && (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={weekData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={formatCompact} />
                  <Tooltip content={<MoneyUnitsTooltip />} />
                  <Legend />
                  <Bar dataKey="ventas" name="Ventas" fill="hsl(160 84% 39%)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="compras" name="Compras" fill="hsl(346 87% 53%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard
            title="Ventas vs Compras (Mensual)"
            subtitle="Por semanas del mes"
          >
            {mounted && (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={formatCompact} />
                  <Tooltip content={<MoneyUnitsTooltip />} />
                  <Legend />
                  <Bar dataKey="ventas" name="Ventas" fill="hsl(160 84% 39%)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="compras" name="Compras" fill="hsl(346 87% 53%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard
            title="Tendencia anual"
            subtitle="Ventas vs compras (Ene — Dic)"
            className="lg:col-span-2"
          >
            {mounted && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={yearData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={formatCompact} />
                  <Tooltip content={<MoneyTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="ventas"
                    name="Ventas"
                    stroke="hsl(160 84% 39%)"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="compras"
                    name="Compras"
                    stroke="hsl(346 87% 53%)"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

        </section>
      </main>
    </div>
  );
}

export default DashboardPage;