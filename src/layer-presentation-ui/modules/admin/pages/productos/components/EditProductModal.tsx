import { useRef, useState, useEffect } from "react";
import { Plus, Trash2, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Product, SizeRow } from "@/logic-bussines-layer/domain/models/product.model";
import { toast } from "sonner";

interface EditProductModalProps {
  product: Product;
  onUpdate: (updatedData: Partial<Product>, imageFile: File | null) => void;
  isSubmitting?: boolean;
}

export const EditProductModal = ({ product, onUpdate, isSubmitting = false }: EditProductModalProps) => {
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description);
  const [minStock, setMinStock] = useState(String(product.minStock));
  const [imagePreview, setImagePreview] = useState<string>(product.image);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sizes, setSizes] = useState<SizeRow[]>(product.sizes);
  const fileRef = useRef<HTMLInputElement>(null);

  // Sincronizar el estado si el producto cambia externamente
  useEffect(() => {
    setTitle(product.title);
    setDescription(product.description);
    setMinStock(String(product.minStock));
    setImagePreview(product.image);
    setSizes(product.sizes);
    setSelectedFile(null);
  }, [product]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      toast.warning("Solo se permiten imágenes JPG, JPEG, PNG o WEBP.");
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const addSize = () => {
    setSizes([...sizes, { size: "", price: 0, qty: 0 }]);
  };

  const removeSize = (index: number) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  const updateSize = (index: number, field: keyof SizeRow, value: string) => {
    const next = [...sizes];
    if (field === "size") {
      next[index].size = value;
    } else {
      // Conversión numérica segura
      next[index][field] = value === "" ? 0 : parseFloat(value);
    }
    setSizes(next);
  };

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      toast.warning("Por favor rellene los campos obligatorios.");
      return;
    }

    const filteredSizes = sizes.filter(s => s.size.trim() !== "");
    if (filteredSizes.length === 0) {
      toast.warning("Debe añadir al menos una combinación de talla.");
      return;
    }

    onUpdate(
      {
        title,
        description,
        minStock: parseInt(minStock) || 1,
        sizes: filteredSizes,
      },
      selectedFile
    );
  };

  return (
    <DialogContent className="sm:max-w-137 max-h-[90vh] overflow-y-auto scrollbar-thin">
      <DialogHeader>
        <DialogTitle>Editar Calzado</DialogTitle>
      </DialogHeader>

      <div className="space-y-5 py-4">
        {/* Imagen */}
        {/* Imagen Optimizada para Edición */}
        <div className="flex flex-col items-center gap-2">
            <Label className="text-xs text-muted-foreground">Calzado a editar</Label>
            <div
                onClick={() => fileRef.current?.click()}
                className="group relative flex h-24 w-32 cursor-pointer flex-col items-center justify-center rounded-md border bg-muted transition-colors hover:border-primary overflow-hidden shadow-sm"
            >
                {imagePreview ? (
                <>
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-contain p-1" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Upload className="h-4 w-4 text-white" />
                    </div>
                </>
                ) : (
                <div className="flex flex-col items-center text-muted-foreground text-[10px] gap-1">
                    <Upload className="h-4 w-4" />
                    <span>Subir nueva</span>
                </div>
                )}
            </div>
            <input type="file" ref={fileRef} onChange={handleFile} className="hidden" accept="image/*" />
        </div>

        {/* Datos Principales */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="edit-title">Nombre del modelo *</Label>
            <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Zapato Deportivo Nike Air" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="edit-desc">Descripción *</Label>
            <Textarea id="edit-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalles de materiales, colores..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-stock">Stock Mínimo Alerta *</Label>
            <Input id="edit-stock" type="number" min="1" value={minStock} onChange={(e) => setMinStock(e.target.value)} />
          </div>
        </div>

        {/* Sección Dinámica de Variantes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Tallas, Precios y Cantidades</Label>
            <Button type="button" variant="outline" size="sm" onClick={addSize} className="h-8 gap-1">
              <Plus className="h-3.5 w-3.5" /> Añadir Talla
            </Button>
          </div>

          <div className="space-y-2">
            {sizes.map((s, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
                <Input placeholder="Talla" value={s.size} onChange={(e) => updateSize(i, "size", e.target.value)} />
                <Input placeholder="Precio $" type="number" min="0" step="0.01" value={s.price || ""} onChange={(e) => updateSize(i, "price", e.target.value)} />
                <Input placeholder="Cantidad" type="number" min="0" value={s.qty || ""} onChange={(e) => updateSize(i, "qty", e.target.value)} />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeSize(i)} disabled={sizes.length === 1} className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? "Guardando cambios..." : "Guardar cambios"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};