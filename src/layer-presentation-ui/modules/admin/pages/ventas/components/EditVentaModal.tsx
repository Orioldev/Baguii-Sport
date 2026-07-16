import { useState, useEffect } from "react";
import type { Product } from "@/logic-bussines-layer/domain/models/product.model";
import type {  } from "../VentasPage";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Check, ChevronsUpDown, DollarSign, Package, Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { paymentMethodOptions } from "../../../mock/products.mock.data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import type { Sale, SaleItem } from "@/logic-bussines-layer/domain/models/sale.model";
import type { PaymentMethod } from "../../compras/ComprasPage";

type SaleRow = { size: string; qty: string };

export const EditVentaModal = ({
  products,
  sale,
  onUpdate,
}: {
  products: Product[];
  sale: Sale;
  onUpdate: (s: Sale) => void;
}) => {
  const toDateInputValue = (d: Date) => {
    const off = d.getTimezoneOffset();
    const local = new Date(d.getTime() - off * 60 * 1000);
    return local.toISOString().slice(0, 10);
  };

  // --- ESTADOS LOCALES ---
  const [productId, setProductId] = useState<string>("");
  const [openCombobox, setOpenCombobox] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");
  const [dateStr, setDateStr] = useState<string>(toDateInputValue(new Date()));
  const [description, setDescription] = useState<string>("");
  const [rows, setRows] = useState<SaleRow[]>([{ size: "", qty: "1" }]);

  // --- EFECTO DE PRECARGA AL EDITAR ---
  useEffect(() => {
    if (sale) {
      setProductId(sale.productId as string);
      setPaymentMethod(sale.paymentMethod);
      setDateStr(toDateInputValue(sale.date));
      setDescription(sale.description);
      setRows(
        sale.items.map((item) => ({
          size: item.size,
          qty: item.qty.toString(),
        }))
      );
    }
  }, [sale]);

  const selectedProduct = products.find((p) => p.id === productId);

  const getPriceForSize = (sizeStr: string): number => {
    if (!selectedProduct) return 0;
    const sizeConfig = selectedProduct.sizes.find((s) => s.size === sizeStr);
    return sizeConfig ? sizeConfig.price : 0;
  };

  const addRow = () => {
    setRows((prev) => [...prev, { size: "", qty: "1" }]);
  };

  const removeRow = (index: number) => {
    if (rows.length === 1) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: keyof SaleRow, value: string) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const total = rows.reduce((acc, row) => {
    const p = getPriceForSize(row.size);
    const q = parseInt(row.qty, 10) || 0;
    return acc + p * q;
  }, 0);

  const handleSubmit = () => {
    if (!selectedProduct) return alert("Por favor seleccione un calzado");

    const validItems: SaleItem[] = [];
    for (const row of rows) {
      if (!row.size) return alert("Hay filas sin talla seleccionada");
      const q = parseInt(row.qty, 10);
      if (isNaN(q) || q <= 0) return alert("La cantidad debe ser mayor a 0");

      validItems.push({
        size: row.size,
        price: getPriceForSize(row.size),
        qty: q,
      });
    }

    if (validItems.length === 0) return alert("Debe agregar al menos un ítem");

    const updatedSale: Sale = {
      id: sale.id,
      productId: selectedProduct.id as string,
      productTitle: selectedProduct.title,
      productImage: selectedProduct.image || "",
      paymentMethod,
      date: new Date(dateStr + "T12:00:00"),
      items: validItems,
      description,
      totalUsd: total,
      rate: sale.rate, // Preservamos la tasa histórica original de la venta
    };

    onUpdate(updatedSale);
  };

  return (
    <DialogContent className="w-[95vw] max-w-xl p-0 rounded-lg overflow-hidden flex flex-col max-h-[90dvh]">
      {/* HEADER FIJO — nunca se oculta */}
      <DialogHeader className="px-4 pt-4 sm:px-6 sm:pt-6 shrink-0">
        <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
          Editar venta registrada
        </DialogTitle>
      </DialogHeader>

      {/* ÁREA SCROLLABLE — crece hasta llenar el espacio disponible */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 scrollbar-thin">

      {/* BANNER INFORMATIVO SUPERIOR CON MINIATURA */}
      {selectedProduct && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-2.5 mt-1 animate-in fade-in duration-200">
          {selectedProduct.image ? (
            <img
              src={selectedProduct.image}
              alt={selectedProduct.title}
              className="h-11 w-11 rounded-md border bg-white object-cover shrink-0"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-md border bg-muted text-muted-foreground shrink-0">
              <Package className="h-5 w-5" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider block">
              Producto en Edición
            </span>
            <span className="text-xs sm:text-sm font-semibold text-foreground truncate block">
              {selectedProduct.title}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-3.5 py-1 text-left">
        {/* Calzado: ancho completo en móvil y desktop */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 flex flex-col sm:col-span-2">
            <Label className="text-xs sm:text-sm">Calzado</Label>
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              {/* FIX: asChild para que el trigger sea semánticamente correcto */}
              <PopoverTrigger>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox}
                  className="w-full justify-between font-normal text-left text-xs sm:text-sm h-9 sm:h-10"
                >
                  <span className="truncate">
                    {selectedProduct ? selectedProduct.title : "Buscar calzado..."}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              {/* FIX: ancho dinámico con variable CSS de Radix en lugar de clases fijas inválidas */}
              <PopoverContent
                className="p-0"
                align="start"
                style={{ width: "var(--radix-popover-trigger-width)" }}
              >
                <Command>
                  <CommandInput placeholder="Escribe el modelo..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>No se encontró el calzado.</CommandEmpty>
                    <CommandGroup>
                      {products.map((p) => (
                        <CommandItem
                          key={p.id}
                          value={p.title}
                          onSelect={() => {
                            setProductId(p.id);
                            setRows([{ size: "", qty: "1" }]);
                            setOpenCombobox(false);
                          }}
                          className="flex items-center gap-2 justify-between cursor-pointer p-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {p.image ? (
                              <img
                                src={p.image}
                                alt={p.title}
                                className="h-6 w-6 rounded border bg-white object-cover shrink-0"
                              />
                            ) : (
                              <Package className="h-4 w-4 shrink-0 text-muted-foreground" />
                            )}
                            <span className="truncate text-xs">{p.title}</span>
                          </div>
                          <Check
                            className={cn(
                              "h-3.5 w-3.5 shrink-0",
                              productId === p.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Método de pago + Fecha: siempre en 2 columnas (móvil y desktop) */}
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm">Método de pago</Label>
            <Select
              value={paymentMethod}
              onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}
            >
              <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                <SelectValue placeholder="Seleccione método" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethodOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value} className="text-xs sm:text-sm">
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fecha: al lado del método de pago en móvil y desktop */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-date" className="text-xs sm:text-sm">Fecha de venta</Label>
            <Input
              id="edit-date"
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="h-9 sm:h-10 text-xs sm:text-sm"
            />
          </div>
        </div>

        {/* CONTENEDOR DE TALLAS Y CANTIDADES */}
        <div className="rounded-md border p-3 sm:p-4 space-y-2.5 bg-background">
          <div className="flex items-center justify-between border-b pb-1.5">
            <span className="text-xs sm:text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
              <Package className="h-4 w-4" />
              Tallas y cantidades
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRow}
              disabled={!productId}
              className="gap-1 h-7 text-xs px-2.5"
            >
              <Plus className="h-3 w-3" />
              Agregar
            </Button>
          </div>

          {/* FIX: max-h con valor Tailwind válido (max-h-40 = 160px) */}
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {rows.map((row, i) => {
              const uPrice = getPriceForSize(row.size);
              const rowSubtotal = uPrice * (parseInt(row.qty, 10) || 0);

              return (
                /* FIX: grid 12 cols con proporciones ajustadas para pantallas angostas */
                <div key={i} className="grid grid-cols-12 gap-1 items-center border-b sm:border-0 pb-2 sm:pb-0">
                  {/* Selector de Talla */}
                  <div className="col-span-5">
                    <Select
                      value={row.size}
                      onValueChange={(val) => updateRow(i, "size", val || "")}
                      disabled={!productId}
                    >
                      <SelectTrigger className="h-8 text-xs px-2">
                        <SelectValue placeholder="Talla" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedProduct?.sizes.map((s) => (
                          <SelectItem
                            key={s.size}
                            value={s.size}
                            disabled={s.qty <= 0}
                            className="text-xs"
                          >
                            T{s.size} ({s.qty} d.)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cantidad */}
                  <div className="col-span-3">
                    <Input
                      type="number"
                      min="1"
                      placeholder="Cant"
                      value={row.qty}
                      onChange={(e) => updateRow(i, "qty", e.target.value)}
                      disabled={!row.size}
                      className="h-8 text-xs px-2"
                    />
                  </div>

                  {/* Subtotal: truncado para no desbordar */}
                  <div
                    className={cn(
                      "col-span-3 text-right text-xs font-medium truncate pr-1",
                      !row.size && "text-muted-foreground/40"
                    )}
                  >
                    ${rowSubtotal.toFixed(2)}
                  </div>

                  {/* Botón Eliminar */}
                  <div className="col-span-1 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRow(i)}
                      disabled={rows.length === 1}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      aria-label="Eliminar fila"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Descripción breve */}
        <div className="space-y-1.5">
          <Label htmlFor="edit-description" className="text-xs sm:text-sm">Descripción breve</Label>
          <Textarea
            id="edit-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="text-xs sm:text-sm p-2 resize-none"
            placeholder="Notas u observaciones de la venta..."
          />
        </div>

        {/* Cuadro del Total */}
        <div className="flex items-center justify-between rounded-md border bg-muted/40 p-2.5 sm:p-3">
          <span className="flex items-center gap-1.5 text-xs sm:text-sm font-medium">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            Total de la venta
          </span>
          <span className="text-base sm:text-lg font-bold text-foreground">${total.toFixed(2)}</span>
        </div>
      </div>

      </div>{/* fin área scrollable */}

      {/* FOOTER FIJO — siempre visible */}
      <DialogFooter className="px-4 pb-4 sm:px-6 sm:pb-6 pt-2 shrink-0 border-t">
        <Button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white hover:bg-blue-700 text-xs sm:text-sm h-9 sm:h-10"
        >
          Actualizar venta
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};