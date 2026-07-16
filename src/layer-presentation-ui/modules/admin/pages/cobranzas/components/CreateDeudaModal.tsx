import { useMemo, useState } from "react";
import { toDateInputValue, type Client } from "../../clientes/ClientesPage";
import type { Debt } from "../CobranzasPage";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const getOneMonthAheadValue = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return toDateInputValue(d);
};

export const CreateDeudaModal = ({
  clients,
  onCreate,
}: {
  clients: Client[];
  // 🟢 Ya no se genera el id aquí: lo asigna Firestore al crear el documento.
  onCreate: (d: Omit<Debt, "id">) => void | Promise<void>;
}) => {
  const [clientId, setClientId] = useState<string>("");
  const [date, setDate] = useState<string>(toDateInputValue(new Date()));
  const [dueDate, setDueDate] = useState<string>(getOneMonthAheadValue());
  const [total, setTotal] = useState<string>("");
  const [paid, setPaid] = useState<string>("0");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selected = useMemo(
    () => clients.find((c) => c.id === clientId) ?? null,
    [clients, clientId],
  );

  const reset = () => {
    setClientId("");
    setDate(toDateInputValue(new Date()));
    setDueDate(getOneMonthAheadValue());
    setTotal("");
    setPaid("0");
  };

  const totalNum = parseFloat(total) || 0;
  const paidNum = parseFloat(paid) || 0;

  const isValid =
    clientId &&
    date &&
    dueDate &&
    totalNum > 0 &&
    paidNum >= 0 &&
    paidNum <= totalNum;

  const handleSubmit = async () => {
    if (!isValid || !selected) return;

    // Si se declara un abono inicial > 0, su fecha es la misma fecha de registro de la deuda.
    const debt: Omit<Debt, "id"> = {
      clientId: selected.id,
      clientName: selected.name,
      clientPhone: selected.phone,
      clientCompany: selected.company,
      createdAt: new Date(date + "T00:00:00"),
      dueDate: new Date(dueDate + "T00:00:00"),
      total: totalNum,
      paid: paidNum,
      lastPaymentAt: paidNum > 0 ? new Date(date + "T00:00:00") : null,
    };

    try {
      setIsSubmitting(true);
      await onCreate(debt);
      reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Registrar nueva deuda</DialogTitle>
      </DialogHeader>

      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <Label>Seleccionar cliente</Label>
          <Select value={clientId} onValueChange={(v) => setClientId(v ?? "")}>
            <SelectTrigger>
              {/* 🟢 FIX: no dejamos que Radix capture el texto automáticamente del SelectItem
                  (eso falla con listas asíncronas de Firestore y termina mostrando el id crudo
                  del documento en vez del nombre). Controlamos el texto mostrado nosotros mismos. */}
              <SelectValue placeholder="Busca o selecciona un cliente">
                {selected
                  ? `${selected.name}${selected.company ? ` (${selected.company})` : ""}`
                  : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} {c.company ? `(${c.company})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selected && (
          <div className="rounded-md border bg-muted/40 p-3 text-sm animate-in fade-in-50 duration-200">
            <div className="grid gap-1.5 sm:grid-cols-2">
              <div>
                <span className="text-muted-foreground">Nombre: </span>
                <span className="font-medium">{selected.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Teléfono: </span>
                <span className="font-medium">{selected.phone || "—"}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-muted-foreground">Cargo / Empresa: </span>
                <span className="font-medium">{selected.company || "—"}</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="date">Fecha de registro</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-amber-600 dark:text-amber-400 font-medium">
              Fecha límite de pago
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="total">Total de la deuda ($)</Label>
            <Input
              id="total"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paid">Abono inicial ($)</Label>
            <Input
              id="paid"
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
          disabled={!isValid || isSubmitting}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          {isSubmitting ? "Registrando..." : "Registrar deuda"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};