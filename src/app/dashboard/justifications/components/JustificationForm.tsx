// components/justifications/JustificationFormModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Search, User, FileText, Calendar } from 'lucide-react';
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

interface JustificationFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingJustification?: any;
}

export function JustificationFormModal({ 
  open, 
  onOpenChange, 
  onSuccess,
  editingJustification 
}: JustificationFormModalProps) {
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
    if (open) {
      const loadEmployees = async () => {
        const res = await fetch('/api/employees');
        const data = await res.json();
        setEmployees(data);
        setFilteredEmployees(data);
      };
      loadEmployees();
    }
  }, [open]);

  // Cargar datos si es edición
  useEffect(() => {
    if (open && editingJustification) {
      setSelectedEmployee(editingJustification.employeeId);
      setSearchTerm(editingJustification.employeeId?.name || '');
      setSelectedDate(new Date(editingJustification.date).toISOString().split('T')[0]);
      setSelectedType(JUSTIFICATION_TYPES.find(t => t.value === editingJustification.type) || JUSTIFICATION_TYPES[0]);
      setReason(editingJustification.reason);
      if (editingJustification.justifiesHours) {
        setJustifyHours(true);
        setStartTime(editingJustification.startTime || '09:00');
        setEndTime(editingJustification.endTime || '13:00');
      }
    } else if (open && !editingJustification) {
      // Resetear formulario
      setSelectedEmployee(null);
      setSearchTerm('');
      setSelectedDate('');
      setSelectedType(JUSTIFICATION_TYPES[0]);
      setJustifyHours(false);
      setStartTime('09:00');
      setEndTime('13:00');
      setReason('');
      setFile(null);
    }
  }, [open, editingJustification]);

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

      if (file) {
        const fileData = new FormData();
        fileData.append('file', file);
        
        const uploadRes = await fetch('/api/uploads', {
          method: 'POST',
          body: fileData,
        });
        
        if (!uploadRes.ok) throw new Error('Error al subir el archivo');
        
        const uploadJson = await uploadRes.json();
        fileUrl = uploadJson.url;
      }

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

      const url = editingJustification 
        ? `/api/justifications/${editingJustification._id}` 
        : '/api/justifications';
      const method = editingJustification ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(justificationData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al guardar');
      }

      toast.success(editingJustification ? 'Justificación actualizada' : 'Justificación creada');
      onSuccess();
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 1);
  const maxDate = new Date();
  const minDateStr = minDate.toISOString().split('T')[0];
  const maxDateStr = maxDate.toISOString().split('T')[0];

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl my-8" onClick={(e) => e.stopPropagation()}>
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white rounded-t-lg">
            <h2 className="text-xl font-semibold">
              {editingJustification ? 'Editar Justificación' : 'Nueva Justificación'}
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="p-6 space-y-5">
              
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
                  <div className="border rounded-lg max-h-40 overflow-y-auto">
                    {filteredEmployees.map((emp) => (
                      <button
                        key={emp._id}
                        type="button"
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setSearchTerm(emp.name);
                          setShowEmployeeSearch(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b last:border-b-0"
                      >
                        <div className="font-medium">{emp.name}</div>
                        <div className="text-xs text-gray-500">
                          RFC: {emp.rfc || 'N/A'} | Faltas: {emp.absenceCount}
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
                          Faltas: {selectedEmployee.absenceCount} | 
                          Consecutivas: {selectedEmployee.consecutiveAbsenceCount}
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
                  </div>
                )}
              </div>

              {/* Fecha */}
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
                />
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

              {/* Justificar horas (solo para Salud) */}
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
                        />
                      </div>
                      <div>
                        <Label>Hora de fin</Label>
                        <Input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
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
                {file && <p className="text-xs text-green-600">📎 {file.name}</p>}
                <p className="text-xs text-gray-500">Formatos: PDF, JPG, PNG. Máx 5MB.</p>
              </div>

              {/* Resumen */}
              {selectedEmployee && selectedDate && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Resumen</h4>
                  <div className="text-sm space-y-1 text-gray-600">
                    <p>👤 Empleado: {selectedEmployee.name}</p>
                    <p>📅 Fecha: {new Date(selectedDate).toLocaleDateString('es-MX')}</p>
                    <p>📋 Tipo: {selectedType.label}</p>
                    {selectedType.value === 'HEALTH' && justifyHours && (
                      <p>⏰ Horas: {startTime} - {endTime}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-2 p-6 border-t bg-gray-50 rounded-b-lg sticky bottom-0">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : (editingJustification ? 'Actualizar' : 'Crear')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}