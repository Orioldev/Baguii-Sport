import { useState } from "react";
import type { Debt } from "../CobranzasPage";
import { formatMoney } from "../CobranzasPage";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HandCoins } from "lucide-react";

export const AbonarDeudaModal = ({
  debt,
  onAbonar,
}: {
  debt: Debt;
  // 🟢 La UI solo captura el monto; el cálculo de paid/lastPaymentAt vive en abonar-deuda.use-case.ts
  onAbonar: (debt: Debt, amount: number) => void | Promise<void>;
}) => {
  const [amount, setAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const remaining = Math.max(debt.total - debt.paid, 0);
  const amountNum = parseFloat(amount) || 0;

  const isValid = amountNum > 0 && amountNum <= remaining;

  const handleSubmit = async () => {
    if (!isValid) return;
    try {
      setIsSubmitting(true);
      await onAbonar(debt, amountNum);
      setAmount("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Registrar abono</DialogTitle>
        <DialogDescription>
          Deuda de <strong className="text-foreground">{debt.clientName}</strong> — saldo pendiente:{" "}
          <strong className="text-foreground">${formatMoney(remaining)}</strong>
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-2 py-2">
        <Label htmlFor="abono-amount">Cantidad abonada ($)</Label>
        <Input
          id="abono-amount"
          type="number"
          min="0"
          max={remaining}
          step="0.01"
          autoFocus
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        {amountNum > remaining && (
          <p className="text-sm text-destructive">
            El abono no puede ser mayor al saldo pendiente (${formatMoney(remaining)}).
          </p>
        )}
      </div>

      <DialogFooter>
        <Button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className="w-full sm:w-auto"
        >
          <HandCoins className="mr-2 h-4 w-4" />
          {isSubmitting ? "Guardando..." : "Confirmar abono"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};