// app/dashboard/employees/page.tsx
'use client';

import { useEffect, useState } from "react";
import EmployeeForm from "../../../components/employees/EmployeeForm";
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Employee {
  _id: string;
  name: string;
  rfc: string;
  curp: string;
  educationalInstitution: string;
  status: string;
  providerType: string;
  startDate: string;
  workSchedule?: {
    startTime: string;
    endTime: string;
  };
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const load = async () => {
    const res = await fetch("/api/employees");
    const data = await res.json();
    setEmployees(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este prestador?')) {
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Prestador eliminado');
        load();
      } else {
        toast.error('Error al eliminar');
      }
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsEditModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-700',
      DISMISSED: 'bg-red-100 text-red-700',
      VOLUNTARY_LEAVE: 'bg-yellow-100 text-yellow-700',
      FINISHED: 'bg-blue-100 text-blue-700',
      OTHER: 'bg-gray-100 text-gray-700',
    };
    const labels: Record<string, string> = {
      ACTIVE: 'Activo',
      DISMISSED: 'Dado de baja',
      VOLUNTARY_LEAVE: 'Baja voluntaria',
      FINISHED: 'Terminado',
      OTHER: 'Otro',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colors[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Prestadores de Servicio</h1>
          <p className="text-muted-foreground">Gestión de prestadores y su información</p>
        </div>
        <EmployeeForm onCreated={load} />
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Nombre</th>
                <th className="p-3 text-left">RFC</th>
                <th className="p-3 text-left">CURP</th>
                <th className="p-3 text-left">Institución</th>
                <th className="p-3 text-left">Horario</th>
                <th className="p-3 text-left">Tipo</th>
                <th className="p-3 text-left">Estado</th>
                <th className="p-3 text-left">Inicio</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500">
                    No hay prestadores registrados
                  </td>
                </tr>
              ) : (
                employees.map((e) => (
                  <tr key={e._id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{e.name}</td>
                    <td className="p-3">{e.rfc || '-'}</td>
                    <td className="p-3">{e.curp || '-'}</td>
                    <td className="p-3">{e.educationalInstitution || '-'}</td>
                    <td className="p-3">
                      {e.workSchedule?.startTime && e.workSchedule?.endTime 
                        ? `${e.workSchedule.startTime} - ${e.workSchedule.endTime}`
                        : 'No definido'}
                    </td>
                    <td className="p-3">{e.providerType || '-'}</td>
                    <td className="p-3">{getStatusBadge(e.status)}</td>
                    <td className="p-3">{new Date(e.startDate).toLocaleDateString()}</td>
                    <td className="p-3 text-center space-x-2">
                      <button
                        onClick={() => handleEdit(e)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(e._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de edición */}
      <EmployeeForm
        onCreated={() => {
          load();
          setIsEditModalOpen(false);
          setEditingEmployee(null);
        }}
        editingEmployee={editingEmployee}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
    </div>
  );
}