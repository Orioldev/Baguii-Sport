import { useState } from "react";
import { toDateInputValue, type Client } from "../ClientesPage";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";



export const  CreateClienteModal = ({ 
  onCreate,
  isSubmitting = false,
}: { 
  onCreate: (c: Client) => void;
  isSubmitting?: boolean;
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState<string>(toDateInputValue(new Date()));
  const [company, setCompany] = useState("");

  const reset = () => {
    setName("");
    setPhone("");
    setDate(toDateInputValue(new Date()));
    setCompany("");
  };

  const isValid = name.trim().length > 0;

  const handleSubmit = () => {
    if (!isValid) return;
    const client: Client = {
      id: `cl-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      createdAt: new Date(date + "T00:00:00"),
      company: company.trim(),
    };
    onCreate(client);
    reset();
  };

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Crear cliente</DialogTitle>
      </DialogHeader>

      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del cliente</Label>
          <Input
            id="name"
            placeholder="Ej. María Rodríguez"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+58 414-1234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Fecha de creación</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Cargo / Empresa</Label>
          <Input
            id="company"
            placeholder="Ej. Boutique Aurora"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          {isSubmitting ? "Creando..." : "Crear cliente"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}