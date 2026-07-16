import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  children: ReactNode;
  className?: string;
}

/**
 * Contenedor/layout de la barra de búsqueda.
 * No tiene lógica propia — solo provee estructura y estilos consistentes.
 * Cada página elige qué piezas (hijos) componer dentro.
 */
export const SearchBar = ({ children, className }: SearchBarProps) => {
  return (
    <section
      className={cn(
        "mb-6 rounded-lg border bg-card p-4 shadow-sm",
        className
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {children}
      </div>
    </section>
  );
};