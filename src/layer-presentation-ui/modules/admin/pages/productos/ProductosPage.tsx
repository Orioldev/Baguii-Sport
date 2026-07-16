import { useMemo, useState } from "react";
import { useGetProducts, useProductMutations } from "./hooks/useProductMutations";

import { Plus, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

import { ProductCard } from "./components/ProductCard";
import { CreateProductModal } from "./components/CreateProductModal";
import { EditProductModal } from "./components/EditProductModal"; 
import { DeleteProductDialog } from "./components/DeleteProductDialog"; 
import { DateFilter, matchesDateFilter, type DateFilterKey } from "../../components/DateFilter";
import { SearchInput } from "../../components/SearchInput";
import { SearchBar } from "../../components/SearchBar";
import { SearchFilters } from "../../components/SearchFilters";
import type { Product } from "@/logic-bussines-layer/domain/models/product.model";
import { PaginationControls } from "../../components/PaginationControls";



const ProductosPage = () => {

  // 1. Agrega el estado de la página al inicio de tu componente ProductosPage
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Tu recomendación de oro


  // TanStack Query (Estado del Servidor)
  const { data: products = [], isLoading } = useGetProducts();
  const { createProduct, isCreating, updateProduct, isUpdating, deleteProduct, isDeleting } = useProductMutations();


  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<DateFilterKey>("todos");
  
  // Estados para controlar los Modales de Flujo
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  
  // Estados para saber qué calzado se está operando
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // 1. PROCESAMIENTO COMBINADO: Búsqueda + Filtro de Fecha corregido
  const filtered = useMemo(() => {
    return products.filter((p) => {
      // A. Filtro de Búsqueda por Nombre (Title)
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());

      // B. Filtro de Fecha Seguro (Convierte Timestamp de Firestore a Date nativo)
      let productDate: Date;
      
      if (p.createdAt && typeof (p.createdAt as any).toDate === "function") {
        productDate = (p.createdAt as any).toDate(); // Si viene directo de Firestore en la nube
      } else {
        productDate = new Date(p.createdAt); // Respaldo por si es un Date nativo local
      }

      const matchesDate = matchesDateFilter(productDate, filter);

      return matchesSearch && matchesDate;
    });
  }, [products, searchTerm, filter]);

  // 2. MATEMÁTICA DE CORTE (Pon esto justo debajo de tu useMemo 'filtered')
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  // Ajuste preventivo: si un filtro reduce drásticamente los resultados, evita quedar en una página vacía
  const activePage = currentPage > totalPages ? totalPages : currentPage;


  const startIndex = (activePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  // Este es el arreglo final que vas a mapear en la cuadrícula de la UI
  const productsToDisplay = filtered.slice(startIndex, endIndex);

  // 2. Sincronización del Input: Si el usuario borra todo el texto del buscador, 
  // refrescamos la lista automáticamente sin obligarlo a presionar el botón "Buscar".
  const handleQueryChange = (newValue: string) => {
    setQuery(newValue);
    if (newValue.trim() === "") {
      setSearchTerm("");
      setCurrentPage(1); // Reiniciar
    }
  };

  // Handler de Creación Real (Alineado con la firma (p: Product) => void)
  // Handler de Creación Real ajustado para enviar el archivo binario
  const handleCreateProduct = async (newProduct: Product) => {
    try {
      // 1. Buscamos el elemento input file real del DOM para obtener el archivo binario puro
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const imageFile = fileInput?.files?.[0] || null;

      // 2. Enviamos los datos estructurados al caso de uso a través de la mutación de TanStack Query
      await createProduct({ 
        input: {
          title: newProduct.title,
          description: newProduct.description,
          image: newProduct.image, // Esto sirve como respaldo o link por defecto
          minStock: newProduct.minStock,
          sizes: newProduct.sizes
        }, 
        imageFile: imageFile // <--- ¡Aquí viaja el archivo real hacia Supabase Storage!
      });
      
      setCreateOpen(false);
    } catch (error) {
      alert("Error al guardar el calzado en la base de datos.");
    }
  };

  // Handler de Edición Real
  const handleUpdateProduct = async (updatedFields: Partial<Product>) => {
    if (!selectedProduct) return;
    try {
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const imageFile = fileInput?.files?.[0] || null;

      await updateProduct({ 
        id: selectedProduct.id, 
        updatedFields, 
        imageFile 
      });
      
      setEditOpen(false);
    } catch (error) {
      alert("Error al actualizar la información.");
    }
  };

  // Handler de Eliminación Real
  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    try {
      await deleteProduct(selectedProduct.id);
      setDeleteOpen(false);
    } catch (error) {
      alert("Error al eliminar el producto.");
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <main>
        <SearchBar>
          <SearchInput
            value={query}
            placeholder="Buscar producto por nombre..."
            onChange={handleQueryChange}
            onSearch={() => setSearchTerm(query)}
          />
          <SearchFilters>
            <DateFilter 
              value={filter} 
              onChange={(nuevoFiltro) => {
                setFilter(nuevoFiltro);       // 1. Aplica el filtro (Ej: "hoy", "ayer")
                setCurrentPage(1);            // 2. Reinicia de inmediato a la página 1
              }}
            />
            <Button className="gap-2" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Nuevo producto 
            </Button>
          </SearchFilters>
        </SearchBar>

        {/* Lista de Calzados */}
        <section>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm font-medium">Cargando inventario de calzados...</p>
            </div>
          ) : productsToDisplay.length === 0 ? (
            <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
              <Package className="mx-auto mb-3 h-10 w-10 opacity-50" />
              <p>No se encontraron productos.</p>
            </div>
          ) : (
            // Agregamos un fragmento <> </> para agrupar la cuadrícula junto con los controles
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {productsToDisplay.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onEdit={(prod) => {
                      setSelectedProduct(prod);
                      setEditOpen(true);
                    }}
                    onDelete={(prod) => {
                      setSelectedProduct(prod);
                      setDeleteOpen(true);
                    }}
                  />
                ))}
              </div>

              {/* AQUÍ ENTRA TU NUEVO COMPONENTE DE PAGINACIÓN */}
              <PaginationControls
                currentPage={activePage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </section>
      </main>

      {/* MODAL 1: CREAR */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <CreateProductModal onCreate={handleCreateProduct} isSubmitting={isCreating} />
      </Dialog>

      {/* MODAL 2: EDITAR */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        {selectedProduct && (
          <EditProductModal
            product={selectedProduct}
            onUpdate={handleUpdateProduct}
            isSubmitting={isUpdating}
          />
        )}
      </Dialog>

      {/* MODAL 3: CONFIRMAR ELIMINACIÓN */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DeleteProductDialog
          product={selectedProduct}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteOpen(false)}
          isDeleting={isDeleting}
        />
      </Dialog>
    </div>
  );
};

export default ProductosPage;