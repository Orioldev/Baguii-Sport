import { TableCell, TableRow } from "@/components/ui/table";
import { formatDate, type ClientItemProps } from "../ClientesPage";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";



export const ClientItemTable = ({ client, onEdit, onDelete }: ClientItemProps) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{client.name}</TableCell>
      <TableCell className="text-muted-foreground">{client.phone}</TableCell>
      <TableCell className="text-muted-foreground">
        {formatDate(client.createdAt)}
      </TableCell>
      <TableCell className="text-muted-foreground">{client.company}</TableCell>
      <TableCell>
        <div className="flex justify-end gap-2">
          <Button
            variant="default"
            size="sm"
            className="gap-1.5"
            onClick={() => onEdit?.(client)}
          >
            <Edit className="h-3.5 w-3.5" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 bg-red-600 text-white hover:bg-red-700 hover:text-white"
            onClick={() => onDelete?.(client)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}