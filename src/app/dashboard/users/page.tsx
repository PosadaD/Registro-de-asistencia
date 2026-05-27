// app/dashboard/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { UserFormModal } from './components/UserFormModal';
import { UserTable } from './components/UserTable';
import { toast } from 'sonner';

interface User {
  _id: string;
  username: string;
  role: 'ADMIN' | 'VIEWER';
  active: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      toast.error('No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleSuccess = () => {
    fetchUsers();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-muted-foreground">Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Usuarios</h1>
          <p className="text-muted-foreground">Administración de accesos al sistema</p>
        </div>
        
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Tabla de usuarios */}
      <UserTable 
        users={users} 
        onEdit={handleEdit} 
        onDelete={fetchUsers} 
      />

      {/* Modal de formulario */}
      <UserFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        editingUser={editingUser}
        onSuccess={handleSuccess}
      />
    </div>
  );
}