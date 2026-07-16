import { Search, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ---------- Types ----------
export type FilterKey = "all" | "yesterday" | "today" | "week" | "fifteen" | "thirty";

const filterOptions: { value: FilterKey; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "today", label: "Hoy" },
  { value: "yesterday", label: "Ayer" },
  { value: "week", label: "Hace una semana" },
  { value: "fifteen", label: "Hace 15 días" },
  { value: "thirty", label: "Últimos 30 días" },
];

// ---------- Props ----------
interface ProductSearchBarProps {
  query: string;
  filter: FilterKey;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  onFilterChange: (value: FilterKey) => void;
  onCreateClick: () => void;
}

// ---------- Component ----------
export const ProductSearchCreateBar = ({
  query,
  filter,
  onQueryChange,
  onSearch,
  onFilterChange,
  onCreateClick,
}: ProductSearchBarProps) => {
  return (
    <section className="mb-6 rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="flex w-full flex-col gap-2 sm:flex-row lg:max-w-md">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar producto por nombre..."
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSearch();
              }}
              className="pl-9"
            />
          </div>
          <Button onClick={onSearch} className="sm:w-auto">
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>
        </div>

        {/* Filter + Create */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={filter}
              onValueChange={(v) => onFilterChange(v as FilterKey)}
            >
              <SelectTrigger className="w-full sm:w-50">
                <SelectValue placeholder="Filtrar por fecha" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button className="gap-2" onClick={onCreateClick}>
            <Plus className="h-4 w-4" />
            Nuevo producto
          </Button>
        </div>
      </div>
    </section>
  );
};