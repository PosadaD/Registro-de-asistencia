// app/dashboard/attendance/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { AttendanceFilters } from './components/AttendanceFilters';
import { AttendanceTable } from './components/AttendanceTable';
import { SummaryCards } from './components/SummaryCards';
import { toast } from 'sonner';
import { Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  extraHours: number;
  isLate: boolean;
  isAbsent: boolean;
  method: string;
  createdAt: string;
}

interface Employee {
  _id: string;
  name: string;
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [employeeId, setEmployeeId] = useState('');

  // Cargar empleados para el filtro
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const res = await fetch('/api/employees');
        const data = await res.json();
        setEmployees(data);
      } catch (error) {
        console.error('Error cargando empleados:', error);
      }
    };
    loadEmployees();
  }, []);

  // Cargar asistencia del día actual al iniciar
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    loadAttendance(today, today, '');
  }, []);

  const loadAttendance = async (start: string, end: string, employee: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (start) params.append('startDate', start);
      if (end) params.append('endDate', end);
      if (employee) params.append('employeeId', employee);
      
      const res = await fetch(`/api/attendance?${params.toString()}`);
      const data = await res.json();
      setAttendance(data);
    } catch (error) {
      console.error('Error cargando asistencias:', error);
      toast.error('Error al cargar los registros');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    if (!startDate && !endDate) {
      toast.error('Selecciona al menos una fecha');
      return;
    }
    loadAttendance(startDate, endDate, employeeId);
  };

  const handleReset = () => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    setEmployeeId('');
    loadAttendance(today, today, '');
  };

  const handleToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    setEmployeeId('');
    loadAttendance(today, today, '');
  };

  // Calcular resumen
  const summary = {
    total: attendance.length,
    present: attendance.filter(a => !a.isAbsent && a.checkIn).length,
    late: attendance.filter(a => a.isLate).length,
    absent: attendance.filter(a => a.isAbsent).length,
    totalHours: attendance.reduce((sum, a) => sum + (a.workedHours || 0), 0),
  };

  // Exportar a CSV
  const exportToCSV = () => {
    const headers = ['Prestador', 'Fecha', 'Entrada', 'Salida', 'Horas', 'Estado', 'Método'];
    const rows = attendance.map(a => [
      a.employeeId?.name || 'No asignado',
      new Date(a.date).toLocaleDateString('es-MX'),
      a.checkIn || '--:--',
      a.checkOut || '--:--',
      a.workedHours || 0,
      a.isAbsent ? 'Ausente' : a.isLate ? 'Tarde' : 'Presente',
      a.method === 'code' ? 'Código' : a.method === 'facial' ? 'Facial' : 'Manual'
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `asistencias_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Reporte exportado');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Control de Asistencia</h1>
          <p className="text-muted-foreground">Visualización y seguimiento de registros</p>
        </div>
        <Button onClick={handleToday} variant="outline">
          <Calendar className="mr-2 h-4 w-4" />
          Hoy
        </Button>
      </div>

      {/* Tarjetas de resumen */}
      {!loading && attendance.length > 0 && (
        <SummaryCards
          total={summary.total}
          present={summary.present}
          late={summary.late}
          absent={summary.absent}
          totalHours={summary.totalHours}
        />
      )}

      {/* Filtros */}
      <AttendanceFilters
        startDate={startDate}
        endDate={endDate}
        employeeId={employeeId}
        employees={employees}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onEmployeeChange={setEmployeeId}
        onFilter={handleFilter}
        onReset={handleReset}
        onExport={exportToCSV}
      />

      {/* Tabla de asistencias */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-3" />
          <p className="text-gray-500">Cargando registros...</p>
        </div>
      ) : (
        <div>
          <AttendanceTable attendance={attendance} />
        </div>
      )}
    </div>
  );
}