'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AttendanceRecord {
  _id: string;
  employeeId: { name: string; rfc: string };
  date: string;
  checkIn: string;
  checkOut: string;
  isLate: boolean;
  isAbsent: boolean;
  workedHours: number;
}

export default function AdjustAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');

  // Cargar registros con filtros
  const loadRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (employeeFilter) params.append('employeeId', employeeFilter);
      const res = await fetch(`/api/attendance?${params.toString()}`);
      const data = await res.json();
      setRecords(data);
      setSelectedIds([]);
    } catch (error) {
      toast.error('Error al cargar registros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(records.map(r => r._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const applyUpdate = async (updates: { isLate?: boolean; isAbsent?: boolean }) => {
    if (selectedIds.length === 0) {
      toast.error('Selecciona al menos un registro');
      return;
    }
    try {
      const res = await fetch('/api/attendance/batch', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, updates }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Actualizados ${data.modifiedCount} registros`);
        loadRecords(); // recargar
      } else {
        toast.error(data.error || 'Error');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const markAsPunctual = () => applyUpdate({ isLate: false });
  const adjustProportionally = async () => {
  if (selectedIds.length === 0) {
    toast.error('Selecciona al menos un registro');
    return;
  }
  try {
    const res = await fetch('/api/attendance/batch', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedIds, adjustProportionally: true }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(`Corregidos ${data.modifiedCount} registros (horario ajustado proporcionalmente)`);
      loadRecords();
    } else {
      toast.error(data.error || 'Error');
    }
  } catch (error) {
    toast.error('Error de conexión');
  }
};
  const markAsPresent = () => applyUpdate({ isAbsent: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ajustar Asistencias</h1>
        <p className="text-muted-foreground">Selecciona registros y modifica marcas de tarde o falta</p>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4 items-end">
        <div>
          <Label>Fecha inicio</Label>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div>
          <Label>Fecha fin</Label>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        <div>
          <Label>Empleado (ID o nombre)</Label>
          <Input placeholder="Buscar..." value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)} />
        </div>
        <Button onClick={loadRecords}>Filtrar</Button>
      </div>

      {/* Botones de acción masiva */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={adjustProportionally} disabled={selectedIds.length === 0}>
          <CheckCircle className="mr-2 h-4 w-4" /> Quitar marca de tarde (Ajustar horario)
        </Button>
        <Button variant="outline" onClick={markAsPresent} disabled={selectedIds.length === 0}>
          <XCircle className="mr-2 h-4 w-4" /> Quitar marca de falta
        </Button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox checked={selectedIds.length === records.length && records.length > 0} onCheckedChange={handleSelectAll} />
                </TableHead>
                <TableHead>Empleado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Entrada</TableHead>
                <TableHead>Salida</TableHead>
                <TableHead>Horas</TableHead>
                <TableHead>Tarde</TableHead>
                <TableHead>Falta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map(record => (
                <TableRow key={record._id}>
                  <TableCell>
                    <Checkbox checked={selectedIds.includes(record._id)} onCheckedChange={c => handleSelectOne(record._id, !!c)} />
                  </TableCell>
                  <TableCell>{record.employeeId?.name || 'N/A'}</TableCell>
                  <TableCell>{new Date(record.date).toLocaleDateString('es-MX')}</TableCell>
                  <TableCell>{record.checkIn || '--'}</TableCell>
                  <TableCell>{record.checkOut || '--'}</TableCell>
                  <TableCell>{record.workedHours || 0}</TableCell>
                  <TableCell>{record.isLate ? '⚠️ Tarde' : '✅'}</TableCell>
                  <TableCell>{record.isAbsent ? '❌ Ausente' : '✅'}</TableCell>
                </TableRow>
              ))}
              {records.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center">No hay registros</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}