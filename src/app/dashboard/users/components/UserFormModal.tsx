// app/dashboard/users/components/UserFormModal.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { X } from 'lucide-react';

interface User {
  _id: string;
  username: string;
  role: 'ADMIN' | 'VIEWER';
  active: boolean;
  createdAt: string;
}

interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: User | null;
  onSuccess: () => void;
}

export function UserFormModal({ open, onOpenChange, editingUser, onSuccess }: UserFormModalProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formDataObj = new FormData(form);
    
    const data = {
      username: formDataObj.get('username') as string,
      password: formDataObj.get('password') as string,
      role: formDataObj.get('role') as 'ADMIN' | 'VIEWER',
      active: formDataObj.get('active') === 'true',
    };

    try {
      if (editingUser) {
        const updateData: any = {
          id: editingUser._id,
          role: data.role,
          active: data.active,
        };
        
        if (data.username !== editingUser.username) {
          updateData.username = data.username;
        }
        
        if (data.password) {
          updateData.password = data.password;
        }
        
        const res = await fetch('/api/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });
        
        if (res.ok) {
          toast.success('Usuario actualizado correctamente');
          onSuccess();
          onOpenChange(false);
        } else {
          const error = await res.json();
          toast.error(error.error || 'Error al actualizar');
        }
      } else {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        
        if (res.ok) {
          toast.success('Usuario creado correctamente');
          onSuccess();
          onOpenChange(false);
        } else {
          const error = await res.json();
          toast.error(error.error || 'Error al crear usuario');
        }
      }
    } catch (error) {
      toast.error('Ocurrió un error');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay / Fondo oscuro */}
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl">
          {/* Header con botón cerrar */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">
              {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              {/* Campo de usuario */}
              <div>
                <Label htmlFor="username" className="block mb-2">
                  Nombre de Usuario
                </Label>
                <Input
                  id="username"
                  name="username"
                  defaultValue={editingUser?.username || ''}
                  required
                />
              </div>
              
              {/* Campo de contraseña */}
              <div>
                <Label htmlFor="password" className="block mb-2">
                  Contraseña {editingUser && '(Dejar en blanco para mantener actual)'}
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required={!editingUser}
                />
              </div>
              
              {/* Select nativo de HTML en lugar de shadcn */}
              <div>
                <Label htmlFor="role" className="block mb-2">
                  Rol
                </Label>
                <select
                  id="role"
                  name="role"
                  defaultValue={editingUser?.role || 'VIEWER'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ADMIN">Administrador</option>
                  <option value="VIEWER">Visualizador</option>
                </select>
              </div>
              
              {/* Switch de estado activo */}
              <div className="flex items-center justify-between pt-2">
                <Label htmlFor="active">Usuario Activo</Label>
                <Switch
                  id="active"
                  name="active"
                  defaultChecked={editingUser?.active !== undefined ? editingUser.active : true}
                />
              </div>
            </div>

            {/* Footer con botones */}
            <div className="flex justify-end space-x-2 p-6 border-t bg-gray-50 rounded-b-lg">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingUser ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}