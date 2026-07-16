// src/.../compras/components/EditComprasModal.tsx
import { useState, useEffect } from "react";
import type { PaymentMethod, Purchase } from "../ComprasPage";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import { paymentMethodOptions } from "../../../mock/products.mock.data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const toDateInputValue = (d: Date) => {
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60 * 1000);
  return local.toISOString().slice(0, 10);
};

export const EditComprasModal = ({ 
  purchase, 
  onUpdate 
}: { 
  purchase: Purchase; 
  onUpdate: (p: Purchase) => void; 
}) => {
  const [name, setName] = useState(purchase.name);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(purchase.paymentMethod);
  const [date, setDate] = useState<string>(toDateInputValue(purchase.date));
  const [description, setDescription] = useState(purchase.description);
  const [total, setTotal] = useState(purchase.totalUsd.toString());

  // Efecto por si cambia la compra seleccionada en la UI
  useEffect(() => {
    setName(purchase.name);
    setPaymentMethod(purchase.paymentMethod);
    setDate(toDateInputValue(purchase.date));
    setDescription(purchase.description);
    setTotal(purchase.totalUsd.toString());
  }, [purchase]);

  const handleSubmit = () => {
    const totalUsd = parseFloat(total);
    if (!name.trim() || isNaN(totalUsd) || totalUsd <= 0) return;

    const updatedPurchase: Purchase = {
      ...purchase, // 🟢 Preservamos el ID y la TASA CONGELADA original
      name: name.trim(),
      paymentMethod,
      date: new Date(date + "T00:00:00"),
      description: description.trim(),
      totalUsd,
    };
    onUpdate(updatedPurchase);
  };

  const isValid = name.trim().length > 0 && parseFloat(total) > 0;

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Editar compra</DialogTitle>
      </DialogHeader>

      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <Label htmlFor="edit-name">Nombre de la compra</Label>
          <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
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
            <Label htmlFor="edit-date">Fecha</Label>
            <Input id="edit-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-desc">Notas / Descripción</Label>
          <Textarea id="edit-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-total">Total (USD)</Label>
          <Input id="edit-total" type="number" min="0" step="0.01" value={total} onChange={(e) => setTotal(e.target.value)} />
        </div>
      </div>

      <DialogFooter>
        <Button onClick={handleSubmit} disabled={!isValid} className="w-full sm:w-auto gap-2">
          <Save className="h-4 w-4" />
          Guardar cambios
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};