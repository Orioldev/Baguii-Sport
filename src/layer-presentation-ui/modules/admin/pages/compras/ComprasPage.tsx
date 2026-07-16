import { useMemo, useState } from "react";
import {
  Plus,
  ShoppingCart,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";

import { ComprasCard } from "./components/ComprasCard";
import { paymentMethodOptions } from "../../mock/products.mock.data";
import { CreateComprasModal } from "./components/CreateComprasModal";
import { EditComprasModal } from "./components/EditComprasModal";
import { DeleteCompraDialog } from "./components/DeleteCompraDialog";
import { SearchBar } from "../../components/SearchBar";
import { SearchInput } from "../../components/SearchInput";
import { SearchFilters } from "../../components/SearchFilters";
import { DateFilter, matchesDateFilter, type DateFilterKey } from "../../components/DateFilter";
import { useDollarRate } from "@/layer-presentation-ui/hooks/useDollarRate";
import { usePurchaseActions } from "./hooks/usePurchaseActions";
import { PaginationControls } from "../../components/PaginationControls";


// ---------- Types ----------
export type PaymentMethod = "efectivo" | "pago_movil" | "punto" | "usdt";

export type Purchase = {
  id: string;
  name: string;
  paymentMethod: PaymentMethod;
  date: Date;
  description: string;
  totalUsd: number;
  rate: number; 
};


export const paymentMethodLabel = (m: PaymentMethod) =>
  paymentMethodOptions.find((o) => o.value === m)?.label ?? m;

export const formatDate = (d: Date) =>
  d.toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

// ---------- Constante de Configuración ----------
const ITEMS_PER_PAGE = 12; // Ajusta este número según prefieras (ej. 6, 9 o 12 para la cuadrícula)

// ---------- Page ----------
function ComprasPage() {

  const { rate } = useDollarRate() // Tasa de cambio para convertir USD a Bs (ejemplo)
  
  // 🔄 REEMPLAZO: Cambiamos el useState local por el Hook de persistencia real
  const { 
    purchases, 
    isLoading, 
    createPurchase, 
    updatePurchase, 
    deletePurchase 
  } = usePurchaseActions();


  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilterKey>("todos");

  // Estado para controlar la página actual
  const [currentPage, setCurrentPage] = useState(1);
  
  // Estados de control de modales
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);


  const filtered = useMemo(() => {
    return purchases.filter((p) => {
      const matchesQuery = p.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesQuery && matchesDateFilter(p.date, dateFilter);
    });
  }, [purchases, searchTerm, dateFilter]);

  // 🟢 2. Reiniciar a la página 1 si cambian los filtros de búsqueda o fecha
  const handleSearchTrigger = () => {
    setSearchTerm(query);
    setCurrentPage(1);
  };

  const handleDateFilterChange = (filter: DateFilterKey) => {
    setDateFilter(filter);
    setCurrentPage(1);
  };

  // 🟢 3. Segmentación para la página actual (Paginación)
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  
  const paginatedPurchases = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  // 🟢 Handlers actualizados asíncronos conectados al Hook
  const handleCreate = async (p: Purchase) => {
    // Quitamos el id temporal, Firestore genera el suyo nativamente
    const { id, ...purchaseData } = p; 
    await createPurchase(purchaseData);
    setCreateOpen(false);
  };

  const handleUpdate = async (updated: Purchase) => {
    if (!updated.id) return;
    const { id, ...fieldsToUpdate } = updated;
    await updatePurchase(id, fieldsToUpdate);
    setEditOpen(false);
    setSelectedPurchase(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPurchase || !selectedPurchase.id) return;
    await deletePurchase(selectedPurchase.id);
    setDeleteOpen(false);
    setSelectedPurchase(null);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Cargando historial de compras...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        {/* SEARCH / FILTER / CREATE */}
        <SearchBar>
          <SearchInput
            placeholder="Buscar compra por nombre..."
            value={query}
            onChange={(val) => {
              setQuery(val);
              // Si el usuario borra todo el texto, limpiamos el filtro inmediatamente para mostrar todo
              if (val.trim() === "") {
                setSearchTerm("");
                setCurrentPage(1);
              }
            }}
            onSearch={() => handleSearchTrigger()}
          />
          <SearchFilters>
            <DateFilter value={dateFilter} onChange={handleDateFilterChange}/>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nueva compra
                </Button>
              </DialogTrigger>
              <CreateComprasModal onCreate={handleCreate} currentRate={ rate } />
            </Dialog>
          </SearchFilters>
        </SearchBar>

        {/* PURCHASES LIST */}
        
        {/* PURCHASES LIST */}
        <section>
          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
              <ShoppingCart className="mx-auto mb-3 h-10 w-10 opacity-50" />
              <p>No se encontraron compras.</p>
            </div>
          ) : (
            <> 
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {paginatedPurchases.map((p) => (
                  <ComprasCard
                    key={p.id}
                    purchase={p}
                    onEdit={(pur) => {
                      setSelectedPurchase(pur);
                      setEditOpen(true);
                    }}
                    onDelete={(pur) => {
                      setSelectedPurchase(pur);
                      setDeleteOpen(true);
                    }}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </> 
          )}
        </section>


        {/* 🟢 MODAL DE EDICIÓN FLOTANTE */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          {selectedPurchase && (
            <EditComprasModal purchase={selectedPurchase} onUpdate={handleUpdate} />
          )}
        </Dialog>

        {/* 🟢 MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DeleteCompraDialog purchase={selectedPurchase} onConfirm={handleDeleteConfirm} />
        </Dialog>
      </main>
    </div>
  );
}


export default ComprasPage;