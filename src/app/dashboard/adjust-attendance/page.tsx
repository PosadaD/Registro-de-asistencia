// app/dashboard/attendance/adjust-attendance/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, CheckCircle, XCircle, AlertCircle, ChevronsUpDown, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Interfaces
interface Employee {
  _id: string;
  name: string;
}

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
  // Estados principales
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filtros
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState(''); // almacena _id

  // Lista de empleados para el combobox
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [openEmployeePopover, setOpenEmployeePopover] = useState(false);

  // Cargar empleados al montar
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const res = await fetch('/api/employees');
        const data = await res.json();
        setEmployees(data);
      } catch (error) {
        toast.error('Error al cargar empleados');
      }
    };
    loadEmployees();
  }, []);

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

  // Carga inicial
  useEffect(() => {
    loadRecords();
  }, []);

  // Funciones de selección
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(records.map((r) => r._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  // Actualización masiva genérica
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
        loadRecords();
      } else {
        toast.error(data.error || 'Error');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const markAsPunctual = () => applyUpdate({ isLate: false });
  const markAsPresent = () => applyUpdate({ isAbsent: false });

  // Ajuste proporcional (quitar marca de tarde)
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

  // Marcar ausencias masivas (por rango de fechas)
  const markAbsences = async (mode: 'create_only' | 'overwrite') => {
    if (!startDate || !endDate) {
      toast.error('Selecciona un rango de fechas');
      return;
    }

    let confirmMessage = '';
    if (mode === 'create_only') {
      confirmMessage = `⚠️ Esta acción creará registros de ausencia para TODOS los empleados activos en los días hábiles entre ${startDate} y ${endDate} que NO tengan registro previo. ¿Continuar?`;
    } else {
      confirmMessage = `⚠️ Esta acción SOBRESCRIBIRÁ TODOS los registros de asistencia existentes en el rango ${startDate} - ${endDate}, convirtiéndolos en AUSENCIAS. Los datos de entrada/salida se perderán. ¿Continuar?`;
    }

    if (!confirm(confirmMessage)) return;

    setLoading(true);
    try {
      const res = await fetch('/api/attendance/mark-absences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate, mode }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`✅ Procesado: ${data.details?.length || 0} empleados.`);
        loadRecords();
      } else {
        toast.error(data.error || 'Error');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Sobrescribir seleccionados como faltas
  const overwriteSelected = async () => {
    if (selectedIds.length === 0) {
      toast.error('Selecciona al menos un registro');
      return;
    }

    if (!confirm(`⚠️ Sobrescribirás ${selectedIds.length} registro(s) seleccionado(s) como FALTA. Los datos de entrada/salida se perderán. ¿Continuar?`)) return;

    setLoading(true);
    try {
      const res = await fetch('/api/attendance/mark-absences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, mode: 'overwrite' }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`✅ Sobrescritos ${data.details?.updated || 0} registros`);
        loadRecords();
        setSelectedIds([]);
      } else {
        toast.error(data.error || 'Error');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Empleado seleccionado para mostrar en el botón
  const selectedEmployee = employees.find((emp) => emp._id === employeeFilter);

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
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <Label>Fecha fin</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div>
          <Label>Empleado</Label>
          <Popover open={openEmployeePopover} onOpenChange={setOpenEmployeePopover}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openEmployeePopover}
                className="w-[200px] justify-between"
              >
                {selectedEmployee ? selectedEmployee.name : 'Todos'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command
                filter={(value, search) => {
                  // value es el _id del empleado
                  const emp = employees.find((e) => e._id === value);
                  if (!emp) return 0;
                  return emp.name.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
                }}
              >
                <CommandInput placeholder="Buscar empleado..." />
                <CommandList>
                  <CommandEmpty>No se encontraron empleados.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setEmployeeFilter('');
                        setOpenEmployeePopover(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          employeeFilter === '' ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      Todos
                    </CommandItem>
                    {employees.map((emp) => (
                      <CommandItem
                        key={emp._id}
                        value={emp._id}
                        onSelect={(currentValue) => {
                          setEmployeeFilter(currentValue === employeeFilter ? '' : currentValue);
                          setOpenEmployeePopover(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            employeeFilter === emp._id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {emp.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <Button onClick={loadRecords}>Filtrar</Button>
      </div>

      {/* Botones de acción masiva */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => markAbsences('create_only')} disabled={loading}>
          <AlertCircle className="mr-2 h-4 w-4" /> Marcar ausencias automáticas
        </Button>
        <Button variant="destructive" onClick={overwriteSelected} disabled={loading || selectedIds.length === 0}>
          <AlertCircle className="mr-2 h-4 w-4" /> Sobrescribir seleccionados como faltas
        </Button>
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
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={selectedIds.length === records.length && records.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
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
              {records.map((record) => (
                <TableRow key={record._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(record._id)}
                      onCheckedChange={(c) => handleSelectOne(record._id, !!c)}
                    />
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
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No hay registros
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}