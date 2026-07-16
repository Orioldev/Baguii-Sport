import { type ReactNode } from "react";

interface SearchFiltersProps {
  children: ReactNode;
}

/**
 * Agrupa visualmente los controles de filtro (selects, toggles, etc.)
 * al lado derecho de la SearchBar.
 * No tiene lógica propia — solo layout.
 */
export const SearchFilters = ({ children }: SearchFiltersProps) => {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      {children}
    </div>
  );
};