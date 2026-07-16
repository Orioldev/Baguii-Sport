import { useMemo, useState } from "react";
import {
  Plus,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClientItemTable } from "./components/ClienteItemTable";
import { ClienteMovilCard } from "./components/ClienteMovilCard";
import { CreateClienteModal } from "./components/CreateClienteModal";
import { EditClienteModal } from "./components/EditClienteModal"; 
import { DeleteClienteDialog } from "./components/DeleteClienteDialog"; 
import { SearchBar } from "../../components/SearchBar";
import { SearchInput } from "../../components/SearchInput";
import { SearchFilters } from "../../components/SearchFilters";
import { DateFilter, matchesDateFilter, type DateFilterKey } from "../../components/DateFilter";
import { useClientActions } from "./hooks/useClientActions"; // Hook con TanStack Query importado
import { PaginationControls } from "../../components/PaginationControls"; // Paginación importada

// ---------- Types ----------
export type Client = {
  id: string;
  name: string;
  phone: string;
  createdAt: Date;
  company: string;
};

export type ClientItemProps = {
  client: Client;
  onEdit?: (c: Client) => void;
  onDelete?: (c: Client) => void;
};

// ---------- Helpers ----------
export const formatDate = (d: Date) =>
  d.toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const toDateInputValue = (d: Date) => {
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60 * 1000);
  return local.toISOString().slice(0, 10);
};

// Configuración de paginación para optimizar rendimiento
const ITEMS_PER_PAGE = 8;

function ClientesPage() {
  // 🔄 Conexión con el estado asíncrono y en tiempo real de TanStack Query
  const { clients, isLoading, createClient, updateClient, deleteClient } = useClientActions();

  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilterKey>("todos");

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);

  // Estados de modales
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // 1. Filtrado lógico sobre la data real de la caché
  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const matchesQuery = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           c.company.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesQuery && matchesDateFilter(c.createdAt, dateFilter);
    });
  }, [clients, searchTerm, dateFilter]);

  // Controles de cambios de búsqueda y filtros (reseteando a la página 1)
  const handleSearchTrigger = () => {
    setSearchTerm(query);
    setCurrentPage(1);
  };

  const handleDateFilterChange = (filter: DateFilterKey) => {
    setDateFilter(filter);
    setCurrentPage(1);
  };

  // 2. Segmentación para la página actual
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  // 🟢 Operaciones asíncronas mutando la persistencia real
  const handleCreate = async (newClient: Client) => {
    const { id, ...clientData } = newClient; // Omitimos el ID temporal del modal, Firestore genera el suyo nativo
    await createClient(clientData);
    setCreateOpen(false);
    setCurrentPage(1); // Volver al inicio para ver al nuevo cliente
  };

  const handleUpdate = async (updatedClient: Client) => {
    if (!updatedClient.id) return;
    const { id, ...fieldsToUpdate } = updatedClient;
    await updateClient(id, fieldsToUpdate);
    setEditOpen(false);
    setSelectedClient(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedClient || !selectedClient.id) return;
    await deleteClient(selectedClient.id);
    setDeleteOpen(false);
    setSelectedClient(null);
    
    // Si borramos el último elemento de la página actual, retrocedemos una página
    if (paginatedClients.length === 1 && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Renderizado de carga inicial
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Cargando base de datos de clientes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        
        {/* SEARCH / FILTER / CREATE BAR */}
        <SearchBar>
          <SearchInput
            placeholder="Buscar cliente por nombre o empresa..."
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
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nuevo cliente
                </Button>
              </DialogTrigger>
              <CreateClienteModal onCreate={handleCreate} />
            </Dialog>
          </SearchFilters>
        </SearchBar>

        {/* CLIENTS CONTENT SECTION */}
        <section className="mt-6">
          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
              <Users className="mx-auto mb-3 h-10 w-10 opacity-50" />
              <p>No se encontraron registros de clientes.</p>
            </div>
          ) : (
            <>
              {/* Desktop/Tablet Table View */}
              <Card className="hidden md:block overflow-hidden">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead>Fecha de creación</TableHead>
                        <TableHead>Cargo / Empresa</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedClients.map((c) => (
                        <ClientItemTable
                          key={c.id}
                          client={c}
                          onEdit={(x) => {
                            setSelectedClient(x);
                            setEditOpen(true);
                          }}
                          onDelete={(x) => {
                            setSelectedClient(x);
                            setDeleteOpen(true);
                          }}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Mobile Card Layout View */}
              <div className="grid gap-4 md:hidden">
                {paginatedClients.map((c) => (
                  <ClienteMovilCard
                    key={c.id}
                    client={c}
                    onEdit={(x) => {
                      setSelectedClient(x);
                      setEditOpen(true);
                    }}
                    onDelete={(x) => {
                      setSelectedClient(x);
                      setDeleteOpen(true);
                    }}
                  />
                ))}
              </div>

              {/* Controles de Paginación Compartidos al final de la lista */}
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

        {/* MODAL FLOTANTE DE EDICIÓN */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          {selectedClient && (
            <EditClienteModal client={selectedClient} onUpdate={handleUpdate} />
          )}
        </Dialog>

        {/* DIÁLOGO FLOTANTE DE CONFIRMACIÓN DE ELIMINACIÓN */}
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DeleteClienteDialog
            client={selectedClient}
            onConfirm={handleDeleteConfirm}
            onCancel={() => {
              setDeleteOpen(false);
              setSelectedClient(null);
            }}
          />
        </Dialog>

      </main>
    </div>
  );
}

export default ClientesPage;