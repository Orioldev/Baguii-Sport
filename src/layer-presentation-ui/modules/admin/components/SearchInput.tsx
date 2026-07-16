import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchInputProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onSearch: () => void;
}

/**
 * Input de búsqueda + botón Buscar.
 * Genérico: cualquier página lo usa con su propio placeholder y handlers.
 */
export const SearchInput = ({
  value,
  placeholder = "Buscar...",
  onChange,
  onSearch,
}: SearchInputProps) => {
  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row lg:max-w-md">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
  );
};