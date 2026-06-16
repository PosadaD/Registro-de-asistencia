// components/attendance/AttendancePDFDialog.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Download, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface Employee {
  _id: string;
  name: string;
}

export function AttendancePDFDialog() {
  const [open, setOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [month, setMonth] = useState<string>((new Date().getMonth()).toString());
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      const res = await fetch('/api/employees');
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : []);
    };
    if (open) fetchEmployees();
  }, [open]);

  const generatePDF = async (individual: boolean) => {
    const employeeId = individual ? selectedEmployee : 'all';
    if (individual && employeeId === 'all') {
      toast.error('Selecciona un empleado');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/reports/attendance-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          month: parseInt(month),
          year: parseInt(year),
        }),
      });
      if (!res.ok) throw new Error('Error al generar PDF');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `asistencias_${individual ? 'individual' : 'todos'}_${year}_${month}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF generado correctamente');
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Error al generar PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          Exportar PDF de asistencias
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generar reporte de asistencia</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Empleado</Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un empleado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los empleados</SelectItem>
                {employees.map(emp => (
                  <SelectItem key={emp._id} value={emp._id}>{emp.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Mes</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {new Date(2000, i, 1).toLocaleString('es', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Año</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026, 2027, 2028].map(y => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button onClick={() => generatePDF(true)} disabled={loading} className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Hoja individual
            </Button>
            <Button onClick={() => generatePDF(false)} disabled={loading} variant="outline" className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Todos los empleados
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}