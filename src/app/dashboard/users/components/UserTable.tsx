// app/dashboard/users/components/UserTable.tsx
'use client';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  _id: string;
  username: string;
  role: 'ADMIN' | 'VIEWER';
  active: boolean;
  createdAt: string;
}

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: () => void;
}

export function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
        
        if (res.ok) {
          toast.success('Usuario eliminado correctamente');
          onDelete();
        } else {
          toast.error('No se pudo eliminar el usuario');
        }
      } catch (error) {
        toast.error('Ocurrió un error');
      }
    }
  };

  if (users.length === 0) {
    return (
      <div className="border rounded-lg">
        <div className="text-center py-8 text-muted-foreground">
          No hay usuarios registrados
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha Creación</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell className="font-medium">{user.username}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  user.role === 'ADMIN' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {user.role === 'ADMIN' ? 'Administrador' : 'Visualizador'}
                </span>
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  user.active 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {user.active ? 'Activo' : 'Inactivo'}
                </span>
              </TableCell>
              <TableCell>
                {new Date(user.createdAt).toLocaleDateString('es-MX')}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(user)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(user._id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}