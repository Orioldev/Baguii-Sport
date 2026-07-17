// src/layer-presentation-ui/modules/admin/pages/ventas/VentasPage.tsx
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { container } from "@/di/container";
import { useDollarRate } from "@/layer-presentation-ui/hooks/useDollarRate";
import { Plus, ShoppingBag, Loader2 } from "lucide-react"; // Añadido Loader2 para feedback
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { DateFilter, matchesDateFilter, type DateFilterKey } from "../../components/DateFilter";
import { VentasCard } from "./components/VentasCard";
import { CreateVentaModal } from "./components/CreateVentaModal";
import { EditVentaModal } from "./components/EditVentaModal";
import { DeleteVentaDialog } from "./components/DeleteVentaDialog";
import { PaginationControls } from "../../components/PaginationControls";
import { SearchBar } from "../../components/SearchBar";
import { SearchInput } from "../../components/SearchInput";
import { SearchFilters } from "../../components/SearchFilters";

// Importamos el hook que creamos en el paso anterior
import { useSales } from "./hooks/useSales"; 
import type { Sale } from "@/logic-bussines-layer/domain/models/sale.model";
import { useGetProducts } from "../productos/hooks/useProductMutations";
import { toast } from "sonner";

function VentasPage() {
  const { rate } = useDollarRate();
  
  // 🟢 REEMPLAZO CLAVE: Adiós al useState(initialSales) local de mentira
  const { sales, isLoading: isLoadingSales, createSale, deleteSale, updateSale, isCreating, isUpdating, isDeleting } = useSales();

  // 2. Traer los productos reales en tiempo real o por caché de TanStack
  const { data: realProducts = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: () => container.getProducts(), // Reemplaza por tu método real de dominio
  });

  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilterKey>("todos");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // 1. Cargamos el hook que lee la caché en memoria de tus productos/calzados
  const { data: products = [] } = useGetProducts();

  const filtered = useMemo(() => {
    return sales.filter((s) => {
      const matchesQuery = s.productTitle
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      return matchesQuery && matchesDateFilter(s.date, dateFilter);
    });
  }, [sales, searchTerm, dateFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const activePage = currentPage > totalPages ? totalPages : currentPage;
  const startIndex = (activePage - 1) * itemsPerPage;
  const salesToDisplay = filtered.slice(startIndex, startIndex + itemsPerPage);

  // 🟢 EJECUCIÓN REAL: Envía los datos de la UI al dominio transaccional de Firestore
  const handleCreate = async (createdData: Sale) => {
    try {
      // Extraemos el id temporal generado por crypto.randomUUID en el modal ya que Firebase asigna el suyo
      const { id, ...saleData } = createdData; 
      
      await createSale({
        ...saleData,
        rate: rate, // Congelamos la tasa del estado global en este milisegundo
      });
      
      setCreateOpen(false);
      toast.success("Venta registrada correctamente.");
    } catch (err: any) {
      toast.error(err.message || "Error al procesar la venta transaccional");
    }
  };

  // EJECUCIÓN REFACTORIZADA PARA LA EDICIÓN REAL
  const handleUpdate = async (updatedSale: Sale) => {
    if (!updatedSale.id) return;

    try {
      // 1. 🔍 Primera Barrera: Tu validación en caché (déjala igual)
      const productInCache = products.find(p => p.id === updatedSale.productId);
      if (productInCache) {
        const originalSale = sales.find(s => s.id === updatedSale.id);
        for (const newItem of updatedSale.items) {
          const oldItem = originalSale?.items.find(i => i.size === newItem.size);
          const oldQty = oldItem ? oldItem.qty : 0;
          const diff = newItem.qty - oldQty; 

          const sizeInCache = productInCache.sizes.find(s => s.size === newItem.size);
          const availableStock = sizeInCache ? sizeInCache.qty : 0;

          if (availableStock < diff) {
            toast.warning(`Stock insuficiente para la talla ${newItem.size}`, {
              description: `Disponibles en vitrina: ${availableStock}. Estás solicitando registrar ${diff} par(es) adicional(es).`,
            });
            return; 
          }
        }
      }

      // 2. 🟢 LA CORRECCIÓN AQUÍ: Desestructuramos el ID y agrupamos TODO el resto del objeto 
      // asegurando que cumpla con el tipo estricto Omit<Sale, "id"> (incluyendo productId, items, etc.)
      const { id, ...saleDataWithoutId } = updatedSale;

      // Enviamos el payload completo a la mutación
      await updateSale({
        id: id,
        updatedFields: saleDataWithoutId, 
      });

      setEditOpen(false);
      setSelectedSale(null);
      toast.success("Venta actualizada correctamente.");
    } catch (err: any) {
      toast.error(err.message || "No se pudieron guardar los cambios de la venta.");
    }
  };

  // 🟢 EJECUCIÓN DEL BORRADO SEGURO
  const handleDeleteConfirm = async () => {
    if (!selectedSale || !selectedSale.id) return;

    try {
      // Ejecutamos el borrado aislado directo en Firebase
      await deleteSale(selectedSale.id);
      setDeleteOpen(false);
      setSelectedSale(null);
      toast.success("Venta eliminada correctamente.");
    } catch (err: any) {
      toast.error(err.message || "No se pudo eliminar la venta.");
    }
  }

  // Pantalla de carga limpia mientras lee Firestore
  if (isLoadingSales) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-muted-foreground font-medium">Sincronizando flujo de caja con Firebase...</p>
      </div>
    );
  }

  // 3. Modifica el estado de carga para contemplar ambos flujos
  if (isLoadingSales || isLoadingProducts) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-muted-foreground font-medium">Sincronizando con Firebase...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* El cuerpo se mantiene exactamente igual a tu diseño original */}
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        <SearchBar>
          <SearchInput
            value={query}
            placeholder="Buscar venta por calzado..."
            onChange={(val) => {
              setQuery(val);
              if (val.trim() === "") {
                setSearchTerm("");
                setCurrentPage(1);
              }
            }}
            onSearch={() => {
              setSearchTerm(query);
              setCurrentPage(1);
            }}
          />
          <SearchFilters>
            <DateFilter
              value={dateFilter}
              onChange={(nextFilter) => {
                setDateFilter(nextFilter);
                setCurrentPage(1);
              }}
            />
            <Button className="gap-2" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Nueva venta
            </Button>
          </SearchFilters>
        </SearchBar>

        <section>
          {salesToDisplay.length === 0 ? (
            <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
              <ShoppingBag className="mx-auto mb-3 h-10 w-10 opacity-50" />
              <p>No se encontraron ventas reales registradas.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {salesToDisplay.map((s) => (
                  <VentasCard
                    key={s.id}
                    sale={s}
                    onEdit={(sale) => {
                      setSelectedSale(sale);
                      setEditOpen(true);
                    }}
                    onDelete={(sale) => {
                      setSelectedSale(sale);
                      setDeleteOpen(true);
                    }}
                  />
                ))}
              </div>

              <PaginationControls
                currentPage={activePage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </section>
      </main>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <CreateVentaModal products={realProducts} onCreate={handleCreate} isSubmitting={isCreating} />
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        {selectedSale && (
          <EditVentaModal
            products={realProducts}
            sale={selectedSale}
            onUpdate={handleUpdate}
            isSubmitting={isUpdating}
          />
        )}
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DeleteVentaDialog
          sale={selectedSale}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteOpen(false)}
          isDeleting={isDeleting}
        />
      </Dialog>
    </div>
  );
}

export default VentasPage;