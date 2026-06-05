// app/dashboard/users/components/UserFormModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  // Estado controlado del formulario
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'VIEWER' as 'ADMIN' | 'VIEWER',
    active: true,
  });
  const [loading, setLoading] = useState(false);

  // Cargar datos del usuario cuando se abre el modal en modo edición
  useEffect(() => {
    if (open && editingUser) {
      console.log('Cargando usuario para editar:', editingUser); // Debug
      setFormData({
        username: editingUser.username,
        password: '',
        role: editingUser.role,
        active: editingUser.active,
      });
    } else if (open && !editingUser) {
      // Resetear formulario para nuevo usuario
      setFormData({
        username: '',
        password: '',
        role: 'VIEWER',
        active: true,
      });
    }
  }, [open, editingUser]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingUser) {
        // Actualizar usuario existente
        const updateData: any = {
          id: editingUser._id,
          role: formData.role,
          active: formData.active,
        };
        
        if (formData.username !== editingUser.username) {
          updateData.username = formData.username;
        }
        
        if (formData.password && formData.password.trim() !== '') {
          updateData.password = formData.password;
        }
        
        console.log('Enviando actualización:', updateData); // Debug
        
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
        // Crear nuevo usuario
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
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
      console.error('Error:', error);
      toast.error('Ocurrió un error');
    } finally {
      setLoading(false);
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
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  className="w-full"
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  className="w-full"
                />
              </div>
              
              {/* Select de rol */}
              <div>
                <Label htmlFor="role" className="block mb-2">
                  Rol
                </Label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'VIEWER' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="ADMIN">Administrador</option>
                  <option value="VIEWER">Visualizador</option>
                </select>
              </div>
              
              {/* Select de estado activo (reemplaza el Switch) */}
              <div>
                <Label htmlFor="active" className="block mb-2">
                  Estado del Usuario
                </Label>
                <select
                  id="active"
                  name="active"
                  value={formData.active ? "true" : "false"}
                  onChange={(e) => setFormData({ ...formData, active: e.target.value === "true" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.active 
                    ? '✅ El usuario puede iniciar sesión' 
                    : '❌ El usuario no podrá acceder al sistema'}
                </p>
              </div>
            </div>

            {/* Footer con botones */}
            <div className="flex justify-end space-x-2 p-6 border-t bg-gray-50 rounded-b-lg">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : (editingUser ? 'Actualizar' : 'Crear')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}