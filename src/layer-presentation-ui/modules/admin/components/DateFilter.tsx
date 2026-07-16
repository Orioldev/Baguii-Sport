import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ---------- Types ----------
export type DateFilterKey =
  | "todos"
  | "hoy"
  | "ayer"
  | "semanal"
  | "hace 15 dias"
  | "ultimos 30 dias";

export const dateFilterOptions: { value: DateFilterKey; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "hoy", label: "Hoy" },
  { value: "ayer", label: "Ayer" },
  { value: "semanal", label: "Hace una semana" },
  { value: "hace 15 dias", label: "Hace 15 días" },
  { value: "ultimos 30 dias", label: "Últimos 30 días" },
];

/**
 * Helper reutilizable para filtrar por fecha en cualquier entidad.
 * Compara días calendario puros eliminando las horas.
 */
export function matchesDateFilter(date: Date, key: DateFilterKey): boolean {
  // 1. Creamos copias de las fechas "limpias" (fijadas a la medianoche 00:00:00)
  const hoyLimpio = new Date();
  hoyLimpio.setHours(0, 0, 0, 0);

  const fechaProductoLimpia = new Date(date);
  fechaProductoLimpia.setHours(0, 0, 0, 0);

  // 2. Calculamos la diferencia exacta en días calendario
  const diffTime = hoyLimpio.getTime() - fechaProductoLimpia.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  // 3. Evaluamos según el filtro seleccionado
  switch (key) {
    case "todos":           return true;
    case "hoy":             return diffDays === 0;
    case "ayer":            return diffDays === 1;
    case "semanal":         return diffDays <= 7;
    case "hace 15 dias":    return diffDays <= 15;
    case "ultimos 30 dias": return diffDays <= 30;
    default:                return true;
  }
}

// ---------- Props ----------
interface DateFilterProps {
  value: DateFilterKey;
  onChange: (value: DateFilterKey) => void;
  /** Opcional: reemplaza las opciones por defecto si la página necesita otras. */
  options?: { value: DateFilterKey; label: string }[];
}

/**
 * Select de filtro por fecha.
 * Genérico: sirve para Productos, Compras, Ventas, etc.
 */
export const DateFilter = ({
  value,
  onChange,
  options = dateFilterOptions,
}: DateFilterProps) => {
  return (
    <div className="flex items-center gap-2">
      <Filter className="h-4 w-4 text-muted-foreground" />
      <Select value={value} onValueChange={(v) => onChange(v as DateFilterKey)}>
        <SelectTrigger className="w-full sm:w-50">
          <SelectValue placeholder="Filtrar por fecha" />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};