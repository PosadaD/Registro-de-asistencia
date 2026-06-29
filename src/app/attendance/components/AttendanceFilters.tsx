// components/attendance/AttendanceFilters.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Filter, X, Download } from 'lucide-react';

interface AttendanceFiltersProps {
  startDate: string;
  endDate: string;
  employeeId: string;
  employees: any[];
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onEmployeeChange: (employeeId: string) => void;
  onFilter: () => void;
  onReset: () => void;
  onExport?: () => void;
}

export function AttendanceFilters({
  startDate,
  endDate,
  employeeId,
  employees,
  onStartDateChange,
  onEndDateChange,
  onEmployeeChange,
  onFilter,
  onReset,
  onExport,
}: AttendanceFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtros de búsqueda
        </h3>
        <div className="flex gap-2">
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-1" />
              Exportar
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="startDate">Fecha inicio</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="endDate">Fecha fin</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="employeeId">Prestador</Label>
          <select
            id="employeeId"
            value={employeeId}
            onChange={(e) => onEmployeeChange(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={onFilter}>
          Aplicar filtros
        </Button>
      </div>
    </div>
  );
}