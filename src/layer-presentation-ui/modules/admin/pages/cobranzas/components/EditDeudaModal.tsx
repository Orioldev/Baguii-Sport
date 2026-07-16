import { useState, useEffect } from "react";
import { toDateInputValue } from "../../clientes/ClientesPage";
import type { Debt } from "../CobranzasPage";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

export const EditDeudaModal = ({
  debt,
  onUpdate,
}: {
  debt: Debt;
  onUpdate: (d: Debt) => void;
}) => {
  const [date, setDate] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [total, setTotal] = useState<string>("");
  const [paid, setPaid] = useState<string>("");

  // Sincronizar el estado interno cuando cambie la deuda seleccionada
  useEffect(() => {
    if (debt) {
      setDate(toDateInputValue(debt.createdAt));
      setDueDate(debt.dueDate ? toDateInputValue(debt.dueDate) : "");
      setTotal(debt.total.toString());
      setPaid(debt.paid.toString());
    }
  }, [debt]);

  const totalNum = parseFloat(total) || 0;
  const paidNum = parseFloat(paid) || 0;

  const isValid =
    date &&
    dueDate &&
    totalNum > 0 &&
    paidNum >= 0 &&
    paidNum <= totalNum;

  const handleSubmit = () => {
    if (!isValid) return;

    // Si el abono aumentó con respecto al original, registramos la fecha del nuevo abono
    const seAbonoMas = paidNum > debt.paid;

    const updatedDebt: Debt = {
      ...debt,
      createdAt: new Date(date + "T00:00:00"),
      dueDate: new Date(dueDate + "T00:00:00"),
      total: totalNum,
      paid: paidNum,
      lastPaymentAt: seAbonoMas ? new Date() : debt.lastPaymentAt,
    };

    onUpdate(updatedDebt);
  };

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Editar Deuda de {debt.clientName}</DialogTitle>
      </DialogHeader>

      <div className="space-y-4 py-2">
        <div className="rounded-md border bg-muted/40 p-3 text-sm">
          <p className="text-muted-foreground">
            Empresa/Cargo: <span className="font-medium text-foreground">{debt.clientCompany || "—"}</span>
          </p>
          <p className="text-muted-foreground mt-1">
            Teléfono: <span className="font-medium text-foreground">{debt.clientPhone || "—"}</span>
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="edit-date">Fecha de registro</Label>
            <Input
              id="edit-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-dueDate" className="text-amber-600 dark:text-amber-400 font-medium">
              Fecha límite de pago
            </Label>
            <Input
              id="edit-dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="edit-total">Total de la deuda ($)</Label>
            <Input
              id="edit-total"
              type="number"
              min="0"
              step="0.01"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-paid">Monto Abonado ($)</Label>
            <Input
              id="edit-paid"
              type="number"
              min="0"
              step="0.01"
              value={paid}
              onChange={(e) => setPaid(e.target.value)}
            />
          </div>
        </div>

        {totalNum > 0 && paidNum > totalNum && (
          <p className="text-sm text-destructive">
            El abono no puede ser mayor que el total.
          </p>
        )}
      </div>

      <DialogFooter>
        <Button
          onClick={handleSubmit}
          disabled={!isValid}
          className="w-full sm:w-auto"
        >
          <Save className="mr-2 h-4 w-4" />
          Guardar cambios
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};