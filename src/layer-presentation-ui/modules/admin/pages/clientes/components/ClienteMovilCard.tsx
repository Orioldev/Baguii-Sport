import { Card, CardContent } from "@/components/ui/card";
import { formatDate, type ClientItemProps } from "../ClientesPage";
import { CalendarIcon, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";



export const  ClienteMovilCard = ({ client, onEdit, onDelete }: ClientItemProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex flex-col gap-3 p-4">
        <div>
          <h3 className="font-semibold">{client.name}</h3>
          <p className="text-sm text-muted-foreground">{client.company}</p>
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Teléfono</span>
            <span>{client.phone}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Creado</span>
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5" />
              {formatDate(client.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex gap-2 border-t pt-3">
          <Button
            variant="default"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={() => onEdit?.(client)}
          >
            <Edit className="h-3.5 w-3.5" />
            Editar
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex-1 gap-1.5 bg-red-600 text-white hover:bg-red-700 hover:text-white"
            onClick={() => onDelete?.(client)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}