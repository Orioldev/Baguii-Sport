import { useEffect, useState } from "react";
import { toDateInputValue, type Client } from "../ClientesPage";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface EditClienteModalProps {
  client: Client;
  onUpdate: (updatedClient: Client) => void;
}

export const EditClienteModal = ({ client, onUpdate }: EditClienteModalProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState<string>("");
  const [company, setCompany] = useState("");

  // Al abrir o cambiar de cliente, precargamos su información
  useEffect(() => {
    if (client) {
      setName(client.name);
      setPhone(client.phone);
      setDate(toDateInputValue(client.createdAt));
      setCompany(client.company);
    }
  }, [client]);

  const isValid = name.trim().length > 0;

  const handleSubmit = () => {
    if (!isValid) return;
    
    const updated: Client = {
      ...client,
      name: name.trim(),
      phone: phone.trim(),
      createdAt: new Date(date + "T00:00:00"),
      company: company.trim(),
    };
    
    onUpdate(updated);
  };

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Editar cliente</DialogTitle>
      </DialogHeader>

      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <Label htmlFor="edit-name">Nombre del cliente</Label>
          <Input
            id="edit-name"
            placeholder="Ej. María Rodríguez"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="edit-phone">Teléfono</Label>
            <Input
              id="edit-phone"
              type="tel"
              placeholder="+58 414-1234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-date">Fecha de creación</Label>
            <Input
              id="edit-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-company">Cargo / Empresa</Label>
          <Input
            id="edit-company"
            placeholder="Ej. Boutique Aurora"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
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