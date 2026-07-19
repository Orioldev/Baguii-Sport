import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Product, SizeRow,  } from "@/logic-bussines-layer/domain/models/product.model";
import { useRef, useState } from "react";
import { Plus, Trash2, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { compressImage } from "@/layer-presentation-ui/utils/compress-image";

export const CreateProductModal = ({ 
  onCreate, 
  isSubmitting = false 
}: { 
  onCreate: (p: Product, imageFile: File | null) => void; 
  isSubmitting?: boolean; 
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [minStock, setMinStock] = useState("1");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sizes, setSizes] = useState<SizeRow[]>([
    { size: "", price: 0, qty: 0 },
  ]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      toast.warning("Solo se permiten imágenes JPG, JPEG o PNG.");
      return;
    }
    const compressed = await compressImage(file);
    setSelectedFile(compressed);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(compressed);
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
      // Si el usuario borra el campo (value === ""), asignamos 0 temporalmente para que sea numérico válido
      next[index][field] = value === "" ? 0 : Number(value);
    }
    setSizes(next);
  }

  const reset = () => {
    setTitle("");
    setDescription("");
    setMinStock("1");
    setImagePreview("");
    setSelectedFile(null);
    setSizes([{ size: "", price: 0, qty: 0 }]);
  };

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      toast.warning("Por favor rellene los campos obligatorios.");
      return;
    }

    const filteredSizes = sizes.filter((s) => s.size.trim() !== "");
    if (filteredSizes.length === 0) {
      toast.warning("Debe añadir al menos una combinación de talla.");
      return;
    }

    onCreate({
      id: Date.now().toString(),
      title,
      description,
      image: imagePreview || "https://placehold.co/600x450?text=Calzado+Bagui",
      minStock: parseInt(minStock) || 1,
      createdAt: new Date(),
      // SOLUCIÓN: Pasamos los valores directamente porque ya son de tipo number
      sizes: filteredSizes.map((s) => ({
        size: s.size,
        price: s.price,
        qty: s.qty,
      })),
    }, selectedFile);
    reset()
  };

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl scrollbar-thin">
      <DialogHeader>
        <DialogTitle>Crear nuevo producto</DialogTitle>
      </DialogHeader>

      <div className="space-y-4 py-2">
        {/* Image */}
        <div className="space-y-2">
          <Label>Imagen del producto</Label>
          <div
            onClick={() => fileRef.current?.click()}
            className="flex h-40 cursor-pointer items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-input bg-muted/30 transition-colors hover:bg-muted/50"
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Vista previa"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Upload className="h-6 w-6" />
                <span className="text-sm">Haz clic para subir (JPG, JPEG, PNG)</span>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            className="hidden"
            onChange={handleFile}
          />
        </div>

        {/* Title + min stock */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Nike Air Max"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minStock">Stock mínimo</Label>
            <Input
              id="minStock"
              type="number"
              min="0"
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Descripción breve</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Describe brevemente el producto..."
          />
        </div>

        {/* Sizes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Tallas, precio y cantidad</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSize}
              className="h-8 gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Agregar talla
            </Button>
          </div>
          <div className="space-y-2">
            {sizes.map((s, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2"
              >
                <Input
                  placeholder="Talla"
                  value={s.size}
                  onChange={(e) => updateSize(i, "size", e.target.value)}
                />
                <Input
                  placeholder="Precio $"
                  type="number"
                  min="0"
                  step="0.01"
                  value={s.price === 0 ? "" : s.price} // Si es 0 se ve vacío para mayor comodidad estética
                  onChange={(e) => updateSize(i, "price", e.target.value)} // Pasamos el string crudo
                />
                <Input
                  placeholder="Cantidad"
                  type="number"
                  min="0"
                  value={s.qty === 0 ? "" : s.qty} // Si es 0 se ve vacío
                  onChange={(e) => updateSize(i, "qty", e.target.value)} // Pasamos el string crudo
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSize(i)}
                  disabled={sizes.length === 1}
                  aria-label="Eliminar talla"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button onClick={handleSubmit} disabled={ isSubmitting } className="w-full sm:w-auto">
          Crear producto
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}