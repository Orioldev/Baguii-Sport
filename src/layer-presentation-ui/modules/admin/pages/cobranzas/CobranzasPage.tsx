import { useMemo, useState } from "react";
import {
  Plus,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import { DeudaCard } from "./components/DeudaCard";
import { CreateDeudaModal } from "./components/CreateDeudaModal";
import { EditDeudaModal } from "./components/EditDeudaModal";
import { DeleteDeudaDialog } from "./components/DeleteDeudaDialog";
import { AbonarDeudaModal } from "./components/AbonarDeudaModal";
import { SearchBar } from "../../components/SearchBar";
import { SearchInput } from "../../components/SearchInput";
import { SearchFilters } from "../../components/SearchFilters";
import { DateFilter, matchesDateFilter, type DateFilterKey } from "../../components/DateFilter";
import { PaginationControls } from "../../components/PaginationControls";
import { useDollarRate } from "@/layer-presentation-ui/hooks/useDollarRate";
import { useDeudaMutations } from "./hooks/useDeudasMutations";
// Mismo hook que ya usa ClientesPage: TanStack Query + suscripción en tiempo real a Firestore.
// No se reimplementa nada nuevo, solo se reutiliza la fuente de verdad ya existente de clientes.
import { useClientActions } from "../clientes/hooks/useClientActions";
import { toast } from "sonner";

// 🟢 El modelo ya no se define aquí: vive en el dominio y solo se re-exporta,
// así ningún import existente en DeudaCard/CreateDeudaModal/etc. se rompe.
export type { Debt } from "@/logic-bussines-layer/domain/models/debt.model";
import type { Debt } from "@/logic-bussines-layer/domain/models/debt.model";

export type DebtItemProps = {
  debt: Debt;
  rate?: number | null;
  onEdit?: (d: Debt) => void;
  onDelete?: (d: Debt) => void;
  onAbonar?: (d: Debt) => void;
};

export const formatMoney = (v: number) =>
  v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatBs = (v: number) =>
  v.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type ModalState =
  | { type: "none" }
  | { type: "create" }
  | { type: "edit"; debt: Debt }
  | { type: "delete"; debt: Debt }
  | { type: "abonar"; debt: Debt };

const ITEMS_PER_PAGE = 9; // múltiplo de 3 para que cuadre con el grid xl:grid-cols-3

function CobranzasPage() {
  // 🟢 Datos reales desde Firestore en tiempo real + mutaciones (create/update/delete/abonar)
  const { debts, isLoading: isLoadingDeudas, createDeuda, updateDeuda, deleteDeuda, abonarDeuda, isDeleting } = useDeudaMutations();

  // 🟢 Clientes reales, ya persistidos por el módulo de Clientes (mismo hook, misma caché)
  const { clients, isLoading: isLoadingClients } = useClientActions();
  const isLoading = isLoadingDeudas || isLoadingClients;
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilterKey>("todos");
  const [currentPage, setCurrentPage] = useState(1);

  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const closeModal = () => setModal({ type: "none" });

  const { rate } = useDollarRate();

  const filtered = useMemo(() => {
    return debts.filter((d) => {
      const matchesQuery = d.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           d.clientCompany.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesQuery && matchesDateFilter(d.createdAt, dateFilter);
    });
  }, [debts, searchTerm, dateFilter]);

  // 🟢 Paginación: se recalcula sobre el resultado ya filtrado
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const paginatedDebts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const handleSearchTrigger = () => {
    setSearchTerm(query);
    setCurrentPage(1); // toda búsqueda nueva vuelve a la página 1
  };

  const handleDateFilterChange = (filter: DateFilterKey) => {
    setDateFilter(filter);
    setCurrentPage(1);
  };

  // 🟢 Los handlers ahora delegan al caso de uso (vía el hook) en lugar de mutar estado local.
  // La suscripción en tiempo real del hook actualiza `debts` sola cuando Firestore confirma.
  const handleCreate = async (newDebt: Omit<Debt, "id">) => {
    try {
      await createDeuda(newDebt);
      closeModal();
      toast.success("Deuda registrada correctamente.");
    } catch (err: any) {
      console.error("Error al crear la deuda:", err);
      toast.error(err.message || "No se pudo registrar la deuda.");
      throw err; // el modal usa esto para no limpiar el formulario si falló
    }
  };

  const handleUpdate = async (updatedDebt: Debt) => {
    try {
      const { id, ...fields } = updatedDebt;
      await updateDeuda({ id, fields });
      closeModal();
      toast.success("Deuda actualizada correctamente.");
    } catch (err: any) {
      console.error("Error al actualizar la deuda:", err);
      toast.error(err.message || "No se pudieron guardar los cambios de la deuda.");
    }
  };

  const handleAbonar = async (debt: Debt, amount: number) => {
    try {
      await abonarDeuda({ debt, amount });
      closeModal();
      toast.success("Abono registrado correctamente.");
    } catch (err: any) {
      console.error("Error al registrar el abono:", err);
      toast.error(err.message || "No se pudo registrar el abono.");
      throw err; // el modal usa esto para no limpiar el campo de monto si falló
    }
  };

  const handleDeleteConfirm = async () => {
    if (modal.type !== "delete") return;
    try {
      await deleteDeuda(modal.debt.id);
      closeModal();
      toast.success("Deuda eliminada correctamente.");
      if (paginatedDebts.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    } catch (err: any) {
      console.error("Error al eliminar la deuda:", err);
      toast.error(err.message || "No se pudo eliminar la deuda.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">

        <SearchBar>
          <SearchInput
            placeholder="Buscar deudor por nombre o empresa..."
            value={query}
            onChange={(val) => {
              setQuery(val);
              if (val.trim() === "") {
                setSearchTerm("");
                setCurrentPage(1);
              }
            }}
            onSearch={handleSearchTrigger}
          />
          <SearchFilters>
            <DateFilter value={dateFilter} onChange={handleDateFilterChange} />
            <Dialog
              open={modal.type === "create"}
              onOpenChange={(open) => (open ? setModal({ type: "create" }) : closeModal())}
            >
              <DialogTrigger>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nueva deuda
                </Button>
              </DialogTrigger>
              <CreateDeudaModal clients={clients} onCreate={handleCreate} />
            </Dialog>
          </SearchFilters>
        </SearchBar>

        <section className="mt-6">
          {isLoading ? (
            <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
              <p>Cargando deudas...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
              <Wallet className="mx-auto mb-3 h-10 w-10 opacity-50" />
              <p>No hay deudas registradas.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {paginatedDebts.map((d) => (
                  <DeudaCard
                    key={d.id}
                    debt={d}
                    rate={rate}
                    onEdit={(x) => setModal({ type: "edit", debt: x })}
                    onDelete={(x) => setModal({ type: "delete", debt: x })}
                    onAbonar={(x) => setModal({ type: "abonar", debt: x })}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </section>

        <Dialog open={modal.type === "edit"} onOpenChange={(open) => !open && closeModal()}>
          {modal.type === "edit" && (
            <EditDeudaModal debt={modal.debt} onUpdate={handleUpdate} />
          )}
        </Dialog>

        <Dialog open={modal.type === "abonar"} onOpenChange={(open) => !open && closeModal()}>
          {modal.type === "abonar" && (
            <AbonarDeudaModal debt={modal.debt} onAbonar={handleAbonar} />
          )}
        </Dialog>

        <Dialog open={modal.type === "delete"} onOpenChange={(open) => !open && closeModal()}>
          {modal.type === "delete" && (
            <DeleteDeudaDialog
              debt={modal.debt}
              onConfirm={handleDeleteConfirm}
              onCancel={closeModal}
              isDeleting={isDeleting}
            />
          )}
        </Dialog>

      </main>
    </div>
  );
}

export default CobranzasPage;