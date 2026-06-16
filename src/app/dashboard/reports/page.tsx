'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FileJson, FileSpreadsheet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Employee {
  _id: string;
  name: string;
  rfc: string;
}

export default function ReportsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch('/api/employees');
        if (!res.ok) throw new Error('Error al cargar empleados');
        const data = await res.json();
        // Asegurar que data sea un array
        const employeesArray = Array.isArray(data) ? data : data.employees || [];
        setEmployees(employeesArray);
        if (employeesArray.length > 0) setSelectedEmployeeId(employeesArray[0]._id);
      } catch (error) {
        console.error(error);
        toast.error('Error cargando empleados');
        setEmployees([]);
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, []);

  const generateReport = async (format: 'json' | 'csv') => {
    if (!selectedEmployeeId) {
      toast.error('Selecciona un empleado');
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch(`/api/reports/employee/${selectedEmployeeId}`);
      if (!res.ok) throw new Error('Error al obtener datos');
      const data = await res.json();

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expediente_${data.employee.name}_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Reporte JSON descargado');
      } else if (format === 'csv') {
        // Descargar tres CSVs
        downloadCSV([data.employee], 'empleado.csv');
        downloadCSV(data.attendances || [], 'asistencias.csv');
        downloadCSV(data.justifications || [], 'justificaciones.csv');
        toast.success('Reportes CSV descargados (3 archivos)');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error generando reporte');
    } finally {
      setGenerating(false);
    }
  };

  const downloadCSV = (data: any[], filename: string) => {
    if (!data.length) {
      const emptyBlob = new Blob(['No hay datos'], { type: 'text/csv' });
      const url = URL.createObjectURL(emptyBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    // Obtener todas las claves de todos los objetos (para evitar perder columnas)
    const allKeys = new Set<string>();
    data.forEach(row => {
      Object.keys(row).forEach(key => allKeys.add(key));
    });
    const headers = Array.from(allKeys);
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          let value = row[header];
          if (value instanceof Date) value = value.toISOString();
          if (typeof value === 'object') value = JSON.stringify(value);
          return JSON.stringify(value ?? '');
        }).join(',')
      )
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loadingEmployees) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Reportes de Expediente</h1>
        <p className="text-muted-foreground">No hay empleados registrados para generar reportes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reportes de Expediente</h1>
        <p className="text-muted-foreground">Descarga toda la información de un prestador (asistencias, justificaciones, datos personales)</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow max-w-md">
        <div className="space-y-4">
          <div>
            <Label>Seleccionar prestador</Label>
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Elige un empleado" />
              </SelectTrigger>
              <SelectContent>
                {employees.map(emp => (
                  <SelectItem key={emp._id} value={emp._id}>
                    {emp.name} {emp.rfc ? `(${emp.rfc})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={() => generateReport('json')} disabled={generating} className="flex-1">
              {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileJson className="mr-2 h-4 w-4" />}
              Descargar JSON
            </Button>
            <Button onClick={() => generateReport('csv')} disabled={generating} variant="outline" className="flex-1">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Descargar CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        <p>* El formato JSON incluye todos los datos en un solo archivo.</p>
        <p>* El formato CSV descargará tres archivos separados: empleado.csv, asistencias.csv, justificaciones.csv.</p>
      </div>
    </div>
  );
}