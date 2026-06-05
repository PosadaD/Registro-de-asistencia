// components/justifications/JustificationForm.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, User, FileText, AlertCircle, Calendar, X } from 'lucide-react';
import { toast } from 'sonner';

interface Employee {
  _id: string;
  name: string;
  rfc: string;
  educationalInstitution: string;
  absenceCount: number;
  consecutiveAbsenceCount: number;
  status: string;
}

interface JustificationType {
  value: 'SCHOOL' | 'HEALTH' | 'OTHER';
  label: string;
  description: string;
  justifiesFullDay: boolean;
  justifiesHours: boolean;
}

const JUSTIFICATION_TYPES: JustificationType[] = [
  {
    value: 'SCHOOL',
    label: 'Escuela',
    description: 'Justifica el día completo por actividades escolares',
    justifiesFullDay: true,
    justifiesHours: false,
  },
  {
    value: 'HEALTH',
    label: 'Salud',
    description: 'Justifica horas o día completo por cuestiones médicas',
    justifiesFullDay: true,
    justifiesHours: true,
  },
  {
    value: 'OTHER',
    label: 'Otro',
    description: 'Otros motivos justificados',
    justifiesFullDay: true,
    justifiesHours: false,
  },
];

export default function JustificationForm() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEmployeeSearch, setShowEmployeeSearch] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedType, setSelectedType] = useState<JustificationType>(JUSTIFICATION_TYPES[0]);
  const [justifyHours, setJustifyHours] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('13:00');
  const [reason, setReason] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Cargar empleados
  useEffect(() => {
    const loadEmployees = async () => {
      const res = await fetch('/api/employees');
      const data = await res.json();
      setEmployees(data);
      setFilteredEmployees(data);
    };
    loadEmployees();
  }, []);

  // Filtrar empleados por búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.rfc?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmployees(filtered);
    }
  }, [searchTerm, employees]);

  // Verificar si el empleado está en riesgo de baja automática
  const getEmployeeStatusWarning = (employee: Employee) => {
    const warnings = [];
    if (employee.absenceCount >= 8 && employee.absenceCount < 10) {
      warnings.push(`⚠️ Tiene ${employee.absenceCount} faltas. Límite: 10.`);
    }
    if (employee.consecutiveAbsenceCount >= 2 && employee.consecutiveAbsenceCount < 3) {
      warnings.push(`⚠️ Tiene ${employee.consecutiveAbsenceCount} faltas consecutivas. Límite: 3.`);
    }
    return warnings;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEmployee) {
      toast.error('Selecciona un empleado');
      return;
    }
    
    if (!selectedDate) {
      toast.error('Selecciona la fecha a justificar');
      return;
    }
    
    if (!reason.trim()) {
      toast.error('Ingresa el motivo de la justificación');
      return;
    }

    setLoading(true);

    try {
      let fileUrl = null;

      // Subir archivo si existe
      if (file) {
        const fileData = new FormData();
        fileData.append('file', file);
        
        const uploadRes = await fetch('/api/uploads', {
          method: 'POST',
          body: fileData,
        });
        
        if (!uploadRes.ok) {
          throw new Error('Error al subir el archivo');
        }
        
        const uploadJson = await uploadRes.json();
        fileUrl = uploadJson.url;
      }

      // Crear justificación
      const justificationData = {
        employeeId: selectedEmployee._id,
        date: selectedDate,
        type: selectedType.value,
        justifiesFullDay: selectedType.justifiesFullDay,
        justifiesHours: justifyHours && selectedType.justifiesHours,
        startTime: justifyHours ? startTime : null,
        endTime: justifyHours ? endTime : null,
        reason,
        fileUrl,
      };

      const res = await fetch('/api/justifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(justificationData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al crear justificación');
      }

      toast.success('Justificación creada correctamente');
      
      // Resetear formulario
      setSelectedEmployee(null);
      setSelectedDate('');
      setSelectedType(JUSTIFICATION_TYPES[0]);
      setJustifyHours(false);
      setStartTime('09:00');
      setEndTime('13:00');
      setReason('');
      setFile(null);
      setSearchTerm('');
      
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al crear justificación');
    } finally {
      setLoading(false);
    }
  };

  // Obtener fecha mínima (hace 1 año) y máxima (hoy)
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 1);
  const maxDate = new Date();
  const minDateStr = minDate.toISOString().split('T')[0];
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6 max-w-2xl mx-auto">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold">Justificación de Inasistencia</h2>
        <p className="text-gray-500 text-sm">Registra justificaciones por escuela, salud u otros motivos</p>
      </div>

      {/* Buscador de empleados */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Empleado *
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre o RFC..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowEmployeeSearch(true);
            }}
            onFocus={() => setShowEmployeeSearch(true)}
            className="pl-10"
          />
        </div>
        
        {showEmployeeSearch && filteredEmployees.length > 0 && (
          <div className="border rounded-lg max-h-48 overflow-y-auto">
            {filteredEmployees.map((emp) => (
              <button
                key={emp._id}
                type="button"
                onClick={() => {
                  setSelectedEmployee(emp);
                  setSearchTerm(emp.name);
                  setShowEmployeeSearch(false);
                  const warnings = getEmployeeStatusWarning(emp);
                  warnings.forEach(warning => toast.warning(warning));
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b last:border-b-0"
              >
                <div className="font-medium">{emp.name}</div>
                <div className="text-xs text-gray-500">
                  RFC: {emp.rfc || 'N/A'} | Faltas: {emp.absenceCount} | 
                  Consecutivas: {emp.consecutiveAbsenceCount}
                </div>
              </button>
            ))}
          </div>
        )}

        {selectedEmployee && (
          <div className="bg-blue-50 p-3 rounded-lg mt-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-blue-900">{selectedEmployee.name}</p>
                <p className="text-xs text-blue-700">
                  RFC: {selectedEmployee.rfc || 'N/A'} | 
                  Faltas totales: {selectedEmployee.absenceCount} | 
                  Faltas consecutivas: {selectedEmployee.consecutiveAbsenceCount}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {(selectedEmployee.absenceCount >= 10 || selectedEmployee.consecutiveAbsenceCount >= 3) && (
              <p className="text-xs text-red-600 mt-1">
                ⚠️ {selectedEmployee.absenceCount >= 10 && 'Alcanzó 10 faltas. '}
                {selectedEmployee.consecutiveAbsenceCount >= 3 && 'Tiene 3 faltas consecutivas. '}
                Aplicar baja automática.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Selector de fecha nativo */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Fecha a justificar *
        </Label>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={minDateStr}
          max={maxDateStr}
          required
          className="w-full"
        />
        <p className="text-xs text-gray-500">Selecciona la fecha de la falta o ausencia</p>
      </div>

      {/* Tipo de justificación */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Tipo de justificación *
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {JUSTIFICATION_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setSelectedType(type)}
              className={`p-3 border rounded-lg text-left transition-all ${
                selectedType.value === type.value
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">{type.label}</div>
              <div className="text-xs text-gray-500 mt-1">{type.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Opción de justificar horas (solo para HEALTH) */}
      {selectedType.value === 'HEALTH' && (
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="justifyHours"
              checked={justifyHours}
              onChange={(e) => setJustifyHours(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="justifyHours">Justificar horas específicas</Label>
          </div>
          
          {justifyHours && (
            <div className="grid grid-cols-2 gap-3 pl-6">
              <div>
                <Label>Hora de inicio</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Hora de fin</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Motivo */}
      <div className="space-y-2">
        <Label>Motivo de la justificación *</Label>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Describe detalladamente el motivo..."
          rows={4}
          required
        />
      </div>

      {/* Archivo adjunto */}
      <div className="space-y-2">
        <Label>Documento de respaldo (opcional)</Label>
        <Input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          accept=".pdf,.jpg,.jpeg,.png"
        />
        {file && (
          <p className="text-xs text-green-600">📎 {file.name}</p>
        )}
        <p className="text-xs text-gray-500">Formatos: PDF, JPG, PNG. Máx 5MB.</p>
      </div>

      {/* Resumen de la justificación */}
      {selectedEmployee && selectedDate && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Resumen de justificación</h4>
          <div className="text-sm space-y-1 text-gray-600">
            <p>👤 Empleado: {selectedEmployee.name}</p>
            <p>📅 Fecha: {new Date(selectedDate).toLocaleDateString('es-MX')}</p>
            <p>📋 Tipo: {selectedType.label}</p>
            {selectedType.value === 'HEALTH' && justifyHours && (
              <p>⏰ Horas: {startTime} - {endTime}</p>
            )}
            {selectedType.value !== 'HEALTH' && (
              <p>✅ Justifica día completo</p>
            )}
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setSelectedEmployee(null);
            setSelectedDate('');
            setReason('');
            setFile(null);
            setSearchTerm('');
            setJustifyHours(false);
          }}
        >
          Limpiar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Crear Justificación'}
        </Button>
      </div>
    </form>
  );
}