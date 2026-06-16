// app/dashboard/justifications/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { JustificationModal } from './components/JustificationModal';
import { JustificationTable } from './components/JustificationTable';
import { JustificationFormModal } from './components/JustificationForm';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Justification {
  _id: string;
  employeeId: {
    _id: string;
    name: string;
    rfc: string;
    educationalInstitution: string; 
  };
  date: string;
  type: 'SCHOOL' | 'HEALTH' | 'OTHER';
  justifiesFullDay: boolean;
  justifiesHours: boolean;
  startTime?: string;
  endTime?: string;
  reason: string;
  fileUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export default function JustificationsPage() {
  const [justifications, setJustifications] = useState<Justification[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJustification, setEditingJustification] = useState<Justification | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Verificar si el usuario es admin
  useEffect(() => {
    const checkAdmin = async () => {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setIsAdmin(data.user?.role === 'ADMIN');
    };
    checkAdmin();
  }, []);

  const loadJustifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/justifications');
      const data = await res.json();
      setJustifications(data);
    } catch (error) {
      console.error('Error cargando justificaciones:', error);
      toast.error('Error al cargar justificaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJustifications();
  }, []);

  const handleEdit = (justification: Justification) => {
    setEditingJustification(justification);
    setShowEditModal(true);
  };

  const handleSuccess = () => {
    loadJustifications();
    setModalOpen(false);
    setShowEditModal(false);
    setEditingJustification(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Justificaciones</h1>
          <p className="text-muted-foreground">Gestión de justificaciones de inasistencia</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Justificación
        </Button>
      </div>

      {/* Tabla de justificaciones */}
      <JustificationTable
        justifications={justifications}
        onEdit={handleEdit}
        onDelete={loadJustifications}
        isAdmin={isAdmin}
      />

      {/* Modal para crear nueva justificación */}
      <JustificationFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={handleSuccess}
      />

      {/* Modal para editar justificación */}
      <JustificationFormModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onSuccess={handleSuccess}
        editingJustification={editingJustification}
      />
    </div>
  );
}