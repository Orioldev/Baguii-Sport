// src/.../compras/components/CreateComprasModal.tsx
import { useState } from "react";
import type { PaymentMethod, Purchase } from "../ComprasPage";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { paymentMethodOptions } from "../../../mock/products.mock.data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const toDateInputValue = (d: Date) => {
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60 * 1000);
  return local.toISOString().slice(0, 10);
};

// 🟢 Añadimos currentRate a las props
export const CreateComprasModal = ({ 
  onCreate, 
  currentRate,
  isSubmitting = false,
}: { 
  onCreate: (p: Purchase) => void; 
  currentRate: number; 
  isSubmitting?: boolean;
}) => {
  const [name, setName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");
  const [date, setDate] = useState<string>(toDateInputValue(new Date()));
  const [description, setDescription] = useState("");
  const [total, setTotal] = useState("");

  const reset = () => {
    setName("");
    setPaymentMethod("efectivo");
    setDate(toDateInputValue(new Date()));
    setDescription("");
    setTotal("");
  };

  const handleSubmit = () => {
    const totalUsd = parseFloat(total);
    if (!name.trim() || isNaN(totalUsd) || totalUsd <= 0) return;

    const purchase: Purchase = {
      id: `c-${Date.now()}`,
      name: name.trim(),
      paymentMethod,
      date: new Date(date + "T00:00:00"),
      description: description.trim(),
      totalUsd,
      rate: currentRate, // 🟢 Guardamos la tasa actual de forma estática
    };
    onCreate(purchase);
    reset();
  };

  const isValid = name.trim().length > 0 && parseFloat(total) > 0;

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Crear compra</DialogTitle>
      </DialogHeader>

      {/* ... El resto de los inputs del formulario se quedan exactamente IGUAL ... */}
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre de la compra</Label>
          <Input id="name" placeholder="Ej. Lote Nike Air Zoom" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Método de pago</Label>
            <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {paymentMethodOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="desc">Notas / Descripción</Label>
          <Textarea id="desc" placeholder="Detalles adicionales..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="total">Total (USD)</Label>
          <Input id="total" type="number" min="0" step="0.01" placeholder="0.00" value={total} onChange={(e) => setTotal(e.target.value)} />
        </div>
      </div>

      <DialogFooter>
        <Button onClick={handleSubmit} disabled={!isValid || isSubmitting} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {isSubmitting ? "Creando..." : "Crear compra"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};