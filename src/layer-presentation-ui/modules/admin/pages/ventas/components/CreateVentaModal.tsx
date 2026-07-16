import { useState } from "react";
import type { Product } from "@/logic-bussines-layer/domain/models/product.model";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Check, ChevronsUpDown, DollarSign, Package, Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { paymentMethodOptions } from "../../../mock/products.mock.data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useDollarRate } from "@/layer-presentation-ui/hooks/useDollarRate";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import type { Sale, SaleItem } from "@/logic-bussines-layer/domain/models/sale.model";
import type { PaymentMethod } from "../../compras/ComprasPage";

type SaleRow = { size: string; qty: string };

export const CreateVentaModal = ({
  products,
  onCreate,
}: {
  products: Product[];
  onCreate: (s: Sale) => void;
}) => {
  const toDateInputValue = (d: Date) => {
    const off = d.getTimezoneOffset();
    const local = new Date(d.getTime() - off * 60 * 1000);
    return local.toISOString().slice(0, 10);
  };

  const { rate } = useDollarRate();

  const [productId, setProductId] = useState<string>("");
  const [openCombobox, setOpenCombobox] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");
  const [dateStr, setDateStr] = useState<string>(toDateInputValue(new Date()));
  const [description, setDescription] = useState<string>("");
  const [rows, setRows] = useState<SaleRow[]>([{ size: "", qty: "1" }]);

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

    const newSale: Sale = {
      id: crypto.randomUUID(),
      productId: selectedProduct.id,
      productTitle: selectedProduct.title,
      productImage: selectedProduct.image || "",
      paymentMethod,
      date: new Date(dateStr + "T12:00:00"),
      items: validItems,
      description,
      totalUsd: total,
      rate: rate,
    };

    onCreate(newSale);

    // Resetear formulario
    setProductId("");
    setPaymentMethod("efectivo");
    setDateStr(toDateInputValue(new Date()));
    setDescription("");
    setRows([{ size: "", qty: "1" }]);
  };

  return (
    <DialogContent className="w-[95vw] max-w-xl p-0 rounded-lg overflow-hidden flex flex-col max-h-[90dvh] ">
      {/* HEADER FIJO — nunca se oculta */}
      <DialogHeader className="px-4 pt-4 sm:px-6 sm:pt-6 shrink-0">
        <DialogTitle className="flex items-center gap-2">
          Registrar nueva venta
        </DialogTitle>
      </DialogHeader>

      {/* ÁREA SCROLLABLE — crece hasta llenar el espacio disponible */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 scrollbar-thin">

      {/* BANNER SUPERIOR CON MINIATURA DINÁMICA DEL CALZADO SELECCIONADO */}
      {selectedProduct && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3 mt-1 animate-in fade-in duration-200">
          {selectedProduct.image ? (
            <img
              src={selectedProduct.image}
              alt={selectedProduct.title}
              className="h-12 w-12 rounded-md border bg-white object-cover shrink-0"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-muted text-muted-foreground shrink-0">
              <Package className="h-5 w-5" />
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Calzado Seleccionado
            </span>
            <span className="text-sm font-semibold text-foreground truncate">
              {selectedProduct.title}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-4 py-2">
        {/* Calzado: ancho completo en móvil, mitad en desktop */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 flex flex-col sm:col-span-2">
            <Label>Calzado</Label>
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox}
                  className="w-full justify-between font-normal text-left"
                >
                  <span className="truncate">
                    {selectedProduct ? selectedProduct.title : "Buscar calzado..."}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              {/* FIX: w-full para que no desborde en móvil */}
              <PopoverContent className="w-full p-0" align="start" style={{ width: "var(--radix-popover-trigger-width)" }}>
                <Command>
                  <CommandInput placeholder="Escribe el modelo..." />
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
                          className="flex items-center gap-2 justify-between cursor-pointer"
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
          <div className="space-y-2">
            <Label>Método de pago</Label>
            <Select
              value={paymentMethod}
              onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione método" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethodOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fecha de venta: al lado del método de pago en móvil y desktop */}
          <div className="space-y-2">
            <Label htmlFor="date">Fecha de venta</Label>
            <Input
              id="date"
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
            />
          </div>
        </div>

        {/* Tallas y cantidades */}
        <div className="rounded-md border p-3 sm:p-4 space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <Package className="h-4 w-4" />
              Tallas y cantidades
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRow}
              disabled={!productId}
              className="gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Agregar fila
            </Button>
          </div>

          {/* FIX: max-h corregido con valor Tailwind válido, overflow contenido */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {rows.map((row, i) => {
              const uPrice = getPriceForSize(row.size);
              const rowSubtotal = uPrice * (parseInt(row.qty, 10) || 0);

              return (
                /* FIX: grid de 12 cols para control preciso en cualquier ancho */
                <div key={i} className="grid grid-cols-12 gap-1 items-center">
                  {/* Talla: ocupa más espacio */}
                  <div className="col-span-5">
                    <Select
                      value={row.size}
                      onValueChange={(val) => updateRow(i, "size", val || "")}
                      disabled={!productId}
                    >
                      <SelectTrigger className="h-9 text-xs px-2">
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
                      className="h-9 text-xs px-2"
                    />
                  </div>

                  {/* Subtotal: texto truncado para no desbordar */}
                  <div
                    className={cn(
                      "col-span-3 text-right text-xs font-medium truncate pr-1",
                      !row.size && "text-muted-foreground/50"
                    )}
                  >
                    ${rowSubtotal.toFixed(2)}
                  </div>

                  {/* Botón eliminar */}
                  <div className="col-span-1 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRow(i)}
                      disabled={rows.length === 1}
                      className="h-8 w-8"
                      aria-label="Eliminar fila"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Descripción breve */}
        <div className="space-y-2">
          <Label htmlFor="description">Descripción breve</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Notas u observaciones de la venta..."
          />
        </div>

        {/* Total */}
        <div className="flex items-center justify-between rounded-md border bg-muted/40 p-3">
          <span className="flex items-center gap-2 text-sm font-medium">
            <DollarSign className="h-4 w-4" />
            Total de la venta
          </span>
          <span className="text-lg font-semibold">${total.toFixed(2)}</span>
        </div>
      </div>

      </div>{/* fin área scrollable */}

      {/* FOOTER FIJO — siempre visible */}
      <DialogFooter className="px-4 pb-4 sm:px-6 sm:pb-6 pt-2 shrink-0 border-t">
        <Button onClick={handleSubmit} className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700">
          Crear venta
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};