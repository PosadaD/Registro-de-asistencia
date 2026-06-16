'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
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

interface JustificationTableProps {
  justifications: Justification[];
  onEdit: (justification: Justification) => void;
  onDelete: () => void;
  onStatusChange?: (id: string, status: 'APPROVED' | 'REJECTED') => void;
  isAdmin?: boolean;
}

export function JustificationTable({ 
  justifications, 
  onEdit, 
  onDelete, 
  onStatusChange,
  isAdmin = false 
}: JustificationTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const getTypeBadge = (type: string) => {
    const types = {
      SCHOOL: { label: 'Escuela', className: 'bg-purple-100 text-purple-700' },
      HEALTH: { label: 'Salud', className: 'bg-green-100 text-green-700' },
      OTHER: { label: 'Otro', className: 'bg-gray-100 text-gray-700' },
    };
    const t = types[type as keyof typeof types] || types.OTHER;
    return <span className={`px-2 py-1 rounded-full text-xs ${t.className}`}>{t.label}</span>;
  };

  const getStatusBadge = (status: string) => {
    const statuses = {
      PENDING: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-700', icon: Clock },
      APPROVED: { label: 'Aprobada', className: 'bg-green-100 text-green-700', icon: CheckCircle },
      REJECTED: { label: 'Rechazada', className: 'bg-red-100 text-red-700', icon: XCircle },
    };
    const s = statuses[status as keyof typeof statuses] || statuses.PENDING;
    const Icon = s.icon;
    return (
      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${s.className}`}>
        <Icon className="h-3 w-3" />
        {s.label}
      </span>
    );
  };

  const handleStatusChange = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/justifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (res.ok) {
        toast.success(`Justificación ${status === 'APPROVED' ? 'aprobada' : 'rechazada'}`);
        onDelete(); // Recargar lista
      } else {
        toast.error('Error al actualizar estado');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta justificación?')) {
      try {
        const res = await fetch(`/api/justifications/${id}`, { method: 'DELETE' });
        if (res.ok) {
          toast.success('Justificación eliminada');
          onDelete();
        } else {
          toast.error('Error al eliminar');
        }
      } catch (error) {
        toast.error('Error de conexión');
      }
    }
  };

  if (justifications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
        <p className="text-lg">No hay justificaciones registradas</p>
        <p className="text-sm mt-1">Usa el botón "Nueva Justificación" para crear una</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Empleado</th>
              <th className="p-3 text-left">Fecha</th>
              <th className="p-3 text-left">Tipo</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-left">Justificación</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {justifications.map((j) => (
              <>
                <tr key={j._id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">
                    {j.employeeId?.name || 'N/A'}
                    <p className="text-xs text-gray-500">{j.employeeId?.educationalInstitution}</p>
                  </td>
                  <td className="p-3">
                    {new Date(j.date).toLocaleDateString('es-MX')}
                  </td>
                  <td className="p-3">{getTypeBadge(j.type)}</td>
                  <td className="p-3">{getStatusBadge(j.status)}</td>
                  <td className="p-3">
                    <p className="line-clamp-2 max-w-xs">{j.reason.substring(0, 80)}...</p>
                    {j.justifiesHours && j.startTime && j.endTime && (
                      <p className="text-xs text-gray-500 mt-1">
                        Horas: {j.startTime} - {j.endTime}
                      </p>
                    )}
                  </td>
                  <td className="p-3 text-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedRow(expandedRow === j._id ? null : j._id)}
                    >
                      👁️
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(j)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {isAdmin && j.status === 'PENDING' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(j._id, 'APPROVED')}
                          className="text-green-600"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(j._id, 'REJECTED')}
                          className="text-red-600"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(j._id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
                {expandedRow === j._id && (
                  <tr className="bg-gray-50">
                    <td colSpan={6} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">Detalles de la justificación</p>
                          <p className="mt-1 text-gray-600">{j.reason}</p>
                          {j.fileUrl && (
                            <a 
                              href={j.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                            >
                              📎 Ver documento adjunto
                            </a>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Información adicional</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Creada: {new Date(j.createdAt).toLocaleString('es-MX')}
                          </p>
                          {j.justifiesFullDay && (
                            <p className="text-xs text-green-600 mt-1">✅ Justifica día completo</p>
                          )}
                          {j.justifiesHours && (
                            <p className="text-xs text-blue-600 mt-1">⏰ Justifica horas específicas</p>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}