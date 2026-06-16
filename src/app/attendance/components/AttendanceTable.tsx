// components/attendance/AttendanceTable.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Clock, User, Calendar } from 'lucide-react';

interface Attendance {
  _id: string;
  employeeId: {
    _id: string;
    name: string;
    rfc: string;
    educationalInstitution: string;
  };
  date: string;
  checkIn: string;
  checkOut: string;
  workedHours: number;
  isLate: boolean;
  isAbsent: boolean;
  method: string;
  createdAt: string;
}

interface AttendanceTableProps {
  attendance: Attendance[];
  onEdit?: (record: Attendance) => void;
}

export function AttendanceTable({ attendance, onEdit }: AttendanceTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const getStatusBadge = (record: Attendance) => {
    if (record.isAbsent) {
      return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">Ausente</span>;
    }
    if (record.isLate) {
      return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">Tarde</span>;
    }
    if (record.checkIn) {
      return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">Puntual</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">Sin registro</span>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (attendance.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
        <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
        <p className="text-lg">No hay registros de asistencia</p>
        <p className="text-sm">Para los filtros seleccionados</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Prestador</th>
              <th className="p-3 text-left">Fecha</th>
              <th className="p-3 text-left">Entrada</th>
              <th className="p-3 text-left">Salida</th>
              <th className="p-3 text-left">Horas</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-left">Método</th>
              <th className="p-3 text-center">Detalles</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((record) => (
              <>
                <tr key={record._id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">
                    {record.employeeId?.name || 'No asignado'}
                    <p className="text-xs text-gray-500">{record.employeeId?.educationalInstitution}</p>
                  </td>
                  <td className="p-3">
                    {formatDate(record.date)}
                  </td>
                  <td className="p-3">
                    {record.checkIn ? (
                      <span className="font-mono">{record.checkIn}</span>
                    ) : (
                      <span className="text-gray-400">--:--</span>
                    )}
                  </td>
                  <td className="p-3">
                    {record.checkOut ? (
                      <span className="font-mono">{record.checkOut}</span>
                    ) : (
                      <span className="text-gray-400">--:--</span>
                    )}
                  </td>
                  <td className="p-3">
                    {record.workedHours > 0 ? `${record.workedHours} hrs` : '-'}
                  </td>
                  <td className="p-3">{getStatusBadge(record)}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100">
                      {record.method === 'code' ? 'Código' : record.method === 'facial' ? 'Facial' : 'Manual'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedRow(expandedRow === record._id ? null : record._id)}
                    >
                      {expandedRow === record._id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </td>
                </tr>
                {expandedRow === record._id && (
                  <tr className="bg-gray-50">
                    <td colSpan={8} className="p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">RFC</p>
                          <p className="font-medium">{record.employeeId?.rfc || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Institución</p>
                          <p className="font-medium">{record.employeeId?.educationalInstitution || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Método de registro</p>
                          <p className="font-medium capitalize">{record.method}</p>
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